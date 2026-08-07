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

  const { moderation, securityTelemetryNote } = data;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <span style={{ fontSize: 20, fontWeight: 900, color: "#fff", lineHeight: 1 }}>
            {moderation.openActions}
          </span>
          <span
            style={{
              fontSize: 8,
              color: "rgba(255,255,255,0.4)",
              marginLeft: 4,
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            Open moderation actions
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(0,0,0,0.3)",
            padding: "4px 8px",
            borderRadius: 6,
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <span style={{ fontSize: 7, color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>24H:</span>
          <span style={{ fontSize: 9, fontWeight: 900, color: "#00FFFF" }}>{moderation.recentActions}</span>
        </div>
      </div>

      <div
        style={{
          padding: "8px 10px",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,215,0,0.15)",
          borderRadius: 8,
          fontSize: 9,
          color: "rgba(255,255,255,0.45)",
          lineHeight: 1.45,
        }}
      >
        {securityTelemetryNote}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "5px 8px",
          background: "rgba(255,255,255,0.01)",
          border: "1px solid rgba(255,255,255,0.05)",
          borderRadius: 6,
        }}
      >
        <span style={{ fontSize: 8, color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>Source</span>
        <span style={{ fontSize: 9, fontWeight: 900, color: "#FFD700" }}>{moderation.source}</span>
      </div>
    </div>
  );
}
