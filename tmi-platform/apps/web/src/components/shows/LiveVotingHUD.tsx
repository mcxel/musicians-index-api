"use client";
import React, { useEffect, useState } from "react";
import type { VoteTally } from "@/lib/games/AudienceVotingEngine";

interface LiveVotingHUDProps {
  tally: VoteTally | null;
  isOpen: boolean;
  prompt?: string;
  userVotedChoice?: string | null;
  onVote?: (choice: string) => void;
}

const CHOICE_COLORS = ["#ffd700", "#00ffff", "#ff9f43", "#ff2daa", "#00ff88", "#a78bfa"];

export function LiveVotingHUD({ tally, isOpen, prompt, userVotedChoice, onVote }: LiveVotingHUDProps) {
  const [animatedPcts, setAnimatedPcts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (tally) {
      const target = tally.percentages;
      const start = animatedPcts;
      const startTime = performance.now();
      const duration = 600;

      const frame = (now: number) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current: Record<string, number> = {};
        for (const choice of Object.keys(target)) {
          current[choice] = (start[choice] ?? 0) + ((target[choice] ?? 0) - (start[choice] ?? 0)) * eased;
        }
        setAnimatedPcts(current);
        if (progress < 1) requestAnimationFrame(frame);
      };

      requestAnimationFrame(frame);
    }
  }, [tally]);

  if (!tally && !isOpen) return null;

  return (
    <div
      style={{
        background: "rgba(2,6,23,0.96)",
        border: "1px solid rgba(255,215,0,0.3)",
        borderRadius: 14,
        padding: "16px 20px",
        fontFamily: "system-ui, sans-serif",
        color: "#e2e8f0",
        minWidth: 280,
        maxWidth: 380,
        boxShadow: "0 0 32px rgba(255,215,0,0.1)",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {isOpen && (
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#ffd700",
                  boxShadow: "0 0 6px #ffd700",
                  animation: "votePulse 1s ease-in-out infinite",
                }}
              />
            )}
            <style>{`@keyframes votePulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }`}</style>
            <span style={{ fontSize: 10, color: "#ffd700", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2 }}>
              {isOpen ? "Voting Open" : "Results"}
            </span>
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", marginTop: 2 }}>
            {prompt ?? tally?.prompt ?? "Cast your vote"}
          </div>
        </div>
        {tally && (
          <div style={{ fontSize: 11, color: "#64748b" }}>
            {tally.totalVotes.toLocaleString()} votes
          </div>
        )}
      </div>

      {/* Choices */}
      {tally && Object.entries(tally.results).map(([choice, count], idx) => {
        const pct = animatedPcts[choice] ?? 0;
        const color = CHOICE_COLORS[idx % CHOICE_COLORS.length];
        const isLeading = choice === tally.leadingChoice;
        const hasVoted = userVotedChoice === choice;

        return (
          <div
            key={choice}
            onClick={() => isOpen && !userVotedChoice && onVote?.(choice)}
            style={{
              marginBottom: 8,
              cursor: isOpen && !userVotedChoice ? "pointer" : "default",
              opacity: userVotedChoice && !hasVoted ? 0.7 : 1,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 12 }}>
              <span style={{ color: hasVoted ? color : isLeading ? "#e2e8f0" : "#94a3b8", fontWeight: hasVoted || isLeading ? 700 : 400 }}>
                {choice}
                {hasVoted && " ✓"}
                {isLeading && !hasVoted && " ◆"}
              </span>
              <span style={{ color, fontWeight: 700 }}>{pct.toFixed(1)}%</span>
            </div>
            <div style={{ height: 6, background: "rgba(51,65,85,0.5)", borderRadius: 3, overflow: "hidden" }}>
              <div
                style={{
                  width: `${pct}%`,
                  height: "100%",
                  background: color,
                  borderRadius: 3,
                  boxShadow: isLeading ? `0 0 8px ${color}80` : "none",
                  transition: "none",
                }}
              />
            </div>
          </div>
        );
      })}

      {isOpen && !userVotedChoice && !tally && (
        <div style={{ color: "#475569", fontSize: 13, textAlign: "center", padding: "16px 0" }}>
          Waiting for choices...
        </div>
      )}

      {userVotedChoice && (
        <div style={{ marginTop: 10, fontSize: 11, color: "#64748b", textAlign: "center" }}>
          You voted: <strong style={{ color: "#ffd700" }}>{userVotedChoice}</strong>
        </div>
      )}
    </div>
  );
}
