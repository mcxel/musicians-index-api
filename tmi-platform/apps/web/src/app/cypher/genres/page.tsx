import Link from "next/link";
import type { Metadata } from "next";
import { listCypherFormats } from "@/lib/cypher/CypherDefinition";

export const metadata: Metadata = {
  title: "Cypher Formats | TMI",
  description:
    "All cypher formats on TMI — hip-hop, rock bands, country, DJ B2B, producers, drums, guitar, horns, open mix, and more. Pick your style and enter.",
};

export default function CypherGenresPage() {
  const formats = listCypherFormats();

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <section style={{ textAlign: "center", padding: "64px 24px 40px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#FF2DAA", fontWeight: 800, marginBottom: 12 }}>TMI CYPHER</div>
        <h1 style={{ fontSize: "clamp(1.8rem,5vw,3.2rem)", fontWeight: 900, marginBottom: 12 }}>Cypher Formats</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", maxWidth: 520, margin: "0 auto 12px", lineHeight: 1.6 }}>
          Not hip-hop only. Every style has a circle — bands, country, DJs, producers, instruments, and open mix.
        </p>
        <div style={{ fontSize: 11, color: "#00FF88", fontWeight: 700, marginBottom: 28 }}>
          {formats.length} formats · idle rotation mixes styles across sessions
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
          {formats.map((g) => (
            <Link key={g.id} href={`/cypher?genre=${g.styleSlot}`} style={{ textDecoration: "none", color: "inherit" }}>
              <article style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${g.accentColor}18`, borderRadius: 14, padding: "22px 22px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 26 }}>{g.emoji}</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800 }}>{g.label}</div>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", fontWeight: 700, marginTop: 2 }}>
                        Needs {g.needsPerformers} {g.openCallRole}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.1em", color: g.accentColor, border: `1px solid ${g.accentColor}40`, borderRadius: 4, padding: "3px 8px" }}>
                    {g.styleSlot.replace(/_/g, " ").toUpperCase()}
                  </span>
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>
                  Entry: {g.entryHint}
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
                  Beat: {g.beatHint}
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
