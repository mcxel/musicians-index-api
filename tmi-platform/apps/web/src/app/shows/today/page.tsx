import Link from "next/link";
import { WhatsHappeningTodayEngine } from "@/lib/events/WhatsHappeningTodayEngine";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Today's Shows | TMI",
  description: "Live shows, concerts, and events happening today on The Musician's Index.",
};

const SEED_SHOWS = [
  { slug: "monday-night-stage",  title: "Monday Night Stage — Season 2 Live",  time: "8:00 PM ET",  genre: "Hip-Hop / R&B",   host: "Gregory Marcel",  status: "live",     viewers: 3200, color: "#FF2DAA",  href: "/rooms/monday-stage"    },
  { slug: "cypher-arena-open",   title: "Cypher Arena Open — Season 2 Battles",time: "7:30 PM ET",  genre: "Freestyle Battle", host: "TMI Arena",       status: "live",     viewers: 1840, color: "#00FFFF",  href: "/rooms/cypher"          },
  { slug: "ntt-fan-night",       title: "Name That Tune — Fan Night",           time: "9:00 PM ET",  genre: "Game Show",        host: "Julius",          status: "upcoming", viewers: 920,  color: "#FFD700",  href: "/shows/name-that-tune"  },
  { slug: "new-release-drop",    title: "New Release Drop — Krypt x Wavetek",   time: "10:00 PM ET", genre: "New Music",        host: "Krypt",           status: "upcoming", viewers: 580,  color: "#AA2DFF",  href: "/rooms/new-release"     },
  { slug: "dj-set-lumi",         title: "DJ Lumi — Late Night Takeover",        time: "11:30 PM ET", genre: "DJ Set",           host: "DJ Lumi",         status: "upcoming", viewers: 0,    color: "#00FF88",  href: "/rooms/dj"              },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; pulse: boolean }> = {
  live:     { label: "🔴 LIVE NOW", color: "#ef4444", pulse: true  },
  upcoming: { label: "⏳ UPCOMING", color: "#f59e0b", pulse: false },
  replay:   { label: "📼 REPLAY",   color: "#6b7280", pulse: false },
};

export default function ShowsTodayPage() {
  const liveShows = WhatsHappeningTodayEngine.listByType("show");
  const shows = liveShows.length > 0 ? liveShows.map(s => ({ slug: s.slug, title: s.title, time: "Live", genre: "Live Show", host: "TMI", status: "live", viewers: 0, color: "#00FFFF", href: `/shows/${s.slug}` })) : SEED_SHOWS;

  const liveCount = shows.filter(s => s.status === "live").length;

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>

      {/* Nav */}
      <nav style={{ background: "rgba(0,0,0,0.85)", borderBottom: "1px solid rgba(255,45,170,0.18)", padding: "12px 24px", display: "flex", gap: 20, alignItems: "center", overflowX: "auto", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 50 }}>
        <Link href="/home/1"     style={{ fontSize: 11, fontWeight: 900, color: "#FF2DAA", textDecoration: "none", letterSpacing: "0.12em" }}>TMI</Link>
        <span style={{ color: "rgba(255,255,255,0.15)" }}>›</span>
        <Link href="/shows"      style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Shows</Link>
        <span style={{ color: "rgba(255,255,255,0.15)" }}>›</span>
        <span style={{ fontSize: 11, color: "#FF2DAA", fontWeight: 700 }}>Today</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 14 }}>
          <Link href="/streams"    style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>All Streams</Link>
          <Link href="/rooms"      style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>Rooms</Link>
        </div>
      </nav>

      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(circle at 50% 25%, rgba(255,45,170,0.07), transparent 55%)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto", padding: "36px 24px" }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", display: "inline-block", animation: "pulse 1.5s infinite" }} />
            <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.25em", color: "#ef4444" }}>{liveCount} LIVE RIGHT NOW</span>
          </div>
          <h1 style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 900, margin: "0 0 8px" }}>Today&apos;s Shows</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: 0 }}>Live shows, battles, game nights, and concerts happening today on The Musician&apos;s Index.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {shows.map(s => {
            const sc = STATUS_CONFIG[s.status] ?? STATUS_CONFIG.upcoming!;
            return (
              <Link key={s.slug} href={s.href} style={{ display: "flex", gap: 16, padding: "20px 24px", background: s.status === "live" ? `${s.color}0C` : "rgba(255,255,255,0.02)", border: `1px solid ${s.status === "live" ? s.color + "35" : "rgba(255,255,255,0.07)"}`, borderRadius: 16, textDecoration: "none", alignItems: "center", transition: "transform .15s, box-shadow .15s" }}>
                <div style={{ width: 60, height: 60, borderRadius: 14, background: `${s.color}18`, border: `1px solid ${s.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>🎤</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 8, fontWeight: 900, color: sc.color, letterSpacing: "0.1em", animation: sc.pulse ? "pulse 1.5s infinite" : "none" }}>{sc.label}</span>
                    <span style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", fontWeight: 700, letterSpacing: "0.1em" }}>{s.genre.toUpperCase()}</span>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", lineHeight: 1.3, marginBottom: 3 }}>{s.title}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Hosted by {s.host}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: s.color, marginBottom: 4 }}>{s.time}</div>
                  {s.viewers > 0 && <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>👁 {s.viewers.toLocaleString()}</div>}
                  <div style={{ marginTop: 6, fontSize: 10, color: s.color, fontWeight: 700 }}>Watch →</div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick links */}
        <div style={{ marginTop: 32, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
          {[
            { href: "/shows",              label: "All Shows",       color: "#FF2DAA" },
            { href: "/shows/monday-night-stage", label: "Monday Night", color: "#FF9500" },
            { href: "/shows/monthly-idol", label: "Monthly Idol",    color: "#FFD700" },
            { href: "/shows/name-that-tune",label: "Name That Tune", color: "#00FFFF" },
            { href: "/streams",            label: "Live Streams",    color: "#AA2DFF" },
            { href: "/rooms",              label: "All Rooms",       color: "#00FF88" },
          ].map(a => (
            <Link key={a.href} href={a.href} style={{ display: "block", padding: "12px", borderRadius: 10, background: `${a.color}0A`, border: `1px solid ${a.color}28`, color: a.color, fontSize: 11, fontWeight: 800, textDecoration: "none", textAlign: "center" }}>{a.label}</Link>
          ))}
        </div>
      </div>
    </main>
  );
}
