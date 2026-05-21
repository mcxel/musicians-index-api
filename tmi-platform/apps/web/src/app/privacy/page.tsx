import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#060410", color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>
      <div style={{ padding: "32px 24px 0" }}>
        <Link href="/home/1" style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← HOME</Link>
      </div>

      <div style={{ maxWidth: 720, margin: "40px auto", padding: "0 24px" }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: "#00FFFF", textTransform: "uppercase", marginBottom: 8 }}>LEGAL</div>
        <h1 style={{ fontSize: "clamp(24px,5vw,40px)", fontWeight: 900, margin: "0 0 8px" }}>Privacy Policy</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 32 }}>Last updated: May 2026 · BernoutGlobal LLC</p>

        {[
          {
            title: "Information We Collect",
            body: "We collect account information (name, email, role), usage data (pages visited, features used), payment information processed securely through Stripe, and optional profile information you provide during onboarding.",
          },
          {
            title: "How We Use Your Information",
            body: "We use your information to provide the TMI platform services, process payments, send transactional emails, personalize your experience, and improve the platform. We do not sell your personal data to third parties.",
          },
          {
            title: "Data Storage & Security",
            body: "Your data is stored securely in our databases with industry-standard encryption. Payment data is never stored on our servers — it is processed directly by Stripe. We implement rate limiting, CSRF protection, and session security across all endpoints.",
          },
          {
            title: "Cookies & Sessions",
            body: "We use session cookies for authentication and preferences. We do not use third-party advertising cookies. You can clear cookies at any time through your browser settings.",
          },
          {
            title: "Your Rights",
            body: "You have the right to access, correct, or delete your personal data at any time. Contact us through the support portal or email berntmusic33@gmail.com to exercise these rights.",
          },
          {
            title: "Contact",
            body: "For privacy-related questions, contact BernoutGlobal LLC at berntmusic33@gmail.com or through our support portal.",
          },
        ].map((section) => (
          <div key={section.title} style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: "#00FFFF", margin: "0 0 8px" }}>{section.title}</h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, margin: 0 }}>{section.body}</p>
          </div>
        ))}

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 24, display: "flex", gap: 12 }}>
          <Link href="/support" style={{ fontSize: 11, color: "#00FFFF", textDecoration: "none" }}>Support Portal →</Link>
          <Link href="/community-guidelines" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Community Guidelines</Link>
        </div>
      </div>
    </main>
  );
}
