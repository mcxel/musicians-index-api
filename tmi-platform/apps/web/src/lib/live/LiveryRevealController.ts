import { useEffect, useRef, useState } from 'react';

// Stage states that trigger the Showtime Livery Reveal
const SHOWTIME_STATES = new Set(['battle', 'cypher', 'contest', 'challenge', 'countdown']);

const REVEAL_DURATION_MS = 6000;

export function useShowtimeReveal(stageState: string | undefined): boolean {
  const [revealActive, setRevealActive] = useState(false);
  const prevStateRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const prev = prevStateRef.current;
    prevStateRef.current = stageState;

    if (!SHOWTIME_STATES.has(stageState ?? '') || stageState === prev) return;

    setRevealActive(true);
    const t = setTimeout(() => setRevealActive(false), REVEAL_DURATION_MS);
    return () => clearTimeout(t);
  }, [stageState]);

  return revealActive;
}
