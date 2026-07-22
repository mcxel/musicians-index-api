import type { CSSProperties } from "react";

export type MagazineArchetype = "vibe" | "ebony" | "jet" | "modern" | "classic";

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
  containerStyle: CSSProperties;
  titleStyle: CSSProperties;
  paragraphStyle: CSSProperties;
  pullQuoteStyle: CSSProperties;
}

export const ARCHETYPES: Record<MagazineArchetype, ArchetypeConfig> = {
  vibe: {
    id: "vibe",
    name: "90s Vibe (Neon Gloss)",
    fontFamily: "'Inter', sans-serif",
    headerFont: "'Impact', 'Arial Black', sans-serif",
    accentColor: "#FF2DAA",
    borderColor: "rgba(255, 45, 170, 0.4)",
    borderStyle: "4px solid #FF2DAA",
    leftPageBg: "linear-gradient(160deg, #1f083a, #0b0214)",
    rightPageBg: "linear-gradient(160deg, #090118, #18032e)",
    dropCapColor: "#00FFFF",
    columnCount: 2,
    containerStyle: {
      textShadow: "0 0 10px rgba(255,45,170,0.3)",
      boxShadow: "inset 0 0 40px rgba(255,45,170,0.15)",
    },
    titleStyle: {
      fontFamily: "'Impact', 'Arial Black', sans-serif",
      fontSize: "clamp(24px, 4vw, 36px)",
      textTransform: "uppercase",
      letterSpacing: "0.04em",
      color: "#FF2DAA",
      textShadow: "2px 2px 0px #00FFFF",
    },
    paragraphStyle: {
      fontFamily: "'Inter', sans-serif",
      fontSize: 11,
      lineHeight: 1.6,
      color: "rgba(255,255,255,0.85)",
    },
    pullQuoteStyle: {
      fontFamily: "'Impact', 'Arial Black', sans-serif",
      fontSize: 14,
      color: "#00FFFF",
      textTransform: "uppercase",
      borderLeft: "4px solid #FF2DAA",
      paddingLeft: 12,
      fontStyle: "normal",
    },
  },
  ebony: {
    id: "ebony",
    name: "Classic Ebony (Gold & Serif)",
    fontFamily: "'Georgia', serif",
    headerFont: "'Georgia', serif",
    accentColor: "#FFD700",
    borderColor: "rgba(255, 215, 0, 0.3)",
    borderStyle: "3px double #FFD700",
    leftPageBg: "linear-gradient(160deg, #1a1200, #0a0700)",
    rightPageBg: "linear-gradient(160deg, #080500, #140e00)",
    dropCapColor: "#FFD700",
    columnCount: 2,
    containerStyle: {
      boxShadow: "inset 0 0 30px rgba(255,215,0,0.1)",
    },
    titleStyle: {
      fontFamily: "'Georgia', serif",
      fontSize: "clamp(22px, 3.5vw, 32px)",
      fontWeight: 900,
      color: "#FFD700",
      letterSpacing: "-0.02em",
    },
    paragraphStyle: {
      fontFamily: "'Georgia', serif",
      fontSize: 12,
      lineHeight: 1.7,
      color: "#eaeaea",
    },
    pullQuoteStyle: {
      fontFamily: "'Georgia', serif",
      fontSize: 13,
      color: "#ffd700",
      fontStyle: "italic",
      borderLeft: "3px solid #ffd700",
      paddingLeft: 12,
    },
  },
  jet: {
    id: "jet",
    name: "Vintage Jet (Intimate Serif)",
    fontFamily: "'Times New Roman', Times, serif",
    headerFont: "'Arial Black', sans-serif",
    accentColor: "#E63000",
    borderColor: "rgba(230, 48, 0, 0.4)",
    borderStyle: "2px solid #E63000",
    leftPageBg: "linear-gradient(160deg, #1c0502, #0a0100)",
    rightPageBg: "linear-gradient(160deg, #060100, #180402)",
    dropCapColor: "#E63000",
    columnCount: 1,
    containerStyle: {
      boxShadow: "inset 0 0 24px rgba(230,48,0,0.08)",
    },
    titleStyle: {
      fontFamily: "'Arial Black', sans-serif",
      fontSize: "clamp(20px, 3vw, 28px)",
      fontWeight: 900,
      textTransform: "uppercase",
      color: "#fff",
      borderBottom: "2px solid #E63000",
      paddingBottom: 6,
    },
    paragraphStyle: {
      fontFamily: "'Times New Roman', Times, serif",
      fontSize: 12.5,
      lineHeight: 1.6,
      color: "#e2e2e2",
    },
    pullQuoteStyle: {
      fontFamily: "'Times New Roman', Times, serif",
      fontSize: 13.5,
      color: "#E63000",
      fontWeight: "bold",
      fontStyle: "italic",
      textAlign: "center",
      borderTop: "1px solid rgba(230,48,0,0.3)",
      borderBottom: "1px solid rgba(230,48,0,0.3)",
      padding: "8px 0",
    },
  },
  modern: {
    id: "modern",
    name: "Modern (Glassmorphic Mono)",
    fontFamily: "'Courier New', Courier, monospace",
    headerFont: "'Courier New', Courier, monospace",
    accentColor: "#00FFFF",
    borderColor: "rgba(0, 255, 255, 0.3)",
    borderStyle: "1px solid rgba(0, 255, 255, 0.4)",
    leftPageBg: "linear-gradient(160deg, #021a22, #000c10)",
    rightPageBg: "linear-gradient(160deg, #00080a, #03161c)",
    dropCapColor: "#00FF88",
    columnCount: 1,
    containerStyle: {
      backdropFilter: "blur(12px)",
      boxShadow: "inset 0 0 50px rgba(0,255,255,0.05)",
    },
    titleStyle: {
      fontFamily: "'Courier New', Courier, monospace",
      fontSize: "clamp(18px, 2.5vw, 24px)",
      fontWeight: 900,
      color: "#00FFFF",
      letterSpacing: "0.1em",
      textTransform: "uppercase",
    },
    paragraphStyle: {
      fontFamily: "'Courier New', Courier, monospace",
      fontSize: 10.5,
      lineHeight: 1.5,
      color: "#8cd5e8",
    },
    pullQuoteStyle: {
      fontFamily: "'Courier New', Courier, monospace",
      fontSize: 11,
      color: "#00FF88",
      borderLeft: "2px solid #00FF88",
      paddingLeft: 10,
    },
  },
  classic: {
    id: "classic",
    name: "Classic Print (Balanced Editorial)",
    fontFamily: "serif",
    headerFont: "serif",
    accentColor: "#ff7b00",
    borderColor: "rgba(255,123,0,0.2)",
    borderStyle: "1px solid rgba(255,123,0,0.4)",
    leftPageBg: "linear-gradient(160deg, #24190f, #100a06)",
    rightPageBg: "linear-gradient(160deg, #0c0805, #1d140c)",
    dropCapColor: "#ff7b00",
    columnCount: 2,
    containerStyle: {
      boxShadow: "inset 0 0 30px rgba(255,255,255,0.03)",
    },
    titleStyle: {
      fontFamily: "serif",
      fontSize: "clamp(22px, 3.5vw, 30px)",
      fontWeight: "bold",
      color: "#eae3d2",
      fontStyle: "italic",
    },
    paragraphStyle: {
      fontFamily: "serif",
      fontSize: 12,
      lineHeight: 1.65,
      color: "#d1c9b8",
    },
    pullQuoteStyle: {
      fontFamily: "serif",
      fontSize: 13,
      color: "#ff7b00",
      fontStyle: "italic",
      borderLeft: "2px solid #ff7b00",
      paddingLeft: 10,
    },
  },
};
