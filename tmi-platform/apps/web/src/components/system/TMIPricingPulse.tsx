"use client";

/**
 * Ambient membership pulse — prices ONLY from STRIPE_PRODUCTS / PriceSortAuthority.
 * Shows role-aware lowest paid entry (Performer Pro $2.99 · Fan Pro $4.99).
 * No POPULAR / urgency badges. No invented Season Pass lead price.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  STRIPE_PRODUCTS,
  getSubscriptionOffersLowestFirst,
  isRealPriceId,
} from "@/lib/stripe/products";

type Phase = "in" | "visible" | "out" | "gone";

function formatMo(cents: number): string {
  return `$${(cents / 100).toFixed(2)}/mo`;
}

export default function TMIPricingPulse() {
  const [phase, setPhase] = useState<Phase>("in");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("visible"), 60);
    const t2 = setTimeout(() => setPhase("out"), 5500);
    const t3 = setTimeout(() => setPhase("gone"), 6300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  if (phase === "gone") return null;

  const performerPro = getSubscriptionOffersLowestFirst("performer").find((o) => o.tier === "PRO");
  const fanPro = getSubscriptionOffersLowestFirst("fan").find((o) => o.tier === "PRO");
  const seasonStarter = STRIPE_PRODUCTS.SEASON_PASS_STARTER;
  const showSeason = Boolean(seasonStarter && isRealPriceId(seasonStarter.priceId));

  // Always show canonical entry amounts from registry (amount truth), even when
  // Stripe Price object sync is pending — checkout uses price_data fallback.
  const rows = [
    { key: "FREE", label: "Free", price: "$0", color: "rgba(255,255,255,0.55)" },
    {
      key: "PERF_PRO",
      label: "Performer Pro",
      price: performerPro ? formatMo(performerPro.priceCents) : formatMo(STRIPE_PRODUCTS.PERFORMER_PRO_MONTHLY.price),
      color: "#FF6B35",
    },
    {
      key: "FAN_PRO",
      label: "Fan Pro",
      price: fanPro ? formatMo(fanPro.priceCents) : formatMo(STRIPE_PRODUCTS.FAN_PRO_MONTHLY.price),
      color: "#00FFFF",
    },
  ];

  const opacity = phase === "in" ? 0 : phase === "out" ? 0 : 1;
  const translateY = phase === "in" ? -12 : phase === "out" ? -12 : 0;

  return (
    <div
      aria-hidden="true"
      data-pricing-pulse="canonical-lowest-first"
      style={{
        position: "fixed",
        top: 14,
        right: 14,
        zIndex: 300,
        opacity,
        transform: `translateY(${translateY}px)`,
        transition: "opacity 0.6s ease, transform 0.6s ease",
        background: "rgba(5,5,16,0.92)",
        border: "1px solid rgba(255,45,170,0.25)",
        borderRadius: 14,
        padding: "12px 16px",
        minWidth: 240,
        boxShadow: "0 0 24px rgba(255,45,170,0.12), 0 8px 32px rgba(0,0,0,0.6)",
        backdropFilter: "blur(12px)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: "#FF2DAA" }}>TMI MEMBERSHIP</span>
        <Link
          href="/pricing"
          style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}
        >
          VIEW ALL →
        </Link>
      </div>

      {rows.map((t) => (
        <div
          key={t.key}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "5px 0",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 800, color: t.color }}>{t.label}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>{t.price}</span>
        </div>
      ))}

      {showSeason && (
        <div
          style={{
            marginTop: 8,
            background: "rgba(255,45,170,0.07)",
            border: "1px solid rgba(255,45,170,0.3)",
            borderRadius: 8,
            padding: "7px 10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: 10, fontWeight: 900, color: "#FF2DAA" }}>{seasonStarter.name}</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>One-time · lowest season pass</div>
          </div>
          <span style={{ fontSize: 13, fontWeight: 900, color: "#FF2DAA" }}>
            ${(seasonStarter.price / 100).toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
}
