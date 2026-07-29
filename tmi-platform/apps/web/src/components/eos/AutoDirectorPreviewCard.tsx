"use client";

import Link from "next/link";
import type { MonitorAssignment } from "@/core/eos/monitorAssignment";

export interface AutoDirectorPreviewCardProps {
  assignment: MonitorAssignment;
  /** Compact mode for PIP satellites */
  compact?: boolean;
  className?: string;
}

/**
 * Lightweight discovery card for idle Flight Deck monitors.
 * Links to real ExperienceRegistry entryRoute — does NOT mount StageLoader.
 */
export default function AutoDirectorPreviewCard({
  assignment,
  compact = false,
  className,
}: AutoDirectorPreviewCardProps) {
  const href = assignment.entryRoute;
  const accent = assignment.accentColor ?? "#00FFFF";
  const icon = assignment.icon ?? "🎬";
  const title = assignment.title ?? "Discover";
  const subtitle = assignment.subtitle ?? "Open experience";

  const inner = (
    <div
      className={className}
      style={{
        width: "100%",
        height: "100%",
        minHeight: compact ? 0 : undefined,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: compact ? 6 : 10,
        padding: compact ? 10 : 16,
        background: `linear-gradient(160deg, #050510 0%, ${accent}18 55%, #0a0614 100%)`,
        boxSizing: "border-box",
        textAlign: "center",
        cursor: href ? "pointer" : "default",
      }}
    >
      <div
        style={{
          fontSize: 8,
          fontWeight: 900,
          letterSpacing: "0.14em",
          color: accent,
          opacity: 0.9,
        }}
      >
        AUTO-DIRECTOR
      </div>
      <div style={{ fontSize: compact ? 22 : 36, lineHeight: 1 }} aria-hidden>
        {icon}
      </div>
      <div
        style={{
          fontSize: compact ? 11 : 14,
          fontWeight: 800,
          color: "#fff",
          letterSpacing: "0.04em",
        }}
      >
        {title}
      </div>
      {!compact && (
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.65)", maxWidth: 260, lineHeight: 1.4 }}>
          {subtitle}
        </div>
      )}
      {href && (
        <div
          style={{
            marginTop: compact ? 2 : 6,
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: "0.1em",
            color: accent,
            border: `1px solid ${accent}66`,
            borderRadius: 6,
            padding: compact ? "4px 8px" : "6px 12px",
            background: `${accent}14`,
          }}
        >
          ENTER →
        </div>
      )}
    </div>
  );

  if (!href) {
    return (
      <div style={{ width: "100%", height: "100%" }} title="No route available">
        {inner}
      </div>
    );
  }

  return (
    <Link
      href={href}
      style={{ display: "block", width: "100%", height: "100%", textDecoration: "none" }}
      title={`Enter ${title}`}
    >
      {inner}
    </Link>
  );
}
