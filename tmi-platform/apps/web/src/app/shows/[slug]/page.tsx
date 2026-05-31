import Link from "next/link";
import UnifiedAdSlot from "@/components/ads/UnifiedAdSlot";

interface Props { params: { slug: string } }

function titleCase(s: string) {
  return s.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function seedShow(slug: string) {
  const hash = slug.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const statuses = ["live", "upcoming", "replay"] as const;
  const status = statuses[hash % 3]!;
  const genres = ["Hip-Hop", "R&B", "Trap", "Afrobeats", "EDM", "Soul", "Neo-Soul"];
  const genre = genres[hash % genres.length]!;
  const times = ["Tonight · 9:00 PM ET", "Tomorrow · 8:00 PM ET", "May 25 · 7:30 PM ET"];
  const time = status === "replay" ? "Ended May 18 2026" : times[hash % times.length]!;
  const accentColors = ["#00FFFF", "#FF2DAA", "#AA2DFF", "#FFD700", "#22c55e"];
  const accent = accentColors[hash % accentColors.length]!;
  return { slug, title: titleCase(slug), status, genre, time, accent, viewers: 800 + (hash % 9200), artist: genres[( hash + 1) % genres.length]! };
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  live:     { label: "🔴 LIVE NOW",  color: "#ef4444" },
  upcoming: { label: "⏳ UPCOMING",  color: "#f59e0b" },
  replay:   { label: "📼 REPLAY",    color: "#6b7280" },
};

export default function ShowPage({ params }: Props) {
  const show = seedShow(params.slug);
  const statusDisplay = STATUS_LABELS[show.status] ?? STATUS_LABELS.upcoming!;

  return (
    <main style={{ minHeight: "100vh", background: "#060410", color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>

      {/* Back nav */}
      <div style={{ padding: "20px 24px 0", display: "flex", gap: 16, alignItems: "center" }}>
        <Link href="/shows" style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← SHOWS</Link>
        <Link href="/hub/fan" style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.2)", textDecoration: "none" }}>FAN HUB</Link>
      </div>

      {/* Hero */}
      <div style={{ padding: "28px 24px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <span style={{
              fontSize: 9, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase",
              color: statusDisplay.color, background: `${statusDisplay.color}18`,
              border: `1px solid ${statusDisplay.color}44`, borderRadius: 4, padding: "3px 10px",
            }}>
              {statusDisplay.label}
            </span>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>{show.genre}</span>
          </div>
          <h1 style={{ fontSize: "clamp(24px,5vw,48px)", fontWeight: 900, margin: "0 0 10px", letterSpacing: "-0.5px" }}>
            {show.title}
          </h1>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{show.time}</span>
            <span style={{ fontSize: 12, color: show.accent }}>
              {show.viewers.toLocaleString()} {show.status === "replay" ? "total viewers" : "watching"}
            </span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px" }}>

        {/* Video window placeholder */}
        <div style={{
          width: "100%", aspectRatio: "16/9", background: "#0a0a1a",
          border: `1px solid ${show.accent}33`, borderRadius: 16,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          marginBottom: 28, position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            background: `radial-gradient(ellipse at center, ${show.accent}08 0%, transparent 70%)`,
          }} />
          <div style={{ fontSize: 48, marginBottom: 16 }}>
            {show.status === "live" ? "🔴" : show.status === "replay" ? "📼" : "🎬"}
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: show.accent, marginBottom: 8 }}>
            {show.status === "live" ? "Live Stream Active" : show.status === "upcoming" ? "Show Starts Soon" : "Replay Available"}
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textAlign: "center", maxWidth: 300, lineHeight: 1.5 }}>
            {show.status === "live"
              ? "Click to enter the live viewing room"
              : show.status === "upcoming"
              ? `Show begins ${show.time}`
              : "Full replay · No scrubbing restriction on Diamond tier"}
          </div>
          {show.status !== "upcoming" && (
            <Link
              href={show.status === "live" ? `/rooms/${params.slug}` : `/rooms/${params.slug}?replay=1`}
              style={{
                marginTop: 20, padding: "12px 28px", borderRadius: 24, fontSize: 13, fontWeight: 800,
                background: show.accent, color: "#060410", textDecoration: "none", letterSpacing: "0.04em",
              }}
            >
              {show.status === "live" ? "Enter Show →" : "Watch Replay →"}
            </Link>
          )}
        </div>

        {/* Info grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 28 }}>
          {[
            { label: "Genre",    value: show.genre },
            { label: "Viewers",  value: show.viewers.toLocaleString() },
            { label: "Time",     value: show.time },
            { label: "Status",   value: show.status.toUpperCase() },
          ].map((item) => (
            <div key={item.label} style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 10, padding: "14px 16px",
            }}>
              <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.14em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", marginBottom: 6 }}>{item.label}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{item.value}</div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 36 }}>
          <Link
            href={`/rooms/${params.slug}`}
            style={{ padding: "10px 22px", borderRadius: 24, fontSize: 12, fontWeight: 800, background: show.accent, color: "#060410", textDecoration: "none" }}
          >
            🎵 Join Room
          </Link>
          <Link
            href="/shows"
            style={{ padding: "10px 22px", borderRadius: 24, fontSize: 12, fontWeight: 800, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", textDecoration: "none" }}
          >
            All Shows
          </Link>
          <Link
            href="/hub/fan"
            style={{ padding: "10px 22px", borderRadius: 24, fontSize: 12, fontWeight: 800, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", textDecoration: "none" }}
          >
            Fan Hub
          </Link>
        </div>

        {/* ── AD — between show sections ── */}
        <UnifiedAdSlot venue="shows" slotKey="roomLeaderboard" format="horizontal" label="ADVERTISEMENT" style={{ marginBottom: 28, minHeight: 90 }} accentColor={show.accent} />

        {/* More shows */}
        <div>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.18em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 14 }}>More Shows</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {["nova-cipher-live", "cypher-arena-open", "season-2-finals", "beatlab-friday"].map((s) => (
              <Link
                key={s}
                href={`/shows/${s}`}
                style={{
                  padding: "8px 16px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.6)", textDecoration: "none",
                }}
              >
                {titleCase(s)}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
