import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Producer Analytics | TMI",
  description: "Track beat plays, sales, revenue, and conversion rates across your TMI producer catalog.",
};

const BEATS_DATA = [
  { title: "Battle Code", genre: "Battle Rap", plays: 7800, sales: 7, revenue: 343, convRate: "0.09%", battleUses: 4, cypherUses: 2, wins: 3 },
  { title: "Midnight Bars", genre: "Hip-Hop", plays: 4200, sales: 5, revenue: 245, convRate: "0.12%", battleUses: 2, cypherUses: 1, wins: 1 },
  { title: "Gold Standard", genre: "Trap", plays: 5600, sales: 2, revenue: 118, convRate: "0.04%", battleUses: 0, cypherUses: 3, wins: 0 },
  { title: "Frequency", genre: "Instrumental", plays: 1900, sales: 0, revenue: 0, convRate: "0%", battleUses: 0, cypherUses: 0, wins: 0 },
];

export default function ProducerAnalyticsPage() {
  const totalPlays = BEATS_DATA.reduce((a, b) => a + b.plays, 0);
  const totalRevenue = BEATS_DATA.reduce((a, b) => a + b.revenue, 0);
  const totalSales = BEATS_DATA.reduce((a, b) => a + b.sales, 0);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#FFD700", fontWeight: 800, marginBottom: 8 }}>PRODUCER ANALYTICS</div>
            <h1 style={{ fontSize: "clamp(1.4rem,3.5vw,2rem)", fontWeight: 900 }}>Beat Performance</h1>
          </div>
          <Link href="/producer/hub" style={{ padding: "9px 18px", fontSize: 9, fontWeight: 800, color: "#FFD700", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 8, textDecoration: "none" }}>← HUB</Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 12, marginBottom: 40 }}>
          {[
            { label: "TOTAL PLAYS", value: totalPlays.toLocaleString(), color: "#AA2DFF" },
            { label: "TOTAL SALES", value: totalSales, color: "#00FF88" },
            { label: "GROSS REVENUE", value: `$${totalRevenue}`, color: "#FFD700" },
            { label: "TMI CUT (30%)", value: `$${Math.round(totalRevenue * 0.3)}`, color: "#FF2DAA" },
            { label: "YOUR PAYOUT", value: `$${Math.round(totalRevenue * 0.7)}`, color: "#00FFFF" },
          ].map(s => (
            <div key={s.label} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${s.color}18`, borderRadius: 12, padding: "16px" }}>
              <div style={{ fontSize: 9, color: s.color, fontWeight: 800, letterSpacing: "0.12em", marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 900 }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "rgba(255,255,255,0.35)", fontWeight: 700, marginBottom: 16 }}>BEAT BREAKDOWN</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                {["BEAT", "GENRE", "PLAYS", "SALES", "REVENUE", "CONV. RATE", "BATTLE USES", "CYPHER USES", "WINS"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontSize: 8, fontWeight: 800, color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BEATS_DATA.map((b, i) => (
                <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "14px 12px", fontWeight: 700 }}>{b.title}</td>
                  <td style={{ padding: "14px 12px", color: "rgba(255,255,255,0.4)" }}>{b.genre}</td>
                  <td style={{ padding: "14px 12px" }}>{b.plays.toLocaleString()}</td>
                  <td style={{ padding: "14px 12px" }}>{b.sales}</td>
                  <td style={{ padding: "14px 12px", color: "#00FF88", fontWeight: 700 }}>${b.revenue}</td>
                  <td style={{ padding: "14px 12px", color: "rgba(255,255,255,0.4)" }}>{b.convRate}</td>
                  <td style={{ padding: "14px 12px", color: "#FF2DAA" }}>{b.battleUses}</td>
                  <td style={{ padding: "14px 12px", color: "#00FFFF" }}>{b.cypherUses}</td>
                  <td style={{ padding: "14px 12px", color: "#FFD700" }}>{b.wins}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
