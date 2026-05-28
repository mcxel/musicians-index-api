"use client";

import { useEffect } from "react";

type LiveSessionHeartbeatProps = {
  enabled?: boolean;
  intervalMs?: number;
  stageState?: "pre-show" | "live" | "intermission" | "post-show";
};

export default function LiveSessionHeartbeat({
  enabled = true,
  intervalMs = 20_000,
  stageState = "live",
}: LiveSessionHeartbeatProps) {
  useEffect(() => {
    if (!enabled) return;

    let disposed = false;

    async function sendPing() {
      if (disposed) return;
      const startedAt = performance.now();
      try {
        await fetch("/api/live/ping", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            stageState,
            rttMs: Math.max(0, Math.round(performance.now() - startedAt)),
            bitrateKbps: typeof navigator !== "undefined" && "connection" in navigator
              ? Math.round((((navigator as Navigator & { connection?: { downlink?: number } }).connection?.downlink ?? 1) * 1000))
              : 0,
            droppedFramesPct: 0,
            audioOk: true,
          }),
        });
      } catch {
        // Heartbeat must never break UI flow.
      }
    }

    void sendPing();
    const timer = window.setInterval(() => {
      void sendPing();
    }, intervalMs);

    return () => {
      disposed = true;
      window.clearInterval(timer);
    };
  }, [enabled, intervalMs, stageState]);

  return null;
}
