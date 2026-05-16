"use client";

import { useState } from "react";

const FULL_DATA = [
  { month: "Jan", spend: 2400,  revenue: 7200,  roi: 3.0 },
  { month: "Feb", spend: 3100,  revenue: 10850, roi: 3.5 },
  { month: "Mar", spend: 2800,  revenue: 8960,  roi: 3.2 },
  { month: "Apr", spend: 4200,  revenue: 16380, roi: 3.9 },
];

type Range = "1M" | "3M" | "All";

export default function ROIRail() {
  const [range, setRange] = useState<Range>("All");

  const data = range === "1M" ? FULL_DATA.slice(-1) : range === "3M" ? FULL_DATA.slice(-3) : FULL_DATA;
  const latest = data[data.length - 1];
  const maxRev = Math.max(...data.map(d => d.revenue));

  return (
    <section style={{ border: "1px solid rgba(168,85,247,0.35)", borderRadius: 12, background: "linear-gradient(180deg, rgba(30,10,50,0.6), rgba(8,4,18,0.9))", padding: 14, display: "grid", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <strong style={{ color: "#c4b5fd", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", flex: 1 }}>ROI ANALYTICS</strong>
        <span style={{ color: "#22c55e", fontSize: 13, fontWeight: 900 }}>{latest.roi}×</span>
        <span style={{ fontSize: 9, color: "#64748b" }}>latest</span>
      </div>

      {/* Range filter */}
      <div style={{ display: "flex", gap: 4 }}>
        {(["1M", "3M", "All"] as Range[]).map(r => (
          <button
            key={r}
            onClick={() => setRange(r)}
            style={{
              padding: "3px 10px", fontSize: 9, fontWeight: 700, borderRadius: 4, cursor: "pointer",
              border: `1px solid ${range === r ? "rgba(168,85,247,0.6)" : "rgba(168,85,247,0.2)"}`,
              background: range === r ? "rgba(168,85,247,0.2)" : "transparent",
              color: range === r ? "#c4b5fd" : "#64748b",
            }}
          >{r}</button>
        ))}
      </div>

      {/* Bar chart */}
      <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 80 }}>
        {data.map(d => (
          <div key={d.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 2, justifyContent: "flex-end", height: 60 }}>
              <div style={{ width: "100%", height: `${(d.revenue / maxRev) * 56}px`, background: "rgba(168,85,247,0.55)", borderRadius: "3px 3px 0 0", minHeight: 4 }} />
              <div style={{ width: "100%", height: `${(d.spend / maxRev) * 56}px`, background: "rgba(239,68,68,0.4)", borderRadius: "3px 3px 0 0", minHeight: 2 }} />
            </div>
            <span style={{ fontSize: 8, color: "#64748b" }}>{d.month}</span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 12, fontSize: 9 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, background: "rgba(168,85,247,0.55)", display: "inline-block", borderRadius: 2 }} />Revenue</span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, background: "rgba(239,68,68,0.4)", display: "inline-block", borderRadius: 2 }} />Spend</span>
      </div>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
        {[
          { label: "Total Spend",   value: `$${data.reduce((s, d) => s + d.spend,   0).toLocaleString()}` },
          { label: "Total Revenue", value: `$${data.reduce((s, d) => s + d.revenue, 0).toLocaleString()}` },
          { label: "Avg ROI",       value: `${(data.reduce((s, d) => s + d.roi, 0) / data.length).toFixed(1)}×` },
        ].map(m => (
          <div key={m.label} style={{ borderRadius: 7, border: "1px solid rgba(168,85,247,0.2)", background: "rgba(0,0,0,0.3)", padding: "5px 8px" }}>
            <p style={{ margin: 0, fontSize: 8, color: "#6b7280", letterSpacing: "0.08em", textTransform: "uppercase" }}>{m.label}</p>
            <p style={{ margin: "2px 0 0", fontSize: 12, fontWeight: 800, color: "#f1f5f9" }}>{m.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
