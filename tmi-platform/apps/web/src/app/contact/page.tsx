import Link from "next/link";

export default function ContactPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#060410", color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>

      <div style={{ padding: "32px 24px 0" }}>
        <Link href="/home/1" style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← HOME</Link>
      </div>

      <div style={{ maxWidth: 640, margin: "40px auto", padding: "0 24px" }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: "#00FFFF", textTransform: "uppercase", marginBottom: 8 }}>CONTACT</div>
        <h1 style={{ fontSize: "clamp(24px,5vw,40px)", fontWeight: 900, margin: "0 0 12px", letterSpacing: "-0.5px" }}>
          Get in Touch with TMI
        </h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", margin: "0 0 32px", lineHeight: 1.6 }}>
          For partnerships, support, or general inquiries — we respond within 24 hours.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 40 }}>
          {[
            { label: "General Support",       desc: "Account issues, billing, platform questions", href: "/support",         color: "#00FFFF", icon: "🎧" },
            { label: "Artist Partnerships",   desc: "Performance opportunities, collaboration, features", href: "/hub/artist",  color: "#FF2DAA", icon: "🎤" },
            { label: "Sponsor & Advertiser",  desc: "Brand deals, ad placements, sponsorship packages",  href: "/hub/sponsor", color: "#FFD700", icon: "🤝" },
            { label: "Venue Partnerships",    desc: "Host TMI events, list your venue, booking inquiries", href: "/hub/venue",  color: "#22c55e", icon: "🏟️" },
            { label: "Press & Media",         desc: "Press kits, media requests, interviews",              href: "/support",    color: "#AA2DFF", icon: "📰" },
          ].map((item) => (
            <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
              <div style={{
                background: "rgba(255,255,255,0.03)", border: `1px solid ${item.color}28`,
                borderRadius: 12, padding: "18px 20px",
                display: "flex", alignItems: "flex-start", gap: 14,
              }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: item.color, marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>{item.desc}</div>
                </div>
                <span style={{ marginLeft: "auto", fontSize: 12, color: item.color, flexShrink: 0 }}>→</span>
              </div>
            </Link>
          ))}
        </div>

        <div style={{
          background: "rgba(0,255,255,0.05)", border: "1px solid rgba(0,255,255,0.15)",
          borderRadius: 14, padding: "24px 20px", textAlign: "center",
        }}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>Direct contact</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#00FFFF" }}>berntmusic33@gmail.com</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 6 }}>BernoutGlobal LLC · The Musician&apos;s Index</div>
        </div>
      </div>
    </main>
  );
}
