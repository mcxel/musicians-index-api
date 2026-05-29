"use client";

import { useEffect, useRef } from "react";

type LiveSessionHeartbeatProps = {
  enabled?: boolean;
  intervalMs?: number;
  stageState?: "pre-show" | "live" | "intermission" | "post-show";
  roomId?: string;
};

export default function LiveSessionHeartbeat({
  enabled = true,
  intervalMs = 20_000,
  stageState = "live",
  roomId,
}: LiveSessionHeartbeatProps) {
  const viewerCountRef = useRef<number>(0);

  // Track audience count from /api/live/audience so the heartbeat reports real viewers
  useEffect(() => {
    if (!enabled || !roomId) return;
    let disposed = false;

    async function pollAudience() {
      if (disposed) return;
      try {
        const res = await fetch(`/api/live/audience?venue=${encodeURIComponent(roomId!)}`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json() as { present?: number };
          if (typeof data.present === "number") viewerCountRef.current = data.present;
        }
      } catch { /* non-critical */ }
    }

    void pollAudience();
    const t = window.setInterval(() => { void pollAudience(); }, Math.max(intervalMs, 10_000));
    return () => { disposed = true; window.clearInterval(t); };
  }, [enabled, roomId, intervalMs]);

  useEffect(() => {
    if (!enabled) return;

    let disposed = false;

    async function sendPing() {
      if (disposed) return;
      const t0 = performance.now();
      try {
        await fetch("/api/live/ping", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            stageState,
            viewerCount:    viewerCountRef.current,
            rttMs:          Math.max(0, Math.round(performance.now() - t0)),
            bitrateKbps:    typeof navigator !== "undefined" && "connection" in navigator
              ? Math.round((((navigator as Navigator & { connection?: { downlink?: number } }).connection?.downlink ?? 1) * 1000))
              : 0,
            droppedFramesPct: 0,
            audioOk:        true,
          }),
        });
      } catch {
        // Heartbeat must never break UI flow.
      }
    }

    void sendPing();
    const timer = window.setInterval(() => { void sendPing(); }, intervalMs);

    return () => {
      disposed = true;
      window.clearInterval(timer);
    };
  }, [enabled, intervalMs, stageState]);

  return null;
}
