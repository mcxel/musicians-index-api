/**
 * SubmissionEntitlementAuthority.ts — canonical tier→submission entitlement
 * authority for Stream & Win Radio and Video Shuffle (§6455–§6479, §6555).
 *
 * Status of values: NO canonical per-tier submission allowance existed anywhere
 * in the repo before this module (verified — Stream & Win used a flat
 * FREE_SONGS_MAX=2 with no tier input; Video Shuffle had no submission
 * pipeline). Per §5987-style "do not invent financial/allowance values", the
 * per-tier allowance ladder is therefore declared CONFIGURABLE and starts
 * UNSET. The owner must provide the real allowance values before the
 * comparison UI may display a number (§6459 — "Do NOT use X/Y placeholders in
 * production").
 *
 * Laws honored:
 *  - §6473  Stream & Win and Video Shuffle are SEPARATE entitlements/counters.
 *  - §6470  Server-side enforcement: callers resolve the authenticated
 *    creator's canonical tier and call this authority; the client never
 *    supplies the allowance.
 *  - §6456  This benefit concerns SUBMISSIONS, not consumption access.
 *  - §6469  One authority — the submission drawer, pricing comparison, and
 *    upgrade prompter all read from here (no duplicate numbers).
 *
 * Pure data/logic. No Prisma, no DOM, no fetch.
 */

import type { AccountType, SubscriptionTier } from "@/lib/subscriptions/SubscriptionPricingEngine";

// ─────────────────────────────────────────────────────────────────────────────
// Destinations (separate counters — §6473)
// ─────────────────────────────────────────────────────────────────────────────

export type SubmissionDestination = "STREAM_WIN_RADIO" | "VIDEO_SHUFFLE";

export const SUBMISSION_DESTINATIONS: readonly SubmissionDestination[] = [
  "STREAM_WIN_RADIO",
  "VIDEO_SHUFFLE",
] as const;

export function isSubmissionDestination(v: unknown): v is SubmissionDestination {
  return v === "STREAM_WIN_RADIO" || v === "VIDEO_SHUFFLE";
}

// ─────────────────────────────────────────────────────────────────────────────
// Allowance model
// ─────────────────────────────────────────────────────────────────────────────

/** Reset cadence for an allowance (§6460). */
export type SubmissionResetPeriod = "TOTAL" | "PER_DAY" | "PER_WEEK" | "PER_MONTH" | "PER_RELEASE";

export interface SubmissionAllowance {
  /** Max submissions allowed in the period. Null = UNSET (owner value required). */
  count: number | null;
  period: SubmissionResetPeriod;
  /** True when the value is a real owner-approved number (not a placeholder). */
  isConfigured: boolean;
}

const TIER_ORDER: readonly SubscriptionTier[] = [
  "free",
  "pro",
  "RUBY",
  "silver",
  "gold",
  "platinum",
  "diamond",
] as const;

function tierIndex(tier: SubscriptionTier): number {
  const i = TIER_ORDER.indexOf(tier);
  return i < 0 ? 0 : i;
}

/**
 * CONFIGURABLE allowance ladder. Values are `null` until the owner provides
 * canonical numbers. When `null`, `isConfigured` is false and resolvers fail
 * closed (no invented allowance is ever displayed or enforced).
 *
 * Shape: [destination][tierIndex] → count.
 *
 * NOTE (discovered existing behavior): Stream & Win currently allows a flat
 * `FREE_SONGS_MAX = 2` for ALL tiers (StreamAndWinEngine.ts) with no tier
 * input. That flat value is preserved here as the FREE-tier truth so existing
 * behavior is not regressed; higher tiers remain UNSET pending owner values.
 */
const STREAM_WIN_ALLOWANCE: readonly (number | null)[] = [
  2, // free — matches existing FREE_SONGS_MAX (discovered canonical floor)
  null, // pro — OWNER_VALUE_REQUIRED
  null, // RUBY — OWNER_VALUE_REQUIRED
  null, // silver
  null, // gold
  null, // platinum
  null, // diamond
];

const VIDEO_SHUFFLE_ALLOWANCE: readonly (number | null)[] = [
  null, // free — OWNER_VALUE_REQUIRED (no submission pipeline existed)
  null, // pro
  null, // RUBY
  null, // silver
  null, // gold
  null, // platinum
  null, // diamond
];

const ALLOWANCE_TABLE: Record<SubmissionDestination, readonly (number | null)[]> = {
  STREAM_WIN_RADIO: STREAM_WIN_ALLOWANCE,
  VIDEO_SHUFFLE: VIDEO_SHUFFLE_ALLOWANCE,
};

/** Reset period per destination (single canonical cadence). */
const RESET_PERIOD: Record<SubmissionDestination, SubmissionResetPeriod> = {
  STREAM_WIN_RADIO: "TOTAL", // existing Stream & Win uses a lifetime active-song cap
  VIDEO_SHUFFLE: "TOTAL",
};

// ─────────────────────────────────────────────────────────────────────────────
// Resolution
// ─────────────────────────────────────────────────────────────────────────────

export interface SubmissionEntitlementResolution {
  destination: SubmissionDestination;
  tier: SubscriptionTier;
  accountType: AccountType;
  /** Resolved allowance. */
  allowance: SubmissionAllowance;
  /** True when a truthful allowance number is available to display/enforce. */
  ok: boolean;
  /** Set when the owner has not provided a value for this tier/destination. */
  reason?: "OWNER_VALUE_REQUIRED";
  /** Submission benefits only apply to personas authorized to submit (§6462). */
  submissionAuthorized: boolean;
}

/**
 * Whether this persona may submit creator-owned media at all (§6462/§5973).
 * Performers/artists are creators. Fans are NOT granted submission controls
 * merely because they can consume the destination; a Fan is authorized only if
 * canonical role law treats them as a creator for the destination (default: no).
 */
export function isSubmissionAuthorized(accountType: AccountType, destination: SubmissionDestination): boolean {
  void destination;
  return accountType === "performer" || accountType === "artist";
}

/** Resolve the submission allowance for a destination + tier + persona. */
export function resolveSubmissionEntitlement(input: {
  destination: SubmissionDestination;
  tier: SubscriptionTier;
  accountType: AccountType;
}): SubmissionEntitlementResolution {
  const { destination, tier, accountType } = input;
  const submissionAuthorized = isSubmissionAuthorized(accountType, destination);
  const count = ALLOWANCE_TABLE[destination][tierIndex(tier)];
  const isConfigured = count != null;
  return {
    destination,
    tier,
    accountType,
    submissionAuthorized,
    allowance: {
      count: isConfigured ? count : null,
      period: RESET_PERIOD[destination],
      isConfigured,
    },
    ok: submissionAuthorized && isConfigured,
    reason: !isConfigured ? "OWNER_VALUE_REQUIRED" : undefined,
  };
}

/** Full-ladder visibility (§6475): resolve an allowance row for every tier. */
export function listSubmissionAllowanceLadder(
  destination: SubmissionDestination,
  accountType: AccountType,
): Array<{ tier: SubscriptionTier; allowance: SubmissionAllowance; submissionAuthorized: boolean }> {
  return TIER_ORDER.map((tier) => {
    const r = resolveSubmissionEntitlement({ destination, tier, accountType });
    return { tier, allowance: r.allowance, submissionAuthorized: r.submissionAuthorized };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Remaining-count helper (§6465/§6471) — pure; caller supplies real usage
// ─────────────────────────────────────────────────────────────────────────────

export interface SubmissionRemainingResolution {
  destination: SubmissionDestination;
  /** Remaining submissions in the current period. Null when unconfigured. */
  remaining: number | null;
  /** Configured allowance for the period. Null when unconfigured. */
  allowed: number | null;
  /** True when the user is at/over the limit and an upgrade prompt is relevant. */
  atLimit: boolean;
  ok: boolean;
  reason?: "OWNER_VALUE_REQUIRED" | "NOT_AUTHORIZED";
}

/**
 * Compute remaining submission capacity. `usedInPeriod` MUST come from the
 * canonical submission-history authority server-side (§6470/§6555) — never a
 * client-supplied count trusted for enforcement.
 */
export function resolveSubmissionRemaining(input: {
  destination: SubmissionDestination;
  tier: SubscriptionTier;
  accountType: AccountType;
  usedInPeriod: number;
}): SubmissionRemainingResolution {
  const ent = resolveSubmissionEntitlement(input);
  if (!ent.submissionAuthorized) {
    return { destination: ent.destination, remaining: 0, allowed: 0, atLimit: true, ok: false, reason: "NOT_AUTHORIZED" };
  }
  if (!ent.allowance.isConfigured || ent.allowance.count == null) {
    return { destination: ent.destination, remaining: null, allowed: null, atLimit: false, ok: false, reason: "OWNER_VALUE_REQUIRED" };
  }
  const allowed = ent.allowance.count;
  const remaining = Math.max(0, allowed - Math.max(0, input.usedInPeriod));
  return { destination: ent.destination, remaining, allowed, atLimit: remaining <= 0, ok: true };
}
