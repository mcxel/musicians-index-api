/**
 * YoPhoStarterRegistry.ts — canonical YoPho STARTER-LAYOUT authority
 * (§5563–§5571, §5581–§5585).
 *
 * LAYOUT = arrangement/design INSIDE a chosen FORMAT geometry. FORMAT is chosen
 * first (YoPhoFormatAuthority), then a format-specific starter layout (§5563).
 *
 * Hard laws honored here:
 *  - §5564  TRADING_CARD and ALBUM_COVER have SEPARATE layout sets — never a
 *           squashed 5:7 layout reused as 1:1.
 *  - §5565  Starter families reuse existing YoPho scene/style capabilities
 *           (YoPhoSceneId / YoPhoStudioStyleId) — no arbitrary duplicate designs.
 *  - §5566  Same family may exist in BOTH geometries with separate composition.
 *  - §5567  BLANK is always available in both formats (correct dims/safe zone).
 *  - §5571  A starter is a BASE, not a locked template.
 *  - §5595  YoPho has its OWN registry — NOT coupled to publicPageStarterRegistry.
 *
 * Pure data/logic: no DOM, no Prisma, no fetch. `applyStarterToComposition`
 * returns a `YoPhoCardComposition` editor-state seed; geometry-specific layer
 * composition is resolved at document build / render time via
 * YoPhoFormatAuthority.presentDocumentInFormat.
 */

import type { YoPhoCardComposition, YoPhoTextOverlay } from "./YoPhoCardComposition";
import { createDefaultComposition, defaultTextOverlay } from "./YoPhoCardComposition";
import type { YoPhoSceneId } from "./YoPhoScenePack";
import type { YoPhoStudioStyleId } from "./YoPhoStudioStylePresets";
import {
  counterpartFormat,
  getFormatPresentation,
  getYoPhoFormat,
  type YoPhoFormat,
} from "./YoPhoFormatAuthority";
import {
  createDefaultVisual,
  defaultEffectParams,
  defaultLighting,
  visualRecipe,
  type YoPhoVisualState,
} from "./YoPhoVisualRuntime";

// ─────────────────────────────────────────────────────────────────────────────
// Starter layout model
// ─────────────────────────────────────────────────────────────────────────────

export type YoPhoStarterFamily =
  | "BLANK"
  | "CLASSIC"
  | "SPOTLIGHT"
  | "BOLD"
  | "MINIMAL"
  | "COLLECTOR"
  | "STORM"
  | "STAGE_HAZE";

export interface YoPhoStarterLayout {
  /** Stable starter id, namespaced by format, e.g. "tc_classic" / "ac_classic". */
  id: string;
  family: YoPhoStarterFamily;
  format: YoPhoFormat;
  label: string;
  /** One-line description shown under the preview. */
  blurb: string;
  /** Scene + style reused from the existing YoPho design system (§5565). */
  sceneId: YoPhoSceneId;
  styleId: YoPhoStudioStyleId;
  /** Starting text overlay (title placement differs by format). */
  textOverlay: YoPhoTextOverlay;
  /** Certified lighting / FX recipe — applied as a base, fully editable. */
  visual: YoPhoVisualState;
  /** True only for the BLANK starter (§5567). */
  isBlank: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Composition helpers — geometry-specific, never a squash (§5564/§5566)
// ─────────────────────────────────────────────────────────────────────────────

function textFor(format: YoPhoFormat, text: string, fontSize: number, color: string): YoPhoTextOverlay {
  const base = defaultTextOverlay();
  return {
    ...base,
    text,
    fontSize,
    color,
    position: "bottom",
  };
}

function starter(input: {
  id: string;
  family: YoPhoStarterFamily;
  format: YoPhoFormat;
  label: string;
  blurb: string;
  sceneId: YoPhoSceneId;
  styleId: YoPhoStudioStyleId;
  text: string;
  fontSize: number;
  color: string;
  visual?: YoPhoVisualState;
  isBlank?: boolean;
}): YoPhoStarterLayout {
  return {
    id: input.id,
    family: input.family,
    format: input.format,
    label: input.label,
    blurb: input.blurb,
    sceneId: input.sceneId,
    styleId: input.styleId,
    textOverlay: textFor(input.format, input.text, input.fontSize, input.color),
    visual: input.visual ?? createDefaultVisual({ primaryFormat: input.format }),
    isBlank: input.isBlank ?? false,
  };
}

function classicVisual(format: YoPhoFormat): YoPhoVisualState {
  return visualRecipe(["light_leak"], {
    primaryFormat: format,
    lighting: defaultLighting({ direction: "center-stage", intensity: 52, warmth: 48 }),
  });
}

function spotlightVisual(format: YoPhoFormat): YoPhoVisualState {
  return visualRecipe(["smoke", "neon_glow"], {
    primaryFormat: format,
    lighting: defaultLighting({ direction: "center-stage", intensity: 72, warmth: 28, tint: "#00E5FF" }),
    parallaxEnabled: true,
  });
}

function boldVisual(format: YoPhoFormat): YoPhoVisualState {
  const base = visualRecipe(["rain", "neon_glow", "particles"], {
    primaryFormat: format,
    lighting: defaultLighting({ direction: "top-left", intensity: 64, warmth: 22 }),
  });
  return {
    ...base,
    formatOverrides: {
      TRADING_CARD: {
        effects: {
          rain: { params: defaultEffectParams("rain", { intensity: 78, density: 82, direction: "left" }) },
        },
      },
      ALBUM_COVER: {
        effects: {
          rain: { params: defaultEffectParams("rain", { intensity: 48, density: 50, direction: "down" }) },
        },
      },
    },
  };
}

function minimalVisual(format: YoPhoFormat): YoPhoVisualState {
  return createDefaultVisual({
    primaryFormat: format,
    lighting: defaultLighting({ direction: "top-right", intensity: 40, warmth: 18 }),
    grade: { saturation: 96, contrast: 104, brightness: 102 },
  });
}

function collectorVisual(format: YoPhoFormat): YoPhoVisualState {
  return visualRecipe(["fog", "neon_glow"], {
    primaryFormat: format,
    lighting: defaultLighting({ direction: "bottom-up", intensity: 68, warmth: 70, tint: "#FFD700" }),
  });
}

function stormVisual(format: YoPhoFormat): YoPhoVisualState {
  return visualRecipe(["rain", "smoke", "particles"], {
    primaryFormat: format,
    lighting: defaultLighting({ direction: "top-left", intensity: 70, warmth: 16 }),
    motionPlaying: true,
    motionLoop: true,
  });
}

function stageHazeVisual(format: YoPhoFormat): YoPhoVisualState {
  return visualRecipe(["smoke", "fog", "light_leak"], {
    primaryFormat: format,
    lighting: defaultLighting({ direction: "center-stage", intensity: 78, warmth: 36 }),
    motionPlaying: true,
    motionLoop: true,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// TRADING CARD starters (5:7 portrait — collectible card character §5585)
// ─────────────────────────────────────────────────────────────────────────────

const TRADING_CARD_STARTERS: YoPhoStarterLayout[] = [
  starter({
    id: "tc_blank",
    family: "BLANK",
    format: "TRADING_CARD",
    label: "Start Blank",
    blurb: "Empty 5:7 card with correct safe zones. Build from scratch.",
    sceneId: "none",
    styleId: "classic",
    text: "",
    fontSize: 28,
    color: "#FFD700",
    visual: createDefaultVisual({ primaryFormat: "TRADING_CARD" }),
    isBlank: true,
  }),
  starter({
    id: "tc_classic",
    family: "CLASSIC",
    format: "TRADING_CARD",
    label: "Classic",
    blurb: "Portrait artwork, title lower third, card frame + YoPho badge.",
    sceneId: "neon_stage",
    styleId: "classic",
    text: "ROOKIE CARD",
    fontSize: 26,
    color: "#FFD700",
    visual: classicVisual("TRADING_CARD"),
  }),
  starter({
    id: "tc_spotlight",
    family: "SPOTLIGHT",
    format: "TRADING_CARD",
    label: "Spotlight",
    blurb: "Single subject lit on stage — hero collectible energy.",
    sceneId: "club_laser",
    styleId: "concert_hero",
    text: "LIVE",
    fontSize: 30,
    color: "#00FFFF",
    visual: spotlightVisual("TRADING_CARD"),
  }),
  starter({
    id: "tc_bold",
    family: "BOLD",
    format: "TRADING_CARD",
    label: "Bold",
    blurb: "High-contrast neon identity with a strong border.",
    sceneId: "city_night",
    styleId: "neon_cosmic",
    text: "ICON",
    fontSize: 32,
    color: "#FF2DAA",
    visual: boldVisual("TRADING_CARD"),
  }),
  starter({
    id: "tc_minimal",
    family: "MINIMAL",
    format: "TRADING_CARD",
    label: "Minimal",
    blurb: "Clean portrait, quiet frame, name forward.",
    sceneId: "solid_cyan",
    styleId: "border_white",
    text: "",
    fontSize: 24,
    color: "#FFFFFF",
    visual: minimalVisual("TRADING_CARD"),
  }),
  starter({
    id: "tc_collector",
    family: "COLLECTOR",
    format: "TRADING_CARD",
    label: "Collector",
    blurb: "Prestige frame, date border, edition-ready collectible.",
    sceneId: "cosmic_space",
    styleId: "diamond_prestige",
    text: "1st EDITION",
    fontSize: 22,
    color: "#FFD700",
    visual: collectorVisual("TRADING_CARD"),
  }),
  starter({
    id: "tc_storm",
    family: "STORM",
    format: "TRADING_CARD",
    label: "Storm",
    blurb: "Certified rain + smoke + particles — animated collectible weather.",
    sceneId: "city_night",
    styleId: "neon_cosmic",
    text: "STORM",
    fontSize: 30,
    color: "#00FFFF",
    visual: stormVisual("TRADING_CARD"),
  }),
  starter({
    id: "tc_stage_haze",
    family: "STAGE_HAZE",
    format: "TRADING_CARD",
    label: "Stage Haze",
    blurb: "Certified stage smoke, fog, and light leak under concert lighting.",
    sceneId: "neon_stage",
    styleId: "concert_hero",
    text: "LIVE",
    fontSize: 28,
    color: "#FFD700",
    visual: stageHazeVisual("TRADING_CARD"),
  }),
];

// ─────────────────────────────────────────────────────────────────────────────
// ALBUM COVER starters (1:1 square — real music-release composition §5584)
// ─────────────────────────────────────────────────────────────────────────────

const ALBUM_COVER_STARTERS: YoPhoStarterLayout[] = [
  starter({
    id: "ac_blank",
    family: "BLANK",
    format: "ALBUM_COVER",
    label: "Start Blank",
    blurb: "Empty 1:1 canvas with correct safe zones. Build from scratch.",
    sceneId: "none",
    styleId: "classic",
    text: "",
    fontSize: 40,
    color: "#FFFFFF",
    visual: createDefaultVisual({ primaryFormat: "ALBUM_COVER" }),
    isBlank: true,
  }),
  starter({
    id: "ac_classic",
    family: "CLASSIC",
    format: "ALBUM_COVER",
    label: "Classic",
    blurb: "Large square artwork, artist/title album composition.",
    sceneId: "gradient_vice",
    styleId: "magazine_editorial",
    text: "NEW ALBUM",
    fontSize: 44,
    color: "#FFFFFF",
    visual: classicVisual("ALBUM_COVER"),
  }),
  starter({
    id: "ac_spotlight",
    family: "SPOTLIGHT",
    format: "ALBUM_COVER",
    label: "Spotlight",
    blurb: "Centered artist image, single spotlight, bold title.",
    sceneId: "studio_columns",
    styleId: "glamour_glow",
    text: "THE SINGLE",
    fontSize: 42,
    color: "#00FFFF",
    visual: spotlightVisual("ALBUM_COVER"),
  }),
  starter({
    id: "ac_bold",
    family: "BOLD",
    format: "ALBUM_COVER",
    label: "Bold",
    blurb: "Statement cover — big type, saturated backdrop.",
    sceneId: "solid_fuchsia",
    styleId: "underground_cypher",
    text: "LOUD",
    fontSize: 56,
    color: "#FFFFFF",
    visual: boldVisual("ALBUM_COVER"),
  }),
  starter({
    id: "ac_minimal",
    family: "MINIMAL",
    format: "ALBUM_COVER",
    label: "Minimal",
    blurb: "Negative space, small title, art-first composition.",
    sceneId: "solid_gold",
    styleId: "vaseline_soft",
    text: "",
    fontSize: 30,
    color: "#FFFFFF",
    visual: minimalVisual("ALBUM_COVER"),
  }),
  starter({
    id: "ac_collector",
    family: "COLLECTOR",
    format: "ALBUM_COVER",
    label: "Collector",
    blurb: "Deluxe-edition cover with premium finish.",
    sceneId: "cosmic_space",
    styleId: "diamond_prestige",
    text: "DELUXE",
    fontSize: 40,
    color: "#FFD700",
    visual: collectorVisual("ALBUM_COVER"),
  }),
  starter({
    id: "ac_storm",
    family: "STORM",
    format: "ALBUM_COVER",
    label: "Storm",
    blurb: "Certified square storm cover — rain, smoke, particles.",
    sceneId: "city_night",
    styleId: "neon_cosmic",
    text: "STORM",
    fontSize: 48,
    color: "#00FFFF",
    visual: stormVisual("ALBUM_COVER"),
  }),
  starter({
    id: "ac_stage_haze",
    family: "STAGE_HAZE",
    format: "ALBUM_COVER",
    label: "Stage Haze",
    blurb: "Certified square stage haze — smoke, fog, concert light.",
    sceneId: "neon_stage",
    styleId: "concert_hero",
    text: "LIVE",
    fontSize: 46,
    color: "#FFD700",
    visual: stageHazeVisual("ALBUM_COVER"),
  }),
];

// ─────────────────────────────────────────────────────────────────────────────
// Registry access
// ─────────────────────────────────────────────────────────────────────────────

export const YOPHO_STARTER_LAYOUTS: readonly YoPhoStarterLayout[] = [
  ...TRADING_CARD_STARTERS,
  ...ALBUM_COVER_STARTERS,
] as const;

/** Format-specific layout gallery (§5563/§5564). BLANK first (§5567). */
export function listStartersForFormat(format: YoPhoFormat): YoPhoStarterLayout[] {
  const list = YOPHO_STARTER_LAYOUTS.filter((s) => s.format === format);
  return [...list].sort((a, b) => Number(b.isBlank) - Number(a.isBlank));
}

export function getStarterById(id: string): YoPhoStarterLayout | null {
  return YOPHO_STARTER_LAYOUTS.find((s) => s.id === id) ?? null;
}

/** The same-family counterpart starter in the opposite format (§5566/§5575). */
export function counterpartStarter(starter: YoPhoStarterLayout): YoPhoStarterLayout | null {
  const target = counterpartFormat(starter.format);
  return (
    YOPHO_STARTER_LAYOUTS.find((s) => s.format === target && s.family === starter.family) ?? null
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Apply starter → editor-state seed (§5570–§5571)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Apply a starter layout as the BASE editor state. Returns a fresh
 * `YoPhoCardComposition` carrying the format's canvas geometry + the starter's
 * scene/style/text. The creator's existing content is NOT touched here — the
 * caller merges owner content (§5569) and the document build resolves
 * geometry-specific layer composition (§5575/§5576).
 *
 * The starter is a base, not a lock: the returned composition is fully editable
 * in the canonical YoPho editor (§5571).
 */
export function applyStarterToComposition(
  starterLayout: YoPhoStarterLayout,
  opts: { canvasWidth?: number } = {},
): YoPhoCardComposition {
  const spec = getYoPhoFormat(starterLayout.format);
  const presentation = getFormatPresentation(starterLayout.format);
  const width = opts.canvasWidth ?? 360;
  const base = createDefaultComposition();
  return {
    ...base,
    styleId: starterLayout.styleId,
    sceneId: starterLayout.sceneId,
    textOverlay: starterLayout.textOverlay,
    visual: { ...starterLayout.visual, primaryFormat: starterLayout.format },
    magicEffects: starterLayout.visual.effects.filter((e) => e.enabled).map((e) => e.id),
    primaryFormat: starterLayout.format,
    canvas: {
      aspectRatio: spec.documentAspect,
      width,
      height: Math.round(width / spec.aspectValue),
      safeAreaBottomPct: presentation.safeAreaBottomPct,
    },
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Choose the primary starter for a format + family and return both the primary
 * composition and its intelligent counterpart's starter (§5575). The caller can
 * render/preview both formats from ONE YoPho identity.
 */
export function resolveStarterPair(
  format: YoPhoFormat,
  family: YoPhoStarterFamily,
): { primary: YoPhoStarterLayout; secondary: YoPhoStarterLayout | null } {
  const primary =
    YOPHO_STARTER_LAYOUTS.find((s) => s.format === format && s.family === family) ??
    listStartersForFormat(format)[0];
  return { primary, secondary: counterpartStarter(primary) };
}
