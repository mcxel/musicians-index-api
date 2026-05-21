import Link from "next/link";

export default function TermsPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "40px 24px 80px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <Link href="/" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Home</Link>
        </div>
        <div style={{ fontSize: 10, letterSpacing: 5, color: "#00FFFF", fontWeight: 800, marginBottom: 8 }}>LEGAL</div>
        <h1 style={{ fontSize: "clamp(26px,5vw,44px)", fontWeight: 900, margin: "0 0 8px" }}>Terms of Service</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 36 }}>Last updated: May 20, 2026</p>
        {[
          ["1. Acceptance", "By accessing or using The Musician\u2019s Index (TMI) platform, you agree to be bound by these Terms of Service and all applicable laws and regulations."],
          ["2. User Accounts", "You are responsible for maintaining the confidentiality of your account credentials. TMI reserves the right to suspend or terminate accounts that violate these terms."],
          ["3. Content Policy", "Users may not upload, transmit, or distribute content that infringes intellectual property rights, is defamatory, or violates any applicable law. TMI may remove content at its discretion."],
          ["4. Payments & Subscriptions", "Subscription fees are billed in advance. Refunds are issued per our Refund Policy. TMI uses Stripe for payment processing. All transactions are secured with industry-standard encryption."],
          ["5. NFTs & Digital Assets", "NFTs minted on TMI represent digital collectibles. Ownership does not transfer intellectual property rights to underlying artwork unless explicitly stated."],
          ["6. Performer & Sponsor Agreements", "Performers and sponsors entering contracts through TMI agree to the specific campaign and booking terms presented at time of agreement."],
          ["7. Limitation of Liability", "TMI is not liable for any indirect, incidental, or consequential damages arising from your use of the platform."],
          ["8. Governing Law", "These Terms are governed by the laws of the United States. Any disputes shall be resolved through binding arbitration."],
          ["9. Changes to Terms", "TMI may update these Terms at any time. Continued use of the platform after changes constitutes acceptance."],
          ["10. Contact", "For questions about these Terms, contact legal@tmi.live."],
        ].map(([title, body]) => (
          <div key={title as string} style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 8px" }}>{title}</h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, margin: 0 }}>{body}</p>
          </div>
        ))}
        <div style={{ marginTop: 32, display: "flex", gap: 16, flexWrap: "wrap" }}>
          <Link href="/privacy" style={{ fontSize: 12, color: "#00FFFF", textDecoration: "none" }}>Privacy Policy →</Link>
          <Link href="/refund-policy" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Refund Policy</Link>
          <Link href="/contact" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Contact Legal</Link>
        </div>
      </div>
    </main>
  );
}
