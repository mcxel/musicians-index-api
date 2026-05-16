"use client";

import { useState } from "react";
import Link from "next/link";

export default function CheckoutPage() {
  const [step, setStep] = useState<"review" | "payment" | "done" | "failed">("review");

  const ORDER = [
    { name: "Flame Emote Pack",       price: 4.99,  qty: 1 },
    { name: "Wavetek – Hood Reports", price: 29.99, qty: 1 },
    { name: "Zuri Bloom — Live Ticket",price: 9.00,  qty: 2 },
  ];
  const subtotal = ORDER.reduce((a, i) => a + i.price * i.qty, 0);
  const fee = +(subtotal * 0.03).toFixed(2);
  const total = +(subtotal + fee).toFixed(2);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 24px" }}>
        <Link href="/cart" style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>
          ← BACK TO CART
        </Link>

        <h1 style={{ fontSize: 24, fontWeight: 900, marginTop: 20, marginBottom: 8 }}>Checkout</h1>

        {/* Step indicator */}
        <div style={{ display: "flex", gap: 0, marginBottom: 36 }}>
          {["review","payment","done"].map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 900, background: step === s ? "#00FFFF" : (["review","payment","done"].indexOf(step) > i ? "rgba(0,255,255,0.2)" : "rgba(255,255,255,0.06)"), color: step === s ? "#050510" : "rgba(255,255,255,0.4)" }}>
                {i + 1}
              </div>
              {i < 2 && <div style={{ width: 40, height: 1, background: "rgba(255,255,255,0.08)" }} />}
            </div>
          ))}
          <div style={{ marginLeft: 16, fontSize: 10, color: "rgba(255,255,255,0.4)", alignSelf: "center", textTransform: "uppercase", letterSpacing: "0.12em" }}>
            {step === "review" ? "Order Review" : step === "payment" ? "Payment" : "Confirmed"}
          </div>
        </div>

        {step === "review" && (
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", fontWeight: 700, marginBottom: 16 }}>YOUR ORDER</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
              {ORDER.map(item => (
                <div key={item.name} style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10 }}>
                  <span style={{ fontSize: 13 }}>{item.name}{item.qty > 1 ? ` ×${item.qty}` : ""}</span>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>${(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 16px", color: "rgba(255,255,255,0.4)", fontSize: 11 }}>
                <span>Platform fee (3%)</span><span>${fee.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 16px", borderTop: "1px solid rgba(255,255,255,0.08)", fontSize: 16, fontWeight: 900 }}>
                <span>Total</span><span style={{ color: "#00FFFF" }}>${total.toFixed(2)}</span>
              </div>
            </div>
            <button onClick={() => setStep("payment")} style={{ width: "100%", padding: "14px 0", fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", color: "#050510", background: "linear-gradient(135deg,#00FFFF,#00AABB)", borderRadius: 10, border: "none", cursor: "pointer" }}>
              CONTINUE TO PAYMENT
            </button>
          </div>
        )}

        {step === "payment" && (
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", fontWeight: 700, marginBottom: 16 }}>PAYMENT METHOD</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 28 }}>
              <input type="text" placeholder="Card number" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "13px 16px", color: "#fff", fontSize: 14, outline: "none" }} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <input type="text" placeholder="MM / YY" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "13px 16px", color: "#fff", fontSize: 14, outline: "none" }} />
                <input type="text" placeholder="CVC" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "13px 16px", color: "#fff", fontSize: 14, outline: "none" }} />
              </div>
              <input type="text" placeholder="Name on card" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "13px 16px", color: "#fff", fontSize: 14, outline: "none" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", marginBottom: 20, fontSize: 15, fontWeight: 900, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <span>Total due</span><span style={{ color: "#00FFFF" }}>${total.toFixed(2)}</span>
            </div>
            <button onClick={() => setStep("done")} style={{ width: "100%", padding: "14px 0", fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", color: "#050510", background: "linear-gradient(135deg,#FFD700,#FF9500)", borderRadius: 10, border: "none", cursor: "pointer" }}>
              PAY ${total.toFixed(2)}
            </button>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", textAlign: "center", marginTop: 12 }}>
              🔒 Secured by Stripe
            </div>
            <div style={{ textAlign: "center", marginTop: 14 }}>
              <button onClick={() => setStep("failed")} style={{ fontSize: 8, color: "rgba(255,255,255,0.2)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
                Simulate payment failure
              </button>
            </div>
          </div>
        )}

        {step === "failed" && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>❌</div>
            <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 10, color: "#FF2DAA" }}>Payment Failed</h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 10, lineHeight: 1.6 }}>
              Your card was declined. No charge was made.
            </p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 32 }}>
              Please check your card details or try a different payment method.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={() => setStep("payment")}
                style={{ padding: "11px 24px", fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", color: "#050510", background: "linear-gradient(135deg,#FFD700,#FF9500)", borderRadius: 8, border: "none", cursor: "pointer" }}
              >
                TRY AGAIN
              </button>
              <Link href="/cart" style={{ padding: "11px 24px", fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", color: "#00FFFF", border: "1px solid rgba(0,255,255,0.3)", borderRadius: 8, textDecoration: "none" }}>
                BACK TO CART
              </Link>
            </div>
          </div>
        )}

        {step === "done" && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>✅</div>
            <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 10 }}>Order Confirmed!</h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 32 }}>
              Your order total of <strong style={{ color: "#00FFFF" }}>${total.toFixed(2)}</strong> has been processed.
              Check your email for a receipt.
            </p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/hub" style={{ padding: "10px 22px", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "#050510", background: "linear-gradient(135deg,#00FFFF,#00AABB)", borderRadius: 8, textDecoration: "none" }}>
                GO TO HUB
              </Link>
              <Link href="/shop" style={{ padding: "10px 22px", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "#00FFFF", border: "1px solid rgba(0,255,255,0.3)", borderRadius: 8, textDecoration: "none" }}>
                KEEP SHOPPING
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
