import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin: Cypher Analytics | TMI" };

const GENRE_STATS = [
  { genre: "Hip-Hop (Classic)", sessions: 38, participants: 312, avgRound: 4.2, topBeat: "Trap Essentials Vol.2", entryFee: "$5", revenue: 1560 },
  { genre: "Trap (ATL)", sessions: 29, participants: 241, avgRound: 3.8, topBeat: "808 ATL Kit", entryFee: "$5", revenue: 1205 },
  { genre: "Drill (UK)", sessions: 14, participants: 98, avgRound: 3.1, topBeat: "UK Drill Pack", entryFee: "$5", revenue: 490 },
  { genre: "R&B Freestyle", sessions: 21, participants: 187, avgRound: 5.0, topBeat: "Late Night Vibes", entryFee: "$3", revenue: 561 },
  { genre: "Afrobeats", sessions: 11, participants: 89, avgRound: 4.6, topBeat: "Lagos Nights", entryFee: "$5", revenue: 445 },
  { genre: "Latin Trap", sessions: 9, participants: 72, avgRound: 3.9, topBeat: "Reggaeton 808", entryFee: "$5", revenue: 360 },
];

const QUEUE_STATS = [
  { type: "OPEN", sessions: 62, avgWait: "2.1 min", fillRate: "94%" },
  { type: "INVITE", sessions: 18, avgWait: "—", fillRate: "100%" },
  { type: "BRACKET", sessions: 8, avgWait: "5.4 min", fillRate: "87%" },
];

export default function AdminCypherAnalyticsPage() {
  const totalSessions = GENRE_STATS.reduce((a, g) => a + g.sessions, 0);
  const totalParticipants = GENRE_STATS.reduce((a, g) => a + g.participants, 0);
  const totalRevenue = GENRE_STATS.reduce((a, g) => a + g.revenue, 0);
  const tmiCut = totalRevenue * 0.20;

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "32px 24px 80px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, color: "#AA2DFF", fontWeight: 800, letterSpacing: "0.2em", marginBottom: 6 }}>ADMIN</div>
          <h1 style={{ fontSize: 24, fontWeight: 900 }}>Cypher Analytics</h1>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>Performance metrics across all cypher genres and queue types.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 40 }}>
          {[
            { l: "TOTAL SESSIONS", v: totalSessions, c: "#AA2DFF" },
            { l: "PARTICIPANTS", v: totalParticipants, c: "#00FFFF" },
            { l: "ENTRY REVENUE", v: `$${totalRevenue.toLocaleString()}`, c: "#00FF88" },
            { l: "TMI CUT (20%)", v: `$${tmiCut.toLocaleString()}`, c: "#FF2DAA" },
          ].map(s => (
            <div key={s.l} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${s.c}18`, borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 9, color: s.c, fontWeight: 800, marginBottom: 4 }}>{s.l}</div>
              <div style={{ fontSize: 22, fontWeight: 900 }}>{s.v}</div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 800, letterSpacing: "0.15em", marginBottom: 14 }}>BY GENRE</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                {["GENRE", "SESSIONS", "PARTICIPANTS", "AVG ROUNDS", "TOP BEAT", "ENTRY FEE", "REVENUE"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontSize: 8, color: "rgba(255,255,255,0.3)", fontWeight: 800 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {GENRE_STATS.map(g => (
                <tr key={g.genre} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "14px 12px", fontWeight: 700 }}>{g.genre}</td>
                  <td style={{ padding: "14px 12px", color: "#AA2DFF", fontWeight: 800 }}>{g.sessions}</td>
                  <td style={{ padding: "14px 12px", color: "rgba(255,255,255,0.6)" }}>{g.participants}</td>
                  <td style={{ padding: "14px 12px", color: "rgba(255,255,255,0.6)" }}>{g.avgRound}</td>
                  <td style={{ padding: "14px 12px", color: "rgba(255,255,255,0.4)", fontSize: 10 }}>{g.topBeat}</td>
                  <td style={{ padding: "14px 12px", color: "#FFD700" }}>{g.entryFee}</td>
                  <td style={{ padding: "14px 12px", color: "#00FF88", fontWeight: 800 }}>${g.revenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 800, letterSpacing: "0.15em", marginBottom: 14 }}>QUEUE TYPE PERFORMANCE</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
            {QUEUE_STATS.map(q => (
              <div key={q.type} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "16px" }}>
                <div style={{ fontSize: 9, color: "#AA2DFF", fontWeight: 800, marginBottom: 10 }}>{q.type} QUEUE</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Sessions</span><span style={{ fontSize: 12, fontWeight: 700 }}>{q.sessions}</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Avg Wait</span><span style={{ fontSize: 12, fontWeight: 700 }}>{q.avgWait}</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Fill Rate</span><span style={{ fontSize: 12, fontWeight: 700, color: "#00FF88" }}>{q.fillRate}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
