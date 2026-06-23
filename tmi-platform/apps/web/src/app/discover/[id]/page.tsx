import Link from "next/link";
import type { Metadata } from "next";
import { getPerformersByCategory, getLivePerformers } from "@/lib/performers/PerformerRegistry";
import type { PerformerCategory } from "@/lib/performers/PerformerRegistry";

// Map discover URL segment → PerformerRegistry category
const GENRE_MAP: Record<
  string,
  { label: string; color: string; accent2: string; emoji: string; desc: string; category: PerformerCategory }
> = {
  "hip-hop":    { label: "Hip-Hop",    color: "#FF2DAA", accent2: "#AA2DFF", emoji: "🎤", desc: "Battle rap, freestyles, boom bap, drill & trap cyphers.", category: "Hip-Hop"   },
  "edm":        { label: "EDM",        color: "#00FFFF", accent2: "#AA2DFF", emoji: "🎛️", desc: "Electronic drops, DJ sets, festival vibes & live production.", category: "Electronic"},
  "rnb":        { label: "R&B",        color: "#AA2DFF", accent2: "#FF2DAA", emoji: "🎶", desc: "Neo-soul, smooth vocals, bedroom pop & live band sessions.", category: "R&B"      },
  "gospel":     { label: "Gospel",     color: "#FFD700", accent2: "#FF9500", emoji: "🙌", desc: "Worship, inspirational, choir and contemporary gospel live.", category: "Gospel"   },
  "afrobeats":  { label: "Afrobeats",  color: "#00FF88", accent2: "#FFD700", emoji: "🥁", desc: "Nigerian Afrobeats, Afro-fusion, and diaspora live shows.",  category: "Afrobeats" },
  "jazz":       { label: "Jazz",       color: "#4488FF", accent2: "#00FFFF", emoji: "🎺", desc: "Contemporary jazz, neo-soul instrumentals & late-night sessions.", category: "Jazz" },
  "pop":        { label: "Pop",        color: "#FF6B35", accent2: "#FF2DAA", emoji: "⭐", desc: "Chart-topping vocals, singer-songwriter sessions & pop battles.", category: "Pop"  },
  "rock":       { label: "Rock",       color: "#FF4444", accent2: "#FFD700", emoji: "🎸", desc: "Rock cyphers, band performances, and electric live sets.",   category: "Rock"     },
};

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
): Promise<Metadata> {
  const { id } = await params;
  const genre = GENRE_MAP[id];
  return {
    title: genre ? `${genre.label} | Discover | TMI` : `Discover ${id} | TMI`,
  };
}

export default async function DiscoverDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const genre = GENRE_MAP[id];
  const accentColor = genre?.color ?? "#00FFFF";
  const accent2 = genre?.accent2 ?? "#AA2DFF";

  // Real performers from PerformerRegistry
  const categoryPerformers = genre
    ? getPerformersByCategory(genre.category).slice(0, 8)
    : [];
  const livePerformers = genre
    ? getLivePerformers().filter((p) => p.category === genre.category).slice(0, 6)
    : getLivePerformers().slice(0, 6);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#050510",
        color: "#fff",
        fontFamily: "'Inter', sans-serif",
        paddingBottom: 80,
      }}
    >
      <style>{`@keyframes tmiDiscoverPulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>

      {/* Nav */}
      <nav
        style={{
          background: "rgba(0,0,0,0.8)",
          borderBottom: `1px solid ${accentColor}22`,
          padding: "12px 24px",
          display: "flex",
          gap: 20,
          alignItems: "center",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <Link
          href="/home/1"
          style={{ fontSize: 11, fontWeight: 900, color: accentColor, textDecoration: "none", letterSpacing: "0.14em" }}
        >
          TMI
        </Link>
        <Link href="/browse" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>
          Browse
        </Link>
        <span style={{ fontSize: 11, color: accentColor, fontWeight: 700 }}>
          {genre?.label ?? id.toUpperCase()}
        </span>
        <Link
          href="/live/rooms"
          style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none", marginLeft: "auto" }}
        >
          All Rooms →
        </Link>
      </nav>

      {/* Background glow */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: `radial-gradient(circle at 30% 20%, ${accentColor}0A, transparent 55%), radial-gradient(circle at 70% 80%, ${accent2}07, transparent 50%)`,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "32px 20px" }}>
        {/* Hero */}
        <div
          style={{
            marginBottom: 32,
            padding: "32px 28px",
            background: `linear-gradient(135deg, ${accentColor}0E, rgba(5,5,16,0.96))`,
            border: `1px solid ${accentColor}28`,
            borderRadius: 20,
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>{genre?.emoji ?? "🎵"}</div>
          <div
            style={{ fontSize: 9, letterSpacing: "0.28em", color: accentColor, fontWeight: 800, marginBottom: 6 }}
          >
            DISCOVER · TMI
          </div>
          <h1
            style={{
              margin: "0 0 10px",
              fontSize: "clamp(28px,5vw,52px)",
              fontWeight: 900,
              letterSpacing: "-0.02em",
              background: `linear-gradient(135deg, ${accentColor}, ${accent2})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {genre?.label ?? id.replace(/-/g, " ").toUpperCase()}
          </h1>
          <p
            style={{
              margin: "0 0 20px",
              fontSize: 14,
              color: "rgba(255,255,255,0.55)",
              maxWidth: 560,
              lineHeight: 1.6,
            }}
          >
            {genre?.desc ?? `Explore the best ${id.replace(/-/g, " ")} talent, live rooms, cyphers, and battles on TMI.`}
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link
              href="/live/rooms"
              style={{
                padding: "10px 20px",
                borderRadius: 10,
                background: `${accentColor}18`,
                border: `1px solid ${accentColor}45`,
                color: accentColor,
                fontSize: 11,
                fontWeight: 900,
                textDecoration: "none",
                letterSpacing: "0.08em",
              }}
            >
              ▶ JOIN A LIVE ROOM
            </Link>
            <Link
              href="/battles/create"
              style={{
                padding: "10px 20px",
                borderRadius: 10,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.6)",
                fontSize: 11,
                fontWeight: 800,
                textDecoration: "none",
              }}
            >
              ⚔️ START CHALLENGE
            </Link>
          </div>
        </div>

        {/* Genre quick-links */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
          {Object.entries(GENRE_MAP).map(([key, g]) => (
            <Link
              key={key}
              href={`/discover/${key}`}
              style={{
                padding: "6px 14px",
                borderRadius: 20,
                fontSize: 10,
                fontWeight: 800,
                textDecoration: "none",
                background: key === id ? `${g.color}20` : "rgba(255,255,255,0.04)",
                color: key === id ? g.color : "rgba(255,255,255,0.45)",
                border: `1px solid ${key === id ? g.color + "45" : "rgba(255,255,255,0.1)"}`,
                letterSpacing: "0.06em",
                whiteSpace: "nowrap",
              }}
            >
              {g.emoji} {g.label}
            </Link>
          ))}
        </div>

        {/* Live Now */}
        <section style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#FF2020",
                display: "inline-block",
                animation: "tmiDiscoverPulse 1s step-end infinite",
              }}
            />
            <span style={{ fontSize: 9, letterSpacing: "0.2em", color: "#fff", fontWeight: 900 }}>
              LIVE NOW
            </span>
          </div>

          {livePerformers.length === 0 ? (
            <div
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                padding: "28px",
                textAlign: "center",
                color: "rgba(255,255,255,0.35)",
                fontSize: 13,
              }}
            >
              No live rooms in this genre right now.{" "}
              <Link href="/live/rooms" style={{ color: accentColor, textDecoration: "none" }}>
                Browse all live rooms →
              </Link>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
              {livePerformers.map((p) => (
                <Link
                  key={p.id}
                  href={`/live/rooms?performer=${p.slug}`}
                  style={{
                    display: "block",
                    padding: "16px 18px",
                    borderRadius: 14,
                    background: `${accentColor}0A`,
                    border: `1px solid ${accentColor}22`,
                    textDecoration: "none",
                    color: "#fff",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 8,
                        fontWeight: 900,
                        color: accentColor,
                        letterSpacing: "0.14em",
                        padding: "2px 8px",
                        borderRadius: 4,
                        background: `${accentColor}18`,
                        border: `1px solid ${accentColor}35`,
                      }}
                    >
                      LIVE
                    </span>
                    <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>
                      {p.audienceCount > 0 ? `👁 ${p.audienceCount.toLocaleString()}` : ""}
                    </span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>{p.name}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginBottom: 8 }}>
                    {p.category}
                  </div>
                  <div style={{ fontSize: 10, color: accentColor, fontWeight: 700 }}>▶ JOIN ROOM →</div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Performers in this genre */}
        <section style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", fontWeight: 800, marginBottom: 14 }}>
            PERFORMERS
          </div>

          {categoryPerformers.length === 0 ? (
            <div
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                padding: "28px",
                textAlign: "center",
                color: "rgba(255,255,255,0.35)",
                fontSize: 13,
              }}
            >
              No performers registered in this genre yet.{" "}
              <Link href="/performers" style={{ color: accentColor, textDecoration: "none" }}>
                Browse all performers →
              </Link>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
              {categoryPerformers.map((p) => (
                <Link
                  key={p.id}
                  href={`/profile/performer/${p.slug}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 14px",
                    borderRadius: 12,
                    background: `${accentColor}08`,
                    border: `1px solid ${accentColor}20`,
                    textDecoration: "none",
                    color: "#fff",
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: p.profileImageUrl
                        ? "transparent"
                        : `linear-gradient(135deg, ${accentColor}, #050510)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                      flexShrink: 0,
                      boxShadow: `0 0 10px ${accentColor}30`,
                      overflow: "hidden",
                    }}
                  >
                    {p.profileImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.profileImageUrl}
                        alt={p.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      "🎤"
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800 }}>{p.name}</div>
                    <div style={{ fontSize: 9, color: accentColor, fontWeight: 700, marginTop: 2 }}>
                      {p.isLive ? "🔴 LIVE" : `#${p.rank} · ${p.tier}`}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* All Genres Grid */}
        <section>
          <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", fontWeight: 800, marginBottom: 14 }}>
            EXPLORE ALL GENRES
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
            {Object.entries(GENRE_MAP).map(([key, g]) => (
              <Link
                key={key}
                href={`/discover/${key}`}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "16px",
                  borderRadius: 14,
                  background: `${g.color}08`,
                  border: `1px solid ${g.color}22`,
                  textDecoration: "none",
                  color: "#fff",
                }}
              >
                <span style={{ fontSize: 28, marginBottom: 8 }}>{g.emoji}</span>
                <span style={{ fontSize: 13, fontWeight: 900, color: g.color }}>{g.label}</span>
                <span
                  style={{
                    fontSize: 10,
                    color: "rgba(255,255,255,0.4)",
                    marginTop: 4,
                    lineHeight: 1.4,
                  }}
                >
                  {g.desc.slice(0, 50)}…
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
