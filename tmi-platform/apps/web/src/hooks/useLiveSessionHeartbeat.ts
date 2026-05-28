"use client";

import { useEffect, useRef } from "react";

const PING_INTERVAL_MS = 20_000;

interface HeartbeatOptions {
  enabled: boolean;
  viewerCount?: number;
  bitrateKbps?: number;
  droppedFramesPct?: number;
  rttMs?: number;
  audioOk?: boolean;
}

/**
 * Keeps a live session alive by pinging /api/live/go every 20 seconds.
 * Must be mounted for the duration of a live broadcast.
 * Sessions are evicted after 120s without a ping.
 */
export function useLiveSessionHeartbeat(opts: HeartbeatOptions) {
  const optsRef = useRef(opts);
  optsRef.current = opts;

  useEffect(() => {
    if (!opts.enabled) return;

    function sendPing() {
      const o = optsRef.current;
      if (!o.enabled) return;
      void fetch("/api/live/go", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action: "ping",
          viewerCount:      o.viewerCount,
          bitrateKbps:      o.bitrateKbps,
          droppedFramesPct: o.droppedFramesPct,
          rttMs:            o.rttMs,
          audioOk:          o.audioOk,
        }),
      }).catch(() => {});
    }

    sendPing(); // Immediate ping on mount
    const interval = setInterval(sendPing, PING_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [opts.enabled]); // Only restart if enabled state changes
}
