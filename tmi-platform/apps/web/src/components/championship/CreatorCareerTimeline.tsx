"use client";

/**
 * Creator Career Timeline — real ProgressionEngine events only (Phase 2C).
 */

import { useMemo } from "react";
import { getCareerTimeline } from "@/lib/progression/ProgressionEngine";

export interface CreatorCareerTimelineProps {
  userId: string;
  accentColor?: string;
  maxEntries?: number;
}

export default function CreatorCareerTimeline({
  userId,
  accentColor = "#AA2DFF",
  maxEntries = 40,
}: CreatorCareerTimelineProps) {
  const timeline = useMemo(() => getCareerTimeline(userId), [userId]);

  if (timeline.length === 0) {
    return (
      <div
        style={{
          padding: 14,
          borderRadius: 10,
          border: "1px dashed rgba(255,255,255,0.15)",
          fontSize: 11,
          color: "rgba(255,255,255,0.4)",
          lineHeight: 1.5,
        }}
      >
        Career timeline is empty. Competitive wins, XP grants, level-ups, and achievement unlocks
        appear here when earned — never fabricated.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div
        style={{
          fontSize: 9,
          fontWeight: 900,
          letterSpacing: "0.12em",
          color: accentColor,
          marginBottom: 2,
        }}
      >
        CREATOR CAREER TIMELINE
      </div>
      {timeline.slice(0, maxEntries).map((e) => (
        <div
          key={e.id}
          style={{
            padding: "8px 10px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.08)",
            fontSize: 11,
            color: "rgba(255,255,255,0.75)",
            borderLeft: `3px solid ${accentColor}`,
          }}
        >
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>
            {new Date(e.at).toLocaleString()} · {e.kind}
          </div>
          <div style={{ marginTop: 2 }}>{e.label}</div>
        </div>
      ))}
    </div>
  );
}
