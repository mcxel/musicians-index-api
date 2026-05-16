"use client";

/**
 * ProfileStreakRail
 * Displays a user's full streak dashboard.
 *
 * Modes:
 *   "compact" — horizontal strip (for artist pages, battle pages, cypher)
 *   "full"    — vertical card (for fan hub, profile pages)
 *
 * Auto-seeds demo data if the userId has no existing snapshot.
 */

import { useEffect, useState } from "react";
import { profileStreakEngine } from "@/lib/streaks";
import type { StreakSnapshot, StreakBadge } from "@/lib/streaks";

interface ProfileStreakRailProps {
  userId: string;
  displayName: string;
  mode?: "compact" | "full";
  /** Override accent color */
  accentColor?: string;
}

const TIER_COLORS: Record<string, string> = {
  bronze:    "#CD7F32",
  silver:    "#C0C0C0",
  gold:      "#FFD700",
  platinum:  "#AA2DFF",
  legendary: "#FF2DAA",
};

interface StatCellProps {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  sub?: string;
}

function StatCell({ label, value, icon, color, sub }: StatCellProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        minWidth: 64,
        padding: "10px 12px",
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${color}33`,
        borderRadius: 8,
        textAlign: "center",
      }}
    >
      <span style={{ fontSize: 20 }}>{icon}</span>
      <span style={{ fontSize: 18, fontWeight: 900, color, fontFamily: "var(--font-tmi-orbitron, monospace)", lineHeight: 1 }}>
        {value}
      </span>
      <span style={{ fontSize: 9, letterSpacing: "0.12em", color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>
        {label}
      </span>
      {sub && (
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{sub}</span>
      )}
    </div>
  );
}

function BadgeChip({ badge }: { badge: StreakBadge }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "4px 10px",
        background: `${badge.color}18`,
        border: `1px solid ${badge.color}55`,
        borderRadius: 20,
        fontSize: 10,
        fontWeight: 700,
        color: badge.color,
        letterSpacing: "0.1em",
        whiteSpace: "nowrap",
      }}
    >
      <span>{badge.icon}</span>
      <span>{badge.label}</span>
    </div>
  );
}

function FireBar({ streak, color }: { streak: number; color: string }) {
  const segments = Math.min(streak, 10);
  return (
    <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
      {Array.from({ length: 10 }, (_, i) => (
        <div
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: 2,
            background: i < segments ? color : "rgba(255,255,255,0.08)",
            transition: "background 0.3s ease",
          }}
        />
      ))}
      {streak > 10 && (
        <span style={{ fontSize: 9, color, marginLeft: 4, fontWeight: 700 }}>+{streak - 10}</span>
      )}
    </div>
  );
}

export default function ProfileStreakRail({
  userId,
  displayName,
  mode = "compact",
  accentColor = "#FFD700",
}: ProfileStreakRailProps) {
  const [snapshot, setSnapshot] = useState<StreakSnapshot | null>(null);

  useEffect(() => {
    let s = profileStreakEngine.getSnapshot(userId);
    if (!s) {
      s = profileStreakEngine.seedDemo(userId, displayName);
    }
    setSnapshot(s);
  }, [userId, displayName]);

  if (!snapshot) return null;

  const winRate = snapshot.totalBattles > 0
    ? Math.round((snapshot.totalWins / snapshot.totalBattles) * 100)
    : 0;

  if (mode === "compact") {
    return (
      <div
        style={{
          padding: "14px 16px",
          background: "rgba(255,255,255,0.02)",
          border: `1px solid rgba(255,255,255,0.07)`,
          borderRadius: 10,
          fontFamily: "var(--font-tmi-orbitron, monospace)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.3em", color: accentColor, fontWeight: 800 }}>
            STREAKS
          </div>
          {snapshot.crownsHeld > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "#FFD700" }}>
              <span>👑</span>
              <span style={{ fontWeight: 700 }}>{snapshot.crownsHeld} Crown{snapshot.crownsHeld > 1 ? "s" : ""}</span>
            </div>
          )}
        </div>

        {/* Stat row */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <StatCell label="Win Streak"  value={snapshot.battleWinStreak}  icon="🔥" color="#FF6B35" sub={`${snapshot.totalWins}W-${snapshot.totalLosses}L`} />
          <StatCell label="Predictions" value={`${snapshot.predictionAccuracy}%`} icon="🔮" color="#AA2DFF" sub={`${snapshot.predictionStreak} streak`} />
          <StatCell label="Support"     value={snapshot.supportStreak}    icon="💚" color="#00FF88" sub="week streak" />
          <StatCell label="Attendance"  value={snapshot.attendanceStreak} icon="📅" color="#00FFFF" sub="week streak" />
          {snapshot.titleDefenses >= 1 && (
            <StatCell label="Defenses" value={snapshot.titleDefenses} icon="🛡️" color="#AA2DFF" />
          )}
        </div>

        {/* Win streak fire bar */}
        {snapshot.battleWinStreak > 0 && (
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em" }}>WIN STREAK</span>
            <FireBar streak={snapshot.battleWinStreak} color="#FF6B35" />
          </div>
        )}

        {/* Badges */}
        {snapshot.badges.length > 0 && (
          <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
            {snapshot.badges.map((b, i) => (
              <BadgeChip key={i} badge={b} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Full mode
  return (
    <div
      style={{
        background: "linear-gradient(160deg, #0c0c22 0%, #050510 100%)",
        border: `1px solid ${accentColor}33`,
        borderRadius: 14,
        padding: "24px 20px",
        fontFamily: "var(--font-tmi-orbitron, monospace)",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.35em", color: accentColor, fontWeight: 800, marginBottom: 4 }}>
            PROFILE STREAKS
          </div>
          <div style={{ fontSize: 14, fontWeight: 900, color: "#fff", letterSpacing: "0.05em" }}>
            {displayName.toUpperCase()}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: "#555", marginBottom: 2 }}>WIN RATE</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: winRate >= 60 ? "#00FF88" : winRate >= 40 ? "#FFD700" : "#FF6B35" }}>
            {winRate}%
          </div>
        </div>
      </div>

      {/* Crown section */}
      {snapshot.crownsHeld > 0 && (
        <div
          style={{
            marginBottom: 18,
            padding: "12px 16px",
            background: "rgba(255,215,0,0.05)",
            border: "1px solid rgba(255,215,0,0.2)",
            borderRadius: 10,
            display: "flex",
            gap: 16,
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 32 }}>👑</span>
          <div>
            <div style={{ fontSize: 11, color: "#FFD700", fontWeight: 700, letterSpacing: "0.1em" }}>
              {snapshot.crownsHeld} CROWN{snapshot.crownsHeld > 1 ? "S" : ""} HELD
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
              {snapshot.totalCrownsWon} won all-time · {snapshot.titleDefenses} title defense{snapshot.titleDefenses !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
      )}

      {/* Streak grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          marginBottom: 18,
        }}
      >
        {/* Battle streak */}
        <div style={{ padding: "14px", background: "rgba(255,107,53,0.06)", border: "1px solid rgba(255,107,53,0.2)", borderRadius: 10 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#FF6B35", marginBottom: 6 }}>BATTLE</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#FF6B35", lineHeight: 1 }}>{snapshot.battleWinStreak}</div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 3 }}>win streak</div>
          <FireBar streak={snapshot.battleWinStreak} color="#FF6B35" />
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 6 }}>
            {snapshot.totalWins}W / {snapshot.totalLosses}L · {snapshot.totalBattles} total
          </div>
        </div>

        {/* Prediction streak */}
        <div style={{ padding: "14px", background: "rgba(170,45,255,0.06)", border: "1px solid rgba(170,45,255,0.2)", borderRadius: 10 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#AA2DFF", marginBottom: 6 }}>PREDICTIONS</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#AA2DFF", lineHeight: 1 }}>{snapshot.predictionStreak}</div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 3 }}>correct streak</div>
          <FireBar streak={snapshot.predictionStreak} color="#AA2DFF" />
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 6 }}>
            {snapshot.predictionAccuracy}% accuracy · {snapshot.totalPredictions} made
          </div>
        </div>

        {/* Support streak */}
        <div style={{ padding: "14px", background: "rgba(0,255,136,0.05)", border: "1px solid rgba(0,255,136,0.18)", borderRadius: 10 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#00FF88", marginBottom: 6 }}>SUPPORT</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#00FF88", lineHeight: 1 }}>{snapshot.supportStreak}</div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 3 }}>week streak</div>
          <FireBar streak={snapshot.supportStreak} color="#00FF88" />
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 6 }}>
            {snapshot.totalSupportEvents} support events
          </div>
        </div>

        {/* Attendance streak */}
        <div style={{ padding: "14px", background: "rgba(0,255,255,0.04)", border: "1px solid rgba(0,255,255,0.16)", borderRadius: 10 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#00FFFF", marginBottom: 6 }}>ATTENDANCE</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#00FFFF", lineHeight: 1 }}>{snapshot.attendanceStreak}</div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 3 }}>week streak</div>
          <FireBar streak={snapshot.attendanceStreak} color="#00FFFF" />
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 6 }}>
            {snapshot.totalEventsAttended} events attended
          </div>
        </div>
      </div>

      {/* Badges */}
      {snapshot.badges.length > 0 && (
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.25em", color: "rgba(255,255,255,0.3)", marginBottom: 8 }}>BADGES EARNED</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {snapshot.badges.map((b, i) => (
              <BadgeChip key={i} badge={b} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
