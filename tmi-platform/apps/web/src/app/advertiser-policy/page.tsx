import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Advertiser Policy",
  description: "TMI Advertiser Policy — ad standards, prohibited categories, campaign guidelines, and performance expectations for sponsors and advertisers on The Musician's Index.",
  alternates: { canonical: "https://themusiciansindex.com/advertiser-policy" },
};

const SECTIONS = [
  {
    title: "1. Advertiser Eligibility",
    body: "Any business, brand, or individual with a legitimate commercial offering may apply to advertise on TMI. TMI reserves the right to approve or reject any advertiser at its sole discretion. Approval is not guaranteed and may be revoked if content or conduct violates this policy.",
  },
  {
    title: "2. Ad Content Standards",
    body: "All ad creatives must be accurate, honest, and not misleading. Claims made in ad copy must be substantiated. TMI does not allow exaggerated or unverifiable claims. Ads must clearly represent the product or service being sold and must include a functional destination URL.",
  },
  {
    title: "3. Prohibited Ad Categories",
    body: "The following ad categories are strictly prohibited: alcohol and tobacco products, illegal drugs or drug paraphernalia, weapons and ammunition, adult content or services, gambling and betting services without proper licensing disclosure, predatory financial products, counterfeit goods, and any product or service that violates applicable law.",
  },
  {
    title: "4. Music Industry Standards",
    body: "Advertisers in the music industry — labels, distributors, streaming services, equipment brands — are welcome and prioritized. Ads for artist services must accurately represent the service offered and must not promise chart placement, streaming counts, or algorithmic outcomes that cannot be guaranteed.",
  },
  {
    title: "5. Ad Placement & Targeting",
    body: "TMI determines final ad placement across the platform including homepage, magazine, live rooms, performer profiles, and discovery rails. Advertisers may request preferred placement zones. TMI does not guarantee specific placement except in confirmed Sponsor Suite packages.",
  },
  {
    title: "6. Campaign Performance",
    body: "TMI provides impression, click, and engagement analytics through the advertiser dashboard. TMI does not guarantee specific click-through rates or conversion outcomes. All analytics data represents platform-side measurements.",
  },
  {
    title: "7. Payment & Billing",
    body: "All campaigns are billed in advance on a monthly cycle. Payment is processed securely through Stripe. Campaigns that begin mid-month are prorated. Failed payments result in campaign pause after a 3-day grace period. TMI does not issue refunds for campaigns already running unless there was a verified platform delivery error.",
  },
  {
    title: "8. Creative Approval",
    body: "All ad creatives (images, video, copy) are subject to TMI review before going live. Review typically takes 1-3 business days. TMI may request revisions or reject creatives that violate this policy.",
  },
  {
    title: "9. Brand Safety",
    body: "TMI is a family-inclusive platform. Ad content must be appropriate for users aged 13 and above. Advertisers accept that their ads may appear adjacent to music content across all genres including hip-hop, R&B, gospel, and country. Contextual targeting by genre is available in Sponsor Suite packages.",
  },
  {
    title: "10. Policy Violations & Termination",
    body: "Advertisers whose content violates this policy will have their campaigns paused immediately and may be permanently banned from the platform. Refunds for terminated campaigns due to policy violations are not issued. Advertisers may appeal decisions by contacting advertising@themusiciansindex.com within 14 days.",
  },
];

export default function AdvertiserPolicyPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#060410", color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>
      <div style={{ padding: "32px 24px 0" }}>
        <Link href="/home/1" style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← HOME</Link>
      </div>

      <div style={{ maxWidth: 720, margin: "40px auto", padding: "0 24px" }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: "#FF2DAA", textTransform: "uppercase", marginBottom: 8 }}>LEGAL</div>
        <h1 style={{ fontSize: "clamp(24px,5vw,40px)", fontWeight: 900, margin: "0 0 8px" }}>Advertiser Policy</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 32 }}>Last updated: June 2026 · BernoutGlobal LLC</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {SECTIONS.map((s) => (
            <div key={s.title}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: "#FF2DAA", margin: "0 0 8px" }}>{s.title}</h2>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.7, margin: 0 }}>{s.body}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 48, padding: "20px 24px", background: "rgba(255,45,170,0.05)", border: "1px solid rgba(255,45,170,0.15)", borderRadius: 10 }}>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, margin: 0 }}>
            Questions about advertising on TMI?{" "}
            <Link href="/advertising" style={{ color: "#FF2DAA", textDecoration: "none", fontWeight: 600 }}>View advertising packages</Link>{" "}
            or contact{" "}
            <a href="mailto:advertising@themusiciansindex.com" style={{ color: "#FF2DAA", textDecoration: "none" }}>advertising@themusiciansindex.com</a>.
          </p>
        </div>

        <div style={{ marginTop: 24, display: "flex", gap: 16, flexWrap: "wrap" }}>
          <Link href="/terms" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Terms of Service</Link>
          <Link href="/privacy" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Privacy Policy</Link>
          <Link href="/creator-policy" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Creator Policy</Link>
          <Link href="/refund-policy" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Refund Policy</Link>
        </div>
      </div>
    </main>
  );
}
