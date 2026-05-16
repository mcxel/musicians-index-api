import { appendScanLedger, getTicketById, saveTicket } from "@/lib/tickets/ticketCore";
import { TicketValidationEngine } from "@/lib/tickets/TicketValidationEngine";
import { ticketFraudEngine } from "@/lib/tickets/TicketFraudEngine";
import { verifyTicket as verifyNFTTicket } from "@/lib/tickets/NFTTicketEngine";

export type ScanDecision =
  | "allowed"
  | "denied"
  | "fraud_blocked"
  | "already_redeemed"
  | "not_found"
  | "revoked";

export interface ScanResult {
  ok: boolean;
  decision: ScanDecision;
  reason: string;
  scannedAt: string;
  isDuplicate: boolean;
  isFraudFlagged: boolean;
}

export interface ScanInput {
  ticketId: string;
  gate: string;
  deviceId?: string;
  venueId?: string;
  latitude?: number;
  longitude?: number;
}

export function scanTicket(input: ScanInput): ScanResult {
  const now = new Date().toISOString();

  // 1 — Fraud + duplicate check
  const fraudCheck = ticketFraudEngine.recordScan({
    ticketId: input.ticketId,
    scannedAt: Date.now(),
    scannedByDeviceId: input.deviceId ?? "unknown",
    venueId: input.venueId ?? "unknown",
    latitude: input.latitude,
    longitude: input.longitude,
  });

  const isDuplicate = fraudCheck.signals.includes("duplicate-scan");
  const isFraudFlagged = fraudCheck.verdict !== "clean";

  if (fraudCheck.verdict === "blocked") {
    appendScanLedger({
      ticketId: input.ticketId, scannedAt: now,
      gate: input.gate, status: "denied", reason: "fraud_blocked",
    });
    return { ok: false, decision: "fraud_blocked", reason: "Fraud signal blocked entry", scannedAt: now, isDuplicate, isFraudFlagged: true };
  }

  // 2 — NFT revoke check
  const nftCheck = verifyNFTTicket(input.ticketId);
  if (!nftCheck.valid && nftCheck.reason?.includes("revoked")) {
    appendScanLedger({
      ticketId: input.ticketId, scannedAt: now,
      gate: input.gate, status: "denied", reason: "revoked",
    });
    return { ok: false, decision: "revoked", reason: "Ticket has been revoked", scannedAt: now, isDuplicate, isFraudFlagged };
  }

  // 3 — Standard validation (fraud guard + redeemed state)
  const validation = TicketValidationEngine(input.ticketId);

  if (!validation.valid) {
    const decision: ScanDecision =
      validation.reason === "ticket_not_found"  ? "not_found" :
      validation.reason === "already_redeemed"  ? "already_redeemed" :
      "denied";

    appendScanLedger({
      ticketId: input.ticketId, scannedAt: now,
      gate: input.gate, status: "denied", reason: validation.reason ?? "denied",
    });
    return { ok: false, decision, reason: validation.reason ?? "denied", scannedAt: now, isDuplicate, isFraudFlagged };
  }

  // 4 — Allow + mark redeemed
  const ticket = getTicketById(input.ticketId);
  if (ticket) saveTicket({ ...ticket, redeemed: true });

  appendScanLedger({
    ticketId: input.ticketId, scannedAt: now,
    gate: input.gate, status: "allowed", reason: "ok",
  });
  return { ok: true, decision: "allowed", reason: "ok", scannedAt: now, isDuplicate: false, isFraudFlagged: false };
}

// Backward-compatible wrapper (existing callsites)
export function TicketScannerEngine(input: { ticketId: string; gate: string }): {
  ok: boolean; status: string; reason: string; scannedAt: string;
} {
  const result = scanTicket(input);
  return { ok: result.ok, status: result.decision, reason: result.reason, scannedAt: result.scannedAt };
}
