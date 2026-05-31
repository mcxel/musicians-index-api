"use client";

/**
 * PRESENCE ENGINE
 * Simulates live user counts, bot motion, and "watching now" data.
 * Uses seeded bot simulation when real data is unavailable.
 *
 * Fixes applied:
 *  - joinedRecently auto-clears after 2500ms so stale names don't persist
 *  - Accepts optional `mode` param — private mode returns zero viewers
 */

import { useEffect, useRef, useState } from "react";

export interface PresenceData {
  watching: number;
  active: number;
  bots: number;
  peak: number;
  liveNow: boolean;
  joinedRecently: string[];
}

export type PresenceMode = "private" | "community" | "performance";

const BOT_NAMES = [
  "CypherFan99", "MelodyMaven", "BeatSeeker", "GrooveBot",
  "NightOwl42", "StageWatcher", "Velocity", "RhythmPulse",
  "TuneHunter", "AceWatcher", "SonicDrift", "WaveRider",
];

const ZERO_PRESENCE: PresenceData = {
  watching: 0, active: 0, bots: 0, peak: 0, liveNow: false, joinedRecently: [],
};

function buildInitial(seed: string): PresenceData {
  const base = Array.from(seed).reduce((a, c) => a + c.charCodeAt(0), 0);
  const watching = 200 + (base % 800);
  return {
    watching,
    active: Math.floor(watching * 0.6),
    bots: Math.floor(watching * 0.3),
    peak: watching + Math.floor(watching * 0.2),
    liveNow: true,
    joinedRecently: [],
  };
}

export function usePresenceEngine(
  roomId: string,
  pollMs = 8000,
  mode: PresenceMode = "performance",
): PresenceData {
  const [data, setData] = useState<PresenceData>(() =>
    mode === "private" ? ZERO_PRESENCE : buildInitial(roomId),
  );

  // Track clear timers so we don't leak
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (mode === "private") {
      setData(ZERO_PRESENCE);
      return;
    }

    // Organic drift every pollMs
    const drift = setInterval(() => {
      setData((prev) => {
        const delta = Math.floor(Math.random() * 14) - 6;
        const newWatching = Math.max(10, prev.watching + delta);
        const joined = delta > 0
          ? [BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)]!]
          : [];
        return {
          ...prev,
          watching: newWatching,
          active: Math.floor(newWatching * (0.55 + Math.random() * 0.1)),
          peak: Math.max(prev.peak, newWatching),
          joinedRecently: joined,
        };
      });

      // Auto-clear joinedRecently after 2.5s
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
      clearTimerRef.current = setTimeout(() => {
        setData((prev) => ({ ...prev, joinedRecently: [] }));
      }, 2500);
    }, pollMs);

    // Bot join trickle every ~3s
    const trickleInterval = 3000 + Math.floor(Math.random() * 2000);
    const trickle = setInterval(() => {
      const name = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)]!;
      setData((prev) => ({ ...prev, joinedRecently: [name] }));

      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
      clearTimerRef.current = setTimeout(() => {
        setData((prev) => ({ ...prev, joinedRecently: [] }));
      }, 2500);
    }, trickleInterval);

    return () => {
      clearInterval(drift);
      clearInterval(trickle);
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    };
  }, [roomId, pollMs, mode]);

  return data;
}

/** Standalone snapshot (non-hook) for SSR/static cases */
export function getPresenceSnapshot(roomId: string): PresenceData {
  return buildInitial(roomId);
}
