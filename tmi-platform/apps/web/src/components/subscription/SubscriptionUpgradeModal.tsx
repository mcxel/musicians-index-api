"use client";
/**
 * SubscriptionUpgradeModal — upgrade/downgrade flow for all TMI plans.
 * Wires to existing Stripe checkout. Shows tier comparison.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getAllSubscriptionProducts, type SubscriptionAccountType } from "@/lib/stripe/products";

// Plans are built from the canonical registry (@/lib/stripe/products.ts),
// not hardcoded — this file previously listed invented tier names ("Artist
// Gold", "VIP Diamond") with placeholder price IDs that don't correspond to
// any real TMI tier or Stripe price at all (Lane A A8, 2026-09-01).
const TIER_ICONS: Record<string, string> = { PRO: "⭐", RUBY: "💎", SILVER: "🥈", GOLD: "🥇", PLATINUM: "🏆", DIAMOND: "👑" };
const TIER_COLORS: Record<string, string> = { PRO: "#FF6B35", RUBY: "#FF2DAA", SILVER: "#00FFFF", GOLD: "#FFD700", PLATINUM: "#E5E4E2", DIAMOND: "#AA2DFF" };

function buildPlans(accountType: SubscriptionAccountType) {
  return [
    { id: "free", name: "Free", price: 0, period: "forever", color: "#00FFFF", icon: "🎧", features: ["Watch live shows", "Browse battles", "Basic chat"], priceId: null as string | null },
    ...getAllSubscriptionProducts(accountType).map((p) => ({
      id: p.tier.toLowerCase(),
      name: p.name,
      price: p.price / 100,
      period: "month",
      color: TIER_COLORS[p.tier] ?? "#AA2DFF",
      icon: TIER_ICONS[p.tier] ?? "⭐",
      features: [...p.features],
      priceId: p.priceId as string | null,
    })),
  ];
}

interface Props {
  currentPlanId?: string;
  isOpen: boolean;
  onClose: () => void;
  accentColor?: string;
  accountType?: SubscriptionAccountType;
}

export default function SubscriptionUpgradeModal({ currentPlanId = "free", isOpen, onClose, accentColor = "#AA2DFF", accountType = "fan" }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const PLANS = buildPlans(accountType);

  if (!isOpen) return null;

  async function handleSelect(plan: typeof PLANS[0]) {
    if (!plan.priceId) return;
    setLoading(plan.id);
    const params = new URLSearchParams({
      priceId: plan.priceId,
      amount: String(Math.round(plan.price * 100)),
      productName: `TMI ${plan.name} Subscription`,
      mode: "subscription",
    });
    router.push(`/api/stripe/checkout?${params.toString()}`);
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "16px",
    }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "rgba(5,5,16,0.98)", borderRadius: 20,
        border: `1px solid ${accentColor}30`, width: "100%", maxWidth: 880,
        maxHeight: "90vh", overflow: "auto",
        fontFamily: "'Inter', sans-serif",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "20px 24px", borderBottom: `1px solid ${accentColor}15`,
        }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.22em", color: accentColor, fontWeight: 900 }}>
              TMI SUBSCRIPTION PLANS
            </div>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", marginTop: 3 }}>
              Upgrade Your Experience
            </div>
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "none", color: "rgba(255,255,255,0.4)",
            fontSize: 20, cursor: "pointer", padding: "4px 8px",
          }}>
            ✕
          </button>
        </div>

        {/* Plan grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16, padding: "20px 24px 24px",
        }}>
          {PLANS.map(plan => {
            const isCurrent = plan.id === currentPlanId;
            return (
              <div key={plan.id} style={{
                background: isCurrent ? `${plan.color}10` : "rgba(255,255,255,0.02)",
                border: `1.5px solid ${isCurrent ? plan.color : plan.color + "22"}`,
                borderRadius: 14, padding: "18px 16px",
                display: "flex", flexDirection: "column",
                transition: "all 0.15s",
              }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{plan.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 900, color: plan.color, marginBottom: 4 }}>
                  {plan.name}
                </div>
                <div style={{ marginBottom: 12 }}>
                  <span style={{ fontSize: 24, fontWeight: 900, color: "#fff" }}>
                    {plan.price === 0 ? "FREE" : `$${plan.price}`}
                  </span>
                  {plan.price > 0 && (
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>/{plan.period}</span>
                  )}
                </div>

                <div style={{ flex: 1, marginBottom: 14 }}>
                  {plan.features.map(f => (
                    <div key={f} style={{
                      display: "flex", gap: 6, alignItems: "flex-start",
                      marginBottom: 5,
                    }}>
                      <span style={{ color: plan.color, fontSize: 10, flexShrink: 0, marginTop: 1 }}>✓</span>
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", lineHeight: 1.4 }}>{f}</span>
                    </div>
                  ))}
                </div>

                {isCurrent ? (
                  <div style={{
                    padding: "9px", textAlign: "center", borderRadius: 8,
                    background: `${plan.color}15`, border: `1px solid ${plan.color}33`,
                    fontSize: 9, fontWeight: 900, color: plan.color, letterSpacing: "0.12em",
                  }}>
                    ✓ CURRENT PLAN
                  </div>
                ) : plan.priceId ? (
                  <button
                    onClick={() => handleSelect(plan)}
                    disabled={!!loading}
                    style={{
                      padding: "9px", borderRadius: 8,
                      background: `linear-gradient(135deg, ${plan.color}, ${plan.color}aa)`,
                      color: "#000", fontWeight: 900, fontSize: 9,
                      border: "none", cursor: loading ? "not-allowed" : "pointer",
                      letterSpacing: "0.12em", opacity: loading === plan.id ? 0.6 : 1,
                      transition: "opacity 0.15s",
                    }}
                  >
                    {loading === plan.id ? "LOADING..." : "UPGRADE →"}
                  </button>
                ) : (
                  <div style={{
                    padding: "9px", textAlign: "center", borderRadius: 8,
                    background: "rgba(255,255,255,0.03)",
                    fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em",
                  }}>
                    FREE — NO CARD NEEDED
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{
          padding: "12px 24px 20px", textAlign: "center",
          fontSize: 9, color: "rgba(255,255,255,0.2)",
        }}>
          Secured by Stripe · Cancel anytime · Plans billed monthly
        </div>
      </div>
    </div>
  );
}
