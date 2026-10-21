"use client";

import { useEffect, useState } from "react";
import { classifyServerLatency, type ServerLatencyTier } from "@/lib/media/serverLatencyPolicy";

export default function ServerConnectionStatus() {
  const [latency, setLatency] = useState<number | null>(null);
  const [offline, setOffline] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [tier, setTier] = useState<ServerLatencyTier | null>(null);

  useEffect(() => {
    let active = true;
    const measure = async () => {
      if (!navigator.onLine) {
        if (active) { setOffline(true); setUnavailable(false); setLatency(null); setTier(null); }
        return;
      }
      const started = performance.now();
      try {
        const response = await fetch("/api/clock/sync", { cache: "no-store", signal: AbortSignal.timeout(5000) });
        if (!response.ok) throw new Error("Clock unavailable");
        const result = await response.json() as { t?: number };
        if (typeof result.t !== "number") throw new Error("Invalid clock response");
        if (active) {
          const measured = Math.max(1, Math.ceil(performance.now() - started));
          setLatency(measured);
          setTier((previous) => classifyServerLatency(measured, previous));
          setOffline(false);
          setUnavailable(false);
        }
      } catch {
        if (active) { setLatency(null); setTier(null); setOffline(!navigator.onLine); setUnavailable(navigator.onLine); }
      }
    };
    void measure();
    const interval = window.setInterval(() => void measure(), 5000);
    window.addEventListener("online", measure);
    window.addEventListener("offline", measure);
    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener("online", measure);
      window.removeEventListener("offline", measure);
    };
  }, []);

  const color = offline ? "#ff6b6b" : tier === "good" ? "#00ff88" : tier === "fair" ? "#ffd700" : tier === "slow" ? "#ff6b6b" : "#aab0c3";
  const status = offline ? "Offline" : unavailable ? "Unavailable" : tier === "good" ? "Good" : tier === "fair" ? "Fair" : tier === "slow" ? "Slow" : "Measuring...";
  return (
    <span data-server-connection-status title="App server round-trip only; not live media/WebRTC quality"
      style={{ display: "inline-flex", alignItems: "center", gap: 5, border: `1px solid ${color}55`, background: `${color}16`, color, borderRadius: 6, padding: "5px 8px", fontSize: 10, fontWeight: 800, whiteSpace: "nowrap" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
      {status} · server {latency === null ? "—" : `${latency} ms`}
    </span>
  );
}