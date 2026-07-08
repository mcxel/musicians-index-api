"use client";

import { useState } from "react";
import Link from "next/link";

type BillingInterval = "monthly" | "annual";

interface Plan {
  id: string;
  name: string;
  role: string;
  monthlyPrice: number;
  annualPrice: number;
  color: string;
  icon: string;
  highlight?: boolean;
  features: string[];
  stripePriceMonthly?: string;
  stripePriceAnnual?: string;
}

const PLANS: Plan[] = [
  {
    id: "fan-plus",
    name: "Fan Plus",
    role: "Fan",
    monthlyPrice: 7.99,
    annualPrice: 79,
    color: "#FF2DAA",
    icon: "🎵",
    features: ["No ads", "HD streams", "Early ticket access", "Exclusive fan badges", "Memory polaroid gallery", "Priority chat in live rooms"],
    stripePriceMonthly: "price_fan_plus_monthly",
    stripePriceAnnual: "price_fan_plus_annual",
  },
  {
    id: "performer-pro",
    name: "Performer Pro",
    role: "Performer / Artist",
    monthlyPrice: 19.99,
    annualPrice: 199,
    color: "#AA2DFF",
    icon: "🎤",
    highlight: true,
    features: ["All Fan Plus features", "Live room hosting", "Battle entry (unlimited)", "Beat purchase credits ($20/mo)", "Performance analytics", "Artist profile article", "Revenue dashboard"],
    stripePriceMonthly: "price_performer_pro_monthly",
    stripePriceAnnual: "price_performer_pro_annual",
  },
  {
    id: "promoter-pro",
    name: "Promoter Pro",
    role: "Promoter",
    monthlyPrice: 149,
    annualPrice: 1490,
    color: "#00FF88",
    icon: "🎟️",
    features: ["Unlimited events", "Zero TMI ticketing fees*", "Batch ticket printing", "Venue seat map builder", "Artist booking tools", "Sponsor matchmaking", "Priority support"],
    stripePriceMonthly: "price_promoter_pro_monthly",
    stripePriceAnnual: "price_promoter_pro_annual",
  },
  {
    id: "sponsor-featured",
    name: "Sponsor Featured",
    role: "Sponsor",
    monthlyPrice: 699,
    annualPrice: 6990,
    color: "#FFD700",
    icon: "🤝",
    features: ["Platform-wide banner", "Curated artist matching", "Pro Legacy Ledger card", "HolographicCard showcase", "Campaign analytics", "Dedicated account manager"],
    stripePriceMonthly: "price_sponsor_featured_monthly",
    stripePriceAnnual: "price_sponsor_featured_annual",
  },
  {
    id: "advertiser-pro",
    name: "Advertiser Pro",
    role: "Advertiser",
    monthlyPrice: 299,
    annualPrice: 2990,
    color: "#FFA500",
    icon: "📢",
    features: ["Mid-article ad placements", "Live overlay ads", "Campaign A/B testing", "Brand safety controls", "Audience targeting", "Full campaign analytics"],
    stripePriceMonthly: "price_advertiser_pro_monthly",
    stripePriceAnnual: "price_advertiser_pro_annual",
  },
  {
    id: "venue-pro",
    name: "Venue Pro",
    role: "Venue",
    monthlyPrice: 199,
    annualPrice: 1990,
    color: "#00FFFF",
    icon: "🏟️",
    features: ["Venue profile + booking page", "Seat map configuration", "Stripe Connect payouts", "Zero TMI ticketing fees*", "Event calendar", "Lobby wall display"],
    stripePriceMonthly: "price_venue_pro_monthly",
    stripePriceAnnual: "price_venue_pro_annual",
  },
];

export default function SubscriptionPlansPage() {
  const [billing, setBilling] = useState<BillingInterval>("monthly");
  const [loading, setLoading] = useState<string | null>(null);

  async function handleSubscribe(plan: Plan) {
    const priceId = billing === "monthly" ? plan.stripePriceMonthly : plan.stripePriceAnnual;
    if (!priceId || loading) return;
    setLoading(plan.id);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          priceId,
          successUrl: `${window.location.origin}/dashboard?subscribed=1`,
          cancelUrl: window.location.href,
        }),
      });
      const data = await res.json() as { url?: string };
      if (data.url) window.location.href = data.url;
    } catch {
      setLoading(null);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "48px 20px 80px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.5em", color: "#FF2DAA", fontWeight: 800, marginBottom: 12 }}>
            THE MUSICIAN'S INDEX
          </div>
          <h1 style={{ margin: "0 0 12px", fontSize: "clamp(2rem,5vw,3.2rem)", fontWeight: 900, lineHeight: 1.1 }}>
            Plans for <span style={{ color: "#00FFFF" }}>Every Role</span>
          </h1>
          <p style={{ margin: "0 auto 28px", maxWidth: 520, fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>
            From fans to promoters — unlock your full TMI experience. All plans include zero setup fees.
          </p>

          {/* Billing toggle */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 0, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, overflow: "hidden" }}>
            <button onClick={() => setBilling("monthly")} style={{ padding: "10px 24px", background: billing === "monthly" ? "rgba(0,200,255,0.15)" : "transparent", border: "none", borderRight: "1px solid rgba(255,255,255,0.08)", color: billing === "monthly" ? "#00FFFF" : "rgba(255,255,255,0.4)", fontWeight: 900, fontSize: 11, letterSpacing: "0.12em", cursor: "pointer" }}>
              MONTHLY
            </button>
            <button onClick={() => setBilling("annual")} style={{ padding: "10px 24px", background: billing === "annual" ? "rgba(0,200,255,0.15)" : "transparent", border: "none", color: billing === "annual" ? "#00FFFF" : "rgba(255,255,255,0.4)", fontWeight: 900, fontSize: 11, letterSpacing: "0.12em", cursor: "pointer" }}>
              ANNUAL <span style={{ fontSize: 9, color: "#00FF88", marginLeft: 4 }}>SAVE ~17%</span>
            </button>
          </div>
        </div>

        {/* Plans grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(290px,1fr))", gap: 20 }}>
          {PLANS.map((plan) => {
            const price = billing === "monthly" ? plan.monthlyPrice : plan.annualPrice;
            const interval = billing === "monthly" ? "/mo" : "/yr";
            return (
              <div key={plan.id} style={{
                background: plan.highlight ? `linear-gradient(180deg,${plan.color}12,rgba(5,5,16,0.95))` : "rgba(255,255,255,0.03)",
                border: `1.5px solid ${plan.highlight ? plan.color + "55" : plan.color + "22"}`,
                borderRadius: 16,
                padding: "24px 20px",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                boxShadow: plan.highlight ? `0 0 40px ${plan.color}18` : "none",
              }}>
                {plan.highlight && (
                  <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: plan.color, borderRadius: 20, padding: "3px 14px", fontSize: 9, color: "#050510", fontWeight: 900, letterSpacing: "0.18em" }}>
                    MOST POPULAR
                  </div>
                )}

                <div style={{ fontSize: 28, marginBottom: 8 }}>{plan.icon}</div>
                <div style={{ fontSize: 10, letterSpacing: "0.2em", color: plan.color, fontWeight: 800, marginBottom: 4 }}>
                  {plan.role.toUpperCase()}
                </div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", marginBottom: 6 }}>{plan.name}</div>
                <div style={{ fontSize: 30, fontWeight: 900, color: "#fff", marginBottom: 16 }}>
                  ${price}<span style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", fontWeight: 400 }}>{interval}</span>
                </div>

                <ul style={{ margin: "0 0 auto", padding: "0 0 0 14px", fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 2, flex: 1 }}>
                  {plan.features.map((f) => <li key={f}>{f}</li>)}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan)}
                  disabled={!!loading}
                  style={{
                    marginTop: 20,
                    padding: "12px 20px",
                    background: loading === plan.id ? "rgba(255,255,255,0.1)" : `linear-gradient(135deg,${plan.color}cc,${plan.color}88)`,
                    border: "none",
                    borderRadius: 10,
                    color: "#050510",
                    fontWeight: 900,
                    fontSize: 12,
                    letterSpacing: "0.15em",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading && loading !== plan.id ? 0.4 : 1,
                    transition: "opacity 0.2s",
                  }}
                >
                  {loading === plan.id ? "LOADING..." : "GET STARTED →"}
                </button>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 40, textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.2)", lineHeight: 1.9 }}>
          *Zero TMI platform fees on ticketing. Standard payment processing fees apply (Stripe ~2.9% + 30¢).<br />
          All plans cancel anytime. Questions? <Link href="/support" style={{ color: "rgba(255,255,255,0.35)" }}>Contact support</Link>
        </div>
      </div>
    </main>
  );
}
