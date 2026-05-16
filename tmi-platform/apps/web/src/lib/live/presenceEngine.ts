"use client";

/**
 * PRESENCE ENGINE
 * Simulates live user counts, bot motion, and "watching now" data.
 * Uses seeded bot simulation when real data is unavailable.
 */

import { useEffect, useRef, useState } from "react";

export interface PresenceData {
  watching: number;
  active: number;
  bots: number;
  peak: number;
  liveNow: boolean;
  joinedRecently: string[];   // display names of recent joins
}

const BOT_NAMES = [
  "CypherFan99", "MelodyMaven", "BeatSeeker", "GrooveBot",
  "NightOwl42", "StageWatcher", "Velocity", "RhythmPulse",
  "TuneHunter", "AceWatcher", "SonicDrift", "WaveRider",
];

function buildInitial(seed: string): PresenceData {
  // Deterministic seed from route so SSR/CSR matches closely
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

/**
 * Hook: drives live presence simulation for a given room/lobby/event.
 */
export function usePresenceEngine(roomId: string, pollMs = 8000): PresenceData {
  const [data, setData] = useState<PresenceData>(() => buildInitial(roomId));
  const timersRef = useRef<ReturnType<typeof setInterval>[]>([]);

  useEffect(() => {
    // Organic drift every pollMs
    const drift = setInterval(() => {
      setData((prev) => {
        const delta = Math.floor(Math.random() * 14) - 6;
        const newWatching = Math.max(10, prev.watching + delta);
        const joined = delta > 0
          ? [BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)]]
          : [];
        return {
          ...prev,
          watching: newWatching,
          active: Math.floor(newWatching * (0.55 + Math.random() * 0.1)),
          joinedRecently: joined,
        };
      });
    }, pollMs);

    // Bot join trickle every ~3s
    const trickle = setInterval(() => {
      const name = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
      setData((prev) => ({
        ...prev,
        joinedRecently: [name],
      }));
    }, 3000 + Math.random() * 2000);

    timersRef.current = [drift, trickle];
    return () => {
      drift && clearInterval(drift);
      trickle && clearInterval(trickle);
    };
  }, [roomId, pollMs]);

  return data;
}

/** Standalone snapshot (non-hook) for SSR/static cases */
export function getPresenceSnapshot(roomId: string): PresenceData {
  return buildInitial(roomId);
}
