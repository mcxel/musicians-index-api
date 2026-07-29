"use client";

/**
 * useAutoDirector — thin client bridge for Flight Deck idle-monitor fills.
 * Rotates discovery previews on cadence; never invents viewer counts (Rule 20).
 */

import { useEffect, useMemo, useState } from "react";
import type {
  FlightDeckMonitorSlotId,
  MonitorAssignment,
  MonitorSlotLockState,
} from "@/core/eos/monitorAssignment";
import {
  assignSlots,
  buildAssignmentsFromLockState,
  getRotationCadenceMs,
  rotateIdleAssignments,
} from "@/lib/eos/AutoDirectorEngine";

export interface UseAutoDirectorOptions {
  locks: MonitorSlotLockState;
  /** Disable rotation (assignments still computed once) */
  enabled?: boolean;
  /** Override cadence; defaults to registry hint average */
  cadenceMs?: number;
}

export interface UseAutoDirectorResult {
  assignments: MonitorAssignment[];
  bySlot: Record<FlightDeckMonitorSlotId, MonitorAssignment | undefined>;
  getAssignment: (slotId: FlightDeckMonitorSlotId) => MonitorAssignment | undefined;
}

export function useAutoDirector(options: UseAutoDirectorOptions): UseAutoDirectorResult {
  const { locks, enabled = true, cadenceMs } = options;
  const intervalMs = cadenceMs ?? getRotationCadenceMs();

  const base = useMemo(() => buildAssignmentsFromLockState(locks), [
    locks.monitorALive,
    locks.monitorAUserMedia,
    locks.monitorBLocked,
    locks.pipLeftUserMedia,
    locks.cameraOn,
    locks.chatLocked,
    locks.playlistLocked,
    locks.memoryWallLocked,
  ]);

  const [assignments, setAssignments] = useState<MonitorAssignment[]>(() =>
    assignSlots({ current: base, seed: 1 }),
  );

  // Re-seed when lock state changes (preserve USER locks)
  useEffect(() => {
    setAssignments(assignSlots({ current: base, seed: Date.now() }));
  }, [base]);

  // Rotate idle AUTO_DIRECTOR slots on cadence
  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined") return;
    const id = window.setInterval(() => {
      setAssignments((prev) => rotateIdleAssignments(prev, Date.now()));
    }, Math.max(8_000, intervalMs));
    return () => window.clearInterval(id);
  }, [enabled, intervalMs, base]);

  const bySlot = useMemo(() => {
    const map = {} as Record<FlightDeckMonitorSlotId, MonitorAssignment | undefined>;
    for (const a of assignments) map[a.slotId] = a;
    return map;
  }, [assignments]);

  return {
    assignments,
    bySlot,
    getAssignment: (slotId) => bySlot[slotId],
  };
}
