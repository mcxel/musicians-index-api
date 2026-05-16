import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Investor Preview | TMI",
  description: "Live investor preview for The Musician's Index platform surfaces.",
};

const PREVIEW_LINKS = [
  { href: "/home/1", label: "Homepage 1" },
  { href: "/home/1-2", label: "Homepage 1-2" },
  { href: "/home/2", label: "Homepage 2" },
  { href: "/home/3", label: "Homepage 3" },
  { href: "/home/4", label: "Homepage 4" },
  { href: "/home/5", label: "Homepage 5" },
  { href: "/magazine", label: "Magazine" },
  { href: "/artists", label: "Artists" },
  { href: "/messages", label: "Messaging" },
  { href: "/platform-status", label: "Platform Status" },
];

const REVENUE_PATHS = [
  "Subscriptions",
  "Artist Tips",
  "Sponsor Placements",
  "Advertiser Placements",
  "Ticketing",
  "Booking",
];

export default function InvestorsPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #2a0f43 0%, #06050d 65%)",
        color: "#fff",
        padding: "32px 20px 56px",
      }}
    >
      <section style={{ maxWidth: 980, margin: "0 auto" }}>
        <p style={{ margin: 0, color: "#71f4ff", fontWeight: 800, letterSpacing: "0.25em", fontSize: 11 }}>
          PRIVATE PREVIEW
        </p>
        <h1 style={{ marginTop: 8, marginBottom: 8, fontSize: 36, lineHeight: 1.1 }}>The Musician&apos;s Index</h1>
        <p style={{ marginTop: 0, color: "rgba(255,255,255,0.82)", maxWidth: 760 }}>
          TMI is now in visible assembly mode. Homepages, magazine surfaces, and creator discovery are live for preview while
          account, payment, and automation systems complete activation.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: 12,
            marginTop: 20,
          }}
        >
          {PREVIEW_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "block",
                textDecoration: "none",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.18)",
                borderRadius: 14,
                padding: "14px 16px",
                background: "linear-gradient(160deg, rgba(255,45,170,0.13), rgba(0,224,255,0.1))",
                fontWeight: 700,
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <section
          style={{
            marginTop: 26,
            border: "1px solid rgba(255,255,255,0.16)",
            borderRadius: 16,
            padding: "18px 16px",
            background: "rgba(0,0,0,0.24)",
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: 10, fontSize: 20 }}>Revenue Paths In Activation</h2>
          <ul style={{ margin: 0, paddingLeft: 18, color: "rgba(255,255,255,0.88)" }}>
            {REVENUE_PATHS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p style={{ marginBottom: 0, marginTop: 14, color: "#ffd7f1", fontWeight: 600 }}>
            Funding focus: accelerate account persistence, payment wiring, and operations automation.
          </p>
        </section>
      </section>
    </main>
  );
}
