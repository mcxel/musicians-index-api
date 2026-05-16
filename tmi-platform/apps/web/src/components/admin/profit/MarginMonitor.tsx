"use client";

import { useMemo, useState } from "react";

const rows = [
  { stream: "Merch", current: 32 },
  { stream: "Bookings", current: 41 },
  { stream: "Sponsors", current: 38 },
  { stream: "Ads", current: 29 },
  { stream: "Subscriptions", current: 36 },
];

export default function MarginMonitor() {
  const [target, setTarget] = useState(40);
  const belowTarget = useMemo(() => rows.filter((row) => row.current < target).length, [target]);

  return (
    <section style={{ border: "1px solid rgba(251,191,36,0.22)", borderRadius: 12, background: "rgba(39,25,8,0.38)", padding: 12 }}>
      <p style={{ margin: "0 0 8px", color: "#fde68a", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 800 }}>
        Margin Monitor
      </p>
      <label style={{ display: "grid", gap: 5, marginBottom: 10 }}>
        <span style={{ color: "#fcd34d", fontSize: 11 }}>Target margin {target}%</span>
        <input type="range" min={20} max={60} value={target} onChange={(event) => setTarget(Number(event.target.value))} style={{ accentColor: "#f59e0b" }} />
      </label>
      <p style={{ margin: "0 0 10px", color: "#fca5a5", fontSize: 11 }}>Streams below target: {belowTarget}</p>
      <div style={{ display: "grid", gap: 6 }}>
        {rows.map((row) => (
          <div key={row.stream} style={{ display: "grid", gridTemplateColumns: "88px 1fr 46px", gap: 8, alignItems: "center" }}>
            <span style={{ color: "#cbd5e1", fontSize: 11 }}>{row.stream}</span>
            <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
              <div style={{ width: `${row.current}%`, height: "100%", background: row.current >= target ? "#34d399" : "#f87171" }} />
            </div>
            <span style={{ color: "#e2e8f0", fontSize: 11, textAlign: "right" }}>{row.current}%</span>
          </div>
        ))}
      </div>
    </section>
  );
}
