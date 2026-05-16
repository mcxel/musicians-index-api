import type { Metadata } from "next";
import Link from "next/link";
import { getCrownRankRuntime } from "@/lib/home/CrownRankRuntime";
import { createLeague, getActiveLeague, getLeaderboard } from "@/lib/trophy/QuarterlyLeagueEngine";
import { getCrownHistory } from "@/lib/trophy/AnnualCrownEngine";

export const metadata: Metadata = {
  title: "Leaderboard | TMI",
  description: "Top-ranked artists on The Musician's Index. Crown holders, challengers, and rising acts.",
};

const BADGE_STYLE: Record<string, { color: string; bg: string; label: string }> = {
  Crown:  { color: "#FFD700", bg: "rgba(255,215,0,0.12)",   label: "👑 Crown"  },
  Gold:   { color: "#FFD700", bg: "rgba(255,215,0,0.08)",   label: "🥇 Gold"   },
  Silver: { color: "#C0C0C0", bg: "rgba(192,192,192,0.08)", label: "🥈 Silver" },
  Bronze: { color: "#CD7F32", bg: "rgba(205,127,50,0.08)",  label: "🥉 Bronze" },
};

export default function LeaderboardPage() {
  const entries = getCrownRankRuntime(10);

  let activeLeague = getActiveLeague();
  if (!activeLeague) {
    activeLeague = createLeague(2026, "Q2", 5000, "2026-04-01", "2026-06-30");
  }
  const leagueBoard = getLeaderboard(activeLeague.leagueId, 3);
  const crownHistory = getCrownHistory().slice(0, 2);

  return (
    <main data-testid="leaderboard-page" style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px" }}>
        <Link href="/home/2" style={{ color: "#00FFFF", textDecoration: "none", fontSize: 12 }}>← Back to Charts</Link>

        <div style={{ marginTop: 20, marginBottom: 32 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#FFD700", fontWeight: 800, marginBottom: 8 }}>TMI RANKINGS</div>
          <h1 style={{ margin: 0, fontSize: "clamp(1.8rem,5vw,2.8rem)", fontWeight: 900 }}>Leaderboard</h1>
        </div>

        <div style={{ display: "grid", gap: 8, marginBottom: 24 }}>
          {entries.map(({ rank, name, score, badge, delta, movement, route, voteRoute, genre }) => {
            const isTop3 = rank <= 3;
            const badgeCfg = BADGE_STYLE[badge] ?? null;
            const movColor = movement === "rising" ? "#00FF88" : movement === "falling" ? "#FF4466" : "rgba(255,255,255,0.3)";
            const movIcon = movement === "rising" ? "▲" : movement === "falling" ? "▼" : "—";

            return (
              <div
                key={`lb-rank-${rank}`}
                data-testid={`lb-rank-${rank}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  border: `1px solid ${isTop3 ? "rgba(255,215,0,0.2)" : "rgba(255,255,255,0.06)"}`,
                  borderRadius: 12,
                  padding: "14px 16px",
                  background: rank === 1 ? "rgba(255,215,0,0.06)" : "rgba(255,255,255,0.015)",
                }}
              >
                <span style={{ fontSize: rank <= 3 ? 22 : 16, fontWeight: 900, color: isTop3 ? "#FFD700" : "rgba(255,255,255,0.4)", minWidth: 32, textAlign: "center" }}>
                  #{rank}
                </span>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <Link href={route} style={{ fontSize: 14, fontWeight: 800, color: "#fff", textDecoration: "none" }}>{name}</Link>
                    {badgeCfg && (
                      <span style={{ fontSize: 9, fontWeight: 800, color: badgeCfg.color, background: badgeCfg.bg, border: `1px solid ${badgeCfg.color}40`, borderRadius: 4, padding: "2px 7px" }}>
                        {badgeCfg.label}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{genre}</div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#00FFFF", fontVariantNumeric: "tabular-nums" }}>{score.toLocaleString()} pts</div>
                    {delta !== 0 && (
                      <div style={{ fontSize: 9, color: movColor, fontWeight: 700 }}>
                        {movIcon} {Math.abs(delta).toLocaleString()}
                      </div>
                    )}
                  </div>
                  <Link href={voteRoute} style={{ fontSize: 9, fontWeight: 800, color: "#AA2DFF", border: "1px solid rgba(170,45,255,0.3)", borderRadius: 6, padding: "5px 10px", textDecoration: "none", whiteSpace: "nowrap" }}>
                    VOTE
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {activeLeague && (
          <div style={{ marginBottom: 20, padding: "14px 16px", background: "rgba(255,215,0,0.04)", border: "1px solid rgba(255,215,0,0.2)", borderRadius: 12 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#FFD700", fontWeight: 800, marginBottom: 8 }}>
              {activeLeague.quarter} {activeLeague.year} LEAGUE — {activeLeague.status.toUpperCase()} · ${activeLeague.prizePool.toLocaleString()} PRIZE POOL
            </div>
            {leagueBoard.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {leagueBoard.map((p, i) => (
                  <div key={p.artistId} style={{ fontSize: 11, display: "flex", gap: 8 }}>
                    <span style={{ color: "#FFD700", minWidth: 18 }}>#{i + 1}</span>
                    <span style={{ color: "#fff" }}>{p.displayName}</span>
                    <span style={{ color: "rgba(255,255,255,0.4)", marginLeft: "auto" }}>{p.points} pts · {p.wins}W</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>No participants yet — battles start the rankings.</div>
            )}
            {crownHistory.length > 0 && (
              <div style={{ marginTop: 10, fontSize: 9, color: "rgba(255,215,0,0.6)" }}>
                Annual Crown: {crownHistory.map(c => `${c.crownHolderId} (${c.year})`).join(" · ")}
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: 20, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link data-testid="lb-to-prizes" href="/prizes" style={{ color: "#00FFFF", textDecoration: "none", fontSize: 12, border: "1px solid rgba(0,255,255,0.2)", borderRadius: 8, padding: "9px 14px" }}>Prizes →</Link>
          <Link data-testid="lb-to-achievements" href="/achievements" style={{ color: "#AA2DFF", textDecoration: "none", fontSize: 12, border: "1px solid rgba(170,45,255,0.2)", borderRadius: 8, padding: "9px 14px" }}>Achievements →</Link>
          <Link href="/battles/live" style={{ color: "#FFD700", textDecoration: "none", fontSize: 12, border: "1px solid rgba(255,215,0,0.2)", borderRadius: 8, padding: "9px 14px" }}>Live Battles →</Link>
        </div>
      </div>
    </main>
  );
}
