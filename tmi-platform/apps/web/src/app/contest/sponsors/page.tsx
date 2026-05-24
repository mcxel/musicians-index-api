"use client";
import Link from "next/link";

const PACKAGES = [
  {
    group: "LOCAL PACKAGES",
    color: "#ff6b1a",
    items: [
      { tier: "Local Bronze", price: "$50", priceId: "price_contest_local_bronze", perks: ["Business name in contestant profile", "Shoutout during live show", "Platform badge"], highlight: false },
      { tier: "Local Silver", price: "$150", priceId: "price_contest_local_silver", perks: ["Everything in Bronze", "Logo in show thumbnails", "Social media mention"], highlight: false },
      { tier: "Local Gold", price: "$250", priceId: "price_contest_local_gold", perks: ["Everything in Silver", "30-second ad spot during show", "Brand overlay on contestant stream"], highlight: true },
    ],
  },
  {
    group: "MAJOR PACKAGES",
    color: "#ffd700",
    items: [
      { tier: "Major Bronze", price: "$1,000", priceId: "price_contest_major_bronze", perks: ["National brand recognition", "Homepage feature for 7 days", "Branded segment in broadcast"], highlight: false },
      { tier: "Major Silver", price: "$5,000", priceId: "price_contest_major_silver", perks: ["Everything in Major Bronze", "Exclusive category naming rights", "Pre-roll video ad during show"], highlight: false },
      { tier: "Major Gold", price: "$10,000", priceId: "price_contest_major_gold", perks: ["Everything in Major Silver", "Title co-sponsor recognition", "Permanent Hall of Fame placement"], highlight: true },
    ],
  },
  {
    group: "TITLE SPONSORSHIP",
    color: "#00e5ff",
    items: [
      { tier: "Title Sponsor", price: "$25,000+", priceId: "price_contest_title", perks: ["Exclusive contest naming rights", "Full show broadcast branding", "Executive producer credit", "Direct contestant partnerships", "Permanent archive recognition"], highlight: true },
    ],
  },
];

export default function ContestSponsorsPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#070a0f", color: "#fff", padding: "48px 24px 80px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Link href="/contest" style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.2em", textDecoration: "none", display: "block", marginBottom: 28 }}>← CONTEST HOME</Link>
        <div style={{ fontSize: 9, color: "#ff6b1a", fontWeight: 800, letterSpacing: "0.3em", marginBottom: 8 }}>SPONSOR A CONTESTANT</div>
        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8 }}>Sponsor Packages</h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 48, maxWidth: 540 }}>
          Become a sponsor and get your brand in front of a platform-wide audience while supporting the next generation of performers.
        </p>

        {PACKAGES.map(group => (
          <div key={group.group} style={{ marginBottom: 48 }}>
            <div style={{ fontSize: 9, color: group.color, fontWeight: 800, letterSpacing: "0.2em", marginBottom: 16, borderBottom: `1px solid ${group.color}22`, paddingBottom: 10 }}>{group.group}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {group.items.map(pkg => (
                <div key={pkg.tier} style={{ background: pkg.highlight ? `${group.color}08` : "rgba(255,255,255,0.02)", border: `1px solid ${pkg.highlight ? group.color + "50" : "rgba(255,255,255,0.07)"}`, borderRadius: 14, padding: "22px 22px 20px", display: "flex", flexDirection: "column", gap: 0 }}>
                  {pkg.highlight && <div style={{ fontSize: 8, color: group.color, fontWeight: 900, letterSpacing: "0.2em", marginBottom: 8 }}>★ RECOMMENDED</div>}
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", fontWeight: 800, letterSpacing: "0.12em", marginBottom: 4 }}>{pkg.tier.toUpperCase()}</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: group.color, marginBottom: 16 }}>{pkg.price}</div>
                  <ul style={{ margin: "0 0 20px", padding: "0 0 0 0", listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                    {pkg.perks.map(p => (
                      <li key={p} style={{ display: "flex", gap: 8, fontSize: 12, color: "rgba(255,255,255,0.65)", alignItems: "flex-start" }}>
                        <span style={{ color: group.color, flexShrink: 0, marginTop: 1 }}>✓</span>{p}
                      </li>
                    ))}
                  </ul>
                  <Link href={`/api/stripe/checkout?priceId=${pkg.priceId}&mode=payment`} style={{ display: "block", textAlign: "center", padding: "11px", background: pkg.highlight ? group.color : "transparent", border: `1px solid ${group.color}${pkg.highlight ? "" : "50"}`, borderRadius: 8, color: pkg.highlight ? "#000" : group.color, fontWeight: 800, fontSize: 11, textDecoration: "none", letterSpacing: "0.12em", marginTop: "auto" }}>
                    BECOME A SPONSOR
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div style={{ background: "rgba(0,229,255,0.04)", border: "1px solid rgba(0,229,255,0.15)", borderRadius: 12, padding: "20px 24px" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#00e5ff", marginBottom: 6 }}>Are you a contestant looking for sponsors?</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 14 }}>Share your personal sponsor invite link with potential sponsors to track and confirm their packages in your qualification dashboard.</div>
          <Link href="/contest/qualify" style={{ fontSize: 11, fontWeight: 800, color: "#ff6b1a", textDecoration: "none" }}>Go to My Qualification Dashboard →</Link>
        </div>
      </div>
    </main>
  );
}
