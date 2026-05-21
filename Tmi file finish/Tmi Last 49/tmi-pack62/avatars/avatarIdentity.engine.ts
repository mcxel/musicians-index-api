// apps/web/src/engines/avatars/avatarIdentity.engine.ts
// Bobblehead avatar system — stylized, consistent, platform-wide.
// User face → TMI-style bobblehead. One unified style everywhere.

export interface AvatarIdentity {
  userId: string;
  displayName: string;
  // Core visual
  skinTone: string;           // hex color
  hairColor: string;
  hairStyle: string;
  eyeColor: string;
  // Bobblehead proportions (locked — never change these)
  headScale: 1.6;             // always 1.6x body — the "bobble" look
  bodyScale: 1.0;
  // Style flags
  hasGlasses: boolean;
  hasAccessory: boolean;
  accessoryType?: string;
  // Items (earned/purchased)
  equippedItems: AvatarItem[];
  // Animation
  idleAnimation: string;
  reactionSet: string;
  // Location in room
  currentRoomId?: string;
  seatPosition?: string;      // "front_row_3" | "balcony_12" etc.
}

export interface AvatarItem {
  itemId: string;
  itemName: string;
  category: "hat" | "glasses" | "instrument" | "glow_stick" | "microphone" | "outfit_top" | "outfit_bottom" | "neon_effect" | "sponsor_badge" | "crown_effect" | "dance_shoes" | "headphones";
  attachmentPoint: "head" | "left_hand" | "right_hand" | "body" | "feet" | "aura";
  rarity: "common" | "uncommon" | "rare" | "legendary" | "seasonal";
  earnedVia: "points_purchase" | "achievement_unlock" | "subscription_reward" | "sponsor_gift" | "contest_prize" | "seasonal_drop";
  animates: boolean;
  neonColor?: string;
}

// ── LOCKED BOBBLEHEAD STYLE RULES ────────────────────────────────
// THESE MUST STAY CONSISTENT ACROSS THE ENTIRE PLATFORM
export const BOBBLEHEAD_STYLE_RULES = {
  HEAD_BODY_RATIO:     1.6,      // head is always 1.6× larger than body
  SKIN_SHADING_MODE:   "smooth_cinematic",
  LIGHTING_STYLE:      "soft_neon",  // matches TMI neon world
  EYE_SCALE:           1.3,      // slightly larger for animation readability
  TEXTURE_MODE:        "semi_glossy", // slight plastic/toy finish
  RENDER_STYLE:        "3d_stylized", // NOT hyper-realistic, NOT flat cartoon
  MIN_EXPRESSIONS:     8,        // happy, sad, shocked, laughing, cheering, booing, dancing, neutral
} as const;

// ── AVATAR REACTIONS ──────────────────────────────────────────────
export type AvatarReaction =
  | "cheer"    | "boo"    | "clap"
  | "laugh"    | "dance"  | "shocked"
  | "heart"    | "fire"   | "thumbsup"
  | "waving"   | "jumping"| "sitting_idle"
  | "standing_idle" | "singing_along";

// ── ROOM PRESENCE STATE ───────────────────────────────────────────
export interface RoomPresenceState {
  roomId: string;
  occupants: Array<{
    userId: string;
    avatar: AvatarIdentity;
    seatId?: string;
    reaction?: AvatarReaction;
    isVisible: boolean;          // performance reasons — LOD-based
    bubbleText?: string;         // emote bubble content
  }>;
  capacity: number;
  visibleCrowdSize: number;      // may differ from actual if large crowds use LOD
}

// ── ITEM ECONOMY ──────────────────────────────────────────────────
export const ITEM_ECONOMY = {
  POINTS_TO_ITEM_PRICES: {
    common:    100,
    uncommon:  250,
    rare:      500,
    legendary: 1000,
    seasonal:  750,
  },
  ACHIEVEMENT_UNLOCKS: [
    { achievement:"first_battle_win",    reward:"golden_microphone_item" },
    { achievement:"100_fans",            reward:"neon_crown_effect_item" },
    { achievement:"monday_survivor_x3",  reward:"bebo_referee_hat_item" },
    { achievement:"top_10_genre",        reward:"genre_champion_badge_item" },
  ],
  SUBSCRIPTION_MONTHLY_ITEMS: [
    "neon_aura_effect",
    "premium_seat_cushion",
    "exclusive_reaction_pack",
  ],
};

// ── SPONSOR INTEGRATION ───────────────────────────────────────────
export const SPONSOR_AVATAR_ITEMS = {
  // Sponsors can fund limited-edition items that display their branding
  // when equipped by an artist on stage
  EXAMPLE: {
    sponsorName: "Nike",
    itemId: "nike_air_sneakers_limited",
    itemName: "Nike Limited Edition Kicks",
    category: "outfit_bottom" as const,
    rarity: "seasonal" as const,
    earnedVia: "sponsor_gift" as const,
    animates: true,
    neonColor: "#FF6B00",
  },
};
