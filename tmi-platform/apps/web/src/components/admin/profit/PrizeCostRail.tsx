"use client";

import { useState } from "react";

export default function PrizeCostRail() {
  const [coverageFloor, setCoverageFloor] = useState(70);

  return (
    <section style={{ border: "1px solid rgba(251,191,36,0.24)", borderRadius: 12, background: "rgba(51,33,6,0.36)", padding: 12 }}>
      <p style={{ margin: "0 0 8px", color: "#fcd34d", fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase" }}>
        Prize Cost Rail
      </p>
      <p style={{ margin: "0 0 8px", color: "#cbd5e1", fontSize: 11 }}>Sponsor coverage: 64% | Prize cost drift: +12%</p>
      <label style={{ display: "grid", gap: 4 }}>
        <span style={{ color: "#fde68a", fontSize: 11 }}>Coverage floor {coverageFloor}%</span>
        <input type="range" min={50} max={95} value={coverageFloor} onChange={(event) => setCoverageFloor(Number(event.target.value))} style={{ accentColor: "#f59e0b" }} />
      </label>
      <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
        {["Reduce overspend", "Reallocate sponsors"].map((action) => (
          <button key={action} type="button" style={{ borderRadius: 6, border: "1px solid rgba(251,191,36,0.35)", background: "rgba(120,53,15,0.26)", color: "#fde68a", fontSize: 9, letterSpacing: "0.08em", padding: "5px 8px", cursor: "pointer" }}>{action}</button>
        ))}
      </div>
    </section>
  );
}
