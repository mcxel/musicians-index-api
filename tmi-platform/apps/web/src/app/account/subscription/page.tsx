"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Plan {
  id: string;
  name: string;
  price: string;
  interval: string;
  color: string;
  features: string[];
  stripePriceId?: string;
}

interface CurrentSub {
  planName: string;
  status: "active" | "trialing" | "past_due" | "canceled";
  renewsAt: string;
  cancelAtPeriodEnd: boolean;
}

const PLANS: Plan[] = [
  {
    id: "fan-free",
    name: "Fan — Free",
    price: "$0",
    interval: "forever",
    color: "#FF2DAA",
    features: ["Watch battles & cyphers", "Buy tickets", "Collect memory polaroids", "Vote in challenges"],
  },
  {
    id: "fan-plus",
    name: "Fan Plus",
    price: "$7.99",
    interval: "/mo",
    color: "#FF2DAA",
    features: ["Everything in Free", "No ads", "Early ticket access", "Exclusive fan badges", "HD streams"],
    stripePriceId: "price_fan_plus_monthly",
  },
  {
    id: "performer-pro",
    name: "Performer Pro",
    price: "$19.99",
    interval: "/mo",
    color: "#AA2DFF",
    features: ["All fan features", "Live room hosting", "Battle entry", "Beat purchase credits", "Analytics dashboard", "Profile article"],
    stripePriceId: "price_performer_pro_monthly",
  },
  {
    id: "promoter-pro",
    name: "Promoter Pro",
    price: "$149",
    interval: "/mo",
    color: "#00FF88",
    features: ["Unlimited events", "Batch ticket printing", "Venue seat maps", "Artist booking tools", "Sponsor matchmaking", "Priority support"],
    stripePriceId: "price_promoter_pro_monthly",
  },
  {
    id: "sponsor-featured",
    name: "Sponsor Featured",
    price: "$699",
    interval: "/mo",
    color: "#FFD700",
    features: ["Platform-wide banner", "Curated artist matching", "Pro Legacy Ledger entries", "HolographicCard showcase", "Dedicated account manager"],
    stripePriceId: "price_sponsor_featured_monthly",
  },
  {
    id: "advertiser-pro",
    name: "Advertiser Pro",
    price: "$299",
    interval: "/mo",
    color: "#FFA500",
    features: ["Mid-article ad placements", "Live overlay ads", "Campaign analytics", "A/B creative testing", "Brand safety controls"],
    stripePriceId: "price_advertiser_pro_monthly",
  },
];

const STATUS_COLOR: Record<CurrentSub["status"], string> = {
  active: "#00FF88",
  trialing: "#00FFFF",
  past_due: "#FFD700",
  canceled: "rgba(255,255,255,0.3)",
};

export default function SubscriptionPage() {
  const [current, setCurrent]   = useState<CurrentSub | null>(null);
  const [loading, setLoading]   = useState(true);
  const [changing, setChanging] = useState<string | null>(null);
  const [cancelMsg, setCancelMsg] = useState("");
  const [showHigherPlans, setShowHigherPlans] = useState(false);

  const planPriceValue = (plan: Plan): number => {
    const normalized = plan.price.replace(/[^0-9.]/g, "");
    const value = Number.parseFloat(normalized);
    return Number.isFinite(value) ? value : 0;
  };

  const sortedPlans = [...PLANS].sort((a, b) => planPriceValue(a) - planPriceValue(b));
  const starterPlans = sortedPlans.filter((plan) => planPriceValue(plan) <= 19.99);
  const higherPlans = sortedPlans.filter((plan) => planPriceValue(plan) > 19.99);

  useEffect(() => {
    fetch("/api/stripe/customer", { credentials: "include" })
      .then((r) => r.json())
      .then((d: unknown) => {
        const data = d as { subscription?: { plan?: { nickname?: string }; status?: string; current_period_end?: number; cancel_at_period_end?: boolean } };
        if (data.subscription) {
          setCurrent({
            planName: data.subscription.plan?.nickname ?? "Active Plan",
            status: (data.subscription.status ?? "active") as CurrentSub["status"],
            renewsAt: data.subscription.current_period_end
              ? new Date(data.subscription.current_period_end * 1000).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
              : "—",
            cancelAtPeriodEnd: data.subscription.cancel_at_period_end ?? false,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleUpgrade(plan: Plan) {
    if (!plan.stripePriceId || changing) return;
    setChanging(plan.id);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          priceId: plan.stripePriceId,
          successUrl: `${window.location.origin}/account/subscription?upgraded=1`,
          cancelUrl: window.location.href,
        }),
      });
      const data = await res.json() as { url?: string };
      if (data.url) window.location.href = data.url;
    } catch {
      setChanging(null);
    }
  }

  async function handleCancel() {
    if (!confirm("Cancel your subscription at end of period?")) return;
    try {
      await fetch("/api/stripe/customer", {
        method: "DELETE",
        credentials: "include",
      });
      setCancelMsg("Subscription will cancel at end of billing period.");
      setCurrent((c) => c ? { ...c, cancelAtPeriodEnd: true } : c);
    } catch {
      setCancelMsg("Error processing cancellation. Please contact support.");
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "40px 20px 80px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#00FFFF", fontWeight: 800, marginBottom: 8 }}>ACCOUNT</div>
          <h1 style={{ margin: "0 0 6px", fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 900 }}>Subscription & Billing</h1>
          <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
            Start with low-cost plans first. Higher-cost options are available only if you need scale.
          </p>
        </div>

        {/* Current plan status */}
        {!loading && current && (
          <div style={{ background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.2)", borderRadius: 12, padding: "20px 24px", marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ fontSize: 9, letterSpacing: "0.25em", color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>CURRENT PLAN</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>{current.planName}</div>
                <div style={{ marginTop: 4, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                  {current.cancelAtPeriodEnd ? `Cancels on ${current.renewsAt}` : `Renews ${current.renewsAt}`}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ background: `${STATUS_COLOR[current.status]}22`, border: `1px solid ${STATUS_COLOR[current.status]}55`, borderRadius: 20, padding: "4px 12px", fontSize: 9, color: STATUS_COLOR[current.status], fontWeight: 900, letterSpacing: "0.15em" }}>
                  {current.status.toUpperCase().replace("_", " ")}
                </div>
                {!current.cancelAtPeriodEnd && (
                  <button onClick={handleCancel} style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "4px 10px", cursor: "pointer", letterSpacing: "0.1em" }}>
                    CANCEL
                  </button>
                )}
              </div>
            </div>
            {cancelMsg && <p style={{ margin: "12px 0 0", fontSize: 12, color: "#FFD700" }}>{cancelMsg}</p>}
          </div>
        )}

        {!loading && !current && (
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "16px 24px", marginBottom: 32, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
            No active subscription. Pick a starter plan below and scale later only if needed.
          </div>
        )}

        <div style={{ fontSize: 9, letterSpacing: "0.24em", color: "#00FF88", fontWeight: 800, marginBottom: 12 }}>
          STARTER PLANS
        </div>

        {/* Starter plans grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16, marginBottom: 20 }}>
          {starterPlans.map((plan) => (
            <div key={plan.id} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${plan.color}22`, borderRadius: 14, padding: "20px", display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 9, letterSpacing: "0.2em", color: plan.color, fontWeight: 800, marginBottom: 6 }}>{plan.name.toUpperCase()}</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", marginBottom: 2 }}>
                {plan.price}<span style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", fontWeight: 400 }}>{plan.interval}</span>
              </div>
              <ul style={{ margin: "14px 0 auto", padding: "0 0 0 14px", fontSize: 11, color: "rgba(255,255,255,0.55)", lineHeight: 2, flex: 1 }}>
                {plan.features.map((f) => <li key={f}>{f}</li>)}
              </ul>
              {plan.stripePriceId ? (
                <button
                  onClick={() => handleUpgrade(plan)}
                  disabled={!!changing}
                  style={{ marginTop: 16, padding: "10px 16px", background: `linear-gradient(135deg,${plan.color}cc,${plan.color}88)`, border: "none", borderRadius: 8, color: "#050510", fontWeight: 900, fontSize: 11, letterSpacing: "0.12em", cursor: changing ? "not-allowed" : "pointer", opacity: changing === plan.id ? 0.5 : 1 }}
                >
                  {changing === plan.id ? "REDIRECTING..." : "CHOOSE PLAN →"}
                </button>
              ) : (
                <div style={{ marginTop: 16, padding: "10px 16px", background: "rgba(255,255,255,0.04)", borderRadius: 8, color: "rgba(255,255,255,0.3)", fontSize: 11, letterSpacing: "0.1em", textAlign: "center" }}>
                  FREE
                </div>
              )}
            </div>
          ))}
        </div>

        {higherPlans.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <button
              onClick={() => setShowHigherPlans((previous) => !previous)}
              style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.16)", color: "rgba(255,255,255,0.58)", padding: "10px 18px", borderRadius: 999, fontSize: 10, letterSpacing: "0.12em", fontWeight: 800, cursor: "pointer" }}
            >
              {showHigherPlans ? "HIDE HIGHER-COST OPTIONS" : "SHOW HIGHER-COST OPTIONS (OPTIONAL)"}
            </button>
          </div>
        )}

        {showHigherPlans && higherPlans.length > 0 && (
          <>
            <div style={{ fontSize: 9, letterSpacing: "0.24em", color: "#FFD700", fontWeight: 800, marginBottom: 12 }}>
              SCALE OPTIONS
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
              {higherPlans.map((plan) => (
                <div key={plan.id} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${plan.color}22`, borderRadius: 14, padding: "20px", display: "flex", flexDirection: "column" }}>
                  <div style={{ fontSize: 9, letterSpacing: "0.2em", color: plan.color, fontWeight: 800, marginBottom: 6 }}>{plan.name.toUpperCase()}</div>
                  <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", marginBottom: 2 }}>
                    {plan.price}<span style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", fontWeight: 400 }}>{plan.interval}</span>
                  </div>
                  <ul style={{ margin: "14px 0 auto", padding: "0 0 0 14px", fontSize: 11, color: "rgba(255,255,255,0.55)", lineHeight: 2, flex: 1 }}>
                    {plan.features.map((f) => <li key={f}>{f}</li>)}
                  </ul>
                  {plan.stripePriceId ? (
                    <button
                      onClick={() => handleUpgrade(plan)}
                      disabled={!!changing}
                      style={{ marginTop: 16, padding: "10px 16px", background: `linear-gradient(135deg,${plan.color}cc,${plan.color}88)`, border: "none", borderRadius: 8, color: "#050510", fontWeight: 900, fontSize: 11, letterSpacing: "0.12em", cursor: changing ? "not-allowed" : "pointer", opacity: changing === plan.id ? 0.5 : 1 }}
                    >
                      {changing === plan.id ? "REDIRECTING..." : "VIEW OPTION →"}
                    </button>
                  ) : (
                    <div style={{ marginTop: 16, padding: "10px 16px", background: "rgba(255,255,255,0.04)", borderRadius: 8, color: "rgba(255,255,255,0.3)", fontSize: 11, letterSpacing: "0.1em", textAlign: "center" }}>
                      FREE
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        <div style={{ marginTop: 32, fontSize: 11, color: "rgba(255,255,255,0.25)", textAlign: "center" }}>
          All plans billed monthly. Cancel anytime. Questions?{" "}
          <Link href="/support" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Contact support</Link>
        </div>
      </div>
    </main>
  );
}
