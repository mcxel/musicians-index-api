"use client";

/**
 * Home3OccupancyRail — occupancy presentation for Home 3.
 * LEGACY_FAKE hardcoded counts (238/166/141/94) removed.
 * Until bound to session.viewerCount / capacity authority → HONEST EMPTY.
 */

export default function Home3OccupancyRail() {
  return (
    <section
      data-home3-occupancy-rail="1"
      data-occupancy-authority="none"
      style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#00ffff", fontWeight: 800, marginBottom: 16 }}>
        ROOM OCCUPANCY RAIL
      </div>
      <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, margin: 0, lineHeight: 1.5 }}>
        Occupancy unavailable — waiting on live session capacity authority. No fabricated room counts.
      </p>
    </section>
  );
}
