import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin: Beat Sales | TMI" };

const BEATS = [
  { id: "b1", title: "Midnight Bars", producer: "Wavetek", genre: "Trap", plays: 1842, basicSales: 12, premiumSales: 5, exclusiveSales: 1, basicRev: 348, premiumRev: 295, exclusiveRev: 499, auctionRev: 0 },
  { id: "b2", title: "The Code", producer: "FlowMaster", genre: "Boom Bap", plays: 921, basicSales: 6, premiumSales: 2, exclusiveSales: 0, basicRev: 174, premiumRev: 118, exclusiveRev: 0, auctionRev: 1050 },
  { id: "b3", title: "808 Dreams", producer: "Krypt", genre: "Drill", plays: 654, basicSales: 4, premiumSales: 3, exclusiveSales: 0, basicRev: 116, premiumRev: 177, exclusiveRev: 0, auctionRev: 0 },
  { id: "b4", title: "Cyber Genesis", producer: "TMI Beats", genre: "Electronic", plays: 388, basicSales: 2, premiumSales: 1, exclusiveSales: 0, basicRev: 58, premiumRev: 59, exclusiveRev: 0, auctionRev: 0 },
  { id: "b5", title: "Lagos Nights", producer: "Neon Vibe", genre: "Afrobeats", plays: 279, basicSales: 3, premiumSales: 0, exclusiveSales: 0, basicRev: 87, premiumRev: 0, exclusiveRev: 0, auctionRev: 0 },
];

export default function AdminBeatSalesPage() {
  const totalRev = BEATS.reduce((a, b) => a + b.basicRev + b.premiumRev + b.exclusiveRev + b.auctionRev, 0);
  const tmiCut = totalRev * 0.30;
  const creatorPayout = totalRev - tmiCut;
  const totalSales = BEATS.reduce((a, b) => a + b.basicSales + b.premiumSales + b.exclusiveSales, 0);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "32px 24px 80px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, color: "#FFD700", fontWeight: 800, letterSpacing: "0.2em", marginBottom: 6 }}>ADMIN</div>
          <h1 style={{ fontSize: 24, fontWeight: 900 }}>Beat Sales</h1>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>Basic / Premium / Exclusive license revenue · 30% TMI cut</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 40 }}>
          {[
            { l: "TOTAL REVENUE", v: `$${totalRev.toLocaleString()}`, c: "#00FF88" },
            { l: "TMI CUT (30%)", v: `$${tmiCut.toLocaleString()}`, c: "#FF2DAA" },
            { l: "CREATOR PAYOUT", v: `$${creatorPayout.toLocaleString()}`, c: "#00FFFF" },
            { l: "TOTAL SALES", v: totalSales, c: "#FFD700" },
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
              {["BEAT", "PRODUCER", "GENRE", "PLAYS", "BASIC", "PREMIUM", "EXCLUSIVE", "AUCTION", "TOTAL REV"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontSize: 8, color: "rgba(255,255,255,0.3)", fontWeight: 800 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BEATS.map(b => {
              const rev = b.basicRev + b.premiumRev + b.exclusiveRev + b.auctionRev;
              return (
                <tr key={b.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "14px 12px", fontWeight: 700 }}>{b.title}</td>
                  <td style={{ padding: "14px 12px", color: "rgba(255,255,255,0.5)" }}>{b.producer}</td>
                  <td style={{ padding: "14px 12px", color: "rgba(255,255,255,0.4)", fontSize: 10 }}>{b.genre}</td>
                  <td style={{ padding: "14px 12px", color: "rgba(255,255,255,0.5)" }}>{b.plays.toLocaleString()}</td>
                  <td style={{ padding: "14px 12px" }}><span style={{ color: "#00FFFF" }}>{b.basicSales}</span><span style={{ color: "rgba(255,255,255,0.3)", fontSize: 9 }}> (${b.basicRev})</span></td>
                  <td style={{ padding: "14px 12px" }}><span style={{ color: "#AA2DFF" }}>{b.premiumSales}</span><span style={{ color: "rgba(255,255,255,0.3)", fontSize: 9 }}> (${b.premiumRev})</span></td>
                  <td style={{ padding: "14px 12px" }}><span style={{ color: "#FFD700" }}>{b.exclusiveSales}</span><span style={{ color: "rgba(255,255,255,0.3)", fontSize: 9 }}> (${b.exclusiveRev})</span></td>
                  <td style={{ padding: "14px 12px", color: "rgba(255,255,255,0.4)" }}>{b.auctionRev > 0 ? `$${b.auctionRev}` : "—"}</td>
                  <td style={{ padding: "14px 12px", color: "#00FF88", fontWeight: 800 }}>${rev.toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
