"use client";

import { useEffect, useRef, useState } from "react";
import { computeWarpAdapt } from "@/lib/live/WarpAdaptEngine";
import { WarpEntryLog } from "@/lib/live/WarpEntryLog";

export type ArrivalPhase = "flying" | "pausing" | "landing" | "seated" | "reduced";

const PAUSE_MS = 140;
const LAND_MS  = 900;

export interface SeatArrivalState {
  phase: ArrivalPhase;
  /** true while the overlay should cover the screen */
  isActive: boolean;
}

export function useSeatArrivalTransition(): SeatArrivalState {
  const [phase, setPhase] = useState<ArrivalPhase>("flying");
  const started = useRef(false);
  const timers  = useRef<number[]>([]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion) {
      setPhase("reduced");
      return;
    }

    // Adaptive fly duration — self-corrects based on prior warp history
    const { warpDurationTarget } = computeWarpAdapt(WarpEntryLog.getAll());
    const flyMs =
      warpDurationTarget.min +
      Math.random() * (warpDurationTarget.max - warpDurationTarget.min);

    const t1 = window.setTimeout(() => {
      setPhase("pausing");
      const t2 = window.setTimeout(() => {
        setPhase("landing");
        const t3 = window.setTimeout(() => setPhase("seated"), LAND_MS);
        timers.current.push(t3);
      }, PAUSE_MS);
      timers.current.push(t2);
    }, flyMs);
    timers.current.push(t1);

    return () => timers.current.forEach((t) => window.clearTimeout(t));
  }, []);

  return {
    phase,
    isActive: phase === "flying" || phase === "pausing" || phase === "landing" || phase === "reduced",
  };
}
