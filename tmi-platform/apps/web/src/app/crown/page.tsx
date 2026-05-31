"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { getCrownRankRuntime, type CrownRankRuntimeEntry } from "@/lib/home/CrownRankRuntime";
import { getCrownColor, crownFloatVariant, crownGlowVariant, winnerSlideVariant } from "@/engine/crown/crownAnimation";
import { getCurrentYearCrown, getCrownHistory } from "@/lib/trophy/AnnualCrownEngine";
import { getActiveLeague } from "@/lib/trophy/QuarterlyLeagueEngine";

const MOVEMENT_ICON: Record<string, string> = {
  rising: "▲",
  falling: "▼",
  holding: "—",
};
const MOVEMENT_COLOR: Record<string, string> = {
  rising: "#00FF88",
  falling: "#FF4040",
  holding: "rgba(255,255,255,0.2)",
};

function rankBg(rank: number) {
  if (rank === 1) return "linear-gradient(135deg, rgba(255,215,0,0.12) 0%, rgba(255,215,0,0.04) 100%)";
  if (rank === 2) return "linear-gradient(135deg, rgba(192,192,192,0.08) 0%, transparent 100%)";
  if (rank === 3) return "linear-gradient(135deg, rgba(205,127,50,0.08) 0%, transparent 100%)";
  return "transparent";
}

export default function CrownPage() {
  const entries = getCrownRankRuntime(20);
  const top = entries[0] ?? null;
  const currentCrown = getCurrentYearCrown();
  const history = getCrownHistory().slice(0, 5);
  const league = getActiveLeague();

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      {/* Hero */}
      <section style={{
        textAlign: "center",
        padding: "56px 24px 40px",
        background: "linear-gradient(180deg, rgba(255,215,0,0.06) 0%, transparent 100%)",
        borderBottom: "1px solid rgba(255,215,0,0.1)",
      }}>
        <motion.div
          variants={crownFloatVariant}
          initial="idle"
          animate="float"
          style={{ fontSize: 56, display: "inline-block", marginBottom: 12 }}
        >
          👑
        </motion.div>
        <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#FFD700", fontWeight: 800, marginBottom: 8 }}>
          TMI SEASON 1 · 2026
        </div>
        <h1 style={{ fontSize: "clamp(1.6rem,4vw,2.8rem)", fontWeight: 900, marginBottom: 8 }}>
          The Crown
        </h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", maxWidth: 420, margin: "0 auto" }}>
          Real-time rankings across battles, cyphers, and crowd votes. The Crown belongs to the best.
        </p>

        {top && (
          <motion.div
            variants={winnerSlideVariant}
            initial="enter"
            animate="visible"
            style={{
              display: "inline-flex", alignItems: "center", gap: 12,
              marginTop: 28, padding: "12px 24px",
              background: "rgba(255,215,0,0.07)",
              border: "1px solid rgba(255,215,0,0.3)",
              borderRadius: 40,
            }}
          >
            <span style={{ fontSize: 20 }}>👑</span>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "#FFD700", fontWeight: 800 }}>CURRENT #1</div>
              <div style={{ fontSize: 14, fontWeight: 900, color: "#fff" }}>{top.name}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{top.genre} · {top.flagEmoji} {top.score.toLocaleString()} pts</div>
            </div>
            <Link
              href={top.voteRoute}
              style={{ padding: "6px 16px", background: "#FFD700", color: "#050510", borderRadius: 20, fontSize: 9, fontWeight: 900, textDecoration: "none", letterSpacing: "0.1em" }}
            >
              VOTE
            </Link>
          </motion.div>
        )}
      </section>

      {/* Live League Banner */}
      {league && (
        <div style={{
          background: "rgba(255,45,170,0.06)",
          borderBottom: "1px solid rgba(255,45,170,0.15)",
          padding: "10px 24px",
          textAlign: "center",
          fontSize: 10, color: "#FF2DAA", fontWeight: 700, letterSpacing: "0.1em",
        }}>
          🔥 {league.quarter} {league.year} LEAGUE ACTIVE · {league.participants.length} artists competing · Prize pool: ${league.prizePool.toLocaleString()}
        </div>
      )}

      <div style={{ maxWidth: 880, margin: "0 auto", padding: "40px 20px 0", display: "grid", gridTemplateColumns: "1fr 280px", gap: 24 }}>
        {/* Leaderboard */}
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#FFD700", fontWeight: 800, marginBottom: 16 }}>
            LIVE RANKINGS
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {entries.length === 0 ? (
              <div style={{ padding: "32px", textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12 }}>
                Rankings updating — check back after battles complete.
              </div>
            ) : entries.map((entry: CrownRankRuntimeEntry, idx: number) => (
              <motion.div
                key={entry.artistId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04 }}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "12px 16px",
                  background: rankBg(entry.rank),
                  border: `1px solid ${entry.rank <= 3 ? getCrownColor(entry.rank) + "22" : "rgba(255,255,255,0.04)"}`,
                  borderRadius: 10,
                }}
              >
                {/* Rank */}
                <div style={{
                  width: 32, textAlign: "center", flexShrink: 0,
                  fontSize: entry.rank <= 3 ? 16 : 12,
                  fontWeight: 900,
                  color: getCrownColor(entry.rank),
                }}>
                  {entry.rank <= 3 ? ["👑", "🥈", "🥉"][entry.rank - 1] : `#${entry.rank}`}
                </div>

                {/* Badge */}
                <div style={{
                  width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                  background: `${getCrownColor(entry.rank)}18`,
                  border: `1px solid ${getCrownColor(entry.rank)}33`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16,
                }}>
                  {entry.badge}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {entry.name} <span style={{ fontSize: 10 }}>{entry.flagEmoji}</span>
                  </div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>
                    {entry.genre} · {entry.score.toLocaleString()} pts
                  </div>
                </div>

                {/* Movement */}
                <div style={{
                  fontSize: 9, fontWeight: 700, flexShrink: 0,
                  color: MOVEMENT_COLOR[entry.movement],
                }}>
                  {MOVEMENT_ICON[entry.movement]} {entry.delta !== 0 ? Math.abs(entry.delta) : ""}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <Link
                    href={entry.route}
                    style={{ padding: "4px 10px", borderRadius: 12, fontSize: 8, fontWeight: 800, color: "#00FFFF", border: "1px solid rgba(0,255,255,0.25)", textDecoration: "none" }}
                  >
                    PROFILE
                  </Link>
                  <Link
                    href={entry.voteRoute}
                    style={{ padding: "4px 10px", borderRadius: 12, fontSize: 8, fontWeight: 800, color: "#FFD700", border: "1px solid rgba(255,215,0,0.25)", textDecoration: "none" }}
                  >
                    VOTE
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Annual Crown Holder */}
          <div style={{
            padding: "20px",
            background: "rgba(255,215,0,0.04)",
            border: "1px solid rgba(255,215,0,0.18)",
            borderRadius: 14,
          }}>
            <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#FFD700", fontWeight: 800, marginBottom: 12 }}>
              ANNUAL CROWN
            </div>
            {currentCrown ? (
              <>
                <motion.div
                  variants={crownGlowVariant}
                  initial="idle"
                  animate="pulse"
                  style={{ fontSize: 32, textAlign: "center", display: "block", marginBottom: 8 }}
                >
                  👑
                </motion.div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 14, fontWeight: 900, color: "#FFD700" }}>{currentCrown.displayName}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
                    {currentCrown.totalPoints.toLocaleString()} pts · {currentCrown.battlesWon} wins
                  </div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>
                    Crowned {new Date(currentCrown.crownedAt).toLocaleDateString()}
                  </div>
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.3)", padding: "12px 0" }}>
                Season in progress — crown awarded at year end.
              </div>
            )}
          </div>

          {/* Crown History */}
          {history.length > 0 && (
            <div style={{
              padding: "20px",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 14,
            }}>
              <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "rgba(255,255,255,0.3)", fontWeight: 800, marginBottom: 12 }}>
                CROWN HISTORY
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {history.map(c => (
                  <div key={c.crownId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>{c.displayName}</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)" }}>{c.year}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick links */}
          <div style={{
            padding: "20px",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 14,
          }}>
            <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "rgba(255,255,255,0.3)", fontWeight: 800, marginBottom: 12 }}>
              COMPETE
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { href: "/battles/live", label: "⚔️  Enter a Battle" },
                { href: "/cyphers", label: "🎤  Join a Cypher" },
                { href: "/leaderboard", label: "📊  Full Leaderboard" },
                { href: "/season-pass", label: "🎟️  Get Season Pass" },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  style={{
                    fontSize: 10, color: "#00FFFF", textDecoration: "none",
                    padding: "8px 12px", borderRadius: 8,
                    background: "rgba(0,255,255,0.04)",
                    border: "1px solid rgba(0,255,255,0.1)",
                    fontWeight: 600,
                  }}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
