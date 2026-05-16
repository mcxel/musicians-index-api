import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin: Vault | TMI" };

const ORDERS = [
  { id: "o1", buyer: "krypt_rider", item: "Midnight Bars (Premium)", type: "BEAT", status: "DELIVERED", amount: 59, downloads: 1 },
  { id: "o2", buyer: "mega_fan_007", item: "The Code (Lease)", type: "INSTRUMENTAL", status: "DELIVERED", amount: 49, downloads: 0 },
  { id: "o3", buyer: "producer_88", item: "Cyber Genesis NFT #001", type: "NFT", status: "PENDING", amount: 280, downloads: 0 },
  { id: "o4", buyer: "fan_xyz_421", item: "Battle Code (Exclusive)", type: "BEAT", status: "DISPUTED", amount: 499, downloads: 3 },
];

export default function AdminVaultPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "32px 24px 80px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, color: "#00FF88", fontWeight: 800, letterSpacing: "0.2em", marginBottom: 6 }}>ADMIN</div>
          <h1 style={{ fontSize: 24, fontWeight: 900 }}>Vault — Asset Delivery</h1>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>Protected delivery chain — every purchase tracked from payment to download.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 32 }}>
          {[{ l: "TOTAL ORDERS", v: ORDERS.length, c: "#00FF88" }, { l: "DELIVERED", v: ORDERS.filter(o => o.status === "DELIVERED").length, c: "#00FFFF" }, { l: "PENDING", v: ORDERS.filter(o => o.status === "PENDING").length, c: "#FFD700" }, { l: "DISPUTES", v: ORDERS.filter(o => o.status === "DISPUTED").length, c: "#FF2DAA" }].map(s => (
            <div key={s.l} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${s.c}18`, borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 9, color: s.c, fontWeight: 800, marginBottom: 4 }}>{s.l}</div>
              <div style={{ fontSize: 22, fontWeight: 900 }}>{s.v}</div>
            </div>
          ))}
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>{["ORDER", "BUYER", "ITEM", "TYPE", "STATUS", "AMOUNT", "DOWNLOADS"].map(h => <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontSize: 8, color: "rgba(255,255,255,0.3)", fontWeight: 800 }}>{h}</th>)}</tr></thead>
          <tbody>
            {ORDERS.map(o => {
              const scolor = o.status === "DELIVERED" ? "#00FF88" : o.status === "PENDING" ? "#FFD700" : "#FF2DAA";
              return (
                <tr key={o.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "14px 12px", fontWeight: 700, color: "rgba(255,255,255,0.4)" }}>{o.id.toUpperCase()}</td>
                  <td style={{ padding: "14px 12px", fontWeight: 700 }}>{o.buyer}</td>
                  <td style={{ padding: "14px 12px", color: "rgba(255,255,255,0.6)" }}>{o.item}</td>
                  <td style={{ padding: "14px 12px", color: "rgba(255,255,255,0.4)" }}>{o.type}</td>
                  <td style={{ padding: "14px 12px" }}><span style={{ fontSize: 8, fontWeight: 800, color: scolor, border: `1px solid ${scolor}40`, borderRadius: 4, padding: "3px 7px" }}>{o.status}</span></td>
                  <td style={{ padding: "14px 12px", color: "#00FF88" }}>${o.amount}</td>
                  <td style={{ padding: "14px 12px" }}>{o.downloads}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
