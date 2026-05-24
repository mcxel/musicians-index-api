"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Order = { id: string; items: string[]; total: number; date: string; status: string; type: string };

const SEED: Order[] = [
  { id: "ord-001", items: ["Flame Emote Pack", "Hood Reports Beat (Premium License)"], total: 34.98, date: "2026-04-24", status: "COMPLETED", type: "STORE" },
  { id: "ord-002", items: ["Zuri Bloom — Diaspora Session Ticket ×2"],               total: 18.00, date: "2026-04-22", status: "COMPLETED", type: "TICKET" },
  { id: "ord-003", items: ["Wavetek Fan Club — Gold Tier (Monthly)"],                 total: 14.99, date: "2026-04-01", status: "ACTIVE",    type: "SUBSCRIPTION" },
  { id: "ord-004", items: ["Cold Spark — Drill Stem Pack", "Stage Lighting Prop"],    total: 52.97, date: "2026-03-18", status: "COMPLETED", type: "STORE" },
];

const STATUS_COLOR: Record<string, string> = {
  COMPLETED: "#00FF88",
  ACTIVE:    "#00FFFF",
  PENDING:   "#FFD700",
  REFUNDED:  "#AA2DFF",
  CANCELLED: "#FF2DAA",
};

const TYPE_COLOR: Record<string, string> = {
  STORE:        "#FF2DAA",
  TICKET:       "#00FF88",
  SUBSCRIPTION: "#00FFFF",
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>(SEED);
  const [msg, setMsg] = useState("");

  const totalSpent = orders.filter(o => o.status !== "REFUNDED" && o.status !== "CANCELLED").reduce((a, o) => a + o.total, 0);

  function showMsg(text: string) {
    setMsg(text);
    setTimeout(() => setMsg(""), 3000);
  }

  function cancelOrder(id: string) {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: "CANCELLED" } : o));
    showMsg("Subscription cancelled.");
  }

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 4 }}>My Orders</h1>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Purchases, subscriptions, and ticket history.</p>
          </div>
          <Link href="/shop" style={{ padding: "8px 18px", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "#00FFFF", border: "1px solid rgba(0,255,255,0.3)", borderRadius: 8, textDecoration: "none" }}>
            SHOP
          </Link>
        </div>

        {msg && <div style={{ marginBottom: 16, padding: "10px 14px", background: "rgba(0,255,255,0.06)", border: "1px solid rgba(0,255,255,0.2)", borderRadius: 8, fontSize: 12, color: "#00FFFF" }}>{msg}</div>}

        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(0,255,255,0.15)", borderRadius: 14, padding: "20px 24px", marginBottom: 32, display: "flex", gap: 32, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#00FFFF" }}>${totalSpent.toFixed(2)}</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", fontWeight: 700 }}>TOTAL SPENT</div>
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900 }}>{orders.length}</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", fontWeight: 700 }}>ORDERS</div>
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#00FF88" }}>
              {orders.filter(o => o.status === "ACTIVE").length}
            </div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", fontWeight: 700 }}>ACTIVE SUBS</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {orders.map(order => (
            <div key={order.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "20px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
                <div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.1em", color: TYPE_COLOR[order.type], border: `1px solid ${TYPE_COLOR[order.type]}40`, borderRadius: 4, padding: "2px 7px" }}>
                      {order.type}
                    </span>
                    <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)" }}>{order.id}</span>
                    <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)" }}>·</span>
                    <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)" }}>{order.date}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    {order.items.map(item => (
                      <div key={item} style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{item}</div>
                    ))}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 6 }}>${order.total.toFixed(2)}</div>
                  <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.12em", color: STATUS_COLOR[order.status] ?? "#fff" }}>
                    {order.status}
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                <button onClick={() => showMsg(`Receipt for ${order.id} — check your email.`)} style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.3)", background: "none", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "4px 12px", cursor: "pointer" }}>
                  RECEIPT
                </button>
                {order.status !== "ACTIVE" && order.status !== "CANCELLED" && (
                  <button onClick={() => router.push("/messages")} style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.3)", background: "none", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "4px 12px", cursor: "pointer" }}>
                    SUPPORT
                  </button>
                )}
                {order.status === "ACTIVE" && (
                  <button onClick={() => cancelOrder(order.id)} style={{ fontSize: 9, fontWeight: 700, color: "#FF2DAA", background: "none", border: "1px solid rgba(255,45,170,0.2)", borderRadius: 6, padding: "4px 12px", cursor: "pointer" }}>
                    CANCEL
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", padding: "40px 0 0" }}>
          <Link href="/shop" style={{ padding: "10px 24px", fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "#050510", background: "linear-gradient(135deg,#00FFFF,#00AABB)", borderRadius: 8, textDecoration: "none" }}>
            CONTINUE SHOPPING
          </Link>
        </div>
      </div>
    </main>
  );
}
