"use client";

import { useEffect, useState } from "react";
import { DeckChip } from "@/components/admin/overseer/AdminDesignSystem";
import type { SecuritySentinelResponse } from "@/app/api/admin/security-sentinel/route";

type LoadState = "loading" | "ready" | "error";

export default function SentinelWall() {
  const [data, setData] = useState<SecuritySentinelResponse | null>(null);
  const [state, setState] = useState<LoadState>("loading");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/security-sentinel", { credentials: "include", cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json() as Promise<SecuritySentinelResponse>;
      })
      .then((d) => {
        if (cancelled) return;
        setData(d);
        setState("ready");
      })
      .catch(() => { if (!cancelled) setState("error"); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, fontFamily: "'Inter', sans-serif" }}>
      {/* Header section with count */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <span style={{ fontSize: 20, fontWeight: 900, color: "#fff", lineHeight: 1 }}>100</span>
          <span style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", marginLeft: 4, textTransform: "uppercase", fontWeight: 700 }}>Sentinels</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.3)", padding: "4px 8px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)" }}>
          <span style={{ fontSize: 7, color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>THREAT:</span>
          <span style={{ fontSize: 9, fontWeight: 900, color: "#00FF88" }}>LOW</span>
        </div>
      </div>

      {/* Dial / Threat Level visual */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        padding: "8px 10px",
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,215,0,0.15)",
        borderRadius: 8
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, fontWeight: 900, color: "#ffe9bb", textTransform: "uppercase" }}>
          <span>Threat Level</span>
          <span style={{ color: "#00FF88" }}>STABLE</span>
        </div>
        {/* Simple visual threat bar */}
        <div style={{ height: 6, width: "100%", background: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden", marginTop: 2 }}>
          <div style={{ height: "100%", width: "15%", background: "linear-gradient(90deg, #00FF88 0%, #a8ffb2 100%)" }} />
        </div>
      </div>

      {/* Security lists */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {[
          { label: "Vulnerabilities Fixed", value: "2 Urgent", color: "#00FF88" },
          { label: "Urgent Exceptions", value: "9 Entries", color: "#FF8A00" },
          { label: "Alert Logs", value: "15 Logs", color: "#FF4444" }
        ].map((item, idx) => (
          <div key={idx} style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "5px 8px",
            background: "rgba(255,255,255,0.01)",
            border: "1px solid rgba(255,255,255,0.05)",
            borderRadius: 6,
          }}>
            <span style={{ fontSize: 8, color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>{item.label}</span>
            <span style={{ fontSize: 9, fontWeight: 900, color: item.color }}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
