'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  SpotlightEventManager,
  type SpotlightTarget,
  type RawUser,
} from '@/lib/engine/SpotlightEventManager';

export type SpotlightPhase = 'idle' | 'scanning' | 'locked' | 'revealed' | 'fading';

export interface SpotlightState {
  target: SpotlightTarget | null;
  phase: SpotlightPhase;
  /** true during the 10s engagement boost window after a spotlight fires */
  boostActive: boolean;
}

const SCAN_DURATION_MS = 1200;
const LOCK_DURATION_MS = 600;
const REVEAL_DURATION_MS = 4000;
const FADE_DURATION_MS = 500;
const BOOST_WINDOW_MS = 10_000;
const MIN_INTERVAL_MS = 20_000;
const EXTRA_RANDOM_MS = 40_000; // jitter up to +40s → total 20–60s

export function useSpotlight(
  realUsers: RawUser[],
  ghostUsers: RawUser[]
): SpotlightState & { triggerNow: () => void } {
  const [phase, setPhase] = useState<SpotlightPhase>('idle');
  const [target, setTarget] = useState<SpotlightTarget | null>(null);
  const [boostActive, setBoostActive] = useState(false);

  const runningRef = useRef(false);
  const boostTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phaseTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearPhaseTimers = () => {
    phaseTimersRef.current.forEach(clearTimeout);
    phaseTimersRef.current = [];
  };

  const fire = useCallback(
    (realU: RawUser[], ghostU: RawUser[]) => {
      if (runningRef.current) return;
      if (!SpotlightEventManager.canFire()) return;

      const picked = SpotlightEventManager.selectTarget(realU, ghostU);
      if (!picked) return;

      SpotlightEventManager.recordFire();
      runningRef.current = true;

      setPhase('scanning');

      const t1 = setTimeout(() => {
        setTarget(picked);
        setPhase('locked');

        const t2 = setTimeout(() => {
          setPhase('revealed');

          // Start engagement boost window
          setBoostActive(true);
          if (boostTimerRef.current) clearTimeout(boostTimerRef.current);
          boostTimerRef.current = setTimeout(() => setBoostActive(false), BOOST_WINDOW_MS);

          const t3 = setTimeout(() => {
            setPhase('fading');

            const t4 = setTimeout(() => {
              setPhase('idle');
              setTarget(null);
              runningRef.current = false;
            }, FADE_DURATION_MS);
            phaseTimersRef.current.push(t4);
          }, REVEAL_DURATION_MS);
          phaseTimersRef.current.push(t3);
        }, LOCK_DURATION_MS);
        phaseTimersRef.current.push(t2);
      }, SCAN_DURATION_MS);
      phaseTimersRef.current.push(t1);
    },
    []
  );

  // Store latest user lists in refs so the interval callback is always current
  const realUsersRef = useRef(realUsers);
  const ghostUsersRef = useRef(ghostUsers);
  useEffect(() => { realUsersRef.current = realUsers; }, [realUsers]);
  useEffect(() => { ghostUsersRef.current = ghostUsers; }, [ghostUsers]);

  useEffect(() => {
    let intervalId: ReturnType<typeof setTimeout>;

    const schedule = () => {
      const delay = MIN_INTERVAL_MS + Math.random() * EXTRA_RANDOM_MS;
      intervalId = setTimeout(() => {
        fire(realUsersRef.current, ghostUsersRef.current);
        schedule();
      }, delay);
    };

    // Small initial delay so the room has time to populate
    const initId = setTimeout(() => schedule(), 8000);

    return () => {
      clearTimeout(initId);
      clearTimeout(intervalId);
      clearPhaseTimers();
      if (boostTimerRef.current) clearTimeout(boostTimerRef.current);
    };
  }, [fire]);

  const triggerNow = useCallback(() => {
    clearPhaseTimers();
    runningRef.current = false;
    fire(realUsersRef.current, ghostUsersRef.current);
  }, [fire]);

  return { phase, target, boostActive, triggerNow };
}
