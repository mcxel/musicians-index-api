import Link from "next/link";

const PACKAGES = [
  {
    id: "magazine-inline",
    name: "Magazine Inline",
    price: "$299/mo",
    color: "#00FFFF",
    icon: "📰",
    description: "Mid-article ad placement in TMI Magazine. Reaches readers actively consuming music editorial.",
    features: ["Mid-article placement", "Mobile + desktop", "Impression analytics", "Creative A/B testing"],
    ctaHref: "/advertise?package=magazine-inline",
  },
  {
    id: "live-overlay",
    name: "Live Room Overlay",
    price: "$499/mo",
    color: "#FF2DAA",
    icon: "🎥",
    description: "Brand overlay during live performances. Captures peak fan engagement moments.",
    features: ["Ticker + banner overlay", "All live rooms", "Real-time impression count", "Sponsor badge"],
    ctaHref: "/advertise?package=live-overlay",
  },
  {
    id: "homepage-billboard",
    name: "Homepage Billboard",
    price: "$999/mo",
    color: "#FFD700",
    icon: "🏠",
    description: "Prime placement on TMI homepages 1–5. Platform entry-point exposure.",
    features: ["Home 1–5 rotation", "Animated creative support", "Priority placement", "Weekly performance report"],
    ctaHref: "/advertise?package=homepage-billboard",
  },
  {
    id: "full-takeover",
    name: "Sponsored Page Takeover",
    price: "$1,499/mo",
    color: "#AA2DFF",
    icon: "💎",
    description: "A full-page sponsored experience under /sponsored/[your-brand]. Maximum brand authority.",
    features: ["Dedicated /sponsored URL", "Full editorial layout", "Live room integration", "Featured in magazine"],
    ctaHref: "/advertise?package=full-takeover",
  },
];

const STATS = [
  { label: "Monthly Active Users", value: "120K+" },
  { label: "Live Events / Month", value: "240+" },
  { label: "Battle Rooms / Week", value: "80+" },
  { label: "Avg. Session Length", value: "18 min" },
];

export const metadata = {
  title: "Advertise on TMI — The Musician's Index",
  description: "Reach 120K+ music fans. Ad packages from $299/mo.",
};

export default function AdvertisersPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", overflowX: "hidden" }}>

      {/* Top bar */}
      <div style={{ height: 4, background: "linear-gradient(90deg,#00FFFF,#FF2DAA,#FFD700,#AA2DFF)" }} />

      {/* Hero */}
      <section style={{
        background: "linear-gradient(155deg,#0a0030 0%,#050510 60%)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "clamp(56px,7vw,96px) clamp(20px,5vw,64px) clamp(48px,6vw,80px)",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ fontSize: 9, letterSpacing: "0.45em", color: "#00FFFF", fontWeight: 800, marginBottom: 16 }}>
            THE MUSICIAN&rsquo;S INDEX · ADVERTISING
          </div>
          <h1 style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: "clamp(3rem,8vw,7rem)", fontWeight: 900, lineHeight: 0.9, margin: "0 0 24px", letterSpacing: "0.01em" }}>
            REACH THE<br />CULTURE
          </h1>
          <p style={{ fontSize: "clamp(15px,1.8vw,20px)", color: "rgba(255,255,255,0.6)", lineHeight: 1.6, maxWidth: 560, margin: "0 auto 40px" }}>
            TMI is the live music platform where artists battle, fans vote, and culture moves in real time. Put your brand at the center of it.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="#packages" style={{ textDecoration: "none", background: "#00FFFF", color: "#050510", fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 18, padding: "14px 36px", letterSpacing: "0.05em" }}>
              VIEW PACKAGES
            </Link>
            <Link href="/hub/advertiser" style={{ textDecoration: "none", border: "1px solid rgba(0,255,255,0.4)", color: "#00FFFF", fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 18, padding: "14px 36px", letterSpacing: "0.05em" }}>
              ADVERTISER HUB
            </Link>
          </div>
        </div>
      </section>

      {/* Stats row */}
      <section style={{ background: "rgba(0,255,255,0.03)", borderBottom: "1px solid rgba(0,255,255,0.08)", padding: "32px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 24, textAlign: "center" }}>
          {STATS.map(s => (
            <div key={s.label}>
              <div style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: "clamp(2rem,4vw,3rem)", color: "#00FFFF", lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 6 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Packages */}
      <section id="packages" style={{ maxWidth: 1100, margin: "0 auto", padding: "clamp(48px,6vw,80px) clamp(20px,4vw,48px)" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#FFD700", fontWeight: 800, marginBottom: 12, textTransform: "uppercase" }}>AD PACKAGES</div>
        <h2 style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: "clamp(2rem,5vw,4rem)", margin: "0 0 40px", letterSpacing: "0.02em" }}>
          CHOOSE YOUR PLACEMENT
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 20 }}>
          {PACKAGES.map(pkg => (
            <div key={pkg.id} style={{ background: `${pkg.color}08`, border: `1px solid ${pkg.color}33`, padding: 28, display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>{pkg.icon}</div>
              <div style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 24, color: "#fff", marginBottom: 4 }}>{pkg.name}</div>
              <div style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 32, color: pkg.color, marginBottom: 16 }}>{pkg.price}</div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, marginBottom: 20, flex: 1 }}>{pkg.description}</p>
              <ul style={{ listStyle: "none", margin: "0 0 24px", padding: 0 }}>
                {pkg.features.map(f => (
                  <li key={f} style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <span style={{ color: pkg.color, marginRight: 8 }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <Link href={pkg.ctaHref} style={{ textDecoration: "none", display: "block", background: pkg.color, color: "#050510", fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 16, padding: "12px 24px", textAlign: "center", letterSpacing: "0.05em" }}>
                GET STARTED
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Custom deals */}
      <section style={{ background: "linear-gradient(135deg,#0a0030,#050510)", borderTop: "2px solid rgba(255,215,0,0.15)", padding: "clamp(40px,5vw,64px) 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: "clamp(1.8rem,4vw,3.5rem)", marginBottom: 16 }}>CUSTOM DEALS & CAMPAIGNS</div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginBottom: 32 }}>
            Season sponsorships, exclusive show partnerships, and multi-month campaigns. Built around your budget and goals.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/sponsored/beatmarket" style={{ textDecoration: "none", border: "1px solid rgba(255,215,0,0.4)", color: "#FFD700", fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 16, padding: "12px 28px" }}>
              SEE AN EXAMPLE →
            </Link>
            <Link href="/campaigns/summer-tour-2026" style={{ textDecoration: "none", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.5)", fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 16, padding: "12px 28px" }}>
              VIEW CAMPAIGNS →
            </Link>
          </div>
        </div>
      </section>

      <div style={{ height: 4, background: "linear-gradient(90deg,#AA2DFF,#FF2DAA,#FFD700)" }} />
    </main>
  );
}
