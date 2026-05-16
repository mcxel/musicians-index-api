"use client";

import { useEffect, useRef, useState } from "react";
import {
  pickRandomEntryMs,
  pickRandomEntryTransition,
  pickRandomExitMs,
  pickRandomExitTransition,
  type TmiCoverEntryTransition,
  type TmiCoverExitTransition,
} from "./TmiMagazineTransitionRegistry";

export type TmiCoverLoopPhase = "visible" | "exiting" | "hidden" | "entering";

type PresenceState = {
  phase: TmiCoverLoopPhase;
  exitTransition: TmiCoverExitTransition;
  entryTransition: TmiCoverEntryTransition;
  transitionMs: number;
};

type TmiMagazinePresenceOptions = {
  visibleMs?: number;
  hiddenGapMs?: number;
};

export function useTmiMagazinePresenceEngine(options?: TmiMagazinePresenceOptions): PresenceState {
  const visibleMs = options?.visibleMs ?? 15000;
  const hiddenGapMs = options?.hiddenGapMs ?? 500;
  const timers = useRef<number[]>([]);

  const [state, setState] = useState<PresenceState>({
    phase: "visible",
    exitTransition: "fade",
    entryTransition: "fade-in",
    transitionMs: 1200,
  });

  useEffect(() => {
    let cancelled = false;

    const clearAll = () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
      timers.current = [];
    };

    const loop = () => {
      if (cancelled) return;

      const toExit = window.setTimeout(() => {
        if (cancelled) return;
        const exitTransition = pickRandomExitTransition();
        const exitMs = pickRandomExitMs();
        setState((prev) => ({ ...prev, phase: "exiting", exitTransition, transitionMs: exitMs }));

        const toHidden = window.setTimeout(() => {
          if (cancelled) return;
          setState((prev) => ({ ...prev, phase: "hidden" }));

          const toEntry = window.setTimeout(() => {
            if (cancelled) return;
            const entryTransition = pickRandomEntryTransition();
            const entryMs = pickRandomEntryMs();
            setState((prev) => ({ ...prev, phase: "entering", entryTransition, transitionMs: entryMs }));

            const toVisible = window.setTimeout(() => {
              if (cancelled) return;
              setState((prev) => ({ ...prev, phase: "visible", transitionMs: 0 }));
              loop();
            }, entryMs);
            timers.current.push(toVisible);
          }, hiddenGapMs);
          timers.current.push(toEntry);
        }, exitMs);
        timers.current.push(toHidden);
      }, visibleMs);

      timers.current.push(toExit);
    };

    loop();
    return () => {
      cancelled = true;
      clearAll();
    };
  }, [hiddenGapMs, visibleMs]);

  return state;
}
