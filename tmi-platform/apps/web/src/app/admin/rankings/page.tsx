import Link from "next/link";

const SEED_RANK = [
  { rank: 1, name: "Nova Cipher", role: "Performer", xp: 42800, wins: 14, trend: "+3" },
  { rank: 2, name: "Ari Volt", role: "Performer", xp: 38400, wins: 11, trend: "-1" },
  { rank: 3, name: "FlowState.J", role: "Artist", xp: 33100, wins: 9, trend: "+2" },
  { rank: 4, name: "Yung Mako", role: "Performer", xp: 29700, wins: 8, trend: "0" },
  { rank: 5, name: "Phase Two", role: "Artist", xp: 25500, wins: 7, trend: "+1" },
];

export default function AdminRankingsPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "32px 24px 80px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <Link href="/admin" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Admin</Link>
        </div>
        <div style={{ fontSize: 10, letterSpacing: 5, color: "#00FFFF", fontWeight: 800, marginBottom: 4 }}>ADMIN · RANKINGS</div>
        <h1 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, margin: "0 0 28px" }}>Global Rankings</h1>
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 120px 100px 80px 60px", padding: "10px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            <span>#</span><span>Name</span><span>Role</span><span>XP</span><span>Wins</span><span>Trend</span>
          </div>
          {SEED_RANK.map((r) => (
            <div key={r.rank} style={{ display: "grid", gridTemplateColumns: "60px 1fr 120px 100px 80px 60px", padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center", fontSize: 13 }}>
              <span style={{ fontWeight: 900, color: r.rank <= 3 ? ["#FFD700","#C0C0C0","#CD7F32"][r.rank - 1] : "rgba(255,255,255,0.3)" }}>#{r.rank}</span>
              <span style={{ fontWeight: 700 }}>{r.name}</span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>{r.role}</span>
              <span style={{ color: "#00FFFF", fontWeight: 800 }}>{r.xp.toLocaleString()}</span>
              <span style={{ color: "rgba(255,255,255,0.6)" }}>{r.wins}</span>
              <span style={{ color: r.trend.startsWith("+") ? "#22c55e" : r.trend.startsWith("-") ? "#ef4444" : "rgba(255,255,255,0.4)", fontWeight: 800 }}>{r.trend}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 20 }}>
          <Link href="/rankings" style={{ fontSize: 11, color: "#00FFFF", textDecoration: "none" }}>View Public Rankings Page →</Link>
        </div>
      </div>
    </main>
  );
}