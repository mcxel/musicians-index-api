import Link from "next/link";

const ROOMS = [
  { id: "wp1", title: "Season 2 Battle Finals", host: "DJ Monarch", viewers: 284, live: true },
  { id: "wp2", title: "Nova Cipher Fan Watch", host: "Fan_XR99", viewers: 118, live: true },
  { id: "wp3", title: "BeatLab Session Replay", host: "FlowState.J", viewers: 0, live: false },
];

export default function WatchPartyPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "40px 24px 80px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <Link href="/live" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Live</Link>
        </div>
        <div style={{ fontSize: 10, letterSpacing: 5, color: "#00FFFF", fontWeight: 800, marginBottom: 8 }}>WATCH PARTY</div>
        <h1 style={{ fontSize: "clamp(26px,5vw,44px)", fontWeight: 900, margin: "0 0 8px" }}>Watch Together</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", margin: "0 0 32px" }}>Join a room and watch live TMI shows with other fans in real time.</p>
        <div style={{ display: "grid", gap: 12 }}>
          {ROOMS.map((r) => (
            <div key={r.id} style={{ background: "rgba(0,255,255,0.03)", border: "1px solid rgba(0,255,255,0.12)", borderRadius: 12, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  {r.live && <span style={{ fontSize: 8, fontWeight: 800, color: "#22c55e", background: "rgba(34,197,94,0.15)", padding: "3px 8px", borderRadius: 4, letterSpacing: "0.15em" }}>LIVE</span>}
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Hosted by {r.host}</span>
                </div>
                <div style={{ fontWeight: 800, fontSize: 15 }}>{r.title}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{r.live ? `${r.viewers} watching` : "Replay available"}</div>
              </div>
              <Link href={`/rooms/${r.id}`} style={{ padding: "10px 20px", borderRadius: 8, background: r.live ? "#00FFFF" : "rgba(255,255,255,0.06)", color: r.live ? "#05060c" : "rgba(255,255,255,0.7)", fontWeight: 800, fontSize: 12, textDecoration: "none", whiteSpace: "nowrap" }}>
                {r.live ? "Join Now" : "Watch Replay"}
              </Link>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 28 }}>
          <Link href="/rooms" style={{ fontSize: 12, color: "#00FFFF", textDecoration: "none", fontWeight: 700 }}>Browse All Rooms →</Link>
        </div>
      </div>
    </main>
  );
}
