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
            title: "Camera & Microphone Access",
            body: "TMI is a live performance platform. When you perform, host a room, or join a live session, the app requests access to your device camera and microphone solely to enable real-time video and audio streaming. We do not record, store, or transmit your camera or microphone data beyond the live session itself. Camera and microphone access is always initiated by your explicit action (tapping 'Go Live' or 'Join Room') and can be revoked at any time through your device settings.",
          },
          {
            title: "Live Streaming & User-Generated Content",
            body: "TMI enables live audio and video broadcasts between performers and audience members. Live sessions are transmitted in real time using WebRTC technology and are not stored on our servers unless you explicitly enable recording. User-generated content (chat messages, reactions, tip comments) is subject to our Community Guidelines. We reserve the right to moderate and remove content that violates those guidelines. If you choose to broadcast, your video and audio are visible to others in the same room in real time.",
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
