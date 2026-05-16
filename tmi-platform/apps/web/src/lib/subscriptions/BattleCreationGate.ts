// Battle Creation Gate — governs who can start sessions vs join-only
// Gold+ = create battles/cyphers with no limit
// Free / Pro / Bronze = join-only (0 creation slots)
// SSR-safe — pure functions, no side effects

import type { SubscriptionTier } from "./SubscriptionPricingEngine";

// ── Tier index mirrors SubscriptionGateEngine ─────────────────────────────────

const TIER_ORDER: SubscriptionTier[] = ["free", "pro", "bronze", "gold", "platinum", "diamond"];

function tierIndex(t: SubscriptionTier): number {
  return TIER_ORDER.indexOf(t);
}

// ── Creation limits per tier ──────────────────────────────────────────────────

const BATTLE_CREATION_TIER: SubscriptionTier = "gold";
const CYPHER_CREATION_TIER: SubscriptionTier = "gold";

const MAX_CONCURRENT_BY_TIER: Record<SubscriptionTier, number> = {
  free:     0,
  pro:      0,
  bronze:   0,
  gold:     3,
  platinum: 6,
  diamond:  Infinity,
};

// ── Public API ────────────────────────────────────────────────────────────────

export type CreationGateResult = {
  allowed: boolean;
  reason?: string;
  requiredTier?: SubscriptionTier;
  upgradePrompt?: string;
};

export function canCreateBattle(tier: SubscriptionTier): CreationGateResult {
  const allowed = tierIndex(tier) >= tierIndex(BATTLE_CREATION_TIER);
  if (allowed) return { allowed: true };
  return {
    allowed: false,
    reason: "Battle creation requires Gold membership",
    requiredTier: BATTLE_CREATION_TIER,
    upgradePrompt: "Upgrade to Gold to start your own battles and earn from every vote.",
  };
}

export function canCreateCypher(tier: SubscriptionTier): CreationGateResult {
  const allowed = tierIndex(tier) >= tierIndex(CYPHER_CREATION_TIER);
  if (allowed) return { allowed: true };
  return {
    allowed: false,
    reason: "Cypher creation requires Gold membership",
    requiredTier: CYPHER_CREATION_TIER,
    upgradePrompt: "Upgrade to Gold to host your own cypher sessions.",
  };
}

export function maxConcurrentSessions(tier: SubscriptionTier): number {
  return MAX_CONCURRENT_BY_TIER[tier] ?? 0;
}

export function canCreateMoreSessions(tier: SubscriptionTier, activeSessions: number): CreationGateResult {
  const max = maxConcurrentSessions(tier);
  if (max === 0) return { allowed: false, reason: "Join-only on your current tier", requiredTier: BATTLE_CREATION_TIER, upgradePrompt: "Upgrade to Gold to host sessions." };
  if (activeSessions < max) return { allowed: true };
  return {
    allowed: false,
    reason: `Session limit reached (${max} active)`,
    upgradePrompt: tier === "gold" ? "Upgrade to Platinum for more concurrent sessions." : "Upgrade to Diamond for unlimited sessions.",
  };
}

export function isJoinOnly(tier: SubscriptionTier): boolean {
  return maxConcurrentSessions(tier) === 0;
}
