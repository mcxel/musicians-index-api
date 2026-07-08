import { scanTicket, ScanDecision } from "@/lib/tickets/TicketScannerEngine";
import { verifyTicket as verifyNFTTicket } from "@/lib/tickets/NFTTicketEngine";
import { getAssignmentsByUser } from "@/lib/venues/VenueSeatAuthorityEngine";

export type GateDecision = "enter" | "deny" | "hold" | "flag";

export type GateDenyReason =
  | "ticket_invalid"
  | "ticket_not_found"
  | "already_redeemed"
  | "revoked"
  | "fraud_blocked"
  | "nft_unverified"
  | "seat_unconfirmed"
  | "no_seat_assignment"
  | "venue_mismatch";

export interface GateCheckResult {
  decision: GateDecision;
  ticketId: string;
  userId: string;
  venueId: string;
  gate: string;
  reason: string;
  denyReason?: GateDenyReason;
  seatIds?: string[];
  checkedAt: number;
  scanDecision?: ScanDecision;
}

export interface GateCheckInput {
  ticketId: string;
  userId: string;
  venueId: string;
  gate: string;
  isNFTTicket?: boolean;
  requireSeatConfirmation?: boolean;
  deviceId?: string;
  latitude?: number;
  longitude?: number;
}

// ── Gate log ──────────────────────────────────────────────────────────────────

const _gateLog: GateCheckResult[] = [];
const _deniedSet: Set<string> = new Set(); // ticketId → denied at gate

// ── Check pipeline ────────────────────────────────────────────────────────────

export function checkEntry(input: GateCheckInput): GateCheckResult {
  const now = Date.now();

  const base: Omit<GateCheckResult, "decision" | "reason" | "denyReason"> = {
    ticketId: input.ticketId,
    userId: input.userId,
    venueId: input.venueId,
    gate: input.gate,
    checkedAt: now,
  };

  // 1 — NFT ticket path (if flagged as NFT)
  if (input.isNFTTicket) {
    const nft = verifyNFTTicket(input.ticketId);
    if (!nft.valid) {
      const result: GateCheckResult = {
        ...base,
        decision: "deny",
        reason: nft.reason ?? "NFT ticket verification failed",
        denyReason: nft.reason?.includes("revoked") ? "revoked" : "nft_unverified",
      };
      _gateLog.push(result);
      _deniedSet.add(input.ticketId);
      return result;
    }
  }

  // 2 — Standard ticket scan (fraud + validation + redemption)
  const scan = scanTicket({
    ticketId: input.ticketId,
    gate: input.gate,
    deviceId: input.deviceId,
    venueId: input.venueId,
    latitude: input.latitude,
    longitude: input.longitude,
  });

  if (!scan.ok) {
    const denyReason: GateDenyReason =
      scan.decision === "fraud_blocked"    ? "fraud_blocked" :
      scan.decision === "already_redeemed" ? "already_redeemed" :
      scan.decision === "revoked"          ? "revoked" :
      scan.decision === "not_found"        ? "ticket_not_found" :
      "ticket_invalid";

    const result: GateCheckResult = {
      ...base,
      decision: scan.isFraudFlagged ? "flag" : "deny",
      reason: scan.reason,
      denyReason,
      scanDecision: scan.decision,
    };
    _gateLog.push(result);
    _deniedSet.add(input.ticketId);
    return result;
  }

  // 3 — Seat confirmation check (if required)
  let seatIds: string[] | undefined;
  if (input.requireSeatConfirmation) {
    const assignments = getAssignmentsByUser(input.userId).filter(
      (a) => a.venueId === input.venueId && a.status === "confirmed"
    );
    if (assignments.length === 0) {
      const result: GateCheckResult = {
        ...base,
        decision: "hold",
        reason: "No confirmed seat assignment found — check with staff",
        denyReason: "no_seat_assignment",
        scanDecision: scan.decision,
      };
      _gateLog.push(result);
      return result;
    }
    seatIds = assignments.flatMap((a) => a.seatIds);
  }

  // 4 — ENTER
  const result: GateCheckResult = {
    ...base,
    decision: "enter",
    reason: "All checks passed",
    seatIds,
    scanDecision: scan.decision,
  };
  _gateLog.push(result);
  return result;
}

// ── Queries ───────────────────────────────────────────────────────────────────

export function getGateLog(limit = 100): GateCheckResult[] {
  return _gateLog.slice(-limit);
}

export function getGateLogByVenue(venueId: string): GateCheckResult[] {
  return _gateLog.filter((r) => r.venueId === venueId);
}

export function getGateLogByGate(venueId: string, gate: string): GateCheckResult[] {
  return _gateLog.filter((r) => r.venueId === venueId && r.gate === gate);
}

export function getDeniedTickets(): string[] {
  return [..._deniedSet];
}

export function getAdmittedCount(venueId: string): number {
  return _gateLog.filter((r) => r.venueId === venueId && r.decision === "enter").length;
}

export function getFlaggedEntries(venueId: string): GateCheckResult[] {
  return _gateLog.filter((r) => r.venueId === venueId && r.decision === "flag");
}
