/**
 * DiscoveryBoostEngine — self-serve discovery/promotion boosts (Rule 20).
 * Paid exposure weight only — never fabricates views, follows, or engagement.
 * Complements LobbyWallBoostEngine (tile visibility); this elevates profile/show/booking cards.
 */

export type DiscoveryBoostTier = "spark" | "entry_299" | "pulse" | "wave" | "blast";
export type DiscoveryBoostTierId = DiscoveryBoostTier;

export type DiscoveryBoostTarget =
  | "profile"
  | "video_shuffle"
  | "lobby_wall"
  | "yopho_card"
  | "stream_win_radio"
  | "shows_releases"
  | "upcoming_show"
  | "mini_concert"
  | "world_concert"
  | "release"
  | "venue"
  | "booking_availability"
  | "merch";

export type DiscoveryBoostStripeKey =
  | "DISCOVERY_BOOST_SPARK"
  | "DISCOVERY_BOOST_PULSE"
  | "DISCOVERY_BOOST_WAVE"
  | "DISCOVERY_BOOST_BLAST"
  | "VIDEO_SHUFFLE_BOOST_299"
  | "LOBBY_WALL_PROFILE_BOOST_299"
  | "PERFORMER_PROFILE_BOOST_299"
  | "YOPHO_CARD_BOOST_299"
  | "STREAM_WIN_RADIO_BOOST_299"
  | "SHOWS_RELEASES_BOOST_299";

export interface DiscoveryBoostProduct {
  tier: DiscoveryBoostTier;
  stripeKey: DiscoveryBoostStripeKey;
  label: string;
  priceCents: number;
  durationHours: number;
  /** Multiplier applied to organic discovery sort weight (does not rewrite rank). */
  exposureWeight: number;
}

/** Sorted lowest-price-first per PriceSortAuthority ($1.99 → $2.99 → $4.99 → $9.99 → $19.99). */
export const DISCOVERY_BOOST_CATALOG: readonly DiscoveryBoostProduct[] = [
  {
    tier: "spark",
    stripeKey: "DISCOVERY_BOOST_SPARK",
    label: "Spark Boost",
    priceCents: 199,
    durationHours: 24,
    exposureWeight: 1.25,
  },
  {
    tier: "entry_299",
    stripeKey: "PERFORMER_PROFILE_BOOST_299",
    label: "$2.99 Entry Boost (4h)",
    priceCents: 299,
    durationHours: 4,
    exposureWeight: 1.35,
  },
  {
    tier: "pulse",
    stripeKey: "DISCOVERY_BOOST_PULSE",
    label: "Pulse Boost",
    priceCents: 499,
    durationHours: 48,
    exposureWeight: 1.5,
  },
  {
    tier: "wave",
    stripeKey: "DISCOVERY_BOOST_WAVE",
    label: "Wave Boost",
    priceCents: 999,
    durationHours: 72,
    exposureWeight: 2,
  },
  {
    tier: "blast",
    stripeKey: "DISCOVERY_BOOST_BLAST",
    label: "Blast Boost",
    priceCents: 1999,
    durationHours: 168,
    exposureWeight: 3,
  },
] as const;

export function resolveDiscoveryBoostStripeKey(
  tier: DiscoveryBoostTier,
  target: DiscoveryBoostTarget,
): DiscoveryBoostStripeKey {
  if (tier === "entry_299") {
    switch (target) {
      case "video_shuffle":
        return "VIDEO_SHUFFLE_BOOST_299";
      case "lobby_wall":
        return "LOBBY_WALL_PROFILE_BOOST_299";
      case "yopho_card":
        return "YOPHO_CARD_BOOST_299";
      case "stream_win_radio":
        return "STREAM_WIN_RADIO_BOOST_299";
      case "shows_releases":
      case "upcoming_show":
      case "mini_concert":
      case "world_concert":
      case "release":
        return "SHOWS_RELEASES_BOOST_299";
      case "profile":
      default:
        return "PERFORMER_PROFILE_BOOST_299";
    }
  }
  const product = DISCOVERY_BOOST_CATALOG.find((p) => p.tier === tier);
  return product?.stripeKey ?? "DISCOVERY_BOOST_SPARK";
}

export interface DiscoveryBoostRecord {
  id: string;
  ownerId: string;
  ownerRole: "performer" | "venue" | "fan";
  target: DiscoveryBoostTarget;
  targetRefId: string;
  tier: DiscoveryBoostTier;
  stripeKey: DiscoveryBoostStripeKey;
  priceCents: number;
  exposureWeight: number;
  startedAtMs: number;
  expiresAtMs: number;
  stripeSessionId: string | null;
  paymentIntentId?: string | null;
  appliedStripeSessionIds?: string[];
  extensionCount?: number;
  label: string;
  /** Real measured impressions delivered in promoted slots (never fabricated). */
  impressionsDelivered: number;
  /** Real measured clicks/joins from promoted slots (never fabricated). */
  clicksDelivered: number;
  fulfillmentStatus: "ACTIVE" | "EXPIRED" | "REFUNDED";
  revokedAtMs?: number | null;
  /** Anti-abuse floor for recordBoostImpression — see DISCOVERY_BOOST_IMPRESSION_COOLDOWN_MS. */
  lastImpressionAtMs?: number | null;
}

/** §Revenue Activation Sprint Phase D — a client claiming "this was displayed"
 *  does not by itself prove a legitimate impression. This does not verify
 *  playback context or an authenticated viewer identity (not available to
 *  this engine) — it bounds a malicious client's maximum inflation rate
 *  (one counted impression per boost per this window) rather than leaving
 *  the count fully open to unlimited rapid-fire calls. Not a complete fix;
 *  flagged honestly as a partial mitigation. */
export const DISCOVERY_BOOST_IMPRESSION_COOLDOWN_MS = 10_000;

const boostsById = new Map<string, DiscoveryBoostRecord>();
let hydratedFromDurable = false;

/**
 * §P0 Emergency Shared-State Protection (incident, 2026-11-09): a test run
 * against this file wrote into the real shared %TEMP%/tmi-durable-revenue-v1/
 * directory — the same path a running dev server would use — and reset its
 * ledger to empty. The fix below is automatic/unconditional, never an
 * opt-in env var a caller has to remember: detection is based on signals
 * Jest itself sets (NODE_ENV==="test" or JEST_WORKER_ID), never on
 * TMI_DURABLE_REVENUE_DIR, which remains available only as a production
 * path override and is never read for test-mode isolation decisions.
 */
function isTestRuntime(): boolean {
  return process.env.NODE_ENV === "test" || Boolean(process.env.JEST_WORKER_ID);
}

let cachedTestLedgerDir: string | null = null;

/** Destructive test-only reset/restart-simulation functions call this first
 *  and refuse to run at all outside a detected test environment — so a
 *  caller can never accidentally point one of these at real dev/prod state,
 *  with or without remembering an env var. */
function assertIsolatedTestRuntimeOrThrow(fnName: string): void {
  if (!isTestRuntime()) {
    throw new Error(
      `${fnName}() refused: no test environment detected (NODE_ENV!=="test" and JEST_WORKER_ID unset). ` +
        "This function is destructive and must never run against the real durable ledger.",
    );
  }
}

function getDurableBoostFileOps(): {
  read: () => Record<string, DiscoveryBoostRecord> | null;
  write: (data: Record<string, DiscoveryBoostRecord>) => void;
} | null {
  if (typeof process === "undefined" || !process.versions?.node) return null;
  try {
    // eslint-disable-next-line no-eval
    const req = eval("require") as (mod: string) => any;
    const fs = req("fs");
    const os = req("os");
    const path = req("path");
    const dir = isTestRuntime()
      ? (cachedTestLedgerDir ??= path.join(os.tmpdir(), `tmi-test-revenue-${process.pid}`))
      : process.env.TMI_DURABLE_REVENUE_DIR || path.join(os.tmpdir(), "tmi-durable-revenue-v1");
    const file = path.join(dir, "discovery-boosts-ledger.json");
    return {
      read: () => {
        try {
          if (!fs.existsSync(file)) return null;
          const raw = fs.readFileSync(file, "utf8");
          return raw ? (JSON.parse(raw) as Record<string, DiscoveryBoostRecord>) : null;
        } catch {
          return null;
        }
      },
      write: (data) => {
        try {
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
          const tmp = `${file}.${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2, 7)}.tmp`;
          fs.writeFileSync(tmp, JSON.stringify(data), "utf8");
          fs.renameSync(tmp, file);
        } catch {
          try {
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(file, JSON.stringify(data), "utf8");
          } catch {
            // ignore in read-only sandbox
          }
        }
      },
    };
  } catch {
    return null;
  }
}

function hydrateDiscoveryBoostsFromDurable(): void {
  const ops = getDurableBoostFileOps();
  if (!ops) return;
  const disk = ops.read();
  if (!disk) {
    hydratedFromDurable = true;
    return;
  }
  for (const [id, rec] of Object.entries(disk)) {
    const inMem = boostsById.get(id);
    if (!inMem) {
      boostsById.set(id, rec);
    } else {
      // Merge monotonic counters and terminal status across instances
      if (rec.fulfillmentStatus === "REFUNDED") {
        inMem.fulfillmentStatus = "REFUNDED";
        inMem.expiresAtMs = rec.expiresAtMs;
        inMem.revokedAtMs = rec.revokedAtMs;
      } else if (rec.fulfillmentStatus === "EXPIRED" && inMem.fulfillmentStatus === "ACTIVE" && rec.expiresAtMs >= inMem.expiresAtMs) {
        inMem.fulfillmentStatus = "EXPIRED";
      }
      if (rec.expiresAtMs > inMem.expiresAtMs && inMem.fulfillmentStatus !== "REFUNDED") {
        inMem.expiresAtMs = rec.expiresAtMs;
        inMem.priceCents = Math.max(inMem.priceCents, rec.priceCents);
        inMem.extensionCount = Math.max(inMem.extensionCount ?? 0, rec.extensionCount ?? 0);
      }
      inMem.impressionsDelivered = Math.max(inMem.impressionsDelivered, rec.impressionsDelivered);
      inMem.clicksDelivered = Math.max(inMem.clicksDelivered, rec.clicksDelivered);
      const mergedSessions = new Set([
        ...(inMem.appliedStripeSessionIds ?? (inMem.stripeSessionId ? [inMem.stripeSessionId] : [])),
        ...(rec.appliedStripeSessionIds ?? (rec.stripeSessionId ? [rec.stripeSessionId] : [])),
      ]);
      inMem.appliedStripeSessionIds = [...mergedSessions];
    }
  }
  hydratedFromDurable = true;
}

function flushDiscoveryBoostsToDurable(): void {
  const ops = getDurableBoostFileOps();
  if (!ops) return;
  const out: Record<string, DiscoveryBoostRecord> = {};
  for (const [id, rec] of boostsById.entries()) {
    out[id] = rec;
  }
  ops.write(out);
}

function genId(): string {
  return `dbst-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getBoostProduct(tier: DiscoveryBoostTier): DiscoveryBoostProduct {
  const found = DISCOVERY_BOOST_CATALOG.find((p) => p.tier === tier);
  if (!found) return DISCOVERY_BOOST_CATALOG[0];
  return found;
}

export function purgeExpiredDiscoveryBoosts(nowMs: number = Date.now()): number {
  if (!hydratedFromDurable) hydrateDiscoveryBoostsFromDurable();
  let expiredCount = 0;
  for (const [, rec] of boostsById.entries()) {
    if (rec.fulfillmentStatus === "ACTIVE" && rec.expiresAtMs <= nowMs) {
      rec.fulfillmentStatus = "EXPIRED";
      expiredCount += 1;
    }
  }
  if (expiredCount > 0) flushDiscoveryBoostsToDurable();
  return expiredCount;
}

export function recordDiscoveryBoost(input: {
  ownerId: string;
  ownerRole: "performer" | "venue" | "fan";
  target: DiscoveryBoostTarget;
  targetRefId: string;
  tier: DiscoveryBoostTier;
  stripeSessionId?: string | null;
  paymentIntentId?: string | null;
  extendIfActive?: boolean;
  startedAtMs?: number;
  nowMs?: number;
}): DiscoveryBoostRecord {
  hydrateDiscoveryBoostsFromDurable();
  const startedAtMs = input.startedAtMs ?? input.nowMs ?? Date.now();
  purgeExpiredDiscoveryBoosts(startedAtMs);

  // 1. Idempotency: duplicate Stripe session OR duplicate PaymentIntent
  // (a webhook retry/duplicate delivery can carry either identifier) returns
  // the existing boost unchanged — never a second free extension for the
  // same real charge. (§P0 Payment Idempotency fix, 2026-11-09: the
  // paymentIntentId half of this check was previously missing entirely.)
  if (input.stripeSessionId || input.paymentIntentId) {
    for (const existing of boostsById.values()) {
      const sessionMatch =
        Boolean(input.stripeSessionId) &&
        (existing.stripeSessionId === input.stripeSessionId ||
          existing.appliedStripeSessionIds?.includes(input.stripeSessionId!));
      const paymentIntentMatch =
        Boolean(input.paymentIntentId) && existing.paymentIntentId === input.paymentIntentId;
      if (sessionMatch || paymentIntentMatch) {
        return existing;
      }
    }
  }

  const product = getBoostProduct(input.tier);
  const stripeKey = resolveDiscoveryBoostStripeKey(input.tier, input.target);
  const durationMs = product.durationHours * 60 * 60 * 1000;

  // 2. Boost extension: if an ACTIVE boost exists for the same (ownerId, target, targetRefId),
  // extend its expiration window so the creator keeps their remaining paid time.
  if (input.extendIfActive !== false) {
    for (const existing of boostsById.values()) {
      if (
        existing.fulfillmentStatus === "ACTIVE" &&
        existing.expiresAtMs > startedAtMs &&
        existing.ownerId === input.ownerId &&
        existing.target === input.target &&
        existing.targetRefId === input.targetRefId
      ) {
        existing.expiresAtMs = Math.max(existing.expiresAtMs, startedAtMs) + durationMs;
        existing.priceCents += product.priceCents;
        existing.exposureWeight = Math.max(existing.exposureWeight, product.exposureWeight);
        existing.extensionCount = (existing.extensionCount ?? 0) + 1;
        if (input.stripeSessionId) {
          existing.stripeSessionId = input.stripeSessionId;
          const set = new Set(existing.appliedStripeSessionIds ?? []);
          set.add(input.stripeSessionId);
          existing.appliedStripeSessionIds = [...set];
        }
        if (input.paymentIntentId) {
          existing.paymentIntentId = input.paymentIntentId;
        }
        flushDiscoveryBoostsToDurable();
        return existing;
      }
    }
  }

  const record: DiscoveryBoostRecord = {
    id: genId(),
    ownerId: input.ownerId,
    ownerRole: input.ownerRole,
    target: input.target,
    targetRefId: input.targetRefId,
    tier: input.tier,
    stripeKey,
    priceCents: product.priceCents,
    exposureWeight: product.exposureWeight,
    startedAtMs,
    expiresAtMs: startedAtMs + durationMs,
    stripeSessionId: input.stripeSessionId ?? null,
    paymentIntentId: input.paymentIntentId ?? null,
    appliedStripeSessionIds: input.stripeSessionId ? [input.stripeSessionId] : [],
    extensionCount: 0,
    label: product.label,
    impressionsDelivered: 0,
    clicksDelivered: 0,
    fulfillmentStatus: "ACTIVE",
    revokedAtMs: null,
  };
  boostsById.set(record.id, record);
  flushDiscoveryBoostsToDurable();
  return record;
}

export function recordBoostImpression(boostId: string, nowMs: number = Date.now()): boolean {
  hydrateDiscoveryBoostsFromDurable();
  const rec = boostsById.get(boostId);
  if (!rec || rec.expiresAtMs <= nowMs || rec.fulfillmentStatus !== "ACTIVE") return false;
  if (
    rec.lastImpressionAtMs != null &&
    nowMs - rec.lastImpressionAtMs < DISCOVERY_BOOST_IMPRESSION_COOLDOWN_MS
  ) {
    return false;
  }
  rec.lastImpressionAtMs = nowMs;
  rec.impressionsDelivered += 1;
  flushDiscoveryBoostsToDurable();
  return true;
}

export function recordBoostClick(boostId: string, nowMs: number = Date.now()): boolean {
  hydrateDiscoveryBoostsFromDurable();
  const rec = boostsById.get(boostId);
  if (!rec || rec.expiresAtMs <= nowMs || rec.fulfillmentStatus !== "ACTIVE") return false;
  rec.clicksDelivered += 1;
  flushDiscoveryBoostsToDurable();
  return true;
}

export function refundFailedDiscoveryBoost(
  boostId: string,
  nowMs: number = Date.now(),
): DiscoveryBoostRecord | null {
  hydrateDiscoveryBoostsFromDurable();
  const rec = boostsById.get(boostId);
  if (!rec) return null;
  rec.fulfillmentStatus = "REFUNDED";
  rec.revokedAtMs = nowMs;
  rec.expiresAtMs = Math.min(rec.expiresAtMs, nowMs);
  flushDiscoveryBoostsToDurable();
  return rec;
}

export function revokeDiscoveryBoostByPaymentRef(input: {
  stripeSessionId?: string | null;
  paymentIntentId?: string | null;
  nowMs?: number;
}): DiscoveryBoostRecord[] {
  hydrateDiscoveryBoostsFromDurable();
  const nowMs = input.nowMs ?? Date.now();
  const revoked: DiscoveryBoostRecord[] = [];
  for (const rec of boostsById.values()) {
    const matchSession =
      Boolean(input.stripeSessionId) &&
      (rec.stripeSessionId === input.stripeSessionId ||
        rec.appliedStripeSessionIds?.includes(input.stripeSessionId!));
    const matchPi =
      Boolean(input.paymentIntentId) && rec.paymentIntentId === input.paymentIntentId;
    if (matchSession || matchPi) {
      rec.fulfillmentStatus = "REFUNDED";
      rec.revokedAtMs = nowMs;
      rec.expiresAtMs = Math.min(rec.expiresAtMs, nowMs);
      revoked.push(rec);
    }
  }
  if (revoked.length > 0) flushDiscoveryBoostsToDurable();
  return revoked;
}

/**
 * Simulates a server process restart by clearing in-memory state without touching
 * the durable ledger, proving that subsequent reads rehydrate from durable storage.
 */
export function simulateDiscoveryBoostServerRestartForTests(): void {
  assertIsolatedTestRuntimeOrThrow("simulateDiscoveryBoostServerRestartForTests");
  boostsById.clear();
  hydratedFromDurable = false;
}

export function listActiveDiscoveryBoosts(
  nowMs: number = Date.now(),
): DiscoveryBoostRecord[] {
  hydrateDiscoveryBoostsFromDurable();
  purgeExpiredDiscoveryBoosts(nowMs);
  return [...boostsById.values()].filter(
    (r) => r.expiresAtMs > nowMs && r.fulfillmentStatus === "ACTIVE",
  );
}

export function listActiveBoostsForOwner(
  ownerId: string,
  nowMs: number = Date.now(),
): DiscoveryBoostRecord[] {
  return listActiveDiscoveryBoosts(nowMs).filter((r) => r.ownerId === ownerId);
}

export function getActiveBoostForTarget(
  targetRefId: string,
  nowMs: number = Date.now(),
): DiscoveryBoostRecord | null {
  const matches = listActiveDiscoveryBoosts(nowMs).filter(
    (r) => r.targetRefId === targetRefId,
  );
  if (matches.length === 0) return null;
  return matches.sort((a, b) => b.exposureWeight - a.exposureWeight)[0];
}

/**
 * Same lookup as getActiveBoostForTarget, additionally scoped to one
 * DiscoveryBoostTarget kind — a ref can hold multiple simultaneous boosts
 * across different targets (e.g. "profile" + "video_shuffle"); callers that
 * care about a specific surface's boost (not just whichever has the highest
 * exposureWeight overall) must use this, not getActiveBoostForTarget.
 * (§Revenue Activation Sprint — Video Shuffle delivery-side fix, reconciled
 * forward into this real/live engine file.)
 */
export function getActiveBoostForTargetAndKind(
  targetRefId: string,
  target: DiscoveryBoostTarget,
  nowMs: number = Date.now(),
): DiscoveryBoostRecord | null {
  const matches = listActiveDiscoveryBoosts(nowMs).filter(
    (r) => r.targetRefId === targetRefId && r.target === target,
  );
  if (matches.length === 0) return null;
  return matches.sort((a, b) => b.exposureWeight - a.exposureWeight)[0];
}

export function getBoostDeliveryTelemetry(
  ownerId?: string,
  nowMs: number = Date.now(),
): {
  activeCount: number;
  activeBoostCount: number;
  expiredBoostCount: number;
  refundedBoostCount: number;
  totalRevenueCents: number;
  totalSpendCents: number;
  totalImpressionsDelivered: number;
  totalClicksDelivered: number;
  byTarget: Record<string, { activeCount: number; revenueCents: number; impressions: number }>;
} {
  hydrateDiscoveryBoostsFromDurable();
  purgeExpiredDiscoveryBoosts(nowMs);
  const allForScope = [...boostsById.values()].filter((r) =>
    ownerId ? r.ownerId === ownerId : true,
  );
  const active = allForScope.filter((r) => r.fulfillmentStatus === "ACTIVE" && r.expiresAtMs > nowMs);
  const expiredBoostCount = allForScope.filter((r) => r.fulfillmentStatus === "EXPIRED").length;
  const refundedBoostCount = allForScope.filter((r) => r.fulfillmentStatus === "REFUNDED").length;
  const byTarget: Record<string, { activeCount: number; revenueCents: number; impressions: number }> = {};
  let totalRevenueCents = 0;
  let totalImpressionsDelivered = 0;
  let totalClicksDelivered = 0;
  for (const b of allForScope) {
    if (b.fulfillmentStatus === "REFUNDED") continue;
    totalRevenueCents += b.priceCents;
    totalImpressionsDelivered += b.impressionsDelivered;
    totalClicksDelivered += b.clicksDelivered;
    const isActive = b.fulfillmentStatus === "ACTIVE" && b.expiresAtMs > nowMs;
    const slot = byTarget[b.target] ?? { activeCount: 0, revenueCents: 0, impressions: 0 };
    if (isActive) slot.activeCount += 1;
    slot.revenueCents += b.priceCents;
    slot.impressions += b.impressionsDelivered;
    byTarget[b.target] = slot;
  }
  return {
    activeCount: active.length,
    activeBoostCount: active.length,
    expiredBoostCount,
    refundedBoostCount,
    totalRevenueCents,
    totalSpendCents: totalRevenueCents,
    totalImpressionsDelivered,
    totalClicksDelivered,
    byTarget,
  };
}

export function resetDiscoveryBoostsForTests(): void {
  assertIsolatedTestRuntimeOrThrow("resetDiscoveryBoostsForTests");
  boostsById.clear();
  hydratedFromDurable = true;
  flushDiscoveryBoostsToDurable();
}

/** Organic score × boost weight. Never invents base engagement. */
export function applyDiscoveryExposureWeight(
  organicScore: number,
  targetRefId: string,
  nowMs: number = Date.now(),
): { weighted: number; promoted: boolean; boost: DiscoveryBoostRecord | null } {
  const boost = getActiveBoostForTarget(targetRefId, nowMs);
  if (!boost) {
    return { weighted: organicScore, promoted: false, boost: null };
  }
  return {
    weighted: organicScore * boost.exposureWeight,
    promoted: true,
    boost,
  };
}

export function buildDiscoveryBoostCheckoutMetadata(input: {
  ownerId: string;
  ownerRole: "performer" | "venue" | "fan";
  target: DiscoveryBoostTarget;
  targetRefId: string;
  tier: DiscoveryBoostTier;
}): Record<string, string> {
  return {
    type: "discovery_boost",
    ownerId: input.ownerId,
    ownerRole: input.ownerRole,
    target: input.target,
    targetRefId: input.targetRefId,
    tier: input.tier,
    stripeKey: resolveDiscoveryBoostStripeKey(input.tier, input.target),
  };
}
