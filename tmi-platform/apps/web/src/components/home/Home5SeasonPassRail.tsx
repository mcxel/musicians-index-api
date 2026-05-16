"use client";

import Link from "next/link";

export default function Home5SeasonPassRail() {
  return (
    <section style={{ border: "1px solid rgba(255,45,170,0.55)", borderRadius: 10, padding: "12px 14px", background: "rgba(255,45,170,0.18)" }}>
      <h3 className="tmi-season-label" style={{ margin: 0, fontSize: 14, marginBottom: 6 }}>Season Pass</h3>
      <Link href="/season-pass" className="tmi-button-text" style={{ color: "#fff", textDecoration: "none", fontSize: 11 }}>Open Season Pass</Link>
    </section>
  );
}