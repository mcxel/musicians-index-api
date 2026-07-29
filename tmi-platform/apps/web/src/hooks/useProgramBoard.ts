"use client";

/**
 * useProgramBoard — thin client bridge for Layer 5 ProgramBoard snapshots.
 * Can feed useAutoDirector / AutoDirectorEngine.assignSlots via programSuggestions.
 *
 * Universal Playlist integrations are FUTURE APPROVED (document only) — not wired here.
 */

import { useEffect, useMemo, useState } from "react";
import type { ProgramBoard } from "@/core/eos/programBoard";
import {
  buildBoard,
  programBoardToSuggestions,
} from "@/lib/eos/ProgramBoardEngine";
import {
  DEFAULT_ROTATION_BLOCK_MS,
  DEFAULT_ROTATION_SCHEDULER_CONFIG,
} from "@/lib/eos/RotationSchedulerEngine";
import type { ResolvedAutoDirectorPreview } from "@/registries/eos/AutoDirectorRegistry";
import { getDefaultProgramQueue } from "@/registries/eos/ProgramQueueRegistry";

export interface UseProgramBoardOptions {
  enabled?: boolean;
  /** Override refresh interval; defaults to min(60s, block/4) */
  refreshMs?: number;
}

export interface UseProgramBoardResult {
  board: ProgramBoard;
  /** Prefer these in Auto-Director idle fills when available */
  suggestions: ResolvedAutoDirectorPreview[];
  refresh: () => void;
}

export function useProgramBoard(
  options: UseProgramBoardOptions = {},
): UseProgramBoardResult {
  const { enabled = true, refreshMs } = options;
  const intervalMs =
    refreshMs ??
    Math.min(60_000, Math.max(15_000, Math.floor(DEFAULT_ROTATION_BLOCK_MS / 4)));

  const [nowMs, setNowMs] = useState(() => Date.now());

  const refresh = () => setNowMs(Date.now());

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined") return;
    const id = window.setInterval(() => setNowMs(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [enabled, intervalMs]);

  const board = useMemo(() => {
    return buildBoard({
      nowMs,
      queue: getDefaultProgramQueue(),
      config: DEFAULT_ROTATION_SCHEDULER_CONFIG,
    });
  }, [nowMs]);

  const suggestions = useMemo(() => programBoardToSuggestions(board), [board]);

  return { board, suggestions, refresh };
}
