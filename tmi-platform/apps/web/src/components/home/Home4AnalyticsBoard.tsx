"use client";

const METRICS = [
  { label: "CTR", value: "6.8%", color: "#00ffff" },
  { label: "Reach", value: "1.2M", color: "#ffd700" },
  { label: "Active Campaigns", value: "28", color: "#ff2daa" },
  { label: "Revenue", value: "$244K", color: "#00ff88" },
];

export default function Home4AnalyticsBoard() {
  return (
    <section style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#ffd700", fontWeight: 800, marginBottom: 16 }}>
        ANALYTICS BOARD
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
        {METRICS.map((m) => (
          <div key={m.label} style={{ border: `1px solid ${m.color}44`, borderRadius: 10, padding: 12, background: `linear-gradient(180deg, ${m.color}18, rgba(5,5,16,0.95))` }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", marginBottom: 4 }}>{m.label}</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}