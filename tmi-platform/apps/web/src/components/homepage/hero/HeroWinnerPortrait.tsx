"use client";

import { getBadgeStyle, getHeroGradient } from "@/theme/magazine-palette-engine";

// Current crown holder rendered inside the hero medallion center.
// Uses seeded data — swap `CROWN_WINNER` for live API data when ready.
const CROWN_WINNER = {
  name: "Wavetek",
  initials: "WV",
  genre: "Trap · Houston TX",
  score: "14,200",
  color: "#00FFFF",
  glowColor: "rgba(0,255,255,0.45)",
};

export default function HeroWinnerPortrait() {
  return (
    <div className="relative z-10 flex flex-col items-center gap-1">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-full border-2 md:h-20 md:w-20"
        style={{
          borderColor: `${CROWN_WINNER.color}60`,
          background: `radial-gradient(circle at 35% 35%, ${CROWN_WINNER.color}22, rgba(5,5,16,0.88))`,
          boxShadow: `0 0 32px ${CROWN_WINNER.glowColor}, inset 0 0 18px rgba(0,255,255,0.08)`,
        }}
      >
        <span
          className="text-xl font-black tracking-tight md:text-2xl"
          style={{ color: CROWN_WINNER.color, textShadow: `0 0 14px ${CROWN_WINNER.glowColor}` }}
        >
          {CROWN_WINNER.initials}
        </span>
      </div>
      <span
        className="text-xs font-black uppercase tracking-widest"
        style={{
          color: CROWN_WINNER.color,
          textShadow: `0 0 10px ${CROWN_WINNER.glowColor}`,
          backgroundImage: getHeroGradient("hip-hop"),
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {CROWN_WINNER.name}
      </span>
      <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-zinc-400" style={getBadgeStyle("hip-hop", "ghost")}>
        {CROWN_WINNER.score} pts
      </span>
    </div>
  );
}
