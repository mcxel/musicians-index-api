import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "BerntoutGlobal — The Platform for Creators",
  description: "BerntoutGlobal builds products for musicians, creators, and operators.",
  metadataBase: new URL("https://berntout.com"),
};

const PRODUCTS = [
  { name: "The Musicians Index", desc: "Magazine, rankings, and marketplace for artists.", href: "https://themusiciansindex.com", tag: "TMI" },
  { name: "Danika's Law",        desc: "AI-powered legal guidance for creators.",          href: "https://law.berntout.com",     tag: "LAW" },
  { name: "Thunder World",       desc: "Virtual and physical amusement experiences.",      href: "https://thunderworld.berntout.com", tag: "TWLD" },
  { name: "USA Stream Team",     desc: "Radio and streaming for independent artists.",     href: "https://usastreamteam.com",    tag: "UST" },
  { name: "WillDoIt",            desc: "Contractor marketplace for creative work.",        href: "https://willdoit.berntout.com",tag: "WDI" },
  { name: "HotScreens",         desc: "Creator content submission platform.",            href: "https://hotscreens.berntout.com",tag: "HS" },
  { name: "Mini Ace",            desc: "User content and social platform.",               href: "https://miniace.berntout.com", tag: "MA" },
  { name: "Need-A-Charge",       desc: "Charging kiosk and locker rental service.",       href: "https://rentacharge.berntout.com", tag: "NAC" },
  { name: "BerntoutGlobal XXL",  desc: "Operator program, command center, and HUD.",      href: "https://xxl.berntout.com",     tag: "XXL" },
];

export default function BerntoutSiteHomePage() {
  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "3rem 1.5rem", fontFamily: "system-ui, sans-serif", background: "#050508", color: "#f0f0f0", minHeight: "100vh" }}>
      {/* Hero */}
      <header style={{ textAlign: "center", marginBottom: "4rem" }}>
        <h1 style={{ fontSize: "2.75rem", fontWeight: 800, margin: "0 0 0.75rem", letterSpacing: "-0.03em" }}>
          BerntoutGlobal
        </h1>
        <p style={{ fontSize: "1.15rem", color: "#8080a0", maxWidth: 560, margin: "0 auto" }}>
          Building the ecosystem for musicians, operators, and creators.
        </p>
      </header>

      {/* Product catalog */}
      <section>
        <h2 style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#505060", marginBottom: "1.5rem" }}>
          Products
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
          {PRODUCTS.map(({ name, desc, href, tag }) => (
            <a
              key={tag}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "block",
                padding: "1.25rem 1.5rem",
                borderRadius: "0.75rem",
                border: "1px solid #1e1e2e",
                background: "#0d0d18",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.4rem" }}>
                <span style={{ fontWeight: 700 }}>{name}</span>
                <span style={{ fontSize: "0.7rem", background: "#1e1e3a", padding: "0.2rem 0.5rem", borderRadius: "0.25rem", color: "#7070c0", fontFamily: "monospace" }}>{tag}</span>
              </div>
              <p style={{ margin: 0, fontSize: "0.875rem", color: "#7070a0", lineHeight: 1.5 }}>{desc}</p>
            </a>
          ))}
        </div>
      </section>

      {/* Footer links */}
      <nav style={{ marginTop: "4rem", paddingTop: "2rem", borderTop: "1px solid #1a1a2a", display: "flex", gap: "2rem", flexWrap: "wrap", justifyContent: "center" }}>
        {["About", "Press", "Partners", "Contact", "Careers"].map((label) => (
          <Link
            key={label}
            href={`/${label.toLowerCase()}`}
            style={{ color: "#6060a0", fontSize: "0.875rem", textDecoration: "none" }}
          >
            {label}
          </Link>
        ))}
      </nav>
    </main>
  );
}
