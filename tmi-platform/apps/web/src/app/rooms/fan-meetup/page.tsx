import ArenaEventShell from "@/components/live/ArenaEventShell";
import Link from "next/link";

export default function FanMeetupPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 12, padding: "12px 20px",
        background: "rgba(0,0,0,0.85)", borderBottom: "1px solid rgba(0,255,136,0.18)",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <Link href="/rooms" style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textDecoration: "none", letterSpacing: "0.1em" }}>
          ← ROOMS
        </Link>
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.28em", color: "#00FF88" }}>🤝 FAN MEETUP</div>
        <span style={{ marginLeft: "auto", fontSize: 9, fontWeight: 700, color: "#FF2020" }}>● LIVE</span>
      </div>
      <ArenaEventShell roomId="fan-meetup" eventType="live-show" mode="audience" />
      <div style={{ maxWidth: 860, margin: "28px auto 0", padding: "0 20px" }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.24em", color: "rgba(255,255,255,0.3)", marginBottom: 14 }}>
          FEATURED ARTISTS HERE TONIGHT
        </div>
        {["NeonVoice_X", "LaserLyrics", "MidnightMelody", "DJ Sentinel"].map(a => (
          <div key={a} style={{
            display: "flex", alignItems: "center", gap: 14,
            padding: "12px 18px", marginBottom: 8,
            background: "rgba(0,255,136,0.04)", border: "1px solid rgba(0,255,136,0.15)", borderRadius: 10,
          }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(0,255,136,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🎤</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{a}</div>
              <div style={{ fontSize: 9, color: "#888" }}>Signing autographs · Taking photos</div>
            </div>
            <button style={{ padding: "6px 14px", borderRadius: 20, background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.3)", color: "#00FF88", fontSize: 9, fontWeight: 700, cursor: "pointer" }}>
              REQUEST
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
