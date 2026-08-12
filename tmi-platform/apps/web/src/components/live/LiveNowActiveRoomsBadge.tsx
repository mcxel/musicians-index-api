"use client";

/**
 * Target 4 — LIVE NOW — N ACTIVE ROOMS from GET /api/live/go `count` only.
 */

import { useEffect, useState } from "react";
import {
  fetchActiveRoomTruthCount,
  formatLiveNowActiveRoomsLabel,
} from "@/lib/broadcast/activeRoomTruth";

export default function LiveNowActiveRoomsBadge({
  pollMs = 10_000,
}: {
  pollMs?: number;
}) {
  const [count, setCount] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const next = await fetchActiveRoomTruthCount();
        if (!cancelled) {
          setCount(next);
          setReady(true);
        }
      } catch {
        if (!cancelled) setReady(true);
      }
    };
    void load();
    const id = setInterval(() => void load(), pollMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [pollMs]);

  return (
    <span
      data-testid="live-now-active-rooms"
      data-active-room-count={ready ? String(count) : undefined}
      style={{
        fontSize: 11,
        fontWeight: 900,
        color: "#FF4444",
        letterSpacing: "0.2em",
      }}
    >
      {ready ? formatLiveNowActiveRoomsLabel(count) : "LIVE NOW — … ACTIVE ROOMS"}
    </span>
  );
}
