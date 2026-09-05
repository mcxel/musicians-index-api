/**
 * DiscoveryBoostEngine — self-serve discovery/promotion boosts (Rule 20).
 * Paid exposure weight only — never fabricates views, follows, or engagement.
 * Complements LobbyWallBoostEngine (tile visibility); this elevates profile/show/booking cards.
 */

export type DiscoveryBoostTier = "spark" | "pulse" | "wave" | "blast";

export type DiscoveryBoostTarget =
  | "profile"
  | "upcoming_show"
  | "mini_concert"
  | "world_concert"
  | "release"
  | "venue"
  | "booking_availability"
  | "merch";

export interface DiscoveryBoostProduct {
  tier: DiscoveryBoostTier;
  stripeKey:
    | "DISCOVERY_BOOST_SPARK"
    | "DISCOVERY_BOOST_PULSE"
    | "DISCOVERY_BOOST_WAVE"
    | "DISCOVERY_BOOST_BLAST";
  label: string;
  priceCents: number;
  durationHours: number;
  /** Multiplier applied to organic discovery sort weight (does not rewrite rank). */
  exposureWeight: number;
}

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

export interface DiscoveryBoostRecord {
  id: string;
  ownerId: string;
  ownerRole: "performer" | "venue";
  target: DiscoveryBoostTarget;
  targetRefId: string;
  tier: DiscoveryBoostTier;
  exposureWeight: number;
  startedAtMs: number;
  expiresAtMs: number;
  stripeSessionId: string | null;
  label: string;
}

const boostsById = new Map<string, DiscoveryBoostRecord>();

function genId(): string {
  return `dbst-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getBoostProduct(tier: DiscoveryBoostTier): DiscoveryBoostProduct {
  const found = DISCOVERY_BOOST_CATALOG.find((p) => p.tier === tier);
  if (!found) return DISCOVERY_BOOST_CATALOG[0];
  return found;
}

export function purgeExpiredDiscoveryBoosts(nowMs: number = Date.now()): number {
  let removed = 0;
  for (const [id, rec] of [...boostsById.entries()]) {
    if (rec.expiresAtMs <= nowMs) {
      boostsById.delete(id);
      removed += 1;
    }
  }
  return removed;
}

export function recordDiscoveryBoost(input: {
  ownerId: string;
  ownerRole: "performer" | "venue";
  target: DiscoveryBoostTarget;
  targetRefId: string;
  tier: DiscoveryBoostTier;
  stripeSessionId?: string | null;
  startedAtMs?: number;
}): DiscoveryBoostRecord {
  purgeExpiredDiscoveryBoosts();
  const product = getBoostProduct(input.tier);
  const startedAtMs = input.startedAtMs ?? Date.now();
  const record: DiscoveryBoostRecord = {
    id: genId(),
    ownerId: input.ownerId,
    ownerRole: input.ownerRole,
    target: input.target,
    targetRefId: input.targetRefId,
    tier: input.tier,
    exposureWeight: product.exposureWeight,
    startedAtMs,
    expiresAtMs: startedAtMs + product.durationHours * 60 * 60 * 1000,
    stripeSessionId: input.stripeSessionId ?? null,
    label: product.label,
  };
  boostsById.set(record.id, record);
  return record;
}

export function listActiveDiscoveryBoosts(
  nowMs: number = Date.now(),
): DiscoveryBoostRecord[] {
  purgeExpiredDiscoveryBoosts(nowMs);
  return [...boostsById.values()].filter((r) => r.expiresAtMs > nowMs);
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
  ownerRole: "performer" | "venue";
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
  };
}
