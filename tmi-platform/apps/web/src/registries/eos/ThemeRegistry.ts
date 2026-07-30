/**
 * EOS Theme Registry — bridges VenueSkinRegistry + competition ThemeRegistry
 * and Flight Deck bezel design tokens (Phase 3).
 */

import { getVenueSkinById, getDefaultVenueSkin } from "../venues/VenueSkinRegistry";
import { THEMES as COMPETITION_THEMES } from "@/lib/competition/ThemeRegistry";

export interface EosThemeRef {
  id: string;
  source: "venue_skin" | "competition";
  displayName: string;
}

// ─── Flight Deck Bezel Themes (Phase 3) ─────────────────────────────────────

export type FlightDeckThemeId =
  | "obsidian_gold"
  | "neon_cyan"
  | "performer_purple"
  | "admin_gold";

export interface FlightDeckTheme {
  id: FlightDeckThemeId;
  displayName: string;
  borderColor: string;
  headerBg: string;
  headerText: string;
  panelBg: string;
  shadow: string;
  borderRadius: number;
  contentPadding: number;
}

export const FLIGHT_DECK_THEMES: Record<FlightDeckThemeId, FlightDeckTheme> = {
  obsidian_gold: {
    id: "obsidian_gold",
    displayName: "Obsidian & Gold",
    borderColor: "#854d0e",
    headerBg: "rgba(5, 5, 16, 0.95)",
    headerText: "#ca8a04",
    panelBg: "rgba(5, 5, 20, 0.92)",
    shadow: "0 8px 32px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(202, 138, 4, 0.12)",
    borderRadius: 12,
    contentPadding: 0,
  },
  neon_cyan: {
    id: "neon_cyan",
    displayName: "Neon Cyan",
    borderColor: "#0891b2",
    headerBg: "rgba(5, 5, 16, 0.95)",
    headerText: "#00FFFF",
    panelBg: "rgba(5, 5, 20, 0.92)",
    shadow: "0 8px 32px rgba(0, 0, 0, 0.85), 0 0 16px rgba(0, 255, 255, 0.08)",
    borderRadius: 12,
    contentPadding: 0,
  },
  performer_purple: {
    id: "performer_purple",
    displayName: "Performer Purple",
    borderColor: "#7c3aed",
    headerBg: "rgba(5, 5, 16, 0.95)",
    headerText: "#AA2DFF",
    panelBg: "rgba(5, 5, 20, 0.92)",
    shadow: "0 8px 32px rgba(0, 0, 0, 0.85), 0 0 16px rgba(170, 45, 255, 0.1)",
    borderRadius: 12,
    contentPadding: 0,
  },
  admin_gold: {
    id: "admin_gold",
    displayName: "Admin Gold",
    borderColor: "#b45309",
    headerBg: "rgba(5, 5, 16, 0.95)",
    headerText: "#FFD700",
    panelBg: "rgba(5, 5, 20, 0.92)",
    shadow: "0 8px 32px rgba(0, 0, 0, 0.85), 0 0 20px rgba(255, 215, 0, 0.08)",
    borderRadius: 12,
    contentPadding: 0,
  },
};

export function getFlightDeckTheme(themeId: FlightDeckThemeId = "obsidian_gold"): FlightDeckTheme {
  return FLIGHT_DECK_THEMES[themeId] ?? FLIGHT_DECK_THEMES.obsidian_gold;
}

/** Map dashboard workspace / membership tier to bezel theme. */
export function resolveFlightDeckTheme(
  workspace: "fan" | "performer" | "admin",
  tier?: string
): FlightDeckThemeId {
  if (workspace === "admin") return "admin_gold";
  if (workspace === "performer") return "performer_purple";
  const upper = (tier ?? "FREE").toUpperCase();
  if (["PLATINUM", "DIAMOND"].includes(upper)) return "neon_cyan";
  return "obsidian_gold";
}

export function resolveThemeRef(themeId: string | undefined): EosThemeRef {
  if (!themeId) {
    const def = getDefaultVenueSkin();
    return { id: def.id, source: "venue_skin", displayName: def.displayName };
  }

  const venueSkin = getVenueSkinById(themeId);
  if (venueSkin) {
    return { id: venueSkin.id, source: "venue_skin", displayName: venueSkin.displayName };
  }

  const compTheme = COMPETITION_THEMES[themeId];
  if (compTheme) {
    return { id: compTheme.id, source: "competition", displayName: compTheme.name };
  }

  const fallback = getDefaultVenueSkin();
  return { id: fallback.id, source: "venue_skin", displayName: fallback.displayName };
}

export function listAvailableThemeIds(): string[] {
  const competitionIds = Object.keys(COMPETITION_THEMES);
  return competitionIds;
}
