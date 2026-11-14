"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSubscriptionOffersLowestFirst, STRIPE_PRODUCTS, type SubscriptionTierKey } from "@/lib/stripe/products";

const BG = "#050510";

// ── Real Stripe price IDs from Stripe Dashboard (created 2026-05-28) ─────────
// Fan/Performer PRO-through-DIAMOND plans below are built from the canonical
// registry (@/lib/stripe/products.ts) via getSubscriptionOffersLowestFirst.
// Sponsor/Advertiser/Venue/Promoter aren't part of that tier ladder and stay
// listed explicitly.
const P = {
  SPONSOR_BASIC:    process.env.NEXT_PUBLIC_STRIPE_PRICE_SPONSOR_BASIC    ?? "price_1Tb148EAwH1Fjtu9KZFL3H3Y",
  SPONSOR_STANDARD: process.env.NEXT_PUBLIC_STRIPE_PRICE_SPONSOR_STANDARD ?? "price_1Tb147EAwH1Fjtu9yCbRfH3j",
  SPONSOR_PREMIUM:  process.env.NEXT_PUBLIC_STRIPE_PRICE_SPONSOR_PREMIUM  ?? "price_1Tb144EAwH1Fjtu9I0Xq1iFV",
  SPONSOR_DIAMOND:  process.env.NEXT_PUBLIC_STRIPE_PRICE_SPONSOR_DIAMOND  ?? "price_1Tb143EAwH1Fjtu9WDqnYV7z",
  // Venue, Promoter, Advertiser — Venue/Promoter are weekly billing
  VENUE:       process.env.NEXT_PUBLIC_STRIPE_PRICE_VENUE       ?? "price_1TdZQEEAwH1Fjtu9JcPS32sL",
  PROMOTER:    process.env.NEXT_PUBLIC_STRIPE_PRICE_PROMOTER    ?? "price_1TdZQSEAwH1Fjtu9Cz3j2Rik",
  ADVERTISER:  process.env.NEXT_PUBLIC_STRIPE_PRICE_ADVERTISER  ?? "price_1TdY0UEAwH1Fjtu9FTrdprdy",
};

// Cosmetics only (color/emoji) — economic facts come from the canonical registry.
// No POPULAR / urgency badges on membership ladders.
const TIER_COSMETICS: Record<SubscriptionTierKey, { color: string; emoji: string }> = {
  PRO:      { color: "#FF6B35", emoji: "🎧" },
  RUBY:     { color: "#FF2DAA", emoji: "💎" },
  SILVER:   { color: "#00FFFF", emoji: "⭐" },
  GOLD:     { color: "#FFD700", emoji: "🌟" },
  PLATINUM: { color: "#E5E4E2", emoji: "💿" },
  DIAMOND:  { color: "#AA2DFF", emoji: "👑" },
};

function buildTierPlans(accountType: "fan" | "performer") {
  return getSubscriptionOffersLowestFirst(accountType)
    .filter((p) => p.tier !== "FREE" && p.tier !== "FAMILY" && p.tier !== "BAND")
    .map((p) => {
      const cosmetics = TIER_COSMETICS[p.tier as SubscriptionTierKey];
      return {
        key: `${accountType.toUpperCase()}_${p.tier}`,
        name: p.name,
        price: p.priceCents / 100,
        cents: p.priceCents,
        priceId: p.priceId!,
        interval: "mo" as const,
        features: [...p.features],
        cta: `START ${p.tier}`,
        ...cosmetics,
      };
    });
}

type PlanGroup = { group: string; color: string; plans: Plan[] };
interface Plan {
  key: string; name: string; price: number; cents: number;
  color: string; emoji: string; priceId: string;
  features: string[]; cta: string;
  interval?: "mo" | "wk";
}

const PLAN_GROUPS: PlanGroup[] = [
  {
    group: "FAN PLANS",
    color: "#00FFFF",
    plans: [
      ...buildTierPlans("fan"),
      // Multi-account bundle — price/priceId from STRIPE_PRODUCTS only.
      { key: "FAN_FAMILY", name: STRIPE_PRODUCTS.FAN_FAMILY_MONTHLY.name, price: STRIPE_PRODUCTS.FAN_FAMILY_MONTHLY.price / 100, cents: STRIPE_PRODUCTS.FAN_FAMILY_MONTHLY.price, color: "#00FF88", emoji: "👨‍👩‍👧‍👦", priceId: STRIPE_PRODUCTS.FAN_FAMILY_MONTHLY.priceId, features: [...STRIPE_PRODUCTS.FAN_FAMILY_MONTHLY.features], cta: "GET FAMILY PLAN" },
    ],
  },
  {
    group: "PERFORMER PLANS",
    color: "#FF2DAA",
    plans: [
      ...buildTierPlans("performer"),
      // Group account — cents must match Stripe object ($30.99), never a stale $24.99 hardcode.
      { key: "PERF_BAND", name: STRIPE_PRODUCTS.PERFORMER_BAND_MONTHLY.name, price: STRIPE_PRODUCTS.PERFORMER_BAND_MONTHLY.price / 100, cents: STRIPE_PRODUCTS.PERFORMER_BAND_MONTHLY.price, color: "#FF9500", emoji: "🎼", priceId: STRIPE_PRODUCTS.PERFORMER_BAND_MONTHLY.priceId, features: [...STRIPE_PRODUCTS.PERFORMER_BAND_MONTHLY.features], cta: "JOIN AS A GROUP" },
    ],
  },
  {
    group: "SPONSOR / ADVERTISER",
    color: "#AA2DFF",
    plans: [
      { key: "SPONSOR_BASIC",    name: "Sponsor Basic",    price: 25,  cents: 2500,  color: "#00FF88", emoji: "🤝", priceId: P.SPONSOR_BASIC,    features: ["Brand placement in 1 room", "Monthly analytics report", "Sponsor badge"], cta: "START SPONSORING" },
      { key: "SPONSOR_STANDARD", name: "Sponsor Standard", price: 99,  cents: 9900,  color: "#AA2DFF", emoji: "📡", priceId: P.SPONSOR_STANDARD, features: ["Multi-room ad placement", "Battle & Cypher sponsorships", "Weekly analytics", "Brand on lobby walls"], cta: "GO STANDARD" },
      { key: "SPONSOR_PREMIUM",  name: "Sponsor Premium",  price: 499, cents: 49900, color: "#FFD700", emoji: "🏟️", priceId: P.SPONSOR_PREMIUM,  features: ["Everything in Standard", "Homepage billboard placement", "Arena sponsorship", "Priority support", "Custom campaign"], cta: "GO PREMIUM" },
      { key: "SPONSOR_DIAMOND",  name: "Sponsor Diamond",  price: 999, cents: 99900, color: "#FF2DAA", emoji: "💎", priceId: P.SPONSOR_DIAMOND,  features: ["Full platform ownership", "Championship sponsorship", "All lobby walls", "Magazine features", "Dedicated account manager"], cta: "GO DIAMOND" },
    ],
  },
  {
    group: "VENUE / PROMOTER",
    color: "#00FF88",
    plans: [
      {
        key: "VENUE",
        name: "Venue Owner",
        price: 14.99, cents: 1499,
        color: "#00FF88", emoji: "🏟️",
        priceId: P.VENUE,
        interval: "wk" as const,
        features: [
          "Host unlimited live events",
          "Ticket sales + box office",
          "Physical ticket printing (thermal)",
          "Multi-room management",
          "Venue analytics dashboard",
          "TMI Certified Venue badge",
          "Venue profile + booking calendar",
        ],
        cta: "OPEN YOUR VENUE",
      },
      {
        key: "PROMOTER",
        name: "Promoter",
        price: 9.99, cents: 999,
        color: "#FF6B35", emoji: "📢",
        priceId: P.PROMOTER,
        interval: "wk" as const,
        features: [
          "Manage up to 20 artists",
          "Promote events platform-wide",
          "Booking + scheduling tools",
          "Promoter analytics dashboard",
          "Giveaway + contest hosting",
          "Certified Promoter badge",
          "Revenue share tracking",
        ],
        cta: "START PROMOTING",
      },
      {
        key: "ADVERTISER",
        name: "Advertiser Monthly",
        price: 49.99, cents: 4999,
        color: "#FFD700", emoji: "🚀",
        priceId: P.ADVERTISER,
        features: [
          "Self-serve ad placement portal",
          "Multi-network rotation (5 networks)",
          "Homepage + arena + magazine slots",
          "Real-time campaign analytics",
          "A/B test ad creatives",
          "Advertiser badge on campaigns",
          "Monthly performance reports",
        ],
        cta: "START ADVERTISING",
      },
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
          <div key={plan.key} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid rgba(255,255,255,0.08)`, borderRadius: 18, padding: "22px 18px", position: "relative" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{plan.emoji}</div>
            <div style={{ fontSize: 8, letterSpacing: "0.18em", color: plan.color, fontWeight: 800, marginBottom: 3 }}>{plan.key.replace("_", " ")}</div>
            <h2 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 900 }}>{plan.name}</h2>
            <div style={{ display: "flex", alignItems: "baseline", gap: 3, marginBottom: 14 }}>
              <span style={{ fontSize: 28, fontWeight: 900, color: plan.color }}>${plan.price}</span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>/{plan.interval ?? "mo"}</span>
            </div>
            <ul style={{ margin: "0 0 16px", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
              {plan.features.map((f) => (
                <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 7, fontSize: 11, color: "rgba(255,255,255,0.7)" }}>
                  <span style={{ color: plan.color, fontWeight: 900, flexShrink: 0 }}>✓</span>{f}
                </li>
              ))}
            </ul>
            <button onClick={() => handleCheckout(plan)} disabled={loading === plan.key} style={{ width: "100%", padding: "11px 0", borderRadius: 10, border: "none", background: loading === plan.key ? "rgba(255,255,255,0.1)" : `${plan.color}20`, color: loading === plan.key ? "rgba(255,255,255,0.4)" : plan.color, fontSize: 10, fontWeight: 900, letterSpacing: "0.1em", cursor: loading === plan.key ? "not-allowed" : "pointer", outline: `1px solid ${plan.color}45`, transition: "opacity 0.15s" }}>
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
