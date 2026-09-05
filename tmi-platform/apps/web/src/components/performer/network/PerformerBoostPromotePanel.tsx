"use client";

/**
 * PerformerBoostPromotePanel — self-serve TMI discovery boosts ($1.99→$19.99).
 * Stripe checkout via existing /api/stripe/checkout patterns. PROMOTED badge only.
 */

import { useMemo, useState, type CSSProperties } from "react";
import {
  DISCOVERY_BOOST_CATALOG,
  listActiveBoostsForOwner,
  type DiscoveryBoostTarget,
  type DiscoveryBoostTier,
} from "@/lib/discovery/DiscoveryBoostEngine";

const TARGETS: { id: DiscoveryBoostTarget; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "upcoming_show", label: "Upcoming show" },
  { id: "mini_concert", label: "Mini concert" },
  { id: "world_concert", label: "World concert" },
  { id: "release", label: "Release" },
  { id: "venue", label: "Venue" },
  { id: "booking_availability", label: "Booking availability" },
  { id: "merch", label: "Merch" },
];

interface Props {
  ownerId: string;
  ownerRole?: "performer" | "venue";
  accent?: string;
}

export default function PerformerBoostPromotePanel({
  ownerId,
  ownerRole = "performer",
  accent = "#FFD700",
}: Props) {
  const [target, setTarget] = useState<DiscoveryBoostTarget>("profile");
  const [tier, setTier] = useState<DiscoveryBoostTier>("spark");
  const active = useMemo(() => listActiveBoostsForOwner(ownerId), [ownerId]);
  const product = DISCOVERY_BOOST_CATALOG.find((p) => p.tier === tier)!;

  const checkoutHref = useMemo(() => {
    const params = new URLSearchParams({
      type: "discovery_boost",
      tier,
      target,
      targetRefId: ownerId,
      ownerRole,
      mode: "payment",
    });
    return `/api/stripe/checkout?${params.toString()}`;
  }, [tier, target, ownerId, ownerRole]);

  return (
    <section style={section(accent)}>
      <header style={{ marginBottom: 12 }}>
        <div style={eyebrow(accent)}>Promote · Boosts</div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>Self-serve exposure</h2>
        <p style={{ margin: "6px 0 0", fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
          Improves discovery weight only. Does not fabricate views, follows, or override organic rank.
          Label: PROMOTED.
        </p>
      </header>

      <div style={{ marginBottom: 12 }}>
        <div style={label}>What to promote</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {TARGETS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTarget(t.id)}
              style={chip(target === t.id, accent)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8, marginBottom: 14 }}>
        {DISCOVERY_BOOST_CATALOG.map((p) => (
          <button
            key={p.tier}
            type="button"
            onClick={() => setTier(p.tier)}
            style={{
              ...chip(tier === p.tier, accent),
              display: "block",
              textAlign: "left",
              padding: 12,
              borderRadius: 12,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 900 }}>{p.label}</div>
            <div style={{ fontSize: 16, fontWeight: 900, marginTop: 4 }}>
              ${(p.priceCents / 100).toFixed(2)}
            </div>
            <div style={{ fontSize: 10, opacity: 0.7, marginTop: 4 }}>
              {p.durationHours}h · {p.exposureWeight}× weight
            </div>
          </button>
        ))}
      </div>

      <a href={checkoutHref} style={buyBtn(accent)}>
        Promote {TARGETS.find((t) => t.id === target)?.label} — $
        {(product.priceCents / 100).toFixed(2)}
      </a>

      <div style={{ marginTop: 16 }}>
        <div style={label}>Active boosts</div>
        {active.length === 0 ? (
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
            No active boosts. Organic discovery only.
          </div>
        ) : (
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
            {active.map((b) => (
              <li key={b.id}>
                PROMOTED · {b.label} · {b.target} · expires{" "}
                {new Date(b.expiresAtMs).toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </div>

      <p style={{ marginTop: 12, fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
        Env (optional real Stripe price IDs): STRIPE_PRICE_DISCOVERY_BOOST_SPARK / _PULSE / _WAVE /
        _BLAST. Checkout falls back to price_data when placeholders are used.
      </p>
    </section>
  );
}

function section(accent: string): CSSProperties {
  return {
    background: "rgba(10,8,24,0.92)",
    border: `1px solid ${accent}33`,
    borderRadius: 16,
    padding: 18,
  };
}
function eyebrow(accent: string): CSSProperties {
  return {
    fontSize: 9,
    letterSpacing: "0.28em",
    color: accent,
    fontWeight: 800,
    textTransform: "uppercase",
    marginBottom: 4,
  };
}
const label: CSSProperties = {
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: "0.1em",
  color: "rgba(255,255,255,0.45)",
  marginBottom: 8,
  textTransform: "uppercase",
};
function chip(active: boolean, color: string): CSSProperties {
  return {
    borderRadius: 999,
    border: `1px solid ${active ? color : "rgba(255,255,255,0.15)"}`,
    background: active ? `${color}22` : "rgba(255,255,255,0.04)",
    color: active ? color : "rgba(255,255,255,0.55)",
    padding: "6px 12px",
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: "0.06em",
    cursor: "pointer",
  };
}
function buyBtn(accent: string): CSSProperties {
  return {
    display: "inline-block",
    marginTop: 4,
    padding: "12px 18px",
    borderRadius: 10,
    background: `linear-gradient(135deg, ${accent}33, rgba(255,45,170,0.2))`,
    border: `1px solid ${accent}66`,
    color: accent,
    fontWeight: 900,
    fontSize: 12,
    letterSpacing: "0.08em",
    textDecoration: "none",
  };
}
