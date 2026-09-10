import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Advertising Disclosures | TMI",
  description: "How The Musician's Index uses advertising, the networks we work with, and your choices about ad personalization.",
};

export default function DisclosuresPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#060410", color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>
      <div style={{ padding: "32px 24px 0" }}>
        <Link href="/home/1" style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← HOME</Link>
      </div>

      <div style={{ maxWidth: 720, margin: "40px auto", padding: "0 24px" }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: "#00FFFF", textTransform: "uppercase", marginBottom: 8 }}>LEGAL</div>
        <h1 style={{ fontSize: "clamp(24px,5vw,40px)", fontWeight: 900, margin: "0 0 8px" }}>Advertising Disclosures</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 32 }}>Last updated: September 2026 · BernoutGlobal LLC</p>

        {[
          {
            title: "How TMI Uses Advertising",
            body: "The Musician's Index is free to use for fans and performers. Advertising helps fund free access to live streaming, discovery, rankings, and the magazine, so we don't have to charge everyone to keep the platform running. We partner with Google AdSense and other certified advertising networks to display ads across the site.",
          },
          {
            title: "Google AdSense Consent & Billable Inventory",
            body: "On eligible public pages, after you accept advertising consent, TMI may load Google AdSense. Declining consent keeps session cookies needed to stay signed in but does not load AdSense for billable inventory. Platform bots, automated QA, certification runners, and other non-human traffic are excluded from billable AdSense inventory and must never be counted as payable impressions. ESTIMATED impressions are not PAYABLE and not PAID until a payment processor confirms settlement.",
          },
          {
            title: "Advertising Partners",
            body: "We currently work with Google AdSense as our primary advertising partner, and may work with additional certified networks (such as Amazon Publisher Services or Media.net) from time to time. Each partner operates under its own privacy policy and advertising standards in addition to ours.",
          },
          {
            title: "Cookies & Similar Technologies",
            body: "Our advertising partners use cookies, device identifiers, and similar technologies to serve ads, measure how those ads perform, and — where you've consented — personalize the ads you see based on your activity on TMI and other sites. This is separate from the session cookies TMI itself uses for login and preferences, which are described in our Privacy Policy.",
          },
          {
            title: "Your Consent Choices",
            body: "When you first visit TMI, you're shown a privacy and advertising preferences prompt where you can accept or decline advertising cookies. You can change that choice at any time by clearing your browser's site data for themusiciansindex.com, which will show the prompt again on your next visit.",
          },
          {
            title: "Opting Out of Personalized Advertising",
            body: "You can opt out of personalized advertising from Google and many other providers through the Google Ads Settings page (adssettings.google.com) and the Digital Advertising Alliance's opt-out tool (optout.aboutads.info). Opting out means you'll still see ads on TMI, but they won't be personalized based on your browsing activity.",
          },
          {
            title: "Children & Advertising",
            body: "TMI applies stricter advertising and data-collection limits for accounts identified as belonging to minors, consistent with our youth safety policy. Personalized advertising is not served to those accounts.",
          },
          {
            title: "Contact",
            body: "Questions about advertising on TMI, or requests related to your ad-personalization choices, can be sent to BernoutGlobal LLC at berntmusic33@gmail.com or through our support portal.",
          },
        ].map((section) => (
          <div key={section.title} style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: "#00FFFF", margin: "0 0 8px" }}>{section.title}</h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, margin: 0 }}>{section.body}</p>
          </div>
        ))}

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/privacy" style={{ fontSize: 11, color: "#00FFFF", textDecoration: "none" }}>Privacy Policy →</Link>
          <Link href="/support" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Support Portal</Link>
        </div>
      </div>
    </main>
  );
}
