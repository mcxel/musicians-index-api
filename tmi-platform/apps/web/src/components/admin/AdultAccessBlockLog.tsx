"use client";

import { getAdultAccessBlockLogEntries } from "@/lib/safety/adultAccessBlockLog";

export default function AdultAccessBlockLog() {
  const entries = getAdultAccessBlockLogEntries().slice(-30).reverse();
  return (
    <section data-testid="adult-access-block-log" style={{ border: "1px solid rgba(244,63,94,0.5)", borderRadius: 10, padding: 12, background: "#0f172a" }}>
      <h3 style={{ marginTop: 0, color: "#fb7185" }}>Adult Access Block Log</h3>
      <div style={{ display: "grid", gap: 6, maxHeight: 220, overflow: "auto" }}>
        {entries.length === 0 ? (
          <span style={{ color: "#64748b", fontSize: 12 }}>No adult/unknown blocks yet.</span>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} data-testid={`adult-block-${entry.id}`} style={{ fontSize: 11, color: "#fecdd3" }}>
              [{new Date(entry.timestamp).toLocaleTimeString()}] {entry.actorAgeClass} {entry.actorId} blocked: {entry.reason}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
