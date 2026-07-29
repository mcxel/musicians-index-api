/**
 * RotationSchedulerEngine — pure Layer 5 scheduler (no UI, no fake live).
 *
 * Picks next ProgramQueueItem from a real registry-backed queue.
 * 15-minute blocks are config only — never invents occupancy / viewers (Rule 20).
 */

import type {
  ExperienceFinishedEvent,
  ProgramQueueItem,
  ProgramSlot,
} from "@/core/eos/programBoard";

/** Default program block length (ms). Override via RotationSchedulerConfig. */
export const DEFAULT_ROTATION_BLOCK_MS = 15 * 60 * 1000;

export interface RotationSchedulerConfig {
  blockDurationMs: number;
  /** How many upcoming blocks to surface as Starting Soon */
  startingSoonCount: number;
}

export const DEFAULT_ROTATION_SCHEDULER_CONFIG: RotationSchedulerConfig = {
  blockDurationMs: DEFAULT_ROTATION_BLOCK_MS,
  startingSoonCount: 3,
};

export interface RotationPick {
  item: ProgramQueueItem;
  index: number;
  blockStartsAtMs: number;
  blockEndsAtMs: number;
}

function blockIndexAt(nowMs: number, blockDurationMs: number): number {
  if (blockDurationMs <= 0) return 0;
  return Math.floor(nowMs / blockDurationMs);
}

function blockBounds(
  blockIndex: number,
  blockDurationMs: number,
): { start: number; end: number } {
  const start = blockIndex * blockDurationMs;
  return { start, end: start + blockDurationMs };
}

/**
 * Next item for the current (or given) clock.
 * Uses modular index into queue — empty queue → null (honest empty).
 */
export function nextItem(
  queue: readonly ProgramQueueItem[],
  nowMs: number,
  config: RotationSchedulerConfig = DEFAULT_ROTATION_SCHEDULER_CONFIG,
): RotationPick | null {
  if (queue.length === 0) return null;

  const bi = blockIndexAt(nowMs, config.blockDurationMs);
  const index = ((bi % queue.length) + queue.length) % queue.length;
  const item = queue[index];
  if (!item) return null;

  const { start, end } = blockBounds(bi, config.blockDurationMs);
  return {
    item,
    index,
    blockStartsAtMs: start,
    blockEndsAtMs: end,
  };
}

/**
 * Upcoming picks after the current block (Starting Soon).
 * Never fabricates items beyond the real queue.
 */
export function peekUpcoming(
  queue: readonly ProgramQueueItem[],
  nowMs: number,
  config: RotationSchedulerConfig = DEFAULT_ROTATION_SCHEDULER_CONFIG,
): RotationPick[] {
  if (queue.length === 0) return [];

  const bi = blockIndexAt(nowMs, config.blockDurationMs);
  const count = Math.max(0, config.startingSoonCount);
  const out: RotationPick[] = [];

  for (let i = 1; i <= count; i += 1) {
    const nextBi = bi + i;
    const index = ((nextBi % queue.length) + queue.length) % queue.length;
    const item = queue[index];
    if (!item) continue;
    const { start, end } = blockBounds(nextBi, config.blockDurationMs);
    out.push({
      item,
      index,
      blockStartsAtMs: start,
      blockEndsAtMs: end,
    });
  }

  return out;
}

/**
 * Advance board slots that are idle/empty toward the next queue suggestions.
 * Does not invent LIVE_PREVIEW occupancy — only reassigns EMPTY slots.
 */
export function advanceOnIdle(
  slots: readonly ProgramSlot[],
  queue: readonly ProgramQueueItem[],
  nowMs: number = Date.now(),
  config: RotationSchedulerConfig = DEFAULT_ROTATION_SCHEDULER_CONFIG,
): ProgramSlot[] {
  const current = nextItem(queue, nowMs, config);
  const upcoming = peekUpcoming(queue, nowMs, config);
  const suggestionPool: RotationPick[] = [];
  if (current) suggestionPool.push(current);
  suggestionPool.push(...upcoming);

  let cursor = 0;
  return slots.map((slot) => {
    if (slot.state !== "EMPTY" && slot.item != null) return { ...slot };

    const pick = suggestionPool[cursor];
    cursor += 1;
    if (!pick) {
      return {
        ...slot,
        state: "EMPTY" as const,
        item: null,
        blockStartMs: undefined,
        blockEndMs: undefined,
        entryRoute: undefined,
      };
    }

    const isNow = current != null && pick.index === current.index && pick.blockStartsAtMs === current.blockStartsAtMs;
    return {
      ...slot,
      state: isNow ? ("NOW_PLAYING" as const) : ("STARTING_SOON" as const),
      item: pick.item,
      blockStartMs: pick.blockStartsAtMs,
      blockEndMs: pick.blockEndsAtMs,
    };
  });
}

/**
 * When an experience finishes, suggest the next queue items for Auto-Director.
 * Returns pure queue suggestions — no fabricated opponents or rooms.
 */
export function onExperienceFinished(
  event: ExperienceFinishedEvent,
  queue: readonly ProgramQueueItem[],
  config: RotationSchedulerConfig = DEFAULT_ROTATION_SCHEDULER_CONFIG,
): RotationPick[] {
  if (queue.length === 0) return [];

  const finishedIdx = queue.findIndex(
    (q) =>
      q.id === event.queueItemId ||
      (q.experienceId != null && q.experienceId === event.experienceId),
  );

  const startFrom =
    finishedIdx >= 0
      ? (finishedIdx + 1) % queue.length
      : blockIndexAt(event.finishedAtMs, config.blockDurationMs) % queue.length;

  const suggestions: RotationPick[] = [];
  const count = Math.max(1, config.startingSoonCount);
  const biBase = blockIndexAt(event.finishedAtMs, config.blockDurationMs) + 1;

  for (let i = 0; i < count; i += 1) {
    const index = (startFrom + i) % queue.length;
    const item = queue[index];
    if (!item) continue;
    const { start, end } = blockBounds(biBase + i, config.blockDurationMs);
    suggestions.push({
      item,
      index,
      blockStartsAtMs: start,
      blockEndsAtMs: end,
    });
  }

  return suggestions;
}
