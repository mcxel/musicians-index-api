"use client";

const venues = [
  { name: "South Metro Arena", yield: 71, status: "Boost" },
  { name: "North Hall Stage", yield: 83, status: "Stable" },
  { name: "East Dock Pavilion", yield: 62, status: "Rebalance" },
];

export default function VenueYieldRail() {
  return (
    <section style={{ border: "1px solid rgba(251,191,36,0.25)", borderRadius: 12, background: "rgba(45,28,9,0.34)", padding: 12 }}>
      <p style={{ margin: "0 0 8px", color: "#fcd34d", fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase" }}>
        Venue Yield Rail
      </p>
      <div style={{ display: "grid", gap: 7 }}>
        {venues.map((venue) => (
          <article key={venue.name} style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, background: "rgba(0,0,0,0.24)", padding: "7px 9px", display: "grid", gridTemplateColumns: "1fr auto auto", gap: 8, alignItems: "center" }}>
            <span style={{ color: "#e2e8f0", fontSize: 11 }}>{venue.name}</span>
            <span style={{ color: "#fde68a", fontSize: 11, fontWeight: 700 }}>{venue.yield}%</span>
            <span style={{ color: "#a5b4fc", fontSize: 10 }}>{venue.status}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
