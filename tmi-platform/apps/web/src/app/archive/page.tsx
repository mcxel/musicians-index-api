import Link from "next/link";

const ARCHIVE_SECTIONS = [
  { label: "Season 1 Battles", count: 142, route: "/battles?season=1", accent: "#AA2DFF" },
  { label: "Magazine Issues", count: 18, route: "/magazine", accent: "#FF2DAA" },
  { label: "Past Live Shows", count: 67, route: "/shows?past=1", accent: "#00FFFF" },
  { label: "Artist Features", count: 89, route: "/articles?type=feature", accent: "#FFD700" },
  { label: "Cypher Replays", count: 34, route: "/cyphers?archived=1", accent: "#22c55e" },
  { label: "Beat Vault", count: 212, route: "/beat-vault", accent: "#f59e0b" },
];

export default function ArchivePage() {
  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "40px 24px 80px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <div style={{ marginBottom: 36 }}>
          <Link href="/" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Home</Link>
        </div>
        <div style={{ fontSize: 10, letterSpacing: 5, color: "rgba(255,255,255,0.4)", fontWeight: 800, marginBottom: 8 }}>TMI</div>
        <h1 style={{ fontSize: "clamp(26px,5vw,44px)", fontWeight: 900, margin: "0 0 8px" }}>Archive</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", margin: "0 0 36px" }}>Everything from TMI&rsquo;s history &mdash; past shows, battles, releases, and issues.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 14 }}>
          {ARCHIVE_SECTIONS.map((s) => (
            <Link key={s.label} href={s.route} style={{ textDecoration: "none", color: "inherit" }}>
              <div style={{ background: `${s.accent}06`, border: `1px solid ${s.accent}22`, borderRadius: 14, padding: "24px", display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ fontSize: 26, fontWeight: 900, color: s.accent }}>{s.count}</div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{s.label}</div>
                <div style={{ fontSize: 10, color: s.accent, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const }}>Browse →</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}