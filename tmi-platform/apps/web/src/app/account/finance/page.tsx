"use client";

/**
 * Account Finance Hub — Master Financial, Commerce, & Ownership Dashboard.
 *
 * User-facing Name: Account Settings → Billing & Money
 * Technical Engine: /api/account/purchases (real Prisma-backed ownership —
 * venue skins, media chassis, season passes, subscription tier, orders) +
 * /api/cart (persistent, server-authoritative, price-revalidated-at-checkout cart).
 * Identity comes from the canonical useAuth() session — never a hardcoded
 * userId. This is the account checkpoint every real Stripe-webhook-fulfilled
 * purchase must show up in.
 *
 * Sections:
 *   1. OVERVIEW: Key financial metrics (Plan, Cart, Purchases)
 *   2. CART: Canonical cart drawer & checkout trigger
 *   3. BILLING: Subscription management & Customer Portal integration
 *   4. PURCHASES: Real, provenance-filtered ownership (Rule 20 — no fake seed items)
 *   5. WALLET & PAYOUTS: TMI Points ledger, earnings balance, & Stripe Connect setup
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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

interface CartView {
  authenticated: boolean;
  items: CartItemView[];
  subtotalCents: number;
  itemCount: number;
}

const EMPTY_CART: CartView = { authenticated: false, items: [], subtotalCents: 0, itemCount: 0 };

interface AccountEntitlement {
  id: string;
  title: string;
  category: string;
  provenance: string;
  obtainedAt: number | string;
}

interface AccountOrder {
  id: string;
  createdAt: string;
  provider: string | null;
  amountCents: number | null;
  currency: string | null;
  status: string | null;
}

interface AccountPurchasesResponse {
  authenticated: boolean;
  userId?: string;
  tier?: string;
  subscriptionRenewsAt?: string | null;
  stripeConnected?: boolean;
  ownedVenueSkins?: { skinId: string; sku: string; priceCents: number; rarity: string; unlockedVia: string | null }[];
  ownedChassis?: { chassisId: string; unlockedVia: string; purchasedAt: string }[];
  seasonPasses?: { name: string; tier: string; endDate: string; purchasedAt: string }[];
  ownedStoreItems?: { itemId: string; title: string; category: string; purchasedAt: string; pricePaidCents: number }[];
  recentOrders?: AccountOrder[];
}

const CYAN = "#00FFFF";
const FUCHSIA = "#FF2DAA";
const GOLD = "#FFD700";
const GREEN = "#00FF88";

export default function AccountFinanceHubPage() {
  const searchParams = useSearchParams();
  const tabParam = searchParams?.get("tab");
  const initialTab =
    tabParam === "cart" || tabParam === "billing" || tabParam === "purchases" || tabParam === "wallet"
      ? tabParam
      : "overview";
  const [activeTab, setActiveTab] = useState<"overview" | "cart" | "billing" | "purchases" | "wallet">(initialTab);
  const { user, isLoading: authLoading } = useAuth();
  const userId = user?.id ?? null;
  const [cart, setCart] = useState<CartView>(EMPTY_CART);
  const [purchases, setPurchases] = useState<AccountPurchasesResponse | null>(null);
  const [purchasesLoading, setPurchasesLoading] = useState(true);
  const [provenanceFilter, setProvenanceFilter] = useState<string>("ALL");
  const [checkingOut, setCheckingOut] = useState(false);
  const [cartNotice, setCartNotice] = useState<string | null>(null);

  // Cart is real, persistent, server-authoritative (/api/cart) — no fake
  // seed data, starts genuinely empty until add-to-cart feeds it, and is the
  // same cart on any device the user signs in from.
  useEffect(() => {
    if (tabParam === "cart" || tabParam === "billing" || tabParam === "purchases" || tabParam === "wallet") {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const loadCart = useCallback(async () => {
    if (!userId) {
      setCart(EMPTY_CART);
      return;
    }
    try {
      const res = await fetch("/api/cart", { credentials: "include", cache: "no-store" });
      const data = (await res.json()) as CartView;
      setCart(data);
    } catch {
      setCart(EMPTY_CART);
    }
  }, [userId]);

  useEffect(() => {
    if (authLoading) return;
    void loadCart();
  }, [authLoading, userId, loadCart]);

  // Real purchases/ownership, fetched from the canonical account checkpoint —
  // the same Prisma tables the Stripe webhook actually writes to. No seeding.
  useEffect(() => {
    if (authLoading) return;
    if (!userId) {
      setPurchases({ authenticated: false });
      setPurchasesLoading(false);
      return;
    }
    let cancelled = false;
    setPurchasesLoading(true);
    fetch("/api/account/purchases", { credentials: "include", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { authenticated: false }))
      .then((data: AccountPurchasesResponse) => {
        if (!cancelled) setPurchases(data);
      })
      .catch(() => {
        if (!cancelled) setPurchases({ authenticated: false });
      })
      .finally(() => {
        if (!cancelled) setPurchasesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authLoading, userId]);

  const entitlements: AccountEntitlement[] = [
    ...(purchases?.ownedVenueSkins ?? []).map((s) => ({
      id: `skin-${s.skinId}`,
      title: s.skinId.replace(/-/g, " ").toUpperCase(),
      category: "skin",
      provenance: s.unlockedVia === "season_pass" ? "SEASON_PASS" : "PURCHASED",
      obtainedAt: "",
    })),
    ...(purchases?.ownedChassis ?? []).map((c) => ({
      id: `chassis-${c.chassisId}`,
      title: `${c.chassisId.replace(/-/g, " ")} Media Player`,
      category: "chassis",
      provenance: c.unlockedVia === "purchase" ? "PURCHASED" : c.unlockedVia.toUpperCase(),
      obtainedAt: c.purchasedAt,
    })),
    ...(purchases?.ownedStoreItems ?? []).map((s) => ({
      id: `store-${s.itemId}`,
      title: s.title,
      category: s.category,
      provenance: "PURCHASED",
      obtainedAt: s.purchasedAt,
    })),
    ...(purchases?.seasonPasses ?? []).map((sp) => ({
      id: `pass-${sp.name}`,
      title: sp.name,
      category: "pass",
      provenance: "SEASON_PASS",
      obtainedAt: sp.purchasedAt,
    })),
  ];

  async function handleQuantityChange(itemId: string, delta: number) {
    const item = cart.items.find((i) => i.itemId === itemId);
    if (!item) return;
    const res = await fetch("/api/cart/items", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, quantity: item.quantity + delta }),
    });
    const data = (await res.json()) as CartView & { ok?: boolean };
    if (data.ok) setCart(data);
  }

  async function handleRemoveItem(itemId: string) {
    const res = await fetch("/api/cart/items", {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId }),
    });
    const data = (await res.json()) as CartView & { ok?: boolean };
    if (data.ok) setCart(data);
  }

  async function handleProceedToCheckout() {
    if (cart.items.length === 0) return;
    setCartNotice(null);
    setCheckingOut(true);
    try {
      const res = await fetch("/api/cart/checkout", { method: "POST", credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (res.status === 409) {
        setCartNotice(
          data.error === "cart_prices_changed"
            ? "Some prices changed since you added these items — updated below. Review and try again."
            : "Some items are no longer available and were removed. Review your cart and try again.",
        );
        await loadCart();
        return;
      }
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      setCartNotice(data?.error ?? "Checkout failed — try again.");
    } catch {
      setCartNotice("Checkout failed — try again.");
    } finally {
      setCheckingOut(false);
    }
  }

  const filteredEntitlements = entitlements.filter((e) => {
    if (provenanceFilter === "ALL") return true;
    return e.provenance === provenanceFilter;
  });

  const cartItemCount = cart.itemCount;
  const isSignedIn = Boolean(userId) && purchases?.authenticated;
  const accountReady = !authLoading && !purchasesLoading;

  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(160deg,#040412,#06041a)", color: "#fff", paddingBottom: 80, fontFamily: "'Inter', sans-serif" }}>
      {/* HEADER NAV */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "16px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link href="/dashboard" style={{ fontSize: 11, color: CYAN, textDecoration: "none", fontWeight: 700 }}>← Back to Dashboard</Link>
          <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
          <span style={{ fontSize: 11, color: GOLD, fontWeight: 900, letterSpacing: "0.1em" }}>ACCOUNT FINANCE HUB</span>
        </div>
        <div style={{ fontSize: 11, color: purchases?.stripeConnected ? GREEN : "rgba(255,255,255,0.35)", fontWeight: 800 }}>
          {purchases?.stripeConnected ? "● STRIPE CONNECTED" : "○ STRIPE NOT CONNECTED"}
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>
        {!accountReady ? (
          <div style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.5)", fontSize: 12 }}>Loading your account…</div>
        ) : !isSignedIn ? (
          <div style={panelStyle}>
            <div style={panelTitle}>SIGN IN REQUIRED</div>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
              Sign in to view your real purchases, subscriptions, and owned items.
            </p>
            <Link href="/login" style={{ ...actionBtn(CYAN), display: "inline-block", textDecoration: "none", marginTop: 8 }}>
              Sign In →
            </Link>
          </div>
        ) : (
        <>
        {/* TOP METRIC CARDS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 28 }}>
          <div style={cardStyle}>
            <div style={cardLabel}>CURRENT PLAN</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: GOLD }}>{purchases?.tier ?? "FREE"}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
              {purchases?.subscriptionRenewsAt
                ? `Renews ${new Date(purchases.subscriptionRenewsAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                : "No active subscription renewal"}
            </div>
          </div>

          <div style={cardStyle}>
            <div style={cardLabel}>MY CART</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: CYAN }}>{cartItemCount} ITEMS</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>${(cart.subtotalCents / 100).toFixed(2)} Total</div>
          </div>

          <div style={cardStyle}>
            <div style={cardLabel}>TMI POINTS</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: FUCHSIA }}>—</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>Balance unavailable</div>
          </div>

          <div style={cardStyle}>
            <div style={cardLabel}>OWNED ASSETS</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: GREEN }}>{entitlements.length} ITEMS</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>Verified inventory</div>
          </div>
        </div>

        {/* TAB BAR */}
        <div style={{ display: "flex", gap: 8, borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 12, marginBottom: 24, flexWrap: "wrap" }}>
          {[
            { id: "overview", label: "OVERVIEW", icon: "📊" },
            { id: "cart", label: `MY CART (${cartItemCount})`, icon: "🛒" },
            { id: "billing", label: "BILLING & SUBSCRIPTIONS", icon: "💳" },
            { id: "purchases", label: "PURCHASES & OWNERSHIP", icon: "🎁" },
            { id: "wallet", label: "WALLET & PAYOUTS", icon: "💰" },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as any)}
              style={{
                padding: "8px 16px",
                borderRadius: 10,
                border: `1px solid ${activeTab === t.id ? CYAN : "rgba(255,255,255,0.12)"}`,
                background: activeTab === t.id ? `${CYAN}22` : "rgba(255,255,255,0.04)",
                color: activeTab === t.id ? CYAN : "rgba(255,255,255,0.7)",
                fontSize: 11,
                fontWeight: 900,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={panelStyle}>
              <div style={panelTitle}>FINANCIAL SNAPSHOT</div>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>
                Welcome to your TMI Account Finance Hub. Manage your subscriptions, store purchases, entitlement inventory, TMI Points, and Stripe Connect payouts from one canonical location.
              </p>
              <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
                <button type="button" onClick={() => setActiveTab("cart")} style={actionBtn(CYAN)}>
                  View Shopping Cart →
                </button>
                <button type="button" onClick={() => setActiveTab("purchases")} style={actionBtn(GREEN)}>
                  View My Ownership →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CART TAB */}
        {activeTab === "cart" && (
          <div style={panelStyle}>
            <div style={panelTitle}>UNIVERSAL CART</div>
            {cartNotice && (
              <div style={{ fontSize: 11, color: GOLD, background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 8, padding: "10px 14px", marginBottom: 12 }}>
                {cartNotice}
              </div>
            )}
            {cart.items.length === 0 ? (
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", padding: 20, textAlign: "center" }}>
                Your cart is empty. Add items from the store, or use BUY NOW for an instant one-tap purchase.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {cart.items.map((item) => (
                  <div key={item.itemId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12, borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.25)" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{item.icon} {item.name}</div>
                      <div style={{ fontSize: 10, color: GOLD }}>Category: {item.category.toUpperCase()}</div>
                      {item.priceChanged && (
                        <div style={{ fontSize: 10, color: GOLD, marginTop: 2 }}>Price updated since added</div>
                      )}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <button type="button" onClick={() => void handleQuantityChange(item.itemId, -1)} style={qtyBtn}>-</button>
                        <span style={{ fontSize: 12, fontWeight: 800, minWidth: 20, textAlign: "center" }}>{item.quantity}</span>
                        <button type="button" onClick={() => void handleQuantityChange(item.itemId, 1)} style={qtyBtn}>+</button>
                      </div>

                      <div style={{ fontSize: 13, fontWeight: 900, color: GREEN, minWidth: 60, textAlign: "right" }}>
                        ${((item.unitPriceCents * item.quantity) / 100).toFixed(2)}
                      </div>

                      <button type="button" onClick={() => void handleRemoveItem(item.itemId)} style={{ background: "none", border: "none", color: "#FF7070", cursor: "pointer", fontSize: 12 }}>✕</button>
                    </div>
                  </div>
                ))}

                <div style={{ marginTop: 16, borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 14, display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>Subtotal: ${(cart.subtotalCents / 100).toFixed(2)}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>Tax: Calculated at checkout</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: GOLD, marginTop: 4 }}>Total: ${(cart.subtotalCents / 100).toFixed(2)}</div>

                  <button
                    type="button"
                    disabled={checkingOut}
                    onClick={() => void handleProceedToCheckout()}
                    style={{
                      marginTop: 12,
                      padding: "12px 24px",
                      borderRadius: 10,
                      border: `1px solid ${CYAN}`,
                      background: `${CYAN}22`,
                      color: CYAN,
                      fontSize: 12,
                      fontWeight: 900,
                      cursor: "pointer",
                      boxShadow: `0 0 16px ${CYAN}44`,
                    }}
                  >
                    {checkingOut ? "…" : "💳 PROCEED TO STRIPE CHECKOUT"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PURCHASES TAB */}
        {activeTab === "purchases" && (
          <div style={panelStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={panelTitle}>VERIFIED PURCHASES & OWNERSHIP</div>
              <div style={{ display: "flex", gap: 6 }}>
                {["ALL", "PURCHASED", "SEASON_PASS"].map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setProvenanceFilter(filter)}
                    style={{
                      padding: "4px 8px",
                      borderRadius: 6,
                      border: `1px solid ${provenanceFilter === filter ? GOLD : "rgba(255,255,255,0.1)"}`,
                      background: provenanceFilter === filter ? `${GOLD}22` : "transparent",
                      color: provenanceFilter === filter ? GOLD : "rgba(255,255,255,0.5)",
                      fontSize: 9,
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {filteredEntitlements.length === 0 ? (
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", padding: 20, textAlign: "center" }}>
                No owned items yet. Browse the{" "}
                <Link href="/store/venue-skins" style={{ color: GOLD }}>Store</Link> to get started.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {filteredEntitlements.map((e) => (
                  <div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12, borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.25)" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{e.title}</div>
                      <div style={{ fontSize: 10, color: GOLD, marginTop: 2 }}>
                        STATUS: OWNED · PROVENANCE: {e.provenance}
                      </div>
                    </div>
                  </div>
                ))}
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
                  Equip owned items from the{" "}
                  <Link href="/avatar/studio" style={{ color: CYAN }}>Avatar Studio</Link> or their store page.
                </div>
              </div>
            )}
          </div>
        )}

        {/* BILLING TAB */}
        {activeTab === "billing" && (
          <div style={panelStyle}>
            <div style={panelTitle}>SUBSCRIPTION & BILLING MANAGEMENT</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginBottom: 16 }}>
              Current Plan: <strong style={{ color: GOLD }}>{purchases?.tier ?? "FREE"} TIER</strong>
            </div>
            <button
              type="button"
              onClick={() => { window.location.href = "/api/stripe/customer-portal"; }}
              style={actionBtn(CYAN)}
            >
              💳 MANAGE PAYMENT METHOD & BILLING PORTAL →
            </button>
          </div>
        )}

        {/* WALLET & PAYOUTS TAB */}
        {activeTab === "wallet" && (
          <div style={panelStyle}>
            <div style={panelTitle}>TMI WALLET & STRIPE CONNECT PAYOUTS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ padding: 14, borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.25)" }}>
                <div style={{ fontSize: 10, color: FUCHSIA, fontWeight: 800 }}>TMI POINTS LEDGER</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", marginTop: 4 }}>—</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>Balance unavailable</div>
              </div>

              <div style={{ padding: 14, borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.25)" }}>
                <div style={{ fontSize: 10, color: GREEN, fontWeight: 800 }}>AVAILABLE EARNINGS</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", marginTop: 4 }}>—</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>Payout status: Setup Required</div>
              </div>

              <button
                type="button"
                onClick={() => { window.location.href = "/api/stripe/connect"; }}
                style={actionBtn(GOLD)}
              >
                🏦 CONNECT STRIPE PAYOUT ACCOUNT →
              </button>
            </div>
          </div>
        )}
        </>
        )}
      </div>
    </main>
  );
}

const cardStyle: React.CSSProperties = {
  padding: 16,
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(6,6,20,0.85)",
  backdropFilter: "blur(10px)",
};

const cardLabel: React.CSSProperties = {
  fontSize: 9,
  fontWeight: 900,
  color: "rgba(255,255,255,0.5)",
  letterSpacing: "0.1em",
  marginBottom: 6,
};

const panelStyle: React.CSSProperties = {
  padding: 20,
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(6,6,20,0.88)",
  backdropFilter: "blur(12px)",
};

const panelTitle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 900,
  color: GOLD,
  letterSpacing: "0.12em",
  marginBottom: 12,
};

function actionBtn(color: string): React.CSSProperties {
  return {
    padding: "10px 16px",
    borderRadius: 10,
    border: `1px solid ${color}`,
    background: `${color}22`,
    color,
    fontSize: 11,
    fontWeight: 900,
    cursor: "pointer",
  };
}

const qtyBtn: React.CSSProperties = {
  width: 24,
  height: 24,
  borderRadius: 6,
  border: "1px solid rgba(255,255,255,0.2)",
  background: "rgba(255,255,255,0.06)",
  color: "#fff",
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 800,
};
