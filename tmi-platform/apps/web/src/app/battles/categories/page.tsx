import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Battle Categories | TMI",
  description: "All battle formats on TMI — vocal, instrument, group, Dirty Dozens. Pick your class and enter.",
};

const BATTLE_CLASSES = [
  {
    class: "vocal", label: "Vocal Battles", color: "#FF2DAA", icon: "🎤",
    types: [
      { id: "rapper", label: "Rapper vs Rapper", audioRule: "Beat optional · Acapella allowed", prize: "$500" },
      { id: "singer", label: "Singer vs Singer", audioRule: "Backing track optional", prize: "$500" },
      { id: "beatbox", label: "Beatbox Battle", audioRule: "Acapella only — no beats", prize: "$250" },
      { id: "country-vocal", label: "Country Vocal Battle", audioRule: "Instrument encouraged", prize: "$250" },
      { id: "rnb-vocal", label: "R&B Vocal Battle", audioRule: "Backing track optional", prize: "$500" },
      { id: "opera", label: "Opera Battle", audioRule: "Acapella or orchestral", prize: "$250" },
    ],
  },
  {
    class: "instrument", label: "Instrument Battles", color: "#00FFFF", icon: "🎸",
    types: [
      { id: "guitar", label: "Guitar Battle", audioRule: "Live instrument only", prize: "$500" },
      { id: "piano", label: "Piano Battle", audioRule: "Live instrument only", prize: "$500" },
      { id: "drums", label: "Drum Battle", audioRule: "Live instrument only", prize: "$500" },
      { id: "trumpet", label: "Trumpet Battle", audioRule: "Live instrument only", prize: "$250" },
      { id: "saxophone", label: "Saxophone Battle", audioRule: "Live instrument only", prize: "$250" },
      { id: "violin", label: "Violin Battle", audioRule: "Live instrument only", prize: "$250" },
      { id: "dj", label: "DJ vs DJ", audioRule: "Live set — no pre-recording", prize: "$500" },
      { id: "mpc", label: "MPC / Sampler Battle", audioRule: "Live production only", prize: "$500" },
      { id: "producer", label: "Producer vs Producer", audioRule: "Submit beat + perform live", prize: "$1,000" },
    ],
  },
  {
    class: "group", label: "Group Battles", color: "#FFD700", icon: "🎼",
    types: [
      { id: "band", label: "Band vs Band", audioRule: "Live performance preferred", prize: "$1,000" },
      { id: "group", label: "Group vs Group", audioRule: "Backing track optional", prize: "$500" },
      { id: "choir", label: "Choir vs Choir", audioRule: "Acapella allowed", prize: "$500" },
      { id: "dance-team", label: "Dance Team vs Dance Team", audioRule: "Backing track optional", prize: "$500" },
      { id: "comedy-group", label: "Comedy Group vs Comedy Group", audioRule: "No beat required", prize: "$250" },
    ],
  },
  {
    class: "dirty-dozens", label: "Dirty Dozens Formats", color: "#AA2DFF", icon: "😤",
    types: [
      { id: "yo-mama", label: "Yo Mama Rounds", audioRule: "No beat — words only", prize: "$500" },
      { id: "roast", label: "Comedy Roast", audioRule: "No beat required", prize: "$500" },
      { id: "freestyle-roast", label: "Freestyle Roast", audioRule: "Beat optional", prize: "$500" },
      { id: "insult-battle", label: "Insult Battle", audioRule: "No beat — crowd votes", prize: "$250" },
    ],
  },
];

const GLOBAL_INSTRUMENTS = [
  "Guitar", "Bass", "Drums", "Piano", "Keyboard", "Trumpet", "Saxophone", "Violin", "Cello",
  "Flute", "Harmonica", "Percussion", "Beatbox", "MPC / Sampler", "Turntables / DJ", "Synth",
  "Sitar", "Tabla", "Oud", "Kora", "Djembe", "Balalaika", "Shamisen", "Erhu", "Guzheng",
  "Taiko", "Didgeridoo", "Steel Pan", "Accordion", "Bagpipes", "Pan Flute",
];

export default function BattleCategoriesPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <section style={{ textAlign: "center", padding: "64px 24px 40px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#FF2DAA", fontWeight: 800, marginBottom: 12 }}>TMI BATTLES</div>
        <h1 style={{ fontSize: "clamp(1.8rem,5vw,3.2rem)", fontWeight: 900, marginBottom: 12 }}>Battle Categories</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", maxWidth: 520, margin: "0 auto 28px", lineHeight: 1.6 }}>
          Every performer type. Every genre. Every format. Find your class and enter.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/battles/create" style={{ padding: "10px 24px", fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", color: "#050510", background: "#FF2DAA", borderRadius: 8, textDecoration: "none" }}>
            CREATE BATTLE
          </Link>
          <Link href="/battles" style={{ padding: "10px 24px", fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", color: "#FF2DAA", border: "1px solid rgba(255,45,170,0.4)", borderRadius: 8, textDecoration: "none" }}>
            VIEW LIVE BATTLES
          </Link>
        </div>
      </section>

      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px" }}>
        {BATTLE_CLASSES.map(bc => (
          <div key={bc.class} style={{ marginBottom: 52 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <span style={{ fontSize: 24 }}>{bc.icon}</span>
              <div>
                <div style={{ fontSize: 9, letterSpacing: "0.25em", color: bc.color, fontWeight: 800 }}>{bc.class.toUpperCase()}</div>
                <h2 style={{ fontSize: 20, fontWeight: 900 }}>{bc.label}</h2>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 12 }}>
              {bc.types.map(bt => (
                <Link key={bt.id} href={`/battles?type=${bt.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <article style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${bc.color}18`, borderRadius: 12, padding: "18px 20px", cursor: "pointer" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div style={{ fontSize: 13, fontWeight: 800 }}>{bt.label}</div>
                      <span style={{ fontSize: 12, fontWeight: 900, color: "#00FF88", flexShrink: 0, marginLeft: 8 }}>{bt.prize}</span>
                    </div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginBottom: 14 }}>{bt.audioRule}</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.1em", color: bc.color, border: `1px solid ${bc.color}40`, borderRadius: 4, padding: "3px 8px" }}>
                        {bc.class.toUpperCase()}
                      </span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* Global Instruments */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 40 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "rgba(255,255,255,0.35)", fontWeight: 800, marginBottom: 20 }}>
            SUPPORTED INSTRUMENTS — GLOBAL
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {GLOBAL_INSTRUMENTS.map(name => (
              <span key={name} style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "5px 12px" }}>
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
