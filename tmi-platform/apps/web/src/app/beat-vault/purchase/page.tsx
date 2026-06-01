"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

function PurchaseContent() {
  const params = useSearchParams();
  const router = useRouter();
  const title    = params.get("title") ?? "Beat";
  const producer = params.get("producer") ?? "Producer";
  const price    = parseInt(params.get("price") ?? "0", 10);

  function handlePay() {
    const qs = new URLSearchParams({
      priceId: "price_beat_basic",
      amount: String(price * 100),
      productName: `Beat: ${title} by ${producer}`,
      mode: "payment",
    });
    router.push(`/api/stripe/checkout?${qs.toString()}`);
  }

  return (
    <main style={{ minHeight: "100vh", background: "#07071a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 440, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎛️</div>
        <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#00FF88", fontWeight: 900, marginBottom: 8 }}>BEAT VAULT PURCHASE</div>
        <h1 style={{ fontSize: 24, fontWeight: 900, margin: "0 0 8px" }}>{title}</h1>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginBottom: 28 }}>by {producer}</p>
        <div style={{ background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.2)", borderRadius: 14, padding: "24px", marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>TOTAL</div>
          <div style={{ fontSize: 40, fontWeight: 900, color: "#00FF88" }}>${price}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>one-time license fee</div>
        </div>
        <button
          onClick={handlePay}
          style={{ width: "100%", padding: "14px", background: "#00FF88", color: "#07071a", border: "none", borderRadius: 10, fontWeight: 900, fontSize: 14, cursor: "pointer", letterSpacing: "0.1em", marginBottom: 12 }}
        >
          PAY WITH STRIPE
        </button>
        <button
          onClick={() => router.back()}
          style={{ width: "100%", padding: "12px", background: "transparent", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer" }}
        >
          Cancel
        </button>
        <p style={{ marginTop: 20, fontSize: 10, color: "rgba(255,255,255,0.25)" }}>Secured by Stripe · Instant license delivery</p>
      </div>
    </main>
  );
}

export default function BeatPurchasePage() {
  return (
    <Suspense>
      <PurchaseContent />
    </Suspense>
  );
}
