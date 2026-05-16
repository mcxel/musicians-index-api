import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin: Auctions | TMI" };

const AUCTIONS = [
  { id: "a1", title: "Holy Water (Beat)", type: "BEAT", status: "LIVE", currentBid: 420, buyout: 1200, bids: 7, endsIn: "2h 14m" },
  { id: "a2", title: "Cyber Genesis NFT #001", type: "NFT", status: "LIVE", currentBid: 280, buyout: 900, bids: 5, endsIn: "4h 22m" },
  { id: "a3", title: "VIP Table — DD Finale", type: "TICKET", status: "LIVE", currentBid: 150, buyout: 400, bids: 9, endsIn: "1d 6h" },
  { id: "a4", title: "Cold World Stems", type: "INSTRUMENTAL", status: "ENDED", currentBid: 1500, buyout: 1500, bids: 14, endsIn: "—" },
];

export default function AdminAuctionsPage() {
  const live = AUCTIONS.filter(a => a.status === "LIVE").length;
  const totalBids = AUCTIONS.reduce((x, a) => x + a.bids, 0);
  const totalValue = AUCTIONS.reduce((x, a) => x + a.currentBid, 0);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "32px 24px 80px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, color: "#FFD700", fontWeight: 800, letterSpacing: "0.2em", marginBottom: 6 }}>ADMIN</div>
          <h1 style={{ fontSize: 24, fontWeight: 900 }}>Auction Monitor</h1>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 32 }}>
          {[{ l: "LIVE AUCTIONS", v: live, c: "#00FF88" }, { l: "TOTAL BIDS", v: totalBids, c: "#00FFFF" }, { l: "BID VALUE", v: `$${totalValue}`, c: "#FFD700" }, { l: "TOTAL AUCTIONS", v: AUCTIONS.length, c: "#AA2DFF" }].map(s => (
            <div key={s.l} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${s.c}18`, borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 9, color: s.c, fontWeight: 800, marginBottom: 4 }}>{s.l}</div>
              <div style={{ fontSize: 22, fontWeight: 900 }}>{s.v}</div>
            </div>
          ))}
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>{["ITEM", "TYPE", "STATUS", "CURRENT BID", "BUYOUT", "BIDS", "ENDS"].map(h => <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontSize: 8, color: "rgba(255,255,255,0.3)", fontWeight: 800 }}>{h}</th>)}</tr></thead>
          <tbody>
            {AUCTIONS.map(a => (
              <tr key={a.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ padding: "14px 12px", fontWeight: 700 }}>{a.title}</td>
                <td style={{ padding: "14px 12px", color: "rgba(255,255,255,0.4)" }}>{a.type}</td>
                <td style={{ padding: "14px 12px" }}><span style={{ fontSize: 8, fontWeight: 800, color: a.status === "LIVE" ? "#00FF88" : "rgba(255,255,255,0.3)", border: `1px solid ${a.status === "LIVE" ? "rgba(0,255,136,0.3)" : "rgba(255,255,255,0.08)"}`, borderRadius: 4, padding: "3px 7px" }}>{a.status}</span></td>
                <td style={{ padding: "14px 12px", fontWeight: 800, color: "#FFD700" }}>${a.currentBid}</td>
                <td style={{ padding: "14px 12px", color: "#00FF88" }}>${a.buyout}</td>
                <td style={{ padding: "14px 12px" }}>{a.bids}</td>
                <td style={{ padding: "14px 12px", color: "rgba(255,255,255,0.4)" }}>{a.endsIn}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
