/**
 * useHomeDiscoveryRotation — Home 1 orbit rotation hook (13s, DiscoveryBus source).
 */

"use client";

import { useEffect, useMemo, useState } from "react";
import { useDiscoveryBus } from "./useDiscoveryBus";
import {
  HOME_BROADCAST_ROTATION_MS,
  filterHomeOrbitEligibleRecords,
  logHomeDiscoveryFetched,
  logHomeRotationAdvanced,
  pickHomeOrbitRotationSlots,
  type HomeOrbitDiscoveryCard,
} from "./HomeDiscoveryRotationEngine";
import type { LiveDiscoveryRecord } from "./LiveDiscoveryRecord";

export interface UseHomeDiscoveryRotationOptions {
  slotCount?: number;
  viewerUserId?: string | null;
  enabled?: boolean;
}

export interface UseHomeDiscoveryRotationResult {
  cards: HomeOrbitDiscoveryCard[];
  /**
   * Full eligible (unrotated) live-discovery record set — same DiscoveryBus
   * subscription the rotation itself uses. Lets a caller look up a specific
   * host's live status (e.g. Crown Holder) without opening a second,
   * independently-timed poll of the registry (Rule 20 — one discovery truth).
   */
  records: LiveDiscoveryRecord[];
  eligibleCount: number;
  rotationOffset: number;
  isEmpty: boolean;
  intervalMs: number;
}

export function useHomeDiscoveryRotation(
  opts: UseHomeDiscoveryRotationOptions = {},
): UseHomeDiscoveryRotationResult {
  const slotCount = opts.slotCount ?? 8;
  const enabled = opts.enabled !== false;
  const records = useDiscoveryBus(opts.viewerUserId ?? null);
  const [rotationOffset, setRotationOffset] = useState(0);

  const eligible = useMemo(
    () => filterHomeOrbitEligibleRecords(records),
    [records],
  );

  useEffect(() => {
    logHomeDiscoveryFetched(eligible.length);
  }, [eligible.length]);

  useEffect(() => {
    if (!enabled || eligible.length <= slotCount) return;
    const id = window.setInterval(() => {
      setRotationOffset((o) => {
        const next = o + 1;
        logHomeRotationAdvanced(next);
        return next;
      });
    }, HOME_BROADCAST_ROTATION_MS);
    return () => window.clearInterval(id);
  }, [enabled, eligible.length, slotCount]);

  const cards = useMemo(
    () => pickHomeOrbitRotationSlots(records, slotCount, rotationOffset),
    [records, slotCount, rotationOffset],
  );

  return {
    cards,
    records: eligible,
    eligibleCount: eligible.length,
    rotationOffset,
    isEmpty: eligible.length === 0,
    intervalMs: HOME_BROADCAST_ROTATION_MS,
  };
}
