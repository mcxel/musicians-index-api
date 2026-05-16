"use client";

import Link from "next/link";
import "@/styles/tmiTypography.css";

export default function Home5CypherOfWeekRail() {
  return (
    <section style={{ border: "1px solid rgba(170,45,255,0.55)", borderRadius: 10, padding: "12px 14px", background: "rgba(170,45,255,0.18)" }}>
      <h3 className="tmi-promo-title" style={{ margin: 0, fontSize: 14, marginBottom: 6 }}>Cypher Of The Week</h3>
      <Link href="/cypher/weekly" className="tmi-button-text" style={{ color: "#fff", textDecoration: "none", fontSize: 11 }}>Open Weekly Cypher</Link>
    </section>
  );
}