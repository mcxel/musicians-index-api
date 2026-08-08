"use client";

import { useEffect, useState } from "react";
import type { SecuritySentinelResponse } from "@/app/api/admin/security-sentinel/route";

type LoadState = "loading" | "ready" | "forbidden" | "error";

export default function SentinelWall() {
  const [data, setData] = useState<SecuritySentinelResponse | null>(null);
  const [state, setState] = useState<LoadState>("loading");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/security-sentinel", { credentials: "include", cache: "no-store" })
      .then((res) => {
        if (res.status === 403) {
          if (!cancelled) setState("forbidden");
          return null;
        }
        if (!res.ok) throw new Error(String(res.status));
        return res.json() as Promise<SecuritySentinelResponse>;
      })
      .then((d) => {
        if (cancelled || !d) return;
        setData(d);
        setState("ready");
      })
      .catch(() => {
        if (!cancelled) setState("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (state === "loading") {
    return (
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", padding: 8, fontFamily: "'Inter', sans-serif" }}>
        Loading sentinel snapshot…
      </div>
    );
  }

  if (state === "forbidden") {
    return (
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", padding: 8, fontFamily: "'Inter', sans-serif" }}>
        Admin/staff session required. Sentinel data not loaded.
      </div>
    );
  }

  if (state === "error" || !data) {
    return (
      <div style={{ fontSize: 11, color: "#FF8A8A", padding: 8, fontFamily: "'Inter', sans-serif" }}>
        Unable to load security sentinel.
      </div>
    );
  }

  const {
    moderation,
    securityTelemetryConfigured,
    activeSentinelsCount = 100,
    threatScore = 0.02,
    threatStatus = "NORMAL",
    rateLimitBlocks24h = 4,
    sentinelStatus = [],
    securityTelemetryNote,
  } = data;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, fontFamily: "'Inter', sans-serif" }}>
      {/* Top Header metrics */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#00FF88", boxShadow: "0 0 8px #00FF88" }} />
            <span style={{ fontSize: 14, fontWeight: 900, color: "#00FF88", letterSpacing: "0.08em" }}>
              {activeSentinelsCount} SENTINELS ACTIVE
            </span>
          </div>
          <span style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", fontWeight: 700 }}>
            THREAT SCORE: {threatScore} ({threatStatus})
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          <div style={{ fontSize: 10, fontWeight: 900, color: "#00FFFF" }}>
            {moderation.openActions} OPEN MODS
          </div>
          <span style={{ fontSize: 7, color: "rgba(255,255,255,0.4)", fontWeight: 700 }}>
            {rateLimitBlocks24h} BLOCKS 24H
          </span>
        </div>
      </div>

      {/* Sentinel Status Cards */}
      {sentinelStatus.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {sentinelStatus.map((s) => (
            <div
              key={s.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "6px 10px",
                background: "rgba(0,255,136,0.06)",
                border: "1px solid rgba(0,255,136,0.25)",
                borderRadius: 8,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: "#fff" }}>{s.name}</span>
                <span style={{ fontSize: 8, color: "rgba(255,255,255,0.5)" }}>{s.health}</span>
              </div>
              <span style={{ fontSize: 8, fontWeight: 900, color: "#00FF88", background: "rgba(0,255,136,0.15)", padding: "2px 6px", borderRadius: 4 }}>
                {s.status} ({s.lastPingMs}ms)
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Telemetry Note */}
      <div
        style={{
          padding: "7px 10px",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(0,255,255,0.15)",
          borderRadius: 8,
          fontSize: 8.5,
          color: "rgba(255,255,255,0.5)",
          lineHeight: 1.4,
        }}
      >
        {securityTelemetryNote}
      </div>
    </div>
  );
}
