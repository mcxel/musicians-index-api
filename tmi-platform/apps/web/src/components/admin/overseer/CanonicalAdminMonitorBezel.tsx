"use client";

/**
 * CanonicalAdminMonitorBezel.tsx — Unified Bezel for All Admin Monitors & Media Player Surfaces
 * The Musician's Index | BerntoutGlobal LLC
 *
 * Implements canonical bezel parity across Monitor A/B/C/D... and above Media Player 1:
 * [SOURCE] · [SWAP] · [FULL] · [INSPECT] · [PIN] · [DETACH]
 */

import { type CSSProperties } from "react";

export interface CanonicalAdminMonitorBezelProps {
  monitorId: string;
  sourceLabel?: string;
  accentColor?: string;
  isLive?: boolean;
  viewerCount?: number;
  isPinned?: boolean;
  isFullscreen?: boolean;
  isSwapAnchor?: boolean;
  isPickerOpen?: boolean;
  hasSource?: boolean;
  onSourceClick: () => void;
  onLivingOsClick?: () => void;
  onSwapClick: () => void;
  onFullClick: () => void;
  onInspectClick?: () => void;
  onPinClick: () => void;
  onDetachClick?: () => void;
  customTitle?: string;
  isMobile?: boolean;
}

function bezelBtn(active = false, disabled = false): CSSProperties {
  return {
    padding: "2px 6px",
    borderRadius: 4,
    border: active
      ? "1px solid #00FFFF"
      : disabled
        ? "1px solid rgba(255,255,255,0.1)"
        : "1px solid rgba(255,215,0,0.35)",
    background: active
      ? "rgba(0,255,255,0.2)"
      : disabled
        ? "rgba(0,0,0,0.2)"
        : "rgba(0,0,0,0.5)",
    color: active ? "#00FFFF" : disabled ? "rgba(255,255,255,0.25)" : "#FFD700",
    fontSize: 7.5,
    fontWeight: 900,
    letterSpacing: "0.08em",
    cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "inherit",
    textTransform: "uppercase",
    transition: "all 140ms ease",
    display: "inline-flex",
    alignItems: "center",
    gap: 3,
  };
}

export default function CanonicalAdminMonitorBezel({
  monitorId,
  sourceLabel = "NO SOURCE",
  accentColor = "#FFD700",
  isLive = false,
  viewerCount,
  isPinned = false,
  isFullscreen = false,
  isSwapAnchor = false,
  isPickerOpen = false,
  hasSource = false,
  onSourceClick,
  onLivingOsClick,
  onSwapClick,
  onFullClick,
  onInspectClick,
  onPinClick,
  onDetachClick,
  customTitle,
  isMobile = false,
}: CanonicalAdminMonitorBezelProps) {
  const displayTitle = customTitle ?? `MONITOR ${monitorId}`;

  return (
    <div
      data-admin-monitor-bezel={monitorId}
      style={{
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 6,
        padding: "4px 8px",
        borderBottom: "1px solid rgba(255,215,0,0.25)",
        background: "linear-gradient(180deg, rgba(10,12,24,0.95) 0%, rgba(5,7,15,0.95) 100%)",
        borderTopLeftRadius: 6,
        borderTopRightRadius: 6,
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
        {/* Status dot */}
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: isLive ? "#00FF66" : isPinned ? "#AA2DFF" : "rgba(255,215,0,0.5)",
            boxShadow: isLive ? "0 0 8px #00FF66" : undefined,
            flexShrink: 0,
          }}
          title={isLive ? "LIVE FEED ACTIVE" : isPinned ? "PINNED" : "IDLE"}
        />

        <span
          style={{
            fontSize: 8.5,
            fontWeight: 900,
            letterSpacing: "0.12em",
            color: accentColor,
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: isMobile ? 120 : 180,
          }}
        >
          {displayTitle} · {sourceLabel}
        </span>

        {viewerCount !== undefined && viewerCount > 0 ? (
          <span
            style={{
              fontSize: 7,
              fontWeight: 800,
              padding: "1px 4px",
              borderRadius: 3,
              background: "rgba(0,255,255,0.12)",
              color: "#00FFFF",
              letterSpacing: "0.06em",
            }}
          >
            {viewerCount} 👀
          </span>
        ) : null}
      </div>

      {/* Standard Bezel Button Cluster */}
      <div style={{ display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap" }}>
        <button
          type="button"
          data-bezel-action="source"
          style={bezelBtn(isPickerOpen)}
          onClick={onSourceClick}
          title="Assign live room or media source"
        >
          Source
        </button>

        {onLivingOsClick ? (
          <button
            type="button"
            data-bezel-action="living-os"
            style={bezelBtn(false)}
            onClick={onLivingOsClick}
            title="Open the Living OS Control Desk for this media player"
          >
            Living OS
          </button>
        ) : null}

        <button
          type="button"
          data-bezel-action="swap"
          style={bezelBtn(isSwapAnchor)}
          onClick={onSwapClick}
          title="Swap source with another monitor"
        >
          Swap
        </button>

        <button
          type="button"
          data-bezel-action="full"
          style={bezelBtn(isFullscreen)}
          onClick={onFullClick}
          title={isFullscreen ? "Restore layout" : "Expand to dominant monitor"}
        >
          {isFullscreen ? "Restore" : "Full"}
        </button>

        {onInspectClick ? (
          <button
            type="button"
            data-bezel-action="inspect"
            style={bezelBtn(false, !hasSource)}
            onClick={onInspectClick}
            disabled={!hasSource}
            title="Inspect feed on Control Desk"
          >
            Inspect
          </button>
        ) : null}

        <button
          type="button"
          data-bezel-action="pin"
          style={bezelBtn(isPinned)}
          onClick={onPinClick}
          title={isPinned ? "Unpin monitor (enable auto-rotate)" : "Pin monitor (lock feed)"}
        >
          {isPinned ? "📌 PINNED" : "Pin"}
        </button>

        {onDetachClick ? (
          <button
            type="button"
            data-bezel-action="detach"
            style={bezelBtn(false)}
            onClick={onDetachClick}
            title="Detach monitor from wall (rise display deck)"
          >
            Detach
          </button>
        ) : null}
      </div>
    </div>
  );
}
