import Link from "next/link";

const LABELS = [
  { slug: "tmi-records",    name: "TMI Records",    artists: 12, accent: "#00FFFF", desc: "The official TMI platform label. Home of top-ranked performers." },
  { slug: "cypher-motion",  name: "Cypher Motion",  artists: 8,  accent: "#FF2DAA", desc: "Battle-rap and cypher-focused collective. Season 1 champions." },
  { slug: "frequency-wave", name: "Frequency Wave", artists: 6,  accent: "#AA2DFF", desc: "R&B and Neo-Soul artists pushing the genre forward." },
  { slug: "golden-vault",   name: "Golden Vault",   artists: 9,  accent: "#FFD700", desc: "Beat production label. Exclusive instrumentals and licensing." },
];

export default function LabelsPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#060410", color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>
      <div style={{ padding: "32px 24px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Link href="/home/1" style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← HOME</Link>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: "#00FFFF", textTransform: "uppercase", marginBottom: 8, marginTop: 10 }}>TMI LABELS</div>
          <h1 style={{ fontSize: "clamp(26px,5vw,44px)", fontWeight: 900, margin: "0 0 8px" }}>Record Labels</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>Labels, collectives, and rosters on The Musician&apos;s Index.</p>
        </div>
      </div>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
          {LABELS.map((label) => (
            <div key={label.slug} style={{
              background: "rgba(255,255,255,0.03)", border: `1px solid ${label.accent}28`,
              borderRadius: 14, padding: "20px 22px",
            }}>
              <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.18em", color: label.accent, textTransform: "uppercase", marginBottom: 8 }}>LABEL</div>
              <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>{label.name}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 12, lineHeight: 1.5 }}>{label.desc}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{label.artists} artists</span>
                <Link href={`/profile/sponsor/${label.slug}`} style={{ fontSize: 11, fontWeight: 700, color: label.accent, textDecoration: "none" }}>View Roster →</Link>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 32 }}>
          <Link href="/artists" style={{ padding: "10px 22px", borderRadius: 24, fontSize: 12, fontWeight: 800, background: "#00FFFF", color: "#060410", textDecoration: "none" }}>Artists →</Link>
          <Link href="/hub" style={{ padding: "10px 22px", borderRadius: 24, fontSize: 12, fontWeight: 800, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>Hub</Link>
        </div>
      </div>
    </main>
  );
}
