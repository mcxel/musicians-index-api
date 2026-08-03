/**
 * Champion Visual Identity — lightweight CSS tokens / border accents (Phase 2C).
 * No full CineCall theme stack. Applied when performer holds an ACTIVE crown/belt.
 */

import type { CSSProperties } from "react";
import { listTitlesForHolder } from "./ChampionshipRegistry";
import type { ChampionshipAssetType } from "./types";

export const CHAMPION_CSS_VARS = {
  crown: "#FFD700",
  belt: "#FF6B35",
  trophy: "#00FFFF",
  glow: "rgba(255, 215, 0, 0.35)",
} as const;

export type ChampionAccentKind = "none" | "crown" | "belt" | "trophy" | "multi";

export interface ChampionVisualIdentity {
  performerId: string;
  kind: ChampionAccentKind;
  /** CSS class for cards / profile chrome */
  className: string;
  borderColor: string | null;
  bannerAccent: string | null;
  heldAssetTypes: ChampionshipAssetType[];
  titleLabels: string[];
}

export function getChampionVisualIdentity(performerId: string): ChampionVisualIdentity {
  const held = listTitlesForHolder(performerId).filter((t) => t.status === "ACTIVE");
  const types = Array.from(new Set(held.map((t) => t.assetType)));
  const labels = held.map((t) => t.label);

  if (held.length === 0) {
    return {
      performerId,
      kind: "none",
      className: "",
      borderColor: null,
      bannerAccent: null,
      heldAssetTypes: [],
      titleLabels: [],
    };
  }

  const hasCrown = types.includes("CROWN");
  const hasBelt = types.includes("BELT");
  const hasTrophy = types.includes("TROPHY");

  let kind: ChampionAccentKind = "multi";
  let borderColor: string = CHAMPION_CSS_VARS.crown;
  let className = "tmi-champion-accent tmi-champion-multi";

  if (hasCrown && !hasBelt && !hasTrophy) {
    kind = "crown";
    borderColor = CHAMPION_CSS_VARS.crown;
    className = "tmi-champion-accent tmi-champion-crown";
  } else if (hasBelt && !hasCrown && !hasTrophy) {
    kind = "belt";
    borderColor = CHAMPION_CSS_VARS.belt;
    className = "tmi-champion-accent tmi-champion-belt";
  } else if (hasTrophy && !hasCrown && !hasBelt) {
    kind = "trophy";
    borderColor = CHAMPION_CSS_VARS.trophy;
    className = "tmi-champion-accent tmi-champion-trophy";
  }

  return {
    performerId,
    kind,
    className,
    borderColor,
    bannerAccent: borderColor,
    heldAssetTypes: types,
    titleLabels: labels,
  };
}

/** Inline style fragment for performer cards / marketplace banners. */
export function championCardStyle(performerId: string): CSSProperties {
  const id = getChampionVisualIdentity(performerId);
  if (!id.borderColor) return {};
  return {
    border: `2px solid ${id.borderColor}`,
    boxShadow: `0 0 16px ${CHAMPION_CSS_VARS.glow}`,
  };
}
