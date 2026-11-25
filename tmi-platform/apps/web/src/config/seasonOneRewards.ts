// Season 1 rewards config — Issue 1 Guitar / Fretboard
// Instrument identity lives in SeasonPassInstrumentEngine (issue axis).
// Role axis is Fan vs Performer. Do not hardcode this list in pricing JSX.

import type { SeasonPassPricingRole } from "@/lib/season/SeasonPassEligibility";

export type SeasonTrack = "fan" | "artist" | "shared";
export type SeasonRewardPool = "shared" | "fan" | "performer";
export type SeasonRewardGrantKind =
  | "cosmetic"
  | "boost_credit"
  | "promotion_credit"
  | "yopho_contract"
  | "effect_future";
export type SeasonRewardOwnershipAuthority =
  | "avatarInventoryEngine"
  | "PromotionSlotEngine"
  | "videoBoostEligibility"
  | "VenueSkinCommerce"
  | "OwnershipRuntime"
  | "yopho_reward_contract"
  | "OWNER_VALUE_REQUIRED";
export type SeasonRewardProgressState = "LOCKED" | "NEXT" | "EARNED";

export type SeasonRewardVariant = {
  variantId: string;
  label: string;
  colorway?: string;
  finish?: string;
};

export type SeasonOneReward = {
  id: string;
  track: SeasonTrack;
  pool: SeasonRewardPool;
  tier: number;
  fret: number;
  xpRequired: number;
  icon: string;
  title: string;
  description: string;
  promotionCredits?: number;
  boostCredits?: number;
  grantKind: SeasonRewardGrantKind;
  ownershipAuthority: SeasonRewardOwnershipAuthority;
  variants?: SeasonRewardVariant[];
  isLimited: boolean;
  note?: string;
};

export const SEASON_ONE_REWARDS: SeasonOneReward[] = [
  {
    id: "shared-t1-lounge-lamp",
    track: "shared",
    pool: "shared",
    tier: 1,
    fret: 1,
    xpRequired: 80,
    icon: "🛋️",
    title: "Neon Lounge Lamp",
    description: "Shared lounge decor both Fan and Performer can place where lounge customization is authorized.",
    grantKind: "cosmetic",
    ownershipAuthority: "OwnershipRuntime",
    variants: [
      { variantId: "lounge-lamp-cyan", label: "Cyan", colorway: "cyan", finish: "neon" },
      { variantId: "lounge-lamp-gold", label: "Gold", colorway: "gold", finish: "metallic" },
    ],
    isLimited: false,
  },
  {
    id: "shared-t2-yopho-frame",
    track: "shared",
    pool: "shared",
    tier: 2,
    fret: 3,
    xpRequired: 280,
    icon: "🃏",
    title: "Issue 1 YoPho Card Frame",
    description: "YoPho cosmetic contract — 5:7 trading card and 1:1 album safe. Cursor YoPho lane remains untouched.",
    grantKind: "yopho_contract",
    ownershipAuthority: "yopho_reward_contract",
    variants: [
      { variantId: "yopho-frame-matte", label: "Matte Midnight", finish: "matte" },
      { variantId: "yopho-frame-glow", label: "Fret Glow", finish: "glow" },
    ],
    isLimited: true,
    note: "YOPHO_LANE_UNTOUCHED",
  },
  {
    id: "shared-t3-venue-accent",
    track: "shared",
    pool: "shared",
    tier: 3,
    fret: 6,
    xpRequired: 650,
    icon: "🎤",
    title: "Neon Club Go Live Accent",
    description: "Environment accent from the existing Season Pass venue-skin list (neon-club).",
    grantKind: "cosmetic",
    ownershipAuthority: "VenueSkinCommerce",
    isLimited: false,
  },

  {
    id: "fan-t1-shades",
    track: "fan",
    pool: "fan",
    tier: 1,
    fret: 2,
    xpRequired: 100,
    icon: "🕶️",
    title: "Neon Chico Shades",
    description: "Iridescent cyan shades for your avatar — Season 1 Fan exclusive.",
    grantKind: "cosmetic",
    ownershipAuthority: "avatarInventoryEngine",
    variants: [
      { variantId: "shades-cyan", label: "Cyan", colorway: "cyan", finish: "iridescent" },
      { variantId: "shades-violet", label: "Violet", colorway: "violet", finish: "matte" },
    ],
    isLimited: true,
  },
  {
    id: "fan-t2-action-icon",
    track: "fan",
    pool: "fan",
    tier: 2,
    fret: 4,
    xpRequired: 300,
    icon: "⚡",
    title: "Stage Rush Action Icon",
    description: "Animated lightning icon that fires when you react in a live room.",
    grantKind: "cosmetic",
    ownershipAuthority: "avatarInventoryEngine",
    isLimited: false,
  },
  {
    id: "fan-t3-companion",
    track: "fan",
    pool: "fan",
    tier: 3,
    fret: 7,
    xpRequired: 700,
    icon: "🤖",
    title: "TMI Breathing Companion Bot",
    description: "A personalised bot buddy that pulses on stage next to your seat.",
    grantKind: "cosmetic",
    ownershipAuthority: "avatarInventoryEngine",
    isLimited: false,
  },
  {
    id: "fan-t4-spin-emote",
    track: "fan",
    pool: "fan",
    tier: 4,
    fret: 10,
    xpRequired: 1500,
    icon: "💎",
    title: "Lorenzo Diamond Spin Emote",
    description: "Diamond spinning emote — fires a gold-and-cyan burst in chat.",
    grantKind: "cosmetic",
    ownershipAuthority: "avatarInventoryEngine",
    isLimited: true,
  },

  {
    id: "artist-t1-billboard",
    track: "artist",
    pool: "performer",
    tier: 1,
    fret: 2,
    xpRequired: 150,
    icon: "📋",
    title: "30-Min Billboard Promo Push",
    description: "Your name appears on the Live World billboard for 30 continuous minutes.",
    promotionCredits: 30,
    grantKind: "promotion_credit",
    ownershipAuthority: "PromotionSlotEngine",
    isLimited: false,
  },
  {
    id: "artist-t1-video-boost",
    track: "artist",
    pool: "performer",
    tier: 1,
    fret: 3,
    xpRequired: 180,
    icon: "📡",
    title: "Earned Video Boost Credit",
    description: "Performer-only earned credit against the existing Video Boost / PromotionSlotEngine authority. Not a Stripe purchase.",
    boostCredits: 1,
    grantKind: "boost_credit",
    ownershipAuthority: "videoBoostEligibility",
    isLimited: false,
    note: "VIDEO_BOOST_LEDGER = FUTURE — grant boundary only; no second boost engine.",
  },
  {
    id: "artist-t2-bandwidth",
    track: "artist",
    pool: "performer",
    tier: 2,
    fret: 5,
    xpRequired: 400,
    icon: "📡",
    title: "HD WebRTC Bandwidth Key",
    description: "Unlocks 1080p stream quality upgrade for your next 3 live sessions.",
    promotionCredits: 0,
    grantKind: "promotion_credit",
    ownershipAuthority: "OWNER_VALUE_REQUIRED",
    isLimited: false,
  },
  {
    id: "artist-t3-liveworld",
    track: "artist",
    pool: "performer",
    tier: 3,
    fret: 8,
    xpRequired: 900,
    icon: "🌍",
    title: "2-Hour Live World Promo Burst",
    description: "Featured placement in the Live World lobby for 2 hours — maximum visibility.",
    promotionCredits: 120,
    grantKind: "promotion_credit",
    ownershipAuthority: "PromotionSlotEngine",
    isLimited: false,
  },
  {
    id: "artist-t4-magazine",
    track: "artist",
    pool: "performer",
    tier: 4,
    fret: 11,
    xpRequired: 2000,
    icon: "🎤",
    title: "Monthly Magazine Feature",
    description: "Full artist feature article on TMI Magazine — your story, your stage.",
    promotionCredits: 0,
    grantKind: "promotion_credit",
    ownershipAuthority: "OWNER_VALUE_REQUIRED",
    isLimited: true,
  },
  {
    id: "artist-t5-fireball",
    track: "artist",
    pool: "performer",
    tier: 5,
    fret: 12,
    xpRequired: 2800,
    icon: "🔥",
    title: "Live Fireball Action Effect",
    description: "Reserved Performer HUD / action-button effect. No canonical fireball asset exists yet — not presented as wired.",
    grantKind: "effect_future",
    ownershipAuthority: "OWNER_VALUE_REQUIRED",
    isLimited: true,
    note: "LIVE_FIREBALL_ASSET = MISSING — do not fake the effect.",
  },
];

export const SEASON_ONE_META = {
  seasonId: "s1",
  seasonNumber: 1,
  seasonName: "The Rise",
  instrument: "guitar" as const,
  instrumentEmoji: "🎸",
  primaryColor: "#AA2DFF",
  accentColor: "#FFD700",
  startDate: "2026-04-01",
  endDate: "2027-03-31",
  maxTier: 5,
  xpForMaxTier: 5000,
};

/** Future issue instruments stay configurable. Existing engine shells are drafts, not Owner-locked Issue 2+ law. */
export const SEASON_PASS_FUTURE_ISSUE_STATUS = "DRAFT_SHELL_ONLY" as const;

export function resolveSeasonPassRewards(
  issueId: string,
  role: SeasonPassPricingRole,
): SeasonOneReward[] {
  if (issueId !== SEASON_ONE_META.seasonId) return [];
  const track = role === "fan" ? "fan" : "artist";
  return SEASON_ONE_REWARDS.filter((reward) => reward.track === "shared" || reward.track === track);
}

export function presentSeasonPassRewardState(
  reward: SeasonOneReward,
  roleRewards: SeasonOneReward[],
): SeasonRewardProgressState {
  const first = roleRewards[0];
  if (first && reward.id === first.id) return "NEXT";
  return "LOCKED";
}
