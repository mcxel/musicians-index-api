"use client";

import { useState } from "react";
import Link from "next/link";

type CartItem = {
  id: string; name: string; type: string; price: number;
  qty: number; icon: string; color: string;
};

const DEMO_CART: CartItem[] = [
  { id: "e1", name: "Flame Emote Pack",       type: "EMOTE",   price: 4.99,  qty: 1, icon: "🔥", color: "#FF2DAA" },
  { id: "b1", name: "Wavetek – Hood Reports", type: "BEAT",    price: 29.99, qty: 1, icon: "🎵", color: "#00FFFF" },
  { id: "t1", name: "Zuri Bloom — Live Ticket",type: "TICKET",  price: 9.00,  qty: 2, icon: "🎟️", color: "#00FF88" },
];

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>(DEMO_CART);

  function remove(id: string) {
    setItems(prev => prev.filter(i => i.id !== id));
  }

  const subtotal = items.reduce((acc, i) => acc + i.price * i.qty, 0);
  const fee = +(subtotal * 0.03).toFixed(2);
  const total = +(subtotal + fee).toFixed(2);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px" }}>
        <Link href="/shop" style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>
          ← CONTINUE SHOPPING
        </Link>

        <h1 style={{ fontSize: 24, fontWeight: 900, marginTop: 20, marginBottom: 32 }}>Your Cart</h1>

        {items.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🛒</div>
            <p style={{ color: "rgba(255,255,255,0.35)", marginBottom: 24 }}>Your cart is empty.</p>
            <Link href="/shop" style={{ padding: "10px 24px", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "#050510", background: "linear-gradient(135deg,#00FFFF,#00AABB)", borderRadius: 8, textDecoration: "none" }}>
              BROWSE SHOP
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 32, alignItems: "start" }}>
            {/* Items */}
            <div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {items.map(item => (
                  <div key={item.id} style={{ display: "flex", gap: 14, alignItems: "center", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "16px 18px" }}>
                    <span style={{ fontSize: 28 }}>{item.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{item.name}</div>
                      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: item.color, marginTop: 2 }}>{item.type}</div>
                      {item.qty > 1 && <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>x{item.qty}</div>}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 15, fontWeight: 900, marginBottom: 8 }}>${(item.price * item.qty).toFixed(2)}</div>
                      <button onClick={() => remove(item.id)} style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", background: "none", border: "none", cursor: "pointer", letterSpacing: "0.1em" }}>
                        REMOVE
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 24, position: "sticky", top: 80 }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", marginBottom: 20 }}>ORDER SUMMARY</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
                  <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
                  <span>Platform fee (3%)</span><span>${fee.toFixed(2)}</span>
                </div>
                <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "6px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 900 }}>
                  <span>Total</span><span style={{ color: "#00FFFF" }}>${total.toFixed(2)}</span>
                </div>
              </div>
              <Link href="/checkout" style={{ display: "block", textAlign: "center", padding: "12px 0", fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", color: "#050510", background: "linear-gradient(135deg,#00FFFF,#00AABB)", borderRadius: 10, textDecoration: "none" }}>
                CHECKOUT →
              </Link>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", textAlign: "center", marginTop: 12 }}>
                Secure checkout via Stripe
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
