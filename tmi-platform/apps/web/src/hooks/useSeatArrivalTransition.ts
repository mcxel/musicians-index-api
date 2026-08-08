"use client";

import { useEffect, useRef, useState } from "react";
import { computeWarpAdapt } from "@/lib/live/WarpAdaptEngine";
import { WarpEntryLog } from "@/lib/live/WarpEntryLog";

/**
 * Star Wars seat-arrival phases (Marcel locked sequence):
 *   flying  → hyperspace travel (buys render time for seat/avatar/WebRTC)
 *   pausing → slowing down in the stars
 *   landing → big stars burst / scale-up
 *   seated  → reveal: already sitting in seat
 */
export type ArrivalPhase = "flying" | "pausing" | "landing" | "seated" | "reduced";

const PAUSE_MS = 480;  // slow-down in the stars (not a black cut)
const LAND_MS  = 1000; // big-star burst → seated reveal

export interface SeatArrivalState {
  phase: ArrivalPhase;
  /** true while the overlay should cover the screen */
  isActive: boolean;
}

export interface UseSeatArrivalOptions {
  /** When false, hook stays idle (controlled mount from LobbyEntryFlow). Default true for page mounts. */
  enabled?: boolean;
  /** Fires once when phase reaches seated (stars clear → seated view ready). */
  onComplete?: () => void;
}

export function useSeatArrivalTransition(opts?: UseSeatArrivalOptions): SeatArrivalState {
  const enabled = opts?.enabled !== false;
  const onCompleteRef = useRef(opts?.onComplete);
  onCompleteRef.current = opts?.onComplete;
  const [phase, setPhase] = useState<ArrivalPhase>(enabled ? "flying" : "seated");
  const started = useRef(false);
  const completed = useRef(false);
  const timers  = useRef<number[]>([]);

  useEffect(() => {
    if (!enabled) {
      setPhase("seated");
      return;
    }
    if (started.current) return;
    started.current = true;
    completed.current = false;

    const fireComplete = () => {
      if (completed.current) return;
      completed.current = true;
      onCompleteRef.current?.();
    };

    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion) {
      setPhase("reduced");
      const t = window.setTimeout(() => {
        setPhase("seated");
        fireComplete();
      }, 800);
      timers.current.push(t);
      return () => timers.current.forEach((id) => window.clearTimeout(id));
    }

    // Adaptive fly duration — self-corrects based on prior warp history
    // (buys time for seat claim + AudienceScene + WebRTC preload)
    const { warpDurationTarget } = computeWarpAdapt(WarpEntryLog.getAll());
    const flyMs =
      warpDurationTarget.min +
      Math.random() * (warpDurationTarget.max - warpDurationTarget.min);

    const t1 = window.setTimeout(() => {
      setPhase("pausing"); // slow down in the stars
      const t2 = window.setTimeout(() => {
        setPhase("landing"); // big stars appear
        const t3 = window.setTimeout(() => {
          setPhase("seated");
          fireComplete();
        }, LAND_MS);
        timers.current.push(t3);
      }, PAUSE_MS);
      timers.current.push(t2);
    }, flyMs);
    timers.current.push(t1);

    return () => timers.current.forEach((t) => window.clearTimeout(t));
  }, [enabled]);

  return {
    phase,
    isActive: phase === "flying" || phase === "pausing" || phase === "landing" || phase === "reduced",
  };
}
