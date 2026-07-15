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
    <section style={{ height: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
      {state === "loading" && (
        <p style={{ fontSize: 10, color: "rgba(255,216,143,0.6)" }}>Loading…</p>
      )}
      {state === "error" && (
        <p style={{ fontSize: 10, color: "#fb7185" }}>Unable to load moderation data. Retry.</p>
      )}

      {state === "ready" && data && (
        <>
          <div
            style={{
              borderRadius: 8,
              border: "1px solid rgba(161,161,170,0.35)",
              background: "rgba(30,30,34,0.5)",
              padding: "8px 10px",
              fontSize: 9,
              color: "rgba(228,228,231,0.85)",
              lineHeight: 1.5,
            }}
          >
            ⚠ {data.securityTelemetryNote}
          </div>

          <div style={{ fontSize: 8, letterSpacing: "0.12em", color: "rgba(255,216,143,0.55)", textTransform: "uppercase", marginTop: 2 }}>
            Moderation activity (source: {data.moderation.source})
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 6 }}>
            <DeckChip label="Open Actions" value={String(data.moderation.openActions)} />
            <DeckChip label="Last 24h" value={String(data.moderation.recentActions)} />
          </div>
        </>
      )}
    </section>
  );
}
