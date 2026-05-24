import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Performance | TMI",
  description:
    "Track live performance scores, fan votes, artist evolution stats, and cypher rankings on The Musician's Index.",
};

const LEADERBOARD = [
  { rank: 1, name: "Kairo Blaze",           role: "RAPPER",   score: 94, trend: "RISING",  color: "#00FFFF", votes: 312 },
  { rank: 2, name: "Nova Reign",            role: "SINGER",   score: 91, trend: "RISING",  color: "#FF2DAA", votes: 287 },
  { rank: 3, name: "DJ Axiom",             role: "DJ",       score: 88, trend: "STABLE",  color: "#FFD700", votes: 255 },
  { rank: 4, name: "Lyric Storm",          role: "RAPPER",   score: 85, trend: "RISING",  color: "#00FF88", votes: 241 },
  { rank: 5, name: "Echo & The Machine",   role: "PRODUCER", score: 83, trend: "FALLING", color: "#AA2DFF", votes: 198 },
];

const ACTIVE_CONTEXTS = [
  { id: "cypher",   label: "Cypher Arena",       count: 14, icon: "🎤", color: "#FF2DAA", href: "/cyphers"  },
  { id: "battle",   label: "Battle Arena",        count: 6,  icon: "⚔️", color: "#FFD700", href: "/battles" },
  { id: "stage",    label: "Live Stages",          count: 9,  icon: "🎭", color: "#00FFFF", href: "/live/stages" },
  { id: "beatlab",  label: "Beat Lab Sessions",    count: 4,  icon: "🎹", color: "#AA2DFF", href: "/nft-lab/mint" },
];

const STAT_CARDS = [
  { label: "Active Performers",  value: "1,284",  color: "#00FFFF", icon: "🎤" },
  { label: "Votes Cast Today",   value: "38.6K",  color: "#FF2DAA", icon: "🗳️" },
  { label: "Live Contexts",      value: "33",     color: "#00FF88", icon: "🔴" },
  { label: "Avg Score",          value: "78 / 100", color: "#FFD700", icon: "📊" },
];

const TREND_COLOR: Record<string, string> = {
  RISING:  "#00FF88",
  STABLE:  "#FFD700",
  FALLING: "#FF2DAA",
};

export default function PerformancePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#050510",
        color: "#fff",
        paddingBottom: 80,
        fontFamily: "inherit",
      }}
    >
      {/* Hero */}
      <section
        style={{
          textAlign: "center",
          padding: "64px 24px 48px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background:
            "radial-gradient(ellipse at top, rgba(0,255,255,0.07) 0%, transparent 65%)",
        }}
      >
        <div
          style={{
            fontSize: 9,
            letterSpacing: "0.4em",
            color: "#00FFFF",
            fontWeight: 800,
            marginBottom: 12,
          }}
        >
          PERFORMANCE INTELLIGENCE
        </div>
        <h1
          style={{
            fontSize: "clamp(2rem,5vw,3.4rem)",
            fontWeight: 900,
            margin: "0 0 14px",
          }}
        >
          Performance Hub
        </h1>
        <p
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.45)",
            maxWidth: 520,
            margin: "0 auto 28px",
            lineHeight: 1.7,
          }}
        >
          Real-time scores, fan-voted rankings, and creator evolution stats
          from every cypher, battle, and live stage on TMI.
        </p>
        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/performance/vote"
            style={{
              padding: "13px 30px",
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: "0.14em",
              color: "#050510",
              background: "linear-gradient(135deg,#00FFFF,#AA2DFF)",
              borderRadius: 10,
              textDecoration: "none",
            }}
          >
            VOTE NOW →
          </Link>
          <Link
            href="/cyphers"
            style={{
              padding: "13px 22px",
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: "0.1em",
              color: "#00FFFF",
              border: "1px solid rgba(0,255,255,0.35)",
              borderRadius: 10,
              textDecoration: "none",
            }}
          >
            LIVE CYPHERS
          </Link>
        </div>
      </section>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "44px 24px 0" }}>
        {/* Platform stat cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 12,
            marginBottom: 44,
          }}
        >
          {STAT_CARDS.map((s) => (
            <div
              key={s.label}
              style={{
                background: `${s.color}08`,
                border: `1px solid ${s.color}22`,
                borderRadius: 14,
                padding: "20px 18px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
              <div
                style={{
                  fontSize: "clamp(20px,3vw,26px)",
                  fontWeight: 900,
                  color: s.color,
                  marginBottom: 4,
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "0.16em",
                  color: "rgba(255,255,255,0.4)",
                }}
              >
                {s.label.toUpperCase()}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 280px",
            gap: 28,
            alignItems: "start",
          }}
        >
          {/* Leaderboard */}
          <div>
            <div
              style={{
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: "0.24em",
                color: "#FFD700",
                marginBottom: 18,
              }}
            >
              TOP PERFORMERS THIS WEEK
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {LEADERBOARD.map((p) => (
                <Link
                  key={p.rank}
                  href="/performance/vote"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div
                    style={{
                      background: `${p.color}06`,
                      border: `1px solid ${p.color}22`,
                      borderRadius: 12,
                      padding: "16px 20px",
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                    }}
                  >
                    {/* Rank */}
                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: 900,
                        color: p.rank <= 3 ? p.color : "rgba(255,255,255,0.25)",
                        minWidth: 28,
                        textAlign: "center",
                      }}
                    >
                      {p.rank}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 800,
                          marginBottom: 3,
                        }}
                      >
                        {p.name}
                      </div>
                      <div
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          color: p.color,
                          letterSpacing: "0.1em",
                        }}
                      >
                        {p.role}
                      </div>
                    </div>

                    {/* Score bar */}
                    <div style={{ flex: 1, maxWidth: 160 }}>
                      <div
                        style={{
                          height: 5,
                          background: "rgba(255,255,255,0.07)",
                          borderRadius: 3,
                          overflow: "hidden",
                          marginBottom: 4,
                        }}
                      >
                        <div
                          style={{
                            width: `${p.score}%`,
                            height: "100%",
                            background: p.color,
                            borderRadius: 3,
                          }}
                        />
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          color: "rgba(255,255,255,0.35)",
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>{p.votes} votes</span>
                        <span style={{ fontWeight: 800, color: p.color }}>
                          {p.score}
                        </span>
                      </div>
                    </div>

                    {/* Trend */}
                    <div
                      style={{
                        fontSize: 9,
                        fontWeight: 800,
                        letterSpacing: "0.1em",
                        color: TREND_COLOR[p.trend] ?? "#fff",
                        minWidth: 48,
                        textAlign: "right",
                      }}
                    >
                      {p.trend === "RISING"
                        ? "↑ RISING"
                        : p.trend === "FALLING"
                        ? "↓ FALLING"
                        : "→ STABLE"}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div style={{ marginTop: 16, textAlign: "center" }}>
              <Link
                href="/performance/vote"
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#00FFFF",
                  textDecoration: "none",
                  borderBottom: "1px solid rgba(0,255,255,0.3)",
                  paddingBottom: 2,
                }}
              >
                Cast Your Votes →
              </Link>
            </div>
          </div>

          {/* Side panel: active contexts + quick links */}
          <div>
            <div
              style={{
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: "0.24em",
                color: "rgba(255,255,255,0.35)",
                marginBottom: 14,
              }}
            >
              ACTIVE NOW
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}
            >
              {ACTIVE_CONTEXTS.map((ctx) => (
                <Link
                  key={ctx.id}
                  href={ctx.href}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{
                      background: `${ctx.color}08`,
                      border: `1px solid ${ctx.color}22`,
                      borderRadius: 10,
                      padding: "14px 16px",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{ctx.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 800,
                          color: "#fff",
                          marginBottom: 2,
                        }}
                      >
                        {ctx.label}
                      </div>
                      <div
                        style={{ fontSize: 10, color: ctx.color, fontWeight: 700 }}
                      >
                        {ctx.count} active
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: "rgba(255,255,255,0.3)",
                      }}
                    >
                      →
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Quick links */}
            <div
              style={{
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: "0.2em",
                color: "rgba(255,255,255,0.3)",
                marginBottom: 12,
              }}
            >
              QUICK LINKS
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: 6 }}
            >
              {[
                { label: "Fan Vote Panel",        href: "/performance/vote",   color: "#00FFFF" },
                { label: "Analytics Dashboard",   href: "/analytics",          color: "#AA2DFF" },
                { label: "XP & Achievements",     href: "/xp",                 color: "#FFD700" },
                { label: "Dirty Dozens",          href: "/dirty-dozens",       color: "#FF2DAA" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    display: "block",
                    padding: "10px 14px",
                    background: "rgba(255,255,255,0.02)",
                    border: `1px solid rgba(255,255,255,0.07)`,
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    color: link.color,
                    textDecoration: "none",
                  }}
                >
                  {link.label} →
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* How scoring works */}
        <div style={{ marginTop: 48 }}>
          <div
            style={{
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: "0.24em",
              color: "rgba(255,255,255,0.3)",
              marginBottom: 18,
            }}
          >
            HOW SCORING WORKS
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 10,
            }}
          >
            {[
              { icon: "🗳️", title: "Fan Votes",     desc: "Every vote is weighted by the judge's reputation tier — Rookie → Trusted → Elite → Legend.", color: "#00FFFF" },
              { icon: "📊", title: "Score Dimensions", desc: "Like score, performance score, originality, crowd energy, and return intent — all combined.", color: "#FF2DAA" },
              { icon: "📈", title: "Evolution Trend",  desc: "Creator scores tracked across sessions. Rising trend unlocks spotlight placement.", color: "#00FF88" },
              { icon: "🏆", title: "Winner Logic",    desc: "Highest weighted score across all voters declared winner per context. Crown drops automatically.", color: "#FFD700" },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: `1px solid ${item.color}18`,
                  borderRadius: 12,
                  padding: "18px 16px",
                }}
              >
                <div style={{ fontSize: 26, marginBottom: 8 }}>{item.icon}</div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: item.color,
                    marginBottom: 6,
                  }}
                >
                  {item.title}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.45)",
                    lineHeight: 1.55,
                  }}
                >
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
