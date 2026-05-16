"use client";

/**
 * IssueIdentityBadge.tsx
 * Top-right magazine issue identity: Issue #, Week #, Theme.
 * Visual — not generic. Changes per cover theme.
 */

const CURRENT_WEEK = 28;
const CURRENT_ISSUE = 47;

interface Props {
  issue?: number;
  week?: number;
  theme?: string;
  accentColor?: string;
}

export default function IssueIdentityBadge({
  issue = CURRENT_ISSUE,
  week = CURRENT_WEEK,
  theme = "Crown Series",
  accentColor = "#FFD700",
}: Props) {
  return (
    <div
      style={{
        display: "grid",
        gap: 1,
        textAlign: "right",
        padding: "4px 8px",
      }}
    >
      <div
        style={{
          fontSize: 7,
          fontWeight: 800,
          letterSpacing: "0.2em",
          color: accentColor,
          textTransform: "uppercase",
          fontFamily: "var(--font-tmi-orbitron, 'Orbitron', monospace)",
          textShadow: `0 0 10px ${accentColor}60`,
        }}
      >
        ISSUE #{issue}
      </div>
      <div
        style={{
          fontSize: 7,
          fontWeight: 600,
          letterSpacing: "0.12em",
          opacity: 0.6,
          textTransform: "uppercase",
          fontFamily: "var(--font-tmi-rajdhani, 'Rajdhani', sans-serif)",
        }}
      >
        WEEK {week} · {theme}
      </div>
    </div>
  );
}
