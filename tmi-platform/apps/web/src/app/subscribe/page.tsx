"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const BG = "#050510";

const PLANS = [
  {
    key: "FAN",
    name: "Fan",
    price: 2.99,
    cents: 299,
    interval: "mo",
    color: "#00FFFF",
    emoji: "🎧",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_FAN_MONTHLY ?? "price_fan_monthly",
    features: [
      "Access all live rooms",
      "Sit in any audience seat",
      "Chat + reactions + tips",
      "Beat Vault access",
      "Fan badge on profile",
    ],
    cta: "START FAN PLAN",
  },
  {
    key: "ARTIST",
    name: "Artist / Performer",
    price: 9.99,
    cents: 999,
    interval: "mo",
    color: "#FF2DAA",
    emoji: "🎤",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ARTIST_MONTHLY ?? "price_artist_monthly",
    popular: true,
    features: [
      "Go live + WebRTC broadcast",
      "Battle & Cypher entry",
      "Beat Vault upload + sell",
      "Mint NFTs",
      "Revenue dashboard",
      "Performer badge + profile",
    ],
    cta: "START ARTIST PLAN",
  },
  {
    key: "VIP",
    name: "VIP Diamond",
    price: 14.99,
    cents: 1499,
    interval: "mo",
    color: "#FFD700",
    emoji: "💎",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_VIP_MONTHLY ?? "price_vip_monthly",
    features: [
      "Everything in Artist plan",
      "Diamond badge everywhere",
      "Front-row guaranteed seats",
      "Priority matchmaking",
      "VIP Lounge access",
      "Monthly crown ballot",
    ],
    cta: "GO DIAMOND",
  },
  {
    key: "VENUE",
    name: "Venue",
    price: 29.99,
    cents: 2999,
    interval: "mo",
    color: "#22c55e",
    emoji: "🏟️",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_VENUE_MONTHLY ?? "price_venue_monthly",
    features: [
      "Host unlimited events",
      "Ticket sales + box office",
      "Physical ticket printing",
      "Multi-room management",
      "Venue analytics dashboard",
      "TMI Certified Venue badge",
    ],
    cta: "OPEN YOUR VENUE",
  },
  {
    key: "PROMOTER",
    name: "Promoter",
    price: 19.99,
    cents: 1999,
    interval: "mo",
    color: "#FF6B35",
    emoji: "📢",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PROMOTER_MONTHLY ?? "price_promoter_monthly",
    features: [
      "Manage up to 20 artists",
      "Promote events platform-wide",
      "Booking + scheduling tools",
      "Promoter analytics",
      "Giveaway hosting",
      "Certified Promoter badge",
    ],
    cta: "START PROMOTING",
  },
  {
    key: "SPONSOR",
    name: "Sponsor / Advertiser",
    price: 49.99,
    cents: 4999,
    interval: "mo",
    color: "#AA2DFF",
    emoji: "🤝",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_SPONSOR_MONTHLY ?? "price_sponsor_monthly",
    features: [
      "Multi-network ad placement",
      "Sponsor artist profiles",
      "Battle & Cypher sponsorships",
      "Brand on lobby walls",
      "Giveaway + prize contests",
      "Full analytics dashboard",
    ],
    cta: "BECOME A SPONSOR",
  },
];

export default function SubscribePage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleCheckout(plan: typeof PLANS[0]) {
    setLoading(plan.key);
    // Use GET checkout — creates Stripe session and redirects
    const params = new URLSearchParams({
      priceId: plan.priceId,
      amount: String(plan.cents),
      productName: `TMI ${plan.name} Plan`,
      mode: "subscription",
    });
    router.push(`/api/stripe/checkout?${params.toString()}`);
  }

  return (
    <main style={{ minHeight: "100vh", background: BG, color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>
      <style>{`@keyframes tmiGlow{0%,100%{opacity:0.6}50%{opacity:1}}`}</style>

      {/* Nav */}
      <nav style={{ background: "rgba(0,0,0,0.85)", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "12px 24px", display: "flex", gap: 20, alignItems: "center", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 50 }}>
        <Link href="/home/1" style={{ fontSize: 11, fontWeight: 900, color: "#00FFFF", textDecoration: "none", letterSpacing: "0.14em" }}>TMI</Link>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>PLANS & PRICING</span>
        <Link href="/auth" style={{ marginLeft: "auto", fontSize: 10, fontWeight: 800, color: "#00FFFF", textDecoration: "none", border: "1px solid rgba(0,255,255,0.3)", padding: "5px 14px", borderRadius: 6 }}>SIGN IN</Link>
      </nav>

      {/* Hero */}
      <div style={{ textAlign: "center", padding: "48px 20px 32px" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#00FFFF", fontWeight: 900, marginBottom: 10 }}>THE MUSICIAN'S INDEX</div>
        <h1 style={{ margin: "0 0 12px", fontSize: "clamp(28px,5vw,52px)", fontWeight: 900, letterSpacing: "-0.02em" }}>
          Join the Platform
        </h1>
        <p style={{ margin: "0 auto", fontSize: 14, color: "rgba(255,255,255,0.5)", maxWidth: 520 }}>
          Pick your role. Every plan includes live room access, audience seating, and TMI's full entertainment network.
        </p>
        <div style={{ marginTop: 12, fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
          Powered by Stripe · Cancel anytime · All plans include 7-day free trial
        </div>
      </div>

      {/* Plans grid */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        {PLANS.map((plan) => (
          <div
            key={plan.key}
            style={{
              background: plan.popular ? `linear-gradient(135deg, ${plan.color}12, rgba(5,5,16,0.98))` : "rgba(255,255,255,0.02)",
              border: plan.popular ? `2px solid ${plan.color}55` : `1px solid rgba(255,255,255,0.08)`,
              borderRadius: 18,
              padding: "24px 20px",
              position: "relative",
              boxShadow: plan.popular ? `0 0 32px ${plan.color}18` : "none",
            }}
          >
            {plan.popular && (
              <div style={{ position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)", background: plan.color, color: "#000", fontSize: 8, fontWeight: 900, padding: "3px 14px", borderRadius: 20, letterSpacing: "0.12em", whiteSpace: "nowrap" }}>
                MOST POPULAR
              </div>
            )}
            <div style={{ fontSize: 32, marginBottom: 10 }}>{plan.emoji}</div>
            <div style={{ fontSize: 9, letterSpacing: "0.2em", color: plan.color, fontWeight: 800, marginBottom: 4 }}>{plan.key}</div>
            <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 900 }}>{plan.name}</h2>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 18 }}>
              <span style={{ fontSize: 32, fontWeight: 900, color: plan.color }}>${plan.price}</span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>/{plan.interval}</span>
            </div>

            <ul style={{ margin: "0 0 20px", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 7 }}>
              {plan.features.map((f) => (
                <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
                  <span style={{ color: plan.color, fontWeight: 900, flexShrink: 0, marginTop: 1 }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleCheckout(plan)}
              disabled={loading === plan.key}
              style={{
                width: "100%",
                padding: "12px 0",
                borderRadius: 10,
                border: "none",
                background: loading === plan.key ? "rgba(255,255,255,0.1)" : plan.popular ? plan.color : `${plan.color}20`,
                color: loading === plan.key ? "rgba(255,255,255,0.4)" : plan.popular ? "#000" : plan.color,
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: "0.1em",
                cursor: loading === plan.key ? "not-allowed" : "pointer",
                outline: plan.popular ? "none" : `1px solid ${plan.color}45`,
                transition: "opacity 0.15s",
              }}
            >
              {loading === plan.key ? "REDIRECTING TO STRIPE…" : plan.cta}
            </button>
          </div>
        ))}
      </div>

      {/* Trust signals */}
      <div style={{ textAlign: "center", marginTop: 40, padding: "0 20px" }}>
        <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap", marginBottom: 16 }}>
          {["🔒 Stripe Secured", "💳 All Major Cards", "🌍 175+ Countries", "🚫 No Hidden Fees", "↩️ Cancel Anytime"].map((t) => (
            <span key={t} style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{t}</span>
          ))}
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", maxWidth: 500, margin: "0 auto" }}>
          Payments are processed securely by Stripe. TMI does not store card numbers.
          Subscriptions auto-renew monthly. Cancel from Settings → Billing at any time.
        </div>
        <div style={{ marginTop: 12 }}>
          <Link href="/settings/billing" style={{ fontSize: 11, color: "rgba(0,255,255,0.6)", textDecoration: "none" }}>Manage existing subscription →</Link>
        </div>
      </div>
    </main>
  );
}
