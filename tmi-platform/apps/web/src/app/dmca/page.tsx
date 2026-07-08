import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "DMCA Copyright Policy",
  description: "The Musician's Index DMCA takedown policy and copyright infringement reporting process.",
};

const SECTIONS: [string, string][] = [
  [
    "Our Commitment",
    "The Musician's Index (TMI) respects the intellectual property rights of others and expects users to do the same. We comply with the Digital Millennium Copyright Act (DMCA) and respond promptly to valid copyright infringement notices.",
  ],
  [
    "Filing a DMCA Takedown Notice",
    "If you believe content on TMI infringes your copyright, send a written notice to our designated DMCA agent at dmca@tmi.live with the following information: (1) your physical or electronic signature; (2) identification of the copyrighted work you claim has been infringed; (3) identification of the allegedly infringing material and its URL on our platform; (4) your contact information (name, address, phone, email); (5) a statement that you have a good faith belief the use is not authorized; (6) a statement, under penalty of perjury, that the information in your notice is accurate and that you are the copyright owner or authorized to act on their behalf.",
  ],
  [
    "What Happens After We Receive a Notice",
    "Upon receipt of a valid DMCA notice, TMI will: (1) remove or disable access to the allegedly infringing content; (2) notify the account holder that content has been removed; (3) provide the account holder with a copy of the takedown notice (personal contact information redacted). Repeat infringers will have their accounts terminated.",
  ],
  [
    "Counter-Notification",
    "If you believe your content was removed in error, you may submit a counter-notification to dmca@tmi.live including: (1) your physical or electronic signature; (2) identification of the removed content and its previous location; (3) a statement under penalty of perjury that you have a good faith belief the content was removed by mistake or misidentification; (4) your name, address, phone number, email, and consent to federal district court jurisdiction. Upon receipt of a valid counter-notification, TMI will provide a copy to the original complainant and may restore the content within 10–14 business days unless the complainant notifies us they have filed a court action.",
  ],
  [
    "Designated DMCA Agent",
    "DMCA Agent: Legal Department, BernoutGlobal LLC. Email: dmca@tmi.live. Mailing address available upon request at contact@tmi.live.",
  ],
  [
    "Repeat Infringer Policy",
    "TMI maintains a repeat infringer policy. Accounts with multiple valid DMCA takedowns will be suspended or permanently terminated at TMI's discretion, in compliance with the DMCA safe harbor requirements.",
  ],
  [
    "False Claims",
    "Filing a false or misleading DMCA notice or counter-notification may expose you to civil liability and perjury charges. TMI reserves the right to seek damages from anyone who knowingly misrepresents copyright infringement.",
  ],
  [
    "Other IP Concerns",
    "For trademark issues, privacy violations, or other intellectual property concerns not covered by DMCA, contact legal@tmi.live.",
  ],
];

export default function DmcaPage() {
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
        <h1 style={{ fontSize: "clamp(26px,5vw,44px)", fontWeight: 900, margin: "0 0 8px" }}>
          DMCA Copyright Policy
        </h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 36 }}>
          Last updated: July 1, 2026
        </p>

        {SECTIONS.map(([title, body]) => (
          <div key={title} style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 8px" }}>{title}</h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, margin: 0 }}>{body}</p>
          </div>
        ))}

        <div
          style={{
            marginTop: 36,
            padding: "20px 24px",
            background: "rgba(0,255,255,0.05)",
            border: "1px solid rgba(0,255,255,0.15)",
            borderRadius: 8,
            marginBottom: 32,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 800, color: "#00FFFF", letterSpacing: "0.12em", marginBottom: 8 }}>
            SUBMIT A DMCA NOTICE
          </div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, margin: "0 0 12px" }}>
            Email your takedown notice to:{" "}
            <a href="mailto:dmca@tmi.live" style={{ color: "#00FFFF", textDecoration: "none" }}>
              dmca@tmi.live
            </a>
          </p>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: 0 }}>
            Response time: within 2–3 business days for valid notices.
          </p>
        </div>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <Link href="/terms" style={{ fontSize: 12, color: "#00FFFF", textDecoration: "none" }}>
            Terms of Service →
          </Link>
          <Link href="/legal/content-rights" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>
            Content Rights
          </Link>
          <Link href="/report-abuse" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>
            Report Abuse
          </Link>
          <Link href="/contact" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>
            Contact Legal
          </Link>
        </div>
      </div>
    </main>
  );
}
