import ArenaEventShell from "@/components/live/ArenaEventShell";
import Link from "next/link";

export default function RadioStationPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 12, padding: "12px 20px",
        background: "rgba(0,0,0,0.85)", borderBottom: "1px solid rgba(255,45,170,0.18)",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <Link href="/rooms" style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textDecoration: "none", letterSpacing: "0.1em" }}>
          ← ROOMS
        </Link>
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.28em", color: "#FF2DAA" }}>📻 TMI RADIO</div>
        <span style={{ marginLeft: "auto", fontSize: 9, fontWeight: 700, color: "#FF2020" }}>● ON AIR</span>
      </div>
      <ArenaEventShell roomId="radio-station" eventType="live-show" mode="audience" />
      <div style={{ maxWidth: 860, margin: "28px auto 0", padding: "0 20px" }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.24em", color: "rgba(255,255,255,0.3)", marginBottom: 14 }}>
          NOW BROADCASTING
        </div>
        {[
          { station: "TMI HOT 97.5", dj: "DJ Kronos", genre: "Hip-Hop / R&B", listeners: "12.4K" },
          { station: "TMI SOUL FM", dj: "Amirah Wells", genre: "Soul / Neo-Soul", listeners: "8.1K" },
          { station: "TMI TRAP WAVE", dj: "Traxx Monroe", genre: "Trap / Bass", listeners: "6.8K" },
          { station: "TMI CYPHER 24/7", dj: "Julius", genre: "Freestyle / Battle", listeners: "4.2K" },
        ].map(s => (
          <div key={s.station} style={{
            display: "flex", alignItems: "center", gap: 14,
            padding: "12px 18px", marginBottom: 8,
            background: "rgba(255,45,170,0.04)", border: "1px solid rgba(255,45,170,0.15)", borderRadius: 10,
          }}>
            <div style={{ fontSize: 22 }}>📻</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{s.station}</div>
              <div style={{ fontSize: 9, color: "#888" }}>DJ: {s.dj} · {s.genre}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#FF2DAA" }}>{s.listeners}</div>
              <div style={{ fontSize: 8, color: "#555" }}>listeners</div>
            </div>
            <button style={{ padding: "6px 14px", borderRadius: 20, background: "rgba(255,45,170,0.1)", border: "1px solid rgba(255,45,170,0.3)", color: "#FF2DAA", fontSize: 9, fontWeight: 700, cursor: "pointer" }}>
              TUNE IN
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
