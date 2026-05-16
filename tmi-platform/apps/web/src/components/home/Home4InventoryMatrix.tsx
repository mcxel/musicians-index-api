"use client";

const INVENTORY = [
  ["Hero Billboard", "Booked", "#00ff88"],
  ["Lobby Wall", "Open", "#00ffff"],
  ["Magazine Cover", "Reserved", "#ffd700"],
  ["Battle Stage", "Open", "#ff2daa"],
];

export default function Home4InventoryMatrix() {
  return (
    <section style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#00ffff", fontWeight: 800, marginBottom: 16 }}>
        INVENTORY MATRIX
      </div>
      <div style={{ border: "1px solid rgba(0,255,255,0.35)", borderRadius: 10, overflow: "hidden" }}>
        {INVENTORY.map(([slot, state, color]) => (
          <div key={slot} style={{ display: "grid", gridTemplateColumns: "1fr auto", padding: "10px 12px", borderTop: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
            <span style={{ color: "white", fontSize: 12 }}>{slot}</span>
            <span style={{ color, fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>{state}</span>
          </div>
        ))}
      </div>
    </section>
  );
}