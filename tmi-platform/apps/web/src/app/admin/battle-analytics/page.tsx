import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin: Battle Analytics | TMI" };

const BATTLE_TYPE_STATS = [
  { type: "MC BATTLE (VOCAL)", battles: 44, participants: 88, avgVotes: 312, prizeOut: 4400, entryRevenue: 880, votingMode: "CROWD" },
  { type: "DIRTY DOZENS", battles: 22, participants: 66, avgVotes: 520, prizeOut: 2200, entryRevenue: 440, votingMode: "CROWD" },
  { type: "INSTRUMENTAL DUEL", battles: 18, participants: 36, avgVotes: 198, prizeOut: 3600, entryRevenue: 360, votingMode: "JUDGE" },
  { type: "GROUP BATTLE", battles: 9, participants: 54, avgVotes: 402, prizeOut: 4500, entryRevenue: 900, votingMode: "HYBRID" },
  { type: "PRODUCER FACE-OFF", battles: 12, participants: 24, avgVotes: 144, prizeOut: 2400, entryRevenue: 240, votingMode: "JUDGE" },
  { type: "FREESTYLE CIPHER", battles: 31, participants: 62, avgVotes: 280, prizeOut: 1550, entryRevenue: 620, votingMode: "CROWD" },
];

const TOP_PERFORMERS = [
  { name: "Wavetek", wins: 12, battles: 14, winRate: 86, earnings: 3600 },
  { name: "Krypt", wins: 9, battles: 12, winRate: 75, earnings: 2700 },
  { name: "FlowMaster", wins: 7, battles: 10, winRate: 70, earnings: 2100 },
  { name: "Neon MC", wins: 6, battles: 9, winRate: 67, earnings: 1800 },
];

export default function AdminBattleAnalyticsPage() {
  const totalBattles = BATTLE_TYPE_STATS.reduce((a, b) => a + b.battles, 0);
  const totalEntryRevenue = BATTLE_TYPE_STATS.reduce((a, b) => a + b.entryRevenue, 0);
  const totalPrizeOut = BATTLE_TYPE_STATS.reduce((a, b) => a + b.prizeOut, 0);
  const tmiCut = totalEntryRevenue * 0.20;

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "32px 24px 80px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, color: "#FFD700", fontWeight: 800, letterSpacing: "0.2em", marginBottom: 6 }}>ADMIN</div>
          <h1 style={{ fontSize: 24, fontWeight: 900 }}>Battle Analytics</h1>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>Performance metrics across all battle types, voting modes, and prize distribution.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 40 }}>
          {[
            { l: "TOTAL BATTLES", v: totalBattles, c: "#FFD700" },
            { l: "ENTRY REVENUE", v: `$${totalEntryRevenue.toLocaleString()}`, c: "#00FF88" },
            { l: "PRIZE PAID OUT", v: `$${totalPrizeOut.toLocaleString()}`, c: "#00FFFF" },
            { l: "TMI CUT (20%)", v: `$${tmiCut.toLocaleString()}`, c: "#FF2DAA" },
          ].map(s => (
            <div key={s.l} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${s.c}18`, borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 9, color: s.c, fontWeight: 800, marginBottom: 4 }}>{s.l}</div>
              <div style={{ fontSize: 22, fontWeight: 900 }}>{s.v}</div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 800, letterSpacing: "0.15em", marginBottom: 14 }}>BY BATTLE TYPE</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                {["TYPE", "BATTLES", "PARTICIPANTS", "AVG VOTES", "VOTING MODE", "ENTRY REV", "PRIZE OUT"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontSize: 8, color: "rgba(255,255,255,0.3)", fontWeight: 800 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BATTLE_TYPE_STATS.map(b => (
                <tr key={b.type} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "14px 12px", fontWeight: 700, fontSize: 11 }}>{b.type}</td>
                  <td style={{ padding: "14px 12px", color: "#FFD700", fontWeight: 800 }}>{b.battles}</td>
                  <td style={{ padding: "14px 12px", color: "rgba(255,255,255,0.6)" }}>{b.participants}</td>
                  <td style={{ padding: "14px 12px", color: "rgba(255,255,255,0.6)" }}>{b.avgVotes}</td>
                  <td style={{ padding: "14px 12px" }}>
                    <span style={{ fontSize: 8, fontWeight: 800, color: b.votingMode === "CROWD" ? "#00FFFF" : b.votingMode === "JUDGE" ? "#AA2DFF" : "#FFD700", border: `1px solid ${b.votingMode === "CROWD" ? "#00FFFF" : b.votingMode === "JUDGE" ? "#AA2DFF" : "#FFD700"}40`, borderRadius: 4, padding: "3px 7px" }}>{b.votingMode}</span>
                  </td>
                  <td style={{ padding: "14px 12px", color: "#00FF88", fontWeight: 800 }}>${b.entryRevenue.toLocaleString()}</td>
                  <td style={{ padding: "14px 12px", color: "#00FFFF" }}>${b.prizeOut.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 800, letterSpacing: "0.15em", marginBottom: 14 }}>TOP PERFORMERS</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                {["ARTIST", "WINS", "BATTLES", "WIN RATE", "TOTAL EARNINGS"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontSize: 8, color: "rgba(255,255,255,0.3)", fontWeight: 800 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TOP_PERFORMERS.map((p, i) => (
                <tr key={p.name} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "14px 12px", fontWeight: 700 }}>
                    <span style={{ color: i === 0 ? "#FFD700" : "rgba(255,255,255,0.3)", marginRight: 8, fontSize: 10 }}>#{i + 1}</span>
                    {p.name}
                  </td>
                  <td style={{ padding: "14px 12px", color: "#FFD700", fontWeight: 800 }}>{p.wins}</td>
                  <td style={{ padding: "14px 12px", color: "rgba(255,255,255,0.5)" }}>{p.battles}</td>
                  <td style={{ padding: "14px 12px", color: p.winRate >= 80 ? "#00FF88" : p.winRate >= 60 ? "#FFD700" : "rgba(255,255,255,0.5)", fontWeight: 700 }}>{p.winRate}%</td>
                  <td style={{ padding: "14px 12px", color: "#00FF88", fontWeight: 800 }}>${p.earnings.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
