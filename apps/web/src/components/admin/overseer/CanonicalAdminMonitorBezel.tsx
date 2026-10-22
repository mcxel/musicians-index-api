"use client";

/**
 * CanonicalAdminMonitorBezel.tsx — Unified Bezel for All Admin Monitors & Media Player Surfaces
 * The Musician's Index | BerntoutGlobal LLC
 *
 * Implements canonical bezel parity across Monitor A/B/C/D:
 * [SOURCE] · [SWAP] · [FULL] · [INSPECT] · [DETACH/ATTACH] · [CLEAR]
 *
 * Laws:
 * 1. Clean Monitor Law: Bezel lives outside the video picture.
 * 2. Honest Neutral State: CLEAR immediately restores NO SOURCE ASSIGNED.
 * 3. In-Place Inspection: INSPECT toggles local telemetry HUD, never scrolling the page.
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
  isDetached?: boolean;
  isMuted?: boolean;
  isInspecting?: boolean;
  onSourceClick: () => void;
  onSwapClick: () => void;
  onFullClick: () => void;
  onInspectClick?: () => void;
  onPinClick?: () => void;
  onDetachClick?: () => void;
  onClearClick?: () => void;
  onAudioToggle?: () => void;
  customTitle?: string;
  isMobile?: boolean;
}

function bezelBtn(active = false, disabled = false): CSSProperties {
  return {
    padding: "3px 7px",
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
    fontSize: 8,
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
  isDetached = false,
  isMuted = true,
  isInspecting = false,
  onSourceClick,
  onSwapClick,
  onFullClick,
  onInspectClick,
  onPinClick,
  onDetachClick,
  onClearClick,
  onAudioToggle,
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
        padding: "5px 8px",
        borderBottom: "1px solid rgba(255,215,0,0.25)",
        background: "linear-gradient(180deg, rgba(10,12,24,0.98) 0%, rgba(5,7,15,0.95) 100%)",
        borderTopLeftRadius: 6,
        borderTopRightRadius: 6,
        flexWrap: "wrap",
      }}
    >
      {/* Title & Live Status Indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: isLive ? "#00FF66" : hasSource ? "#00FFFF" : "rgba(255,215,0,0.4)",
            boxShadow: isLive ? "0 0 8px #00FF66" : hasSource ? "0 0 6px #00FFFF" : undefined,
            flexShrink: 0,
          }}
          title={isLive ? "LIVE BROADCAST ACTIVE" : hasSource ? "SOURCE ASSIGNED" : "CLEAN / IDLE"}
        />

        <span
          style={{
            fontSize: 9,
            fontWeight: 900,
            letterSpacing: "0.12em",
            color: accentColor,
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: isMobile ? 120 : 200,
          }}
        >
          {displayTitle} · {sourceLabel}
        </span>

        {viewerCount !== undefined && viewerCount > 0 ? (
          <span
            style={{
              fontSize: 7.5,
              fontWeight: 800,
              padding: "1px 5px",
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
      <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
        {/* Audio Listen Focus */}
        {hasSource && onAudioToggle ? (
          <button
            type="button"
            data-bezel-action="audio"
            style={bezelBtn(!isMuted)}
            onClick={onAudioToggle}
            title={isMuted ? "Unmute audio focus for this monitor" : "Audio focus active (click to mute)"}
          >
            {isMuted ? "🔇 MUTE" : "🔊 LISTEN"}
          </button>
        ) : null}

        {/* Source / Channel selector */}
        <button
          type="button"
          data-bezel-action="source"
          style={bezelBtn(isPickerOpen)}
          onClick={onSourceClick}
          title="Open Channel / Source selector"
        >
          Source
        </button>

        {/* Swap */}
        <button
          type="button"
          data-bezel-action="swap"
          style={bezelBtn(isSwapAnchor)}
          onClick={onSwapClick}
          title="Swap source with another monitor"
        >
          Swap
        </button>

        {/* Fullscreen / Dominant */}
        <button
          type="button"
          data-bezel-action="full"
          style={bezelBtn(isFullscreen)}
          onClick={onFullClick}
          title={isFullscreen ? "Restore 2x2 grid" : "Expand to dominant monitor"}
        >
          {isFullscreen ? "Restore" : "Full"}
        </button>

        {/* In-Place Inspect Telemetry HUD (no scroll displacement) */}
        {onInspectClick ? (
          <button
            type="button"
            data-bezel-action="inspect"
            style={bezelBtn(isInspecting, !hasSource)}
            onClick={onInspectClick}
            disabled={!hasSource}
            title="Inspect live stream telemetry in-place"
          >
            Inspect
          </button>
        ) : null}

        {/* Detach / Attach */}
        {onDetachClick ? (
          <button
            type="button"
            data-bezel-action="detach"
            style={bezelBtn(isDetached)}
            onClick={onDetachClick}
            title={isDetached ? "Attach back to monitor wall" : "Detach into floating window"}
          >
            {isDetached ? "Attach" : "Detach"}
          </button>
        ) : null}

        {/* Clear back to honest NO SOURCE ASSIGNED */}
        {hasSource && onClearClick ? (
          <button
            type="button"
            data-bezel-action="clear"
            style={{
              ...bezelBtn(false),
              color: "#FF4444",
              borderColor: "rgba(255,68,68,0.4)",
            }}
            onClick={onClearClick}
            title="Detach source and return to clean NO SOURCE ASSIGNED"
          >
            Clear
          </button>
        ) : null}
      </div>
    </div>
  );
}
