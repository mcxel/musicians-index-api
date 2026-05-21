import Link from "next/link";

const EVENTS = [
  { date: "Jan 2026", title: "TMI Platform Launch", type: "milestone", detail: "Beta launch with Performer, Fan, and Sponsor hubs." },
  { date: "Feb 2026", title: "Season 1 Battles Begin", type: "season", detail: "First official battle season with 80+ performers." },
  { date: "Mar 2026", title: "NFT Lab Goes Live", type: "feature", detail: "Artists can mint digital collectibles tied to their content." },
  { date: "Apr 2026", title: "Magazine Issue #4", type: "magazine", detail: "Cover story: Nova Cipher's 8-streak record." },
  { date: "May 2026", title: "Season 1 Finals", type: "season", detail: "Nova Cipher crowned Season 1 Champion at Cypher Arena." },
  { date: "Jun 2026", title: "Season 2 Coming", type: "upcoming", detail: "New format, new sponsors, new mechanics. Get ready." },
];

const TYPE_COLOR: Record<string, string> = { milestone: "#FFD700", season: "#AA2DFF", feature: "#00FFFF", magazine: "#FF2DAA", upcoming: "#22c55e" };

export default function TimelinePage() {
  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "40px 24px 80px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 10, letterSpacing: 5, color: "#00FFFF", fontWeight: 800, marginBottom: 8 }}>HISTORY</div>
          <h1 style={{ fontSize: "clamp(26px,5vw,44px)", fontWeight: 900, margin: "0 0 8px" }}>TMI Timeline</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>The story of The Musician&rsquo;s Index, milestone by milestone.</p>
        </div>
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", left: 20, top: 0, bottom: 0, width: 2, background: "rgba(255,255,255,0.06)" }} />
          {EVENTS.map((e, i) => (
            <div key={i} style={{ paddingLeft: 54, paddingBottom: 32, position: "relative" }}>
              <div style={{ position: "absolute", left: 12, top: 4, width: 18, height: 18, borderRadius: "50%", background: TYPE_COLOR[e.type], border: "3px solid #05060c" }} />
              <div style={{ fontSize: 10, color: TYPE_COLOR[e.type], fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>{e.date} · {e.type}</div>
              <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 6 }}>{e.title}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.55 }}>{e.detail}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16, display: "flex", gap: 16, flexWrap: "wrap" }}>
          <Link href="/magazine" style={{ fontSize: 12, color: "#FF2DAA", textDecoration: "none", fontWeight: 700 }}>Read the Magazine →</Link>
          <Link href="/seasons" style={{ fontSize: 12, color: "#AA2DFF", textDecoration: "none", fontWeight: 700 }}>Season History</Link>
        </div>
      </div>
    </main>
  );
}