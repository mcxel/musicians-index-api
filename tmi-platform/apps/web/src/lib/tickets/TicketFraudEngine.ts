/**
 * TicketFraudEngine
 * Detects and flags fraudulent ticket usage: duplicates, transfers at scale, bot scans.
 */

export type FraudSignal =
  | "duplicate-scan"
  | "rapid-transfers"
  | "mass-purchase"
  | "geo-mismatch"
  | "bot-pattern"
  | "account-age"
  | "payment-velocity"
  | "suspicious-transfer-chain";

export type FraudVerdict = "clean" | "suspicious" | "flagged" | "blocked";

export interface FraudCheck {
  ticketId?: string;
  userId: string;
  signals: FraudSignal[];
  verdict: FraudVerdict;
  score: number; // 0–100, higher = more suspicious
  checkedAt: number;
  detail: string;
}

export interface ScanLog {
  ticketId: string;
  scannedAt: number;
  scannedByDeviceId: string;
  venueId: string;
  latitude?: number;
  longitude?: number;
}

const SIGNAL_SCORES: Record<FraudSignal, number> = {
  "duplicate-scan":           80,
  "rapid-transfers":          45,
  "mass-purchase":            35,
  "geo-mismatch":             40,
  "bot-pattern":              70,
  "account-age":              20,
  "payment-velocity":         50,
  "suspicious-transfer-chain":60,
};

const VERDICT_THRESHOLD: Record<FraudVerdict, number> = {
  clean:      0,
  suspicious: 30,
  flagged:    55,
  blocked:    80,
};

export class TicketFraudEngine {
  private static _instance: TicketFraudEngine | null = null;

  private _scanLogs: Map<string, ScanLog[]> = new Map(); // ticketId → scans
  private _userPurchaseLog: Map<string, { count: number; firstAt: number; lastAt: number }> = new Map();
  private _flaggedEntities: Set<string> = new Set();
  private _blockedEntities: Set<string> = new Set();
  private _fraudLog: FraudCheck[] = [];
  private _listeners: Set<(check: FraudCheck) => void> = new Set();

  static getInstance(): TicketFraudEngine {
    if (!TicketFraudEngine._instance) {
      TicketFraudEngine._instance = new TicketFraudEngine();
    }
    return TicketFraudEngine._instance;
  }

  // ── Scan validation ────────────────────────────────────────────────────────

  recordScan(scan: ScanLog): FraudCheck {
    const existing = this._scanLogs.get(scan.ticketId) ?? [];
    const signals: FraudSignal[] = [];

    if (existing.length > 0) {
      signals.push("duplicate-scan");
    }

    if (this._blockedEntities.has(scan.ticketId)) {
      signals.push("bot-pattern");
    }

    if (existing.length > 0) {
      const lastScan = existing[existing.length - 1];
      if (scan.latitude && lastScan.latitude) {
        const dist = Math.abs(scan.latitude - lastScan.latitude) + Math.abs((scan.longitude ?? 0) - (lastScan.longitude ?? 0));
        if (dist > 1 && (scan.scannedAt - lastScan.scannedAt) < 3_600_000) {
          signals.push("geo-mismatch");
        }
      }
    }

    existing.push(scan);
    this._scanLogs.set(scan.ticketId, existing);

    const check = this._buildCheck(scan.ticketId, "system", signals, "scan validation");
    this._fraudLog.push(check);
    this._emit(check);
    return check;
  }

  // ── Purchase validation ────────────────────────────────────────────────────

  checkPurchase(userId: string, quantity: number, accountAgeMs: number): FraudCheck {
    const signals: FraudSignal[] = [];

    const log = this._userPurchaseLog.get(userId) ?? { count: 0, firstAt: Date.now(), lastAt: Date.now() };
    log.count += quantity;
    log.lastAt = Date.now();
    this._userPurchaseLog.set(userId, log);

    if (quantity > 10) signals.push("mass-purchase");

    const rateMs = log.lastAt - log.firstAt;
    if (rateMs < 60_000 && log.count > 5) signals.push("payment-velocity");

    if (accountAgeMs < 7 * 86_400_000) signals.push("account-age");

    if (this._flaggedEntities.has(userId)) signals.push("bot-pattern");

    const check = this._buildCheck(undefined, userId, signals, "purchase validation");
    this._fraudLog.push(check);
    this._emit(check);
    return check;
  }

  // ── Transfer chain check ───────────────────────────────────────────────────

  checkTransferChain(ticketId: string, transferCount: number): FraudCheck {
    const signals: FraudSignal[] = [];
    if (transferCount >= 3) signals.push("suspicious-transfer-chain");
    const existing = this._scanLogs.get(ticketId) ?? [];
    if (existing.length > 1) signals.push("duplicate-scan");
    const check = this._buildCheck(ticketId, "system", signals, "transfer chain check");
    this._fraudLog.push(check);
    return check;
  }

  // ── Manual flags ──────────────────────────────────────────────────────────

  flagEntity(entityId: string): void {
    this._flaggedEntities.add(entityId);
  }

  blockEntity(entityId: string): void {
    this._blockedEntities.add(entityId);
    this._flaggedEntities.add(entityId);
  }

  isFlagged(entityId: string): boolean {
    return this._flaggedEntities.has(entityId);
  }

  isBlocked(entityId: string): boolean {
    return this._blockedEntities.has(entityId);
  }

  // ── Access ────────────────────────────────────────────────────────────────

  getFraudLog(limit = 100): FraudCheck[] {
    return this._fraudLog.slice(-limit);
  }

  getFlaggedEntities(): string[] {
    return [...this._flaggedEntities];
  }

  getScansForTicket(ticketId: string): ScanLog[] {
    return this._scanLogs.get(ticketId) ?? [];
  }

  onFraudCheck(cb: (check: FraudCheck) => void): () => void {
    this._listeners.add(cb);
    return () => this._listeners.delete(cb);
  }

  // ── Internals ──────────────────────────────────────────────────────────────

  private _buildCheck(ticketId: string | undefined, userId: string, signals: FraudSignal[], detail: string): FraudCheck {
    const score = Math.min(100, signals.reduce((s, sig) => s + SIGNAL_SCORES[sig], 0));
    const verdict: FraudVerdict =
      score >= VERDICT_THRESHOLD.blocked    ? "blocked"
      : score >= VERDICT_THRESHOLD.flagged  ? "flagged"
      : score >= VERDICT_THRESHOLD.suspicious ? "suspicious"
      : "clean";

    if (verdict === "blocked") {
      if (ticketId) this._blockedEntities.add(ticketId);
      this._blockedEntities.add(userId);
    } else if (verdict === "flagged") {
      if (ticketId) this._flaggedEntities.add(ticketId);
      this._flaggedEntities.add(userId);
    }

    return { ticketId, userId, signals, verdict, score, checkedAt: Date.now(), detail };
  }

  private _emit(check: FraudCheck): void {
    for (const cb of this._listeners) cb(check);
  }
}

export const ticketFraudEngine = TicketFraudEngine.getInstance();
