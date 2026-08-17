"use client";

/**
 * Account Finance Hub — Master Financial, Commerce, & Ownership Dashboard.
 *
 * User-facing Name: Account Settings → Billing & Money
 * Technical Engine: AccountFinanceHub + CanonicalCartRuntime + OwnershipRuntime
 *
 * Sections:
 *   1. OVERVIEW: Key financial metrics (Plan, Cart, Points, Purchases, Earnings)
 *   2. CART: Canonical cart drawer & checkout trigger
 *   3. BILLING: Subscription management & Customer Portal integration
 *   4. PURCHASES: Provenance-filtered inventory & equip controls
 *   5. WALLET & PAYOUTS: TMI Points ledger, earnings balance, & Stripe Connect setup
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { CanonicalCartRuntime, type CartState } from "@/lib/commerce/CanonicalCartRuntime";
import { OwnershipRuntime, type UserEntitlement } from "@/lib/commerce/OwnershipRuntime";

const CYAN = "#00FFFF";
const FUCHSIA = "#FF2DAA";
const GOLD = "#FFD700";
const GREEN = "#00FF88";

export default function AccountFinanceHubPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "cart" | "billing" | "purchases" | "wallet">("overview");
  const [cartId] = useState("user-cart-default");
  const [userId] = useState("user-active-1");
  const [cartState, setCartState] = useState<CartState>(CanonicalCartRuntime.getOrCreateCart("user-cart-default", "user-active-1"));
  const [entitlements, setEntitlements] = useState<UserEntitlement[]>([]);
  const [provenanceFilter, setProvenanceFilter] = useState<string>("ALL");
  const [pointsBalance] = useState(18450);
  const [earningsBalance] = useState(0.0);
  const [payoutStatus] = useState("CONNECT_REQUIRED");

  // Populate seed items if empty
  useEffect(() => {
    // Add default seed cart item if empty
    if (cartState.items.length === 0) {
      CanonicalCartRuntime.addItem("user-cart-default", {
        id: "item-robot-suit",
        skuId: "sku-robot-king-suit",
        title: "Robot King Suit",
        category: "cosmetic",
        clientPriceCents: 99,
        quantity: 1,
      });
      setCartState({ ...CanonicalCartRuntime.getOrCreateCart("user-cart-default") });
    }

    // Seed initial entitlements
    OwnershipRuntime.grantEntitlement({
      userId,
      skuId: "sku-submarine-player",
      title: "Submarine Media Player",
      category: "chassis",
      provenance: "SUBSCRIPTION",
      pricePaidCents: 0,
    });

    OwnershipRuntime.grantEntitlement({
      userId,
      skuId: "sku-bobby-reaction-pack",
      title: "Bobby Reaction Pack",
      category: "cosmetic",
      provenance: "PURCHASED",
      pricePaidCents: 99,
    });

    setEntitlements(OwnershipRuntime.getUserEntitlements(userId));
  }, [cartState.items.length, userId]);

  function handleQuantityChange(skuId: string, delta: number) {
    const item = cartState.items.find((i) => i.skuId === skuId);
    if (!item) return;
    const updated = CanonicalCartRuntime.updateQuantity(cartId, skuId, item.quantity + delta);
    setCartState({ ...updated });
  }

  function handleRemoveItem(skuId: string) {
    const updated = CanonicalCartRuntime.removeItem(cartId, skuId);
    setCartState({ ...updated });
  }

  async function handleProceedToCheckout() {
    if (cartState.items.length === 0) return;
    const skuId = cartState.items[0].skuId;
    window.location.href = `/api/stripe/checkout?priceId=${encodeURIComponent(skuId)}&mode=payment`;
  }

  const filteredEntitlements = entitlements.filter((e) => {
    if (provenanceFilter === "ALL") return true;
    return e.provenance === provenanceFilter;
  });

  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(160deg,#040412,#06041a)", color: "#fff", paddingBottom: 80, fontFamily: "'Inter', sans-serif" }}>
      {/* HEADER NAV */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "16px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link href="/dashboard" style={{ fontSize: 11, color: CYAN, textDecoration: "none", fontWeight: 700 }}>← Back to Dashboard</Link>
          <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
          <span style={{ fontSize: 11, color: GOLD, fontWeight: 900, letterSpacing: "0.1em" }}>ACCOUNT FINANCE HUB</span>
        </div>
        <div style={{ fontSize: 11, color: GREEN, fontWeight: 800 }}>● STRIPE CONNECTED</div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>
        {/* TOP METRIC CARDS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 28 }}>
          <div style={cardStyle}>
            <div style={cardLabel}>CURRENT PLAN</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: GOLD }}>PLATINUM</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>Renews Sep 1, 2026</div>
          </div>

          <div style={cardStyle}>
            <div style={cardLabel}>MY CART</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: CYAN }}>{cartState.items.length} ITEMS</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>${(cartState.totalCents / 100).toFixed(2)} Total</div>
          </div>

          <div style={cardStyle}>
            <div style={cardLabel}>TMI POINTS</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: FUCHSIA }}>{pointsBalance.toLocaleString()} PTS</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>Available for store</div>
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
            { id: "cart", label: `MY CART (${cartState.items.length})`, icon: "🛒" },
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
            <div style={panelTitle}>CANONICAL SHOPPING CART</div>
            {cartState.items.length === 0 ? (
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", padding: 20, textAlign: "center" }}>
                Your cart is empty.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {cartState.items.map((item) => (
                  <div key={item.skuId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12, borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.25)" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{item.title}</div>
                      <div style={{ fontSize: 10, color: GOLD }}>Category: {item.category.toUpperCase()}</div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <button type="button" onClick={() => handleQuantityChange(item.skuId, -1)} style={qtyBtn}>-</button>
                        <span style={{ fontSize: 12, fontWeight: 800, minWidth: 20, textAlign: "center" }}>{item.quantity}</span>
                        <button type="button" onClick={() => handleQuantityChange(item.skuId, 1)} style={qtyBtn}>+</button>
                      </div>

                      <div style={{ fontSize: 13, fontWeight: 900, color: GREEN, minWidth: 60, textAlign: "right" }}>
                        ${((item.unitPriceCents * item.quantity) / 100).toFixed(2)}
                      </div>

                      <button type="button" onClick={() => handleRemoveItem(item.skuId)} style={{ background: "none", border: "none", color: "#FF7070", cursor: "pointer", fontSize: 12 }}>✕</button>
                    </div>
                  </div>
                ))}

                <div style={{ marginTop: 16, borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 14, display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>Subtotal: ${(cartState.subtotalCents / 100).toFixed(2)}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>Estimated Tax (8%): ${(cartState.taxCents / 100).toFixed(2)}</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: GOLD, marginTop: 4 }}>Total: ${(cartState.totalCents / 100).toFixed(2)}</div>

                  <button
                    type="button"
                    onClick={handleProceedToCheckout}
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
                    💳 PROCEED TO STRIPE CHECKOUT
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
                {["ALL", "PURCHASED", "SUBSCRIPTION", "WON_DEAL_OR_FEUD"].map((filter) => (
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

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filteredEntitlements.map((e) => (
                <div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12, borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.25)" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{e.title}</div>
                    <div style={{ fontSize: 10, color: GOLD, marginTop: 2 }}>
                      STATUS: OWNED · PROVENANCE: {e.provenance}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => OwnershipRuntime.equipItem(userId, e.skuId)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 8,
                        border: `1px solid ${GREEN}`,
                        background: `${GREEN}22`,
                        color: GREEN,
                        fontSize: 10,
                        fontWeight: 900,
                        cursor: "pointer",
                      }}
                    >
                      {e.equipped ? "✓ EQUIPPED" : "EQUIP"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BILLING TAB */}
        {activeTab === "billing" && (
          <div style={panelStyle}>
            <div style={panelTitle}>SUBSCRIPTION & BILLING MANAGEMENT</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginBottom: 16 }}>
              Current Plan: <strong style={{ color: GOLD }}>PLATINUM TIER</strong>
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
                <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", marginTop: 4 }}>{pointsBalance.toLocaleString()} PTS</div>
              </div>

              <div style={{ padding: 14, borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.25)" }}>
                <div style={{ fontSize: 10, color: GREEN, fontWeight: 800 }}>AVAILABLE EARNINGS</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", marginTop: 4 }}>${earningsBalance.toFixed(2)}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>Payout status: {payoutStatus}</div>
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
