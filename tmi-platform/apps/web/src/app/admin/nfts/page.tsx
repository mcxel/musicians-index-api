import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin: NFTs | TMI" };

const NFTS = [
  { id: "n1", title: "Cyber Genesis #001", creator: "TMI Art", type: "ART", status: "LIVE", price: 280, sold: true, flags: 0 },
  { id: "n2", title: "Wavetek Original Vol. 1", creator: "Wavetek", type: "MUSIC", status: "LIVE", price: 150, sold: false, flags: 0 },
  { id: "n3", title: "Dirty Dozens S1 Trophy", creator: "TMI", type: "COLLECTIBLE", status: "LIVE", price: 499, sold: false, flags: 0 },
  { id: "n4", title: "Suspicious Art Drop", creator: "Unknown_Artist", type: "ART", status: "FLAGGED", price: 999, sold: false, flags: 3 },
];

export default function AdminNFTsPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "32px 24px 80px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, color: "#00FFFF", fontWeight: 800, letterSpacing: "0.2em", marginBottom: 6 }}>ADMIN</div>
          <h1 style={{ fontSize: 24, fontWeight: 900 }}>NFT Management</h1>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 32 }}>
          {[{ l: "TOTAL", v: NFTS.length, c: "#00FFFF" }, { l: "LIVE", v: NFTS.filter(n => n.status === "LIVE").length, c: "#00FF88" }, { l: "SOLD", v: NFTS.filter(n => n.sold).length, c: "#FFD700" }, { l: "FLAGGED", v: NFTS.filter(n => n.flags > 0).length, c: "#FF2DAA" }].map(s => (
            <div key={s.l} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${s.c}18`, borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 9, color: s.c, fontWeight: 800, marginBottom: 4 }}>{s.l}</div>
              <div style={{ fontSize: 22, fontWeight: 900 }}>{s.v}</div>
            </div>
          ))}
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>{["TITLE", "CREATOR", "TYPE", "STATUS", "PRICE", "SOLD", "FLAGS"].map(h => <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontSize: 8, color: "rgba(255,255,255,0.3)", fontWeight: 800 }}>{h}</th>)}</tr></thead>
          <tbody>
            {NFTS.map(n => (
              <tr key={n.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ padding: "14px 12px", fontWeight: 700 }}>{n.title}</td>
                <td style={{ padding: "14px 12px", color: "rgba(255,255,255,0.5)" }}>{n.creator}</td>
                <td style={{ padding: "14px 12px", color: "rgba(255,255,255,0.4)" }}>{n.type}</td>
                <td style={{ padding: "14px 12px" }}><span style={{ fontSize: 8, fontWeight: 800, color: n.status === "LIVE" ? "#00FF88" : "#FF2DAA", border: `1px solid ${n.status === "LIVE" ? "rgba(0,255,136,0.3)" : "rgba(255,45,170,0.3)"}`, borderRadius: 4, padding: "3px 7px" }}>{n.status}</span></td>
                <td style={{ padding: "14px 12px", color: "#00FFFF" }}>${n.price}</td>
                <td style={{ padding: "14px 12px" }}>{n.sold ? "✓" : "—"}</td>
                <td style={{ padding: "14px 12px", color: n.flags > 0 ? "#FF2DAA" : "rgba(255,255,255,0.3)" }}>{n.flags}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
