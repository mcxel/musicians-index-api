// Fan Rewards Rail — badges, streak status, and redeemable rewards.
// Server component.

import Link from "next/link";

interface FanBadge {
  id: string;
  label: string;
  icon: string;
  earnedAt: string;
}

interface FanReward {
  id: string;
  label: string;
  description: string;
  cost: number;
  redeemRoute: string;
  available: boolean;
}

interface FanRewardsRailProps {
  badges?: FanBadge[];
  rewards?: FanReward[];
  currentStreak?: number;
  totalVotesCast?: number;
  fanSlug: string;
}

const ACCENT = "#FFD700";

export default function FanRewardsRail({
  badges = [],
  rewards = [],
  currentStreak = 0,
  totalVotesCast = 0,
  fanSlug,
}: FanRewardsRailProps) {
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
          Rewards
        </span>
        <Link
          href={`/fans/${fanSlug}/rewards`}
          style={{
            fontSize: 7,
            fontWeight: 700,
            color: "rgba(255,255,255,0.3)",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            textDecoration: "none",
          }}
        >
          All Rewards →
        </Link>
      </div>

      {/* Streak + stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <div
          style={{
            padding: "12px 14px",
            borderRadius: 10,
            border: `1px solid ${ACCENT}28`,
            background: `${ACCENT}06`,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ fontSize: 22 }}>🔥</span>
          <div>
            <p style={{ fontSize: 18, fontWeight: 900, color: "#fff", margin: 0 }}>{currentStreak}</p>
            <p style={{ fontSize: 7, color: "rgba(255,255,255,0.35)", letterSpacing: "0.14em", textTransform: "uppercase", margin: 0 }}>Day Streak</p>
          </div>
        </div>
        <div
          style={{
            padding: "12px 14px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.07)",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          <p style={{ fontSize: 18, fontWeight: 900, color: "#fff", margin: 0 }}>{totalVotesCast.toLocaleString()}</p>
          <p style={{ fontSize: 7, color: "rgba(255,255,255,0.35)", letterSpacing: "0.14em", textTransform: "uppercase", margin: 0 }}>Votes Cast</p>
        </div>
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 7, fontWeight: 700, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", margin: "0 0 10px" }}>
            Badges
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {badges.map((badge) => (
              <div
                key={badge.id}
                title={`${badge.label} · ${badge.earnedAt}`}
                style={{
                  padding: "6px 10px",
                  borderRadius: 8,
                  border: `1px solid ${ACCENT}28`,
                  background: `${ACCENT}08`,
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <span style={{ fontSize: 12 }}>{badge.icon}</span>
                <span style={{ fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.6)", letterSpacing: "0.08em" }}>{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Redeemable rewards */}
      {rewards.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rewards.slice(0, 3).map((reward) => (
            <div
              key={reward.id}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: `1px solid rgba(255,255,255,0.07)`,
                background: "rgba(255,255,255,0.02)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                opacity: reward.available ? 1 : 0.45,
              }}
            >
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, color: "#fff", margin: 0 }}>{reward.label}</p>
                <p style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", margin: 0 }}>{reward.description}</p>
              </div>
              {reward.available ? (
                <Link
                  href={reward.redeemRoute}
                  style={{
                    fontSize: 7,
                    fontWeight: 900,
                    color: ACCENT,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    textDecoration: "none",
                    padding: "4px 10px",
                    borderRadius: 6,
                    border: `1px solid ${ACCENT}40`,
                    background: `${ACCENT}0c`,
                    whiteSpace: "nowrap",
                  }}
                >
                  Redeem · {reward.cost} pts
                </Link>
              ) : (
                <span style={{ fontSize: 7, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em" }}>
                  {reward.cost} pts
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
