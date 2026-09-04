"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSubscriptionProduct } from "@/lib/stripe/products";

// Real Fan/Performer PRO+RUBY products from the canonical registry
// (@/lib/stripe/products.ts) — this page previously carried its own
// isolated tier structure ("Fan Pass $2.99", "Artist $9.99", "VIP Diamond
// $14.99") with literal placeholder price IDs matching no real Stripe
// object, and a hardcoded `current: true` badge that didn't reflect any
// real subscription state (Lane A, 2026-09-01). No "current plan" badge is
// shown here — the only existing current-subscription lookup in this
// codebase (`/api/stripe/customer`) proxies to an external API host that is
// not deployed, so claiming to know a real "current" plan here would just
// be a different flavor of the same fake-data problem.
const FAN_PRO = getSubscriptionProduct("fan", "PRO");
const FAN_RUBY = getSubscriptionProduct("fan", "RUBY");
const PERF_PRO = getSubscriptionProduct("performer", "PRO");
const PERF_RUBY = getSubscriptionProduct("performer", "RUBY");

const PLANS = [
  { id: "free",        label: "Free",              price: "$0/mo",                                    perks: ["Basic feed access", "Vote in battles", "5 tips/mo"], priceId: null as string | null, amount: 0 },
  { id: "fan-pro",     label: "Fan Pro",            price: `$${(FAN_PRO.price / 100).toFixed(2)}/mo`,   perks: [...FAN_PRO.features],   priceId: FAN_PRO.priceId,   amount: FAN_PRO.price },
  { id: "fan-ruby",    label: "Fan Ruby",           price: `$${(FAN_RUBY.price / 100).toFixed(2)}/mo`,  perks: [...FAN_RUBY.features],  priceId: FAN_RUBY.priceId,  amount: FAN_RUBY.price },
  { id: "performer-pro",  label: "Performer Pro",   price: `$${(PERF_PRO.price / 100).toFixed(2)}/mo`,  perks: [...PERF_PRO.features],  priceId: PERF_PRO.priceId,  amount: PERF_PRO.price },
  { id: "performer-ruby", label: "Performer Ruby",  price: `$${(PERF_RUBY.price / 100).toFixed(2)}/mo`, perks: [...PERF_RUBY.features], priceId: PERF_RUBY.priceId, amount: PERF_RUBY.price },
];

export default function SettingsBillingPage() {
  const router = useRouter();

  function selectPlan(p: typeof PLANS[0]) {
    if (p.id === "free" || !p.priceId) {
      // Downgrade — no Stripe charge needed, just navigate
      router.push("/settings?notice=downgraded");
      return;
    }
    const params = new URLSearchParams({
      priceId: p.priceId,
      amount: String(p.amount),
      productName: `TMI ${p.label} Plan`,
      mode: "subscription",
    });
    router.push("/api/stripe/checkout?" + params.toString());
  }

  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "32px 24px 80px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 780, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <Link href="/settings" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Settings</Link>
        </div>
        <div style={{ fontSize: 10, letterSpacing: 5, color: "#00FFFF", fontWeight: 800, marginBottom: 4 }}>SETTINGS</div>
        <h1 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, margin: "0 0 32px" }}>Billing & Subscription</h1>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 14, marginBottom: 32 }}>
          {PLANS.map((p) => (
            <div key={p.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "22px" }}>
              <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 4 }}>{p.label}</div>
              <div style={{ fontWeight: 800, fontSize: 18, color: "rgba(255,255,255,0.7)", marginBottom: 14 }}>{p.price}</div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px", display: "grid", gap: 6 }}>
                {p.perks.map((perk) => <li key={perk} style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>✓ {perk}</li>)}
              </ul>
              <button onClick={() => selectPlan(p)} style={{ width: "100%", padding: "10px", borderRadius: 8, background: "#00FFFF", color: "#05060c", fontWeight: 800, fontSize: 12, cursor: "pointer", border: "none" }}>
                {p.id === "free" ? "Downgrade" : "Switch to this plan"}
              </button>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <Link href="/wallet" style={{ fontSize: 12, color: "#00FFFF", textDecoration: "none", fontWeight: 700 }}>My Wallet →</Link>
          <Link href="/subscriptions" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Subscription History</Link>
        </div>
      </div>
    </main>
  );
}
