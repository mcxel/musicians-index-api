import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Season Pass | TMI",
  description: "Unlock full access to TMI Season 1. Fan Pass, Artist Pass, and VIP Pass — all the perks, none of the limits.",
};

const TIERS = [
  {
    id: "fan",
    name: "Fan Pass",
    price: "$9.99",
    period: "/ month",
    color: "#00FFFF",
    priceId: "price_fan_monthly",
    popular: false,
    perks: [
      "Early room access (30 min before public)",
      "Exclusive Fan emote pack (12 emotes)",
      "Fan Pass badge on profile",
      "500 bonus credits per month",
      "Ad-free contest streams",
      "Monthly giveaway entries × 3",
    ],
  },
  {
    id: "artist",
    name: "Artist Pass",
    price: "$19.99",
    period: "/ month",
    color: "#FF2DAA",
    priceId: "price_artist_monthly",
    popular: true,
    perks: [
      "Everything in Fan Pass",
      "3 beat / track upload slots per month",
      "Full analytics dashboard",
      "Priority booking queue",
      "Magazine submission access",
      "Cypher guaranteed entry × 2 per season",
      "Artist Pass badge + animated border",
    ],
  },
  {
    id: "vip",
    name: "VIP Pass",
    price: "$49.99",
    period: "/ month",
    color: "#FFD700",
    priceId: "price_vip_monthly",
    popular: false,
    perks: [
      "Everything in Artist Pass",
      "Unlimited uploads",
      "30% tip revenue boost",
      "Private VIP rooms access",
      "Direct booking request to any artist",
      "Season 1 Champion badge (permanent)",
      "10,000 bonus credits per month",
      "Priority admin support",
    ],
  },
];

export default function SeasonPassPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <section style={{ textAlign: "center", padding: "56px 24px 40px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#FFD700", fontWeight: 800, marginBottom: 10 }}>TMI SEASON 1</div>
        <h1 style={{ fontSize: "clamp(1.6rem,4vw,2.8rem)", fontWeight: 900, marginBottom: 12 }}>Season Pass</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", maxWidth: 460, margin: "0 auto" }}>
          Unlock the full TMI experience — exclusive rooms, upload access, analytics, and priority everything.
        </p>
      </section>

      <section style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px 0", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 20 }}>
        {TIERS.map(tier => (
          <div key={tier.id} style={{ position: "relative", background: tier.popular ? `${tier.color}0A` : "rgba(255,255,255,0.02)", border: `1px solid ${tier.color}${tier.popular ? "40" : "20"}`, borderRadius: 16, padding: "28px 24px 24px" }}>
            {tier.popular && (
              <div style={{ position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)", background: tier.color, color: "#050510", fontSize: 7, fontWeight: 900, letterSpacing: "0.15em", padding: "3px 12px", borderRadius: 20 }}>MOST POPULAR</div>
            )}
            <div style={{ fontSize: 11, fontWeight: 700, color: tier.color, letterSpacing: "0.08em", marginBottom: 8 }}>{tier.name.toUpperCase()}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 20 }}>
              <span style={{ fontSize: 32, fontWeight: 900, color: "#fff" }}>{tier.price}</span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{tier.period}</span>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: 8 }}>
              {tier.perks.map(perk => (
                <li key={perk} style={{ fontSize: 10, color: "rgba(255,255,255,0.65)", display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span style={{ color: tier.color, flexShrink: 0, fontSize: 10, marginTop: 1 }}>✓</span>
                  {perk}
                </li>
              ))}
            </ul>
            <Link
              href={`/api/stripe/checkout?priceId=${tier.priceId}&mode=subscription`}
              style={{ display: "block", textAlign: "center", padding: "11px", fontSize: 9, fontWeight: 900, letterSpacing: "0.12em", color: tier.popular ? "#050510" : tier.color, background: tier.popular ? tier.color : "transparent", border: `1px solid ${tier.color}`, borderRadius: 8, textDecoration: "none" }}
            >
              GET {tier.name.toUpperCase()} →
            </Link>
          </div>
        ))}
      </section>

      <section style={{ maxWidth: 680, margin: "48px auto 0", padding: "0 24px", textAlign: "center" }}>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", lineHeight: 1.8 }}>
          All passes billed monthly. Cancel anytime. Season 1 runs April 2026 – March 2027.
          <br />
          Passes are non-transferable. Credits expire at end of billing period.
        </div>
        <div style={{ marginTop: 20 }}>
          <Link href="/earnings" style={{ fontSize: 10, color: "#00FFFF", textDecoration: "none" }}>See how passes affect your earnings →</Link>
        </div>
      </section>
    </main>
  );
}
