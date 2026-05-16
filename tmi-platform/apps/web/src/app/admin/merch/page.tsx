import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin: Merch | TMI" };

const ITEMS = [
  { id: "m1", name: "TMI Logo Hoodie — Black", creator: "TMI Store", type: "APPAREL", price: 64.99, vendor: "Printify", stock: "POD", status: "ACTIVE", sales: 18 },
  { id: "m2", name: "Cypher Nation Tee", creator: "TMI Store", type: "APPAREL", price: 34.99, vendor: "Printify", stock: "POD", status: "ACTIVE", sales: 42 },
  { id: "m3", name: "Battle Ring Snapback", creator: "TMI Store", type: "ACCESSORY", price: 29.99, vendor: "Printify", stock: "POD", status: "ACTIVE", sales: 11 },
  { id: "m4", name: "Wavetek Vinyl 12\"", creator: "Wavetek", type: "PHYSICAL", price: 22.00, vendor: "Manual", stock: "12", status: "LOW_STOCK", sales: 6 },
  { id: "m5", name: "TMI Collector Pin Set", creator: "TMI Store", type: "COLLECTIBLE", price: 18.00, vendor: "Manual", stock: "0", status: "OUT_OF_STOCK", sales: 31 },
  { id: "m6", name: "Neon Vibe Event Poster", creator: "Neon Vibe", type: "PRINT", price: 14.99, vendor: "Printify", stock: "POD", status: "ACTIVE", sales: 9 },
];

const STATUS_C: Record<string, string> = { ACTIVE: "#00FF88", LOW_STOCK: "#FFD700", OUT_OF_STOCK: "#FF2DAA", PAUSED: "#AA2DFF" };

export default function AdminMerchPage() {
  const totalSales = ITEMS.reduce((a, i) => a + i.sales, 0);
  const totalRevenue = ITEMS.reduce((a, i) => a + i.sales * i.price, 0);
  const tmiCut = totalRevenue * 0.15;

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "32px 24px 80px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, color: "#00FF88", fontWeight: 800, letterSpacing: "0.2em", marginBottom: 6 }}>ADMIN</div>
          <h1 style={{ fontSize: 24, fontWeight: 900 }}>Merch Store</h1>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>POD + physical merch · 15% TMI cut after vendor cost</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 32 }}>
          {[
            { l: "TOTAL ITEMS", v: ITEMS.length, c: "#00FFFF" },
            { l: "TOTAL SALES", v: totalSales, c: "#FFD700" },
            { l: "GROSS REVENUE", v: `$${totalRevenue.toLocaleString("en", { maximumFractionDigits: 0 })}`, c: "#00FF88" },
            { l: "TMI CUT (15%)", v: `$${tmiCut.toLocaleString("en", { maximumFractionDigits: 0 })}`, c: "#FF2DAA" },
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
              {["ITEM", "CREATOR", "TYPE", "PRICE", "VENDOR", "STOCK", "STATUS", "SALES"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontSize: 8, color: "rgba(255,255,255,0.3)", fontWeight: 800 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ITEMS.map(item => (
              <tr key={item.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ padding: "14px 12px", fontWeight: 700 }}>{item.name}</td>
                <td style={{ padding: "14px 12px", color: "rgba(255,255,255,0.5)" }}>{item.creator}</td>
                <td style={{ padding: "14px 12px", color: "rgba(255,255,255,0.4)", fontSize: 10 }}>{item.type}</td>
                <td style={{ padding: "14px 12px", color: "#00FF88", fontWeight: 800 }}>${item.price}</td>
                <td style={{ padding: "14px 12px", color: "rgba(255,255,255,0.4)" }}>{item.vendor}</td>
                <td style={{ padding: "14px 12px", color: item.stock === "0" ? "#FF2DAA" : "rgba(255,255,255,0.6)" }}>{item.stock}</td>
                <td style={{ padding: "14px 12px" }}>
                  <span style={{ fontSize: 8, fontWeight: 800, color: STATUS_C[item.status] ?? "#fff", border: `1px solid ${STATUS_C[item.status] ?? "#fff"}40`, borderRadius: 4, padding: "3px 7px" }}>{item.status.replace("_", " ")}</span>
                </td>
                <td style={{ padding: "14px 12px", fontWeight: 700 }}>{item.sales}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
