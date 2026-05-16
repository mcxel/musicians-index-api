"use client";

import Link from "next/link";

export default function Home3JoinRail() {
  return (
    <section style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#ff2daa", fontWeight: 800, marginBottom: 16 }}>
        JOIN RAIL
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
        <Link href="/live" style={cardStyle("#ff2daa")}>Join Live Rooms</Link>
        <Link href="/cypher/live" style={cardStyle("#aa2dff")}>Join Cypher Rooms</Link>
        <Link href="/battles/live" style={cardStyle("#00ffff")}>Join Battle Rooms</Link>
      </div>
    </section>
  );
}

function cardStyle(color: string) {
  return {
    textDecoration: "none",
    color: "white",
    borderRadius: 10,
    border: `1px solid ${color}40`,
    background: `linear-gradient(180deg, ${color}1f, rgba(5,5,16,0.95))`,
    padding: "14px 16px",
    fontSize: 12,
    fontWeight: 700,
  } as const;
}