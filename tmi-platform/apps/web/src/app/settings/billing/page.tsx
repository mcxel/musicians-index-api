"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

const PLANS = [
  { id: "free",     label: "Free",       price: "$0/mo",   perks: ["Basic feed access", "Vote in battles", "5 tips/mo"],                                              current: false, priceId: "price_free",            amount: 0    },
  { id: "fan-pass", label: "Fan Pass",   price: "$2.99/mo", perks: ["Unlimited voting", "XP multiplier x1.5", "Fan Club access", "Exclusive emotes"],                current: true,  priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_FAN_MONTHLY     ?? "price_fan_monthly",    amount: 299  },
  { id: "artist",   label: "Artist",     price: "$9.99/mo", perks: ["Go live", "Battle entry", "Beat Vault upload", "Mint NFTs", "Revenue dashboard"],                current: false, priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ARTIST_MONTHLY  ?? "price_artist_monthly",  amount: 999  },
  { id: "vip",      label: "VIP Diamond",price: "$14.99/mo",perks: ["All Artist perks", "Diamond badge", "Front-row seats", "Priority matchmaking", "VIP Lounge"],  current: false, priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_VIP_MONTHLY     ?? "price_vip_monthly",     amount: 1499 },
];

export default function SettingsBillingPage() {
  const router = useRouter();

  function selectPlan(p: typeof PLANS[0]) {
    if (p.id === "free" || p.amount === 0) {
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
            <div key={p.id} style={{ background: p.current ? "rgba(0,255,255,0.05)" : "rgba(255,255,255,0.02)", border: `1px solid ${p.current ? "rgba(0,255,255,0.3)" : "rgba(255,255,255,0.08)"}`, borderRadius: 14, padding: "22px" }}>
              {p.current && <div style={{ fontSize: 8, fontWeight: 900, color: "#00FFFF", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>CURRENT PLAN</div>}
              <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 4 }}>{p.label}</div>
              <div style={{ fontWeight: 800, fontSize: 18, color: p.current ? "#00FFFF" : "rgba(255,255,255,0.7)", marginBottom: 14 }}>{p.price}</div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px", display: "grid", gap: 6 }}>
                {p.perks.map((perk) => <li key={perk} style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>✓ {perk}</li>)}
              </ul>
              {!p.current && (
                <button onClick={() => selectPlan(p)} style={{ width: "100%", padding: "10px", borderRadius: 8, background: "#00FFFF", color: "#05060c", fontWeight: 800, fontSize: 12, cursor: "pointer", border: "none" }}>
                  {p.id === "free" ? "Downgrade" : "Upgrade"}
                </button>
              )}
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
