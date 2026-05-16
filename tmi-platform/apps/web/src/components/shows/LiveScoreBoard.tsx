"use client";
import React, { useEffect, useState } from "react";
import type { ContestantScore } from "@/lib/shows/PerformanceScoreEngine";

const ROLE_COLORS: Record<string, string> = {
  host: "#ffd700",
  performer: "#00ffff",
  judge: "#ff9f43",
  audience: "#ff2daa",
  sponsor: "#00ff88",
};

const RANK_MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

interface LiveScoreBoardProps {
  scores: ContestantScore[];
  showTitle?: string;
  phase?: string;
  highlightWinnerId?: string;
}

export function LiveScoreBoard({ scores, showTitle, phase, highlightWinnerId }: LiveScoreBoardProps) {
  const [animatedScores, setAnimatedScores] = useState<ContestantScore[]>(scores);

  useEffect(() => {
    setAnimatedScores([...scores]);
  }, [scores]);

  const sorted = [...animatedScores].sort((a, b) => b.compositeScore - a.compositeScore);

  return (
    <div
      style={{
        background: "rgba(2,6,23,0.95)",
        border: "1px solid rgba(255,215,0,0.3)",
        borderRadius: 16,
        padding: "20px 24px",
        minWidth: 320,
        maxWidth: 480,
        fontFamily: "system-ui, sans-serif",
        color: "#e2e8f0",
        boxShadow: "0 0 32px rgba(255,215,0,0.1)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: 2 }}>
            Live Scoreboard
          </div>
          {showTitle && (
            <div style={{ fontSize: 16, fontWeight: 700, color: ROLE_COLORS.host }}>
              {showTitle}
            </div>
          )}
        </div>
        {phase && (
          <div
            style={{
              background: "rgba(255,215,0,0.15)",
              border: "1px solid rgba(255,215,0,0.4)",
              color: ROLE_COLORS.host,
              padding: "4px 12px",
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            {phase}
          </div>
        )}
      </div>

      {sorted.length === 0 && (
        <div style={{ textAlign: "center", color: "#475569", padding: "32px 0", fontSize: 14 }}>
          No scores yet
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {sorted.map((score, idx) => {
          const rank = idx + 1;
          const isWinner = score.contestantId === highlightWinnerId;
          const maxScore = sorted[0]?.compositeScore || 1;
          const barPct = Math.round((score.compositeScore / maxScore) * 100);

          return (
            <div
              key={score.contestantId}
              style={{
                background: isWinner
                  ? "rgba(255,215,0,0.12)"
                  : "rgba(15,23,42,0.8)",
                border: `1px solid ${isWinner ? "rgba(255,215,0,0.5)" : "rgba(51,65,85,0.6)"}`,
                borderRadius: 10,
                padding: "10px 14px",
                transition: "all 0.3s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "rgba(30,41,59,0.8)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: rank <= 3 ? 16 : 12,
                    fontWeight: 700,
                    color: ROLE_COLORS.performer,
                    flexShrink: 0,
                  }}
                >
                  {RANK_MEDALS[rank] ?? `#${rank}`}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: isWinner ? ROLE_COLORS.host : "#e2e8f0" }}>
                    {score.contestantName}
                    {isWinner && " 👑"}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: isWinner ? ROLE_COLORS.host : ROLE_COLORS.performer,
                  }}
                >
                  {score.compositeScore.toFixed(1)}
                </div>
              </div>

              {/* Score bar */}
              <div
                style={{
                  height: 4,
                  background: "rgba(51,65,85,0.5)",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${barPct}%`,
                    height: "100%",
                    background: isWinner
                      ? `linear-gradient(90deg, ${ROLE_COLORS.host}, ${ROLE_COLORS.performer})`
                      : ROLE_COLORS.performer,
                    borderRadius: 2,
                    transition: "width 0.5s ease",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 6, fontSize: 10, color: "#64748b" }}>
                <span>Judges: {score.judgeTotal.toFixed(1)}</span>
                <span>Crowd: {score.crowdVoteTotal.toFixed(1)}</span>
                <span>Host: {score.hostMarkTotal.toFixed(1)}</span>
                {score.penaltyTotal > 0 && (
                  <span style={{ color: "#ef4444" }}>−{score.penaltyTotal.toFixed(1)}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
