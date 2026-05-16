import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin: Orders | TMI" };

const ORDERS = [
  { id: "ORD-0091", buyer: "krypt_rider", item: "TMI Logo Hoodie — Black", type: "MERCH", amount: 64.99, status: "SHIPPED", date: "Apr 26, 2026", tracking: "1Z999AA1" },
  { id: "ORD-0090", buyer: "flow_fanatic", item: "Midnight Bars (Premium)", type: "BEAT", amount: 59.00, status: "DELIVERED", date: "Apr 25, 2026", tracking: "—" },
  { id: "ORD-0089", buyer: "mega_fan_007", item: "VIP Ticket — Neon Vibe Show", type: "TICKET", amount: 85.00, status: "DELIVERED", date: "Apr 24, 2026", tracking: "—" },
  { id: "ORD-0088", buyer: "producer_88", item: "Cyber Genesis NFT #001", type: "NFT", amount: 280.00, status: "PROCESSING", date: "Apr 24, 2026", tracking: "—" },
  { id: "ORD-0087", buyer: "fan_xyz_421", item: "Battle Code (Exclusive)", type: "BEAT", amount: 499.00, status: "DISPUTED", date: "Apr 23, 2026", tracking: "—" },
  { id: "ORD-0086", buyer: "neon_merch_fan", item: "Cypher Nation Tee", type: "MERCH", amount: 34.99, status: "PENDING", date: "Apr 27, 2026", tracking: "—" },
];

const STATUS_C: Record<string, string> = { DELIVERED: "#00FF88", SHIPPED: "#00FFFF", PROCESSING: "#FFD700", PENDING: "#AA2DFF", DISPUTED: "#FF2DAA", REFUNDED: "#FF2DAA" };
const TYPE_C: Record<string, string> = { BEAT: "#FFD700", MERCH: "#FF2DAA", TICKET: "#00FFFF", NFT: "#AA2DFF", INSTRUMENTAL: "#00FF88" };

export default function AdminOrdersPage() {
  const totalRevenue = ORDERS.reduce((a, o) => a + o.amount, 0);
  const disputed = ORDERS.filter(o => o.status === "DISPUTED").length;

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "32px 24px 80px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, color: "#00FFFF", fontWeight: 800, letterSpacing: "0.2em", marginBottom: 6 }}>ADMIN</div>
          <h1 style={{ fontSize: 24, fontWeight: 900 }}>Orders</h1>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>All purchase orders across beats, merch, tickets, and NFTs.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 32 }}>
          {[
            { l: "TOTAL ORDERS", v: ORDERS.length, c: "#00FFFF" },
            { l: "GROSS REVENUE", v: `$${totalRevenue.toFixed(2)}`, c: "#00FF88" },
            { l: "DISPUTED", v: disputed, c: "#FF2DAA" },
            { l: "PENDING SHIP", v: ORDERS.filter(o => o.status === "PENDING" || o.status === "PROCESSING").length, c: "#FFD700" },
          ].map(s => (
            <div key={s.l} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${s.c}18`, borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 9, color: s.c, fontWeight: 800, marginBottom: 4 }}>{s.l}</div>
              <div style={{ fontSize: 22, fontWeight: 900 }}>{s.v}</div>
            </div>
          ))}
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              {["ORDER ID", "BUYER", "ITEM", "TYPE", "AMOUNT", "STATUS", "DATE", "TRACKING"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontSize: 8, color: "rgba(255,255,255,0.3)", fontWeight: 800 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ORDERS.map(o => (
              <tr key={o.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ padding: "14px 12px", color: "rgba(255,255,255,0.4)", fontFamily: "monospace", fontSize: 10 }}>{o.id}</td>
                <td style={{ padding: "14px 12px", fontWeight: 700 }}>{o.buyer}</td>
                <td style={{ padding: "14px 12px", color: "rgba(255,255,255,0.6)" }}>{o.item}</td>
                <td style={{ padding: "14px 12px" }}>
                  <span style={{ fontSize: 8, fontWeight: 800, color: TYPE_C[o.type] ?? "#fff", border: `1px solid ${TYPE_C[o.type] ?? "#fff"}40`, borderRadius: 4, padding: "3px 7px" }}>{o.type}</span>
                </td>
                <td style={{ padding: "14px 12px", color: "#00FF88", fontWeight: 800 }}>${o.amount.toFixed(2)}</td>
                <td style={{ padding: "14px 12px" }}>
                  <span style={{ fontSize: 8, fontWeight: 800, color: STATUS_C[o.status] ?? "#fff", border: `1px solid ${STATUS_C[o.status] ?? "#fff"}40`, borderRadius: 4, padding: "3px 7px" }}>{o.status}</span>
                </td>
                <td style={{ padding: "14px 12px", color: "rgba(255,255,255,0.4)", fontSize: 10 }}>{o.date}</td>
                <td style={{ padding: "14px 12px", color: "rgba(255,255,255,0.4)", fontFamily: "monospace", fontSize: 10 }}>{o.tracking}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
