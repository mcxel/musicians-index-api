/**
 * LightingSceneEngine.ts
 * Defines lighting scenes and rules for show/game rooms.
 * Controls spotlights, reaction flashes, and winner celebration lights.
 */

import type { NeonPalette } from "./RoomThemeRotationEngine";

export type LightingMode =
  | "idle"
  | "pre-show"
  | "performance"
  | "reaction-boo"
  | "reaction-yay"
  | "winner-reveal"
  | "elimination"
  | "intermission";

export type LightSource = {
  id: string;
  label: string;
  /** Normalized 0–1 position */
  x: number;
  y: number;
  radius: number;
  color: string;
  intensity: number;
  mode: LightingMode;
};

export type LightingScene = {
  mode: LightingMode;
  sources: LightSource[];
  ambientColor: string;
  ambientOpacity: number;
  /** Flash color when crowd reacts */
  flashColor: string | null;
  /** Duration in ms for flash animations */
  flashDurationMs: number;
};

function spot(id: string, label: string, x: number, y: number, radius: number, color: string, mode: LightingMode): LightSource {
  return { id, label, x, y, radius, color, intensity: 1, mode };
}

export function buildLightingScene(mode: LightingMode, palette: NeonPalette): LightingScene {
  switch (mode) {
    case "performance":
      return {
        mode,
        sources: [
          spot("front-l",  "Front Left",  0.25, 0.0, 0.35, palette.primary,   mode),
          spot("front-r",  "Front Right", 0.75, 0.0, 0.35, palette.secondary, mode),
          spot("center",   "Center",      0.5,  0.0, 0.25, "#FFFFFF",          mode),
        ],
        ambientColor: palette.background,
        ambientOpacity: 0.85,
        flashColor: null,
        flashDurationMs: 0,
      };

    case "reaction-yay":
      return {
        mode,
        sources: [
          spot("yay-l", "YAY Left",  0.2, 0.0, 0.4, palette.accent,   mode),
          spot("yay-r", "YAY Right", 0.8, 0.0, 0.4, palette.primary,  mode),
        ],
        ambientColor: palette.accent,
        ambientOpacity: 0.15,
        flashColor: palette.accent,
        flashDurationMs: 600,
      };

    case "reaction-boo":
      return {
        mode,
        sources: [
          spot("boo-c", "BOO Center", 0.5, 0.2, 0.6, "#FF4444", mode),
        ],
        ambientColor: "#FF4444",
        ambientOpacity: 0.12,
        flashColor: "#FF4444",
        flashDurationMs: 400,
      };

    case "winner-reveal":
      return {
        mode,
        sources: [
          spot("win-l",  "Winner Left",  0.2, 0.0, 0.5, palette.primary,   mode),
          spot("win-c",  "Winner Center",0.5, 0.0, 0.6, "#FFFFFF",          mode),
          spot("win-r",  "Winner Right", 0.8, 0.0, 0.5, palette.secondary,  mode),
          spot("win-g1", "Glow 1",       0.3, 0.5, 0.3, palette.accent,     mode),
          spot("win-g2", "Glow 2",       0.7, 0.5, 0.3, palette.glow,       mode),
        ],
        ambientColor: palette.primary,
        ambientOpacity: 0.2,
        flashColor: palette.primary,
        flashDurationMs: 1200,
      };

    case "elimination":
      return {
        mode,
        sources: [
          spot("elim-c", "Elimination", 0.5, 0.1, 0.4, "#FF4444", mode),
        ],
        ambientColor: "#1A0000",
        ambientOpacity: 0.9,
        flashColor: "#FF2200",
        flashDurationMs: 800,
      };

    case "pre-show":
      return {
        mode,
        sources: [
          spot("pre-l", "Pre-Show Left",  0.15, 0.0, 0.5, palette.secondary, mode),
          spot("pre-r", "Pre-Show Right", 0.85, 0.0, 0.5, palette.primary,   mode),
        ],
        ambientColor: palette.background,
        ambientOpacity: 0.7,
        flashColor: null,
        flashDurationMs: 0,
      };

    default: // idle / intermission
      return {
        mode,
        sources: [
          spot("idle-c", "Idle Center", 0.5, 0.0, 0.6, palette.glow, mode),
        ],
        ambientColor: palette.background,
        ambientOpacity: 0.6,
        flashColor: null,
        flashDurationMs: 0,
      };
  }
}
