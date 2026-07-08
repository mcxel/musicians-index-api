import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "How The Musician's Index uses cookies and similar tracking technologies.",
};

const SECTIONS = [
  [
    "What Are Cookies",
    "Cookies are small text files placed on your device when you visit a website. They allow the site to remember your preferences, keep you signed in, and understand how you use the platform.",
  ],
  [
    "Types of Cookies We Use",
    "Essential cookies are required for the platform to function — they handle login sessions, security tokens, and cart/checkout state. Performance cookies (e.g. Vercel Analytics) measure page load times and error rates anonymously. Functional cookies remember your preferences such as volume settings and theme choices. Advertising cookies (Google AdSense, Infolinks, Media.net) serve relevant ads and measure ad performance. You can opt out of advertising cookies at any time.",
  ],
  [
    "Third-Party Cookies",
    "Some cookies are placed by third-party services we integrate with: Google AdSense (ca-pub-4088577529436039) for advertising, Stripe for secure payment processing, and Infolinks for contextual ad delivery. These third parties have their own privacy and cookie policies.",
  ],
  [
    "How Long Cookies Last",
    "Session cookies expire when you close your browser. Persistent cookies remain for a set duration — authentication cookies last up to 30 days, preference cookies up to 12 months, and advertising cookies up to 24 months depending on the provider.",
  ],
  [
    "Managing Cookies",
    "You can control or delete cookies through your browser settings. Most browsers allow you to block all cookies, block third-party cookies only, or clear existing cookies. Blocking essential cookies will prevent sign-in and checkout from working. For advertising opt-out, visit the NAI opt-out tool at optout.networkadvertising.org or the Google Ad Settings page.",
  ],
  [
    "Do Not Track",
    "TMI respects the Do Not Track (DNT) browser signal where technically feasible. When DNT is enabled, we disable non-essential analytics and advertising trackers for your session.",
  ],
  [
    "Updates to This Policy",
    "We may update this Cookie Policy from time to time. The date at the top of this page reflects the most recent revision. Continued use of TMI after changes constitutes acceptance.",
  ],
  [
    "Contact",
    "Questions about cookies or tracking? Contact us at privacy@tmi.live or through our Contact page.",
  ],
];

export default function CookiePolicyPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#05060c",
        color: "#fff",
        padding: "40px 24px 80px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <Link href="/" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>
            ← Home
          </Link>
        </div>
        <div style={{ fontSize: 10, letterSpacing: 5, color: "#00FFFF", fontWeight: 800, marginBottom: 8 }}>
          LEGAL
        </div>
        <h1 style={{ fontSize: "clamp(26px,5vw,44px)", fontWeight: 900, margin: "0 0 8px" }}>Cookie Policy</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 36 }}>
          Last updated: July 1, 2026
        </p>

        {SECTIONS.map(([title, body]) => (
          <div key={title} style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 8px" }}>{title}</h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, margin: 0 }}>{body}</p>
          </div>
        ))}

        <div style={{ marginTop: 32, display: "flex", gap: 16, flexWrap: "wrap" }}>
          <Link href="/privacy" style={{ fontSize: 12, color: "#00FFFF", textDecoration: "none" }}>
            Privacy Policy →
          </Link>
          <Link href="/terms" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>
            Terms of Service
          </Link>
          <Link href="/contact" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>
            Contact Us
          </Link>
        </div>
      </div>
    </main>
  );
}
