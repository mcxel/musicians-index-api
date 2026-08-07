"use client";

/**
 * Overseer quick-control row: ops pills ending at APPROVE QUEUE,
 * then inline Command Switcher (in-container views — no dead-page navigation).
 */

import type { CSSProperties } from "react";
import type { OverseerCenterViewId } from "@/components/admin/overseer/OverseerCommandViews";

type OpsActionId =
  | "quick-dock"
  | "alerts"
  | "chain-pulse"
  | "start-meeting"
  | "summon"
  | "approve-queue";

type CommandAction = {
  id: OverseerCenterViewId;
  label: string;
  accent: string;
};

const OPS_PILLS: { id: OpsActionId; label: string; accent: string }[] = [
  { id: "quick-dock", label: "Quick Dock", accent: "#FFD700" },
  { id: "alerts", label: "Alerts", accent: "#FF6B8A" },
  { id: "chain-pulse", label: "Chain Pulse", accent: "#AA2DFF" },
  { id: "start-meeting", label: "Start Meeting", accent: "#00FFFF" },
  { id: "summon", label: "Summon", accent: "#FF2DAA" },
  { id: "approve-queue", label: "Approve Queue", accent: "#00FF88" },
];

const COMMAND_SWITCHER: CommandAction[] = [
  { id: "observatory", label: "Observatory", accent: "#00FFFF" },
  { id: "runtime-check", label: "Runtime Check", accent: "#00FF88" },
  { id: "certification", label: "Certification", accent: "#FFD700" },
  { id: "global-pulse", label: "Global Pulse", accent: "#AA2DFF" },
  { id: "venue-health", label: "Venue Health", accent: "#00FF88" },
  { id: "dynamics", label: "Dynamics", accent: "#FF2DAA" },
];

export type OverseerQuickControlRowProps = {
  activeView: OverseerCenterViewId;
  onSelectView: (view: OverseerCenterViewId) => void;
  onOpsAction?: (action: OpsActionId) => void;
};

function pillStyle(active: boolean, accent: string): CSSProperties {
  return {
    borderRadius: 999,
    border: `1px solid ${active ? accent : `${accent}55`}`,
    background: active ? `${accent}22` : "rgba(0,0,0,0.35)",
    color: active ? accent : "rgba(255,255,255,0.72)",
    padding: "6px 11px",
    fontSize: 9,
    fontWeight: 900,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    cursor: "pointer",
    fontFamily: "inherit",
    whiteSpace: "nowrap",
    boxShadow: active ? `0 0 10px ${accent}40` : "none",
  };
}

export default function OverseerQuickControlRow({
  activeView,
  onSelectView,
  onOpsAction,
}: OverseerQuickControlRowProps) {
  const handleOps = (id: OpsActionId) => {
    if (id === "quick-dock") {
      onSelectView("media");
      onOpsAction?.(id);
      return;
    }
    if (id === "approve-queue") {
      onSelectView("approve-queue");
      onOpsAction?.(id);
      return;
    }
    onOpsAction?.(id);
  };

  return (
    <div
      data-overseer-quick-control-row
      style={{
        position: "relative",
        zIndex: 90,
        border: "1px solid rgba(255,215,0,0.28)",
        borderRadius: 10,
        background: "linear-gradient(180deg, rgba(43,24,34,0.92), rgba(12,6,14,0.96))",
        padding: "8px 10px",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 6,
      }}
    >
      <span
        style={{
          fontSize: 8,
          fontWeight: 900,
          letterSpacing: "0.16em",
          color: "rgba(255,215,0,0.65)",
          marginRight: 2,
        }}
      >
        QUICK DOCK
      </span>

      {OPS_PILLS.map((pill) => {
        const active =
          (pill.id === "quick-dock" && activeView === "media") ||
          (pill.id === "approve-queue" && activeView === "approve-queue");
        return (
          <button
            key={pill.id}
            type="button"
            onClick={() => handleOps(pill.id)}
            style={pillStyle(active, pill.accent)}
          >
            {pill.label}
          </button>
        );
      })}

      <span
        aria-hidden
        style={{
          width: 1,
          alignSelf: "stretch",
          minHeight: 22,
          background: "rgba(255,215,0,0.35)",
          margin: "0 4px",
        }}
      />

      <span
        style={{
          fontSize: 8,
          fontWeight: 900,
          letterSpacing: "0.16em",
          color: "rgba(0,255,255,0.7)",
        }}
      >
        COMMAND
      </span>

      {COMMAND_SWITCHER.map((cmd) => (
        <button
          key={cmd.id}
          type="button"
          onClick={() => onSelectView(cmd.id)}
          style={pillStyle(activeView === cmd.id, cmd.accent)}
        >
          {cmd.label}
        </button>
      ))}
    </div>
  );
}
