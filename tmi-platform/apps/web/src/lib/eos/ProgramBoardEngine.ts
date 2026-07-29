/**
 * ProgramBoardEngine — pure Layer 5 board builder.
 *
 * Combines RotationScheduler picks with ExperienceRegistry.entryRoute.
 * Honest empty when queue is empty or routes cannot resolve (Rule 20).
 */

import type {
  ExperienceFinishedEvent,
  ProgramBoard,
  ProgramQueueItem,
  ProgramSlot,
} from "@/core/eos/programBoard";
import {
  getDefaultProgramQueue,
} from "@/registries/eos/ProgramQueueRegistry";
import { getExperienceById } from "@/registries/eos/ExperienceRegistry";
import type { ResolvedAutoDirectorPreview } from "@/registries/eos/AutoDirectorRegistry";
import {
  DEFAULT_ROTATION_SCHEDULER_CONFIG,
  nextItem,
  onExperienceFinished,
  peekUpcoming,
  type RotationPick,
  type RotationSchedulerConfig,
} from "./RotationSchedulerEngine";

export interface BuildBoardOptions {
  nowMs?: number;
  queue?: readonly ProgramQueueItem[];
  config?: RotationSchedulerConfig;
  /** How many EMPTY placeholder slots to include when idle */
  idleSlotCount?: number;
}

function resolveEntryRoute(item: ProgramQueueItem): string | undefined {
  if (item.experienceId) {
    const exp = getExperienceById(item.experienceId);
    if (exp?.entryRoute?.startsWith("/")) return exp.entryRoute;
  }
  return undefined;
}

function pickToSlot(
  pick: RotationPick,
  slotIndex: number,
  state: ProgramSlot["state"],
): ProgramSlot {
  return {
    slotIndex,
    state,
    item: pick.item,
    blockStartMs: pick.blockStartsAtMs,
    blockEndMs: pick.blockEndsAtMs,
    entryRoute: resolveEntryRoute(pick.item),
  };
}

/**
 * Build a ProgramBoard snapshot from scheduler picks + registry routes.
 */
export function buildBoard(options: BuildBoardOptions = {}): ProgramBoard {
  const nowMs = options.nowMs ?? Date.now();
  const config = options.config ?? DEFAULT_ROTATION_SCHEDULER_CONFIG;
  const queue = [...(options.queue ?? getDefaultProgramQueue())];
  const idleSlotCount = options.idleSlotCount ?? 4;

  const current = nextItem(queue, nowMs, config);
  const upcoming = peekUpcoming(queue, nowMs, config);

  const slots: ProgramSlot[] = [];
  if (current) {
    slots.push(pickToSlot(current, 0, "NOW_PLAYING"));
  } else {
    slots.push({
      slotIndex: 0,
      state: "EMPTY",
      item: null,
    });
  }

  upcoming.forEach((pick, i) => {
    slots.push(pickToSlot(pick, i + 1, "STARTING_SOON"));
  });

  // Pad with honest EMPTY slots up to idleSlotCount (no fabricated content)
  while (slots.length < idleSlotCount) {
    slots.push({
      slotIndex: slots.length,
      state: "EMPTY",
      item: null,
    });
  }

  const usedIds = new Set<string>();
  if (current) usedIds.add(current.item.id);
  for (const u of upcoming) usedIds.add(u.item.id);

  const remaining = queue.filter((q) => !usedIds.has(q.id));

  return {
    nowPlaying: {
      item: current?.item ?? null,
      entryRoute: current ? resolveEntryRoute(current.item) : undefined,
      blockStartsAtMs: current?.blockStartsAtMs,
      blockEndsAtMs: current?.blockEndsAtMs,
    },
    startingSoon: {
      items: upcoming.map((u) => ({
        item: u.item,
        entryRoute: resolveEntryRoute(u.item),
        blockStartsAtMs: u.blockStartsAtMs,
        blockEndsAtMs: u.blockEndsAtMs,
      })),
    },
    queue: remaining,
    slots,
    generatedAtMs: nowMs,
    blockDurationMs: config.blockDurationMs,
  };
}

/** Convenience: default registry queue + current clock. */
export function buildDefaultProgramBoard(nowMs: number = Date.now()): ProgramBoard {
  return buildBoard({ nowMs });
}

/**
 * Map board now-playing + starting-soon into Auto-Director preview shape.
 * Only includes rows with real entryRoutes. No viewer counts.
 */
export function programBoardToSuggestions(
  board: ProgramBoard,
): ResolvedAutoDirectorPreview[] {
  const out: ResolvedAutoDirectorPreview[] = [];
  const seen = new Set<string>();

  const push = (
    item: ProgramQueueItem,
    entryRoute: string | undefined,
    priorityBoost: number,
    laneHint: "STARTING_SOON" | "LIVE_EXPERIENCE",
  ) => {
    if (!entryRoute?.startsWith("/")) return;
    const contentId = item.experienceId ?? item.id;
    if (seen.has(contentId) || seen.has(item.id)) return;
    seen.add(contentId);
    seen.add(item.id);

    const contentType =
      item.source === "LIVE_PREVIEW" ? ("LIVE_PREVIEW" as const) : ("EXPERIENCE" as const);

    out.push({
      id: `program-${item.id}`,
      lane: laneHint,
      contentType,
      contentId,
      entryRoute,
      title: item.title ?? contentId,
      subtitle: item.subtitle ?? (laneHint === "STARTING_SOON" ? "Starting soon" : "Now in rotation"),
      icon: item.icon ?? "📺",
      accentColor: item.accentColor ?? "#00FFFF",
      priority: Math.max(1, item.weight) + priorityBoost,
    });
  };

  if (board.nowPlaying.item) {
    push(
      board.nowPlaying.item,
      board.nowPlaying.entryRoute,
      200,
      "LIVE_EXPERIENCE",
    );
  }

  for (const row of board.startingSoon.items) {
    push(row.item, row.entryRoute, 150, "STARTING_SOON");
  }

  return out;
}

/**
 * After an experience finishes, build next Auto-Director suggestions.
 */
export function suggestionsAfterExperienceFinished(
  event: ExperienceFinishedEvent,
  queue: readonly ProgramQueueItem[] = getDefaultProgramQueue(),
  config: RotationSchedulerConfig = DEFAULT_ROTATION_SCHEDULER_CONFIG,
): ResolvedAutoDirectorPreview[] {
  const picks = onExperienceFinished(event, queue, config);
  const boardLike: ProgramBoard = {
    nowPlaying: { item: null },
    startingSoon: {
      items: picks.map((p) => ({
        item: p.item,
        entryRoute: resolveEntryRoute(p.item),
        blockStartsAtMs: p.blockStartsAtMs,
        blockEndsAtMs: p.blockEndsAtMs,
      })),
    },
    queue: [...queue],
    slots: [],
    generatedAtMs: event.finishedAtMs,
    blockDurationMs: config.blockDurationMs,
  };
  return programBoardToSuggestions(boardLike);
}
