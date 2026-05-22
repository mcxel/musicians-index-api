"use client";

import {
  TMIXPRankingEngine,
  ACHIEVEMENTS,
  type UserStats,
  type LeaderboardEntry,
  type SubscriptionTier,
} from "@/lib/xp/TMIXPRankingEngine";

const TIER_COLORS: Record<SubscriptionTier, { bg: string; text: string; glow: string }> = {
  free:     { bg: "#1e293b", text: "#94a3b8", glow: "#64748b" },
  silver:   { bg: "#1e293b", text: "#cbd5e1", glow: "#94a3b8" },
  gold:     { bg: "#292013", text: "#fbbf24", glow: "#f59e0b" },
  platinum: { bg: "#1a1a2e", text: "#e2e8f0", glow: "#94a3b8" },
  diamond:  { bg: "#0c1a2e", text: "#38bdf8", glow: "#06b6d4" },
};

const RARITY_COLORS = {
  common:    { border: "#64748b", bg: "#1e293b", text: "#94a3b8", label: "Common" },
  rare:      { border: "#3b82f6", bg: "#1e3a5f", text: "#93c5fd", label: "Rare" },
  epic:      { border: "#8b5cf6", bg: "#2d1b69", text: "#c4b5fd", label: "Epic" },
  legendary: { border: "#f59e0b", bg: "#292013", text: "#fbbf24", label: "Legendary" },
};

export function TMIXPDisplay({
  stats,
  showAchievements = true,
  compact = false,
}: {
  stats: UserStats;
  showAchievements?: boolean;
  compact?: boolean;
}) {
  const engine = new TMIXPRankingEngine(stats);
  const level = engine.getLevel();
  const tier = engine.getTier();
  const progress = engine.getProgressToNextLevel();
  const tc = TIER_COLORS[tier];
  const earnedAchievements = ACHIEVEMENTS.filter((a) => stats.achievementIds.includes(a.id));

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-[9px] font-black uppercase tracking-widest" style={{ color: tc.text }}>Lv.{level}</div>
        <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden max-w-[80px]">
          <div className="h-full rounded-full transition-all" style={{ width: `${progress * 100}%`, background: tc.glow }} />
        </div>
        <div className="text-[8px] font-black capitalize" style={{ color: tc.text }}>{tier}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-xl p-4 space-y-3" style={{ borderColor: tc.glow + "40", background: tc.bg }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[8px] uppercase tracking-widest text-white/30">Level</p>
            <p className="text-3xl font-black" style={{ color: tc.text, textShadow: `0 0 20px ${tc.glow}` }}>
              {level}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[8px] uppercase tracking-widest text-white/30">Tier</p>
            <p className="text-lg font-black capitalize" style={{ color: tc.text }}>{tier}</p>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[8px] text-white/40 mb-1">
            <span>{stats.totalXP.toLocaleString()} XP</span>
            <span>Lv.{level + 1}: {((level + 1) ** 2 * 100).toLocaleString()}</span>
          </div>
          <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${progress * 100}%`,
                background: `linear-gradient(90deg, ${tc.glow}, ${tc.text})`,
                boxShadow: `0 0 8px ${tc.glow}`,
              }}
            />
          </div>
          {progress >= 0.85 && (
            <p className="text-[8px] text-center mt-1" style={{ color: tc.text }}>
              {progress >= 0.95 ? "ONE ACTION AWAY!" : "Almost there!"}
            </p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { label: "Battles Won", value: stats.battlesWon },
            { label: "Credits",     value: stats.totalCredits.toLocaleString() },
            { label: "Followers",   value: stats.followersCount.toLocaleString() },
          ].map((s) => (
            <div key={s.label} className="bg-white/5 rounded-lg p-2">
              <p className="text-sm font-black text-white">{s.value}</p>
              <p className="text-[7px] text-white/30 uppercase">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {showAchievements && earnedAchievements.length > 0 && (
        <div>
          <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-2">
            Achievements ({earnedAchievements.length}/{ACHIEVEMENTS.length})
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {earnedAchievements.map((ach) => {
              const rc = RARITY_COLORS[ach.rarity];
              return (
                <div
                  key={ach.id}
                  className="border rounded-lg p-2 flex items-center gap-2"
                  style={{ borderColor: rc.border + "60", background: rc.bg }}
                  title={ach.description}
                >
                  <span className="text-base">{ach.icon}</span>
                  <div className="min-w-0">
                    <p className="text-[9px] font-black truncate" style={{ color: rc.text }}>{ach.title}</p>
                    <p className="text-[7px] uppercase" style={{ color: rc.border }}>+{ach.xpReward} XP</p>
                  </div>
                  {ach.isLimited && <span className="text-[6px] text-red-400 font-black ml-auto flex-shrink-0">LTD</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function TMILeaderboard({
  entries,
  currentUserId,
}: {
  entries: LeaderboardEntry[];
  currentUserId?: string;
}) {
  const TIER_COLORS_SIMPLE: Record<SubscriptionTier, string> = {
    free: "#64748b", silver: "#cbd5e1", gold: "#fbbf24", platinum: "#e2e8f0", diamond: "#38bdf8",
  };

  return (
    <div className="space-y-1">
      {entries.map((entry) => {
        const isMe = entry.userId === currentUserId;
        return (
          <div
            key={entry.userId}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors"
            style={{
              background: isMe ? TIER_COLORS_SIMPLE[entry.tier] + "18" : "rgba(255,255,255,0.02)",
              border: isMe ? `1px solid ${TIER_COLORS_SIMPLE[entry.tier]}40` : "1px solid transparent",
            }}
          >
            <div className="w-7 text-right flex-shrink-0">
              {entry.rank <= 3 ? (
                <span className="text-base">{["🥇","🥈","🥉"][entry.rank - 1]}</span>
              ) : (
                <span className="text-[10px] text-white/40 font-mono">#{entry.rank}</span>
              )}
            </div>

            <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px] flex-shrink-0"
              style={{ background: entry.avatarColor + "30", color: entry.avatarColor }}
            >
              {entry.displayName.charAt(0)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-[10px] font-black text-white truncate">{entry.displayName}</p>
                {entry.hasCrown && <span className="text-[9px]">👑</span>}
                {entry.hasBelt && <span className="text-[9px]">🏆</span>}
                {isMe && <span className="text-[7px] bg-cyan-600 text-black px-1 rounded font-black">YOU</span>}
              </div>
              <p className="text-[8px] text-white/40">Lv.{entry.level} · {entry.battlesWon}W</p>
            </div>

            <div className="text-right flex-shrink-0">
              <p className="text-[10px] font-black" style={{ color: TIER_COLORS_SIMPLE[entry.tier] }}>
                {entry.totalXP.toLocaleString()}
              </p>
              {entry.changeFromYesterday !== 0 && (
                <p className={`text-[7px] font-black ${entry.changeFromYesterday > 0 ? "text-green-400" : "text-red-400"}`}>
                  {entry.changeFromYesterday > 0 ? "↑" : "↓"}{Math.abs(entry.changeFromYesterday)}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
