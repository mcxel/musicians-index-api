"use client";

/**
 * VenueToolsShellHint — shown where legacy standalone venue controls were retired.
 * One CTA opens canonical VENUE TOOLS (Rule 14 — real destination).
 */

import React from "react";
import VenueToolsToggleButton from "@/components/hud/VenueToolsToggleButton";

export interface VenueToolsShellHintProps {
  accent?: string;
  roomId?: string;
  compact?: boolean;
}

export default function VenueToolsShellHint({
  accent = "#FFD700",
  roomId,
  compact = false,
}: VenueToolsShellHintProps) {
  return (
    <div
      data-venue-tools-hint
      style={{
        marginBottom: compact ? 8 : 12,
        border: `1px solid ${accent}33`,
        borderRadius: 10,
        padding: compact ? "8px 10px" : "10px 12px",
        background: `${accent}08`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        flexWrap: "wrap",
      }}
    >
      <span style={{ fontSize: compact ? 9 : 10, color: "rgba(255,255,255,0.55)", lineHeight: 1.4 }}>
        Curtain, lighting, mood, and FX controls live in{" "}
        <strong style={{ color: accent }}>VENUE TOOLS</strong>.
      </span>
      <VenueToolsToggleButton accent={accent} roomId={roomId} role="performer" />
    </div>
  );
}
