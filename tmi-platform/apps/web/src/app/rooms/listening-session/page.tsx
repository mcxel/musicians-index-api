import ArenaEventShell from "@/components/live/ArenaEventShell";
import Link from "next/link";

export default function ListeningSessionPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 12, padding: "12px 20px",
        background: "rgba(0,0,0,0.85)", borderBottom: "1px solid rgba(170,45,255,0.18)",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <Link href="/rooms" style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textDecoration: "none", letterSpacing: "0.1em" }}>
          ← ROOMS
        </Link>
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.28em", color: "#AA2DFF" }}>🎧 LISTENING SESSION</div>
        <span style={{ marginLeft: "auto", fontSize: 9, fontWeight: 700, color: "#FF2020" }}>● LIVE</span>
      </div>
      <ArenaEventShell roomId="listening-session" eventType="live-show" mode="audience" />
      <div style={{ maxWidth: 860, margin: "28px auto 0", padding: "0 20px" }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.24em", color: "rgba(255,255,255,0.3)", marginBottom: 14 }}>
          TONIGHT&apos;S TRACKLIST
        </div>
        {[
          { n: 1, title: "Crown Up", artist: "NeonVoice_X", dur: "3:42" },
          { n: 2, title: "Midnight Ride", artist: "MidnightMelody", dur: "4:11" },
          { n: 3, title: "Laser Dreams (Unreleased)", artist: "LaserFlow", dur: "3:58" },
          { n: 4, title: "Soul Season", artist: "Amirah Wells", dur: "4:28" },
          { n: 5, title: "World Stage Anthem", artist: "DJ Sentinel", dur: "5:02" },
        ].map(t => (
          <div key={t.n} style={{
            display: "flex", alignItems: "center", gap: 14,
            padding: "12px 18px", marginBottom: 8,
            background: t.n === 1 ? "rgba(170,45,255,0.08)" : "rgba(255,255,255,0.02)",
            border: `1px solid ${t.n === 1 ? "rgba(170,45,255,0.3)" : "rgba(255,255,255,0.06)"}`, borderRadius: 10,
          }}>
            <div style={{ fontSize: 12, color: "#555", minWidth: 18 }}>{t.n}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{t.title}</div>
              <div style={{ fontSize: 9, color: "#888" }}>{t.artist}</div>
            </div>
            {t.n === 1 && <div style={{ fontSize: 9, color: "#AA2DFF", fontWeight: 800, letterSpacing: 2 }}>● NOW</div>}
            <div style={{ fontSize: 10, color: "#555" }}>{t.dur}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
