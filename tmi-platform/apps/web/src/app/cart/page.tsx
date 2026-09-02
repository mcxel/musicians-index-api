"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";

interface CartItemView {
  itemId: string;
  name: string;
  icon: string;
  category: string;
  quantity: number;
  unitPriceCents: number;
  priceChanged: boolean;
}

interface CartResponse {
  authenticated: boolean;
  items: CartItemView[];
  subtotalCents: number;
  itemCount: number;
}

const EMPTY_CART: CartResponse = { authenticated: false, items: [], subtotalCents: 0, itemCount: 0 };

export default function CartPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [cart, setCart] = useState<CartResponse>(EMPTY_CART);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const loadCart = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cart", { credentials: "include", cache: "no-store" });
      const data = (await res.json()) as CartResponse;
      setCart(data);
    } catch {
      setCart(EMPTY_CART);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    void loadCart();
  }, [authLoading, user?.id, loadCart]);

  async function updateQuantity(itemId: string, quantity: number) {
    const res = await fetch("/api/cart/items", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, quantity }),
    });
    const data = (await res.json()) as CartResponse & { ok?: boolean };
    if (data.ok) setCart(data);
  }

  async function removeItem(itemId: string) {
    const res = await fetch("/api/cart/items", {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId }),
    });
    const data = (await res.json()) as CartResponse & { ok?: boolean };
    if (data.ok) setCart(data);
  }

  async function handleCheckout() {
    setNotice(null);
    setCheckingOut(true);
    try {
      const res = await fetch("/api/cart/checkout", { method: "POST", credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (res.status === 409 && data.error === "cart_prices_changed") {
        setNotice("Some prices changed since you added these items — updated below. Review and try again.");
        await loadCart();
        return;
      }
      if (res.status === 409 && data.error === "cart_items_unavailable") {
        setNotice("Some items are no longer available and were removed. Review your cart and try again.");
        await loadCart();
        return;
      }
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      setNotice(data?.error ?? "Checkout failed — try again.");
    } catch {
      setNotice("Checkout failed — try again.");
    } finally {
      setCheckingOut(false);
    }
  }

  const items = cart.items;
  const subtotalCents = cart.subtotalCents;
  const isSignedIn = Boolean(user?.id);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px" }}>
        <Link href="/store" style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>
          ← CONTINUE SHOPPING
        </Link>

        <h1 style={{ fontSize: 24, fontWeight: 900, marginTop: 20, marginBottom: 8 }}>Your Cart</h1>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 32 }}>
          Saved to your account — the same cart on any device you sign in from.
        </p>

        {notice && (
          <div style={{ background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 12, color: "#FFD700" }}>
            {notice}
          </div>
        )}

        {authLoading || loading ? (
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Loading cart…</p>
        ) : !isSignedIn ? (
          <div style={{ textAlign: "center", padding: 60 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🛒</div>
            <p style={{ color: "rgba(255,255,255,0.35)", marginBottom: 24 }}>Sign in to use your cart.</p>
            <Link href="/login?next=/cart" style={{ padding: "10px 24px", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "#050510", background: "linear-gradient(135deg,#00FFFF,#00AABB)", borderRadius: 8, textDecoration: "none" }}>
              SIGN IN
            </Link>
          </div>
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
                <div key={item.itemId} style={{ display: "flex", gap: 14, alignItems: "center", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "16px 18px" }}>
                  <div style={{ fontSize: 26 }}>{item.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{item.name}</div>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: "#00FFFF", marginTop: 2 }}>{item.category.toUpperCase()}</div>
                    {item.priceChanged && (
                      <div style={{ fontSize: 10, color: "#FFD700", marginTop: 2 }}>Price updated since added</div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                      <button
                        onClick={() => void updateQuantity(item.itemId, item.quantity - 1)}
                        style={{ width: 22, height: 22, borderRadius: 6, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.04)", color: "#fff", cursor: "pointer", fontSize: 12 }}
                      >
                        −
                      </button>
                      <span style={{ fontSize: 12, minWidth: 16, textAlign: "center" }}>{item.quantity}</span>
                      <button
                        onClick={() => void updateQuantity(item.itemId, item.quantity + 1)}
                        style={{ width: 22, height: 22, borderRadius: 6, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.04)", color: "#fff", cursor: "pointer", fontSize: 12 }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 15, fontWeight: 900, marginBottom: 8 }}>${((item.unitPriceCents * item.quantity) / 100).toFixed(2)}</div>
                    <button onClick={() => void removeItem(item.itemId)} style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", background: "none", border: "none", cursor: "pointer", letterSpacing: "0.1em" }}>
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
                  <span>Total</span><span style={{ color: "#00FFFF" }}>${(subtotalCents / 100).toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={() => void handleCheckout()}
                disabled={checkingOut}
                style={{ display: "block", width: "100%", textAlign: "center", padding: "12px 0", fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", color: "#050510", background: "linear-gradient(135deg,#00FFFF,#00AABB)", borderRadius: 10, border: "none", cursor: checkingOut ? "wait" : "pointer" }}
              >
                {checkingOut ? "…" : "CHECKOUT →"}
              </button>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", textAlign: "center", marginTop: 12 }}>
                Secure checkout via Stripe · Price re-verified at checkout
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
