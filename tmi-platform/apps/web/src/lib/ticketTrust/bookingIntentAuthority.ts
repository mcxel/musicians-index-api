/**
 * BOOK THIS PERFORMER — authority contract only (no Beacon UI).
 */

import { appendFinancialAudit } from "./financialAuditLedger";

export type BookingIntentSource =
  | "PROFILE"
  | "STATION"
  | "MAGAZINE"
  | "LIVE_SHOW"
  | "EVENT"
  | "QR"
  | "SHARED_LINK";

export interface BookingIntent {
  intentId: string;
  performerId: string;
  source: BookingIntentSource;
  sourceContext: string | null;
  attributionToken: string | null;
  eventId: string | null;
  requesterUserId: string | null;
  /** Survives auth redirect. */
  resumePath: string;
  createdAt: string;
  status: "OPEN" | "CONSUMED" | "EXPIRED";
}

const byId = new Map<string, BookingIntent>();
const byToken = new Map<string, string>();
let seq = 0;

export function createBookingIntent(input: {
  performerId: string;
  source: BookingIntentSource;
  sourceContext?: string | null;
  attributionToken?: string | null;
  eventId?: string | null;
  requesterUserId?: string | null;
  resumePath?: string;
  actor?: string;
}): BookingIntent {
  if (!input.performerId) throw new Error("performerId_required");
  const intentId = `bi_${Date.now()}_${++seq}`;
  const attributionToken = input.attributionToken ?? `attr_${intentId}`;
  const intent: BookingIntent = {
    intentId,
    performerId: input.performerId,
    source: input.source,
    sourceContext: input.sourceContext ?? null,
    attributionToken,
    eventId: input.eventId ?? null,
    requesterUserId: input.requesterUserId ?? null,
    resumePath:
      input.resumePath ??
      `/booking/intent/${intentId}?performer=${encodeURIComponent(input.performerId)}`,
    createdAt: new Date().toISOString(),
    status: "OPEN",
  };
  byId.set(intentId, intent);
  byToken.set(attributionToken, intentId);
  appendFinancialAudit({
    actor: input.actor ?? "bookingIntentAuthority",
    action: "BOOKING_INTENT",
    eventId: input.eventId,
    newState: "OPEN",
    reason: `source:${input.source}`,
    metadata: { intentId, performerId: input.performerId, attributionToken },
  });
  return intent;
}

export function getBookingIntent(intentId: string): BookingIntent | null {
  return byId.get(intentId) ?? null;
}

export function getBookingIntentByAttribution(token: string): BookingIntent | null {
  const id = byToken.get(token);
  return id ? byId.get(id) ?? null : null;
}

/** After auth — attach user and keep same intent (never dump to Home). */
export function bindBookingIntentUser(intentId: string, userId: string): BookingIntent {
  const intent = byId.get(intentId);
  if (!intent) throw new Error("intent_not_found");
  if (intent.status !== "OPEN") throw new Error(`intent_${intent.status.toLowerCase()}`);
  intent.requesterUserId = userId;
  return intent;
}

export function consumeBookingIntent(intentId: string): BookingIntent {
  const intent = byId.get(intentId);
  if (!intent) throw new Error("intent_not_found");
  intent.status = "CONSUMED";
  return intent;
}

export function __resetBookingIntentsForTests(): void {
  byId.clear();
  byToken.clear();
  seq = 0;
}
