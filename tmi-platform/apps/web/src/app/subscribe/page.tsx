"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const BG = "#050510";

// ── Real Stripe price IDs from Stripe Dashboard (created 2026-05-28) ─────────
const P = {
  // Fan tiers
  FAN_FREE:      process.env.NEXT_PUBLIC_STRIPE_PRICE_FAN_FREE      ?? "price_1TcJXrEAwH1Fjtu9pYxAwEqi",
  FAN_RUBY:      process.env.NEXT_PUBLIC_STRIPE_PRICE_FAN_RUBY      ?? "price_1TcJnFEAwH1Fjtu98MhoEGqG",
  FAN_SILVER:    process.env.NEXT_PUBLIC_STRIPE_PRICE_FAN_SILVER    ?? "price_1TcJoOEAwH1Fjtu9IrhSwoyA",
  FAN_GOLD:      process.env.NEXT_PUBLIC_STRIPE_PRICE_FAN_GOLD      ?? "price_1TcJrTEAwH1Fjtu9wjhmnv5K",
  FAN_PLATINUM:  process.env.NEXT_PUBLIC_STRIPE_PRICE_FAN_PLATINUM  ?? "price_1TcJsDEAwH1Fjtu9zU7X7mml",
  FAN_DIAMOND:   process.env.NEXT_PUBLIC_STRIPE_PRICE_FAN_DIAMOND   ?? "price_1TcJvaEAwH1Fjtu9me4Aq2UU",
  // Performer tiers
  PERF_RUBY:     process.env.NEXT_PUBLIC_STRIPE_PRICE_PERFORMER_RUBY    ?? "price_1TcJzdEAwH1Fjtu9Nx5DsRzL",
  PERF_SILVER:   process.env.NEXT_PUBLIC_STRIPE_PRICE_PERFORMER_SILVER  ?? "price_1TcK0dEAwH1Fjtu9MXK323Q7",
  PERF_GOLD:     process.env.NEXT_PUBLIC_STRIPE_PRICE_PERFORMER_GOLD    ?? "price_1TcK1LEAwH1Fjtu9ZnOrTyZw",
  PERF_PLATINUM: process.env.NEXT_PUBLIC_STRIPE_PRICE_PERFORMER_PLATINUM ?? "price_1TcK2xEAwH1Fjtu9FLlIHItH",
  PERF_DIAMOND:  process.env.NEXT_PUBLIC_STRIPE_PRICE_PERFORMER_DIAMOND ?? "price_1TcK4MEAwH1Fjtu96b2TJlBe",
  // Sponsor/Advertiser
  SPONSOR_BASIC:    process.env.NEXT_PUBLIC_STRIPE_PRICE_SPONSOR_BASIC    ?? "price_1Tb148EAwH1Fjtu9KZFL3H3Y",
  SPONSOR_STANDARD: process.env.NEXT_PUBLIC_STRIPE_PRICE_SPONSOR_STANDARD ?? "price_1Tb147EAwH1Fjtu9yCbRfH3j",
  SPONSOR_PREMIUM:  process.env.NEXT_PUBLIC_STRIPE_PRICE_SPONSOR_PREMIUM  ?? "price_1Tb144EAwH1Fjtu9I0Xq1iFV",
  SPONSOR_DIAMOND:  process.env.NEXT_PUBLIC_STRIPE_PRICE_SPONSOR_DIAMOND  ?? "price_1Tb143EAwH1Fjtu9WDqnYV7z",
};

type PlanGroup = { group: string; color: string; plans: Plan[] };
interface Plan {
  key: string; name: string; price: number; cents: number;
  color: string; emoji: string; priceId: string;
  features: string[]; cta: string; popular?: boolean; badge?: string;
}

const PLAN_GROUPS: PlanGroup[] = [
  {
    group: "FAN PLANS",
    color: "#00FFFF",
    plans: [
      { key: "FAN_RUBY",     name: "Ruby Fan",      price: 4.99,  cents: 499,  color: "#FF2DAA", emoji: "🎧", priceId: P.FAN_RUBY,     features: ["Access all live rooms", "Sit in any audience seat", "Chat + reactions", "Beat Vault access", "Fan badge"], cta: "START RUBY" },
      { key: "FAN_SILVER",   name: "Silver Fan",    price: 9.99,  cents: 999,  color: "#00FFFF", emoji: "⭐", priceId: P.FAN_SILVER,   features: ["Everything in Ruby", "XP multiplier ×1.5", "Enhanced fan profile", "Priority seating"], cta: "START SILVER" },
      { key: "FAN_GOLD",     name: "Gold Fan",      price: 14.99, cents: 1499, color: "#FFD700", emoji: "🌟", priceId: P.FAN_GOLD,     features: ["Everything in Silver", "Gold badge everywhere", "Exclusive emotes", "Fan Club access"], cta: "GO GOLD", popular: true, badge: "POPULAR" },
      { key: "FAN_PLATINUM", name: "Platinum Fan",  price: 24.99, cents: 2499, color: "#E5E4E2", emoji: "💿", priceId: P.FAN_PLATINUM, features: ["Everything in Gold", "XP multiplier ×3", "Backstage access", "Monthly crown ballot"], cta: "GO PLATINUM" },
      { key: "FAN_DIAMOND",  name: "Diamond Fan",   price: 49.99, cents: 4999, color: "#AA2DFF", emoji: "💎", priceId: P.FAN_DIAMOND,  features: ["Everything in Platinum", "Diamond badge + aura", "Front-row guaranteed seats", "Priority support", "VIP Lounge"], cta: "GO DIAMOND" },
    ],
  },
  {
    group: "PERFORMER PLANS",
    color: "#FF2DAA",
    plans: [
      { key: "PERF_RUBY",     name: "Ruby Performer",     price: 2.99,  cents: 299,  color: "#FF6B35", emoji: "🎤", priceId: P.PERF_RUBY,     features: ["Go live + WebRTC broadcast", "Battle & Cypher entry", "Performer profile", "Basic revenue dashboard"], cta: "START RUBY" },
      { key: "PERF_SILVER",   name: "Silver Performer",   price: 4.99,  cents: 499,  color: "#FF2DAA", emoji: "🎙️", priceId: P.PERF_SILVER,   features: ["Everything in Ruby", "Beat Vault upload + sell", "Silver badge", "Booking requests"], cta: "START SILVER" },
      { key: "PERF_GOLD",     name: "Gold Performer",     price: 9.99,  cents: 999,  color: "#FFD700", emoji: "🎵", priceId: P.PERF_GOLD,     features: ["Everything in Silver", "Mint NFTs", "Full revenue dashboard", "Gold profile spotlight"], cta: "GO GOLD", popular: true, badge: "MOST POPULAR" },
      { key: "PERF_PLATINUM", name: "Platinum Performer", price: 19.99, cents: 1999, color: "#00FFFF", emoji: "🏆", priceId: P.PERF_PLATINUM, features: ["Everything in Gold", "Platinum badge", "Priority matchmaking", "Advanced analytics"], cta: "GO PLATINUM" },
      { key: "PERF_DIAMOND",  name: "Diamond Performer",  price: 29.99, cents: 2999, color: "#AA2DFF", emoji: "👑", priceId: P.PERF_DIAMOND,  features: ["Everything in Platinum", "Diamond aura", "Crown ballot vote", "VIP Lounge + Backstage", "Featured on homepage"], cta: "GO DIAMOND" },
    ],
  },
  {
    group: "SPONSOR / ADVERTISER",
    color: "#AA2DFF",
    plans: [
      { key: "SPONSOR_BASIC",    name: "Sponsor Basic",    price: 25,  cents: 2500,  color: "#00FF88", emoji: "🤝", priceId: P.SPONSOR_BASIC,    features: ["Brand placement in 1 room", "Monthly analytics report", "Sponsor badge"], cta: "START SPONSORING" },
      { key: "SPONSOR_STANDARD", name: "Sponsor Standard", price: 99,  cents: 9900,  color: "#AA2DFF", emoji: "📡", priceId: P.SPONSOR_STANDARD, features: ["Multi-room ad placement", "Battle & Cypher sponsorships", "Weekly analytics", "Brand on lobby walls"], cta: "GO STANDARD", popular: true, badge: "BEST VALUE" },
      { key: "SPONSOR_PREMIUM",  name: "Sponsor Premium",  price: 499, cents: 49900, color: "#FFD700", emoji: "🏟️", priceId: P.SPONSOR_PREMIUM,  features: ["Everything in Standard", "Homepage billboard placement", "Arena sponsorship", "Priority support", "Custom campaign"], cta: "GO PREMIUM" },
      { key: "SPONSOR_DIAMOND",  name: "Sponsor Diamond",  price: 999, cents: 99900, color: "#FF2DAA", emoji: "💎", priceId: P.SPONSOR_DIAMOND,  features: ["Full platform ownership", "Championship sponsorship", "All lobby walls", "Magazine features", "Dedicated account manager"], cta: "GO DIAMOND" },
    ],
  },
];

export default function SubscribePage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [activeGroup, setActiveGroup] = useState(0);

  async function handleCheckout(plan: Plan) {
    setLoading(plan.key);
    const params = new URLSearchParams({
      priceId: plan.priceId,
      amount: String(plan.cents),
      productName: `TMI ${plan.name}`,
      mode: "subscription",
    });
    router.push(`/api/stripe/checkout?${params.toString()}`);
  }

  const group = PLAN_GROUPS[activeGroup]!;

  return (
    <main style={{ minHeight: "100vh", background: BG, color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>
      <style>{`@keyframes tmiGlow{0%,100%{opacity:0.6}50%{opacity:1}}`}</style>

      <nav style={{ background: "rgba(0,0,0,0.85)", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "12px 24px", display: "flex", gap: 20, alignItems: "center", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 50 }}>
        <Link href="/home/1" style={{ fontSize: 11, fontWeight: 900, color: "#00FFFF", textDecoration: "none", letterSpacing: "0.14em" }}>TMI</Link>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>PLANS & PRICING</span>
        <Link href="/auth" style={{ marginLeft: "auto", fontSize: 10, fontWeight: 800, color: "#00FFFF", textDecoration: "none", border: "1px solid rgba(0,255,255,0.3)", padding: "5px 14px", borderRadius: 6 }}>SIGN IN</Link>
      </nav>

      <div style={{ textAlign: "center", padding: "40px 20px 24px" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#00FFFF", fontWeight: 900, marginBottom: 10 }}>THE MUSICIAN'S INDEX</div>
        <h1 style={{ margin: "0 0 8px", fontSize: "clamp(26px,5vw,48px)", fontWeight: 900, letterSpacing: "-0.02em" }}>Join the Platform</h1>
        <p style={{ margin: "0 auto 8px", fontSize: 13, color: "rgba(255,255,255,0.5)", maxWidth: 520 }}>
          Pick your role. Every plan includes live room access, audience seating, and TMI's full entertainment network.
        </p>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>Powered by Stripe · Cancel anytime · Real price IDs — no placeholders</div>
      </div>

      {/* Group selector */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 24, flexWrap: "wrap", padding: "0 16px" }}>
        {PLAN_GROUPS.map((g, i) => (
          <button key={g.group} onClick={() => setActiveGroup(i)} style={{ padding: "8px 20px", borderRadius: 20, fontSize: 10, fontWeight: 900, cursor: "pointer", border: "none", letterSpacing: "0.08em", background: activeGroup === i ? g.color : "rgba(255,255,255,0.06)", color: activeGroup === i ? "#000" : "rgba(255,255,255,0.5)", outline: activeGroup === i ? "none" : "1px solid rgba(255,255,255,0.1)", transition: "all 0.15s" }}>
            {g.group}
          </button>
        ))}
      </div>

      {/* Plans grid */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        {group.plans.map((plan) => (
          <div key={plan.key} style={{ background: plan.popular ? `linear-gradient(135deg, ${plan.color}12, rgba(5,5,16,0.98))` : "rgba(255,255,255,0.02)", border: plan.popular ? `2px solid ${plan.color}55` : `1px solid rgba(255,255,255,0.08)`, borderRadius: 18, padding: "22px 18px", position: "relative", boxShadow: plan.popular ? `0 0 28px ${plan.color}18` : "none" }}>
            {plan.badge && (
              <div style={{ position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)", background: plan.color, color: "#000", fontSize: 7, fontWeight: 900, padding: "3px 12px", borderRadius: 20, letterSpacing: "0.1em", whiteSpace: "nowrap" }}>{plan.badge}</div>
            )}
            <div style={{ fontSize: 28, marginBottom: 8 }}>{plan.emoji}</div>
            <div style={{ fontSize: 8, letterSpacing: "0.18em", color: plan.color, fontWeight: 800, marginBottom: 3 }}>{plan.key.replace("_", " ")}</div>
            <h2 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 900 }}>{plan.name}</h2>
            <div style={{ display: "flex", alignItems: "baseline", gap: 3, marginBottom: 14 }}>
              <span style={{ fontSize: 28, fontWeight: 900, color: plan.color }}>${plan.price}</span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>/mo</span>
            </div>
            <ul style={{ margin: "0 0 16px", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
              {plan.features.map((f) => (
                <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 7, fontSize: 11, color: "rgba(255,255,255,0.7)" }}>
                  <span style={{ color: plan.color, fontWeight: 900, flexShrink: 0 }}>✓</span>{f}
                </li>
              ))}
            </ul>
            <button onClick={() => handleCheckout(plan)} disabled={loading === plan.key} style={{ width: "100%", padding: "11px 0", borderRadius: 10, border: "none", background: loading === plan.key ? "rgba(255,255,255,0.1)" : plan.popular ? plan.color : `${plan.color}20`, color: loading === plan.key ? "rgba(255,255,255,0.4)" : plan.popular ? "#000" : plan.color, fontSize: 10, fontWeight: 900, letterSpacing: "0.1em", cursor: loading === plan.key ? "not-allowed" : "pointer", outline: plan.popular ? "none" : `1px solid ${plan.color}45`, transition: "opacity 0.15s" }}>
              {loading === plan.key ? "REDIRECTING…" : plan.cta}
            </button>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: 36, padding: "0 20px" }}>
        <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap", marginBottom: 12 }}>
          {["🔒 Stripe Secured", "💳 All Major Cards", "🌍 175+ Countries", "↩️ Cancel Anytime"].map(t => (
            <span key={t} style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{t}</span>
          ))}
        </div>
        <Link href="/settings/billing" style={{ fontSize: 11, color: "rgba(0,255,255,0.6)", textDecoration: "none" }}>Manage existing subscription →</Link>
      </div>
    </main>
  );
}
