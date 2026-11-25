/**
 * Opaque authenticated ticket credential authority.
 * Do NOT claim screenshot-proof. Transfer rotates presentation token.
 */

import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { appendFinancialAudit } from "./financialAuditLedger";

export type CredentialLifecycle =
  | "ISSUED"
  | "CLAIMABLE"
  | "CLAIMED"
  | "TRANSFERRED"
  | "VOID"
  | "EXPIRED"
  | "REDEEMED";

export interface TicketCredentialRecord {
  credentialId: string;
  /** Opaque presentation token (HMAC-backed). */
  presentationToken: string;
  eventId: string;
  ticketId: string;
  holderUserId: string | null;
  state: CredentialLifecycle;
  issuedAt: string;
  redeemedAt: string | null;
  revokedAt: string | null;
  supersedesCredentialId: string | null;
}

const byId = new Map<string, TicketCredentialRecord>();
const byToken = new Map<string, string>();
const byTicket = new Map<string, string>();
let seq = 0;

function secret(): string {
  return (
    process.env.TICKET_CREDENTIAL_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "tmi-ticket-credential-dev-only"
  );
}

function signPayload(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function issueTicketCredential(input: {
  eventId: string;
  ticketId: string;
  holderUserId?: string | null;
  state?: CredentialLifecycle;
  actor?: string;
}): TicketCredentialRecord {
  const credentialId = `cred_${Date.now()}_${++seq}`;
  const nonce = randomBytes(16).toString("base64url");
  const payload = `${credentialId}.${input.eventId}.${input.ticketId}.${nonce}`;
  const presentationToken = `${payload}.${signPayload(payload)}`;
  const rec: TicketCredentialRecord = {
    credentialId,
    presentationToken,
    eventId: input.eventId,
    ticketId: input.ticketId,
    holderUserId: input.holderUserId ?? null,
    state: input.state ?? "CLAIMED",
    issuedAt: new Date().toISOString(),
    redeemedAt: null,
    revokedAt: null,
    supersedesCredentialId: null,
  };
  byId.set(credentialId, rec);
  byToken.set(presentationToken, credentialId);
  byTicket.set(input.ticketId, credentialId);
  appendFinancialAudit({
    actor: input.actor ?? "ticketCredentialAuthority.issue",
    action: "CREDENTIAL_ISSUE",
    ticketId: input.ticketId,
    eventId: input.eventId,
    newState: rec.state,
    reason: "opaque_signed_credential",
    metadata: { credentialId },
  });
  return rec;
}

export function verifyPresentationToken(token: string): TicketCredentialRecord | null {
  const parts = token.split(".");
  if (parts.length < 4) return null;
  const sig = parts[parts.length - 1]!;
  const payload = parts.slice(0, -1).join(".");
  const expected = signPayload(payload);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  const id = byToken.get(token);
  if (!id) return null;
  return byId.get(id) ?? null;
}

export type RedeemResult =
  | { ok: true; credential: TicketCredentialRecord }
  | { ok: false; reason: "not_found" | "invalid_signature" | "already_redeemed" | "void" | "expired" | "wrong_event" };

export function redeemCredential(input: {
  presentationToken: string;
  eventId?: string;
  actor?: string;
}): RedeemResult {
  const rec = verifyPresentationToken(input.presentationToken);
  if (!rec) {
    // Distinguish missing vs bad sig loosely
    return { ok: false, reason: byToken.has(input.presentationToken) ? "invalid_signature" : "not_found" };
  }
  if (input.eventId && rec.eventId !== input.eventId) {
    return { ok: false, reason: "wrong_event" };
  }
  if (rec.state === "REDEEMED") return { ok: false, reason: "already_redeemed" };
  if (rec.state === "VOID") return { ok: false, reason: "void" };
  if (rec.state === "EXPIRED") return { ok: false, reason: "expired" };
  rec.state = "REDEEMED";
  rec.redeemedAt = new Date().toISOString();
  appendFinancialAudit({
    actor: input.actor ?? "ticketCredentialAuthority.redeem",
    action: "CREDENTIAL_REDEEM",
    ticketId: rec.ticketId,
    eventId: rec.eventId,
    previousState: "CLAIMED",
    newState: "REDEEMED",
    metadata: { credentialId: rec.credentialId },
  });
  return { ok: true, credential: rec };
}

export function transferCredential(input: {
  ticketId: string;
  toUserId: string;
  actor?: string;
}): TicketCredentialRecord {
  const oldId = byTicket.get(input.ticketId);
  if (!oldId) throw new Error("credential_not_found");
  const old = byId.get(oldId)!;
  if (old.state === "REDEEMED" || old.state === "VOID") {
    throw new Error(`cannot_transfer:${old.state}`);
  }
  old.state = "VOID";
  old.revokedAt = new Date().toISOString();
  byToken.delete(old.presentationToken);
  const next = issueTicketCredential({
    eventId: old.eventId,
    ticketId: old.ticketId,
    holderUserId: input.toUserId,
    state: "TRANSFERRED",
    actor: input.actor ?? "ticketCredentialAuthority.transfer",
  });
  next.supersedesCredentialId = old.credentialId;
  appendFinancialAudit({
    actor: input.actor ?? "ticketCredentialAuthority.transfer",
    action: "CREDENTIAL_TRANSFER",
    ticketId: input.ticketId,
    eventId: old.eventId,
    previousState: old.credentialId,
    newState: next.credentialId,
    reason: "prior_presentation_token_invalidated",
  });
  return next;
}

export function revokeCredential(ticketId: string, actor?: string): void {
  const id = byTicket.get(ticketId);
  if (!id) return;
  const rec = byId.get(id)!;
  rec.state = "VOID";
  rec.revokedAt = new Date().toISOString();
  byToken.delete(rec.presentationToken);
  appendFinancialAudit({
    actor: actor ?? "ticketCredentialAuthority.revoke",
    action: "CREDENTIAL_REVOKE",
    ticketId,
    eventId: rec.eventId,
    newState: "VOID",
  });
}

export function getActiveCredentialForTicket(ticketId: string): TicketCredentialRecord | null {
  const id = byTicket.get(ticketId);
  if (!id) return null;
  const rec = byId.get(id);
  if (!rec || rec.state === "VOID" || rec.state === "EXPIRED") return null;
  return rec;
}

export function __resetCredentialsForTests(): void {
  byId.clear();
  byToken.clear();
  byTicket.clear();
  seq = 0;
}

export function __exportCredentialsForPersist(): TicketCredentialRecord[] {
  return [...byId.values()];
}

export function __importCredentialsForPersist(rows: TicketCredentialRecord[]): void {
  byId.clear();
  byToken.clear();
  byTicket.clear();
  for (const rec of rows) {
    byId.set(rec.credentialId, { ...rec });
    byToken.set(rec.presentationToken, rec.credentialId);
    byTicket.set(rec.ticketId, rec.credentialId);
  }
  seq = rows.length;
}
