"use client";

/**
 * LivingPlayerControlBed — mandatory compact Living OS control grammar
 * for every eligible interactive TMI monitor. Shared visual language;
 * role capabilities gate which commands appear. Never a second monitor engine.
 */

import type { CSSProperties } from "react";
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
  onCommand?: (command: LivingPlayerCommand) => void;
  onOpenDesk?: () => void;
  accent?: string;
  compact?: boolean;
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
}: LivingPlayerControlBedProps) {
  const can = (c: LivingPlayerCommand) => capabilities.commands.includes(c);

  const btn = (active: boolean, color = accent): CSSProperties => ({
    minWidth: compact ? 22 : 28,
    height: compact ? 20 : 24,
    padding: "0 6px",
    borderRadius: 4,
    border: active ? `1px solid ${color}` : "1px solid rgba(255,255,255,0.12)",
    background: active ? `${color}33` : "rgba(0,0,0,0.35)",
    color: active ? color : "rgba(255,255,255,0.75)",
    fontSize: compact ? 8 : 9,
    fontWeight: 900,
    letterSpacing: "0.06em",
    cursor: "pointer",
    fontFamily: "inherit",
    textTransform: "uppercase",
  });

  return (
    <div
      data-living-player-control-bed="1"
      data-destination-id={destinationId}
      data-role={capabilities.role}
      data-max-views={capabilities.maxInternalViewsPerMonitor}
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 4,
        padding: "4px 6px",
        borderRadius: 8,
        border: `1px solid ${accent}44`,
        background: "linear-gradient(180deg, rgba(12,10,24,0.95), rgba(5,5,16,0.92))",
      }}
    >
      {onOpenDesk ? (
        <button
          type="button"
          data-living-os-entry="1"
          onClick={onOpenDesk}
          style={{
            ...btn(false),
            color: accent,
            marginRight: 4,
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
          marginRight: 4,
        }}
        >
          LIVING OS
        </span>
      )}

      {MODE_ORDER.map((mode) =>
        can(mode) ? (
          <button
            key={mode}
            type="button"
            style={btn(workspaceMode === mode)}
            onClick={() => {
              onWorkspaceModeChange?.(mode);
              onCommand?.(mode);
            }}
          >
            {mode}
          </button>
        ) : null,
      )}

      <span style={{ width: 1, height: 14, background: "rgba(255,255,255,0.15)", margin: "0 2px" }} />

      {UNIVERSAL_VIEW_COUNTS.map((n) => (
        <button
          key={n}
          type="button"
          style={btn(viewCount === n, "#FFD700")}
          title={`${n}-view composition (max 8 per monitor)`}
          onClick={() => {
            onViewCountChange(n);
            onCommand?.("VIEW");
          }}
        >
          {n}
        </button>
      ))}

      <span style={{ width: 1, height: 14, background: "rgba(255,255,255,0.15)", margin: "0 2px" }} />

      {(
        [
          ["STATION", "STATION"],
          ["ROOM", "ROOM"],
          ["SOURCE", "SOURCE"],
          ["MIX", "MIX"],
          ["INFO", "INFO"],
          ["PIN", "PIN"],
          ["FULL", "FULL"],
        ] as Array<[LivingPlayerCommand, string]>
      ).map(([cmd, label]) =>
        can(cmd) ? (
          <button
            key={cmd}
            type="button"
            style={btn(false)}
            onClick={() => onCommand?.(cmd)}
          >
            {label}
          </button>
        ) : null,
      )}
    </div>
  );
}
