// Performer Battle Rail — recent battles, win streak, rank movement.
// Server component.

import Link from "next/link";

interface BattleResult {
  id: string;
  opponentName: string;
  opponentSlug: string;
  outcome: "win" | "loss";
  votesPct: number;
  date: string;
  category: string;
}

interface PerformerBattleRailProps {
  battles?: BattleResult[];
  currentStreak?: number;
  longestStreak?: number;
  totalBattles?: number;
  performerSlug: string;
}

const ACCENT = "#FF2DAA";

export default function PerformerBattleRail({
  battles = [],
  currentStreak = 0,
  longestStreak = 0,
  totalBattles = 0,
  performerSlug,
}: PerformerBattleRailProps) {
  return (
    <section style={{ marginBottom: 28 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <span
          style={{
            fontSize: 7,
            fontWeight: 900,
            letterSpacing: "0.28em",
            color: ACCENT,
            textTransform: "uppercase",
          }}
        >
          Battle Record
        </span>
        <Link
          href={`/battles?performer=${performerSlug}`}
          style={{
            fontSize: 7,
            fontWeight: 700,
            color: "rgba(255,255,255,0.3)",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            textDecoration: "none",
          }}
        >
          Full History →
        </Link>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
        {[
          { label: "Current Streak", value: currentStreak },
          { label: "Best Streak", value: longestStreak },
          { label: "Total Battles", value: totalBattles },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              padding: "12px 14px",
              borderRadius: 10,
              border: `1px solid ${ACCENT}22`,
              background: `${ACCENT}06`,
            }}
          >
            <p style={{ fontSize: 20, fontWeight: 900, color: "#fff", margin: 0 }}>{stat.value}</p>
            <p style={{ fontSize: 7, color: "rgba(255,255,255,0.35)", letterSpacing: "0.14em", textTransform: "uppercase", margin: 0 }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Battle list */}
      {battles.length === 0 ? (
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", margin: 0 }}>No battles recorded yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {battles.slice(0, 6).map((battle) => (
            <div
              key={battle.id}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: `1px solid rgba(255,255,255,${battle.outcome === "win" ? "0.08" : "0.04"})`,
                background: battle.outcome === "win" ? "rgba(74,222,128,0.04)" : "rgba(248,113,113,0.03)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11 }}>{battle.outcome === "win" ? "🏆" : "💀"}</span>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, color: "#fff", margin: 0 }}>vs.{" "}
                    <Link href={`/profile/performer/${battle.opponentSlug}`} style={{ color: ACCENT, textDecoration: "none" }}>
                      {battle.opponentName}
                    </Link>
                  </p>
                  <p style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", margin: 0 }}>
                    {battle.category} · {battle.date}
                  </p>
                </div>
              </div>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 900,
                  color: battle.outcome === "win" ? "#4ade80" : "#f87171",
                }}
              >
                {battle.votesPct}%
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
