import Link from "next/link";

const REWARDS = [
  { label: "Watch 30 min", xp: 150, icon: "👁️" },
  { label: "Tip an Artist", xp: 200, icon: "💎" },
  { label: "Vote in Battle", xp: 100, icon: "🔥" },
  { label: "Share a Room", xp: 75, icon: "📡" },
  { label: "Subscribe to Fan Club", xp: 500, icon: "🌟" },
  { label: "Attend Live Show", xp: 350, icon: "🎭" },
];

export default function StreamWinPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "40px 24px 80px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 780, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 10, letterSpacing: 6, color: "#FF2DAA", fontWeight: 800, marginBottom: 8 }}>STREAM &amp; WIN</div>
          <h1 style={{ fontSize: "clamp(28px,5vw,52px)", fontWeight: 900, margin: "0 0 10px" }}>🌟 Earn XP By Watching</h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", maxWidth: 480, margin: "0 auto" }}>Every action on TMI earns you XP. Level up, unlock rewards, and climb the ranks.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 12, marginBottom: 36 }}>
          {REWARDS.map((r) => (
            <div key={r.label} style={{ background: "rgba(255,45,170,0.05)", border: "1px solid rgba(255,45,170,0.15)", borderRadius: 12, padding: "20px 22px", display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 24 }}>{r.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{r.label}</div>
                <div style={{ fontSize: 11, color: "#FF2DAA", fontWeight: 800, marginTop: 2 }}>+{r.xp} XP</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/live" style={{ padding: "13px 30px", borderRadius: 10, background: "#FF2DAA", color: "#fff", fontWeight: 800, fontSize: 14, textDecoration: "none" }}>Watch Live Now →</Link>
          <Link href="/hub/fan" style={{ padding: "13px 30px", borderRadius: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>My Fan Hub</Link>
        </div>
      </div>
    </main>
  );
}