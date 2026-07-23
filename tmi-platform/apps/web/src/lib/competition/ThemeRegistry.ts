"use client";

import { useState, useEffect } from "react";

// Generalized 2026-07-22 (Phase 1 of the Path-b Competition Runtime plan):
// was Battle-only. Extended to Challenge/Cypher without changing the shape
// existing consumers (TmiVersusBattleArena's useActiveBattleTheme) rely on -
// leftFrame/rightFrame stay meaningful as "primary/secondary accent" even
// for non-versus formats, so nothing had to be renamed.
export type CompetitionFormat = "BATTLE" | "CHALLENGE" | "CYPHER";

export interface ExperienceTheme {
  id: string;
  name: string;
  formats: CompetitionFormat[];
  colors: {
    background: string;
    leftFrame: string;
    rightFrame: string;
    glowLeft: string;
    glowRight: string;
    text: string;
    alert: string;
  };
  typography: {
    heading: string;
    body: string;
  };
}

export const THEMES: Record<string, ExperienceTheme> = {
  "cyber-neon": {
    id: "cyber-neon",
    name: "Cyber Neon",
    formats: ["BATTLE"],
    colors: {
      background: "radial-gradient(circle at center, rgba(20, 10, 40, 0.85) 0%, rgba(2, 2, 8, 1) 100%)",
      leftFrame: "#00F0FF",
      rightFrame: "#FF2DAA",
      glowLeft: "rgba(0, 240, 255, 0.5)",
      glowRight: "rgba(255, 45, 170, 0.5)",
      text: "#ffffff",
      alert: "#FF2DAA",
    },
    typography: {
      heading: '"Bebas Neue", Impact, sans-serif',
      body: "'Inter', sans-serif",
    },
  },
  "toxic-matrix": {
    id: "toxic-matrix",
    name: "Toxic Matrix",
    formats: ["BATTLE"],
    colors: {
      background: "radial-gradient(circle at center, rgba(10, 30, 15, 0.85) 0%, rgba(2, 6, 2, 1) 100%)",
      leftFrame: "#00FF66",
      rightFrame: "#9D00FF",
      glowLeft: "rgba(0, 255, 102, 0.5)",
      glowRight: "rgba(157, 0, 255, 0.5)",
      text: "#ffffff",
      alert: "#00FF66",
    },
    typography: {
      heading: '"Bebas Neue", Impact, sans-serif',
      body: "'Inter', sans-serif",
    },
  },
  "solar-flare": {
    id: "solar-flare",
    name: "Solar Flare",
    formats: ["BATTLE"],
    colors: {
      background: "radial-gradient(circle at center, rgba(35, 15, 5, 0.85) 0%, rgba(8, 2, 2, 1) 100%)",
      leftFrame: "#FFB800",
      rightFrame: "#FF0055",
      glowLeft: "rgba(255, 184, 0, 0.5)",
      glowRight: "rgba(255, 0, 85, 0.5)",
      text: "#ffffff",
      alert: "#FF0055",
    },
    typography: {
      heading: '"Bebas Neue", Impact, sans-serif',
      body: "'Inter', sans-serif",
    },
  },
  "midnight-ice": {
    id: "midnight-ice",
    name: "Midnight ICE",
    formats: ["BATTLE"],
    colors: {
      background: "radial-gradient(circle at center, rgba(5, 15, 35, 0.85) 0%, rgba(2, 4, 10, 1) 100%)",
      leftFrame: "#0051FF",
      rightFrame: "#E0F7FA",
      glowLeft: "rgba(0, 81, 255, 0.5)",
      glowRight: "rgba(224, 247, 250, 0.5)",
      text: "#ffffff",
      alert: "#0051FF",
    },
    typography: {
      heading: '"Bebas Neue", Impact, sans-serif',
      body: "'Inter', sans-serif",
    },
  },

  // ── Challenge — mission/progression identity, never reuses Battle's
  // hard VS-split framing language ──────────────────────────────────────
  "challenge-mission-grid": {
    id: "challenge-mission-grid",
    name: "Mission Grid",
    formats: ["CHALLENGE"],
    colors: {
      background: "radial-gradient(circle at center, rgba(10, 25, 20, 0.85) 0%, rgba(2, 6, 4, 1) 100%)",
      leftFrame: "#00FF88",
      rightFrame: "#111111",
      glowLeft: "rgba(0, 255, 136, 0.5)",
      glowRight: "rgba(0, 0, 0, 0.5)",
      text: "#ffffff",
      alert: "#FFD700",
    },
    typography: { heading: '"Bebas Neue", Impact, sans-serif', body: "'Inter', sans-serif" },
  },
  "challenge-vocal-gold": {
    id: "challenge-vocal-gold",
    name: "Vocal Gold",
    formats: ["CHALLENGE"],
    colors: {
      background: "radial-gradient(circle at center, rgba(35, 25, 5, 0.85) 0%, rgba(8, 5, 1, 1) 100%)",
      leftFrame: "#FFD700",
      rightFrame: "#7A1F2B",
      glowLeft: "rgba(255, 215, 0, 0.5)",
      glowRight: "rgba(122, 31, 43, 0.5)",
      text: "#ffffff",
      alert: "#FFD700",
    },
    typography: { heading: '"Bebas Neue", Impact, sans-serif', body: "'Inter', sans-serif" },
  },
  "challenge-instrument-arena": {
    id: "challenge-instrument-arena",
    name: "Instrument Arena",
    formats: ["CHALLENGE"],
    colors: {
      background: "radial-gradient(circle at center, rgba(25, 15, 5, 0.85) 0%, rgba(6, 3, 1, 1) 100%)",
      leftFrame: "#C87533",
      rightFrame: "#0077BE",
      glowLeft: "rgba(200, 117, 51, 0.5)",
      glowRight: "rgba(0, 119, 190, 0.5)",
      text: "#ffffff",
      alert: "#C87533",
    },
    typography: { heading: '"Bebas Neue", Impact, sans-serif', body: "'Inter', sans-serif" },
  },
  "challenge-comedy-club": {
    id: "challenge-comedy-club",
    name: "Comedy Club",
    formats: ["CHALLENGE"],
    colors: {
      background: "radial-gradient(circle at center, rgba(30, 15, 30, 0.85) 0%, rgba(7, 2, 7, 1) 100%)",
      leftFrame: "#FF6B00",
      rightFrame: "#9D00FF",
      glowLeft: "rgba(255, 107, 0, 0.5)",
      glowRight: "rgba(157, 0, 255, 0.5)",
      text: "#ffffff",
      alert: "#FF6B00",
    },
    typography: { heading: '"Bebas Neue", Impact, sans-serif', body: "'Inter', sans-serif" },
  },

  // ── Cypher — rotation/community identity, circular/flowing rather
  // than Battle's hard split ─────────────────────────────────────────────
  "cypher-underground": {
    id: "cypher-underground",
    name: "Underground",
    formats: ["CYPHER"],
    colors: {
      background: "radial-gradient(circle at center, rgba(25, 10, 35, 0.85) 0%, rgba(5, 2, 8, 1) 100%)",
      leftFrame: "#9D00FF",
      rightFrame: "#008080",
      glowLeft: "rgba(157, 0, 255, 0.5)",
      glowRight: "rgba(0, 128, 128, 0.5)",
      text: "#ffffff",
      alert: "#9D00FF",
    },
    typography: { heading: '"Bebas Neue", Impact, sans-serif', body: "'Inter', sans-serif" },
  },
  "cypher-legacy": {
    id: "cypher-legacy",
    name: "Legacy",
    formats: ["CYPHER"],
    colors: {
      background: "radial-gradient(circle at center, rgba(30, 22, 5, 0.85) 0%, rgba(7, 5, 1, 1) 100%)",
      leftFrame: "#FFD700",
      rightFrame: "#8B0000",
      glowLeft: "rgba(255, 215, 0, 0.5)",
      glowRight: "rgba(139, 0, 0, 0.5)",
      text: "#ffffff",
      alert: "#FFD700",
    },
    typography: { heading: '"Bebas Neue", Impact, sans-serif', body: "'Inter', sans-serif" },
  },
  "cypher-world-finals": {
    id: "cypher-world-finals",
    name: "World Finals",
    formats: ["CYPHER"],
    colors: {
      background: "radial-gradient(circle at center, rgba(5, 15, 30, 0.85) 0%, rgba(1, 3, 8, 1) 100%)",
      leftFrame: "#00F0FF",
      rightFrame: "#FFD700",
      glowLeft: "rgba(0, 240, 255, 0.5)",
      glowRight: "rgba(255, 215, 0, 0.5)",
      text: "#ffffff",
      alert: "#00F0FF",
    },
    typography: { heading: '"Bebas Neue", Impact, sans-serif', body: "'Inter', sans-serif" },
  },
  "cypher-neon-cipher": {
    id: "cypher-neon-cipher",
    name: "Neon Cipher",
    formats: ["CYPHER"],
    colors: {
      background: "radial-gradient(circle at center, rgba(10, 30, 25, 0.85) 0%, rgba(2, 7, 6, 1) 100%)",
      leftFrame: "#00FFAA",
      rightFrame: "#AA2DFF",
      glowLeft: "rgba(0, 255, 170, 0.5)",
      glowRight: "rgba(170, 45, 255, 0.5)",
      text: "#ffffff",
      alert: "#00FFAA",
    },
    typography: { heading: '"Bebas Neue", Impact, sans-serif', body: "'Inter', sans-serif" },
  },
};

export function getThemesForFormat(format: CompetitionFormat): ExperienceTheme[] {
  return Object.values(THEMES).filter((t) => t.formats.includes(format));
}

// Per-format subscriber registry — Battle/Challenge/Cypher each get their
// own independent active theme, so switching one doesn't reset another.
type ThemeChangeListener = (themeId: string) => void;
const listenersByFormat: Record<CompetitionFormat, Set<ThemeChangeListener>> = {
  BATTLE: new Set(),
  CHALLENGE: new Set(),
  CYPHER: new Set(),
};

function storageKeyFor(format: CompetitionFormat): string {
  // BATTLE keeps its original key so existing saved preferences aren't lost.
  return format === "BATTLE" ? "tmi_active_battle_theme" : `tmi_active_${format.toLowerCase()}_theme`;
}

export function registerThemeListener(listener: ThemeChangeListener, format: CompetitionFormat = "BATTLE") {
  listenersByFormat[format].add(listener);
  return () => {
    listenersByFormat[format].delete(listener);
  };
}

export function dispatchThemeChange(themeId: string, format: CompetitionFormat = "BATTLE") {
  const theme = THEMES[themeId];
  if (theme && theme.formats.includes(format)) {
    listenersByFormat[format].forEach((l) => l(themeId));
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKeyFor(format), themeId);
    }
    return true;
  }
  return false;
}

export function useActiveCompetitionTheme(format: CompetitionFormat, defaultThemeId?: string) {
  const fallbackId = defaultThemeId ?? getThemesForFormat(format)[0]?.id ?? "cyber-neon";
  const [themeId, setThemeId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(storageKeyFor(format)) || fallbackId;
    }
    return fallbackId;
  });

  useEffect(() => {
    return registerThemeListener((newThemeId) => {
      setThemeId(newThemeId);
    }, format);
  }, [format]);

  return THEMES[themeId] || THEMES[fallbackId] || THEMES["cyber-neon"]!;
}

// Unchanged signature/behavior for the existing real consumer
// (TmiVersusBattleArena) - a thin wrapper over the generalized hook above.
export function useActiveBattleTheme(defaultThemeId: string = "cyber-neon") {
  return useActiveCompetitionTheme("BATTLE", defaultThemeId);
}
