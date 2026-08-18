/**
 * EditorialCutRegistry.ts
 * 
 * TMI Canonical Editorial Cut-Shape System.
 * Defines 12 approved polygon cut-shapes for magazine spreads, cards,
 * portraits, and promotional modules.
 *
 * Core Rule: LAYOUT ≠ THEME ≠ CONTENT ≠ MONETIZATION
 * All shapes preserve safe text insets and non-overlapping control clearance.
 */

export type EditorialCutShape =
  | "RECTANGLE"
  | "ONE_CORNER"
  | "TWO_CORNER"
  | "TRAPEZOID"
  | "RIBBON"
  | "FLAG"
  | "TICKET"
  | "POLAROID"
  | "TORN_POSTER"
  | "HEX"
  | "CIRCLE"
  | "PORTRAIT_CUTOUT";

export interface CutShapeConfig {
  id: EditorialCutShape;
  name: string;
  clipPath: string;
  borderRadius?: string;
  shadowStyle?: string;
  safeTextPadding: string;
  recommendedAspect: "portrait" | "landscape" | "square" | "free";
}

export const EDITORIAL_CUT_REGISTRY: Record<EditorialCutShape, CutShapeConfig> = {
  RECTANGLE: {
    id: "RECTANGLE",
    name: "Classic Rectangle",
    clipPath: "none",
    borderRadius: "8px",
    shadowStyle: "0 8px 24px rgba(0,0,0,0.5)",
    safeTextPadding: "16px",
    recommendedAspect: "free",
  },
  ONE_CORNER: {
    id: "ONE_CORNER",
    name: "Single Angled Cut",
    clipPath: "polygon(0 0, 85% 0, 100% 15%, 100% 100%, 0 100%)",
    borderRadius: "0px",
    shadowStyle: "0 10px 28px rgba(0,0,0,0.6)",
    safeTextPadding: "18px 22px 18px 18px",
    recommendedAspect: "portrait",
  },
  TWO_CORNER: {
    id: "TWO_CORNER",
    name: "Diagonal Dual Cut",
    clipPath: "polygon(12% 0, 100% 0, 100% 88%, 88% 100%, 0 100%, 0 12%)",
    borderRadius: "0px",
    shadowStyle: "0 12px 32px rgba(0,0,0,0.65)",
    safeTextPadding: "20px",
    recommendedAspect: "square",
  },
  TRAPEZOID: {
    id: "TRAPEZOID",
    name: "Dynamic Trapezoid",
    clipPath: "polygon(0 0, 100% 4%, 96% 100%, 4% 96%)",
    borderRadius: "0px",
    shadowStyle: "0 10px 26px rgba(0,0,0,0.55)",
    safeTextPadding: "20px 24px",
    recommendedAspect: "landscape",
  },
  RIBBON: {
    id: "RIBBON",
    name: "Editorial Header Ribbon",
    clipPath: "polygon(0 0, 100% 0, 95% 50%, 100% 100%, 0 100%, 5% 50%)",
    borderRadius: "0px",
    shadowStyle: "0 6px 18px rgba(0,0,0,0.4)",
    safeTextPadding: "10px 28px",
    recommendedAspect: "landscape",
  },
  FLAG: {
    id: "FLAG",
    name: "Pennant / Category Flag",
    clipPath: "polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%)",
    borderRadius: "0px",
    shadowStyle: "0 8px 20px rgba(0,0,0,0.5)",
    safeTextPadding: "16px 16px 28px 16px",
    recommendedAspect: "portrait",
  },
  TICKET: {
    id: "TICKET",
    name: "Concert Ticket Stub",
    clipPath: "polygon(0 0, 100% 0, 100% 35%, 96% 40%, 96% 60%, 100% 65%, 100% 100%, 0 100%, 0 65%, 4% 60%, 4% 40%, 0 35%)",
    borderRadius: "0px",
    shadowStyle: "0 8px 22px rgba(0,0,0,0.6)",
    safeTextPadding: "18px 26px",
    recommendedAspect: "landscape",
  },
  POLAROID: {
    id: "POLAROID",
    name: "Backstage Polaroid",
    clipPath: "none",
    borderRadius: "3px",
    shadowStyle: "0 14px 36px rgba(0,0,0,0.75)",
    safeTextPadding: "12px 12px 38px 12px",
    recommendedAspect: "portrait",
  },
  TORN_POSTER: {
    id: "TORN_POSTER",
    name: "Retro Torn Poster Edge",
    clipPath: "polygon(0 0, 98% 2%, 96% 25%, 100% 50%, 95% 75%, 98% 100%, 2% 98%, 4% 75%, 0 50%, 3% 25%)",
    borderRadius: "0px",
    shadowStyle: "0 16px 40px rgba(0,0,0,0.8)",
    safeTextPadding: "24px",
    recommendedAspect: "free",
  },
  HEX: {
    id: "HEX",
    name: "Modular Hexagon Cell",
    clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
    borderRadius: "0px",
    shadowStyle: "0 8px 20px rgba(0,0,0,0.5)",
    safeTextPadding: "20px 30px",
    recommendedAspect: "square",
  },
  CIRCLE: {
    id: "CIRCLE",
    name: "Circular Inset Portrait",
    clipPath: "circle(50% at 50% 50%)",
    borderRadius: "50%",
    shadowStyle: "0 10px 30px rgba(0,0,0,0.6)",
    safeTextPadding: "16px",
    recommendedAspect: "square",
  },
  PORTRAIT_CUTOUT: {
    id: "PORTRAIT_CUTOUT",
    name: "Edge-Bleed Portrait Cutout",
    clipPath: "none",
    borderRadius: "0px",
    shadowStyle: "0 20px 50px rgba(0,0,0,0.85)",
    safeTextPadding: "0px",
    recommendedAspect: "portrait",
  },
};

export function getCutShapeStyle(shape: EditorialCutShape, customAccent?: string): React.CSSProperties {
  const config = EDITORIAL_CUT_REGISTRY[shape] ?? EDITORIAL_CUT_REGISTRY.RECTANGLE;
  return {
    clipPath: config.clipPath !== "none" ? config.clipPath : undefined,
    borderRadius: config.borderRadius,
    boxShadow: config.shadowStyle,
    border: customAccent ? `1px solid ${customAccent}66` : undefined,
  };
}
