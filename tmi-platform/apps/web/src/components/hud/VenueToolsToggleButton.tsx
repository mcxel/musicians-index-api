"use client";

/**
 * VENUE TOOLS toggle — same button opens and closes the floating quick panel.
 * Does not navigate; preserves roomId / player / WebRTC (Rule 14).
 */

import React, { useEffect } from "react";
import {
  useCompactQuickPanelStore,
  type CompactQuickPanelCorner,
} from "@/lib/hud/compactQuickPanelStore";
import {
  isVenueToolsEnabled,
  isVenueToolsReadOnly,
  resolveVenueToolsPolicy,
  type VenueToolsPolicyContext,
} from "@/lib/venue/VenueToolsRegistry";
import { registerShellButtonHealth } from "@/registries/shell/ButtonCommandRegistry";
import { incrementFunctionCaller } from "@/registries/shell/FunctionHealthRegistry";

export interface VenueToolsToggleButtonProps {
  accent?: string;
  corner?: CompactQuickPanelCorner;
  /** Lounge host context — passed to venue panel when opening from lounge HUD */
  loungeHost?: boolean;
  roomId?: string;
  testId?: string;
  title?: string;
  style?: React.CSSProperties;
  className?: string;
  policyContext?: Omit<VenueToolsPolicyContext, "role">;
  role?: VenueToolsPolicyContext["role"];
}

/** Open if closed, close if already open — never a separate close-only control. */
export function toggleVenueToolsPanel(corner: CompactQuickPanelCorner = "bottom-right"): void {
  const { activePanel, openPanel, closePanel } = useCompactQuickPanelStore.getState();
  if (activePanel === "venue") {
    closePanel();
    return;
  }
  openPanel("venue", corner);
}

export default function VenueToolsToggleButton({
  accent = "#AA2DFF",
  corner = "bottom-right",
  loungeHost = false,
  roomId,
  testId = "tmi-venue-tools-toggle",
  title = "Venue lighting, stage, and environment controls",
  style,
  className,
  policyContext,
  role = "performer",
}: VenueToolsToggleButtonProps) {
  const activePanel = useCompactQuickPanelStore((s) => s.activePanel);
  const setVenueContext = useCompactQuickPanelStore((s) => s.setVenueContext);
  const isActive = activePanel === "venue";
  const policy = resolveVenueToolsPolicy({
    role,
    isLive: policyContext?.isLive,
    isGoLiveContext: policyContext?.isGoLiveContext,
    isLoungeHost: loungeHost || policyContext?.isLoungeHost,
  });
  const enabled = isVenueToolsEnabled(policy);

  useEffect(() => {
    const commandId =
      testId === "tmi-venue-tools-lounge-hud"
        ? "shell.venue-tools.lounge-hud"
        : testId === "tmi-venue-tools-venue-hud"
          ? "shell.venue-tools.venue-hud"
          : testId === "tmi-venue-tools-media-stack"
            ? "shell.venue-tools.media-stack"
            : "shell.venue-tools.mobile";
    registerShellButtonHealth(commandId, enabled ? "ok" : "missing");
  }, [enabled, testId]);

  if (!enabled) return null;

  const handleClick = () => {
    incrementFunctionCaller("toggleVenueToolsPanel", "button", "session-control-strip");
    setVenueContext({
      isLoungeHost: loungeHost,
      roomId,
      readOnly: isVenueToolsReadOnly(policy),
    });
    toggleVenueToolsPanel(corner);
  };

  return (
    <button
      type="button"
      data-testid={testId}
      className={className}
      title={title}
      aria-pressed={isActive}
      aria-expanded={isActive}
      onClick={handleClick}
      style={{
        fontSize: 8,
        fontWeight: 900,
        letterSpacing: "0.08em",
        padding: "3px 10px",
        borderRadius: 6,
        cursor: "pointer",
        border: isActive ? `1px solid ${accent}` : `1px solid ${accent}66`,
        background: isActive ? `${accent}22` : "transparent",
        color: accent,
        fontFamily: "inherit",
        display: "flex",
        alignItems: "center",
        gap: 4,
        whiteSpace: "nowrap",
        touchAction: "manipulation",
        minHeight: 32,
        ...style,
      }}
    >
      <span aria-hidden>🎛</span>
      <span>VENUE TOOLS</span>
    </button>
  );
}
