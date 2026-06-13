import type { Metadata } from "next";
import Link from "next/link";
import { getCrownRankRuntime } from "@/lib/home/CrownRankRuntime";
import { createLeague, getActiveLeague, getLeaderboard } from "@/lib/trophy/QuarterlyLeagueEngine";
import { getCrownHistory } from "@/lib/trophy/AnnualCrownEngine";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Leaderboard | TMI",
  description: "Top-ranked artists on The Musician's Index. Crown holders, challengers, and rising acts.",
};

const BADGE_STYLE: Record<string, { color: string; bg: string; label: string }> = {
  Crown:  { color: "#FFD700", bg: "rgba(255,215,0,0.12)",   label: "👑 Crown"  },
  Gold:   { color: "#FFD700", bg: "rgba(255,215,0,0.08)",   label: "🥇 Gold"   },
  Silver: { color: "#C0C0C0", bg: "rgba(192,192,192,0.08)", label: "🥈 Silver" },
  RUBY:   { color: "#CD7F32", bg: "rgba(205,127,50,0.08)",  label: "🥉 RUBY"   },
};

const GENRE_POOL = [
  "Hip-Hop", "R&B", "Trap", "Pop", "Electronic",
  "Freestyle", "Soul", "Afrobeat", "Alternative", "Gospel",
];

async function getLiveMembers() {
  try {
    const users = await prisma.user.findMany({
      take: 20,
      orderBy: { userCreatedAt: "desc" },
      include: {
        userProfile:   { select: { avatarUrl: true } },
        artistProfile: { select: { genres: true } },
      },
    });
    return users.map((u, i) => ({
      id: u.id,
      name: u.displayName ?? u.name ?? u.email?.split("@")[0] ?? "Member",
      avatarUrl: u.userProfile?.avatarUrl ?? null,
      genre: u.artistProfile?.genres?.[0] ?? GENRE_POOL[i % GENRE_POOL.length] ?? "Hip-Hop",
      tier: u.tier ?? "free",
      score: 1000 + (20 - i) * 37,
      route: `/profile/${u.id}`,
      joinedAt: u.userCreatedAt ?? new Date(),
    }));
  } catch {
    return [];
  }
}

export default async function LeaderboardPage() {
  const [entries, liveMembers] = await Promise.all([
    Promise.resolve(getCrownRankRuntime(10)),
    getLiveMembers(),
  ]);

  let activeLeague = getActiveLeague();
  if (!activeLeague) {
    activeLeague = createLeague(2026, "Q2", 5000, "2026-04-01", "2026-06-30");
  }
  const leagueBoard = getLeaderboard(activeLeague.leagueId, 3);
  const crownHistory = getCrownHistory().slice(0, 2);

  return (
    <main data-testid="leaderboard-page" style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <Link href="/home/2" style={{ color: "#00FFFF", textDecoration: "none", fontSize: 12 }}>← Back to Charts</Link>
          <Link href="/home/1" style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", color: "#AA2DFF", border: "1px solid rgba(170,45,255,0.3)", borderRadius: 8, padding: "5px 12px", textDecoration: "none" }}>
            🌀 SEE ORBIT
          </Link>
        </div>

        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#FFD700", fontWeight: 800, marginBottom: 8 }}>TMI RANKINGS</div>
          <h1 style={{ margin: 0, fontSize: "clamp(1.8rem,5vw,2.8rem)", fontWeight: 900 }}>Leaderboard</h1>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 6 }}>
            {liveMembers.length > 0 ? (
              <span><span style={{ color: "#00FF88", fontWeight: 800 }}>{liveMembers.length}</span> members on orbit right now</span>
            ) : (
              <span>Crown holders, challengers, and rising acts</span>
            )}
          </div>
        </div>

        {/* ── Live Orbit Members (real signed-up users) ── */}
        {liveMembers.length > 0 && (
          <section style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#00FF88", boxShadow: "0 0 8px #00FF88", display: "inline-block" }} />
              <div style={{ fontSize: 9, letterSpacing: "0.28em", color: "#00FF88", fontWeight: 800 }}>LIVE ORBIT MEMBERS</div>
              <div style={{ flex: 1, height: 1, background: "rgba(0,255,136,0.15)" }} />
              <Link href="/signup" style={{ fontSize: 8, fontWeight: 800, color: "#00FF88", border: "1px solid rgba(0,255,136,0.3)", borderRadius: 10, padding: "2px 10px", textDecoration: "none", whiteSpace: "nowrap" }}>
                + JOIN →
              </Link>
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              {liveMembers.map((member, i) => (
                <div
                  key={member.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    border: "1px solid rgba(0,255,136,0.12)",
                    borderRadius: 12,
                    padding: "12px 14px",
                    background: i === 0 ? "rgba(0,255,136,0.04)" : "rgba(255,255,255,0.01)",
                    transition: "border-color 0.2s",
                  }}
                >
                  {/* Rank */}
                  <span style={{ fontSize: 12, fontWeight: 900, color: i < 3 ? "#00FF88" : "rgba(255,255,255,0.25)", minWidth: 28, textAlign: "center" }}>
                    #{i + 1}
                  </span>

                  {/* Avatar */}
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%", overflow: "hidden", flexShrink: 0,
                    border: `2px solid ${i === 0 ? "#00FF88" : "rgba(0,255,255,0.25)"}`,
                    background: "rgba(255,255,255,0.05)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {member.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={member.avatarUrl} alt={member.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <span style={{ fontSize: 16 }}>🎤</span>
                    )}
                  </div>

                  {/* Name + genre */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link href={member.route} style={{ fontSize: 13, fontWeight: 800, color: "#fff", textDecoration: "none", display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {member.name}
                    </Link>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                      <span style={{ fontSize: 9, color: "#FF2DAA", fontWeight: 700 }}>{member.genre}</span>
                      {member.tier && member.tier !== "free" && (
                        <span style={{ fontSize: 8, color: "#FFD700", background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.25)", borderRadius: 4, padding: "1px 5px", fontWeight: 800 }}>
                          {member.tier.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Score + actions */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: "#00FFFF", fontVariantNumeric: "tabular-nums" }}>
                        {member.score.toLocaleString()} pts
                      </div>
                      {!member.avatarUrl && (
                        <Link href="/settings/avatar" style={{ fontSize: 8, color: "rgba(170,45,255,0.7)", textDecoration: "none", whiteSpace: "nowrap" }}>
                          📷 add photo
                        </Link>
                      )}
                    </div>
                    <Link href={`/vote/${member.id}`} style={{ fontSize: 9, fontWeight: 800, color: "#AA2DFF", border: "1px solid rgba(170,45,255,0.3)", borderRadius: 6, padding: "5px 10px", textDecoration: "none", whiteSpace: "nowrap" }}>
                      VOTE
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Upload CTA */}
            {liveMembers.some(m => !m.avatarUrl) && (
              <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(170,45,255,0.05)", border: "1px solid rgba(170,45,255,0.2)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>Missing your photo? Upload to appear with your face on the orbit.</span>
                <Link href="/settings/avatar" style={{ fontSize: 9, fontWeight: 800, color: "#AA2DFF", border: "1px solid rgba(170,45,255,0.35)", borderRadius: 8, padding: "5px 12px", textDecoration: "none", whiteSpace: "nowrap" }}>
                  📷 UPLOAD →
                </Link>
              </div>
            )}
          </section>
        )}

        {/* ── Crown Rankings (seeded / competition data) ── */}
        <div style={{ fontSize: 9, letterSpacing: "0.28em", color: "#FFD700", fontWeight: 800, marginBottom: 12 }}>
          CROWN RANKINGS
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
          <Link href="/home/1" style={{ color: "#FF2DAA", textDecoration: "none", fontSize: 12, border: "1px solid rgba(255,45,170,0.2)", borderRadius: 8, padding: "9px 14px" }}>🌀 Orbit →</Link>
        </div>
      </div>
    </main>
  );
}
