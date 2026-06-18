import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Creator Policy",
  description: "TMI Creator Policy — content ownership, upload rights, monetization rules, and community standards for performers, writers, and artists on The Musician's Index.",
  alternates: { canonical: "https://themusiciansindex.com/creator-policy" },
};

const SECTIONS = [
  {
    title: "1. Content Ownership",
    body: "You retain full ownership of all original content you upload to TMI — tracks, videos, images, articles, and performances. By uploading, you grant TMI a non-exclusive, royalty-free license to display, stream, and promote your content on the platform and in marketing materials.",
  },
  {
    title: "2. Upload Rights",
    body: "You must own or have licensed all rights to content you upload, including music samples, backing tracks, visuals, and any third-party elements. Uploading content without proper rights is grounds for immediate removal and account suspension.",
  },
  {
    title: "3. Originality Requirement",
    body: "All tracks, videos, and written content submitted for rankings, battles, cyphers, or magazine features must be original work. AI-generated content may be submitted only when properly disclosed. Plagiarism and sampling without clearance are prohibited.",
  },
  {
    title: "4. Monetization Rules",
    body: "Creators who reach PRO tier or above are eligible to receive tips, fan club subscriptions, booking fees, and merchandise revenue through the platform. TMI takes a platform fee of 15% on direct fan payments and 20% on platform-brokered bookings. All payouts are processed via Stripe with a minimum threshold of $25.",
  },
  {
    title: "5. XP & Rankings",
    body: "Rankings are computed from platform activity (streams, tips, engagement, battle wins, audience growth) using our XP engine. TMI does not guarantee any specific rank placement. Rank manipulation, including coordinated bot voting or fraudulent streaming, results in permanent disqualification.",
  },
  {
    title: "6. Crown & Competition Eligibility",
    body: "To hold a Crown (Overall or Genre), a performer must be active on the platform with at least one published track or video in the last 30 days. Overall Crown holders may not hold position for more than 2 consecutive months. Genre crowns rotate after 1 month. TMI reserves the right to audit any performer's eligibility.",
  },
  {
    title: "7. Community Standards",
    body: "Creators must not use the platform to harass, defame, or threaten other users. Battle content must remain within competitive spirit — personal attacks targeting real-world identities, doxxing, or content designed to incite harm will result in content removal and account action.",
  },
  {
    title: "8. Prohibited Content",
    body: "The following content is strictly prohibited: sexually explicit material, graphic violence, content targeting minors, hate speech based on race, gender, sexuality, religion, or national origin, content promoting illegal activity, and content that violates third-party intellectual property rights.",
  },
  {
    title: "9. DMCA & Takedowns",
    body: "TMI complies with the Digital Millennium Copyright Act (DMCA). If you believe your copyrighted work has been infringed, submit a takedown notice to legal@themusiciansindex.com with your name, contact information, the infringing URL, and a description of the original work.",
  },
  {
    title: "10. Account Termination",
    body: "TMI reserves the right to suspend or permanently terminate accounts that violate this Creator Policy, Terms of Service, or any applicable law. Creators may appeal termination decisions by contacting support@themusiciansindex.com within 30 days.",
  },
];

export default function CreatorPolicyPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#060410", color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>
      <div style={{ padding: "32px 24px 0" }}>
        <Link href="/home/1" style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← HOME</Link>
      </div>

      <div style={{ maxWidth: 720, margin: "40px auto", padding: "0 24px" }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: "#00FFFF", textTransform: "uppercase", marginBottom: 8 }}>LEGAL</div>
        <h1 style={{ fontSize: "clamp(24px,5vw,40px)", fontWeight: 900, margin: "0 0 8px" }}>Creator Policy</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 32 }}>Last updated: June 2026 · BernoutGlobal LLC</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {SECTIONS.map((s) => (
            <div key={s.title}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: "#00FFFF", margin: "0 0 8px" }}>{s.title}</h2>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.7, margin: 0 }}>{s.body}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 48, padding: "20px 24px", background: "rgba(0,255,255,0.05)", border: "1px solid rgba(0,255,255,0.15)", borderRadius: 10 }}>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, margin: 0 }}>
            Questions about this policy? Contact us at{" "}
            <a href="mailto:legal@themusiciansindex.com" style={{ color: "#00FFFF", textDecoration: "none" }}>legal@themusiciansindex.com</a>.
          </p>
        </div>

        <div style={{ marginTop: 24, display: "flex", gap: 16, flexWrap: "wrap" }}>
          <Link href="/terms" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Terms of Service</Link>
          <Link href="/privacy" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Privacy Policy</Link>
          <Link href="/advertiser-policy" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Advertiser Policy</Link>
          <Link href="/refund-policy" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Refund Policy</Link>
        </div>
      </div>
    </main>
  );
}
