import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cypher Genres | TMI",
  description: "All cypher formats on TMI — hip-hop, R&B, gospel, jazz, EDM, and more. Pick your genre and enter.",
};

const CYPHER_GENRES = [
  { id: "hiphop",        label: "Hip-Hop",          icon: "🎤", color: "#FF2DAA", entry: "1 min freestyle", beatType: "House beat provided", active: 4 },
  { id: "battle-rap",    label: "Battle Rap",        icon: "⚔️", color: "#FFD700", entry: "90 sec written or off-dome", beatType: "Beat optional", active: 2 },
  { id: "hardcore-rap",  label: "Hardcore Rap",      icon: "💀", color: "#AA2DFF", entry: "60 sec, explicit allowed", beatType: "Beat required", active: 1 },
  { id: "rnb",           label: "R&B",               icon: "🌹", color: "#00FFFF", entry: "90 sec live vocal", beatType: "Backing track", active: 3 },
  { id: "country",       label: "Country",           icon: "🤠", color: "#FFD700", entry: "90 sec, instrument encouraged", beatType: "Beat optional", active: 1 },
  { id: "rock",          label: "Rock",              icon: "🎸", color: "#FF2DAA", entry: "60 sec live or recorded", beatType: "Live preferred", active: 2 },
  { id: "pop",           label: "Pop",               icon: "⭐", color: "#00FFFF", entry: "90 sec polished performance", beatType: "Backing track", active: 2 },
  { id: "gospel",        label: "Gospel",            icon: "🙏", color: "#00FF88", entry: "90 sec solo or group", beatType: "Beat optional", active: 2 },
  { id: "jazz",          label: "Jazz",              icon: "🎷", color: "#FFD700", entry: "90 sec improv, live instrument", beatType: "No beat — live only", active: 1 },
  { id: "blues",         label: "Blues",             icon: "🎵", color: "#AA2DFF", entry: "90 sec live or acoustic", beatType: "Beat optional", active: 1 },
  { id: "latin",         label: "Latin",             icon: "🌴", color: "#FFD700", entry: "90 sec, rhythm required", beatType: "Backing track", active: 2 },
  { id: "reggae",        label: "Reggae",            icon: "🇯🇲", color: "#00FF88", entry: "90 sec vibes", beatType: "House beat provided", active: 1 },
  { id: "edm",           label: "EDM",               icon: "🎧", color: "#00FFFF", entry: "60 sec DJ set or live mix", beatType: "Producer submits", active: 2 },
  { id: "instrumental",  label: "Instrumental",      icon: "🎼", color: "#AA2DFF", entry: "90 sec no vocals", beatType: "Live instrument", active: 2 },
  { id: "producer",      label: "Producer Cypher",   icon: "🎛️", color: "#FFD700", entry: "Beat presentation, 90 sec", beatType: "Producer submits", active: 3 },
  { id: "freestyle-open",label: "Freestyle Open",    icon: "🌊", color: "#00FF88", entry: "90 sec any genre welcome", beatType: "House beat provided", active: 6 },
];

export default function CypherGenresPage() {
  const totalActive = CYPHER_GENRES.reduce((a, g) => a + g.active, 0);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <section style={{ textAlign: "center", padding: "64px 24px 40px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#FF2DAA", fontWeight: 800, marginBottom: 12 }}>TMI CYPHER</div>
        <h1 style={{ fontSize: "clamp(1.8rem,5vw,3.2rem)", fontWeight: 900, marginBottom: 12 }}>Cypher Genres</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", maxWidth: 480, margin: "0 auto 12px", lineHeight: 1.6 }}>
          Every genre has its own cypher with its own beat rules, entry format, and culture.
        </p>
        <div style={{ fontSize: 11, color: "#00FF88", fontWeight: 700, marginBottom: 28 }}>
          {totalActive} cyphers active right now
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/cypher/create" style={{ padding: "10px 24px", fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", color: "#050510", background: "#FF2DAA", borderRadius: 8, textDecoration: "none" }}>
            START A CYPHER
          </Link>
          <Link href="/cypher" style={{ padding: "10px 24px", fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", color: "#FF2DAA", border: "1px solid rgba(255,45,170,0.4)", borderRadius: 8, textDecoration: "none" }}>
            LIVE CYPHERS
          </Link>
        </div>
      </section>

      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 14 }}>
          {CYPHER_GENRES.map(g => (
            <Link key={g.id} href={`/cypher?genre=${g.id}`} style={{ textDecoration: "none", color: "inherit" }}>
              <article style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${g.color}18`, borderRadius: 14, padding: "22px 22px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 26 }}>{g.icon}</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800 }}>{g.label}</div>
                      {g.active > 0 && (
                        <div style={{ fontSize: 9, color: "#00FF88", fontWeight: 700, marginTop: 2 }}>
                          ● {g.active} active
                        </div>
                      )}
                    </div>
                  </div>
                  <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.1em", color: g.color, border: `1px solid ${g.color}40`, borderRadius: 4, padding: "3px 8px" }}>
                    {g.id.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>
                  Entry: {g.entry}
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
                  Beat: {g.beatType}
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
