/**
 * MagazineRotationScheduler — Home 2 living magazine television mix.
 *
 * Mixes editorial → organic → boosted → interview → etc.
 * Safeguards:
 *   - no identical back-to-back
 *   - frequency caps per kind / categoryKey
 *   - pause on user interaction
 *   - no autoplay audio until interaction (enforced by consumer + mutedRequired)
 */

import {
  MAGAZINE_KIND_MIX_ORDER,
  type MagazineMediaKind,
  type UnifiedMediaRecord,
} from "./UnifiedMediaRecord";
import { isActiveBoost } from "./videoBoostEligibility";

export type MagazineRotationState = {
  queue: UnifiedMediaRecord[];
  index: number;
  current: UnifiedMediaRecord | null;
  paused: boolean;
  userHasInteracted: boolean;
  /** Audio may unmute only after user interaction. */
  allowAudio: boolean;
  lastId: string | null;
  kindPlayCounts: Record<string, number>;
  categoryPlayCounts: Record<string, number>;
};

export type MagazineRotationOptions = {
  /** Max plays of the same kind before a different kind is preferred. */
  kindFrequencyCap?: number;
  /** Max plays of the same categoryKey in a window. */
  categoryFrequencyCap?: number;
  /** Dwell time per slot (ms). */
  intervalMs?: number;
};

const DEFAULT_KIND_CAP = 2;
const DEFAULT_CATEGORY_CAP = 2;

function kindPriority(kind: MagazineMediaKind): number {
  const i = MAGAZINE_KIND_MIX_ORDER.indexOf(kind);
  return i === -1 ? 99 : i;
}

function sortForMix(records: UnifiedMediaRecord[]): UnifiedMediaRecord[] {
  return [...records].sort((a, b) => {
    const boostA = isActiveBoost(a) ? 0 : 1;
    const boostB = isActiveBoost(b) ? 0 : 1;
    if (boostA !== boostB && (a.kind === "video_boost" || b.kind === "video_boost")) {
      // Boosted items get a slot in the mix, not a permanent takeover.
      return kindPriority(a.kind) - kindPriority(b.kind);
    }
    return kindPriority(a.kind) - kindPriority(b.kind);
  });
}

export function createMagazineRotationState(
  records: readonly UnifiedMediaRecord[],
): MagazineRotationState {
  const queue = sortForMix(records.filter((r) => r.route && r.route !== "#"));
  return {
    queue,
    index: 0,
    current: queue[0] ?? null,
    paused: false,
    userHasInteracted: false,
    allowAudio: false,
    lastId: null,
    kindPlayCounts: {},
    categoryPlayCounts: {},
  };
}

function underCap(
  state: MagazineRotationState,
  record: UnifiedMediaRecord,
  kindCap: number,
  categoryCap: number,
): boolean {
  const kindCount = state.kindPlayCounts[record.kind] ?? 0;
  const catCount = state.categoryPlayCounts[record.categoryKey] ?? 0;
  return kindCount < kindCap && catCount < categoryCap;
}

/**
 * Pick next record with safeguards. Returns same state if paused or empty.
 */
export function advanceMagazineRotation(
  state: MagazineRotationState,
  opts: MagazineRotationOptions = {},
): MagazineRotationState {
  if (state.paused || state.queue.length === 0) return state;

  const kindCap = opts.kindFrequencyCap ?? DEFAULT_KIND_CAP;
  const categoryCap = opts.categoryFrequencyCap ?? DEFAULT_CATEGORY_CAP;
  const n = state.queue.length;

  // Reset caps when the whole queue has been constrained.
  let kindPlayCounts = { ...state.kindPlayCounts };
  let categoryPlayCounts = { ...state.categoryPlayCounts };
  const anyEligible = state.queue.some(
    (r) =>
      r.id !== state.lastId &&
      underCap(
        { ...state, kindPlayCounts, categoryPlayCounts },
        r,
        kindCap,
        categoryCap,
      ),
  );
  if (!anyEligible) {
    kindPlayCounts = {};
    categoryPlayCounts = {};
  }

  let chosen: UnifiedMediaRecord | null = null;
  let chosenIndex = state.index;

  for (let step = 1; step <= n; step++) {
    const idx = (state.index + step) % n;
    const candidate = state.queue[idx]!;
    if (candidate.id === state.lastId && n > 1) continue;
    if (
      !underCap(
        { ...state, kindPlayCounts, categoryPlayCounts },
        candidate,
        kindCap,
        categoryCap,
      )
    ) {
      continue;
    }
    chosen = candidate;
    chosenIndex = idx;
    break;
  }

  // Last resort: next non-identical item (ignore caps for one tick).
  if (!chosen) {
    for (let step = 1; step <= n; step++) {
      const idx = (state.index + step) % n;
      const candidate = state.queue[idx]!;
      if (candidate.id === state.lastId && n > 1) continue;
      chosen = candidate;
      chosenIndex = idx;
      break;
    }
  }

  if (!chosen) {
    chosen = state.queue[state.index] ?? null;
    chosenIndex = state.index;
  }

  if (!chosen) return state;

  const nextKind = { ...kindPlayCounts };
  const nextCat = { ...categoryPlayCounts };
  nextKind[chosen.kind] = (nextKind[chosen.kind] ?? 0) + 1;
  nextCat[chosen.categoryKey] = (nextCat[chosen.categoryKey] ?? 0) + 1;

  return {
    ...state,
    index: chosenIndex,
    current: chosen,
    lastId: chosen.id,
    kindPlayCounts: nextKind,
    categoryPlayCounts: nextCat,
  };
}

export function pauseMagazineRotation(state: MagazineRotationState): MagazineRotationState {
  return { ...state, paused: true };
}

export function resumeMagazineRotation(state: MagazineRotationState): MagazineRotationState {
  return { ...state, paused: false };
}

/** Call on any user gesture — pauses auto-advance briefly and unlocks audio permission. */
export function noteMagazineUserInteraction(
  state: MagazineRotationState,
): MagazineRotationState {
  return {
    ...state,
    paused: true,
    userHasInteracted: true,
    allowAudio: true,
  };
}

export function replaceMagazineRotationQueue(
  state: MagazineRotationState,
  records: readonly UnifiedMediaRecord[],
): MagazineRotationState {
  const queue = sortForMix(records.filter((r) => r.route && r.route !== "#"));
  const stillCurrent = state.current
    ? queue.find((r) => r.id === state.current!.id) ?? null
    : null;
  return {
    ...state,
    queue,
    index: stillCurrent ? queue.findIndex((r) => r.id === stillCurrent.id) : 0,
    current: stillCurrent ?? queue[0] ?? null,
  };
}
