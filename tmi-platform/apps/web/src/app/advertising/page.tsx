import Link from "next/link";

const AD_PACKAGES = [
  {
    name: "Starter Placement",
    price: "$299/mo",
    color: "#00FFFF",
    features: ["Footer strip ad", "Homepage rotation", "Basic analytics", "1 active campaign"],
  },
  {
    name: "Mid-Article",
    price: "$799/mo",
    color: "#FF2DAA",
    features: ["Mid-article placement", "All magazine issues", "Click tracking", "3 active campaigns"],
  },
  {
    name: "Prime Billboard",
    price: "$1,999/mo",
    color: "#FFD700",
    features: ["Top-banner priority", "Live room billboard", "Performer profile ads", "10 active campaigns", "ROI analytics"],
  },
  {
    name: "Sponsor Suite",
    price: "$4,999/mo",
    color: "#AA2DFF",
    features: ["Full platform takeover", "Exclusive contest prizes", "Live event branding", "Unlimited campaigns", "Dedicated account rep"],
  },
];

export default function AdvertisingPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "40px 24px 80px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <Link href="/home/1" style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>← Home</Link>
        </div>

        <div style={{ marginBottom: 40, textAlign: "center" }}>
          <p style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.3em", color: "#FF2DAA", textTransform: "uppercase", margin: "0 0 10px" }}>
            Advertise on TMI
          </p>
          <h1 style={{ fontSize: "clamp(28px,5vw,52px)", fontWeight: 900, margin: "0 0 12px", letterSpacing: "-0.02em" }}>
            Reach 100K+ Music Creators
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", maxWidth: 600, margin: "0 auto 20px" }}>
            Place your brand inside live rooms, magazine articles, performer profiles, battle boards, and the TMI homepage.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/hub/advertiser" style={{ padding: "12px 28px", background: "linear-gradient(135deg,#FF2DAA,#AA2DFF)", borderRadius: 8, color: "#fff", fontWeight: 800, fontSize: 13, textDecoration: "none" }}>
              Open Advertiser Hub
            </Link>
            <Link href="/hub/sponsor" style={{ padding: "12px 28px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, color: "#e2e8f0", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
              Sponsor Hub
            </Link>
            <Link href="/contact?subject=advertising" style={{ padding: "12px 28px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "rgba(255,255,255,0.6)", fontWeight: 600, fontSize: 13, textDecoration: "none" }}>
              Contact Sales
            </Link>
          </div>
        </div>

        {/* Ad packages */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 48 }}>
          {AD_PACKAGES.map((pkg) => (
            <div key={pkg.name} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${pkg.color}30`, borderRadius: 14, padding: "24px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: pkg.color }} />
              <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.2em", color: pkg.color, textTransform: "uppercase", marginBottom: 8 }}>
                {pkg.name}
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, color: pkg.color, marginBottom: 16 }}>{pkg.price}</div>
              <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
                {pkg.features.map((f) => (
                  <li key={f} style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: pkg.color, fontSize: 10 }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/hub/advertiser" style={{ display: "block", textAlign: "center", padding: "10px", borderRadius: 8, background: `${pkg.color}18`, border: `1px solid ${pkg.color}44`, color: pkg.color, fontWeight: 800, fontSize: 12, textDecoration: "none" }}>
                Get Started →
              </Link>
            </div>
          ))}
        </div>

        {/* Stats bar */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 40 }}>
          {[
            { label: "Monthly Active Users", value: "100K+",  color: "#00FFFF" },
            { label: "Live Events / Month",   value: "200+",   color: "#FF2DAA" },
            { label: "Magazine Readers",      value: "50K+",   color: "#FFD700" },
            { label: "Battle Viewers",        value: "75K+",   color: "#AA2DFF" },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: "center", padding: "16px 12px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10 }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Advertiser / Sponsor split */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ background: "rgba(0,229,255,0.04)", border: "1px solid rgba(0,229,255,0.15)", borderRadius: 12, padding: "24px" }}>
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.2em", color: "#00E5FF", textTransform: "uppercase", marginBottom: 10 }}>For Advertisers</div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginBottom: 16 }}>
              Buy ad placements, run campaigns, track conversions and manage creative.
            </p>
            <Link href="/hub/advertiser" style={{ fontSize: 12, color: "#00E5FF", fontWeight: 800, textDecoration: "none" }}>Open Advertiser Hub →</Link>
          </div>
          <div style={{ background: "rgba(170,45,255,0.04)", border: "1px solid rgba(170,45,255,0.15)", borderRadius: 12, padding: "24px" }}>
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.2em", color: "#AA2DFF", textTransform: "uppercase", marginBottom: 10 }}>For Sponsors</div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginBottom: 16 }}>
              Sponsor events, contests, artist prize pools, and live shows for maximum brand exposure.
            </p>
            <Link href="/hub/sponsor" style={{ fontSize: 12, color: "#AA2DFF", fontWeight: 800, textDecoration: "none" }}>Open Sponsor Hub →</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
