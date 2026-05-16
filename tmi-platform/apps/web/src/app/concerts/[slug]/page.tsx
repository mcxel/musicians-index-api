import { notFound } from "next/navigation";
import Link from "next/link";

type Props = { params: Promise<{ slug: string }> };

const CONCERTS: Record<string, {
  artist: string; title: string; date: string; time: string;
  genre: string; price: number; icon: string; color: string;
  status: string; viewers: number; artistSlug: string; desc: string;
}> = {
  "wavetek-fifth-ward-live": { artist: "Wavetek", artistSlug: "wavetek", title: "Fifth Ward Live", date: "2026-05-03", time: "9:00 PM EST", genre: "Hip-Hop", price: 12, icon: "🎤", color: "#FF2DAA", status: "UPCOMING", viewers: 0, desc: "Wavetek brings the energy of Houston's Fifth Ward to TMI's live stage. Expect unreleased tracks, freestyle rounds, and fan interactions." },
  "neon-vibe-monday-residency": { artist: "Neon Vibe", artistSlug: "neon-vibe", title: "Monday Residency Vol. 12", date: "2026-04-28", time: "8:00 PM EST", genre: "Electronic", price: 0, icon: "🎧", color: "#00FFFF", status: "LIVE", viewers: 8400, desc: "The weekly residency that's redefining live electronic music. House, techno, and future bass — 90 minutes of uninterrupted energy." },
  "zuri-bloom-diaspora-session": { artist: "Zuri Bloom", artistSlug: "zuri-bloom", title: "Diaspora Session", date: "2026-05-10", time: "7:30 PM EST", genre: "Afrobeats", price: 9, icon: "🌍", color: "#00FF88", status: "UPCOMING", viewers: 0, desc: "Afrobeats, Amapiano, and pop collide in Zuri Bloom's debut live concert on TMI. Special guest features expected." },
  "krypt-drill-midnight": { artist: "Krypt", artistSlug: "krypt", title: "Drill Midnight Special", date: "2026-04-26", time: "11:00 PM EST", genre: "Drill", price: 0, icon: "🔒", color: "#AA2DFF", status: "REPLAY", viewers: 22000, desc: "Krypt's midnight performance broke TMI viewership records. Watch the full replay featuring 14 tracks and an unreleased drill anthem." },
  "lyric-stone-obsidian-live": { artist: "Lyric Stone", artistSlug: "lyric-stone", title: "Obsidian Water — Live Performance", date: "2026-05-17", time: "8:00 PM EST", genre: "R&B/Soul", price: 15, icon: "🎵", color: "#FFD700", status: "UPCOMING", viewers: 0, desc: "Lyric Stone performs the full Obsidian Water album live for the first time. Intimate, emotional, and complete with a live band." },
};

export async function generateStaticParams() {
  return Object.keys(CONCERTS).map(slug => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const concert = CONCERTS[slug];
  if (!concert) return { title: "Concert Not Found | TMI" };
  return {
    title: `${concert.title} — ${concert.artist} | TMI`,
    description: concert.desc,
  };
}

export default async function ConcertPage({ params }: Props) {
  const { slug } = await params;
  const concert = CONCERTS[slug];
  if (!concert) return notFound();

  const isLive = concert.status === "LIVE";
  const isReplay = concert.status === "REPLAY";

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 24px 0" }}>
        <Link href="/concerts" style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>
          ← CONCERTS
        </Link>
      </div>

      {/* Hero */}
      <header style={{ maxWidth: 860, margin: "0 auto", padding: "32px 24px 40px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <span style={{ fontSize: 48 }}>{concert.icon}</span>
          {isLive && (
            <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: "#00FF88", border: "1px solid rgba(0,255,136,0.4)", borderRadius: 4, padding: "4px 10px", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00FF88", display: "inline-block" }} />
              LIVE NOW · {concert.viewers.toLocaleString()} watching
            </span>
          )}
          {isReplay && (
            <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: "#AA2DFF", border: "1px solid rgba(170,45,255,0.4)", borderRadius: 4, padding: "4px 10px" }}>
              REPLAY · {concert.viewers.toLocaleString()} views
            </span>
          )}
        </div>
        <h1 style={{ fontSize: "clamp(1.4rem,4vw,2.5rem)", fontWeight: 900, lineHeight: 1.2, marginBottom: 10 }}>
          {concert.title}
        </h1>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>
          {concert.artist} · {concert.genre}
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 24 }}>
          {concert.date} · {concert.time}
        </div>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, maxWidth: 620, marginBottom: 32 }}>
          {concert.desc}
        </p>

        {/* CTA */}
        {isLive ? (
          <Link href={`/live/world`} style={{ display: "inline-block", padding: "12px 32px", fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", color: "#050510", background: "#00FF88", borderRadius: 10, textDecoration: "none" }}>
            JOIN LIVE NOW — FREE
          </Link>
        ) : isReplay ? (
          <Link href={`/live/world`} style={{ display: "inline-block", padding: "12px 32px", fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", color: "#fff", background: "rgba(170,45,255,0.3)", border: "1px solid rgba(170,45,255,0.5)", borderRadius: 10, textDecoration: "none" }}>
            WATCH REPLAY
          </Link>
        ) : (
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#FFD700" }}>
              {concert.price === 0 ? "FREE" : `$${concert.price}`}
            </div>
            <Link href={`/tickets`} style={{ padding: "12px 28px", fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", color: "#050510", background: "linear-gradient(135deg,#FFD700,#FF9500)", borderRadius: 10, textDecoration: "none" }}>
              GET TICKET
            </Link>
          </div>
        )}
      </header>

      {/* Artist link */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px 40px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 32 }}>
        <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "rgba(255,255,255,0.25)", fontWeight: 700, marginBottom: 16 }}>PERFORMING ARTIST</div>
        <Link href={`/artists/${concert.artistSlug}`} style={{ display: "flex", alignItems: "center", gap: 14, textDecoration: "none", color: "inherit", padding: "16px 20px", background: "rgba(255,255,255,0.02)", border: `1px solid ${concert.color}18`, borderRadius: 12, maxWidth: 400 }}>
          <span style={{ fontSize: 32 }}>{concert.icon}</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800 }}>{concert.artist}</div>
            <div style={{ fontSize: 10, color: concert.color, fontWeight: 700, letterSpacing: "0.1em" }}>{concert.genre.toUpperCase()}</div>
          </div>
          <span style={{ marginLeft: "auto", fontSize: 14, color: "rgba(255,255,255,0.2)" }}>→</span>
        </Link>
      </div>
    </main>
  );
}
