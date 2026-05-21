import Link from "next/link";

export default function PromotionalHubPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#060410", color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>
      <div style={{ padding: "32px 24px 0" }}>
        <Link href="/home/1" style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← HOME</Link>
      </div>
      <div style={{ maxWidth: 800, margin: "40px auto", padding: "0 24px" }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: "#FFD700", textTransform: "uppercase", marginBottom: 8 }}>PROMOTIONAL HUB</div>
        <h1 style={{ fontSize: "clamp(24px,5vw,40px)", fontWeight: 900, margin: "0 0 12px" }}>Promote Your Brand on TMI</h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", margin: "0 0 32px", lineHeight: 1.6 }}>
          Whether you&apos;re a sponsor, advertiser, or artist — TMI gives you powerful tools to reach engaged music audiences.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12, marginBottom: 32 }}>
          {[
            { title: "Sponsor Hub",     desc: "Campaign management, contest sponsorships, room takeovers", href: "/hub/sponsor",     color: "#FFD700", icon: "🤝" },
            { title: "Advertiser Hub",  desc: "Ad placements, analytics, creative campaigns",               href: "/hub/advertiser",  color: "#FFA500", icon: "📢" },
            { title: "Artist Promo",    desc: "Boost your profile, promote releases, billboard slots",       href: "/hub/artist",      color: "#00FFFF", icon: "🎤" },
            { title: "Giveaways",       desc: "Run prize giveaways to grow your audience",                  href: "/giveaway",        color: "#FF2DAA", icon: "🎁" },
          ].map((item) => (
            <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
              <div style={{
                background: "rgba(255,255,255,0.03)", border: `1px solid ${item.color}28`,
                borderRadius: 14, padding: "20px",
              }}>
                <div style={{ fontSize: 24, marginBottom: 10 }}>{item.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: item.color, marginBottom: 6 }}>{item.title}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            </Link>
          ))}
        </div>
        <Link href="/support" style={{ padding: "12px 28px", borderRadius: 8, fontSize: 13, fontWeight: 800, background: "linear-gradient(135deg,#FFD700,#FFA500)", color: "#060410", textDecoration: "none", display: "inline-block" }}>
          Talk to Our Team →
        </Link>
      </div>
    </main>
  );
}
