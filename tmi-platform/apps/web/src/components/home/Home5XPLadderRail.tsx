"use client";
import Link from "next/link";

export default function Home5XPLadderRail() {
  return (
    <section style={{ border: "1px solid rgba(0,255,136,0.55)", borderRadius: 10, padding: "12px 14px", background: "rgba(0,255,136,0.18)" }}>
      <h3 style={{ margin: 0, fontSize: 14, color: "#00ff88", marginBottom: 6 }}>XP Ladder</h3>
      <Link href="/xp" style={{ color: "#fff", textDecoration: "none", fontSize: 11, fontWeight: 700 }}>Climb The Ladder</Link>
    </section>
  );
}