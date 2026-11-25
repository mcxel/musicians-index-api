"use client";

/**
 * LivingPlayerControlBed — mandatory compact Living OS control grammar
 * for every eligible interactive TMI monitor. Shared visual language;
 * role capabilities gate which commands appear. Never a second monitor engine.
 */

import { type CSSProperties, type ReactNode } from "react";
import {
  UNIVERSAL_VIEW_COUNTS,
  type LivingPlayerCapabilityProfile,
  type LivingPlayerCommand,
  type LivingViewCount,
} from "@/lib/monitors/livingPlayerControlContract";

export type LivingPlayerControlBedProps = {
  destinationId: string;
  capabilities: LivingPlayerCapabilityProfile;
  viewCount: LivingViewCount;
  onViewCountChange: (n: LivingViewCount) => void;
  workspaceMode?: "WATCH" | "FOCUS" | "LAYOUT";
  onWorkspaceModeChange?: (mode: "WATCH" | "FOCUS" | "LAYOUT") => void;
  onCommand?: (command: LivingPlayerCommand, targetIndex?: number) => void;
  onOpenDesk?: () => void;
  accent?: string;
  compact?: boolean;
  monLabel?: string;
  feedPicker?: ReactNode;
  targetPanelIndex?: number;
  onSelectTargetPanel?: (index: number) => void;
  availableModes?: LivingViewCount[];
};

const MODE_ORDER: Array<"WATCH" | "FOCUS" | "LAYOUT"> = ["WATCH", "FOCUS", "LAYOUT"];

export default function LivingPlayerControlBed({
  destinationId,
  capabilities,
  viewCount,
  onViewCountChange,
  workspaceMode = "WATCH",
  onWorkspaceModeChange,
  onCommand,
  onOpenDesk,
  accent = "#00FFFF",
  compact = true,
  monLabel,
  feedPicker,
  targetPanelIndex = 0,
  onSelectTargetPanel,
  availableModes,
}: LivingPlayerControlBedProps) {
  const can = (c: LivingPlayerCommand) => capabilities.commands.includes(c);

  const btn = (active: boolean, color = accent): CSSProperties => ({
    minWidth: compact ? 20 : 26,
    height: compact ? 20 : 24,
    padding: "0 5px",
    borderRadius: 4,
    border: active ? `1px solid ${color}` : "1px solid rgba(255,255,255,0.14)",
    background: active ? `${color}33` : "rgba(0,0,0,0.4)",
    color: active ? color : "rgba(255,255,255,0.8)",
    fontSize: compact ? 8 : 9,
    fontWeight: 900,
    letterSpacing: "0.06em",
    cursor: "pointer",
    fontFamily: "inherit",
    textTransform: "uppercase",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    /* §20995-C: premium motion on existing buttons — no remount, no layout shift */
    transition:
      "background-color 160ms ease, border-color 160ms ease, color 160ms ease, box-shadow 160ms ease, transform 120ms ease",
    boxShadow: active ? `0 0 10px ${color}55` : "none",
  });

  const effectiveModes: LivingViewCount[] = availableModes ?? (UNIVERSAL_VIEW_COUNTS as unknown as LivingViewCount[]);

  return (
    <div
      data-living-player-control-bed="1"
      data-monitor-ops-strip="top-edge"
      data-destination-id={destinationId}
      data-role={capabilities.role}
      data-max-views={capabilities.maxInternalViewsPerMonitor}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
        padding: "4px 6px 3px",
        /* Flush to monitor glass below: square bottom edge against viewport frame */
        borderRadius: "6px 6px 0 0",
        border: `1px solid ${accent}44`,
        borderBottom: `1px solid ${accent}66`,
        background: "linear-gradient(180deg, rgba(12,10,24,0.95), rgba(5,5,16,0.92))",
        maxWidth: "100%",
        width: "100%",
        boxSizing: "border-box",
        overflowX: "hidden",
      }}
    >
      <style>{`
        [data-living-player-control-bed="1"] button:hover {
          filter: brightness(1.18);
          box-shadow: 0 0 12px ${accent}44;
        }
        [data-living-player-control-bed="1"] button:active {
          transform: scale(0.96);
        }
        @media (prefers-reduced-motion: reduce) {
          [data-living-player-control-bed="1"] button {
            transition: none !important;
            transform: none !important;
          }
        }
      `}</style>
      {/* ROW 1: PRIMARY CONTROLS (Identity, Modes, Panel/Split Selector) */}
      <div
        data-living-primary-controls="1"
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 3,
          width: "100%",
          minWidth: 0,
        }}
      >
      {/* Living OS Entry Desk Button */}
      {onOpenDesk ? (
        <button
          type="button"
          data-living-os-entry="1"
          onClick={onOpenDesk}
          style={{
            ...btn(false),
            color: accent,
            marginRight: 2,
          }}
        >
          LIVING OS
        </button>
      ) : (
        <span
          style={{
            fontSize: 8,
            fontWeight: 900,
            letterSpacing: "0.1em",
            color: accent,
            marginRight: 2,
          }}
        >
          LIVING OS
        </span>
      )}

      {/* Monitor Label */}
      {monLabel ? (
        <span
          data-monitor-label="1"
          style={{
            fontSize: 8.5,
            fontWeight: 900,
            letterSpacing: "0.08em",
            color: "#FFD700",
            textTransform: "uppercase",
            marginRight: 2,
            padding: "0 2px",
          }}
        >
          {monLabel}
        </span>
      ) : null}

      {/* Absorbed Feed Picker */}
      {feedPicker ? (
        <div style={{ display: "inline-flex", alignItems: "center" }}>
          {feedPicker}
        </div>
      ) : null}

      <span style={{ width: 1, height: 14, background: "rgba(255,255,255,0.15)", margin: "0 2px" }} />

      {/* Workspace Modes */}
      {MODE_ORDER.map((mode) =>
        can(mode) ? (
          <button
            key={mode}
            type="button"
            style={btn(workspaceMode === mode)}
            onClick={() => {
              onWorkspaceModeChange?.(mode);
              onCommand?.(mode, targetPanelIndex);
            }}
          >
            {mode}
          </button>
        ) : null,
      )}

      <span style={{ width: 1, height: 14, background: "rgba(255,255,255,0.15)", margin: "0 2px" }} />

      {/* View Count Split Buttons (1–8) */}
      <div
        data-monitor-channel-selector="1"
        style={{ display: "inline-flex", alignItems: "center", gap: 2 }}
        title="Monitor panel split (1–8)"
      >
        {effectiveModes.map((n) => (
          <button
            key={n}
            type="button"
            data-channel={n}
            aria-pressed={viewCount === n}
            style={btn(viewCount === n, "#FFD700")}
            title={`${n}-panel split`}
            onClick={() => {
              onViewCountChange(n);
              onCommand?.("VIEW", targetPanelIndex);
            }}
          >
            {n}
          </button>
        ))}
      </div>

      {/* Target Panel Selector (visible when split > 1) */}
      {viewCount > 1 && (
        <>
          <span style={{ width: 1, height: 14, background: "rgba(255,255,255,0.15)", margin: "0 2px" }} />
          <div
            data-target-panel-selector="1"
            style={{ display: "inline-flex", alignItems: "center", gap: 2 }}
            title="Active target panel for commands (SOURCE, FULL, PIN, etc.)"
          >
            <span style={{ fontSize: 7.5, fontWeight: 900, color: accent, letterSpacing: "0.08em" }}>
              TGT:
            </span>
            {Array.from({ length: viewCount }, (_, i) => {
              const isTarget = targetPanelIndex === i;
              return (
                <button
                  key={i}
                  type="button"
                  data-target-panel-btn={i}
                  aria-pressed={isTarget}
                  style={{
                    ...btn(isTarget, accent),
                    minWidth: 16,
                    padding: "0 3px",
                  }}
                  onClick={() => onSelectTargetPanel?.(i)}
                  title={`Target Panel [${i + 1}]`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </>
      )}

      </div>

      {/* ROW 2: ACTION & UTILITY CONTROL RAIL (Swipeable on mobile, zero page overflow) */}
      <div
        data-living-secondary-rail="1"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 3,
          width: "100%",
          minWidth: 0,
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          paddingBottom: 1,
        }}
      >
      {(
        [
          ["FULL", "FULL"],
          ["PIN", "PIN"],
          ["INFO", "INFO"],
          ["MIX", "MIX"],
          ["SOURCE", "SOURCE"],
          ["ROOM", "ROOM"],
          ["STATION", "STATION"],
          ["SWITCH", "SWAP"],
          ["INSPECT", "INSPECT"],
          ["DETACH", "DETACH"],
          ["RESET", "CLEAR"],
        ] as Array<[LivingPlayerCommand, string]>
      ).map(([cmd, label]) =>
        can(cmd) ? (
          <button
            key={cmd}
            type="button"
            style={{
              ...btn(false),
              flexShrink: 0,
            }}
            title={`${label} targeted panel P${targetPanelIndex + 1}`}
            onClick={() => onCommand?.(cmd, targetPanelIndex)}
          >
            {label}
          </button>
        ) : null,
      )}
      </div>
    </div>
  );
}
