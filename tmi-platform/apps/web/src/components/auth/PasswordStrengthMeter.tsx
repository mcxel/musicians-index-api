"use client";

import React from "react";

type Props = {
  password: string;
};

function computeScore(password: string): number {
  let score = 0;
  if (password.length >= 10) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
}

function scoreLabel(score: number): string {
  if (score <= 1) return "Very weak";
  if (score === 2) return "Weak";
  if (score === 3) return "Fair";
  if (score === 4) return "Strong";
  return "Very strong";
}

export default function PasswordStrengthMeter({ password }: Props) {
  const score = computeScore(password);
  const pct = Math.min(100, (score / 5) * 100);
  const color =
    score <= 1 ? "#ef4444" : score === 2 ? "#f97316" : score === 3 ? "#eab308" : score === 4 ? "#22c55e" : "#06b6d4";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,0.14)", overflow: "hidden" }}>
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: color,
            transition: "width 180ms ease, background 180ms ease",
          }}
        />
      </div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)" }}>Password strength: {scoreLabel(score)}</div>
    </div>
  );
}
