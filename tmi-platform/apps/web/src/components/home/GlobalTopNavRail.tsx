"use client";

import Link from "next/link";

const NAV_ITEMS = [
  { label: "Magazine", href: "/magazine" },
  { label: "Live", href: "/live" },
  { label: "Games", href: "/games" },
  { label: "Marketplace", href: "/marketplace" },
  { label: "News", href: "/news" },
  { label: "About", href: "/about" },
];

export default function GlobalTopNavRail() {
  return (
    <nav
      aria-label="TMI top navigation"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        backdropFilter: "blur(8px)",
        background: "linear-gradient(90deg, rgba(5,5,16,0.94), rgba(12,8,26,0.92))",
        borderBottom: "1px solid rgba(0,255,255,0.3)",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "10px 18px", display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, flex: 1 }}>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                textDecoration: "none",
                color: "#ffffff",
                padding: "6px 10px",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.16)",
                background: "rgba(255,255,255,0.04)",
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <Link
            href="/pricing"
            style={{
              textDecoration: "none",
              color: "#FFD700",
              padding: "6px 12px",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              borderRadius: 999,
              border: "1px solid rgba(255,215,0,0.35)",
              background: "rgba(255,215,0,0.06)",
            }}
          >
            Plans
          </Link>
          <Link
            href="/join"
            style={{
              textDecoration: "none",
              color: "#050510",
              padding: "6px 14px",
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              borderRadius: 999,
              background: "#00FFFF",
            }}
          >
            Join Free
          </Link>
        </div>
      </div>
    </nav>
  );
}