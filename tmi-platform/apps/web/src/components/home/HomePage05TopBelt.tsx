"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { buildIssueSnapshot } from "@/lib/issues/IssueIntelligenceEngine";
import { getWinnerEntityRuntime } from "@/lib/home/WinnerEntityRuntime";

export default function HomePage05TopBelt({
  weekLabel,
  issueLabel,
  crownWinner,
  crownWinnerHref,
  accentColor = "#AA2DFF",
}: {
  weekLabel?: string;
  issueLabel?: string;
  crownWinner?: string;
  crownWinnerHref?: string;
  accentColor?: string;
}) {
  const issue = useMemo(() => buildIssueSnapshot(), []);
  const winner = useMemo(() => getWinnerEntityRuntime(), []);

  const resolvedWeekLabel = weekLabel ?? `Week ${issue.weekInSeason}`;
  const resolvedIssueLabel = issueLabel ?? issue.issueLabel.replace(" · ", " ");
  const resolvedCrownWinner = crownWinner ?? winner?.name ?? "CROWN";
  const resolvedCrownWinnerHref = crownWinnerHref ?? winner?.route ?? "/rankings/crown";

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "4px 10px",
      borderRadius: 8,
      background: "rgba(0,0,0,0.45)",
      border: "1px solid rgba(255,255,255,0.07)",
      marginBottom: 6,
      flexShrink: 0,
    }}>
      {/* Left: TMI Issue */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <motion.div
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2.8, repeat: Infinity }}
          style={{
            padding: "1px 7px", borderRadius: 999,
            background: `${accentColor}14`, border: `1px solid ${accentColor}33`,
            fontSize: 6, fontWeight: 900, letterSpacing: "0.2em", color: accentColor, textTransform: "uppercase",
          }}
        >
          TMI · {resolvedIssueLabel}
        </motion.div>
      </div>

      {/* Center: Current week */}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <span style={{ fontSize: 7, fontWeight: 900, letterSpacing: "0.14em", color: "rgba(255,255,255,0.55)", textTransform: "uppercase" }}>
          {resolvedWeekLabel}
        </span>
        <motion.div
          animate={{ scaleX: [0.7, 1.1, 0.7] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          style={{ width: 16, height: 1.5, background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }}
        />
        <span style={{ fontSize: 6, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase" }}>R&amp;B SEASON</span>
      </div>

      {/* Right: Crown Winner */}
      <a href={resolvedCrownWinnerHref} style={{ textDecoration: "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            style={{ fontSize: 9, filter: "drop-shadow(0 0 6px #FFD700)" }}
          >
            👑
          </motion.span>
          <div>
            <div style={{ fontSize: 5, color: "rgba(255,255,255,0.3)", letterSpacing: "0.14em", textTransform: "uppercase" }}>CROWN</div>
            <div style={{ fontSize: 7, fontWeight: 900, color: "#FFD700" }}>{resolvedCrownWinner}</div>
          </div>
        </div>
      </a>
    </div>
  );
}
