/**
 * RankSpotlightScheduler
 *
 * Pure timing logic — no React dependency.
 * Drives the timed spotlight pause sequence for rank cards.
 *
 * Timing rules:
 *   #1:     5500ms spotlight, crown appears at 70% in (3850ms)
 *   #2–4:   3500ms spotlight
 *   #5–10:  2500ms spotlight
 *   Crown fades out after 1800ms
 */

export type RankSpotlightEvent =
  | { type: "spotlight-start"; rank: number; artistId: string }
  | { type: "crown-pop"; rank: number; artistId: string }
  | { type: "spotlight-end"; rank: number; artistId: string };

export type RankSpotlightCallback = (event: RankSpotlightEvent) => void;

/** Returns spotlight duration in ms for a given rank */
export function getSpotlightDuration(rank: number): number {
  if (rank === 1) return 5500;
  if (rank <= 4) return 3500;
  return 2500;
}

/** Returns the delay (from spotlight start) when crown should appear */
export function getCrownAppearDelay(rank: number): number {
  if (rank !== 1) return Infinity; // only #1 gets a crown
  return Math.floor(getSpotlightDuration(1) * 0.7); // 3850ms
}

/** Crown animation duration (pop → hover → shine → fade) */
export const CROWN_DURATION_MS = 1800;

/**
 * Schedules spotlight sequence for a single rank.
 * Returns a cleanup function.
 */
export function scheduleRankSpotlight(
  rank: number,
  artistId: string,
  onEvent: RankSpotlightCallback
): () => void {
  const timers: ReturnType<typeof setTimeout>[] = [];

  const duration = getSpotlightDuration(rank);
  const crownDelay = getCrownAppearDelay(rank);

  // Spotlight start
  onEvent({ type: "spotlight-start", rank, artistId });

  // Crown pop (only for #1)
  if (rank === 1 && crownDelay < Infinity) {
    timers.push(
      setTimeout(() => {
        onEvent({ type: "crown-pop", rank, artistId });
      }, crownDelay)
    );
  }

  // Spotlight end
  timers.push(
    setTimeout(() => {
      onEvent({ type: "spotlight-end", rank, artistId });
    }, duration)
  );

  return () => timers.forEach(clearTimeout);
}

/**
 * Schedules a full Top-N spotlight sequence, one rank at a time.
 * Calls onEvent for each phase; calls onComplete when the sequence is done.
 */
export function scheduleFullRankSequence(
  entries: Array<{ rank: number; id: string }>,
  onEvent: RankSpotlightCallback,
  onComplete?: () => void
): () => void {
  let cancelled = false;
  const timers: ReturnType<typeof setTimeout>[] = [];

  let cursor = 0;

  function runNext() {
    if (cancelled || cursor >= entries.length) {
      if (!cancelled) onComplete?.();
      return;
    }

    const entry = entries[cursor];
    cursor++;

    const cleanup = scheduleRankSpotlight(entry.rank, entry.id, onEvent);
    const duration = getSpotlightDuration(entry.rank);

    const t = setTimeout(() => {
      cleanup();
      runNext();
    }, duration);
    timers.push(t);
  }

  runNext();

  return () => {
    cancelled = true;
    timers.forEach(clearTimeout);
  };
}
