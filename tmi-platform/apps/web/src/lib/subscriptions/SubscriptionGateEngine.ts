import type { AccountType, SubscriptionTier } from "./SubscriptionPricingEngine";
import { getTierBenefits } from "./SubscriptionPricingEngine";

// ─── Types ────────────────────────────────────────────────────────────────────

export type FeatureKey =
  | "live_rooms"
  | "tips"
  | "nft_selling"
  | "beat_selling"
  | "booking"
  | "article_page"
  | "meet_greet"
  | "early_tickets"
  | "exclusive_giveaways"
  | "game_perks"
  | "private_feeds"
  | "vote_boost";

export type GateResult = {
  allowed: boolean;
  feature: FeatureKey;
  currentTier: SubscriptionTier;
  requiredTier?: SubscriptionTier;
  upgradePrompt?: string;
};

export type TrialState = {
  accountType: AccountType;
  trialEndsMs: number;
  trialTier: SubscriptionTier;
  active: boolean;
};

// ─── Minimum tier per feature ─────────────────────────────────────────────────

const CREATOR_FEATURE_GATE: Record<FeatureKey, SubscriptionTier> = {
  live_rooms:          "pro",
  tips:                "pro",
  nft_selling:         "pro",
  beat_selling:        "pro",
  booking:             "pro",
  article_page:        "pro",
  meet_greet:          "pro",
  early_tickets:       "bronze",
  exclusive_giveaways: "bronze",
  game_perks:          "gold",
  private_feeds:       "pro",
  vote_boost:          "pro",
};

const FAN_FEATURE_GATE: Record<FeatureKey, SubscriptionTier> = {
  live_rooms:          "free",
  tips:                "pro",
  nft_selling:         "diamond",  // fans can't sell NFTs below diamond
  beat_selling:        "diamond",
  booking:             "diamond",
  article_page:        "diamond",
  meet_greet:          "pro",
  early_tickets:       "pro",
  exclusive_giveaways: "pro",
  game_perks:          "pro",
  private_feeds:       "pro",
  vote_boost:          "pro",
};

const TIER_ORDER: SubscriptionTier[] = ["free", "pro", "bronze", "gold", "platinum", "diamond"];

function tierIndex(tier: SubscriptionTier): number {
  return TIER_ORDER.indexOf(tier);
}

const UPGRADE_PROMPTS: Record<FeatureKey, string> = {
  live_rooms:          "Upgrade to Pro to join live rooms.",
  tips:                "Upgrade to Pro to send and receive tips.",
  nft_selling:         "Upgrade to Pro to sell NFTs on TMI.",
  beat_selling:        "Upgrade to Pro to list beats in the store.",
  booking:             "Upgrade to Pro to unlock booking eligibility.",
  article_page:        "Upgrade to Pro to publish your artist article.",
  meet_greet:          "Upgrade to Pro to book meet & greet sessions.",
  early_tickets:       "Upgrade to Bronze for early ticket access.",
  exclusive_giveaways: "Upgrade to Bronze for exclusive giveaway entries.",
  game_perks:          "Upgrade to Gold for game perks and bonuses.",
  private_feeds:       "Upgrade to Pro to access private feeds.",
  vote_boost:          "Upgrade to Pro for a vote multiplier boost.",
};

// ─── Trial registry ───────────────────────────────────────────────────────────

const trialRegistry = new Map<string, TrialState>();

// ─── Public API ───────────────────────────────────────────────────────────────

export function checkFeatureGate(
  accountType: AccountType,
  currentTier: SubscriptionTier,
  feature: FeatureKey,
): GateResult {
  const gateMap = accountType === "fan" ? FAN_FEATURE_GATE : CREATOR_FEATURE_GATE;
  const requiredTier = gateMap[feature];
  const allowed = tierIndex(currentTier) >= tierIndex(requiredTier);

  return {
    allowed,
    feature,
    currentTier,
    requiredTier: allowed ? undefined : requiredTier,
    upgradePrompt: allowed ? undefined : UPGRADE_PROMPTS[feature],
  };
}

export function checkAllGates(
  accountType: AccountType,
  currentTier: SubscriptionTier,
): Record<FeatureKey, GateResult> {
  const features: FeatureKey[] = [
    "live_rooms", "tips", "nft_selling", "beat_selling", "booking",
    "article_page", "meet_greet", "early_tickets", "exclusive_giveaways",
    "game_perks", "private_feeds", "vote_boost",
  ];
  const result = {} as Record<FeatureKey, GateResult>;
  for (const f of features) {
    result[f] = checkFeatureGate(accountType, currentTier, f);
  }
  return result;
}

export function getVoteMultiplier(accountType: AccountType, tier: SubscriptionTier): number {
  return getTierBenefits(accountType, tier).voteMultiplier;
}

export function startTrial(
  userId: string,
  accountType: AccountType,
  trialTier: SubscriptionTier,
  durationMs: number = 7 * 24 * 60 * 60 * 1000,  // 7 days
): TrialState {
  const state: TrialState = {
    accountType,
    trialEndsMs: Date.now() + durationMs,
    trialTier,
    active: true,
  };
  trialRegistry.set(userId, state);
  return state;
}

export function getTrialState(userId: string): TrialState | null {
  const state = trialRegistry.get(userId);
  if (!state) return null;
  if (Date.now() > state.trialEndsMs) {
    state.active = false;
  }
  return state;
}

export function getEffectiveTier(
  userId: string,
  baseTier: SubscriptionTier,
): SubscriptionTier {
  const trial = getTrialState(userId);
  if (trial?.active && tierIndex(trial.trialTier) > tierIndex(baseTier)) {
    return trial.trialTier;
  }
  return baseTier;
}
