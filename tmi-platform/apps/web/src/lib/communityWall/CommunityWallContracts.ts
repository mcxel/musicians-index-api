/**
 * CommunityWallContracts — shared poster-wall foundation for
 * COMMUNITY GOSSIP and HAPPY DAYS (§9618–§9639).
 *
 * V1: REAL POSTS · CONTINUOUS WALL · MASONRY · SHAPES · COLORS · THEMES · PERSISTENCE hooks.
 * Motion levels reserved for additive upgrades (STATIC today).
 * Do not rebuild this engine when presentation evolves.
 */

import type { CSSProperties } from "react";

export type CommunityWallChannel = "COMMUNITY_GOSSIP" | "HAPPY_DAYS";

/** Progressive presentation capability — V1 uses STATIC. */
export type CommunityWallMotionLevel = "STATIC" | "SUBTLE" | "RICH" | "IMMERSIVE";

export type CommunityWallNoteShape =
  | "RECTANGLE"
  | "ROUNDED"
  | "SQUARE"
  | "CLOUD"
  | "POSTER"
  | "STICKY"
  | "PILL"
  | "STAR";

export type CommunityWallNoteColor =
  | "PAPER_WHITE"
  | "GOLD"
  | "CYAN"
  | "FUCHSIA"
  | "LAVENDER"
  | "SUNSHINE"
  | "MINT"
  | "CORAL";

export type CommunityWallThemeId =
  | "GOSSIP_CLOUD_WALL"
  | "GOSSIP_POSTER_ALLEY"
  | "HAPPY_SUNSHINE"
  | "HAPPY_CELEBRATION";

export type CommunityWallDataClass =
  | "REAL_PERSISTED"
  | "SEED"
  | "FIXTURE"
  | "DEMO"
  | "FALLBACK"
  | "TEST"
  | "USER_SESSION";

export type CommunityWallNote = {
  id: string;
  channel: CommunityWallChannel;
  /** Display name — never machine-translated. */
  authorLabel: string;
  /** Canonical original body — translation is a view, not a second post. */
  body: string;
  createdAtIso: string;
  relativeTimeLabel: string;
  shape: CommunityWallNoteShape;
  color: CommunityWallNoteColor;
  dataClass: CommunityWallDataClass;
  featured?: boolean;
  /** ISO 639-1 when known; und = undetected. */
  originalLanguage?: string;
  /** Bumped when author edits body — invalidates translation cache. */
  contentVersion?: number;
};

export type CommunityWallTheme = {
  id: CommunityWallThemeId;
  channel: CommunityWallChannel;
  label: string;
  /** Atmosphere behind the board — distinct per channel. */
  atmosphere: {
    background: string;
    overlayGradient: string;
    cloudOpacity: number;
    accent: string;
  };
  defaultShape: CommunityWallNoteShape;
  defaultColor: CommunityWallNoteColor;
  motionProfileId: "GOSSIP_BULLETIN" | "HAPPY_CELEBRATION";
  defaultMotionLevel: CommunityWallMotionLevel;
};

export const COMMUNITY_WALL_THEMES: Record<CommunityWallThemeId, CommunityWallTheme> = {
  GOSSIP_CLOUD_WALL: {
    id: "GOSSIP_CLOUD_WALL",
    channel: "COMMUNITY_GOSSIP",
    label: "Cloud Wall",
    atmosphere: {
      // §20930 — pink/purple gossip paper, not black UI chrome
      background: "radial-gradient(ellipse at 30% 20%, rgba(251,207,232,0.95), transparent 55%), radial-gradient(ellipse at 70% 60%, rgba(232,121,249,0.55), #fdf2f8 72%)",
      overlayGradient: "linear-gradient(180deg, rgba(255,255,255,0.25), rgba(233,213,255,0.35))",
      cloudOpacity: 0.55,
      accent: "#db2777",
    },
    defaultShape: "POSTER",
    defaultColor: "PAPER_WHITE",
    motionProfileId: "GOSSIP_BULLETIN",
    defaultMotionLevel: "STATIC",
  },
  GOSSIP_POSTER_ALLEY: {
    id: "GOSSIP_POSTER_ALLEY",
    channel: "COMMUNITY_GOSSIP",
    label: "Poster Alley",
    atmosphere: {
      background: "linear-gradient(160deg, #fae8ff 0%, #fbcfe8 45%, #e879f9 100%)",
      overlayGradient: "linear-gradient(180deg, rgba(255,255,255,0.2), rgba(192,38,211,0.12))",
      cloudOpacity: 0.15,
      accent: "#FF2DAA",
    },
    defaultShape: "STICKY",
    defaultColor: "LAVENDER",
    motionProfileId: "GOSSIP_BULLETIN",
    defaultMotionLevel: "STATIC",
  },
  HAPPY_SUNSHINE: {
    id: "HAPPY_SUNSHINE",
    channel: "HAPPY_DAYS",
    label: "Sunshine Board",
    atmosphere: {
      // §20930 — full crayon sunshine paper (not dark board)
      background: "radial-gradient(ellipse at 50% 0%, #fef08a 0%, transparent 55%), radial-gradient(ellipse at 20% 80%, #7dd3fc 0%, #fefce8 70%)",
      overlayGradient: "linear-gradient(180deg, rgba(255,255,255,0.35), rgba(134,239,172,0.2))",
      cloudOpacity: 0.6,
      accent: "#ea580c",
    },
    defaultShape: "ROUNDED",
    defaultColor: "SUNSHINE",
    motionProfileId: "HAPPY_CELEBRATION",
    defaultMotionLevel: "STATIC",
  },
  HAPPY_CELEBRATION: {
    id: "HAPPY_CELEBRATION",
    channel: "HAPPY_DAYS",
    label: "Celebration Wall",
    atmosphere: {
      background: "radial-gradient(circle at 10% 20%, #f9a8d4 0%, transparent 42%), radial-gradient(circle at 90% 10%, #86efac 0%, #fff7ed 65%)",
      overlayGradient: "linear-gradient(180deg, rgba(255,255,255,0.3), transparent)",
      cloudOpacity: 0.45,
      accent: "#059669",
    },
    defaultShape: "STAR",
    defaultColor: "MINT",
    motionProfileId: "HAPPY_CELEBRATION",
    defaultMotionLevel: "STATIC",
  },
};

export const NOTE_COLOR_STYLES: Record<
  CommunityWallNoteColor,
  { bg: string; ink: string; nameInk: string; border: string }
> = {
  PAPER_WHITE: {
    bg: "linear-gradient(165deg, #fffef8 0%, #f4efe6 100%)",
    ink: "#1a1520",
    nameInk: "#0a8a8a",
    border: "rgba(0,0,0,0.08)",
  },
  GOLD: {
    bg: "linear-gradient(165deg, #ffe9a8 0%, #f5c842 100%)",
    ink: "#2a1a00",
    nameInk: "#7a4a00",
    border: "rgba(120,80,0,0.25)",
  },
  CYAN: {
    bg: "linear-gradient(165deg, #d4ffff 0%, #7ee8f0 100%)",
    ink: "#042428",
    nameInk: "#046060",
    border: "rgba(0,100,110,0.2)",
  },
  FUCHSIA: {
    bg: "linear-gradient(165deg, #ffd6f0 0%, #ff7ec8 100%)",
    ink: "#2a0420",
    nameInk: "#8a1060",
    border: "rgba(160,20,100,0.25)",
  },
  LAVENDER: {
    bg: "linear-gradient(165deg, #ebe4ff 0%, #c4b0ff 100%)",
    ink: "#1a1030",
    nameInk: "#4a3080",
    border: "rgba(80,40,140,0.2)",
  },
  SUNSHINE: {
    bg: "linear-gradient(165deg, #fff6d0 0%, #ffe08a 100%)",
    ink: "#3a2800",
    nameInk: "#8a6000",
    border: "rgba(180,140,0,0.25)",
  },
  MINT: {
    bg: "linear-gradient(165deg, #d8fff0 0%, #7dffc8 100%)",
    ink: "#042820",
    nameInk: "#0a7048",
    border: "rgba(0,120,70,0.2)",
  },
  CORAL: {
    bg: "linear-gradient(165deg, #ffe0d4 0%, #ff9a7a 100%)",
    ink: "#301008",
    nameInk: "#903020",
    border: "rgba(160,50,30,0.25)",
  },
};

export function shapeStyle(shape: CommunityWallNoteShape): CSSProperties {
  switch (shape) {
    case "SQUARE":
      return { borderRadius: 4, aspectRatio: undefined };
    case "ROUNDED":
      return { borderRadius: 18 };
    case "CLOUD":
      return { borderRadius: "40% 48% 42% 50% / 48% 42% 55% 45%" };
    case "POSTER":
      return { borderRadius: 2, boxShadow: "4px 6px 0 rgba(0,0,0,0.18)" };
    case "STICKY":
      return { borderRadius: "2px 2px 12px 2px", transform: "rotate(-1.2deg)" };
    case "PILL":
      return { borderRadius: 28 };
    case "STAR":
      return { borderRadius: 16, clipPath: undefined };
    case "RECTANGLE":
    default:
      return { borderRadius: 8 };
  }
}

/** Wider card for longer notes — deterministic, not random chaos. */
export function noteColumnSpan(bodyLength: number, featured?: boolean): 1 | 2 {
  if (featured) return 2;
  if (bodyLength >= 140) return 2;
  return 1;
}

export function defaultThemeForChannel(channel: CommunityWallChannel): CommunityWallTheme {
  return channel === "HAPPY_DAYS"
    ? COMMUNITY_WALL_THEMES.HAPPY_SUNSHINE
    : COMMUNITY_WALL_THEMES.GOSSIP_CLOUD_WALL;
}

export function channelDisplayTitle(channel: CommunityWallChannel): string {
  return channel === "HAPPY_DAYS" ? "HAPPY DAYS" : "COMMUNITY GOSSIP";
}

/** Visible UX must never say Fan Conversation. */
export const FORBIDDEN_WALL_LABELS = ["FAN CONVERSATION", "Fan Conversation"] as const;
