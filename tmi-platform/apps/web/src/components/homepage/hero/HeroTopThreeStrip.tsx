"use client";

import Link from "next/link";

// Top 3 ranked artists shown below the "Who Took The Crown?" headline.
// Replaces the plain rank badge row with hover-interactive portrait cards.
const TOP_THREE = [
  { rank: 1, name: "Wavetek",    initials: "WV", genre: "Trap",    score: "14.2k", href: "/artist/wavetek",    color: "#FFD700", glow: "rgba(255,215,0,0.4)" },
  { rank: 2, name: "FlowMaster", initials: "FM", genre: "Hip-Hop", score: "11.8k", href: "/artist/flowmaster", color: "#00FFFF", glow: "rgba(0,255,255,0.35)" },
  { rank: 3, name: "Krypt",      initials: "KR", genre: "Drill",   score: "9.4k",  href: "/artist/krypt",      color: "#FF2DAA", glow: "rgba(255,45,170,0.35)" },
];

export default function HeroTopThreeStrip() {
  return (
    <div className="flex gap-2 justify-center">
      {TOP_THREE.map((artist) => (
        <Link key={artist.rank} href={artist.href} style={{ textDecoration: "none" }}>
          <div
            className="flex flex-col items-center gap-1 rounded-xl border px-3 py-2.5 backdrop-blur-sm transition-all duration-200 hover:scale-105"
            style={{
              borderColor: `${artist.color}38`,
              background: `radial-gradient(circle at 50% 0%, ${artist.color}12, rgba(0,0,0,0.55))`,
              boxShadow: `0 0 0 0 ${artist.glow}`,
            }}
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full border"
              style={{
                borderColor: `${artist.color}55`,
                background: `radial-gradient(circle at 35% 35%, ${artist.color}1e, rgba(5,5,16,0.85))`,
                boxShadow: `0 0 14px ${artist.glow}`,
              }}
            >
              <span className="text-xs font-black" style={{ color: artist.color }}>
                {artist.initials}
              </span>
            </div>
            <span className="text-[8px] font-black uppercase tracking-[0.18em]" style={{ color: artist.color }}>
              #{artist.rank}
            </span>
            <span className="text-[11px] font-black uppercase text-white leading-none">{artist.name}</span>
            <span className="text-[9px] uppercase tracking-[0.11em] text-zinc-400">{artist.genre}</span>
            <span className="text-[10px] font-bold" style={{ color: artist.color }}>{artist.score}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
