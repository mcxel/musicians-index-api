import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Report Abuse",
  description: "Report harmful content, harassment, spam, or policy violations on The Musician's Index.",
};

const REPORT_TYPES = [
  {
    title: "Copyright / DMCA Infringement",
    description:
      "Content that uses your copyrighted music, lyrics, images, or video without permission. Use our dedicated DMCA page for fastest processing.",
    action: "File a DMCA Notice",
    href: "/dmca",
    color: "#00FFFF",
  },
  {
    title: "Harassment or Bullying",
    description:
      "Targeted harassment, threats, doxxing, hate speech, or sustained bullying toward any individual or group.",
    action: "Email trust@tmi.live",
    href: "mailto:trust@tmi.live",
    color: "#ff00ff",
  },
  {
    title: "Spam or Fake Accounts",
    description:
      "Bot accounts, fake performer profiles, unsolicited commercial messages, or coordinated inauthentic behavior.",
    action: "Email trust@tmi.live",
    href: "mailto:trust@tmi.live",
    color: "#ffd700",
  },
  {
    title: "Explicit or Harmful Content",
    description:
      "Non-consensual intimate imagery, content involving minors, graphic violence, or content that violates our Community Guidelines.",
    action: "Email trust@tmi.live",
    href: "mailto:trust@tmi.live",
    color: "#ff4444",
  },
  {
    title: "Impersonation",
    description:
      "Accounts impersonating a real artist, public figure, or brand in a way that is deceptive or misleading.",
    action: "Email trust@tmi.live",
    href: "mailto:trust@tmi.live",
    color: "#aa2dff",
  },
  {
    title: "Payment or Commerce Fraud",
    description:
      "Fraudulent ticket sales, unauthorized charges, scam merchandise listings, or payment disputes.",
    action: "Email support@tmi.live",
    href: "mailto:support@tmi.live",
    color: "#00ffcc",
  },
];

const SECTIONS: [string, string][] = [
  [
    "What Happens After You Report",
    "Our Trust & Safety team reviews every report within 1–3 business days. For urgent matters involving immediate safety threats, we prioritize same-day review. We do not share the identity of reporters with reported users.",
  ],
  [
    "What We Do With Reports",
    "Confirmed violations result in content removal, temporary suspension, or permanent account termination depending on severity. Repeat violations escalate automatically. We may refer certain reports to law enforcement where required.",
  ],
  [
    "False Reports",
    "Submitting knowingly false reports is itself a violation of our Terms of Service and may result in your account being restricted.",
  ],
  [
    "Appeals",
    "If you believe your content or account was actioned in error, you may appeal by emailing appeals@tmi.live with your account email and a description of what happened.",
  ],
];

export default function ReportAbusePage() {
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
          SAFETY
        </div>
        <h1 style={{ fontSize: "clamp(26px,5vw,44px)", fontWeight: 900, margin: "0 0 8px" }}>Report Abuse</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginBottom: 36, maxWidth: 600 }}>
          TMI is committed to keeping the platform safe and respectful for artists, fans, and creators. Select the type
          of issue below to report it.
        </p>

        {/* Report type cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 48 }}>
          {REPORT_TYPES.map((item) => (
            <div
              key={item.title}
              style={{
                padding: "20px 24px",
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${item.color}22`,
                borderLeft: `3px solid ${item.color}`,
                borderRadius: 8,
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 20,
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{item.title}</div>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, margin: 0 }}>
                  {item.description}
                </p>
              </div>
              <a
                href={item.href}
                style={{
                  display: "inline-block",
                  padding: "8px 16px",
                  background: `${item.color}18`,
                  border: `1px solid ${item.color}55`,
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 700,
                  color: item.color,
                  textDecoration: "none",
                  letterSpacing: "0.05em",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                {item.action}
              </a>
            </div>
          ))}
        </div>

        {SECTIONS.map(([title, body]) => (
          <div key={title} style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 8px" }}>{title}</h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, margin: 0 }}>{body}</p>
          </div>
        ))}

        <div style={{ marginTop: 32, display: "flex", gap: 16, flexWrap: "wrap" }}>
          <Link href="/community-guidelines" style={{ fontSize: 12, color: "#00FFFF", textDecoration: "none" }}>
            Community Guidelines →
          </Link>
          <Link href="/dmca" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>
            DMCA Policy
          </Link>
          <Link href="/terms" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>
            Terms of Service
          </Link>
        </div>
      </div>
    </main>
  );
}
