"use client";

import { useState, useEffect } from "react";

export interface VideoTile {
  id: string;
  title: string;
  performer: string;
  viewers: number;
  genre: string;
  href: string;
  status: "live" | "starting" | "replay";
  prizePool?: string;
  thumbnailColor?: string;
}

const CRAYON: string[] = [
  "#FF3B5C","#FF6B35","#FFD700","#00FF88","#00FFFF",
  "#AA2DFF","#FF2DAA","#FF8C00","#00CC44","#0099FF",
  "#FF1493","#7B2D8B","#FF4500","#32CD32","#4169E1",
];

function tileColor(index: number): string {
  return CRAYON[index % CRAYON.length] ?? "#00FFFF";
}

const DEMO_TILES: VideoTile[] = [
  { id: "t1", title: "Crown Run Finals",       performer: "MC Blaze",      viewers: 5140, genre: "Hip-Hop",  href: "/battles/crown-run",   status: "live",     prizePool: "$5,000", thumbnailColor: "#FF2DAA" },
  { id: "t2", title: "Open Flow Cypher",        performer: "Open Flow",     viewers: 2380, genre: "All",      href: "/cypher/open-flow",    status: "live",     thumbnailColor: "#00FFFF" },
  { id: "t3", title: "Soul Bars R&B Night",     performer: "Lena M",        viewers: 1900, genre: "R&B",      href: "/battles/soul-bars",   status: "live",     prizePool: "$1,000", thumbnailColor: "#AA2DFF" },
  { id: "t4", title: "Neon vs Crown",           performer: "Neon Verse",    viewers: 1840, genre: "Hip-Hop",  href: "/battles/neon-crown",  status: "live",     prizePool: "$500",   thumbnailColor: "#FFD700" },
  { id: "t5", title: "Trap Lab Cypher",         performer: "Trap Lab",      viewers: 1180, genre: "Trap",     href: "/cypher/trap-lab",     status: "live",     thumbnailColor: "#FF6B35" },
  { id: "t6", title: "Dance-Off Showdown",      performer: "Dance Showdown",viewers: 3100, genre: "Dance",    href: "/battles/dance-off",   status: "live",     prizePool: "$1,500", thumbnailColor: "#00FF88" },
  { id: "t7", title: "Monday Night Stage",      performer: "Various",       viewers: 890,  genre: "Multi",    href: "/live/stage",          status: "starting", thumbnailColor: "#FF3B5C" },
  { id: "t8", title: "Beat Challenge — Round 2",performer: "Producers",     viewers: 540,  genre: "Beats",    href: "/battles/beat-challenge", status: "live", thumbnailColor: "#7B2D8B" },
  { id: "t9", title: "Latin Flow Cypher",       performer: "Latin Flow",    viewers: 1720, genre: "Latin",    href: "/cypher/latin-flow",   status: "live",     thumbnailColor: "#0099FF" },
  { id: "t10", title: "Comedy Clash Live",      performer: "Comedy Clash",  viewers: 760, genre: "Comedy",   href: "/battles/comedy-clash", status: "live",    prizePool: "$800",   thumbnailColor: "#FF8C00" },
  { id: "t11", title: "Jazz Session — Lobby",   performer: "Jazz Collective",viewers: 320, genre: "Jazz",    href: "/live/jazz-lobby",      status: "live",     thumbnailColor: "#32CD32" },
  { id: "t12", title: "World Premiere Night",   performer: "TMI Official",  viewers: 8400, genre: "Event",   href: "/live/world-premiere", status: "starting", thumbnailColor: "#FF2DAA" },
];

interface Props {
  tiles?: VideoTile[];
  columns?: number;
  showViewers?: boolean;
  autoScroll?: boolean;
}

export default function BillboardVideoTileWall({ tiles = DEMO_TILES, columns = 4, showViewers = true, autoScroll = false }: Props) {
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  // Pulse viewer counts every 8s to simulate live
  useEffect(() => {
    if (!autoScroll) return;
    const id = setInterval(() => setTick((t) => t + 1), 8000);
    return () => clearInterval(id);
  }, [autoScroll]);

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: 10,
      padding: "4px 0",
    }}>
      {tiles.map((tile, i) => {
        const color   = tile.thumbnailColor ?? tileColor(i);
        const isHot   = highlighted === tile.id;
        const viewers = showViewers ? tile.viewers + (autoScroll ? (tick * (i % 5) * 3) : 0) : 0;

        return (
          <a
            key={tile.id}
            href={tile.href}
            onMouseEnter={() => setHighlighted(tile.id)}
            onMouseLeave={() => setHighlighted(null)}
            style={{
              display: "block",
              textDecoration: "none",
              borderRadius: 10,
              border: `1.5px solid ${isHot ? color : "rgba(255,255,255,0.07)"}`,
              overflow: "hidden",
              background: "#060614",
              transition: "all 0.22s ease",
              transform: isHot ? "scale(1.03)" : "scale(1)",
              boxShadow: isHot ? `0 0 24px ${color}44, 0 8px 24px rgba(0,0,0,0.5)` : "0 2px 10px rgba(0,0,0,0.4)",
              position: "relative",
            }}
          >
            {/* Video thumbnail placeholder */}
            <div style={{
              width: "100%",
              paddingBottom: "56.25%",
              position: "relative",
              background: `linear-gradient(135deg,${color}22,rgba(5,5,16,0.9))`,
              overflow: "hidden",
            }}>
              {/* Simulated scan lines over dark bg */}
              <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.15) 3px,rgba(0,0,0,0.15) 4px)" }} />

              {/* Center performer visual */}
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 4 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: `${color}33`, border: `2px solid ${color}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                  🎤
                </div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em", textAlign: "center", padding: "0 8px" }}>
                  {tile.performer}
                </div>
              </div>

              {/* Status badge */}
              <div style={{ position: "absolute", top: 6, left: 6, background: tile.status === "live" ? "#FF2DAA" : tile.status === "starting" ? "#FFD700" : "rgba(255,255,255,0.2)", borderRadius: 4, padding: "2px 6px", fontSize: 8, fontWeight: 900, color: "#fff", letterSpacing: "0.12em" }}>
                {tile.status === "live" ? "● LIVE" : tile.status === "starting" ? "⏳ SOON" : "▶ REPLAY"}
              </div>

              {/* Prize */}
              {tile.prizePool && (
                <div style={{ position: "absolute", top: 6, right: 6, background: "rgba(255,215,0,0.15)", border: "1px solid rgba(255,215,0,0.4)", borderRadius: 4, padding: "2px 6px", fontSize: 8, color: "#FFD700", fontWeight: 900 }}>
                  {tile.prizePool}
                </div>
              )}

              {/* Viewers */}
              {showViewers && (
                <div style={{ position: "absolute", bottom: 6, right: 6, background: "rgba(0,0,0,0.6)", borderRadius: 4, padding: "2px 7px", fontSize: 9, color: "rgba(255,255,255,0.75)", fontWeight: 700 }}>
                  👁 {viewers.toLocaleString()}
                </div>
              )}
            </div>

            {/* Footer info */}
            <div style={{ padding: "8px 10px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#fff", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {tile.title}
              </div>
              <div style={{ fontSize: 9, color: color, letterSpacing: "0.1em", fontWeight: 800 }}>
                {tile.genre.toUpperCase()}
              </div>
            </div>
          </a>
        );
      })}
    </div>
  );
}
