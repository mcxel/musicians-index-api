import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin: NFT Sales | TMI" };

const NFTS = [
  { id: "nft1", name: "Cyber Genesis #001", creator: "TMI Art", type: "ART", saleType: "AUCTION", price: 280, royalty: 10, status: "SOLD", buyer: "producer_88", date: "Apr 24, 2026" },
  { id: "nft2", name: "Battle Moment #012", creator: "Krypt", type: "MOMENT", saleType: "FIXED", price: 45, royalty: 10, status: "SOLD", buyer: "fan_xyz_421", date: "Apr 21, 2026" },
  { id: "nft3", name: "Wavetek Session Pass", creator: "Wavetek", type: "TICKET-ART", saleType: "FIXED", price: 120, royalty: 10, status: "LISTED", buyer: "—", date: "—" },
  { id: "nft4", name: "5th Ward Collectible #003", creator: "FlowMaster", type: "COLLECTIBLE", saleType: "AUCTION", price: 95, royalty: 10, status: "ACTIVE_AUCTION", buyer: "—", date: "—" },
  { id: "nft5", name: "Lo-Fi Canvas #007", creator: "Neon Vibe", type: "MUSIC", saleType: "FIXED", price: 60, royalty: 10, status: "SOLD", buyer: "beat_fan_22", date: "Apr 19, 2026" },
];

const STATUS_C: Record<string, string> = { SOLD: "#00FF88", LISTED: "#00FFFF", ACTIVE_AUCTION: "#FFD700", FLAGGED: "#FF2DAA" };
const TYPE_C: Record<string, string> = { ART: "#FF2DAA", MOMENT: "#FFD700", COLLECTIBLE: "#AA2DFF", MUSIC: "#00FFFF", "TICKET-ART": "#00FF88" };

export default function AdminNftSalesPage() {
  const sold = NFTS.filter(n => n.status === "SOLD");
  const totalRevenue = sold.reduce((a, n) => a + n.price, 0);
  const tmiCut = totalRevenue * 0.20;
  const royaltyPaid = sold.reduce((a, n) => a + n.price * (n.royalty / 100), 0);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "32px 24px 80px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, color: "#AA2DFF", fontWeight: 800, letterSpacing: "0.2em", marginBottom: 6 }}>ADMIN</div>
          <h1 style={{ fontSize: 24, fontWeight: 900 }}>NFT Sales</h1>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>Fixed + auction NFT sales · 20% TMI cut · 10% creator royalty on resale</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 40 }}>
          {[
            { l: "TOTAL REVENUE", v: `$${totalRevenue.toLocaleString()}`, c: "#00FF88" },
            { l: "TMI CUT (20%)", v: `$${tmiCut.toLocaleString()}`, c: "#FF2DAA" },
            { l: "ROYALTIES PAID", v: `$${royaltyPaid.toLocaleString()}`, c: "#AA2DFF" },
            { l: "ACTIVE LISTINGS", v: NFTS.filter(n => n.status !== "SOLD").length, c: "#00FFFF" },
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
              {["NFT", "CREATOR", "TYPE", "SALE TYPE", "PRICE", "ROYALTY", "STATUS", "BUYER", "DATE"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontSize: 8, color: "rgba(255,255,255,0.3)", fontWeight: 800 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {NFTS.map(n => (
              <tr key={n.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ padding: "14px 12px", fontWeight: 700 }}>{n.name}</td>
                <td style={{ padding: "14px 12px", color: "rgba(255,255,255,0.5)" }}>{n.creator}</td>
                <td style={{ padding: "14px 12px" }}>
                  <span style={{ fontSize: 8, fontWeight: 800, color: TYPE_C[n.type] ?? "#fff", border: `1px solid ${TYPE_C[n.type] ?? "#fff"}40`, borderRadius: 4, padding: "3px 7px" }}>{n.type}</span>
                </td>
                <td style={{ padding: "14px 12px", color: "rgba(255,255,255,0.4)", fontSize: 10 }}>{n.saleType}</td>
                <td style={{ padding: "14px 12px", color: "#00FF88", fontWeight: 800 }}>${n.price}</td>
                <td style={{ padding: "14px 12px", color: "#AA2DFF" }}>{n.royalty}%</td>
                <td style={{ padding: "14px 12px" }}>
                  <span style={{ fontSize: 8, fontWeight: 800, color: STATUS_C[n.status] ?? "#fff", border: `1px solid ${STATUS_C[n.status] ?? "#fff"}40`, borderRadius: 4, padding: "3px 7px" }}>{n.status.replace("_", " ")}</span>
                </td>
                <td style={{ padding: "14px 12px", color: "rgba(255,255,255,0.4)", fontSize: 10 }}>{n.buyer}</td>
                <td style={{ padding: "14px 12px", color: "rgba(255,255,255,0.4)", fontSize: 10 }}>{n.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
