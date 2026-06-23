import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getLevelForXP } from "@/lib/xp/xpEngine";

export const dynamic = "force-dynamic";
export const metadata = { title: "Crown Rankings — The Musician's Index" };

const HOW_XP_WORKS = [
  { action: "Perform Live",     xp: "+50–500 XP",  desc: "Per live room session" },
  { action: "Win a Battle",     xp: "+200–1000 XP", desc: "Based on stakes" },
  { action: "Fan Votes",        xp: "+15 XP each", desc: "Per vote you cast" },
  { action: "Magazine Feature", xp: "+1500 XP",    desc: "When featured" },
  { action: "Stream a Track",   xp: "+15 XP",      desc: "Per stream listen" },
  { action: "Cypher Drop",      xp: "+100–500 XP", desc: "Scored by judges" },
];

type RankedRow = {
  rank: number;
  userId: string;
  name: string;
  slug: string | null;
  xp: number;
  level: number;
  levelTitle: string;
  tier: string;
  avatarUrl: string | null;
};

async function getRankedPerformers(limit = 25): Promise<RankedRow[]> {
  try {
    const rows = await prisma.userStats.findMany({
      where: { xp: { gt: 0 } },
      orderBy: { xp: "desc" },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            displayName: true,
            image: true,
            tier: true,
            artistProfile: { select: { stageName: true, slug: true } },
          },
        },
      },
    });

    return rows.map((r, i) => {
      const ap = r.user.artistProfile;
      const lvl = getLevelForXP(r.xp);
      return {
        rank:       i + 1,
        userId:     r.userId,
        name:       ap?.stageName ?? r.user.displayName ?? r.user.name ?? "Anonymous",
        slug:       ap?.slug ?? null,
        xp:         r.xp,
        level:      lvl.level,
        levelTitle: lvl.title,
        tier:       r.user.tier ?? "FREE",
        avatarUrl:  r.user.image ?? null,
      };
    });
  } catch {
    return [];
  }
}

function rankColor(rank: number): string {
  if (rank === 1) return "#FFD700";
  if (rank === 2) return "#C0C0C0";
  if (rank === 3) return "#CD7F32";
  return "rgba(255,255,255,0.35)";
}

function tierBadgeColor(tier: string): string {
  switch (tier.toUpperCase()) {
    case "DIAMOND":  return "#00FFFF";
    case "PLATINUM": return "#E5E4E2";
    case "GOLD":     return "#FFD700";
    case "SILVER":   return "#C0C0C0";
    case "RUBY":     return "#FF2DAA";
    case "PRO":      return "#AA2DFF";
    default:         return "rgba(255,255,255,0.3)";
  }
}

export default async function RankingsPage() {
  const performers = await getRankedPerformers(25);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>
      {/* Nav */}
      <nav style={{ background: "rgba(0,0,0,0.7)", borderBottom: "1px solid rgba(255,215,0,0.2)", padding: "12px 24px", display: "flex", gap: 20, alignItems: "center" }}>
        <Link href="/home/1" style={{ fontSize: 11, fontWeight: 900, color: "#FFD700", textDecoration: "none", letterSpacing: "0.12em" }}>TMI</Link>
        <Link href="/rankings" style={{ fontSize: 11, color: "#FFD700", textDecoration: "none", fontWeight: 700 }}>Rankings</Link>
        <Link href="/rankings/crown" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Crown</Link>
        <Link href="/vote" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Vote</Link>
        <Link href="/charts" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Charts</Link>
        <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
          <Link href="/vote" style={{ padding: "7px 16px", borderRadius: 6, background: "rgba(255,215,0,0.12)", border: "1px solid rgba(255,215,0,0.35)", color: "#FFD700", fontSize: 10, fontWeight: 800, textDecoration: "none", letterSpacing: "0.08em" }}>
            VOTE NOW
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#FFD700", fontWeight: 800, marginBottom: 8 }}>XP LEADERBOARD</div>
          <h1 style={{ margin: "0 0 8px", fontSize: "clamp(28px,5vw,48px)", fontWeight: 900, letterSpacing: "-0.02em" }}>
            Platform Rankings
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.45)" }}>
            XP-driven leaderboard — earn XP through battles, streams, votes, and live performance.
          </p>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {[
            { label: "XP Leaders",  href: "/rankings",          active: true  },
            { label: "Crown",       href: "/rankings/crown",    active: false },
            { label: "Battles",     href: "/battles/rankings",  active: false },
            { label: "Cyphers",     href: "/cypher/rankings",   active: false },
            { label: "Charts",      href: "/charts",            active: false },
          ].map((tab) => (
            <Link key={tab.label} href={tab.href} style={{
              padding: "8px 18px", borderRadius: 6, fontSize: 11, fontWeight: 800, textDecoration: "none", letterSpacing: "0.06em",
              background: tab.active ? "rgba(255,215,0,0.15)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${tab.active ? "rgba(255,215,0,0.4)" : "rgba(255,255,255,0.08)"}`,
              color: tab.active ? "#FFD700" : "rgba(255,255,255,0.45)",
            }}>
              {tab.label}
            </Link>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24, alignItems: "start" }}>
          {/* Main leaderboard */}
          <div>
            {/* Column headers */}
            <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 90px 90px 70px", gap: 8, padding: "8px 16px", marginBottom: 4 }}>
              {["#", "ARTIST", "XP", "LEVEL", "TIER"].map((h) => (
                <div key={h} style={{ fontSize: 8, letterSpacing: "0.18em", color: "rgba(255,255,255,0.25)", fontWeight: 800 }}>{h}</div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {performers.length === 0 ? (
                <div style={{ padding: "48px 24px", textAlign: "center", background: "rgba(255,215,0,0.03)", border: "1px solid rgba(255,215,0,0.12)", borderRadius: 12 }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>👑</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#FFD700", marginBottom: 8 }}>No rankings yet</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>
                    The leaderboard fills as performers earn XP through battles, streams, and live events.<br />
                    Sign up and perform to claim your rank.
                  </div>
                  <div style={{ marginTop: 20 }}>
                    <Link href="/signup" style={{ padding: "10px 24px", borderRadius: 8, background: "rgba(255,215,0,0.12)", border: "1px solid rgba(255,215,0,0.35)", color: "#FFD700", fontSize: 11, fontWeight: 800, textDecoration: "none", letterSpacing: "0.08em" }}>
                      JOIN TMI →
                    </Link>
                  </div>
                </div>
              ) : (
                performers.map((p) => (
                  <div
                    key={p.userId}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "40px 1fr 90px 90px 70px",
                      gap: 8,
                      alignItems: "center",
                      padding: "14px 16px",
                      background: p.rank === 1 ? "rgba(255,215,0,0.06)" : "rgba(255,255,255,0.025)",
                      border: `1px solid ${p.rank === 1 ? "rgba(255,215,0,0.3)" : "rgba(255,255,255,0.06)"}`,
                      borderRadius: 12,
                    }}
                  >
                    {/* Rank */}
                    <span style={{ fontSize: p.rank <= 3 ? 18 : 13, fontWeight: 900, color: rankColor(p.rank), textAlign: "center" }}>
                      {p.rank === 1 ? "👑" : `#${p.rank}`}
                    </span>

                    {/* Name */}
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>
                        {p.slug ? (
                          <Link href={`/performers/${p.slug}`} style={{ color: "#fff", textDecoration: "none" }}>
                            {p.name}
                          </Link>
                        ) : p.name}
                      </div>
                    </div>

                    {/* XP */}
                    <div style={{ fontSize: 13, fontWeight: 800, color: rankColor(p.rank) }}>
                      {p.xp.toLocaleString()}
                    </div>

                    {/* Level */}
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>
                      Lv.{p.level} {p.levelTitle}
                    </div>

                    {/* Tier badge */}
                    <span style={{
                      fontSize: 8, fontWeight: 900,
                      color: tierBadgeColor(p.tier),
                      border: `1px solid ${tierBadgeColor(p.tier)}44`,
                      padding: "3px 8px", borderRadius: 4, letterSpacing: "0.1em",
                      textAlign: "center",
                    }}>
                      {p.tier.toUpperCase()}
                    </span>
                  </div>
                ))
              )}
            </div>

            {performers.length > 0 && (
              <div style={{ marginTop: 20, textAlign: "center" }}>
                <Link href="/rankings/crown" style={{ padding: "11px 28px", borderRadius: 8, background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.3)", color: "#FFD700", fontSize: 11, fontWeight: 800, textDecoration: "none", letterSpacing: "0.1em" }}>
                  VIEW CROWN RANKINGS →
                </Link>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* How XP works */}
            <div style={{ background: "rgba(255,215,0,0.05)", border: "1px solid rgba(255,215,0,0.2)", borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#FFD700", fontWeight: 800, marginBottom: 14 }}>HOW XP IS EARNED</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {HOW_XP_WORKS.map((item) => (
                  <div key={item.action} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700 }}>{item.action}</div>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>{item.desc}</div>
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 800, color: "#FFD700", flexShrink: 0 }}>{item.xp}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Vote CTA */}
            <div style={{ background: "rgba(255,45,170,0.08)", border: "1px solid rgba(255,45,170,0.25)", borderRadius: 12, padding: 20, textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>🗳️</div>
              <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>Vote for your favorite</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 16, lineHeight: 1.4 }}>
                1 free vote per day. Gold+ members get 5x votes.
              </div>
              <Link href="/vote" style={{ display: "block", padding: "10px 0", borderRadius: 8, background: "rgba(255,45,170,0.15)", border: "1px solid rgba(255,45,170,0.35)", color: "#FF2DAA", fontSize: 11, fontWeight: 800, textDecoration: "none", letterSpacing: "0.08em" }}>
                VOTE NOW →
              </Link>
            </div>

            {/* Earn XP CTA */}
            <div style={{ background: "rgba(0,255,255,0.05)", border: "1px solid rgba(0,255,255,0.2)", borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#00FFFF", fontWeight: 800, marginBottom: 8 }}>CLIMB THE RANKS</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, marginBottom: 14 }}>
                Perform live, win battles, vote, stream, and share to earn XP and rise up the leaderboard.
              </div>
              <Link href="/battles" style={{ display: "block", padding: "9px 0", borderRadius: 8, background: "rgba(0,255,255,0.1)", border: "1px solid rgba(0,255,255,0.3)", color: "#00FFFF", fontSize: 10, fontWeight: 800, textDecoration: "none", textAlign: "center", letterSpacing: "0.08em" }}>
                ENTER A BATTLE →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
