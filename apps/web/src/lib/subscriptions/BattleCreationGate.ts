// Battle Creation Gate — governs who can start sessions vs join-only
// Rule 38: Silver+ creates Battle, Challenge, Cypher, Lounge, and Mini Dance Party
// Free / Pro / RUBY = join-only (0 creation slots)
// SSR-safe — pure functions, no side effects

import type { SubscriptionTier } from "./SubscriptionPricingEngine";

// ── Tier index mirrors SubscriptionGateEngine ─────────────────────────────────

const TIER_ORDER: SubscriptionTier[] = ["free", "pro", "RUBY", "silver", "gold", "platinum", "diamond"];

export function tierIndex(t: SubscriptionTier): number {
  return TIER_ORDER.indexOf(t);
}

// ── Creation limits per tier (Rule 38: Silver+) ───────────────────────────────

export const RULE_38_CREATION_TIER: SubscriptionTier = "silver";
export const BATTLE_CREATION_TIER: SubscriptionTier = "silver";
export const CYPHER_CREATION_TIER: SubscriptionTier = "silver";
export const CHALLENGE_CREATION_TIER: SubscriptionTier = "silver";
export const LOUNGE_CREATION_TIER: SubscriptionTier = "silver";
export const DANCE_PARTY_CREATION_TIER: SubscriptionTier = "silver";

const MAX_CONCURRENT_BY_TIER: Record<SubscriptionTier, number> = {
  free:     0,
  pro:      0,
  RUBY:   0,
  silver:   1,
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
    reason: "Battle creation requires Silver membership",
    requiredTier: BATTLE_CREATION_TIER,
    upgradePrompt: "Upgrade to Silver to start your own battles and earn from every vote.",
  };
}

export function canCreateCypher(tier: SubscriptionTier): CreationGateResult {
  const allowed = tierIndex(tier) >= tierIndex(CYPHER_CREATION_TIER);
  if (allowed) return { allowed: true };
  return {
    allowed: false,
    reason: "Cypher creation requires Silver membership",
    requiredTier: CYPHER_CREATION_TIER,
    upgradePrompt: "Upgrade to Silver to host your own cypher sessions.",
  };
}

export function canCreateChallenge(tier: SubscriptionTier): CreationGateResult {
  const allowed = tierIndex(tier) >= tierIndex(CHALLENGE_CREATION_TIER);
  if (allowed) return { allowed: true };
  return {
    allowed: false,
    reason: "Challenge creation requires Silver membership",
    requiredTier: CHALLENGE_CREATION_TIER,
    upgradePrompt: "Upgrade to Silver to host your own challenges.",
  };
}

export function canCreateLounge(tier: SubscriptionTier): CreationGateResult {
  const allowed = tierIndex(tier) >= tierIndex(LOUNGE_CREATION_TIER);
  if (allowed) return { allowed: true };
  return {
    allowed: false,
    reason: "Lounge creation requires Silver membership",
    requiredTier: LOUNGE_CREATION_TIER,
    upgradePrompt: "Upgrade to Silver to host your own lounges.",
  };
}

export function canCreateDanceParty(tier: SubscriptionTier): CreationGateResult {
  const allowed = tierIndex(tier) >= tierIndex(DANCE_PARTY_CREATION_TIER);
  if (allowed) return { allowed: true };
  return {
    allowed: false,
    reason: "Dance party creation requires Silver membership",
    requiredTier: DANCE_PARTY_CREATION_TIER,
    upgradePrompt: "Upgrade to Silver to host your own dance parties.",
  };
}

const RULE_38_CATEGORIES = new Set([
  "battle",
  "battles",
  "challenge",
  "challenges",
  "cypher",
  "cyphers",
  "lounge",
  "lounges",
  "dance-party",
  "dance",
]);

export function isRule38Experience(category?: string | null): boolean {
  if (!category) return false;
  const c = category.toLowerCase().trim().replace(/_/g, "-");
  return RULE_38_CATEGORIES.has(c);
}

export function canCreateRule38Experience(category: string, tier: SubscriptionTier): CreationGateResult {
  const c = (category ?? "").toLowerCase().trim().replace(/_/g, "-");
  if (c === "battle" || c === "battles") return canCreateBattle(tier);
  if (c === "cypher" || c === "cyphers") return canCreateCypher(tier);
  if (c === "challenge" || c === "challenges") return canCreateChallenge(tier);
  if (c === "lounge" || c === "lounges") return canCreateLounge(tier);
  if (c === "dance-party" || c === "dance") return canCreateDanceParty(tier);

  const allowed = tierIndex(tier) >= tierIndex(RULE_38_CREATION_TIER);
  if (allowed) return { allowed: true };
  return {
    allowed: false,
    reason: "Room creation requires Silver membership",
    requiredTier: RULE_38_CREATION_TIER,
    upgradePrompt: "Upgrade to Silver to start your own live room sessions.",
  };
}

export function maxConcurrentSessions(tier: SubscriptionTier): number {
  return MAX_CONCURRENT_BY_TIER[tier] ?? 0;
}

export function canCreateMoreSessions(tier: SubscriptionTier, activeSessions: number): CreationGateResult {
  const max = maxConcurrentSessions(tier);
  if (max === 0) return { allowed: false, reason: "Join-only on your current tier", requiredTier: BATTLE_CREATION_TIER, upgradePrompt: "Upgrade to Silver to host sessions." };
  if (activeSessions < max) return { allowed: true };
  return {
    allowed: false,
    reason: `Session limit reached (${max} active)`,
    upgradePrompt: tier === "silver" ? "Upgrade to Gold for more concurrent sessions." : tier === "gold" ? "Upgrade to Platinum for more concurrent sessions." : "Upgrade to Diamond for unlimited sessions.",
  };
}

export function isJoinOnly(tier: SubscriptionTier): boolean {
  return maxConcurrentSessions(tier) === 0;
}

