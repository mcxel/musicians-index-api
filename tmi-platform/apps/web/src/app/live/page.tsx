import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live | TMI",
  description: "All live rooms, concerts, battles, and cyphers happening right now on TMI.",
};

const LIVE_NOW = [
  { slug: "world",   label: "Live World",        type: "WORLD",   viewers: 22400, icon: "🌐", color: "#00FFFF",  desc: "The main TMI world room — always open." },
  { slug: "cypher",  label: "Monday Cypher #4",  type: "CYPHER",  viewers: 15800, icon: "🎙️", color: "#FF2DAA",  desc: "Live 90-second freestyle rounds. Top 3 win XP." },
  { slug: "battles", label: "Wavetek vs Krypt",   type: "BATTLE",  viewers: 14200, icon: "⚔️", color: "#FFD700",  desc: "1v1 rap battle — audience votes in real time." },
  { slug: "concert-1", label: "Neon Vibe Residency", type: "CONCERT", viewers: 8400, icon: "🎧", color: "#AA2DFF", desc: "Monday electronic residency, live." },
];

const COMING_UP = [
  { slug: "zuri",    label: "Zuri Bloom Session", type: "CONCERT", date: "Tue 7:30 PM EST", icon: "🌍", color: "#00FF88" },
  { slug: "dd4",     label: "Dirty Dozens E04",   type: "D-DOZENS",date: "Mon 8:00 PM EST", icon: "👑", color: "#FFD700" },
  { slug: "wavetek", label: "Fifth Ward Live",     type: "CONCERT", date: "Sat 9:00 PM EST", icon: "🎤", color: "#FF2DAA" },
];

const TYPE_COLOR: Record<string, string> = {
  WORLD: "#00FFFF", CYPHER: "#FF2DAA", BATTLE: "#FFD700",
  CONCERT: "#AA2DFF", "D-DOZENS": "#FFD700",
};

export default function LiveIndexPage() {
  const totalViewers = LIVE_NOW.reduce((a, r) => a + r.viewers, 0);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <section style={{ textAlign: "center", padding: "64px 24px 40px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#00FF88", display: "inline-block", boxShadow: "0 0 10px #00FF88" }} />
          <span style={{ fontSize: 9, letterSpacing: "0.4em", color: "#00FF88", fontWeight: 800 }}>
            {totalViewers.toLocaleString()} LIVE NOW
          </span>
        </div>
        <h1 style={{ fontSize: "clamp(1.8rem,5vw,3.2rem)", fontWeight: 900, marginBottom: 12 }}>
          TMI Live
        </h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", maxWidth: 460, margin: "0 auto 28px" }}>
          Concerts, battles, cyphers, and world rooms — all happening right now.
        </p>
        <Link href="/live/world" style={{ display: "inline-block", padding: "12px 32px", fontSize: 11, fontWeight: 800, letterSpacing: "0.18em", color: "#050510", background: "linear-gradient(135deg,#00FF88,#00AABB)", borderRadius: 10, textDecoration: "none" }}>
          ENTER LIVE WORLD
        </Link>
      </section>

      {/* Live Now */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px 0" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#00FF88", fontWeight: 800, marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#00FF88", display: "inline-block" }} />
          HAPPENING NOW
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16, marginBottom: 48 }}>
          {LIVE_NOW.map(room => (
            <Link key={room.slug} href={`/live/${room.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
              <article style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${room.color}20`, borderRadius: 14, padding: 22, cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <span style={{ fontSize: 32 }}>{room.icon}</span>
                  <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.12em", color: room.color, border: `1px solid ${room.color}40`, borderRadius: 4, padding: "3px 8px" }}>
                    {room.type}
                  </span>
                </div>
                <h2 style={{ fontSize: 15, fontWeight: 800, marginBottom: 6 }}>{room.label}</h2>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", lineHeight: 1.5, marginBottom: 14 }}>{room.desc}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00FF88", display: "inline-block" }} />
                  <span style={{ fontSize: 10, color: "#00FF88", fontWeight: 700 }}>{room.viewers.toLocaleString()} watching</span>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* Coming up */}
        <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#00FFFF", fontWeight: 800, marginBottom: 20 }}>
          COMING UP
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {COMING_UP.map(item => (
            <Link key={item.slug} href={`/live/${item.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
              <div style={{ display: "flex", gap: 14, alignItems: "center", padding: "14px 20px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 10 }}>
                <span style={{ fontSize: 22 }}>{item.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{item.label}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{item.date}</div>
                </div>
                <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.1em", color: TYPE_COLOR[item.type] ?? "#fff" }}>
                  {item.type}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Navigation */}
        <div style={{ display: "flex", gap: 12, marginTop: 40, flexWrap: "wrap" }}>
          <Link href="/concerts" style={{ padding: "9px 20px", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "#AA2DFF", border: "1px solid rgba(170,45,255,0.3)", borderRadius: 8, textDecoration: "none" }}>CONCERTS</Link>
          <Link href="/battles" style={{ padding: "9px 20px", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "#FFD700", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 8, textDecoration: "none" }}>BATTLES</Link>
          <Link href="/cypher" style={{ padding: "9px 20px", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "#FF2DAA", border: "1px solid rgba(255,45,170,0.3)", borderRadius: 8, textDecoration: "none" }}>CYPHER</Link>
          <Link href="/dirty-dozens" style={{ padding: "9px 20px", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "#FFD700", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 8, textDecoration: "none" }}>DIRTY DOZENS</Link>
        </div>
      </section>
    </main>
  );
}
