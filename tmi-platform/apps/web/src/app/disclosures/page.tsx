import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Advertising & Monetization Disclosures",
    description:
    "How The Musician's Index Magazine shows ads, sponsors, and affiliate links — including Google AdSense consent, cookies, and non-billable bot traffic.",
  alternates: { canonical: "https://themusiciansindex.com/disclosures" },
};

const SECTIONS = [
  {
    title: "Who we are",
    body: "The Musician's Index Magazine (TMI) is operated by BernoutGlobal LLC. This page explains how advertising, sponsorship, and related monetization appear on public surfaces at themusiciansindex.com.",
  },
  {
    title: "Google AdSense",
    body: "On eligible public pages, after you accept advertising consent, TMI may load Google AdSense. AdSense may set advertising and measurement cookies and may show personalized ads where permitted by law. Declining consent keeps session cookies needed to stay signed in but does not load AdSense for billable inventory. Ad serving is gated by route eligibility, consent, and entitlement — never on checkout, login, billing, or private live-room control surfaces.",
  },
  {
    title: "Sponsors, house promos, and direct ads",
    body: "TMI also shows direct sponsor placements and house promotions when inventory exists. Empty ad boxes are never left blank — the fallback chain is paid sponsor → platform promotion → AdSense (when ready) → Advertise Here CTA. Sponsor creatives are labeled as advertising or sponsorship when shown as paid placements.",
  },
  {
    title: "What we do not claim",
    body: "TMI does not promise Google AdSense approval, estimated earnings, or payouts. ESTIMATED impressions are not PAYABLE and not PAID until a payment processor confirms settlement. Contest cash prizes and large prize pools remain gated by platform financial health (Launch Mode uses XP, badges, and features until Cash Prize Mode is funded).",
  },
  {
    title: "Bots, QA, and certification traffic",
    body: "Platform bots, automated QA, certification runners, headless browsers, and other non-human traffic are excluded from billable AdSense inventory. They must never be counted as payable impressions.",
  },
  {
    title: "Cookies and privacy",
    body: "Session cookies support authentication and preferences. Advertising cookies load only after consent on eligible routes. Full details are in the Privacy Policy. You can reopen consent settings anytime (tmiOpenConsentSettings) or clear cookies in your browser.",
  },
  {
    title: "Contact",
    body: "Advertising or disclosure questions: berntmusic33@gmail.com · Support portal at /support · Privacy Policy at /privacy · Terms at /terms.",
  },
] as const;

export default function DisclosuresPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#060410",
        color: "#fff",
        fontFamily: "'Inter', sans-serif",
        paddingBottom: 80,
      }}
    >
      <div style={{ padding: "32px 24px 0" }}>
        <Link
          href="/home/1"
          style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.14em",
            color: "rgba(255,255,255,0.3)",
            textDecoration: "none",
          }}
        >
          ← HOME
        </Link>
      </div>

      <div style={{ maxWidth: 720, margin: "40px auto", padding: "0 24px" }}>
        <div
          style={{
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: "0.2em",
            color: "#00FFFF",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          LEGAL
        </div>
        <h1 style={{ fontSize: "clamp(24px,5vw,40px)", fontWeight: 900, margin: "0 0 8px" }}>
          Advertising &amp; Monetization Disclosures
        </h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 32 }}>
          Last updated: September 2026 · BernoutGlobal LLC · Publisher ID ca-pub-4088577529436039
        </p>

        {SECTIONS.map((section) => (
          <div key={section.title} style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: "#00FFFF", margin: "0 0 8px" }}>
              {section.title}
            </h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, margin: 0 }}>
              {section.body}
            </p>
          </div>
        ))}

        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            paddingTop: 24,
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <Link href="/privacy" style={{ fontSize: 11, color: "#00FFFF", textDecoration: "none" }}>
            Privacy Policy →
          </Link>
          <Link href="/terms" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>
            Terms
          </Link>
          <Link href="/contact" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>
            Contact
          </Link>
          <Link href="/sponsors/advertise" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>
            Advertise
          </Link>
        </div>
      </div>
    </main>
  );
}
