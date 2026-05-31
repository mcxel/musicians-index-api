import ArenaEventShell from "@/components/live/ArenaEventShell";
import Link from "next/link";

export default function AwardCeremonyPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 12, padding: "12px 20px",
        background: "rgba(0,0,0,0.85)", borderBottom: "1px solid rgba(255,215,0,0.18)",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <Link href="/rooms" style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textDecoration: "none", letterSpacing: "0.1em" }}>
          ← ROOMS
        </Link>
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.28em", color: "#FFD700" }}>🏆 AWARD CEREMONY</div>
        <span style={{ marginLeft: "auto", fontSize: 9, fontWeight: 700, color: "#FF2020" }}>● LIVE</span>
      </div>
      <ArenaEventShell roomId="award-ceremony" eventType="live-show" mode="audience" />
      <div style={{ maxWidth: 860, margin: "28px auto 0", padding: "0 20px" }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.24em", color: "rgba(255,255,255,0.3)", marginBottom: 14 }}>
          TONIGHT&apos;S AWARDS
        </div>
        {[
          { cat: "Artist of the Year", nominee: "NeonVoice_X", genre: "R&B" },
          { cat: "Battle Champion", nominee: "SmoothTalk_99", genre: "Hip-Hop" },
          { cat: "Best New Act", nominee: "LaserLyrics", genre: "Trap" },
          { cat: "Producer of the Year", nominee: "DJ Sentinel", genre: "EDM" },
        ].map(a => (
          <div key={a.cat} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "14px 18px", marginBottom: 8,
            background: "rgba(255,215,0,0.05)", border: "1px solid rgba(255,215,0,0.2)", borderRadius: 10,
          }}>
            <div>
              <div style={{ fontSize: 10, color: "#FFD700", fontWeight: 800, letterSpacing: 2 }}>{a.cat}</div>
              <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>{a.nominee}</div>
              <div style={{ fontSize: 9, color: "#888" }}>{a.genre}</div>
            </div>
            <div style={{ fontSize: 28 }}>🏆</div>
          </div>
        ))}
      </div>
    </main>
  );
}
