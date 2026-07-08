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
  roles?: string[]; // which roles this plan targets
}

interface CurrentSub {
  planName: string;
  status: "active" | "trialing" | "past_due" | "canceled";
  renewsAt: string;
  cancelAtPeriodEnd: boolean;
}

// Prices sourced from Stripe CSV (prices.csv).
// Tier names in the UI follow TMI canonical order: FREE → PRO → RUBY → SILVER → GOLD → PLATINUM → DIAMOND
// The Stripe product names (Ruby Fan, Silver Fan, etc.) are legacy labels — TMI tier names are authoritative.
const PLANS: Plan[] = [
  // ── Fan tiers — Volume Accessibility Ladder ───────────────────────────────────
  {
    id: "fan-free",
    name: "Fan — FREE",
    price: "$0",
    interval: "forever",
    color: "#FF2DAA",
    roles: ["FAN", "USER"],
    features: ["Watch battles & cyphers", "Buy tickets", "Collect memory polaroids", "Vote in challenges"],
  },
  {
    id: "fan-pro",
    name: "Fan — PRO",
    price: "$2.99",
    interval: "/mo",
    color: "#FF2DAA",
    roles: ["FAN", "USER"],
    features: ["Heart unlimited content", "Collect badges", "Exclusive articles", "Priority chat", "Early access drops"],
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_FAN_PRO ?? 'price_1TcJnFEAwH1Fjtu98MhoEGqG',
  },
  {
    id: "fan-ruby",
    name: "Fan — RUBY",
    price: "$5.99",
    interval: "/mo",
    color: "#AA2DFF",
    roles: ["FAN", "USER"],
    features: ["All PRO perks", "Ruby avatar glow", "Fan leaderboard placement", "Tip with bonus multiplier"],
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_FAN_RUBY ?? 'price_1TcJoOEAwH1Fjtu9IrhSwoyA',
  },
  {
    id: "fan-silver",
    name: "Fan — SILVER",
    price: "$9.99",
    interval: "/mo",
    color: "#C0C0C0",
    roles: ["FAN", "USER"],
    features: ["All RUBY perks", "VIP room access", "Silver badge + avatar frame", "Priority fan queue"],
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_FAN_SILVER ?? 'price_1TcJrTEAwH1Fjtu9wjhmnv5K',
  },
  {
    id: "fan-gold",
    name: "Fan — GOLD",
    price: "$19.99",
    interval: "/mo",
    color: "#FFD700",
    roles: ["FAN", "USER"],
    features: ["All SILVER perks", "Gold crown badge", "Backstage pass access", "Fan ambassador status", "Exclusive Gold events"],
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_FAN_GOLD ?? 'price_1TcJsDEAwH1Fjtu9zU7X7mml',
  },
  {
    id: "fan-platinum",
    name: "Fan — PLATINUM",
    price: "$29.99",
    interval: "/mo",
    color: "#E5E4E2",
    roles: ["FAN", "USER"],
    features: ["All GOLD perks", "Platinum VIP status", "Exclusive meet & greet access", "Artist direct messages"],
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_FAN_PLATINUM ?? 'price_1TcJvaEAwH1Fjtu9me4Aq2UU',
  },
  {
    id: "fan-diamond",
    name: "Fan — DIAMOND",
    price: "$37",
    interval: "/mo",
    color: "#B9F2FF",
    roles: ["FAN", "USER"],
    features: ["All PLATINUM perks", "Diamond superfan status", "VIP seat reservations", "Diamond-only events & drops", "Dedicated fan concierge", "Lifetime loyalty pricing"],
    // NEXT_PUBLIC_STRIPE_PRICE_FAN_DIAMOND already set in Vercel (added Jun 1)
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_FAN_DIAMOND ?? '',
  },

  // ── Performer tiers — Volume Accessibility Ladder ─────────────────────────────
  // FREE → PRO → RUBY → SILVER → GOLD → PLATINUM → DIAMOND
  {
    id: "performer-pro",
    name: "Performer — PRO",
    price: "$1.99",
    interval: "/mo",
    color: "#AA2DFF",
    roles: ["PERFORMER", "ARTIST"],
    features: ["Go Live today", "Build your fanbase", "Get booked", "Earn tips", "Featured opportunities"],
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PERFORMER_PRO ?? 'price_1TcJzdEAwH1Fjtu9Nx5DsRzL',
  },
  {
    id: "performer-ruby",
    name: "Performer — RUBY",
    price: "$3.99",
    interval: "/mo",
    color: "#CC44FF",
    roles: ["PERFORMER", "ARTIST"],
    features: ["All PRO perks", "Ruby avatar glow", "Cypher priority access", "Enhanced analytics"],
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PERFORMER_RUBY ?? 'price_1TcK0dEAwH1Fjtu9MXK323Q7',
  },
  {
    id: "performer-silver",
    name: "Performer — SILVER",
    price: "$6.99",
    interval: "/mo",
    color: "#C0C0C0",
    roles: ["PERFORMER", "ARTIST"],
    features: ["All RUBY perks", "Priority battle queue", "Silver badge", "Revenue dashboard", "Booking requests"],
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PERFORMER_SILVER ?? 'price_1TcK1LEAwH1Fjtu9ZnOrTyZw',
  },
  {
    id: "performer-gold",
    name: "Performer — GOLD",
    price: "$12.99",
    interval: "/mo",
    color: "#FFD700",
    roles: ["PERFORMER", "ARTIST"],
    features: ["All SILVER perks", "Gold crown + verified badge", "Featured placement", "Sponsorship matching"],
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PERFORMER_GOLD ?? 'price_1TcK2xEAwH1Fjtu9FLlIHItH',
  },
  {
    id: "performer-platinum",
    name: "Performer — PLATINUM",
    price: "$19.99",
    interval: "/mo",
    color: "#E5E4E2",
    roles: ["PERFORMER", "ARTIST"],
    features: ["All GOLD perks", "Platinum verified status", "Diamond feature nominations", "Priority booking"],
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PERFORMER_PLATINUM ?? 'price_1TcK4MEAwH1Fjtu96b2TJlBe',
  },
  {
    id: "performer-diamond",
    name: "Performer — DIAMOND",
    price: "$24.99",
    interval: "/mo",
    color: "#B9F2FF",
    roles: ["PERFORMER", "ARTIST"],
    features: ["All PLATINUM perks", "Diamond verified status", "Front-page editorial feature", "Dedicated A&R manager", "Revenue share boost", "Exclusive Diamond showcase events"],
    // Set NEXT_PUBLIC_STRIPE_PRICE_PERFORMER_DIAMOND once created in Stripe at $24.99/mo
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PERFORMER_DIAMOND ?? '',
  },

  // ── Band tiers ──────────────────────────────────────────────────────────────
  {
    id: "band-pro",
    name: "Band — PRO",
    price: "$16.99",
    interval: "/mo",
    color: "#FF9500",
    roles: ["BAND"],
    features: ["Band profile + group page", "Music uploads + event listings", "Go live + booking inquiries", "Messaging + playlist support", "Basic analytics"],
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_BAND_PRO ?? '',
  },
  {
    id: "band-gold",
    name: "Band — GOLD",
    price: "$20.00",
    interval: "/mo",
    color: "#FFD700",
    roles: ["BAND"],
    features: ["Everything in Band PRO", "Full Creative Studio suite", "Poster/flyer/magazine creators", "Retro Vision + keepsake tools", "Priority discovery + advanced analytics"],
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_BAND_GOLD ?? '',
  },
  {
    id: "band-platinum",
    name: "Band — PLATINUM",
    price: "$29.99",
    interval: "/mo",
    color: "#E5E4E2",
    roles: ["BAND"],
    features: ["Everything in Band GOLD", "Higher upload + storage limits", "Premium templates + campaign tools", "Platinum band placement", "Expanded analytics"],
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_BAND_PLATINUM ?? '',
  },
  {
    id: "band-diamond",
    name: "Band — DIAMOND",
    price: "$39.99",
    interval: "/mo",
    color: "#B9F2FF",
    roles: ["BAND"],
    features: ["Everything in Band PLATINUM", "Top-tier promotion priority", "Diamond badge + spotlight eligibility", "Highest limits for media + submissions", "VIP support lane"],
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_BAND_DIAMOND ?? '',
  },

  // ── Business tiers ────────────────────────────────────────────────────────────
  {
    id: "promoter",
    name: "Promoter",
    price: "$9.99",
    interval: "/wk",
    color: "#00FF88",
    roles: ["PROMOTER"],
    features: ["Unlimited events", "Batch ticket printing", "Venue seat maps", "Artist booking tools", "Sponsor matchmaking"],
    // price_1TdZQSEAwH1Fjtu9Cz3j2Rik — $9.99/week
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PROMOTER ?? 'price_1TdZQSEAwH1Fjtu9Cz3j2Rik',
  },
  {
    id: "venue",
    name: "Venue Owner",
    price: "$14.99",
    interval: "/wk",
    color: "#00FFFF",
    roles: ["VENUE"],
    features: ["Host events", "Sell tickets", "Seat map management", "Venue profile & analytics", "TMI-certified venue badge"],
    // price_1TdZQEEAwH1Fjtu9JcPS32sL — $14.99/week
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_VENUE ?? 'price_1TdZQEEAwH1Fjtu9JcPS32sL',
  },
  {
    id: "advertiser",
    name: "Advertiser",
    price: "$49.99",
    interval: "/mo",
    color: "#FFA500",
    roles: ["ADVERTISER"],
    features: ["Mid-article ad placements", "Live overlay ads", "Campaign analytics", "A/B creative testing", "Brand safety controls"],
    // price_1TdY0UEAwH1Fjtu9FTrdprdy — $49.99/month
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ADVERTISER ?? 'price_1TdY0UEAwH1Fjtu9FTrdprdy',
  },
  {
    id: "sponsor-basic",
    name: "Sponsor — Basic",
    price: "$25",
    interval: "/mo",
    color: "#FFD700",
    roles: ["SPONSOR"],
    features: ["Artist/event sponsorship", "Logo placement", "Curated artist matching", "Sponsor dashboard"],
    // price_1Tb148EAwH1Fjtu9KZFL3H3Y — $25/month
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_SPONSOR_BASIC ?? 'price_1Tb148EAwH1Fjtu9KZFL3H3Y',
  },
];

// Anchor plan = cheapest paid entry for each role.
// Performers: Go PRO for $1.99. Fans: Go PRO for $2.99.
const ANCHOR_BY_ROLE: Record<string, string> = {
  PERFORMER: "performer-pro",   // Performers: Go PRO — $1.99
  ARTIST:    "performer-pro",
  BAND:      "band-pro",        // Bands: Go PRO — $16.99
  FAN:       "fan-pro",         // Fans: Go PRO — $2.99
  USER:      "fan-pro",
  PROMOTER:  "promoter",
  VENUE:     "venue",
  ADVERTISER:"advertiser",
  SPONSOR:   "sponsor-basic",
};

// Upsell ladder shown below the anchor — full tier stack above PRO.
const UPSELL_AFTER: Record<string, string[]> = {
  PERFORMER: ["performer-ruby", "performer-silver", "performer-gold", "performer-platinum", "performer-diamond"],
  ARTIST:    ["performer-ruby", "performer-silver", "performer-gold", "performer-platinum", "performer-diamond"],
  BAND:      ["band-gold", "band-platinum", "band-diamond"],
  FAN:       ["fan-ruby", "fan-silver", "fan-gold", "fan-platinum", "fan-diamond"],
  USER:      ["fan-ruby", "fan-silver", "fan-gold", "fan-platinum", "fan-diamond"],
  PROMOTER:  [],
  VENUE:     [],
};

const STATUS_COLOR: Record<CurrentSub["status"], string> = {
  active:   "#00FF88",
  trialing: "#00FFFF",
  past_due: "#FFD700",
  canceled: "rgba(255,255,255,0.3)",
};

const planById = (id: string) => PLANS.find((p) => p.id === id);

function isLiveStripePriceId(priceId?: string): boolean {
  return !!priceId && /^price_[A-Za-z0-9]{16,}$/.test(priceId);
}

function planPriceValue(plan: Plan): number {
  const v = Number.parseFloat(plan.price.replace(/[^0-9.]/g, ""));
  return Number.isFinite(v) ? v : 0;
}

export default function SubscriptionPage() {
  const [current, setCurrent]     = useState<CurrentSub | null>(null);
  const [loading, setLoading]     = useState(true);
  const [userRole, setUserRole]   = useState<string>("");
  const [changing, setChanging]   = useState<string | null>(null);
  const [cancelMsg, setCancelMsg] = useState("");
  const [upgradeMsg, setUpgradeMsg] = useState("");
  const [showAll, setShowAll]     = useState(false);

  // Detect user role to personalize anchor pricing
  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d: unknown) => {
        const data = d as { authenticated?: boolean; user?: { role?: string } };
        if (data.authenticated && data.user?.role) {
          setUserRole(data.user.role.toUpperCase());
        }
      })
      .catch(() => {});
  }, []);

  // On return from Stripe checkout, activate tier immediately so cookie updates without re-login
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const upgraded = params.get("upgraded");
    const sessionId = params.get("session_id");
    if (upgraded === "1" && sessionId) {
      fetch("/api/subscriptions/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ sessionId }),
      })
        .then((r) => r.json())
        .then((d: unknown) => {
          const data = d as { ok?: boolean; tier?: string };
          if (data.ok && data.tier) {
            setUpgradeMsg(`Subscription active — ${data.tier} tier unlocked.`);
          }
        })
        .catch(() => {});
    }
  }, []);

  // Load current subscription status
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
    if (!isLiveStripePriceId(plan.stripePriceId) || changing) {
      if (!isLiveStripePriceId(plan.stripePriceId)) {
        setUpgradeMsg("This plan is not live in Stripe yet. Please choose another plan or contact support.");
      }
      return;
    }
    setChanging(plan.id);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          items: [{ priceId: plan.stripePriceId, quantity: 1 }],
          mode: "subscription",
          successUrl: `${window.location.origin}/account/subscription?upgraded=1&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: window.location.href,
        }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("[subscription] checkout error:", data.error);
        setChanging(null);
      }
    } catch {
      setChanging(null);
    }
  }

  async function handleCancel() {
    if (!confirm("Cancel your subscription at end of period?")) return;
    try {
      await fetch("/api/stripe/customer", { method: "DELETE", credentials: "include" });
      setCancelMsg("Subscription will cancel at end of billing period.");
      setCurrent((c) => c ? { ...c, cancelAtPeriodEnd: true } : c);
    } catch {
      setCancelMsg("Error processing cancellation. Please contact support.");
    }
  }

  const anchorPlanId = ANCHOR_BY_ROLE[userRole] ?? "";
  const anchorPlan   = anchorPlanId ? planById(anchorPlanId) : null;
  const upsellIds    = UPSELL_AFTER[userRole] ?? [];
  const upsellPlans  = upsellIds.map(planById).filter(Boolean) as Plan[];

  // All plans except anchor + upsell for the "explore all" section
  const allOtherPlans = PLANS.filter(
    (p) => p.id !== anchorPlanId && !upsellIds.includes(p.id) && p.price !== "$0"
  ).sort((a, b) => planPriceValue(a) - planPriceValue(b));

  const roleLabel: Record<string, string> = {
    PERFORMER: "Performer",
    ARTIST:    "Performer",
    FAN:       "Fan",
    USER:      "Fan",
    PROMOTER:  "Promoter",
    ADVERTISER:"Advertiser",
    SPONSOR:   "Sponsor",
  };

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "40px 20px 100px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#00FFFF", fontWeight: 800, marginBottom: 8 }}>
            {userRole ? `${roleLabel[userRole] ?? userRole} ACCOUNT` : "ACCOUNT"}
          </div>
          <h1 style={{ margin: "0 0 6px", fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 900 }}>
            Subscription & Billing
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
            Start low. Scale only when you need to.
          </p>
        </div>

        {/* Upgrade confirmation banner */}
        {upgradeMsg && (
          <div style={{ background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.3)", borderRadius: 10, padding: "14px 20px", marginBottom: 24, fontSize: 13, color: "#00FF88", fontWeight: 700 }}>
            ✓ {upgradeMsg}
          </div>
        )}

        {/* Current subscription status */}
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

        {/* ── ANCHOR PRICING HERO ─────────────────────────────────────────────── */}
        {/* Only shown when: role is known, no active sub, and an anchor plan exists */}
        {!loading && !current && anchorPlan && (
          <>
            <div style={{ fontSize: 9, letterSpacing: "0.3em", color: anchorPlan.color, fontWeight: 800, marginBottom: 14 }}>
              START HERE
            </div>
            <div style={{
              background: `linear-gradient(135deg, ${anchorPlan.color}12, ${anchorPlan.color}06)`,
              border: `1.5px solid ${anchorPlan.color}55`,
              borderRadius: 18,
              padding: "32px 36px",
              marginBottom: 12,
              position: "relative",
              overflow: "hidden",
            }}>
              {/* Neon glow accent */}
              <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: `${anchorPlan.color}18`, filter: "blur(40px)", pointerEvents: "none" }} />

              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 24, position: "relative" }}>
                <div>
                  <div style={{ fontSize: 9, letterSpacing: "0.3em", color: anchorPlan.color, fontWeight: 800, marginBottom: 10 }}>
                    {anchorPlan.name.toUpperCase()}
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 16 }}>
                    <span style={{ fontSize: "clamp(3rem,8vw,4.5rem)", fontWeight: 900, color: "#fff", lineHeight: 1 }}>
                      {anchorPlan.price}
                    </span>
                    <span style={{ fontSize: 16, color: "rgba(255,255,255,0.4)", fontWeight: 400 }}>
                      {anchorPlan.interval}
                    </span>
                  </div>
                  <ul style={{ margin: 0, padding: "0 0 0 16px", fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 2.2 }}>
                    {anchorPlan.features.map((f) => <li key={f}>{f}</li>)}
                  </ul>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "stretch", gap: 10, minWidth: 180 }}>
                  {anchorPlan.stripePriceId ? (
                    <button
                      onClick={() => handleUpgrade(anchorPlan)}
                      disabled={!!changing || !isLiveStripePriceId(anchorPlan.stripePriceId)}
                      style={{
                        padding: "16px 28px",
                        background: anchorPlan.color,
                        border: "none",
                        borderRadius: 10,
                        color: "#050510",
                        fontWeight: 900,
                        fontSize: 13,
                        letterSpacing: "0.12em",
                        cursor: changing || !isLiveStripePriceId(anchorPlan.stripePriceId) ? "not-allowed" : "pointer",
                        opacity: changing === anchorPlan.id ? 0.6 : 1,
                        boxShadow: `0 0 24px ${anchorPlan.color}66`,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {!isLiveStripePriceId(anchorPlan.stripePriceId)
                        ? "COMING SOON"
                        : changing === anchorPlan.id
                          ? "REDIRECTING..."
                          : `GO PRO — ${anchorPlan.price}/mo →`}
                    </button>
                  ) : null}
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", textAlign: "center", letterSpacing: "0.08em" }}>
                    Cancel anytime. No commitment.
                  </div>
                </div>
              </div>
            </div>

            {/* ── UPSELL LADDER ─────────────────────────────────────────────────── */}
            {upsellPlans.length > 0 && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "28px 0 14px" }}>
                  <div style={{ height: 1, flex: 1, background: "rgba(255,255,255,0.06)" }} />
                  <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "rgba(255,255,255,0.3)", fontWeight: 800, whiteSpace: "nowrap" }}>
                    READY TO GROW?
                  </div>
                  <div style={{ height: 1, flex: 1, background: "rgba(255,255,255,0.06)" }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: `repeat(${upsellPlans.length}, 1fr)`, gap: 12, marginBottom: 36 }}>
                  {upsellPlans.map((plan, i) => (
                    <div key={plan.id} style={{
                      background: "rgba(255,255,255,0.03)",
                      border: `1px solid ${plan.color}33`,
                      borderRadius: 14,
                      padding: "20px",
                      display: "flex",
                      flexDirection: "column",
                      position: "relative",
                    }}>
                      {i === upsellPlans.length - 1 && (
                        <div style={{ position: "absolute", top: -10, right: 14, background: plan.color, color: "#050510", fontSize: 8, fontWeight: 900, letterSpacing: "0.15em", padding: "3px 10px", borderRadius: 20 }}>
                          MOST POPULAR
                        </div>
                      )}
                      <div style={{ fontSize: 9, letterSpacing: "0.2em", color: plan.color, fontWeight: 800, marginBottom: 6 }}>
                        {plan.name.toUpperCase()}
                      </div>
                      <div style={{ fontSize: 24, fontWeight: 900, color: "#fff", marginBottom: 12 }}>
                        {plan.price}
                        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontWeight: 400 }}>{plan.interval}</span>
                      </div>
                      <ul style={{ margin: "0 0 auto", padding: "0 0 0 14px", fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 2, flex: 1 }}>
                        {plan.features.map((f) => <li key={f}>{f}</li>)}
                      </ul>
                      {plan.stripePriceId && (
                        <button
                          onClick={() => handleUpgrade(plan)}
                          disabled={!!changing || !isLiveStripePriceId(plan.stripePriceId)}
                          style={{
                            marginTop: 16,
                            padding: "10px 14px",
                            background: `${plan.color}22`,
                            border: `1px solid ${plan.color}55`,
                            borderRadius: 8,
                            color: plan.color,
                            fontWeight: 900,
                            fontSize: 10,
                            letterSpacing: "0.12em",
                            cursor: changing || !isLiveStripePriceId(plan.stripePriceId) ? "not-allowed" : "pointer",
                            opacity: changing === plan.id ? 0.5 : 1,
                          }}
                        >
                          {!isLiveStripePriceId(plan.stripePriceId)
                            ? "COMING SOON"
                            : changing === plan.id
                              ? "REDIRECTING..."
                              : "UPGRADE →"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* ── NO-ROLE FALLBACK / "EXPLORE ALL PLANS" ─────────────────────────── */}
        {(!userRole || !anchorPlan) && !loading && !current && (
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "16px 24px", marginBottom: 28, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
            No active subscription. Choose a plan below to get started.
          </div>
        )}

        {/* ── EXPLORE ALL PLANS (collapsible) ────────────────────────────────── */}
        <div style={{ marginTop: anchorPlan && !current ? 0 : 16 }}>
          <button
            onClick={() => setShowAll((v) => !v)}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.14)",
              color: "rgba(255,255,255,0.5)",
              padding: "10px 18px",
              borderRadius: 999,
              fontSize: 10,
              letterSpacing: "0.12em",
              fontWeight: 800,
              cursor: "pointer",
              marginBottom: 20,
            }}
          >
            {showAll ? "HIDE ALL PLANS" : "EXPLORE ALL PLANS"}
          </button>

          {showAll && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 14 }}>
              {[...PLANS]
                .filter((p) => p.price !== "$0")
                .sort((a, b) => planPriceValue(a) - planPriceValue(b))
                .map((plan) => (
                  <div key={plan.id} style={{
                    background: plan.id === anchorPlanId ? `${plan.color}10` : "rgba(255,255,255,0.025)",
                    border: `1px solid ${plan.id === anchorPlanId ? plan.color + "55" : plan.color + "22"}`,
                    borderRadius: 12,
                    padding: "18px",
                    display: "flex",
                    flexDirection: "column",
                  }}>
                    {plan.id === anchorPlanId && (
                      <div style={{ fontSize: 8, letterSpacing: "0.2em", color: plan.color, fontWeight: 900, marginBottom: 6 }}>
                        ★ YOUR ENTRY PLAN
                      </div>
                    )}
                    <div style={{ fontSize: 9, letterSpacing: "0.2em", color: plan.color, fontWeight: 800, marginBottom: 6 }}>
                      {plan.name.toUpperCase()}
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 2 }}>
                      {plan.price}
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontWeight: 400 }}>{plan.interval}</span>
                    </div>
                    <ul style={{ margin: "12px 0 auto", padding: "0 0 0 14px", fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 2, flex: 1 }}>
                      {plan.features.map((f) => <li key={f}>{f}</li>)}
                    </ul>
                    {plan.stripePriceId ? (
                      <button
                        onClick={() => handleUpgrade(plan)}
                        disabled={!!changing || !isLiveStripePriceId(plan.stripePriceId)}
                        style={{
                          marginTop: 14,
                          padding: "9px 14px",
                          background: plan.id === anchorPlanId
                            ? plan.color
                            : `${plan.color}22`,
                          border: `1px solid ${plan.color}44`,
                          borderRadius: 8,
                          color: plan.id === anchorPlanId ? "#050510" : plan.color,
                          fontWeight: 900,
                          fontSize: 10,
                          letterSpacing: "0.1em",
                          cursor: changing || !isLiveStripePriceId(plan.stripePriceId) ? "not-allowed" : "pointer",
                          opacity: changing === plan.id ? 0.5 : 1,
                        }}
                      >
                        {!isLiveStripePriceId(plan.stripePriceId)
                          ? "COMING SOON"
                          : changing === plan.id
                            ? "REDIRECTING..."
                            : "CHOOSE →"}
                      </button>
                    ) : (
                      <div style={{ marginTop: 14, padding: "9px", background: "rgba(255,255,255,0.03)", borderRadius: 8, color: "rgba(255,255,255,0.25)", fontSize: 10, textAlign: "center" }}>
                        CURRENT FREE TIER
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>

        <div style={{ marginTop: 40, fontSize: 11, color: "rgba(255,255,255,0.2)", textAlign: "center" }}>
          All plans billed monthly. Cancel anytime.{" "}
          <Link href="/support" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>Contact support</Link>
        </div>
      </div>
    </main>
  );
}
