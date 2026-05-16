"use client";

/**
 * PRESENCE BAR
 * Displays live watching count, live badge, and recent-join ticker.
 * Used in lobbies, games, concerts, billboards, sponsor views.
 */

import { usePresenceEngine } from "@/lib/live/presenceEngine";
import { TIMING } from "@/lib/motion/timingRegistry";
import { prefersReducedMotion } from "@/lib/motion/reducedMotionGuard";

interface PresenceBarProps {
  roomId: string;
  compact?: boolean;
}

export default function PresenceBar({ roomId, compact = false }: PresenceBarProps) {
  const presence = usePresenceEngine(roomId);
  const reduced = prefersReducedMotion();

  const pulseStyle: React.CSSProperties = reduced
    ? {}
    : { animation: `tmi-live-pulse 1800ms ease-in-out infinite` };

  return (
    <div
      data-testid={`presence-bar-${roomId}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: compact ? 8 : 12,
        fontSize: compact ? 11 : 12,
        color: "#a5f3fc",
        userSelect: "none",
      }}
    >
      {/* Live dot */}
      <span
        aria-label="Live now"
        style={{
          display: "inline-block",
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: "#22d3ee",
          flexShrink: 0,
          ...pulseStyle,
        }}
      />

      {/* Watch count */}
      <span style={{ fontVariantNumeric: "tabular-nums" }}>
        {presence.watching.toLocaleString()} watching
      </span>

      {/* Active count */}
      {!compact && (
        <span style={{ color: "#64748b" }}>
          · {presence.active.toLocaleString()} active
        </span>
      )}

      {/* Recent join */}
      {presence.joinedRecently[0] && (
        <span
          style={{
            color: "#86efac",
            fontSize: 10,
            transition: reduced ? undefined : `opacity ${TIMING.fast}ms ease`,
          }}
        >
          {presence.joinedRecently[0]} joined
        </span>
      )}

      {/* Live badge */}
      {presence.liveNow && (
        <span
          aria-label="Live"
          style={{
            background: "rgba(220,38,38,0.85)",
            color: "#fff",
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.1em",
            padding: "2px 6px",
            borderRadius: 4,
            flexShrink: 0,
            ...pulseStyle,
          }}
        >
          LIVE
        </span>
      )}
    </div>
  );
}
