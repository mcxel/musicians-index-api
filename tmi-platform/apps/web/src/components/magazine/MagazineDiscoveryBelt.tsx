"use client";

// Canon source: Tmi Homepage 2.png — Discovery Belt
// Structure: Genre Cluster hexagons (Hip-Hop/Pop/Rock/R&B/Electronic/Jazz)
//            + Top 10 Charts ranked list + Weekly Playlists/Index Picks + A-Z Directory link

import React, { useState } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface GenreCluster {
  id: string;
  name: string;
  color: string;
  count: number;     // active rooms/artists
  href: string;
}

interface ChartEntry {
  rank: number;
  name: string;
  genre?: string;
  change: "up" | "down" | "new" | "same";
  score: number;
  href: string;
}

interface PlaylistCard {
  id: string;
  title: string;
  curator: string;
  trackCount: number;
  accent: string;
  href: string;
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const GENRES: GenreCluster[] = [
  { id: "hip-hop",    name: "Hip-Hop",    color: "#FF2DAA", count: 142, href: "/rooms?genre=hip-hop" },
  { id: "pop",        name: "Pop",        color: "#FFD700", count: 98,  href: "/rooms?genre=pop" },
  { id: "rock",       name: "Rock",       color: "#FF6B35", count: 61,  href: "/rooms?genre=rock" },
  { id: "rnb",        name: "R&B",        color: "#AA2DFF", count: 87,  href: "/rooms?genre=rnb" },
  { id: "electronic", name: "Electronic", color: "#00FFFF", count: 74,  href: "/rooms?genre=electronic" },
  { id: "jazz",       name: "Jazz",       color: "#00FF88", count: 43,  href: "/rooms?genre=jazz" },
];

const TOP10: ChartEntry[] = [
  { rank: 1,  name: "KOVA",         genre: "Afrobeat",   change: "up",   score: 9820, href: "/artists/kova" },
  { rank: 2,  name: "BLAZE CARTEL", genre: "Trap",       change: "down", score: 9590, href: "/artists/blaze-cartel" },
  { rank: 3,  name: "SOLARA",       genre: "Alt Pop",    change: "up",   score: 8770, href: "/artists/solara" },
  { rank: 4,  name: "DRIFT SOUND",  genre: "Electronic", change: "same", score: 8340, href: "/artists/drift-sound" },
  { rank: 5,  name: "ASHA WAVE",    genre: "Soul",       change: "up",   score: 7910, href: "/artists/asha-wave" },
  { rank: 6,  name: "YUMI",         genre: "J-Pop",      change: "new",  score: 7650, href: "/artists/yumi" },
  { rank: 7,  name: "RENEGADE 77",  genre: "Trap",       change: "down", score: 7200, href: "/artists/renegade-77" },
  { rank: 8,  name: "NOVA FLUX",    genre: "Electronic", change: "up",   score: 6980, href: "/artists/nova-flux" },
  { rank: 9,  name: "ECHO LANE",    genre: "R&B",        change: "down", score: 6710, href: "/artists/echo-lane" },
  { rank: 10, name: "CIRA SOUTH",   genre: "Hip-Hop",    change: "same", score: 6480, href: "/artists/cira-south" },
];

const PLAYLISTS: PlaylistCard[] = [
  { id: "pl1", title: "Index Picks Vol. 12",   curator: "TMI Editorial",  trackCount: 18, accent: "#FF2DAA", href: "/playlists/index-picks-12" },
  { id: "pl2", title: "Weekly Crown Playlist", curator: "Crown Algorithm", trackCount: 10, accent: "#FFD700", href: "/playlists/weekly-crown" },
  { id: "pl3", title: "Cypher Sessions",        curator: "Battle Crew",    trackCount: 24, accent: "#00FFFF", href: "/playlists/cypher-sessions" },
];

// ─── Genre Hexagon ────────────────────────────────────────────────────────────

function GenreHex({ genre, active, onToggle }: { genre: GenreCluster; active: boolean; onToggle: (id: string) => void }) {
  return (
    <button
      onClick={() => onToggle(genre.id)}
      aria-pressed={active}
      style={{
        position: "relative",
        width: 76,
        height: 88,
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 0,
      }}
    >
      {/* Hexagon SVG */}
      <svg viewBox="0 0 76 88" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <polygon
          points="38,4 72,22 72,66 38,84 4,66 4,22"
          fill={active ? `${genre.color}22` : "rgba(255,255,255,0.03)"}
          stroke={active ? genre.color : `${genre.color}40`}
          strokeWidth={active ? "1.8" : "1"}
          style={{ filter: active ? `drop-shadow(0 0 6px ${genre.color}80)` : "none", transition: "all 0.2s" }}
        />
      </svg>
      {/* Label */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <span style={{ fontSize: 8, fontWeight: 900, color: active ? genre.color : "rgba(255,255,255,0.65)", letterSpacing: "0.1em", textAlign: "center", lineHeight: 1.2, textTransform: "uppercase" }}>
          {genre.name}
        </span>
        <span style={{ fontSize: 7, color: active ? `${genre.color}cc` : "rgba(255,255,255,0.3)" }}>
          {genre.count}
        </span>
      </div>
    </button>
  );
}

// ─── Chart row ────────────────────────────────────────────────────────────────

const CHANGE_ICON: Record<ChartEntry["change"], { icon: string; color: string }> = {
  up:   { icon: "▲", color: "#00FF88" },
  down: { icon: "▼", color: "#FF4444" },
  new:  { icon: "★", color: "#FFD700" },
  same: { icon: "—", color: "rgba(255,255,255,0.3)" },
};

function ChartRow({ entry }: { entry: ChartEntry }) {
  const ch = CHANGE_ICON[entry.change];
  return (
    <Link href={entry.href} style={{ textDecoration: "none" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "5px 8px",
          borderRadius: 5,
          cursor: "pointer",
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
      >
        <span style={{ width: 18, textAlign: "right", fontSize: 10, fontWeight: 900, color: entry.rank <= 3 ? "#FFD700" : "rgba(255,255,255,0.4)", flexShrink: 0 }}>
          {entry.rank}
        </span>
        <span style={{ fontSize: 8, color: ch.color, flexShrink: 0 }}>{ch.icon}</span>
        <span style={{ flex: 1, fontSize: 9, fontWeight: 800, color: "#fff", letterSpacing: "0.05em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {entry.name}
        </span>
        {entry.genre && (
          <span style={{ fontSize: 7, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", flexShrink: 0 }}>
            {entry.genre}
          </span>
        )}
        <span style={{ fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.5)", flexShrink: 0 }}>
          {entry.score.toLocaleString()}
        </span>
      </div>
    </Link>
  );
}

// ─── Belt ─────────────────────────────────────────────────────────────────────

interface MagazineDiscoveryBeltProps {
  genres?: GenreCluster[];
  chart?: ChartEntry[];
  playlists?: PlaylistCard[];
}

export default function MagazineDiscoveryBelt({
  genres = GENRES,
  chart = TOP10,
  playlists = PLAYLISTS,
}: MagazineDiscoveryBeltProps) {
  const [activeGenres, setActiveGenres] = useState<Set<string>>(new Set());

  function toggleGenre(id: string) {
    setActiveGenres((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  return (
    <section data-belt="discovery" style={{ width: "100%" }}>
      {/* Section label */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.28em", color: "#00FFFF", textTransform: "uppercase" }}>
          DISCOVERY
        </span>
        <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, rgba(0,255,255,0.3), transparent)" }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Left: Genre hexagons + A-Z link */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Genre cluster */}
          <div>
            <p style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", marginBottom: 12 }}>
              GENRE CLUSTERS
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 76px)",
                gap: 2,
                justifyContent: "start",
              }}
            >
              {genres.map((g) => (
                <GenreHex key={g.id} genre={g} active={activeGenres.has(g.id)} onToggle={toggleGenre} />
              ))}
            </div>
          </div>

          {/* A-Z Artist Directory */}
          <Link
            href="/artists"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 12px",
              background: "rgba(0,255,255,0.05)",
              border: "1px solid rgba(0,255,255,0.2)",
              borderRadius: 8,
              textDecoration: "none",
            }}
          >
            <span style={{ fontSize: 16, fontWeight: 900, color: "#00FFFF" }}>A–Z</span>
            <div>
              <div style={{ fontSize: 9, fontWeight: 900, color: "#00FFFF", letterSpacing: "0.15em" }}>ARTIST DIRECTORY</div>
              <div style={{ fontSize: 7, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em" }}>Browse all artists →</div>
            </div>
          </Link>
        </div>

        {/* Right: Top 10 Charts + Playlists */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Top 10 Charts */}
          <div>
            <p style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>
              TOP 10 CHARTS
            </p>
            <div
              style={{
                background: "rgba(5,5,16,0.7)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              {chart.map((entry) => <ChartRow key={entry.rank} entry={entry} />)}
            </div>
          </div>

          {/* Weekly Playlists */}
          <div>
            <p style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>
              INDEX PICKS
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {playlists.map((pl) => (
                <Link key={pl.id} href={pl.href} style={{ textDecoration: "none" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 10px",
                      background: `${pl.accent}08`,
                      border: `1px solid ${pl.accent}20`,
                      borderRadius: 7,
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 6,
                        background: `linear-gradient(135deg, ${pl.accent}40, ${pl.accent}10)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                        flexShrink: 0,
                      }}
                    >
                      🎵
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 9, fontWeight: 800, color: "#fff", letterSpacing: "0.06em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pl.title}</div>
                      <div style={{ fontSize: 7, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em" }}>{pl.curator} · {pl.trackCount} tracks</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
