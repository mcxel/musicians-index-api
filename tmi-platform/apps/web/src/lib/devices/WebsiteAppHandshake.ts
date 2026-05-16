/**
 * WebsiteAppHandshake
 * QR pairing protocol + device handshake flow.
 * The website issues all tokens. App surfaces present credentials, never generate them.
 */

import type { DeviceClass } from "./DeviceCapabilityRegistry";
import type { SessionRole } from "./DeviceSessionBridge";

// ─── Pairing Token ────────────────────────────────────────────────────────────

export interface PairingToken {
  token: string;
  deviceClass: DeviceClass;
  /** Unix ms — 5 minutes */
  expiresAt: number;
  /** The route the app surface should navigate to after pairing */
  targetPath: string;
  /** Opaque nonce for replay prevention */
  nonce: string;
}

export interface PairingRequest {
  token: string;
  deviceId: string;
  deviceClass: DeviceClass;
  appVersion: string;
  platformOS: string;
}

export interface PairingResponse {
  success: boolean;
  bridgeToken?: string;
  role?: SessionRole;
  userId?: string;
  expiresAt?: number;
  targetPath?: string;
  error?: PairingError;
}

export type PairingError =
  | "token-expired"
  | "token-invalid"
  | "token-already-used"
  | "session-invalid"
  | "device-class-mismatch"
  | "teen-restriction";

// ─── Handshake State ──────────────────────────────────────────────────────────

export type HandshakeState =
  | "idle"
  | "generating"
  | "awaiting-scan"
  | "scanned"
  | "verifying"
  | "paired"
  | "failed"
  | "expired";

export interface HandshakeSession {
  id: string;
  state: HandshakeState;
  pairingToken: PairingToken | null;
  deviceClass: DeviceClass | null;
  deviceId: string | null;
  createdAt: number;
  completedAt: number | null;
  error: PairingError | null;
}

// ─── Heartbeat ────────────────────────────────────────────────────────────────

export interface HeartbeatRequest {
  deviceId: string;
  bridgeToken: string;
  timestamp: number;
}

export interface HeartbeatResponse {
  alive: boolean;
  sessionValid: boolean;
  /** Server unix ms — device should sync clock delta */
  serverTime: number;
  /** If true, device must re-pair */
  requiresReauth: boolean;
}

// ─── Device Announcement ──────────────────────────────────────────────────────

export interface DeviceAnnouncement {
  deviceId: string;
  deviceClass: DeviceClass;
  appVersion: string;
  platformOS: string;
  screenWidth: number;
  screenHeight: number;
  /** Milliseconds since device boot — used to detect reboots */
  uptimeMs: number;
  timestamp: number;
}

// ─── Handshake Engine ─────────────────────────────────────────────────────────

export class WebsiteAppHandshake {
  private static _instance: WebsiteAppHandshake | null = null;

  private _sessions: Map<string, HandshakeSession> = new Map();
  private _usedTokens: Set<string> = new Set();
  private _listeners: Map<string, Set<(session: HandshakeSession) => void>> = new Map();
  private _gcInterval: ReturnType<typeof setInterval> | null = null;

  static getInstance(): WebsiteAppHandshake {
    if (!WebsiteAppHandshake._instance) {
      WebsiteAppHandshake._instance = new WebsiteAppHandshake();
    }
    return WebsiteAppHandshake._instance;
  }

  constructor() {
    // GC expired sessions every 2 minutes
    if (typeof setInterval !== "undefined") {
      this._gcInterval = setInterval(() => this._gc(), 120_000);
    }
  }

  // ── Token generation (website side) ──────────────────────────────────────

  generatePairingToken(
    deviceClass: DeviceClass,
    targetPath: string,
  ): PairingToken {
    const token = this._randomToken(32);
    const nonce = this._randomToken(16);
    return {
      token,
      deviceClass,
      targetPath,
      nonce,
      expiresAt: Date.now() + 5 * 60 * 1000,
    };
  }

  // ── Handshake session lifecycle ───────────────────────────────────────────

  startHandshake(deviceClass: DeviceClass, targetPath: string): HandshakeSession {
    const id = this._randomToken(20);
    const pairingToken = this.generatePairingToken(deviceClass, targetPath);
    const session: HandshakeSession = {
      id,
      state: "awaiting-scan",
      pairingToken,
      deviceClass,
      deviceId: null,
      createdAt: Date.now(),
      completedAt: null,
      error: null,
    };
    this._sessions.set(id, session);
    return session;
  }

  getHandshakeSession(sessionId: string): HandshakeSession | null {
    return this._sessions.get(sessionId) ?? null;
  }

  // ── App surface presents credentials (app side) ───────────────────────────

  processPairingRequest(
    req: PairingRequest,
    webSessionValid: boolean,
    webSessionUserId: string,
    webSessionRole: SessionRole,
    webSessionExpiresAt: number,
    webSessionBridgeToken: string,
  ): PairingResponse {
    // Find the handshake session by token
    const session = this._findSessionByToken(req.token);

    if (!session || !session.pairingToken) {
      return { success: false, error: "token-invalid" };
    }
    if (this._usedTokens.has(req.token)) {
      return { success: false, error: "token-already-used" };
    }
    if (Date.now() > session.pairingToken.expiresAt) {
      this._transition(session, "expired");
      return { success: false, error: "token-expired" };
    }
    if (session.pairingToken.deviceClass !== req.deviceClass) {
      return { success: false, error: "device-class-mismatch" };
    }
    if (!webSessionValid) {
      return { success: false, error: "session-invalid" };
    }

    // Mark token as consumed
    this._usedTokens.add(req.token);

    // Complete the handshake
    session.deviceId = req.deviceId;
    session.completedAt = Date.now();
    this._transition(session, "paired");

    return {
      success: true,
      bridgeToken: webSessionBridgeToken,
      role: webSessionRole,
      userId: webSessionUserId,
      expiresAt: webSessionExpiresAt,
      targetPath: session.pairingToken.targetPath,
    };
  }

  // ── Heartbeat ──────────────────────────────────────────────────────────────

  processHeartbeat(
    req: HeartbeatRequest,
    sessionValid: boolean,
  ): HeartbeatResponse {
    return {
      alive: true,
      sessionValid,
      serverTime: Date.now(),
      requiresReauth: !sessionValid,
    };
  }

  // ── Device announcement ────────────────────────────────────────────────────

  recordAnnouncement(announcement: DeviceAnnouncement): void {
    // Stored for analytics / debugging; not persisted in this layer.
    // The API layer (apps/api) handles durable device registration.
    void announcement;
  }

  // ── QR payload encoding ────────────────────────────────────────────────────

  encodeQRPayload(token: PairingToken, baseUrl: string): string {
    const url = new URL(baseUrl + "/pair");
    url.searchParams.set("t", token.token);
    url.searchParams.set("dc", token.deviceClass);
    url.searchParams.set("exp", String(token.expiresAt));
    url.searchParams.set("n", token.nonce);
    if (token.targetPath) url.searchParams.set("p", token.targetPath);
    return url.toString();
  }

  decodeQRPayload(raw: string): Partial<PairingToken> | null {
    try {
      const url = new URL(raw);
      const token = url.searchParams.get("t");
      const deviceClass = url.searchParams.get("dc") as DeviceClass | null;
      const expiresAt = Number(url.searchParams.get("exp"));
      const nonce = url.searchParams.get("n");
      const targetPath = url.searchParams.get("p") ?? "/";
      if (!token || !deviceClass || !expiresAt || !nonce) return null;
      return { token, deviceClass, expiresAt, nonce, targetPath };
    } catch {
      return null;
    }
  }

  // ── Listeners ──────────────────────────────────────────────────────────────

  onHandshakeChange(
    sessionId: string,
    cb: (session: HandshakeSession) => void,
  ): () => void {
    if (!this._listeners.has(sessionId)) {
      this._listeners.set(sessionId, new Set());
    }
    this._listeners.get(sessionId)!.add(cb);
    return () => this._listeners.get(sessionId)?.delete(cb);
  }

  // ── Internals ──────────────────────────────────────────────────────────────

  private _transition(session: HandshakeSession, state: HandshakeState): void {
    session.state = state;
    this._sessions.set(session.id, session);
    const cbs = this._listeners.get(session.id);
    if (cbs) for (const cb of cbs) cb(session);
  }

  private _findSessionByToken(token: string): HandshakeSession | null {
    for (const session of this._sessions.values()) {
      if (session.pairingToken?.token === token) return session;
    }
    return null;
  }

  private _randomToken(bytes: number): string {
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      const arr = new Uint8Array(bytes);
      crypto.getRandomValues(arr);
      return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
    }
    // Node fallback
    return Math.random().toString(36).slice(2).repeat(Math.ceil(bytes / 10)).slice(0, bytes * 2);
  }

  private _gc(): void {
    const now = Date.now();
    for (const [id, session] of this._sessions.entries()) {
      const token = session.pairingToken;
      if (token && now > token.expiresAt + 60_000) {
        this._sessions.delete(id);
        this._listeners.delete(id);
      }
    }
    // Trim used token set every 10 minutes worth of entries
    if (this._usedTokens.size > 1000) {
      const arr = [...this._usedTokens];
      arr.slice(0, 500).forEach((t) => this._usedTokens.delete(t));
    }
  }

  destroy(): void {
    if (this._gcInterval) clearInterval(this._gcInterval);
    this._sessions.clear();
    this._listeners.clear();
  }
}

export const websiteAppHandshake = WebsiteAppHandshake.getInstance();
