"use client";

import { useState } from "react";
import Link from "next/link";
import { STRIPE_PRODUCTS } from "@/lib/stripe/products";

const TIERS = [
  {
    key: "MEMBER_PRO_MONTHLY" as const,
    label: "Member Pro",
    testId: "sub-tier-fan",
    tagline: "All live rooms, priority chat, HD streams, monthly bonus XP, no ads.",
    color: "#00FFFF",
    highlight: false,
  },
  {
    key: "MEMBER_VIP_MONTHLY" as const,
    label: "Member VIP",
    testId: "sub-tier-performer",
    tagline: "Everything in Pro plus VIP rooms, monthly spotlight badge, exclusive artist drops, early access contests.",
    color: "#FF2DAA",
    highlight: true,
  },
  {
    key: "ARTIST_PRO_MONTHLY" as const,
    label: "Artist Pro",
    testId: "sub-tier-artist",
    tagline: "Verified badge, full Beat Lab access, NFT minting, profile analytics, priority booking listing.",
    color: "#AA2DFF",
    highlight: false,
  },
  {
    key: "SEASON_PASS" as const,
    label: "Season Pass",
    testId: "sub-tier-season",
    tagline: "All season events, VIP room access, exclusive merch drop, season champion eligibility, commemorative NFT.",
    color: "#FFD700",
    highlight: false,
  },
] as const;

type TierKey = (typeof TIERS)[number]["key"];

export default function SubscriptionsPage() {
  const [loading, setLoading] = useState<TierKey | null>(null);

  async function subscribe(tierKey: TierKey) {
    setLoading(tierKey);
    const product = STRIPE_PRODUCTS[tierKey];
    const mode = "interval" in product && product.interval !== "one_time" ? "subscription" : "payment";
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          items: [{ priceId: product.priceId, quantity: 1 }],
          mode,
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

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          {TIERS.map(({ key, label, testId, tagline, color, highlight }) => {
            const product = STRIPE_PRODUCTS[key];
            const priceLabel = `$${(product.price / 100).toFixed(2)}${"interval" in product && product.interval !== "one_time" ? `/${product.interval}` : ""}`;
            const isLoading = loading === key;

            return (
              <div
                key={key}
                data-testid={testId}
                style={{
                  border: `1px solid ${color}${highlight ? "88" : "33"}`,
                  borderRadius: 14,
                  padding: "22px 18px",
                  background: highlight ? `${color}10` : "rgba(255,255,255,0.02)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  boxShadow: highlight ? `0 0 32px ${color}18` : "none",
                  position: "relative",
                }}
              >
                {highlight && (
                  <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: color, color: "#050510", fontSize: 9, fontWeight: 900, letterSpacing: "0.15em", borderRadius: 999, padding: "3px 12px" }}>
                    MOST POPULAR
                  </div>
                )}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, color, letterSpacing: "0.12em", marginBottom: 4 }}>{label.toUpperCase()}</div>
                  <div style={{ fontSize: 26, fontWeight: 900, color: "#fff" }}>{priceLabel}</div>
                </div>
                <ul style={{ margin: 0, padding: "0 0 0 14px", listStyle: "none", flex: 1 }}>
                  {product.features?.map((f: string) => (
                    <li key={f} style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginBottom: 6, paddingLeft: 0, display: "flex", gap: 6, alignItems: "flex-start" }}>
                      <span style={{ color, flexShrink: 0 }}>—</span> {f}
                    </li>
                  ))}
                </ul>
                <button
                  data-testid={`subscribe-${testId.replace("sub-tier-", "")}`}
                  onClick={() => void subscribe(key)}
                  disabled={isLoading}
                  style={{
                    padding: "12px",
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: "0.15em",
                    color: isLoading ? "rgba(255,255,255,0.4)" : "#050510",
                    background: isLoading ? "rgba(255,255,255,0.06)" : color,
                    border: "none",
                    borderRadius: 8,
                    cursor: isLoading ? "not-allowed" : "pointer",
                    width: "100%",
                  }}
                >
                  {isLoading ? "REDIRECTING..." : `SUBSCRIBE ${label.toUpperCase()}`}
                </button>
              </div>
            );
          })}
        </div>

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
