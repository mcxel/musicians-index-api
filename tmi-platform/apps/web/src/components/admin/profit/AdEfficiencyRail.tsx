"use client";

export default function AdEfficiencyRail() {
  return (
    <section style={{ border: "1px solid rgba(0,255,255,0.22)", borderRadius: 12, background: "rgba(10,30,44,0.34)", padding: 12 }}>
      <p style={{ margin: "0 0 8px", color: "#67e8f9", fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase" }}>
        Ad Efficiency Rail
      </p>
      <div style={{ display: "grid", gap: 6 }}>
        {["Placement A/B rotation: active", "Weak audience segment replaced", "Cost-per-click down 11%"].map((line) => (
          <p key={line} style={{ margin: 0, color: "#e0f2fe", fontSize: 11 }}>
            • {line}
          </p>
        ))}
      </div>
    </section>
  );
}
