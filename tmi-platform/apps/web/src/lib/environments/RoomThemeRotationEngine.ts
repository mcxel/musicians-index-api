/**
 * RoomThemeRotationEngine.ts
 * Manages monthly/episodic theme rotation for show and game rooms.
 * 80s neon magazine canon: bright, multicolor, no gray.
 */

import type { RoomId } from "./RoomDesignEngine";

export type NeonPalette = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  glow: string;
};

export type RoomTheme = {
  key: string;
  label: string;
  palette: NeonPalette;
  /** CSS background value for the room shell */
  backgroundCss: string;
  /** Spotlight color for winner celebration */
  celebrationColor: string;
  /** Whether confetti is active for this theme */
  confettiEnabled: boolean;
};

const THEME_CATALOG: RoomTheme[] = [
  {
    key: "neon-magenta",
    label: "Neon Magenta",
    palette: { primary: "#FF2DAA", secondary: "#E34FFF", accent: "#00FFFF", background: "#050510", glow: "#FF2DAA" },
    backgroundCss: "radial-gradient(ellipse at 20% 10%, #FF2DAA33 0%, transparent 55%), radial-gradient(ellipse at 80% 90%, #E34FFF22 0%, transparent 50%), #050510",
    celebrationColor: "#FF2DAA",
    confettiEnabled: true,
  },
  {
    key: "electric-cyan",
    label: "Electric Cyan",
    palette: { primary: "#00FFFF", secondary: "#00FF88", accent: "#FF2DAA", background: "#020B12", glow: "#00FFFF" },
    backgroundCss: "radial-gradient(ellipse at 15% 20%, #00FFFF2A 0%, transparent 50%), radial-gradient(ellipse at 85% 80%, #00FF882A 0%, transparent 50%), #020B12",
    celebrationColor: "#00FFFF",
    confettiEnabled: true,
  },
  {
    key: "gold-showtime",
    label: "Gold Showtime",
    palette: { primary: "#FFD700", secondary: "#FF8C00", accent: "#FF2DAA", background: "#080500", glow: "#FFD700" },
    backgroundCss: "radial-gradient(ellipse at 50% 0%, #FFD70033 0%, transparent 60%), radial-gradient(ellipse at 10% 100%, #FF8C0022 0%, transparent 50%), #080500",
    celebrationColor: "#FFD700",
    confettiEnabled: true,
  },
  {
    key: "violet-stage",
    label: "Violet Stage",
    palette: { primary: "#AA2DFF", secondary: "#E34FFF", accent: "#00FFFF", background: "#06020E", glow: "#AA2DFF" },
    backgroundCss: "radial-gradient(ellipse at 30% 15%, #AA2DFF33 0%, transparent 55%), radial-gradient(ellipse at 70% 85%, #E34FFF22 0%, transparent 50%), #06020E",
    celebrationColor: "#AA2DFF",
    confettiEnabled: false,
  },
  {
    key: "red-arena",
    label: "Red Arena",
    palette: { primary: "#FF4444", secondary: "#FF8800", accent: "#FFD700", background: "#0A0202", glow: "#FF4444" },
    backgroundCss: "radial-gradient(ellipse at 50% 5%, #FF444433 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, #FF880022 0%, transparent 50%), #0A0202",
    celebrationColor: "#FF4444",
    confettiEnabled: true,
  },
];

/** Room-to-theme assignment map — rotates monthly */
const ROOM_THEME_SEQUENCE: Record<RoomId, string[]> = {
  "monthly-idol":       ["neon-magenta", "electric-cyan", "gold-showtime", "violet-stage", "red-arena"],
  "monday-night-stage": ["gold-showtime", "red-arena", "neon-magenta", "electric-cyan", "violet-stage"],
  "deal-or-feud":       ["gold-showtime", "electric-cyan", "red-arena", "neon-magenta", "violet-stage"],
  "name-that-tune":     ["electric-cyan", "neon-magenta", "violet-stage", "gold-showtime", "red-arena"],
  "circle-squares":     ["violet-stage", "electric-cyan", "neon-magenta", "red-arena", "gold-showtime"],
  "cypher":             ["red-arena", "violet-stage", "neon-magenta", "electric-cyan", "gold-showtime"],
  "lobbies":            ["neon-magenta", "violet-stage", "electric-cyan", "gold-showtime", "red-arena"],
};

export function getThemeByKey(key: string): RoomTheme {
  return THEME_CATALOG.find((t) => t.key === key) ?? THEME_CATALOG[0];
}

export function getActiveThemeForRoom(roomId: RoomId, monthIndex?: number): RoomTheme {
  const sequence = ROOM_THEME_SEQUENCE[roomId] ?? ["neon-magenta"];
  const month = monthIndex ?? new Date().getMonth();
  const key = sequence[month % sequence.length];
  return getThemeByKey(key ?? "neon-magenta");
}

export function getAllThemesForRoom(roomId: RoomId): RoomTheme[] {
  const sequence = ROOM_THEME_SEQUENCE[roomId] ?? ["neon-magenta"];
  return sequence.map(getThemeByKey);
}

export { THEME_CATALOG };
