"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CATEGORY_LABELS, CATEGORY_ICONS, type CompetitionCategory } from "@/lib/competition/ChampionshipYearlyEngine";

// Recent champions across all disciplines — fan-voted belts, trophies, crowns

const RECENT_WINNERS: Array<{
  artistId: string;
  artistName: string;
  category: CompetitionCategory;
  period: string;
  award: "belt" | "trophy" | "crown";
  prize: string;
  votes: string;
  replayHref: string;
  accent: string;
}> = [
  { artistId: "a1", artistName: "Crown Mic",      category: "rapper",             period: "Week 21", award: "belt",   prize: "$300",  votes: "4,820",  replayHref: "/battles/replay/crown-mic-w21",    accent: "#FF2DAA" },
  { artistId: "a2", artistName: "Nova Wave",       category: "singer",             period: "Week 21", award: "belt",   prize: "$400",  votes: "6,140",  replayHref: "/battles/replay/nova-wave-w21",    accent: "#FFD700" },
  { artistId: "a3", artistName: "Soulfire Band",   category: "battle-of-the-band", period: "Week 20", award: "belt",   prize: "$500",  votes: "8,305",  replayHref: "/battles/replay/soulfire-w20",     accent: "#FF6B35" },
  { artistId: "a4", artistName: "DJ Kreach",       category: "dj",                 period: "Week 21", award: "belt",   prize: "$150",  votes: "2,980",  replayHref: "/battles/replay/kreach-w21",       accent: "#00FF88" },
  { artistId: "a5", artistName: "Lyrix Queen",     category: "comedian",           period: "May 2026",award: "trophy", prize: "$1,000",votes: "21,400", replayHref: "/battles/replay/lyrix-may-26",     accent: "#AA2DFF" },
  { artistId: "a6", artistName: "Delta Flame",     category: "dancer",             period: "Week 20", award: "belt",   prize: "$200",  votes: "5,570",  replayHref: "/battles/replay/delta-w20",        accent: "#00FFFF" },
];

const AWARD_ICON: Record<"belt" | "trophy" | "crown", string> = {
  belt:   "🥋",
  trophy: "🏆",
  crown:  "👑",
};

const AWARD_LABEL: Record<"belt" | "trophy" | "crown", string> = {
  belt:   "BELT",
  trophy: "TROPHY",
  crown:  "CROWN",
};

export default function WinnerReplayWall() {
  return (
    <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.3em", color: "#00FFFF", textTransform: "uppercase", marginBottom: 4 }}>
            Hall of Champions
          </div>
          <div style={{ fontSize: "clamp(16px,2.5vw,24px)", fontWeight: 900, color: "#fff", fontFamily: "var(--font-tmi-bebas,'Bebas Neue',Impact,sans-serif)", letterSpacing: "0.04em" }}>
            RECENT WINNERS — REPLAY THE MOMENT
          </div>
        </div>
        <Link href="/battles/hall-of-fame" style={{ textDecoration: "none", fontSize: 8, fontWeight: 800, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }}>
          HALL OF FAME →
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
        {RECENT_WINNERS.map((w, i) => (
          <motion.div
            key={w.artistId + w.period}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.06, duration: 0.35 }}
          >
            <Link href={w.replayHref} style={{ textDecoration: "none" }}>
              <motion.div
                whileHover={{ scale: 1.03, boxShadow: `0 0 30px ${w.accent}44` }}
                style={{
                  borderRadius: 12,
                  border: `1px solid ${w.accent}44`,
                  background: `linear-gradient(145deg, ${w.accent}18, rgba(5,5,16,0.97))`,
                  padding: "16px 18px",
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Award badge */}
                <div style={{
                  position: "absolute", top: 12, right: 12,
                  fontSize: 9, fontWeight: 900, letterSpacing: "0.1em",
                  background: w.accent, color: w.accent === "#FFD700" || w.accent === "#00FFFF" || w.accent === "#00FF88" ? "#000" : "#fff",
                  borderRadius: 5, padding: "2px 8px",
                }}>
                  {AWARD_ICON[w.award]} {AWARD_LABEL[w.award]}
                </div>

                <div style={{ fontSize: 20, marginBottom: 8 }}>{CATEGORY_ICONS[w.category]}</div>

                <div style={{ fontSize: 14, fontWeight: 900, color: "#fff", marginBottom: 2 }}>{w.artistName}</div>
                <div style={{ fontSize: 10, color: w.accent, fontWeight: 800, marginBottom: 2, letterSpacing: "0.06em" }}>
                  {CATEGORY_LABELS[w.category]}
                </div>
                <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", marginBottom: 14, letterSpacing: "0.08em" }}>
                  {w.period} · {w.votes} VOTES
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 16, fontWeight: 900, color: "#FFD700" }}>{w.prize}</span>
                  <span style={{
                    fontSize: 8, fontWeight: 900, letterSpacing: "0.1em",
                    border: `1px solid ${w.accent}66`,
                    color: w.accent,
                    borderRadius: 6, padding: "4px 10px",
                  }}>
                    ▶ REPLAY
                  </span>
                </div>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
