"use client";

const OCCUPANCY = [
  { room: "Venue Atlas", count: 238, color: "#00ffff" },
  { room: "Cypher Alpha", count: 166, color: "#aa2dff" },
  { room: "Battle Dock", count: 141, color: "#ff2daa" },
  { room: "Premiere Hall", count: 94, color: "#ffd700" },
];

export default function Home3OccupancyRail() {
  return (
    <section style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#00ffff", fontWeight: 800, marginBottom: 16 }}>
        ROOM OCCUPANCY RAIL
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        {OCCUPANCY.map((item) => (
          <div key={item.room} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "center" }}>
            <div style={{ color: "white", fontSize: 12 }}>{item.room}</div>
            <div style={{ color: item.color, fontWeight: 800, fontSize: 11 }}>{item.count} live</div>
            <div style={{ gridColumn: "1 / -1", height: 6, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${Math.min(100, Math.round(item.count / 2.8))}%`, background: item.color }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}