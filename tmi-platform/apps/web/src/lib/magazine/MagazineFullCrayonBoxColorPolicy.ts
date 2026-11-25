/**
 * MagazineFullCrayonBoxColorPolicy — §20930 Full Crayon Box / Vibrant Magazine Color
 *
 * HARD OWNER CORRECTION: Magazine sheets are too black.
 * TMI shell may stay TMI-dark; the MAGAZINE SHEET gets printed editorial color.
 *
 * Black remains A color (cinematic/dramatic spreads only) — not the default page.
 * Per-story color direction — not one global rainbow, not black+one-accent widgets.
 *
 * Extends MagazineDesignEngine archetypes — NEW_MAGAZINE_ENGINE = NO
 * PrintMagazineLayoutEngine.ts is NOT created.
 */

import type { MagazineArchetype } from "./MagazineDesignEngine";

export const MAGAZINE_FULL_CRAYON_BOX_COLOR_POLICY_ID =
  "MAGAZINE_FULL_CRAYON_BOX_COLOR_POLICY_v1" as const;

export const NEW_MAGAZINE_COLOR_ENGINE = false as const;
export const NEW_PRINT_MAGAZINE_LAYOUT_ENGINE = false as const;

export const FULL_CRAYON_BOX = true as const;
export const BLACK_IS_A_COLOR_NOT_THE_WHOLE_MAGAZINE = true as const;
export const PAGE_IS_THE_ART_DIRECTION = true as const;

/** Owner visual reference: 80s magazine / Memphis / Smash Hits / Sassy energy. */
export const EIGHTIES_MEMPHIS_PRINT_DIRECTION = true as const;
export const MEMPHIS_PRIMARIES = ["#FFD100", "#FF2DAA", "#00E5FF", "#FF3B30", "#7CFF4F", "#AA2DFF"] as const;

export const BLACK_DEFAULT_EVERY_SHEET = 0 as const;
export const RAINBOW_GLOBAL_THEME = 0 as const;
export const COLORFUL_WIDGETS_ON_BLACK_PAGE = 0 as const;
export const EVERY_ARTICLE_BLACK_PLUS_ONE_ACCENT = 0 as const;
export const UNREADABLE_COPY_OVER_CHAOS = 0 as const;

/** Printed editorial sheet families — maps into MagazineDesignEngine archetypes. */
export type EditorialSheetFamily =
  | "CREAM_PAPER"
  | "WHITE_NEWS"
  | "WARM_SUNSHINE"
  | "ELECTRIC_FEATURE"
  | "JEWEL_FEATURE"
  | "GOSSIP_PINK"
  | "HAPPY_DAYS"
  | "CINEMATIC_DARK"; // justified only

export type MagazineStoryKind =
  | "NEWS"
  | "PERFORMER_FEATURE"
  | "INTERVIEW"
  | "MUSIC_RELEASE"
  | "HAPPY_DAYS"
  | "COMMUNITY_GOSSIP"
  | "HIP_HOP"
  | "RB"
  | "ROCK"
  | "POP"
  | "EDITORIAL"
  | "CINEMATIC";

export type SheetPaletteTokens = {
  family: EditorialSheetFamily;
  archetype: MagazineArchetype;
  paperBg: string;
  paperBgAlt: string;
  ink: string;
  mutedInk: string;
  accent: string;
  accentSecondary: string;
  marginTint: string;
  /** true only for justified cinematic dark */
  darkJustified: boolean;
};

export const SHEET_PALETTES: Record<EditorialSheetFamily, SheetPaletteTokens> = {
  CREAM_PAPER: {
    family: "CREAM_PAPER",
    archetype: "cream",
    paperBg: "linear-gradient(160deg, #f7f0e4 0%, #efe4d2 55%, #e8d9c4 100%)",
    paperBgAlt: "linear-gradient(160deg, #f3e8d6 0%, #e9dcc8 100%)",
    ink: "#1a1208",
    mutedInk: "rgba(26,18,8,0.72)",
    accent: "#c2410c",
    accentSecondary: "#1d4ed8",
    marginTint: "rgba(194,65,12,0.12)",
    darkJustified: false,
  },
  WHITE_NEWS: {
    family: "WHITE_NEWS",
    archetype: "newsprint",
    paperBg: "linear-gradient(160deg, #ffffff 0%, #f4f6f8 100%)",
    paperBgAlt: "linear-gradient(160deg, #fafbfc 0%, #eef1f5 100%)",
    ink: "#0f172a",
    mutedInk: "rgba(15,23,42,0.7)",
    accent: "#dc2626",
    accentSecondary: "#0369a1",
    marginTint: "rgba(220,38,38,0.1)",
    darkJustified: false,
  },
  WARM_SUNSHINE: {
    family: "WARM_SUNSHINE",
    archetype: "sunshine",
    // Smash Hits / Sassy yellow field
    paperBg: "linear-gradient(155deg, #FFE566 0%, #FFD100 40%, #FF8A00 100%)",
    paperBgAlt: "linear-gradient(155deg, #FFF3A0 0%, #FF6B9D 100%)",
    ink: "#1a0a00",
    mutedInk: "rgba(26,10,0,0.78)",
    accent: "#FF2DAA",
    accentSecondary: "#00E5FF",
    marginTint: "rgba(255,45,170,0.18)",
    darkJustified: false,
  },
  ELECTRIC_FEATURE: {
    family: "ELECTRIC_FEATURE",
    archetype: "electric",
    // Cyan Memphis field + magenta accent
    paperBg: "linear-gradient(155deg, #B8F7FF 0%, #00E5FF 42%, #5B7CFF 100%)",
    paperBgAlt: "linear-gradient(155deg, #E0B3FF 0%, #FF2DAA 100%)",
    ink: "#061028",
    mutedInk: "rgba(6,16,40,0.78)",
    accent: "#FF2DAA",
    accentSecondary: "#FFD100",
    marginTint: "rgba(255,45,170,0.22)",
    darkJustified: false,
  },
  JEWEL_FEATURE: {
    family: "JEWEL_FEATURE",
    archetype: "jewel",
    paperBg: "linear-gradient(155deg, #FFE0F5 0%, #E9D5FF 35%, #C084FC 100%)",
    paperBgAlt: "linear-gradient(155deg, #FFD6EC 0%, #FF6B9D 100%)",
    ink: "#2a0648",
    mutedInk: "rgba(42,6,72,0.78)",
    accent: "#FF2DAA",
    accentSecondary: "#FFD100",
    marginTint: "rgba(255,45,170,0.16)",
    darkJustified: false,
  },
  GOSSIP_PINK: {
    family: "GOSSIP_PINK",
    archetype: "gossip",
    paperBg: "linear-gradient(155deg, #FFD6EC 0%, #FF6B9D 38%, #AA2DFF 100%)",
    paperBgAlt: "linear-gradient(155deg, #FFE566 0%, #FF2DAA 100%)",
    ink: "#2a0430",
    mutedInk: "rgba(42,4,48,0.78)",
    accent: "#FFD100",
    accentSecondary: "#00E5FF",
    marginTint: "rgba(255,209,0,0.2)",
    darkJustified: false,
  },
  HAPPY_DAYS: {
    family: "HAPPY_DAYS",
    archetype: "happyDays",
    // Full crayon box — yellow → lime → cyan → pink
    paperBg: "linear-gradient(135deg, #FFE566 0%, #7CFF4F 28%, #00E5FF 58%, #FF6B9D 100%)",
    paperBgAlt: "linear-gradient(155deg, #FFD100 0%, #FF2DAA 55%, #AA2DFF 100%)",
    ink: "#0a1a10",
    mutedInk: "rgba(10,26,16,0.8)",
    accent: "#FF3B30",
    accentSecondary: "#061028",
    marginTint: "rgba(255,59,48,0.16)",
    darkJustified: false,
  },
  CINEMATIC_DARK: {
    family: "CINEMATIC_DARK",
    archetype: "cinematic",
    paperBg: "linear-gradient(160deg, #1a1028 0%, #0a0614 100%)",
    paperBgAlt: "linear-gradient(160deg, #12081c 0%, #050510 100%)",
    ink: "#f5f3ff",
    mutedInk: "rgba(245,243,255,0.75)",
    accent: "#FFD700",
    accentSecondary: "#FF2DAA",
    marginTint: "rgba(255,215,0,0.12)",
    darkJustified: true,
  },
};

/**
 * Story → sheet family. Genre hints are possibilities, not hard stereotypes —
 * explicit cinematic / happy days / gossip win first.
 */
export function resolveEditorialSheetFamily(input: {
  storyKind: MagazineStoryKind;
  forceCinematic?: boolean;
}): EditorialSheetFamily {
  if (input.forceCinematic || input.storyKind === "CINEMATIC") return "CINEMATIC_DARK";
  switch (input.storyKind) {
    case "HAPPY_DAYS":
      return "HAPPY_DAYS";
    case "COMMUNITY_GOSSIP":
      return "GOSSIP_PINK";
    case "NEWS":
      return "WHITE_NEWS";
    case "POP":
      return "WARM_SUNSHINE";
    case "HIP_HOP":
      return "ELECTRIC_FEATURE";
    case "RB":
      return "JEWEL_FEATURE";
    case "ROCK":
      return "WARM_SUNSHINE";
    case "PERFORMER_FEATURE":
    case "INTERVIEW":
    case "MUSIC_RELEASE":
      return "JEWEL_FEATURE";
    case "EDITORIAL":
    default:
      return "CREAM_PAPER";
  }
}

export function resolveSheetPalette(input: {
  storyKind: MagazineStoryKind;
  forceCinematic?: boolean;
}): SheetPaletteTokens {
  const family = resolveEditorialSheetFamily(input);
  return SHEET_PALETTES[family];
}

export function resolveArchetypeForStoryKind(storyKind: MagazineStoryKind): MagazineArchetype {
  return resolveSheetPalette({ storyKind }).archetype;
}

/** CSS custom properties for a magazine sheet (not the TMI chrome shell). */
export function sheetCssVariables(palette: SheetPaletteTokens): Record<string, string> {
  return {
    "--mag-sheet-bg": palette.paperBg,
    "--mag-sheet-bg-alt": palette.paperBgAlt,
    "--mag-ink": palette.ink,
    "--mag-ink-muted": palette.mutedInk,
    "--mag-accent": palette.accent,
    "--mag-accent-2": palette.accentSecondary,
    "--mag-margin-tint": palette.marginTint,
  };
}

export function crayonBoxBoundaryLocks() {
  return {
    NEW_MAGAZINE_COLOR_ENGINE,
    NEW_PRINT_MAGAZINE_LAYOUT_ENGINE,
    FULL_CRAYON_BOX,
    BLACK_IS_A_COLOR_NOT_THE_WHOLE_MAGAZINE,
    PAGE_IS_THE_ART_DIRECTION,
    EIGHTIES_MEMPHIS_PRINT_DIRECTION,
    MEMPHIS_PRIMARIES: [...MEMPHIS_PRIMARIES],
    BLACK_DEFAULT_EVERY_SHEET,
    RAINBOW_GLOBAL_THEME,
    COLORFUL_WIDGETS_ON_BLACK_PAGE,
    EVERY_ARTICLE_BLACK_PLUS_ONE_ACCENT,
    UNREADABLE_COPY_OVER_CHAOS,
    CANONICAL_DESIGN_AUTHORITY: "MagazineDesignEngine + MagazineFullCrayonBoxColorPolicy",
    CANONICAL_GEOMETRY_AUTHORITY: "MagazinePageGeometryAuthority + EditorialCutRegistry",
    SHEET_FAMILIES: Object.keys(SHEET_PALETTES),
    OWNER_REVIEW_GATES: {
      MAGAZINE_BLACK_DOMINANCE_REDUCED: "OWNER_REVIEW",
      FULL_COLOR_RANGE_PRESENT: "OWNER_REVIEW",
      NEWS_VISUAL_PERSONALITY: "OWNER_REVIEW",
      PERFORMER_VISUAL_PERSONALITY: "OWNER_REVIEW",
      HAPPY_DAYS_VIBRANCY: "OWNER_REVIEW",
      COMMUNITY_GOSSIP_VIBRANCY: "OWNER_REVIEW",
      EDITORIAL_COLOR_NOT_WIDGET_COLOR: "OWNER_REVIEW",
      MOBILE_COLOR_READABILITY: "OWNER_REVIEW",
    } as const,
  };
}
