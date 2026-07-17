"use client";

/**
 * Home5BattleWall.tsx
 * Section G — BATTLE POSTER WALL
 * Rotating poster grid for upcoming/open battles.
 * Clickable, genre-accented, visual format not text slabs.
 */

import { useState, useEffect } from "react";
import Link from "next/link";

interface BattlePoster {
  id: string;
  title: string;
  type: string;
  genre: string;
  genreColor: string;
  format: string;
  bannerImage: string;
  prize: number;
  route: string;
  tag?: string;
}

const POSTER_POOL: BattlePoster[] = [
  {
    id: "bp1",
    title: "Rapper vs Rapper",
    type: "BATTLE",
    genre: "Hip Hop",
    genreColor: "#FF2DAA",
    format: "Solo 1v1",
    bannerImage: "/banners/Banner Battle.png",
    prize: 5000,
    route: "/battles/live",
    tag: "LIVE",
  },
  {
    id: "bp2",
    title: "Singer vs Singer",
    type: "BATTLE",
    genre: "R&B",
    genreColor: "#AA2DFF",
    format: "Solo 1v1",
    bannerImage: "/banners/Banner Live Sessions.png",
    prize: 5000,
    route: "/battles/register",
    tag: "OPEN",
  },
  {
    id: "bp3",
    title: "Drum Circle",
    type: "CYPHER",
    genre: "Afrobeat",
    genreColor: "#00FF88",
    format: "Open Circle",
    bannerImage: "/banners/Banner Cyhpers.png",
    prize: 3000,
    route: "/cypher/live",
    tag: "HOT",
  },
  {
    id: "bp4",
    title: "DJ vs DJ",
    type: "BATTLE",
    genre: "EDM",
    genreColor: "#00FFFF",
    format: "Solo 1v1",
    bannerImage: "/banners/Banner World Dance Party.png",
    prize: 5000,
    route: "/battles/register",
  },
  {
    id: "bp5",
    title: "Guitar Showdown",
    type: "BATTLE",
    genre: "Country",
    genreColor: "#FF6B35",
    format: "Solo 1v1",
    bannerImage: "/banners/Banner instrument players.png",
    prize: 5000,
    route: "/battles/register",
  },
  {
    id: "bp6",
    title: "Band vs Band",
    type: "BATTLE",
    genre: "Rock",
    genreColor: "#FF6B35",
    format: "Band vs Band",
    bannerImage: "/banners/Banner Battle of the bands.png",
    prize: 10000,
    route: "/battles/register",
    tag: "FEATURED",
  },
  {
    id: "bp7",
    title: "Producer Crew",
    type: "CYPHER",
    genre: "Pop",
    genreColor: "#FF2DAA",
    format: "Group 3v3",
    bannerImage: "/banners/Banner Cyhpers.png",
    prize: 7000,
    route: "/cypher/register",
  },
  {
    id: "bp8",
    title: "Dirty Dozens",
    type: "BATTLE",
    genre: "Hip Hop",
    genreColor: "#FF2DAA",
    format: "Dirty Dozens",
    bannerImage: "/banners/Banner Challenges.png",
    prize: 8000,
    route: "/battles/register",
    tag: "NEW",
  },
];

const TAG_STYLE: Record<string, { bg: string; color: string }> = {
  LIVE: { bg: "rgba(255,0,64,0.9)", color: "#fff" },
  HOT: { bg: "rgba(255,107,53,0.9)", color: "#fff" },
  OPEN: { bg: "rgba(0,255,136,0.9)", color: "#000" },
  FEATURED: { bg: "rgba(255,215,0,0.9)", color: "#000" },
  NEW: { bg: "rgba(170,45,255,0.9)", color: "#fff" },
};

export default function Home5BattleWall() {
  const [visiblePosters, setVisiblePosters] = useState<BattlePoster[]>(
    POSTER_POOL.slice(0, 8)
  );
  const [cycleIndex, setCycleIndex] = useState(0);
  const [fadingOut, setFadingOut] = useState<Set<number>>(new Set());

  // Rotate one poster every 4 seconds
  useEffect(() => {
    const t = setInterval(() => {
      const replaceIdx = cycleIndex % visiblePosters.length;
      const nextPoolIdx = (visiblePosters.length + cycleIndex) % POSTER_POOL.length;
      const nextPoster = POSTER_POOL[nextPoolIdx];
      if (!nextPoster) return;

      setFadingOut((prev) => new Set([...prev, replaceIdx]));
      setTimeout(() => {
        setVisiblePosters((prev) => {
          const copy = [...prev];
          copy[replaceIdx] = nextPoster;
          return copy;
        });
        setFadingOut((prev) => {
          const n = new Set(prev);
          n.delete(replaceIdx);
          return n;
        });
        setCycleIndex((i) => i + 1);
      }, 400);
    }, 4000);
    return () => clearInterval(t);
  }, [cycleIndex, visiblePosters]);

  return (
    <section style={{ display: "grid", gap: 12 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            fontSize: 13,
            fontWeight: 900,
            letterSpacing: "0.14em",
            color: "#FF2DAA",
            fontFamily: "var(--font-tmi-orbitron, 'Orbitron', monospace)",
          }}
        >
          BATTLE WALL
        </span>
        <span style={{ fontSize: 11, opacity: 0.6 }}>All active rooms</span>
        <Link
          href="/battles"
          style={{
            marginLeft: "auto",
            fontSize: 11,
            color: "#FF2DAA",
            textDecoration: "none",
            opacity: 0.8,
          }}
        >
          Full Schedule →
        </Link>
      </div>

      {/* Poster grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
          gap: 10,
        }}
      >
        {visiblePosters.map((poster, i) => (
          <Link
            key={`${poster.id}-${i}`}
            href={poster.route}
            style={{
              textDecoration: "none",
              display: "block",
              opacity: fadingOut.has(i) ? 0 : 1,
              transform: fadingOut.has(i) ? "scale(0.96)" : "scale(1)",
              transition: "opacity 0.4s ease, transform 0.4s ease",
            }}
          >
            <div
              style={{
                border: `1px solid ${poster.genreColor}44`,
                borderRadius: 10,
                overflow: "hidden",
                background: "#060810",
                cursor: "pointer",
              }}
            >
              {/* Poster image — real TMI banner art, not a single emoji glyph */}
              <div
                style={{
                  height: 140,
                  backgroundImage: `linear-gradient(to bottom, rgba(6,8,16,0.15), rgba(6,8,16,0.92)), url('${poster.bannerImage}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  padding: 10,
                  gap: 4,
                }}
              >
                {poster.tag && TAG_STYLE[poster.tag] && (
                  <div
                    style={{
                      position: "absolute",
                      top: 8,
                      left: 8,
                      background: TAG_STYLE[poster.tag]!.bg,
                      color: TAG_STYLE[poster.tag]!.color,
                      borderRadius: 999,
                      padding: "2px 8px",
                      fontSize: 9,
                      fontWeight: 800,
                      letterSpacing: "0.1em",
                    }}
                  >
                    {poster.tag}
                  </div>
                )}
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    color: poster.genreColor,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  {poster.genre} · {poster.type}
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 900,
                    fontFamily: "var(--font-tmi-bebas, 'Bebas Neue', Impact, sans-serif)",
                    letterSpacing: "0.04em",
                    lineHeight: 1.1,
                    textShadow: `0 0 12px ${poster.genreColor}60`,
                  }}
                >
                  {poster.title}
                </div>
              </div>

              {/* Footer strip */}
              <div
                style={{
                  padding: "8px 10px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderTop: `1px solid ${poster.genreColor}22`,
                }}
              >
                <span style={{ fontSize: 10, opacity: 0.6 }}>{poster.format}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#FFD700" }}>
                  {poster.prize.toLocaleString()} pts
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
