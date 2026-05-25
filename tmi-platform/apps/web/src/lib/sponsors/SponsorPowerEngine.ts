/**
 * SponsorPowerEngine
 * Money-powered progression system for performers.
 * Parallel to XP — separate track, separate status.
 *
 * Score formula (Option B):
 *   sponsorScore = (totalRevenueDollars * 0.6) + (sponsorCount * 50 * 0.3) + (retentionDays * 2 * 0.1)
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type SponsorTier =
  | "NONE"
  | "BRONZE"
  | "SILVER"
  | "GOLD"
  | "PLATINUM"
  | "DIAMOND"
  | "ELITE";

export interface SponsorTierDef {
  tier: SponsorTier;
  label: string;
  minScore: number;
  maxScore: number;
  color: string;
  icon: string;
  badge: string;
}

export interface SponsorUnlock {
  id: string;
  label: string;
  description: string;
  requiredTier?: SponsorTier;
  requiredSponsors?: number;
  requiredRevenueDollars?: number;
}

export interface SponsorPowerInput {
  totalRevenueCents: number;
  sponsorCount: number;
  retentionDays?: number;
}

export interface SponsorPowerState {
  score: number;
  tier: SponsorTierDef;
  nextTier: SponsorTierDef | null;
  pctToNextTier: number;
  activeUnlocks: SponsorUnlock[];
  nextUnlock: SponsorUnlock | null;
  xpGrant: number;
  microGoal: string | null;
  totalRevenueDollars: number;
  sponsorCount: number;
}

// ─── Tier table ──────────────────────────────────────────────────────────────

export const SPONSOR_TIERS: SponsorTierDef[] = [
  { tier: "NONE",     label: "Unsponsored",             minScore: 0,    maxScore: 9,    color: "#555",    icon: "○",  badge: "" },
  { tier: "BRONZE",   label: "Bronze Sponsored",        minScore: 10,   maxScore: 49,   color: "#CD7F32", icon: "🥉", badge: "BRONZE" },
  { tier: "SILVER",   label: "Silver Sponsored",        minScore: 50,   maxScore: 149,  color: "#C0C0C0", icon: "🥈", badge: "SILVER" },
  { tier: "GOLD",     label: "Gold Sponsored",          minScore: 150,  maxScore: 299,  color: "#FFD700", icon: "🥇", badge: "GOLD" },
  { tier: "PLATINUM", label: "Platinum Sponsored",      minScore: 300,  maxScore: 599,  color: "#E5E4E2", icon: "⚡", badge: "PLATINUM" },
  { tier: "DIAMOND",  label: "Diamond Sponsored",       minScore: 600,  maxScore: 1199, color: "#AA2DFF", icon: "💎", badge: "DIAMOND" },
  { tier: "ELITE",    label: "Elite Sponsored Performer", minScore: 1200, maxScore: Infinity, color: "#00C8FF", icon: "👑", badge: "ELITE" },
];

// ─── Unlock table ─────────────────────────────────────────────────────────────

export const SPONSOR_UNLOCKS: SponsorUnlock[] = [
  {
    id: "contest_entry",
    label: "Contest Entry",
    description: "Eligible to enter sponsored contests",
    requiredTier: "SILVER",
    requiredSponsors: 3,
  },
  {
    id: "homepage_boost",
    label: "Homepage Boost",
    description: "Auto-featured in homepage rotation tiles",
    requiredTier: "GOLD",
  },
  {
    id: "stage_priority",
    label: "Stage Priority",
    description: "Front row and main stage placement in live rooms",
    requiredTier: "PLATINUM",
  },
  {
    id: "premium_tips",
    label: "Premium Tip Visibility",
    description: "Tips appear larger and pinned in live chat",
    requiredTier: "GOLD",
  },
  {
    id: "battle_spotlight",
    label: "Battle Spotlight",
    description: "Auto-listed for battle spotlight placement",
    requiredTier: "DIAMOND",
  },
  {
    id: "featured_artist",
    label: "Featured Artist",
    description: "Eligible for magazine feature and homepage billboard",
    requiredTier: "DIAMOND",
  },
];

// ─── Core calculation ─────────────────────────────────────────────────────────

export function calculateSponsorScore(input: SponsorPowerInput): number {
  const revenueDollars = input.totalRevenueCents / 100;
  const retention = input.retentionDays ?? 0;
  const score = revenueDollars * 0.6 + input.sponsorCount * 50 * 0.3 + retention * 2 * 0.1;
  return Math.floor(score);
}

export function getTierForScore(score: number): SponsorTierDef {
  for (let i = SPONSOR_TIERS.length - 1; i >= 0; i--) {
    if (score >= SPONSOR_TIERS[i].minScore) return SPONSOR_TIERS[i];
  }
  return SPONSOR_TIERS[0];
}

export function getActiveUnlocks(tier: SponsorTier, sponsorCount: number): SponsorUnlock[] {
  const tierOrder: SponsorTier[] = ["NONE", "BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND", "ELITE"];
  const tierIndex = tierOrder.indexOf(tier);

  return SPONSOR_UNLOCKS.filter(u => {
    const tierMet = u.requiredTier ? tierOrder.indexOf(u.requiredTier) <= tierIndex : true;
    const sponsorsMet = u.requiredSponsors ? sponsorCount >= u.requiredSponsors : true;
    return tierMet && sponsorsMet;
  });
}

function buildMicroGoal(
  score: number,
  tier: SponsorTierDef,
  nextTier: SponsorTierDef | null,
  sponsorCount: number,
  activeUnlocks: SponsorUnlock[],
): string | null {
  // Next unlock not yet achieved?
  const nextLock = SPONSOR_UNLOCKS.find(u => !activeUnlocks.find(a => a.id === u.id));
  if (nextLock?.requiredSponsors && sponsorCount < nextLock.requiredSponsors) {
    const need = nextLock.requiredSponsors - sponsorCount;
    return `${need} more sponsor${need > 1 ? "s" : ""} → ${nextLock.label}`;
  }

  // Revenue gap to next tier?
  if (nextTier) {
    const gapScore = nextTier.minScore - score;
    // Approx dollars needed (0.6 weight dominant)
    const dollarGap = Math.ceil(gapScore / 0.6);
    return `$${dollarGap} more → ${nextTier.label}`;
  }

  return null;
}

// ─── Main entry point ─────────────────────────────────────────────────────────

export function getSponsorPowerState(input: SponsorPowerInput): SponsorPowerState {
  const score = calculateSponsorScore(input);
  const tier = getTierForScore(score);
  const tierIndex = SPONSOR_TIERS.indexOf(tier);
  const nextTier = tierIndex < SPONSOR_TIERS.length - 1 ? SPONSOR_TIERS[tierIndex + 1] : null;

  const pctToNextTier = nextTier
    ? Math.min(100, Math.floor(((score - tier.minScore) / (nextTier.minScore - tier.minScore)) * 100))
    : 100;

  const activeUnlocks = getActiveUnlocks(tier.tier, input.sponsorCount);
  const nextUnlock = SPONSOR_UNLOCKS.find(u => !activeUnlocks.find(a => a.id === u.id)) ?? null;

  const microGoal = buildMicroGoal(score, tier, nextTier, input.sponsorCount, activeUnlocks);

  // XP grant: $1 = 10 XP, each sponsor slot = 200 XP
  const xpGrant = Math.floor(input.totalRevenueCents / 100) * 10 + input.sponsorCount * 200;

  return {
    score,
    tier,
    nextTier,
    pctToNextTier,
    activeUnlocks,
    nextUnlock,
    xpGrant,
    microGoal,
    totalRevenueDollars: input.totalRevenueCents / 100,
    sponsorCount: input.sponsorCount,
  };
}

// ─── XP delta for a single new sponsor event ─────────────────────────────────
// Call this when a sponsor payment lands — pass to xpEngine.grantXP separately

export function getSponsorXPGrant(amountCents: number): number {
  return Math.floor(amountCents / 100) * 10 + 200; // dollars * 10 + slot bonus
}
