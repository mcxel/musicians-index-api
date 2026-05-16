"use client";

const rows = [
  { sponsor: "Pulse Cola", roi: 2.4, ctr: "3.1%" },
  { sponsor: "Noir Audio", roi: 1.8, ctr: "2.2%" },
  { sponsor: "City Ride", roi: 1.2, ctr: "1.4%" },
];

export default function SponsorROITracker() {
  return (
    <section style={{ border: "1px solid rgba(168,85,247,0.24)", borderRadius: 12, background: "rgba(34,14,60,0.35)", padding: 12 }}>
      <p style={{ margin: "0 0 8px", color: "#c4b5fd", fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase" }}>
        Sponsor ROI Tracker
      </p>
      <div style={{ display: "grid", gap: 6 }}>
        {rows.map((row) => (
          <article key={row.sponsor} style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, background: "rgba(0,0,0,0.24)", padding: "7px 9px", display: "grid", gridTemplateColumns: "1fr auto auto", gap: 10, alignItems: "center" }}>
            <span style={{ color: "#e2e8f0", fontSize: 11 }}>{row.sponsor}</span>
            <span style={{ color: row.roi >= 2 ? "#86efac" : "#fca5a5", fontSize: 11, fontWeight: 700 }}>ROI {row.roi}x</span>
            <span style={{ color: "#a5b4fc", fontSize: 10 }}>CTR {row.ctr}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
