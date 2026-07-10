"use client";

import { useMemo, useState } from "react";
import { DeckButton, DeckChip } from "@/components/admin/overseer/AdminDesignSystem";

type Severity = "critical" | "high" | "medium" | "low";

type Alert = {
  id: string;
  severity: Severity;
  title: string;
  uid: string;
  age: string;
  resolved: boolean;
};

const seed: Alert[] = [
  { id: "a1", severity: "critical", title: "Multi-account ticket fraud", uid: "u-4421", age: "2m", resolved: false },
  { id: "a2", severity: "high", title: "Auth breach pattern", uid: "u-7712", age: "5m", resolved: false },
  { id: "a3", severity: "high", title: "API exploit attempt", uid: "u-8008", age: "8m", resolved: false },
  { id: "a4", severity: "medium", title: "Bot-pattern chat flood", uid: "u-0931", age: "12m", resolved: false },
  { id: "a5", severity: "low", title: "Duplicate tip blocked", uid: "u-2247", age: "31m", resolved: true },
];

const palette: Record<Severity, { text: string; border: string; bg: string }> = {
  critical: { text: "#fb7185", border: "rgba(251,113,133,0.55)", bg: "rgba(251,113,133,0.18)" },
  high: { text: "#fb923c", border: "rgba(251,146,60,0.55)", bg: "rgba(251,146,60,0.16)" },
  medium: { text: "#facc15", border: "rgba(250,204,21,0.55)", bg: "rgba(250,204,21,0.14)" },
  low: { text: "#a1a1aa", border: "rgba(161,161,170,0.4)", bg: "rgba(161,161,170,0.12)" },
};

export default function SentinelWall() {
  const [alerts, setAlerts] = useState<Alert[]>(seed);
  const active = useMemo(() => alerts.filter((alert) => !alert.resolved), [alerts]);

  function resolve(id: string) {
    setAlerts((curr) => curr.map((alert) => (alert.id === id ? { ...alert, resolved: true } : alert)));
  }

  return (
    <section style={{ height: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 6 }}>
        <DeckChip label="Sentinels" value="100" />
        <DeckChip label="Active Alerts" value={String(active.length)} />
        <DeckChip label="Threat Level" value={active.length > 2 ? "Stable" : "Low"} />
      </div>

      <div style={{ display: "grid", gap: 6, overflowY: "auto", minHeight: 0 }}>
        {alerts.map((alert) => {
          const tone = palette[alert.severity];
          return (
            <article
              key={alert.id}
              style={{
                borderRadius: 8,
                border: `1px solid ${tone.border}`,
                background: alert.resolved
                  ? "linear-gradient(180deg, rgba(32,17,17,0.45), rgba(17,9,10,0.72))"
                  : "linear-gradient(180deg, rgba(54,22,18,0.72), rgba(21,9,11,0.86))",
                padding: "7px 8px",
                opacity: alert.resolved ? 0.5 : 1,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "start" }}>
                <div>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      borderRadius: 999,
                      border: `1px solid ${tone.border}`,
                      background: tone.bg,
                      color: tone.text,
                      fontSize: 8,
                      fontWeight: 900,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      padding: "2px 6px",
                    }}
                  >
                    {alert.severity}
                  </div>
                  <div style={{ color: "#ffe9bb", fontSize: 10, fontWeight: 800, marginTop: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    {alert.title}
                  </div>
                  <div style={{ color: "rgba(255,216,143,0.72)", fontSize: 8, marginTop: 3 }}>UID {alert.uid} · {alert.age} ago</div>
                </div>
                {!alert.resolved ? (
                  <DeckButton onClick={() => resolve(alert.id)}>Dismiss</DeckButton>
                ) : (
                  <span style={{ color: "rgba(255,225,163,0.62)", fontSize: 8, textTransform: "uppercase", fontWeight: 900 }}>
                    Cleared
                  </span>
                )}
              </div>
              {!alert.resolved ? (
                <div style={{ display: "flex", gap: 6, marginTop: 7 }}>
                  <DeckButton>Investigate</DeckButton>
                  <DeckButton>Open Logs</DeckButton>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
