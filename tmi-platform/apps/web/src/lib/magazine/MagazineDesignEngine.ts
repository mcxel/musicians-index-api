/**
 * MagazineDesignEngine — canonical magazine sheet archetypes.
 *
 * §20930 Full Crayon Box: sheets get printed editorial color.
 * TMI chrome/shell may stay dark; PAGE backgrounds must not default to black.
 * Black remains available only via `cinematic` (justified dark).
 *
 * NEW_MAGAZINE_ENGINE = NO — extend this authority; do not create PrintMagazineLayoutEngine.
 */

import type { CSSProperties } from "react";

export type MagazineArchetype =
  | "vibe"
  | "ebony"
  | "jet"
  | "modern"
  | "classic"
  | "cream"
  | "newsprint"
  | "sunshine"
  | "electric"
  | "jewel"
  | "gossip"
  | "happyDays"
  | "cinematic";

export interface ArchetypeConfig {
  id: MagazineArchetype;
  name: string;
  fontFamily: string;
  headerFont: string;
  accentColor: string;
  borderColor: string;
  borderStyle: string;
  leftPageBg: string;
  rightPageBg: string;
  dropCapColor: string;
  columnCount: number;
  /** Sheet ink — body readable on paper, not forced white-on-black */
  inkColor: string;
  mutedInkColor: string;
  containerStyle: CSSProperties;
  titleStyle: CSSProperties;
  paragraphStyle: CSSProperties;
  pullQuoteStyle: CSSProperties;
  darkJustified: boolean;
}

function sheetArchetype(partial: Omit<ArchetypeConfig, "darkJustified"> & { darkJustified?: boolean }): ArchetypeConfig {
  return { darkJustified: false, ...partial };
}

export const ARCHETYPES: Record<MagazineArchetype, ArchetypeConfig> = {
  /** Legacy id remapped → neon on magenta paper (not black). */
  vibe: sheetArchetype({
    id: "vibe",
    name: "90s Vibe (Neon Gloss Paper)",
    fontFamily: "'Inter', sans-serif",
    headerFont: "'Impact', 'Arial Black', sans-serif",
    accentColor: "#FF2DAA",
    borderColor: "rgba(255, 45, 170, 0.45)",
    borderStyle: "4px solid #FF2DAA",
    leftPageBg: "linear-gradient(160deg, #fce7f3 0%, #f9a8d4 45%, #e879f9 100%)",
    rightPageBg: "linear-gradient(160deg, #fae8ff 0%, #c084fc 100%)",
    dropCapColor: "#0e7490",
    columnCount: 2,
    inkColor: "#4a044e",
    mutedInkColor: "rgba(74,4,78,0.75)",
    containerStyle: {
      boxShadow: "inset 0 0 40px rgba(255,45,170,0.12)",
    },
    titleStyle: {
      fontFamily: "'Impact', 'Arial Black', sans-serif",
      fontSize: "clamp(24px, 4vw, 36px)",
      textTransform: "uppercase",
      letterSpacing: "0.04em",
      color: "#9d174d",
      textShadow: "2px 2px 0px #67e8f9",
    },
    paragraphStyle: {
      fontFamily: "'Inter', sans-serif",
      fontSize: 11,
      lineHeight: 1.6,
      color: "#4a044e",
    },
    pullQuoteStyle: {
      fontFamily: "'Impact', 'Arial Black', sans-serif",
      fontSize: 14,
      color: "#0e7490",
      textTransform: "uppercase",
      borderLeft: "4px solid #FF2DAA",
      paddingLeft: 12,
      fontStyle: "normal",
    },
  }),
  /** Legacy → cream / gold editorial paper. */
  ebony: sheetArchetype({
    id: "ebony",
    name: "Classic Cream (Gold & Serif)",
    fontFamily: "'Georgia', serif",
    headerFont: "'Georgia', serif",
    accentColor: "#b45309",
    borderColor: "rgba(180, 83, 9, 0.35)",
    borderStyle: "3px double #b45309",
    leftPageBg: "linear-gradient(160deg, #f7f0e4 0%, #efe4d2 55%, #e8d9c4 100%)",
    rightPageBg: "linear-gradient(160deg, #f3e8d6 0%, #e9dcc8 100%)",
    dropCapColor: "#92400e",
    columnCount: 2,
    inkColor: "#1a1208",
    mutedInkColor: "rgba(26,18,8,0.72)",
    containerStyle: {
      boxShadow: "inset 0 0 30px rgba(180,83,9,0.08)",
    },
    titleStyle: {
      fontFamily: "'Georgia', serif",
      fontSize: "clamp(22px, 3.5vw, 32px)",
      fontWeight: 900,
      color: "#92400e",
      letterSpacing: "-0.02em",
    },
    paragraphStyle: {
      fontFamily: "'Georgia', serif",
      fontSize: 12,
      lineHeight: 1.7,
      color: "#1a1208",
    },
    pullQuoteStyle: {
      fontFamily: "'Georgia', serif",
      fontSize: 13,
      color: "#b45309",
      fontStyle: "italic",
      borderLeft: "3px solid #b45309",
      paddingLeft: 12,
    },
  }),
  /** Legacy → warm cream + aggressive red. */
  jet: sheetArchetype({
    id: "jet",
    name: "Warm Print (Red Accent)",
    fontFamily: "'Times New Roman', Times, serif",
    headerFont: "'Arial Black', sans-serif",
    accentColor: "#dc2626",
    borderColor: "rgba(220, 38, 0, 0.4)",
    borderStyle: "2px solid #dc2626",
    leftPageBg: "linear-gradient(160deg, #fff7ed 0%, #ffedd5 100%)",
    rightPageBg: "linear-gradient(160deg, #fef3c7 0%, #fed7aa 100%)",
    dropCapColor: "#b91c1c",
    columnCount: 1,
    inkColor: "#7c2d12",
    mutedInkColor: "rgba(124,45,18,0.75)",
    containerStyle: {
      boxShadow: "inset 0 0 24px rgba(220,38,0,0.06)",
    },
    titleStyle: {
      fontFamily: "'Arial Black', sans-serif",
      fontSize: "clamp(20px, 3vw, 28px)",
      fontWeight: 900,
      textTransform: "uppercase",
      color: "#7c2d12",
      borderBottom: "2px solid #dc2626",
      paddingBottom: 6,
    },
    paragraphStyle: {
      fontFamily: "'Times New Roman', Times, serif",
      fontSize: 12.5,
      lineHeight: 1.6,
      color: "#7c2d12",
    },
    pullQuoteStyle: {
      fontFamily: "'Times New Roman', Times, serif",
      fontSize: 13.5,
      color: "#dc2626",
      fontWeight: "bold",
      fontStyle: "italic",
      textAlign: "center",
      borderTop: "1px solid rgba(220,38,0,0.3)",
      borderBottom: "1px solid rgba(220,38,0,0.3)",
      padding: "8px 0",
    },
  }),
  /** Legacy → ice cyan paper. */
  modern: sheetArchetype({
    id: "modern",
    name: "Modern Ice (Cyan Paper)",
    fontFamily: "'Courier New', Courier, monospace",
    headerFont: "'Courier New', Courier, monospace",
    accentColor: "#0891b2",
    borderColor: "rgba(8, 145, 178, 0.35)",
    borderStyle: "1px solid rgba(8, 145, 178, 0.45)",
    leftPageBg: "linear-gradient(160deg, #ecfeff 0%, #a5f3fc 50%, #67e8f9 100%)",
    rightPageBg: "linear-gradient(160deg, #f0fdfa 0%, #99f6e4 100%)",
    dropCapColor: "#0f766e",
    columnCount: 1,
    inkColor: "#083344",
    mutedInkColor: "rgba(8,51,68,0.75)",
    containerStyle: {
      boxShadow: "inset 0 0 50px rgba(8,145,178,0.08)",
    },
    titleStyle: {
      fontFamily: "'Courier New', Courier, monospace",
      fontSize: "clamp(18px, 2.5vw, 24px)",
      fontWeight: 900,
      color: "#0e7490",
      letterSpacing: "0.1em",
      textTransform: "uppercase",
    },
    paragraphStyle: {
      fontFamily: "'Courier New', Courier, monospace",
      fontSize: 10.5,
      lineHeight: 1.5,
      color: "#083344",
    },
    pullQuoteStyle: {
      fontFamily: "'Courier New', Courier, monospace",
      fontSize: 11,
      color: "#0f766e",
      borderLeft: "2px solid #0f766e",
      paddingLeft: 10,
    },
  }),
  classic: sheetArchetype({
    id: "classic",
    name: "Classic Print (Cream Editorial)",
    fontFamily: "serif",
    headerFont: "serif",
    accentColor: "#c2410c",
    borderColor: "rgba(194,65,12,0.25)",
    borderStyle: "1px solid rgba(194,65,12,0.4)",
    leftPageBg: "linear-gradient(160deg, #faf6ef 0%, #f0e6d6 100%)",
    rightPageBg: "linear-gradient(160deg, #f5efe4 0%, #e8dcc8 100%)",
    dropCapColor: "#c2410c",
    columnCount: 2,
    inkColor: "#1a1208",
    mutedInkColor: "rgba(26,18,8,0.72)",
    containerStyle: {
      boxShadow: "inset 0 0 30px rgba(26,18,8,0.04)",
    },
    titleStyle: {
      fontFamily: "serif",
      fontSize: "clamp(22px, 3.5vw, 30px)",
      fontWeight: "bold",
      color: "#1a1208",
      fontStyle: "italic",
    },
    paragraphStyle: {
      fontFamily: "serif",
      fontSize: 12,
      lineHeight: 1.65,
      color: "#1a1208",
    },
    pullQuoteStyle: {
      fontFamily: "serif",
      fontSize: 13,
      color: "#c2410c",
      fontStyle: "italic",
      borderLeft: "2px solid #c2410c",
      paddingLeft: 10,
    },
  }),
  cream: sheetArchetype({
    id: "cream",
    name: "Cream Paper Editorial",
    fontFamily: "'Georgia', serif",
    headerFont: "'Georgia', serif",
    accentColor: "#c2410c",
    borderColor: "rgba(194,65,12,0.3)",
    borderStyle: "1px solid rgba(194,65,12,0.35)",
    leftPageBg: "linear-gradient(160deg, #f7f0e4 0%, #efe4d2 55%, #e8d9c4 100%)",
    rightPageBg: "linear-gradient(160deg, #f3e8d6 0%, #e9dcc8 100%)",
    dropCapColor: "#1d4ed8",
    columnCount: 2,
    inkColor: "#1a1208",
    mutedInkColor: "rgba(26,18,8,0.72)",
    containerStyle: {},
    titleStyle: {
      fontFamily: "'Georgia', serif",
      fontSize: "clamp(24px, 4vw, 36px)",
      fontWeight: 900,
      color: "#c2410c",
    },
    paragraphStyle: {
      fontFamily: "'Georgia', serif",
      fontSize: 12,
      lineHeight: 1.7,
      color: "#1a1208",
    },
    pullQuoteStyle: {
      fontFamily: "'Georgia', serif",
      fontSize: 14,
      color: "#1d4ed8",
      fontStyle: "italic",
      borderLeft: "3px solid #c2410c",
      paddingLeft: 12,
    },
  }),
  newsprint: sheetArchetype({
    id: "newsprint",
    name: "White Newsprint",
    fontFamily: "'Georgia', serif",
    headerFont: "'Arial Black', sans-serif",
    accentColor: "#dc2626",
    borderColor: "rgba(220,38,38,0.3)",
    borderStyle: "2px solid #dc2626",
    leftPageBg: "linear-gradient(160deg, #ffffff 0%, #f4f6f8 100%)",
    rightPageBg: "linear-gradient(160deg, #fafbfc 0%, #eef1f5 100%)",
    dropCapColor: "#0369a1",
    columnCount: 2,
    inkColor: "#0f172a",
    mutedInkColor: "rgba(15,23,42,0.7)",
    containerStyle: {},
    titleStyle: {
      fontFamily: "'Arial Black', sans-serif",
      fontSize: "clamp(22px, 3.5vw, 34px)",
      fontWeight: 900,
      textTransform: "uppercase",
      color: "#0f172a",
    },
    paragraphStyle: {
      fontFamily: "'Georgia', serif",
      fontSize: 12,
      lineHeight: 1.65,
      color: "#0f172a",
    },
    pullQuoteStyle: {
      fontFamily: "'Georgia', serif",
      fontSize: 14,
      color: "#dc2626",
      fontStyle: "italic",
      borderLeft: "4px solid #dc2626",
      paddingLeft: 12,
    },
  }),
  sunshine: sheetArchetype({
    id: "sunshine",
    name: "80s Smash Hits Yellow",
    fontFamily: "'Inter', sans-serif",
    headerFont: "'Impact', 'Arial Black', sans-serif",
    accentColor: "#FF2DAA",
    borderColor: "rgba(255,45,170,0.5)",
    borderStyle: "4px solid #FF2DAA",
    leftPageBg: "linear-gradient(155deg, #FFE566 0%, #FFD100 40%, #FF8A00 100%)",
    rightPageBg: "linear-gradient(155deg, #FFF3A0 0%, #FF6B9D 100%)",
    dropCapColor: "#00E5FF",
    columnCount: 2,
    inkColor: "#1a0a00",
    mutedInkColor: "rgba(26,10,0,0.78)",
    containerStyle: {},
    titleStyle: {
      fontFamily: "'Impact', 'Arial Black', sans-serif",
      fontSize: "clamp(24px, 4vw, 36px)",
      textTransform: "uppercase",
      color: "#1a0a00",
      textShadow: "3px 3px 0 #FF2DAA",
    },
    paragraphStyle: {
      fontFamily: "'Inter', sans-serif",
      fontSize: 11.5,
      lineHeight: 1.6,
      color: "#1a0a00",
    },
    pullQuoteStyle: {
      fontFamily: "'Inter', sans-serif",
      fontSize: 14,
      color: "#061028",
      fontWeight: 800,
      borderLeft: "4px solid #00E5FF",
      paddingLeft: 12,
    },
  }),
  electric: sheetArchetype({
    id: "electric",
    name: "80s Cyan Memphis Feature",
    fontFamily: "'Inter', sans-serif",
    headerFont: "'Impact', 'Arial Black', sans-serif",
    accentColor: "#FF2DAA",
    borderColor: "rgba(0,229,255,0.55)",
    borderStyle: "4px solid #00E5FF",
    leftPageBg: "linear-gradient(155deg, #B8F7FF 0%, #00E5FF 42%, #5B7CFF 100%)",
    rightPageBg: "linear-gradient(155deg, #E0B3FF 0%, #FF2DAA 100%)",
    dropCapColor: "#FFD100",
    columnCount: 2,
    inkColor: "#061028",
    mutedInkColor: "rgba(6,16,40,0.78)",
    containerStyle: {},
    titleStyle: {
      fontFamily: "'Impact', 'Arial Black', sans-serif",
      fontSize: "clamp(24px, 4vw, 36px)",
      textTransform: "uppercase",
      color: "#061028",
      textShadow: "3px 3px 0 #FFD100",
    },
    paragraphStyle: {
      fontFamily: "'Inter', sans-serif",
      fontSize: 11.5,
      lineHeight: 1.6,
      color: "#061028",
    },
    pullQuoteStyle: {
      fontFamily: "'Inter', sans-serif",
      fontSize: 14,
      color: "#FF2DAA",
      fontWeight: 800,
      borderLeft: "4px solid #FFD100",
      paddingLeft: 12,
    },
  }),
  jewel: sheetArchetype({
    id: "jewel",
    name: "80s Magenta / Violet Feature",
    fontFamily: "'Georgia', serif",
    headerFont: "'Impact', 'Arial Black', sans-serif",
    accentColor: "#FF2DAA",
    borderColor: "rgba(255,45,170,0.45)",
    borderStyle: "3px solid #FF2DAA",
    leftPageBg: "linear-gradient(155deg, #FFE0F5 0%, #E9D5FF 35%, #C084FC 100%)",
    rightPageBg: "linear-gradient(155deg, #FFD6EC 0%, #FF6B9D 100%)",
    dropCapColor: "#FFD100",
    columnCount: 2,
    inkColor: "#2a0648",
    mutedInkColor: "rgba(42,6,72,0.78)",
    containerStyle: {},
    titleStyle: {
      fontFamily: "'Impact', 'Arial Black', sans-serif",
      fontSize: "clamp(24px, 4vw, 36px)",
      textTransform: "uppercase",
      color: "#2a0648",
      textShadow: "2px 2px 0 #FFD100",
    },
    paragraphStyle: {
      fontFamily: "'Georgia', serif",
      fontSize: 12,
      lineHeight: 1.7,
      color: "#2a0648",
    },
    pullQuoteStyle: {
      fontFamily: "'Georgia', serif",
      fontSize: 14,
      color: "#FF2DAA",
      fontStyle: "italic",
      borderLeft: "3px solid #FFD100",
      paddingLeft: 12,
    },
  }),
  gossip: sheetArchetype({
    id: "gossip",
    name: "Community Gossip Hot Pink",
    fontFamily: "'Inter', sans-serif",
    headerFont: "'Impact', 'Arial Black', sans-serif",
    accentColor: "#FFD100",
    borderColor: "rgba(255,45,170,0.5)",
    borderStyle: "3px solid #FF2DAA",
    leftPageBg: "linear-gradient(155deg, #FFD6EC 0%, #FF6B9D 38%, #AA2DFF 100%)",
    rightPageBg: "linear-gradient(155deg, #FFE566 0%, #FF2DAA 100%)",
    dropCapColor: "#00E5FF",
    columnCount: 1,
    inkColor: "#2a0430",
    mutedInkColor: "rgba(42,4,48,0.78)",
    containerStyle: {},
    titleStyle: {
      fontFamily: "'Impact', 'Arial Black', sans-serif",
      fontSize: "clamp(22px, 3.5vw, 32px)",
      textTransform: "uppercase",
      color: "#2a0430",
      textShadow: "2px 2px 0 #FFD100",
    },
    paragraphStyle: {
      fontFamily: "'Inter', sans-serif",
      fontSize: 11.5,
      lineHeight: 1.55,
      color: "#2a0430",
    },
    pullQuoteStyle: {
      fontFamily: "'Inter', sans-serif",
      fontSize: 13,
      color: "#061028",
      fontWeight: 800,
      borderLeft: "4px solid #FFD100",
      paddingLeft: 12,
    },
  }),
  happyDays: sheetArchetype({
    id: "happyDays",
    name: "Happy Days Full Crayon Box",
    fontFamily: "'Inter', sans-serif",
    headerFont: "'Impact', 'Arial Black', sans-serif",
    accentColor: "#FF3B30",
    borderColor: "rgba(255,59,48,0.45)",
    borderStyle: "3px solid #FF3B30",
    leftPageBg: "linear-gradient(135deg, #FFE566 0%, #7CFF4F 28%, #00E5FF 58%, #FF6B9D 100%)",
    rightPageBg: "linear-gradient(155deg, #FFD100 0%, #FF2DAA 55%, #AA2DFF 100%)",
    dropCapColor: "#061028",
    columnCount: 1,
    inkColor: "#0a1a10",
    mutedInkColor: "rgba(10,26,16,0.8)",
    containerStyle: {},
    titleStyle: {
      fontFamily: "'Impact', 'Arial Black', sans-serif",
      fontSize: "clamp(22px, 3.5vw, 32px)",
      textTransform: "uppercase",
      color: "#061028",
      textShadow: "2px 2px 0 #FFD100",
    },
    paragraphStyle: {
      fontFamily: "'Inter', sans-serif",
      fontSize: 11.5,
      lineHeight: 1.55,
      color: "#0a1a10",
    },
    pullQuoteStyle: {
      fontFamily: "'Inter', sans-serif",
      fontSize: 14,
      color: "#FF3B30",
      fontWeight: 800,
      borderLeft: "4px solid #00E5FF",
      paddingLeft: 12,
    },
  }),
  /** Justified dark only — not the default. */
  cinematic: {
    id: "cinematic",
    name: "Cinematic Dark (Justified)",
    fontFamily: "'Inter', sans-serif",
    headerFont: "'Impact', 'Arial Black', sans-serif",
    accentColor: "#FFD700",
    borderColor: "rgba(255,215,0,0.35)",
    borderStyle: "2px solid #FFD700",
    leftPageBg: "linear-gradient(160deg, #1a1028 0%, #0a0614 100%)",
    rightPageBg: "linear-gradient(160deg, #12081c 0%, #050510 100%)",
    dropCapColor: "#FF2DAA",
    columnCount: 2,
    inkColor: "#f5f3ff",
    mutedInkColor: "rgba(245,243,255,0.75)",
    darkJustified: true,
    containerStyle: {
      boxShadow: "inset 0 0 40px rgba(255,215,0,0.08)",
    },
    titleStyle: {
      fontFamily: "'Impact', 'Arial Black', sans-serif",
      fontSize: "clamp(24px, 4vw, 36px)",
      textTransform: "uppercase",
      color: "#FFD700",
      textShadow: "2px 2px 0 #FF2DAA",
    },
    paragraphStyle: {
      fontFamily: "'Inter', sans-serif",
      fontSize: 11,
      lineHeight: 1.6,
      color: "rgba(245,243,255,0.9)",
    },
    pullQuoteStyle: {
      fontFamily: "'Inter', sans-serif",
      fontSize: 14,
      color: "#00FFFF",
      borderLeft: "4px solid #FFD700",
      paddingLeft: 12,
    },
  },
};

/** Default sheet — 80s Smash Hits yellow (not black, not muted cream). */
export const DEFAULT_MAGAZINE_SHEET_ARCHETYPE: MagazineArchetype = "sunshine";

export function getArchetype(id: MagazineArchetype): ArchetypeConfig {
  return ARCHETYPES[id] ?? ARCHETYPES.cream;
}

export function archetypeList(): ArchetypeConfig[] {
  return Object.values(ARCHETYPES);
}
