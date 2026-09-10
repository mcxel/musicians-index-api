"use client";

import { useState } from "react";
import Link from "next/link";
import { listMembershipOffersLowestFirst } from "@/lib/commerce/CanonicalPricingRegistry";

const MEMBERSHIP_ACCOUNTS = ["fan", "performer"] as const;
const TIER_COLORS = {
  FREE: "#00FFFF",
  PRO: "#FF6B35",
  RUBY: "#FF4444",
  SILVER: "#C0C0C0",
  GOLD: "#FFD700",
  PLATINUM: "#AA2DFF",
  DIAMOND: "#00FF88",
  FAMILY: "#00FFFF",
  BAND: "#FF9500",
} as const;

const TIERS = MEMBERSHIP_ACCOUNTS.flatMap((accountType) =>
  listMembershipOffersLowestFirst(accountType).map((offer) => ({
    ...offer,
    accountType,
    id: `${accountType}-${offer.tier}`,
    color: TIER_COLORS[offer.tier],
    highlight: offer.tier === "PRO",
    label: offer.name,
  })),
);

type TierId = (typeof TIERS)[number]["id"];

export default function SubscriptionsPage() {
  const [loading, setLoading] = useState<TierId | null>(null);

  async function subscribe(tier: (typeof TIERS)[number]) {
    if (!tier.priceId) {
      window.location.href = tier.accountType === "fan" ? "/signup" : "/signup?role=performer";
      return;
    }
    setLoading(tier.id);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          items: [{ priceId: tier.priceId, quantity: 1 }],
          mode: "subscription",
          successUrl: `${window.location.origin}/fan/dashboard?subscribed=1`,
          cancelUrl: `${window.location.origin}/subscriptions`,
        }),
      });
      const data = await res.json().catch(() => ({})) as { url?: string; checkoutUrl?: string };
      const dest = data.url ?? data.checkoutUrl;
      if (dest) window.location.href = dest;
    } catch {
      // No-op — Stripe not configured in dev
    } finally {
      setLoading(null);
    }
  }

  return (
    <main data-testid="subscriptions-page" style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{ maxWidth: 1040, margin: "0 auto", padding: "44px 24px" }}>
        <Link href="/home/5" style={{ color: "#00FFFF", textDecoration: "none", fontSize: 12 }}>← Back</Link>

        <div style={{ textAlign: "center", padding: "32px 0 40px" }}>
          <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#FF2DAA", fontWeight: 800, marginBottom: 10 }}>TMI PLATFORM</div>
          <h1 style={{ fontSize: "clamp(1.8rem,5vw,2.8rem)", fontWeight: 900, marginBottom: 10 }}>Subscriptions</h1>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", maxWidth: 480, margin: "0 auto" }}>
            Upgrade your TMI experience. All plans auto-renew. Cancel any time.
          </p>
        </div>

        {MEMBERSHIP_ACCOUNTS.map((accountType) => (
          <section key={accountType} style={{ marginBottom: 34 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ height: 1, flex: 1, background: accountType === "fan" ? "rgba(0,255,255,0.4)" : "rgba(255,45,170,0.4)" }} />
              <h2 style={{ margin: 0, color: accountType === "fan" ? "#00FFFF" : "#FF2DAA", fontSize: 12, fontWeight: 900, letterSpacing: "0.14em" }}>
                {accountType === "fan" ? "FAN MEMBERSHIP" : "PERFORMER MEMBERSHIP"}
              </h2>
              <div style={{ height: 1, flex: 1, background: accountType === "fan" ? "rgba(0,255,255,0.4)" : "rgba(255,45,170,0.4)" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          {TIERS.filter((tier) => tier.accountType === accountType).map((tier) => {
            const priceLabel = tier.priceId
              ? `$${(tier.priceCents / 100).toFixed(2)}/month`
              : "Free";
            const isLoading = loading === tier.id;

            return (
              <div
                key={tier.id}
                data-testid={`sub-tier-${tier.id}`}
                style={{
                  border: `1px solid ${tier.color}${tier.highlight ? "88" : "33"}`,
                  borderRadius: 14,
                  padding: "22px 18px",
                  background: tier.highlight ? `${tier.color}10` : "rgba(255,255,255,0.02)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  boxShadow: tier.highlight ? `0 0 32px ${tier.color}18` : "none",
                  position: "relative",
                }}
              >
                {tier.highlight && (
                  <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: tier.color, color: "#050510", fontSize: 9, fontWeight: 900, letterSpacing: "0.15em", borderRadius: 999, padding: "3px 12px" }}>
                    MOST POPULAR
                  </div>
                )}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: tier.color, letterSpacing: "0.12em", marginBottom: 4 }}>{tier.label.toUpperCase()}</div>
                  <div style={{ fontSize: 26, fontWeight: 900, color: "#fff" }}>{priceLabel}</div>
                </div>
                <ul style={{ margin: 0, padding: "0 0 0 14px", listStyle: "none", flex: 1 }}>
                  {tier.features.map((f) => (
                    <li key={f} style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginBottom: 6, paddingLeft: 0, display: "flex", gap: 6, alignItems: "flex-start" }}>
                      <span style={{ color: tier.color, flexShrink: 0 }}>—</span> {f}
                    </li>
                  ))}
                </ul>
                <button
                  data-testid={`subscribe-${tier.id}`}
                  onClick={() => void subscribe(tier)}
                  disabled={isLoading}
                  style={{
                    padding: "12px",
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: "0.15em",
                    color: isLoading ? "rgba(255,255,255,0.4)" : "#050510",
                    background: isLoading ? "rgba(255,255,255,0.06)" : tier.color,
                    border: "none",
                    borderRadius: 8,
                    cursor: isLoading ? "not-allowed" : "pointer",
                    width: "100%",
                  }}
                >
                  {isLoading ? "REDIRECTING..." : tier.priceId ? `SUBSCRIBE ${tier.label.toUpperCase()}` : `JOIN ${tier.accountType.toUpperCase()} FREE`}
                </button>
              </div>
            );
          })}
            </div>
          </section>
        ))}

        <div style={{ marginTop: 32, textAlign: "center", fontSize: 10, color: "rgba(255,255,255,0.25)", lineHeight: 1.7 }}>
          By subscribing you agree to our{" "}
          <Link href="/terms" style={{ color: "rgba(255,255,255,0.4)" }}>Terms</Link>
          {" & "}
          <Link href="/privacy" style={{ color: "rgba(255,255,255,0.4)" }}>Privacy Policy</Link>.
          {" "}Secure payments via Stripe.
        </div>
      </div>
    </main>
  );
}
