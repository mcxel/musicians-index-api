"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface OrderItem {
  name: string;
  price: number;
  qty: number;
  priceId?: string;
  mode?: "subscription" | "payment";
}

type Step = "review" | "redirecting" | "done" | "failed" | "canceled" | "empty";

export default function CheckoutPage() {
  const params = useSearchParams();
  const [step, setStep] = useState<Step>("review");
  const [items, setItems] = useState<OrderItem[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!params) return;
    // Handle Stripe return states
    if (params.get("success") === "true") { setStep("done"); return; }
    if (params.get("canceled") === "true") { setStep("canceled"); return; }
    const notice = params.get("notice");
    if (notice === "stripe-pending") { setErrorMsg("Payments are coming online shortly — your selection has been saved."); setStep("failed"); return; }
    if (notice === "stripe-paused") { setErrorMsg("Payments are temporarily paused. Please try again in a few minutes."); setStep("failed"); return; }
    if (notice === "checkout-error") { setErrorMsg("An error occurred creating your checkout session. Please try again."); setStep("failed"); return; }
    if (notice === "price-not-configured") { setErrorMsg("This product price is being finalized. Contact support if you need help."); setStep("failed"); return; }

    // Build order from URL params
    const built: OrderItem[] = [];

    // Single-item params: ?priceId=...&productName=...&amount=...&mode=...
    const priceId = params.get("priceId");
    const productName = params.get("productName") ?? params.get("name");
    const amountStr = params.get("amount");
    const mode = (params.get("mode") ?? "payment") as "subscription" | "payment";
    if (priceId && productName) {
      const amount = amountStr ? parseInt(amountStr, 10) / 100 : 0;
      built.push({ name: productName, price: amount, qty: 1, priceId, mode });
    }

    // Tip-specific params: ?type=tip&artist=...&amount=...
    if (params.get("type") === "tip" && params.get("artist")) {
      const tipAmount = amountStr ? parseInt(amountStr, 10) / 100 : 5;
      built.push({ name: `Tip for @${params.get("artist")}`, price: tipAmount, qty: 1, priceId: "tip", mode: "payment" });
    }

    // Membership shortcut: ?product=membership-pro etc
    const product = params.get("product");
    if (product && built.length === 0) {
      const MEMBERSHIP_LABELS: Record<string, { name: string; price: number; priceId: string; mode: "subscription" | "payment" }> = {
        "membership-pro":      { name: "PRO Membership",      price: 9.99,  priceId: "price_pro_monthly",      mode: "subscription" },
        "membership-ruby":     { name: "RUBY Membership",     price: 19.99, priceId: "price_ruby_monthly",     mode: "subscription" },
        "membership-silver":   { name: "SILVER Membership",   price: 29.99, priceId: "price_silver_monthly",   mode: "subscription" },
        "membership-gold":     { name: "GOLD Membership",     price: 49.99, priceId: "price_gold_monthly",     mode: "subscription" },
        "membership-platinum": { name: "PLATINUM Membership", price: 79.99, priceId: "price_platinum_monthly", mode: "subscription" },
        "membership-diamond":  { name: "DIAMOND Membership",  price: 149.99, priceId: "price_diamond_monthly", mode: "subscription" },
        "season-pass-fan":     { name: "Season Pass — FAN",    price: 29.99, priceId: "price_fan_monthly",  mode: "subscription" },
        "season-pass-artist":  { name: "Season Pass — ARTIST", price: 59.99, priceId: "price_artist_monthly", mode: "subscription" },
        "season-pass-vip":     { name: "Season Pass — VIP",    price: 99.99, priceId: "price_vip_monthly",   mode: "subscription" },
      };
      const def = MEMBERSHIP_LABELS[product];
      if (def) built.push({ name: def.name, price: def.price, qty: 1, priceId: def.priceId, mode: def.mode });
    }

    if (built.length === 0) { setStep("empty"); return; }
    setItems(built);
  }, [params]);

  const subtotal = items.reduce((a, i) => a + i.price * i.qty, 0);
  const fee = +(subtotal * 0.03).toFixed(2);
  const total = +(subtotal + fee).toFixed(2);
  const primaryItem = items[0];
  const isSubscription = primaryItem?.mode === "subscription";

  const handlePay = async () => {
    if (!primaryItem || !params) return;
    setStep("redirecting");

    // Tip flow: POST to create session, then redirect
    const tipArtist = params.get("artist");
    if (params.get("type") === "tip" && tipArtist) {
      const amountCents = Math.round((primaryItem.price || 5) * 100);
      try {
        const res = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product: "TIP", artistSlug: tipArtist, amount: amountCents, roomId: params.get("room") ?? "" }),
        });
        const data = await res.json() as { url?: string; error?: string };
        if (data.url) { window.location.href = data.url; return; }
        throw new Error(data.error ?? "No session URL");
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Payment setup failed.");
        setStep("failed");
        return;
      }
    }

    // Standard flow: GET redirect via API route (creates session + redirects to Stripe hosted)
    const priceId = primaryItem.priceId ?? "";
    const amountCents = Math.round(primaryItem.price * 100);
    const mode = primaryItem.mode ?? "payment";
    const name = encodeURIComponent(primaryItem.name);
    window.location.href = `/api/stripe/checkout?priceId=${encodeURIComponent(priceId)}&mode=${mode}&amount=${amountCents}&productName=${name}`;
  };

  const accentCyan = "#00FFFF";
  const accentGold = "#FFD700";
  const bg = { minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 };
  const wrap = { maxWidth: 680, margin: "0 auto", padding: "40px 24px" } as const;
  const back = { fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textDecoration: "none" } as const;
  const card = { padding: "14px 18px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 };

  if (step === "empty") return (
    <main style={bg}><div style={wrap}>
      <Link href="/shop" style={back}>← BACK TO SHOP</Link>
      <h1 style={{ fontSize: 22, fontWeight: 900, marginTop: 20 }}>No Items Selected</h1>
      <p style={{ color: "rgba(255,255,255,0.45)", marginTop: 8 }}>Choose something from the shop, membership page, or live room to start a checkout.</p>
      <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap" }}>
        <Link href="/pricing" style={{ padding: "11px 22px", background: accentCyan, color: "#050310", borderRadius: 8, fontSize: 10, fontWeight: 900, textDecoration: "none" }}>MEMBERSHIPS</Link>
        <Link href="/shop" style={{ padding: "11px 22px", border: `1px solid ${accentCyan}44`, color: accentCyan, borderRadius: 8, fontSize: 10, fontWeight: 900, textDecoration: "none" }}>SHOP</Link>
        <Link href="/credits" style={{ padding: "11px 22px", border: `1px solid ${accentGold}44`, color: accentGold, borderRadius: 8, fontSize: 10, fontWeight: 900, textDecoration: "none" }}>CREDITS</Link>
      </div>
    </div></main>
  );

  if (step === "redirecting") return (
    <main style={bg}><div style={{ ...wrap, textAlign: "center", paddingTop: 100 }}>
      <div style={{ fontSize: 48, marginBottom: 20 }}>🔒</div>
      <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 10 }}>Redirecting to Stripe…</h2>
      <p style={{ color: "rgba(255,255,255,0.45)" }}>You&apos;ll be taken to a secure Stripe payment page.</p>
    </div></main>
  );

  if (step === "done") return (
    <main style={bg}><div style={{ ...wrap, textAlign: "center", paddingTop: 60 }}>
      <div style={{ fontSize: 64, marginBottom: 20 }}>✅</div>
      <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 10 }}>Payment Confirmed!</h2>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 32, lineHeight: 1.6 }}>
        Your payment was successful. Check your email for a receipt.
        {isSubscription && " Your membership is now active."}
      </p>
      <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
        <Link href="/hub" style={{ padding: "12px 28px", fontSize: 10, fontWeight: 900, letterSpacing: "0.12em", color: "#050310", background: `linear-gradient(135deg,${accentCyan},#00AABB)`, borderRadius: 8, textDecoration: "none" }}>GO TO HUB</Link>
        <Link href="/home/1" style={{ padding: "12px 28px", fontSize: 10, fontWeight: 900, letterSpacing: "0.12em", color: accentCyan, border: `1px solid ${accentCyan}44`, borderRadius: 8, textDecoration: "none" }}>HOME</Link>
      </div>
    </div></main>
  );

  if (step === "canceled") return (
    <main style={bg}><div style={{ ...wrap, textAlign: "center", paddingTop: 60 }}>
      <div style={{ fontSize: 64, marginBottom: 20 }}>↩</div>
      <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 10 }}>Payment Canceled</h2>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 32 }}>No charge was made. You can try again whenever you&apos;re ready.</p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <Link href="/pricing" style={{ padding: "11px 24px", fontSize: 10, fontWeight: 800, color: "#050310", background: accentCyan, borderRadius: 8, textDecoration: "none" }}>VIEW MEMBERSHIPS</Link>
        <Link href="/home/1" style={{ padding: "11px 24px", fontSize: 10, fontWeight: 800, color: accentCyan, border: `1px solid ${accentCyan}44`, borderRadius: 8, textDecoration: "none" }}>HOME</Link>
      </div>
    </div></main>
  );

  if (step === "failed") return (
    <main style={bg}><div style={{ ...wrap, textAlign: "center", paddingTop: 60 }}>
      <div style={{ fontSize: 64, marginBottom: 20 }}>⚠️</div>
      <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 10, color: "#FF2DAA" }}>Payment Issue</h2>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 10, lineHeight: 1.6 }}>{errorMsg || "An unexpected error occurred."}</p>
      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginBottom: 32 }}>No charge was made. Contact <a href="/support" style={{ color: accentCyan }}>support</a> if this continues.</p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <button onClick={() => setStep("review")} style={{ padding: "11px 24px", fontSize: 10, fontWeight: 800, color: "#050310", background: accentGold, borderRadius: 8, border: "none", cursor: "pointer" }}>TRY AGAIN</button>
        <Link href="/home/1" style={{ padding: "11px 24px", fontSize: 10, fontWeight: 800, color: accentCyan, border: `1px solid ${accentCyan}44`, borderRadius: 8, textDecoration: "none" }}>HOME</Link>
      </div>
    </div></main>
  );

  // ── Review step ──────────────────────────────────────────────────────────────
  return (
    <main style={bg}>
      <div style={wrap}>
        <Link href="/shop" style={back}>← BACK</Link>
        <h1 style={{ fontSize: 24, fontWeight: 900, marginTop: 20, marginBottom: 8 }}>Checkout</h1>

        {/* Step indicator */}
        <div style={{ display: "flex", gap: 0, marginBottom: 36 }}>
          {["review","payment"].map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 900, background: i === 0 ? accentCyan : "rgba(255,255,255,0.06)", color: i === 0 ? "#050310" : "rgba(255,255,255,0.35)" }}>
                {i + 1}
              </div>
              {i < 1 && <div style={{ width: 40, height: 1, background: "rgba(255,255,255,0.08)" }} />}
            </div>
          ))}
          <div style={{ marginLeft: 16, fontSize: 10, color: "rgba(255,255,255,0.4)", alignSelf: "center", textTransform: "uppercase", letterSpacing: "0.12em" }}>
            Order Review
          </div>
        </div>

        {/* Order items */}
        <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", fontWeight: 700, marginBottom: 14 }}>YOUR ORDER</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
          {items.map(item => (
            <div key={item.name} style={{ ...card, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{item.name}{item.qty > 1 ? ` ×${item.qty}` : ""}</div>
                {item.mode === "subscription" && <div style={{ fontSize: 10, color: "rgba(0,255,255,0.7)", marginTop: 2 }}>Monthly subscription — cancel anytime</div>}
              </div>
              <div style={{ fontSize: 15, fontWeight: 900, color: accentCyan }}>${(item.price * item.qty).toFixed(2)}</div>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 18px", color: "rgba(255,255,255,0.35)", fontSize: 11 }}>
            <span>Platform fee (3%)</span><span>${fee.toFixed(2)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 18px", borderTop: "1px solid rgba(255,255,255,0.08)", fontSize: 18, fontWeight: 900 }}>
            <span>Total{isSubscription ? "/mo" : ""}</span>
            <span style={{ color: accentCyan }}>${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Stripe redirect button */}
        <button
          onClick={() => void handlePay()}
          style={{ width: "100%", padding: "16px 0", fontSize: 12, fontWeight: 900, letterSpacing: "0.18em", color: "#050310", background: `linear-gradient(135deg,${accentGold},#FF9500)`, borderRadius: 12, border: "none", cursor: "pointer", boxShadow: `0 0 28px ${accentGold}44` }}
        >
          {isSubscription ? `SUBSCRIBE — $${total.toFixed(2)}/mo` : `PAY $${total.toFixed(2)}`}
        </button>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 12 }}>
          <span style={{ fontSize: 14 }}>🔒</span>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: "0.08em" }}>SECURED BY STRIPE — YOUR CARD IS NEVER STORED ON TMI</span>
        </div>
        <div style={{ marginTop: 24, fontSize: 10, color: "rgba(255,255,255,0.2)", lineHeight: 1.7, textAlign: "center" }}>
          By continuing you agree to our{" "}
          <Link href="/terms" style={{ color: "rgba(0,255,255,0.5)" }}>Terms of Service</Link>{" "}
          and{" "}
          <Link href="/refund-policy" style={{ color: "rgba(0,255,255,0.5)" }}>Refund Policy</Link>.
          {isSubscription && " You can cancel your subscription at any time from your account settings."}
        </div>
      </div>
    </main>
  );
}
