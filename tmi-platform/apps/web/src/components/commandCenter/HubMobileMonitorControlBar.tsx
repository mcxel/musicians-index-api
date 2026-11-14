"use client";

import type { CSSProperties } from "react";

/**
 * HubMobileMonitorControlBar — monitor grammar controls (SHOW/CAST/SHARE/MEDIA).
 * Only surfaces controls when underlying capability is real.
 */

import { presentCanonicalWorkspace } from "@/lib/workspace/universal/openCanonicalPresentation";

export interface HubMobileMonitorControlBarProps {
  role: "fan" | "performer";
  hasLiveFeed: boolean;
  hasScreenShare?: boolean;
  onToggleCast?: () => void;
}

function btn(active: boolean, accent: string): CSSProperties {
  return {
    flexShrink: 0,
    fontSize: 8,
    fontWeight: 900,
    letterSpacing: "0.08em",
    padding: "7px 10px",
    borderRadius: 8,
    border: active ? `1px solid ${accent}` : "1px solid rgba(255,255,255,0.12)",
    background: active ? `${accent}22` : "rgba(255,255,255,0.04)",
    color: active ? accent : "rgba(255,255,255,0.75)",
    cursor: "pointer",
    fontFamily: "inherit",
    whiteSpace: "nowrap",
  };
}

export default function HubMobileMonitorControlBar({
  role,
  hasLiveFeed,
  hasScreenShare = false,
  onToggleCast,
}: HubMobileMonitorControlBarProps) {
  const accent = role === "performer" ? "#FFD700" : "#00FF88";

  const openShare = () => presentCanonicalWorkspace("share-studio", "DRAWER");

  return (
    <div
      data-hub-mobile-monitor-controls="1"
      style={{
        flexShrink: 0,
        padding: "4px 10px 6px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(4,6,14,0.92)",
      }}
    >
      <div style={{ display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none" }}>
        {hasLiveFeed ? (
          <button type="button" data-testid="hub-monitor-show" style={btn(true, accent)} title="Live feed active on monitors">
            SHOW
          </button>
        ) : null}
        {hasLiveFeed ? (
          <button
            type="button"
            data-testid="hub-monitor-cast"
            style={btn(false, "#00E5FF")}
            onClick={() => {
              if (onToggleCast) onToggleCast();
              else if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("tmi:cast-panel-toggle"));
              }
            }}
          >
            CAST
          </button>
        ) : null}
        <button type="button" data-testid="hub-monitor-share" style={btn(false, "#FF2DAA")} onClick={openShare}>
          SHARE
        </button>
        {hasScreenShare ? (
          <button type="button" data-testid="hub-monitor-screen-share" style={btn(true, "#AA2DFF")}>
            SCREEN
          </button>
        ) : null}
        <button
          type="button"
          data-testid="hub-monitor-media"
          style={btn(false, accent)}
          onClick={() => presentCanonicalWorkspace("playlist-studio", "DRAWER")}
        >
          MEDIA
        </button>
      </div>
    </div>
  );
}
