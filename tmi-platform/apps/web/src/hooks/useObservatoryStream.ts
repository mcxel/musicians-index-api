"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export type ObservatorySnapshot = {
  ts: string;
  liveSessionCount: number;
  liveSessions: Array<{
    roomId: string;
    performer: string;
    genre: string;
    audience: number;
  }>;
  fleet: {
    total: number;
    pass: number;
    fail: number;
    pending: number;
    platformHealthScore: number;
    recommendation: "AUTO_DEPLOY" | "HUMAN_APPROVAL" | "BLOCK";
    revenueCertification: "GREEN" | "HOLD";
  } | null;
  revenue: {
    overallCertification: "GREEN" | "HOLD" | "PENDING";
    greenPipelines: number;
    holdPipelines: number;
    pendingPipelines: number;
    blockingFailures: Array<{ pipelineId: string; stepId: string; label: string }>;
  } | null;
};

type StreamStatus = "connecting" | "connected" | "reconnecting" | "error";

const RECONNECT_DELAY_MS = 3_000;
const MAX_RECONNECT_DELAY_MS = 30_000;

/**
 * Subscribes to the Observatory SSE stream at /api/admin/observatory/stream.
 * Auto-reconnects with exponential backoff when the connection drops.
 * Returns the latest snapshot and connection status.
 */
export function useObservatoryStream() {
  const [snapshot, setSnapshot] = useState<ObservatorySnapshot | null>(null);
  const [status, setStatus] = useState<StreamStatus>("connecting");
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const esRef = useRef<EventSource | null>(null);
  const reconnectDelay = useRef(RECONNECT_DELAY_MS);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useRef(true);

  const connect = useCallback(() => {
    if (!mounted.current) return;

    // Clean up any existing connection
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }

    setStatus("connecting");

    const es = new EventSource("/api/admin/observatory/stream");
    esRef.current = es;

    es.onopen = () => {
      if (!mounted.current) return;
      setStatus("connected");
      reconnectDelay.current = RECONNECT_DELAY_MS; // reset on success
    };

    es.onmessage = (ev) => {
      if (!mounted.current) return;
      try {
        const data = JSON.parse(ev.data) as ObservatorySnapshot;
        setSnapshot(data);
        setLastUpdated(new Date().toLocaleTimeString());
        setStatus("connected");
      } catch {
        // ignore malformed event
      }
    };

    es.onerror = () => {
      if (!mounted.current) return;
      es.close();
      esRef.current = null;
      setStatus("reconnecting");

      // Exponential backoff
      const delay = Math.min(reconnectDelay.current, MAX_RECONNECT_DELAY_MS);
      reconnectDelay.current = Math.min(delay * 2, MAX_RECONNECT_DELAY_MS);

      reconnectTimer.current = setTimeout(() => {
        if (mounted.current) connect();
      }, delay);
    };
  }, []);

  useEffect(() => {
    mounted.current = true;
    connect();

    return () => {
      mounted.current = false;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
    };
  }, [connect]);

  return { snapshot, status, lastUpdated };
}
