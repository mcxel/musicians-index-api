export type ModuleId = string;

/**
 * Cross-module event contracts.
 * Any module that emits or consumes events from another module
 * must use these typed shapes. Direct imports between product apps
 * are NOT allowed — all inter-module communication goes through
 * packages/contracts or packages/events.
 */

// ─── Base event envelope ──────────────────────────────────────────────────────

export interface CrossModuleEvent<T = unknown> {
  id: string;
  source: ModuleId;
  target: ModuleId | "broadcast";
  type: string;
  payload: T;
  timestamp: number;
  correlationId?: string;
  /** If set, event is invalid after this time */
  expiresAt?: number;
}

// ─── Referral bus ─────────────────────────────────────────────────────────────

export interface ArtistReferralPayload {
  artistId: string;
  artistName: string;
  sessionId: string;
  reason: string;
  correlationId: string;
  signature: string;
}

export interface ReferralResponsePayload {
  referralId: string;
  intakeUrl: string;
  expiresAt: number;
}

// ─── Module health broadcast ──────────────────────────────────────────────────

export interface ModuleStatusPayload {
  moduleId: ModuleId;
  state: string;
  healthScore: number;
  uptimeMs: number;
  memoryRssMb: number;
  queueDepth: number;
  timestamp: number;
}

// ─── Payment/billing events ───────────────────────────────────────────────────

export interface BillingEventPayload {
  moduleId: ModuleId;
  userId: string;
  eventType: "purchase" | "refund" | "subscription" | "payout";
  amountCents: number;
  currency: "USD";
  correlationId: string;
  timestamp: number;
}

// ─── Media contract events (TMI ↔ USA Stream Team) ────────────────────────────

export interface MediaContractPayload {
  artistId: string;
  trackId: string;
  requestType: "playlist_sync" | "stream_ingest" | "stats_request";
  correlationId: string;
}

export interface MediaContractResponsePayload {
  correlationId: string;
  success: boolean;
  stats?: {
    plays: number;
    listeners: number;
    peakConcurrent: number;
  };
}

// ─── Charge events (Need-A-Charge ↔ TMI venues) ───────────────────────────────

export interface ChargeSessionPayload {
  venueId?: string;
  userId: string;
  lockerId: string;
  sessionType: "charge" | "locker";
  correlationId: string;
}

// ─── Admin control commands ────────────────────────────────────────────────────

export interface AdminControlCommand {
  targetModule: ModuleId;
  command:
    | "BOOT" | "STOP" | "RESTART" | "FREEZE" | "THAW"
    | "ISOLATE" | "EMERGENCY_LOCK"
    | "SET_STIM_MODE"
    | "SET_STIM_INTENSITY";
  params?: Record<string, string | number | boolean>;
  issuedBy: string;
  timestamp: number;
}

// ─── Constant event type strings ──────────────────────────────────────────────

export const CROSS_MODULE_EVENT_TYPES = {
  // TMI
  TMI_ARTIST_REFERRAL:   "tmi.artist.referral",
  TMI_SESSION_ACTIVE:    "tmi.session.active",
  TMI_MEDIA_CONTRACT:    "tmi.media.contract",
  TMI_VENUE_EVENT:       "tmi.venue.event",
  // Law
  LAW_REFERRAL_RECEIVED: "law.referral.received",
  LAW_PAYMENT_COMPLETED: "law.payment.completed",
  // XXL
  XXL_RUNTIME_STATUS:    "xxl.runtime.status",
  XXL_MODULE_ONLINE:     "xxl.module.online",
  // Stream
  STREAM_STATS_REPORTED: "stream.stats.reported",
  STREAM_STATION_LIVE:   "stream.station.live",
  // Charge
  CHARGE_SESSION_STARTED:"charge.session.started",
  CHARGE_PAYMENT_DONE:   "charge.payment.completed",
  // LLC
  LLC_COMPANY_UPDATED:   "llc.company.updated",
  LLC_PAYOUT_ISSUED:     "llc.payout.issued",
  LLC_PUBLIC_COMPANY_PUBLISHED: "llc.public.company.published",
  LLC_MODULE_REGISTRY_UPDATED:  "llc.module.registry.updated",
  // Admin
  ADMIN_CONTROL_COMMAND: "admin.control.command",
  MODULE_STATUS_BROADCAST:"module.status.broadcast",
} as const;

export type CrossModuleEventType =
  (typeof CROSS_MODULE_EVENT_TYPES)[keyof typeof CROSS_MODULE_EVENT_TYPES];
