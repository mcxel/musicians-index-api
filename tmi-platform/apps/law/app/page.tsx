import type { Metadata } from "next";
import Link from "next/link";
import { LawBubbleWidget } from "@/components/law-bubble/LawBubbleWidget";

export const metadata: Metadata = {
  title: "Danika's Law",
};

export default function DanikasLawHomePage() {
  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "2rem 1rem" }}>
      {/* Header */}
      <header style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
          <span style={{ fontSize: "2rem" }}>⚖️</span>
          <h1 style={{ margin: 0, fontSize: "1.75rem", fontWeight: 700 }}>
            Danika&apos;s Law
          </h1>
        </div>
        <p style={{ color: "#a0a0b0", margin: 0 }}>
          Legal guidance for musicians, artists, and creators — powered by AI
        </p>
      </header>

      {/* Law Bubble widget */}
      <LawBubbleWidget userId="guest" />

      {/* Navigation cards */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          marginTop: "2.5rem",
        }}
      >
        {[
          { href: "/cases", label: "📁 Cases", desc: "Track open matters" },
          { href: "/documents", label: "📄 Documents", desc: "Review agreements" },
          { href: "/compliance", label: "✅ Compliance", desc: "Rights & obligations" },
          { href: "/law-bubble", label: "💬 Law Bubble", desc: "Full Q&A interface" },
        ].map(({ href, label, desc }) => (
          <Link
            key={href}
            href={href}
            style={{
              display: "block",
              padding: "1.25rem",
              borderRadius: "0.75rem",
              border: "1px solid #2a2a3f",
              background: "#13131f",
              textDecoration: "none",
              color: "inherit",
              transition: "border-color 0.2s",
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>{label}</div>
            <div style={{ fontSize: "0.875rem", color: "#8080a0" }}>{desc}</div>
          </Link>
        ))}
      </section>

      {/* Footer */}
      <footer style={{ marginTop: "3rem", paddingTop: "1.5rem", borderTop: "1px solid #1e1e2e", color: "#606070", fontSize: "0.8rem" }}>
        <p>
          Danika&apos;s Law is an AI-assisted legal information service. It does not constitute legal advice.
          For representation, consult a licensed attorney.
        </p>
        <p>SOC 2 Type II certified • CCPA compliant • Hosted on law.berntout.com</p>
      </footer>
    </main>
  );
}
