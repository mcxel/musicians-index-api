"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  makeContender,
  simulateVoteTick,
  resolveCrownHolder,
  buildOrbitPositions,
  type CrownContender,
} from "@/engines/home/CrownCycleEngine";
import { getTop10, getGenreRanking, getRisingArtists } from "@/packages/magazine-engine/dataAdapters";

const ACCENT = "#FFD700";
const TIER_COLORS: Record<string, string> = {
  CROWN:   "#FFD700",
  TOP:     "#00FFFF",
  RISING:  "#00FF88",
  NEW:     "#FF2DAA",
};
const MOVEMENT_ICON: Record<string, string> = {
  rising:  "↑",
  falling: "↓",
  holding: "—",
};
const MOVEMENT_COLOR: Record<string, string> = {
  rising:  "#00FF88",
  falling: "#FF2DAA",
  holding: "rgba(255,255,255,0.3)",
};

const GENRE_TREND_COLORS: Record<string, string> = {
  rising:  "#00FF88",
  stable:  "#00FFFF",
  falling: "#FF2DAA",
};

function getRankColor(rank: number): string {
  if (rank === 1) return "#FFD700";
  if (rank === 2) return "#C0C0C0";
  if (rank === 3) return "#CD7F32";
  return "rgba(255,255,255,0.35)";
}

export default function CrownRankingsPage() {
  const [contenders, setContenders] = useState<CrownContender[]>([]);
  const [tab, setTab] = useState<"global" | "genre" | "rising">("global");
  const [tick, setTick] = useState(0);

  // Seed contenders from data adapters
  useEffect(() => {
    const top = getTop10();
    const angles = buildOrbitPositions(top.length);
    const seeded = top.map((e, i) =>
      makeContender(e.name, e.name, e.score, "", angles[i])
    );
    const withHolder = seeded.map((c) => ({
      ...c,
      isCurrentCrown: resolveCrownHolder(seeded)?.performerId === c.performerId,
    }));
    setContenders(withHolder);
  }, []);

  // Live vote simulation every 4s
  const tickVotes = useCallback(() => {
    setContenders((prev) => simulateVoteTick(prev));
    setTick((t) => t + 1);
  }, []);

  useEffect(() => {
    const id = setInterval(tickVotes, 4000);
    return () => clearInterval(id);
  }, [tickVotes]);

  const holder = resolveCrownHolder(contenders);
  const sorted = [...contenders].sort((a, b) => b.votes - a.votes);
  const genreRanking = getGenreRanking();
  const rising = getRisingArtists();

  return (
    <main style={{ background: "#050510", minHeight: "100vh", fontFamily: "'Inter', sans-serif", color: "#fff" }}>

      {/* Top nav */}
      <div style={{ background: "rgba(0,0,0,0.8)", borderBottom: "1px solid rgba(255,215,0,0.15)", padding: "12px 24px", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 50 }}>
        <Link href="/charts" style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textDecoration: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "4px 10px" }}>
          ← Charts
        </Link>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 9, letterSpacing: "0.35em", color: ACCENT, fontWeight: 800 }}>CROWN RANKINGS</span>
        </div>
        <span style={{ fontSize: 9, color: "#00FF88", fontWeight: 700, letterSpacing: "0.1em" }}>● LIVE</span>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "36px 24px 80px" }}>

        {/* Crown Holder Hero */}
        {holder && (
          <motion.div
            key={holder.performerId + tick}
            initial={{ opacity: 0.85 }}
            animate={{ opacity: 1 }}
            style={{
              background: "radial-gradient(circle at 20% 0%, rgba(255,215,0,0.22), transparent 55%), linear-gradient(165deg, rgba(30,18,2,0.97), rgba(5,5,16,0.97))",
              border: "1.5px solid rgba(255,215,0,0.45)",
              borderRadius: 18,
              padding: "28px 28px",
              marginBottom: 32,
              display: "grid",
              gap: 10,
            }}
          >
            <div style={{ fontSize: 9, color: ACCENT, letterSpacing: "0.35em", fontWeight: 800 }}>👑 CROWN HOLDER — SEASON 1</div>
            <div style={{ fontSize: "clamp(24px, 4vw, 42px)", fontWeight: 900 }}>{holder.name}</div>
            <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 28, fontWeight: 900, color: ACCENT }}>{holder.votes.toLocaleString()} pts</span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }}>LIVE VOTES</span>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 4 }}>
              <Link href={`/artists/${holder.performerId}`} style={{ padding: "9px 20px", background: ACCENT, color: "#050510", borderRadius: 8, fontWeight: 900, fontSize: 11, textDecoration: "none", letterSpacing: "0.08em" }}>
                ARTIST PROFILE
              </Link>
              <Link href="/vote" style={{ padding: "9px 20px", background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.3)", color: ACCENT, borderRadius: 8, fontWeight: 800, fontSize: 11, textDecoration: "none", letterSpacing: "0.08em" }}>
                CAST YOUR VOTE
              </Link>
              <Link href="/battles" style={{ padding: "9px 20px", background: "rgba(255,45,170,0.08)", border: "1px solid rgba(255,45,170,0.25)", color: "#FF2DAA", borderRadius: 8, fontWeight: 800, fontSize: 11, textDecoration: "none", letterSpacing: "0.08em" }}>
                CHALLENGE
              </Link>
            </div>
          </motion.div>
        )}

        {/* Tab selector */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {(["global", "genre", "rising"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "7px 16px", borderRadius: 8, border: `1px solid ${tab === t ? ACCENT : "rgba(255,255,255,0.1)"}`,
              background: tab === t ? `${ACCENT}18` : "transparent",
              color: tab === t ? ACCENT : "rgba(255,255,255,0.4)",
              fontSize: 10, fontWeight: 800, cursor: "pointer", letterSpacing: "0.12em", textTransform: "uppercase",
            }}>
              {t === "global" ? "Global Top 10" : t === "genre" ? "By Genre" : "Rising"}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* Global rankings */}
          {tab === "global" && (
            <motion.div key="global" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {sorted.map((entry, i) => {
                  const rankColor = getRankColor(i + 1);
                  const top = getTop10()[i];
                  return (
                    <motion.div
                      key={entry.performerId}
                      layout
                      style={{
                        display: "grid",
                        gridTemplateColumns: "40px 1fr auto auto",
                        gap: 16,
                        alignItems: "center",
                        padding: "14px 20px",
                        background: i === 0 ? "rgba(255,215,0,0.06)" : "rgba(255,255,255,0.025)",
                        border: `1px solid ${i === 0 ? "rgba(255,215,0,0.3)" : "rgba(255,255,255,0.06)"}`,
                        borderRadius: 12,
                      }}
                    >
                      {/* Rank */}
                      <span style={{ fontSize: i < 3 ? 20 : 15, fontWeight: 900, color: rankColor, textAlign: "center" }}>
                        {i === 0 ? "👑" : `#${i + 1}`}
                      </span>

                      {/* Name + genre */}
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>{entry.name}</div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                          {top?.genre ?? "—"}
                          {top?.isNew && <span style={{ marginLeft: 6, color: "#FF2DAA", fontWeight: 800 }}>NEW</span>}
                        </div>
                      </div>

                      {/* Badge */}
                      <span style={{
                        fontSize: 8, fontWeight: 900,
                        color: TIER_COLORS[top?.badge ?? "TOP"] ?? "#00FFFF",
                        border: `1px solid ${TIER_COLORS[top?.badge ?? "TOP"] ?? "#00FFFF"}30`,
                        padding: "3px 8px", borderRadius: 4, letterSpacing: "0.12em",
                      }}>
                        {top?.badge ?? "TOP"}
                      </span>

                      {/* Score + delta */}
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 15, fontWeight: 800, color: rankColor }}>{entry.votes.toLocaleString()}</div>
                        {top && (
                          <div style={{ fontSize: 10, color: MOVEMENT_COLOR[top.delta > 0 ? "rising" : top.delta < 0 ? "falling" : "holding"], fontWeight: 700, marginTop: 2 }}>
                            {top.delta > 0 ? "↑" : top.delta < 0 ? "↓" : "—"} {top.delta !== 0 ? Math.abs(top.delta) : ""}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Season info bar */}
              <div style={{ marginTop: 20, padding: "14px 20px", background: "rgba(255,215,0,0.04)", border: "1px solid rgba(255,215,0,0.15)", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                <div style={{ fontSize: 11, color: "rgba(255,215,0,0.6)" }}>
                  Season 1 · Rankings update live during active battles · Vote to influence the next crown holder
                </div>
                <Link href="/contests" style={{ fontSize: 10, color: ACCENT, fontWeight: 800, textDecoration: "none", border: "1px solid rgba(255,215,0,0.3)", padding: "5px 12px", borderRadius: 6 }}>
                  VIEW SEASON →
                </Link>
              </div>
            </motion.div>
          )}

          {/* Genre breakdown */}
          {tab === "genre" && (
            <motion.div key="genre" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
                {genreRanking.map((g, i) => (
                  <div key={g.genre} style={{
                    background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 14, padding: "18px 20px", position: "relative", overflow: "hidden",
                  }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: GENRE_TREND_COLORS[g.trend] }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{g.genre}</div>
                        <div style={{ fontSize: 10, color: GENRE_TREND_COLORS[g.trend], fontWeight: 700, marginTop: 3, letterSpacing: "0.08em" }}>
                          {g.trend.toUpperCase()} · {g.count.toLocaleString()} artists
                        </div>
                      </div>
                      <span style={{ fontSize: 18, color: i === 0 ? ACCENT : "rgba(255,255,255,0.3)", fontWeight: 900 }}>#{i + 1}</span>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "10px 12px" }}>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em", marginBottom: 4 }}>GENRE LEADER</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{g.leader.name}</div>
                      <div style={{ fontSize: 11, color: ACCENT, fontWeight: 800, marginTop: 2 }}>{g.leader.score.toLocaleString()} pts</div>
                    </div>
                    <Link href={`/articles/artist/${g.leader.name.toLowerCase().replace(/\s+/g, "-")}`} style={{ display: "block", marginTop: 10, textAlign: "center", padding: "7px", background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.2)", borderRadius: 7, color: ACCENT, fontSize: 10, fontWeight: 700, textDecoration: "none", letterSpacing: "0.1em" }}>
                      VIEW PROFILE →
                    </Link>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Rising */}
          {tab === "rising" && (
            <motion.div key="rising" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={{ marginBottom: 16, fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em" }}>
                ARTISTS WITH MOMENTUM — FASTEST RISING THIS WEEK
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {rising.map((entry, i) => (
                  <div key={entry.name} style={{
                    display: "grid", gridTemplateColumns: "1fr auto",
                    gap: 16, alignItems: "center",
                    padding: "14px 20px", borderRadius: 12,
                    background: "rgba(0,255,136,0.04)", border: "1px solid rgba(0,255,136,0.15)",
                  }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{entry.name}</span>
                        <span style={{ fontSize: 8, color: "#00FF88", fontWeight: 900, letterSpacing: "0.12em", border: "1px solid rgba(0,255,136,0.3)", padding: "2px 6px", borderRadius: 3 }}>RISING</span>
                        {entry.isNew && <span style={{ fontSize: 8, color: "#FF2DAA", fontWeight: 900, letterSpacing: "0.12em", border: "1px solid rgba(255,45,170,0.3)", padding: "2px 6px", borderRadius: 3 }}>NEW</span>}
                      </div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{entry.genre} · #{entry.rank} overall</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "#00FF88" }}>+{entry.delta}</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>positions</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 24, padding: "16px 20px", background: "rgba(0,255,136,0.04)", border: "1px solid rgba(0,255,136,0.15)", borderRadius: 10 }}>
                <div style={{ fontSize: 11, color: "rgba(0,255,136,0.6)" }}>
                  Rising artists earn 2× XP during Season 1. Momentum tracked over 7-day rolling window.
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Bottom CTA row */}
        <div style={{ marginTop: 40, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/battles" style={{ padding: "12px 24px", background: "linear-gradient(90deg, #FF2DAA, #AA2DFF)", borderRadius: 9, color: "#fff", fontWeight: 900, fontSize: 12, textDecoration: "none", letterSpacing: "0.08em" }}>
            ENTER BATTLE
          </Link>
          <Link href="/vote" style={{ padding: "12px 24px", background: `linear-gradient(90deg, ${ACCENT}, #FF9500)`, borderRadius: 9, color: "#050510", fontWeight: 900, fontSize: 12, textDecoration: "none", letterSpacing: "0.08em" }}>
            CAST VOTE
          </Link>
          <Link href="/contests" style={{ padding: "12px 20px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 9, color: "rgba(255,255,255,0.7)", fontWeight: 800, fontSize: 12, textDecoration: "none", letterSpacing: "0.08em" }}>
            SEASON INFO
          </Link>
          <Link href="/home/1" style={{ padding: "12px 20px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 9, color: "rgba(255,255,255,0.7)", fontWeight: 800, fontSize: 12, textDecoration: "none", letterSpacing: "0.08em" }}>
            ← HOME
          </Link>
        </div>

      </div>
    </main>
  );
}
