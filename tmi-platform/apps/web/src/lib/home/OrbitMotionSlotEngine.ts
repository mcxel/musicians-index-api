import { getCrownRankRuntime, type CrownRankRuntimeEntry } from "./CrownRankRuntime";
import { resolveHomepageRankingMotion, type HomepageRankingMotionRuntime } from "./HomepageRankingMotionEngine";

export type HomepageMotionSlot = CrownRankRuntimeEntry & {
  slotId: string;
  slotType: "crown-center" | "orbit";
  orbitIndex: number;
  durationSeconds: HomepageRankingMotionRuntime["durationSeconds"];
  motionSource: HomepageRankingMotionRuntime["motionSource"];
  visualSource: string;
  motionAssetRef: string;
  articleLink: HomepageRankingMotionRuntime["articleLink"];
  clickReady: boolean;
  hoverPausesMotion: boolean;
};

function rotateEntries<T>(entries: T[], offset: number): T[] {
  if (!entries.length) return [];
  const normalizedOffset = ((offset % entries.length) + entries.length) % entries.length;
  return [...entries.slice(normalizedOffset), ...entries.slice(0, normalizedOffset)];
}

function toSlot(entry: CrownRankRuntimeEntry, orbitIndex: number): HomepageMotionSlot {
  const motion = resolveHomepageRankingMotion(entry);
  return {
    ...entry,
    slotId: `home-1-rank-${entry.rank}-${entry.artistId}`,
    slotType: entry.rank === 1 ? "crown-center" : "orbit",
    orbitIndex,
    durationSeconds: motion.durationSeconds,
    motionSource: motion.motionSource,
    visualSource: motion.visualSource,
    motionAssetRef: motion.motionAssetRef,
    articleLink: motion.articleLink,
    clickReady: motion.clickReady,
    hoverPausesMotion: motion.hoverPausesMotion,
  };
}

export function getHomepageMotionSlots(limit = 10): HomepageMotionSlot[] {
  return getCrownRankRuntime(limit).map((entry, index) => toSlot(entry, Math.max(0, index - 1)));
}

export function getHomepageHeroMotionSlot(): HomepageMotionSlot | null {
  return getHomepageMotionSlots(1)[0] ?? null;
}

export function getHomepageOrbitMotionSlots(limit = 9): HomepageMotionSlot[] {
  return getHomepageMotionSlots(limit + 1)
    .filter((entry) => entry.rank > 1)
    .slice(0, limit)
    .map((entry, orbitIndex) => ({
      ...entry,
      orbitIndex,
    }));
}

export function rotateHomepageOrbitSlots(slots: HomepageMotionSlot[], tick: number): HomepageMotionSlot[] {
  return rotateEntries(slots, tick).map((slot, orbitIndex) => ({
    ...slot,
    orbitIndex,
  }));
}

export function replaceHomepageMotionSlot(slots: HomepageMotionSlot[], replacement: HomepageMotionSlot): HomepageMotionSlot[] {
  return slots.map((slot) => (slot.rank === replacement.rank ? replacement : slot));
}

export function syncHomepageMotionSlots(limit = 10): HomepageMotionSlot[] {
  return getHomepageMotionSlots(limit);
}

export function getHomepageRotationWindowMs(slots: HomepageMotionSlot[]): number {
  if (!slots.length) return 3000;
  const average = slots.reduce((total, slot) => total + slot.durationSeconds, 0) / slots.length;
  return Math.max(2000, Math.min(4000, Math.round(average * 1000)));
}