"use client";

/**
 * ROTATION CONTROLLER
 * Manages timed homepage page-state rotation.
 * Fires callbacks at 5-second Top10 face holds and 25-second page cycles.
 */

import { useEffect, useRef, useState } from "react";
import { TIMING } from "@/lib/motion/timingRegistry";
import { prefersReducedMotion } from "@/lib/motion/reducedMotionGuard";

export type HomepageRotationPhase =
  | "home1"
  | "home1-2"
  | "home2"
  | "home3"
  | "home4"
  | "home5";

const PHASE_SEQUENCE: HomepageRotationPhase[] = [
  "home1",
  "home1-2",
  "home2",
  "home3",
  "home4",
  "home5",
];

interface RotationControllerProps {
  /** Called when the top10 hold tick fires (every 5s within a page) */
  onTop10Tick?: (tickIndex: number) => void;
  /** Called when the page cycles to the next homepage phase */
  onPhaseChange?: (phase: HomepageRotationPhase, index: number) => void;
  /** Whether to run the global rotation (set false when user is interacting) */
  paused?: boolean;
}

export default function RotationController({
  onTop10Tick,
  onPhaseChange,
  paused = false,
}: RotationControllerProps) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const top10Ref = useRef<ReturnType<typeof setInterval> | null>(null);
  const pageRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickRef = useRef(0);

  useEffect(() => {
    if (paused || prefersReducedMotion()) return;

    // Top10 5-second face hold tick
    top10Ref.current = setInterval(() => {
      tickRef.current += 1;
      onTop10Tick?.(tickRef.current);
    }, TIMING.top10Hold);

    // Page rotation every 25 seconds
    pageRef.current = setInterval(() => {
      setPhaseIndex((prev) => {
        const next = (prev + 1) % PHASE_SEQUENCE.length;
        onPhaseChange?.(PHASE_SEQUENCE[next], next);
        return next;
      });
    }, TIMING.homepagePageHold);

    return () => {
      if (top10Ref.current) clearInterval(top10Ref.current);
      if (pageRef.current) clearInterval(pageRef.current);
    };
  }, [paused, onTop10Tick, onPhaseChange]);

  // Non-rendering controller — renders nothing visible
  return null;
}

/** Hook version for use in pages that need the current phase */
export function useRotationController(paused = false) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [top10Tick, setTop10Tick] = useState(0);

  useEffect(() => {
    if (paused || prefersReducedMotion()) return;

    const top10 = setInterval(() => setTop10Tick((t) => t + 1), TIMING.top10Hold);
    const page = setInterval(
      () => setPhaseIndex((p) => (p + 1) % PHASE_SEQUENCE.length),
      TIMING.homepagePageHold
    );

    return () => {
      clearInterval(top10);
      clearInterval(page);
    };
  }, [paused]);

  return {
    currentPhase: PHASE_SEQUENCE[phaseIndex],
    phaseIndex,
    top10Tick,
    phases: PHASE_SEQUENCE,
  };
}
