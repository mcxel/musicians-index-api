"use client";

import { useMemo, useState } from "react";
import {
  ROUTE_BUTTON_AUDIT,
  AUDIT_LAST_RUN,
  getAuditCounts,
  type AuditEntry,
  type AuditStatus,
} from "@/lib/certification/RouteButtonAuditRegistry";

const STATUS_COLOR: Record<AuditStatus, string> = {
  working: "#00FF88",
  fixed: "#00E5FF",
  broken: "#FF4444",
  flagged: "#FFD700",
};

const STATUS_LABEL: Record<AuditStatus, string> = {
  working: "WORKING",
  fixed: "FIXED THIS PASS",
  broken: "BROKEN",
  flagged: "FLAGGED",
};

function IndicatorLight({ status }: { status: AuditStatus }) {
  const color = STATUS_COLOR[status];
  return (
    <span
      title={STATUS_LABEL[status]}
      style={{
        display: "inline-block",
        width: 9,
        height: 9,
        borderRadius: "50%",
        background: color,
        boxShadow: `0 0 8px ${color}99`,
        flexShrink: 0,
      }}
    />
  );
}

export default function RouteButtonAuditPanel() {
  const [filter, setFilter] = useState<AuditStatus | "all">("all");
  const counts = useMemo(() => getAuditCounts(), []);
  const bySurface = useMemo(() => {
    const groups = new Map<string, AuditEntry[]>();
    for (const entry of ROUTE_BUTTON_AUDIT) {
      if (filter !== "all" && entry.status !== filter) continue;
      const list = groups.get(entry.surface) ?? [];
      list.push(entry);
      groups.set(entry.surface, list);
    }
    return groups;
  }, [filter]);

  const overallColor =
    counts.broken > 0 ? STATUS_COLOR.broken : counts.flagged > 0 ? STATUS_COLOR.flagged : STATUS_COLOR.working;

  return (
    <div style={{ height: "100%", overflowY: "auto", color: "#eee", fontFamily: "monospace", fontSize: 11 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              width: 12, height: 12, borderRadius: "50%",
              background: overallColor, boxShadow: `0 0 12px ${overallColor}aa`,
              display: "inline-block",
            }}
          />
          <span style={{ color: "#FFD700", fontWeight: 800, letterSpacing: "0.12em", fontSize: 11 }}>
            ROUTE &amp; BUTTON AUDIT
          </span>
        </div>
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>Last audit: {AUDIT_LAST_RUN}</span>
      </div>

      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginBottom: 10, lineHeight: 1.5 }}>
        This is a manual audit ledger, not a live scanner — nothing here re-checks itself automatically.
        Counts reflect the most recent Fan/Performer surface pass and the fixes applied afterward.
      </div>

      {/* Status filter chips */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
        {(["all", "broken", "flagged", "fixed", "working"] as const).map((s) => {
          const active = filter === s;
          const count = s === "all" ? ROUTE_BUTTON_AUDIT.length : counts[s];
          const color = s === "all" ? "#fff" : STATUS_COLOR[s];
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                background: active ? `${color}22` : "rgba(255,255,255,0.04)",
                border: `1px solid ${active ? color : "rgba(255,255,255,0.12)"}`,
                color,
                borderRadius: 6,
                padding: "3px 8px",
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: "0.06em",
                cursor: "pointer",
                textTransform: "uppercase",
              }}
            >
              {s} ({count})
            </button>
          );
        })}
      </div>

      {/* Grouped list */}
      {[...bySurface.entries()].map(([surface, entries]) => (
        <div key={surface} style={{ marginBottom: 14 }}>
          <div style={{ color: "#00E5FF", fontWeight: 800, fontSize: 10, letterSpacing: "0.08em", marginBottom: 6 }}>
            {surface}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {entries.map((entry) => (
              <div
                key={entry.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                  padding: "6px 8px",
                  borderRadius: 6,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <span style={{ marginTop: 2 }}>
                  <IndicatorLight status={entry.status} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <span style={{ color: "#fff", fontWeight: 700 }}>{entry.label}</span>
                    <span style={{ color: STATUS_COLOR[entry.status], fontSize: 8, fontWeight: 900, whiteSpace: "nowrap" }}>
                      {STATUS_LABEL[entry.status]}
                    </span>
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 9, marginTop: 1 }}>
                    {entry.file}
                    {entry.line ? `:${entry.line}` : ""} → {entry.target}
                  </div>
                  {entry.note && (
                    <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 9, marginTop: 3, lineHeight: 1.4 }}>
                      {entry.note}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {bySurface.size === 0 && (
        <div style={{ textAlign: "center", padding: "24px 0", color: "rgba(255,255,255,0.3)" }}>
          No entries match this filter.
        </div>
      )}
    </div>
  );
}
