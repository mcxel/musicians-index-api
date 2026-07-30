/**
 * useDiscoveryBus — subscribe + poll Live Lobby Walls DiscoveryBus.
 * Shared by GlobalLiveDiscoveryOverlay and homepage surfaces (Rule 8 — one bus).
 */

"use client";

import { useEffect, useMemo, useState } from "react";
import { DiscoveryBus } from "./DiscoveryBus";
import { startDiscoveryPoll } from "./DiscoveryPublisher";
import { filterDiscoverableRecords } from "./discoveryVisibility";
import type { LiveDiscoveryRecord } from "./LiveDiscoveryRecord";

export function useDiscoveryBus(viewerUserId?: string | null): LiveDiscoveryRecord[] {
  const [raw, setRaw] = useState<LiveDiscoveryRecord[]>(() => DiscoveryBus.getAll());

  useEffect(() => {
    const unsub = DiscoveryBus.subscribe(setRaw);
    const stopPoll = startDiscoveryPoll({ intervalMs: 4000 });
    return () => {
      unsub();
      stopPoll();
    };
  }, []);

  return useMemo(
    () =>
      filterDiscoverableRecords(raw, {
        userId: viewerUserId,
        isStaff: false,
      }),
    [raw, viewerUserId],
  );
}
