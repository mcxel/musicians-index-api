"use client";

import Link from "next/link";

const CYPHER_GENRES = [
  { id: "hip-hop", label: "Hip-Hop", sublabel: "Classic · Boom Bap", active: 38, maxParts: 8, entryFee: "$5", beat: "Classic 90s Boom Bap", color: "#00FFFF", href: "/cypher?genre=hip-hop" },
  { id: "trap", label: "Trap", sublabel: "ATL · Drill Fusion", active: 44, maxParts: 10, entryFee: "$5", beat: "808 ATL Kit", color: "#FF2DAA", href: "/cypher?genre=trap" },
  { id: "drill", label: "Drill", sublabel: "UK · Chicago Style", active: 22, maxParts: 6, entryFee: "$5", beat: "UK Drill Pack", color: "#FFD700", href: "/cypher?genre=drill" },
  { id: "rnb", label: "R&B Freestyle", sublabel: "Soul · Neo-Soul", active: 18, maxParts: 6, entryFee: "$3", beat: "Late Night Vibes", color: "#AA2DFF", href: "/cypher?genre=rnb" },
  { id: "afrobeats", label: "Afrobeats", sublabel: "Lagos · Nairobi Sound", active: 14, maxParts: 8, entryFee: "$5", beat: "Lagos Nights", color: "#00FF88", href: "/cypher?genre=afrobeats" },
  { id: "latin", label: "Latin Trap", sublabel: "Reggaeton · Urban", active: 11, maxParts: 6, entryFee: "$5", beat: "Reggaeton 808", color: "#FF2DAA", href: "/cypher?genre=latin" },
  { id: "spoken", label: "Spoken Word", sublabel: "Poetry · Slam", active: 8, maxParts: 4, entryFee: "$2", beat: "Ambient Jazz Loop", color: "#00FFFF", href: "/cypher?genre=spoken" },
  { id: "freestyle", label: "Freestyle Open", sublabel: "Any genre welcome", active: 31, maxParts: 12, entryFee: "FREE", beat: "Rotating BPM Mix", color: "#FFD700", href: "/cypher?genre=freestyle" },
];

const CYPHER_STATS = [
  { label: "OPEN CYPHERS", value: "16", color: "#AA2DFF" },
  { label: "PARTICIPANTS", value: "241", color: "#00FFFF" },
  { label: "GENRES ACTIVE", value: "8", color: "#00FF88" },
  { label: "QUEUE SPOTS", value: "84", color: "#FFD700" },
];

export default function Home3Layout() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "16px 20px 32px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 8, color: "#AA2DFF", fontWeight: 900, letterSpacing: "0.2em", marginBottom: 4 }}>HOME 3 · CYPHER HUB</div>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: "#fff", margin: 0 }}>Cypher Arena</h2>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Pick your genre. Join the queue. Take your turn on the mic.</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/cypher/create" style={{ textDecoration: "none", padding: "8px 14px", background: "rgba(170,45,255,0.15)", border: "1px solid rgba(170,45,255,0.4)", borderRadius: 8, fontSize: 10, fontWeight: 800, color: "#AA2DFF" }}>
            + CREATE CYPHER
          </Link>
          <Link href="/cypher" style={{ textDecoration: "none", padding: "8px 14px", background: "rgba(0,255,255,0.08)", border: "1px solid rgba(0,255,255,0.3)", borderRadius: 8, fontSize: 10, fontWeight: 800, color: "#00FFFF" }}>
            VIEW ALL
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
        {CYPHER_STATS.map(s => (
          <div key={s.label} style={{ background: `${s.color}08`, border: `1px solid ${s.color}20`, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 8, color: s.color, fontWeight: 800, letterSpacing: "0.12em", marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Genre Entry Panels */}
      <div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 800, letterSpacing: "0.15em", marginBottom: 12 }}>SELECT YOUR GENRE</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
          {CYPHER_GENRES.map(g => (
            <Link key={g.id} href={g.href} style={{ textDecoration: "none" }}>
              <div style={{
                background: `linear-gradient(135deg, ${g.color}08, rgba(0,0,0,0.5))`,
                border: `1px solid ${g.color}25`,
                borderRadius: 12,
                padding: "16px 18px",
                transition: "all 0.25s",
                cursor: "pointer",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: "#fff", marginBottom: 2 }}>{g.label}</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{g.sublabel}</div>
                  </div>
                  <span style={{ fontSize: 8, fontWeight: 900, color: g.color, border: `1px solid ${g.color}50`, borderRadius: 4, padding: "3px 8px", whiteSpace: "nowrap" }}>
                    {g.active > 30 ? "🔥 HOT" : g.active > 15 ? "ACTIVE" : "OPEN"}
                  </span>
                </div>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
                    <div style={{ height: "100%", width: `${(g.active / g.maxParts) * 100}%`, background: g.color, borderRadius: 2 }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                    <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{g.active} active</span>
                    <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>max {g.maxParts}</span>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>Beat: {g.beat}</div>
                  <span style={{ fontSize: 10, fontWeight: 800, color: g.color }}>{g.entryFee}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ textAlign: "center", padding: "12px 0" }}>
        <Link href="/cypher/genres" style={{ fontSize: 10, color: "#AA2DFF", fontWeight: 800, textDecoration: "none", letterSpacing: "0.12em", border: "1px solid rgba(170,45,255,0.3)", borderRadius: 8, padding: "8px 16px" }}>
          VIEW ALL 16 GENRES →
        </Link>
      </div>
    </div>
  );
}
