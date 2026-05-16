"use client";
import React from "react";
import type { UserSeasonPass } from "@/lib/gamification/SeasonPassEngine";
import type { SeasonPassReward } from "@/lib/gamification/SeasonPassEngine";

const TIER_COLORS = {
  FREE: "#64748b",
  FAN_PASS: "#34d399",
  PERFORMER_PASS: "#00ffff",
  VIP_PASS: "#ffd700",
  LEGEND_PASS: "#a78bfa",
};

const TIER_LABELS = {
  FREE: "Free",
  FAN_PASS: "Fan Pass",
  PERFORMER_PASS: "Performer Pass",
  VIP_PASS: "VIP Pass",
  LEGEND_PASS: "Legend Pass",
};

interface SeasonPassProgressProps {
  pass: UserSeasonPass | null;
  claimableRewards: SeasonPassReward[];
  onClaimReward?: (rewardId: string) => void;
}

export function SeasonPassProgress({ pass, claimableRewards, onClaimReward }: SeasonPassProgressProps) {
  if (!pass) {
    return (
      <div
        style={{
          background: "rgba(2,6,23,0.9)",
          border: "1px solid rgba(51,65,85,0.6)",
          borderRadius: 14,
          padding: "24px",
          color: "#64748b",
          textAlign: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        No active season pass. Upgrade to unlock exclusive rewards!
      </div>
    );
  }

  const tierColor = TIER_COLORS[pass.tier];
  const pct = Math.min(100, Math.round((pass.xpEarned / pass.xpGoal) * 100));
  const daysLeft = Math.max(0, Math.ceil((pass.expiresAtMs - Date.now()) / (24 * 60 * 60 * 1000)));

  return (
    <div
      style={{
        background: "rgba(2,6,23,0.95)",
        border: `1px solid ${tierColor}40`,
        borderRadius: 16,
        padding: "20px 22px",
        fontFamily: "system-ui, sans-serif",
        color: "#e2e8f0",
        boxShadow: `0 0 32px ${tierColor}15`,
        maxWidth: 420,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 2 }}>
            Season Pass
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: tierColor }}>
            {TIER_LABELS[pass.tier]}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: "#64748b" }}>{daysLeft} days left</div>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>Season {pass.seasonId}</div>
        </div>
      </div>

      {/* XP Bar */}
      <div style={{ marginBottom: 6 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>
          <span>{pass.xpEarned.toLocaleString()} XP</span>
          <span>{pass.xpGoal.toLocaleString()} XP Goal</span>
        </div>
        <div
          style={{
            height: 10,
            background: "rgba(51,65,85,0.5)",
            borderRadius: 5,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${pct}%`,
              height: "100%",
              background: `linear-gradient(90deg, ${tierColor}, ${tierColor}99)`,
              borderRadius: 5,
              transition: "width 0.6s ease",
              boxShadow: `0 0 8px ${tierColor}80`,
            }}
          />
        </div>
        <div style={{ fontSize: 12, color: tierColor, fontWeight: 700, marginTop: 4, textAlign: "right" }}>
          {pct}%
        </div>
      </div>

      {/* Claimable Rewards */}
      {claimableRewards.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>
            Ready to Claim ({claimableRewards.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {claimableRewards.map((reward) => (
              <div
                key={reward.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "rgba(15,23,42,0.8)",
                  border: `1px solid ${tierColor}30`,
                  borderRadius: 8,
                  padding: "8px 12px",
                  gap: 10,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{reward.title}</div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>{reward.description}</div>
                </div>
                {onClaimReward && (
                  <button
                    onClick={() => onClaimReward(reward.id)}
                    style={{
                      background: tierColor,
                      border: "none",
                      color: "#0f172a",
                      padding: "5px 12px",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontSize: 11,
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Claim
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
