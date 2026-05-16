"use client";

import { getSafetyViolationLog } from "@/lib/safety/safetyViolationLogger";

export default function SafetyViolationFeed() {
  const log = getSafetyViolationLog().slice(-30).reverse();
  return (
    <section data-testid="safety-violation-feed" style={{ border: "1px solid rgba(248,113,113,0.4)", borderRadius: 10, padding: 12, background: "#0f172a" }}>
      <h3 style={{ marginTop: 0, color: "#fda4af" }}>Safety Violation Feed</h3>
      <div style={{ display: "grid", gap: 6, maxHeight: 220, overflow: "auto" }}>
        {log.length === 0 ? (
          <span style={{ color: "#64748b", fontSize: 12 }}>No violations logged yet.</span>
        ) : (
          log.map((v) => (
            <div key={v.id} data-testid={`safety-violation-${v.id}`} style={{ fontSize: 11, color: "#fecaca" }}>
              [{new Date(v.timestamp).toLocaleTimeString()}] {v.actorId} {v.action} {"->"} {v.target} BLOCKED: {v.reason}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
