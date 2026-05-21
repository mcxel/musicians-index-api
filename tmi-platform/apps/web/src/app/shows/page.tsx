import Link from "next/link";

const FEATURED_SHOWS = [
  { slug: "nova-cipher-live",    title: "Nova Cipher LIVE",            genre: "Hip-Hop",  time: "Tonight · 9:00 PM ET", status: "live",     viewers: 1240, accent: "#00FFFF" },
  { slug: "cypher-arena-open",   title: "Cypher Arena Open",           genre: "Battle",   time: "May 21 · 7:00 PM ET",  status: "upcoming", viewers: 870,  accent: "#AA2DFF" },
  { slug: "season-2-finals",     title: "TMI Season 2 Finals",         genre: "Mixed",    time: "May 25 · 8:00 PM ET",  status: "upcoming", viewers: 4200, accent: "#FFD700" },
  { slug: "beatlab-friday",      title: "BeatLab Friday Session",      genre: "Producer", time: "May 23 · 10:00 PM ET", status: "upcoming", viewers: 560,  accent: "#FF2DAA" },
  { slug: "underground-vol8",    title: "Freestyle Underground Vol.8", genre: "Hip-Hop",  time: "Ended May 14",          status: "replay",   viewers: 6800, accent: "#22c55e" },
  { slug: "monday-night-stage",  title: "Monday Night Stage",          genre: "R&B",      time: "Ended May 12",          status: "replay",   viewers: 3100, accent: "#f59e0b" },
];

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  live:     { label: "🔴 LIVE",   color: "#ef4444" },
  upcoming: { label: "⏳ SOON",   color: "#f59e0b" },
  replay:   { label: "📼 REPLAY", color: "#6b7280" },
};

const NAMED_SHOWS = [
  { href: "/shows/deal-or-feud",       label: "Deal or Feud",      icon: "🎲" },
  { href: "/shows/name-that-tune",     label: "Name That Tune",    icon: "🎵" },
  { href: "/shows/monthly-idol",       label: "Monthly Idol",      icon: "🏆" },
  { href: "/shows/monday-night-stage", label: "Monday Night Stage",icon: "🎤" },
  { href: "/shows/today",              label: "Today's Shows",     icon: "📅" },
];

export default function ShowsPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#060410", color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>

      <div style={{ padding: "32px 24px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 16, marginBottom: 10 }}>
            <Link href="/home/1" style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← HOME</Link>
            <Link href="/hub/fan" style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.25)", textDecoration: "none" }}>FAN HUB</Link>
          </div>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: "#FF2DAA", textTransform: "uppercase", marginBottom: 8 }}>TMI SHOWS</div>
          <h1 style={{ fontSize: "clamp(26px,5vw,44px)", fontWeight: 900, margin: "0 0 8px", letterSpacing: "-0.5px" }}>Live Shows & Events</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", margin: 0 }}>Performances, battles, cyphers — live and on-demand.</p>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "28px 24px" }}>

        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 14 }}>Featured</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
            {FEATURED_SHOWS.map((show) => {
              const statusCfg = STATUS_CONFIG[show.status] ?? STATUS_CONFIG.upcoming!;
              return (
                <Link key={show.slug} href={`/shows/${show.slug}`} style={{ textDecoration: "none" }}>
                  <div style={{
                    background: "rgba(255,255,255,0.03)", border: `1px solid ${show.accent}30`,
                    borderRadius: 14, padding: "18px 20px",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <span style={{
                        fontSize: 9, fontWeight: 800, letterSpacing: "0.16em",
                        color: statusCfg.color, background: `${statusCfg.color}18`,
                        border: `1px solid ${statusCfg.color}44`, borderRadius: 4, padding: "2px 8px",
                      }}>
                        {statusCfg.label}
                      </span>
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{show.genre}</span>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginBottom: 6 }}>{show.title}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>{show.time}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: show.accent }}>
                        {show.viewers.toLocaleString()} {show.status === "replay" ? "watched" : "watching"}
                      </span>
                      <span style={{ fontSize: 11, color: show.accent, fontWeight: 700 }}>
                        {show.status === "live" ? "Watch Now →" : show.status === "replay" ? "Replay →" : "Notify Me →"}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 14 }}>Show Series</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {NAMED_SHOWS.map((s) => (
              <Link key={s.href} href={s.href} style={{ textDecoration: "none" }}>
                <div style={{
                  padding: "12px 18px", background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10,
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <span style={{ fontSize: 16 }}>{s.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.75)" }}>{s.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/cypher" style={{ padding: "10px 22px", borderRadius: 24, fontSize: 12, fontWeight: 800, background: "#AA2DFF", color: "#fff", textDecoration: "none" }}>
            🎤 Cypher Sessions
          </Link>
          <Link href="/rooms" style={{ padding: "10px 22px", borderRadius: 24, fontSize: 12, fontWeight: 800, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>
            Browse Rooms
          </Link>
          <Link href="/battles" style={{ padding: "10px 22px", borderRadius: 24, fontSize: 12, fontWeight: 800, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>
            Battles
          </Link>
        </div>
      </div>
    </main>
  );
}
