"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CanonicalCartRuntime, type CartState } from "@/lib/commerce/CanonicalCartRuntime";
import { findStoreItemById, findStoreItemByPriceId } from "@/lib/store/StoreItemEngine";
import { useAuth } from "@/lib/hooks/useAuth";

export default function CartPage() {
  const { user, isLoading: authLoading } = useAuth();
  const userId = user?.id ?? null;
  const cartId = userId ? `cart-${userId}` : "cart-guest";
  const [cartState, setCartState] = useState<CartState | null>(null);

  useEffect(() => {
    setCartState(CanonicalCartRuntime.getOrCreateCart(cartId, userId ?? undefined));
  }, [cartId, userId]);

  const items = cartState?.items ?? [];
  const subtotalCents = cartState?.subtotalCents ?? 0;
  const totalCents = cartState?.totalCents ?? 0;

  function handleRemove(skuId: string) {
    const updated = CanonicalCartRuntime.removeItem(cartId, skuId);
    setCartState({ ...updated });
  }

  async function handleCheckout() {
    if (!cartState || cartState.items.length === 0) return;
    const payload = {
      items: cartState.items.map((item) => {
        const fromPrefix = item.skuId.startsWith("STORE_ITEM:")
          ? item.skuId.slice("STORE_ITEM:".length)
          : null;
        const storeItem =
          (fromPrefix ? findStoreItemById(fromPrefix) : undefined) ??
          findStoreItemByPriceId(item.skuId) ??
          findStoreItemById(item.skuId);
        return {
          itemId: storeItem?.id ?? item.skuId,
          qty: item.quantity,
        };
      }),
    };
    const res = await fetch("/api/store/checkout", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (data?.url) {
      window.location.href = data.url;
      return;
    }
    if (cartState.items[0]) {
      window.location.href = `/api/stripe/checkout?priceId=${encodeURIComponent(cartState.items[0].skuId)}&mode=payment`;
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px" }}>
        <Link href="/store" style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>
          ← CONTINUE SHOPPING
        </Link>

        <h1 style={{ fontSize: 24, fontWeight: 900, marginTop: 20, marginBottom: 32 }}>Your Cart</h1>

        {authLoading ? (
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Loading cart…</p>
        ) : items.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🛒</div>
            <p style={{ color: "rgba(255,255,255,0.35)", marginBottom: 24 }}>Your cart is empty.</p>
            <Link href="/store" style={{ padding: "10px 24px", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "#050510", background: "linear-gradient(135deg,#00FFFF,#00AABB)", borderRadius: 8, textDecoration: "none" }}>
              BROWSE STORE
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 32, alignItems: "start" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {items.map((item) => (
                <div key={item.skuId} style={{ display: "flex", gap: 14, alignItems: "center", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "16px 18px" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{item.title}</div>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: "#00FFFF", marginTop: 2 }}>{item.category.toUpperCase()}</div>
                    {item.quantity > 1 && <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>x{item.quantity}</div>}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 15, fontWeight: 900, marginBottom: 8 }}>${((item.unitPriceCents * item.quantity) / 100).toFixed(2)}</div>
                    <button onClick={() => handleRemove(item.skuId)} style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", background: "none", border: "none", cursor: "pointer", letterSpacing: "0.1em" }}>
                      REMOVE
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 24, position: "sticky", top: 80 }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", marginBottom: 20 }}>ORDER SUMMARY</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
                  <span>Subtotal</span><span>${(subtotalCents / 100).toFixed(2)}</span>
                </div>
                <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "6px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 900 }}>
                  <span>Total</span><span style={{ color: "#00FFFF" }}>${(totalCents / 100).toFixed(2)}</span>
                </div>
              </div>
              <button onClick={handleCheckout} style={{ display: "block", width: "100%", textAlign: "center", padding: "12px 0", fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", color: "#050510", background: "linear-gradient(135deg,#00FFFF,#00AABB)", borderRadius: 10, border: "none", cursor: "pointer" }}>
                CHECKOUT →
              </button>
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
