"use client";

import Link from "next/link";

const DISCOVERY_ITEMS = [
  { title: "Emerging Artists", href: "/rankings/emerging", color: "#00ffff" },
  { title: "Genre Movers", href: "/rankings/genres", color: "#ff2daa" },
  { title: "Fan Pickups", href: "/rankings/fan-votes", color: "#ffd700" },
  { title: "Underground Heat", href: "/discover/underground", color: "#aa2dff" },
];

export default function Home2DiscoveryRail() {
  return (
    <section style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#00ffff", fontWeight: 800, marginBottom: 16 }}>
        DISCOVERY BELT
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
        {DISCOVERY_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              textDecoration: "none",
              color: "white",
              border: `1px solid ${item.color}40`,
              borderRadius: 10,
              padding: "12px 14px",
              background: `linear-gradient(180deg, ${item.color}18, rgba(5,5,16,0.9))`,
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {item.title}
          </Link>
        ))}
      </div>
    </section>
  );
}