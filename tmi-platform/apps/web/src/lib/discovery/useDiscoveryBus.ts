/**
 * useDiscoveryBus — subscribe + poll Live Lobby Walls DiscoveryBus.
 * Shared by GlobalLiveDiscoveryOverlay and homepage surfaces (Rule 8 — one bus).
 * Unpublishes stale tiles on tmi:endbroadcast (honest ENDED removal).
 */

"use client";

import { useEffect, useMemo, useState } from "react";
import { DiscoveryBus } from "./DiscoveryBus";
import { startDiscoveryPoll, unpublishLiveRoom } from "./DiscoveryPublisher";
import { filterDiscoverableRecords } from "./discoveryVisibility";
import type { LiveDiscoveryRecord } from "./LiveDiscoveryRecord";

export function useDiscoveryBus(viewerUserId?: string | null): LiveDiscoveryRecord[] {
  const [raw, setRaw] = useState<LiveDiscoveryRecord[]>(() => DiscoveryBus.getAll());

  useEffect(() => {
    const unsub = DiscoveryBus.subscribe(setRaw);
    const stopPoll = startDiscoveryPoll({ intervalMs: 4000 });

    const onEnd = (event: Event) => {
      const detail = (event as CustomEvent<{ roomId?: string; userId?: string }>).detail;
      if (detail?.roomId) {
        unpublishLiveRoom(detail.roomId);
        return;
      }
      if (detail?.userId) {
        for (const r of DiscoveryBus.getAll()) {
          if (r.hostUserId === detail.userId) unpublishLiveRoom(r.roomId);
        }
      }
    };

    window.addEventListener("tmi:endbroadcast", onEnd);
    return () => {
      unsub();
      stopPoll();
      window.removeEventListener("tmi:endbroadcast", onEnd);
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
