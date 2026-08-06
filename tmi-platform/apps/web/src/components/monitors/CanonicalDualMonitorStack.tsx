"use client";

/**
 * Canonical dual-monitor geometry from Profiles/tmi_platform_prototype_complete.html
 *
 * Locked: TWO identical 16:9 monitors stacked VERTICALLY inside one bezel.
 * Same width, same height, true aspect-ratio — never side-by-side, never flex 50/50 of parent height.
 *
 * Per-monitor split controls (prototype splitCtrl): □=1  ⬓=2  ⊞=4  ⊟⊟=8
 * Each physical monitor independently switches between 1/2/4/8 sub-panes.
 * 2 monitors × 8 panes max = 16 total mini-monitors.
 *
 * Shared by Observatory (gold) + Fan/Performer Command Center (chrome).
 */

import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";

// Ambient standby loop for panes/cells with no assigned source — same
// convention as MediaMatrixEngine/LiveFeedRouter/CommandCenterMediaStack,
// so an empty monitor reads as "on-air standby," not a dead panel.
const ROSE_FALLBACK_URL =
  process.env.NEXT_PUBLIC_DEFAULT_MONITOR_VIDEO?.trim() ||
  process.env.NEXT_PUBLIC_OBSERVATORY_ROSE_VIDEO_URL?.trim() ||
  "";

function StandbyFill() {
  if (!ROSE_FALLBACK_URL) {
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 5,
          background: "#030318",
        }}
      >
        <span style={{ fontSize: 16, opacity: 0.2 }}>📡</span>
        <span style={{ fontSize: 7, fontWeight: 800, letterSpacing: "0.14em", color: "rgba(255,255,255,0.2)" }}>
          NO MEDIA
        </span>
      </div>
    );
  }
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <video
        src={ROSE_FALLBACK_URL}
        autoPlay
        loop
        muted
        playsInline
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.15), transparent 35%, rgba(0,0,0,0.5) 100%)" }} />
      <div
        style={{
          position: "absolute",
          top: 6,
          left: 6,
          display: "flex",
          alignItems: "center",
          gap: 5,
          padding: "2px 6px",
          borderRadius: 999,
          background: "rgba(0,0,0,0.62)",
          border: "1px solid rgba(255,215,0,0.35)",
        }}
      >
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#FFD700", boxShadow: "0 0 6px #FFD700" }} />
        <span style={{ color: "#fff", fontSize: 7, fontWeight: 900, letterSpacing: "0.1em" }}>STANDBY</span>
      </div>
    </div>
  );
}

export type DualMonitorBezelVariant = "gold" | "chrome";

/** 1 = single view, 2 = side-by-side, 4 = 2×2 quad, 8 = 4×2 octo */
export type MonitorSplitMode = 1 | 2 | 4 | 8;

const SPLIT_ICONS: Record<MonitorSplitMode, string> = { 1: "□", 2: "⬓", 4: "⊞", 8: "⊟⊟" };

export interface CanonicalMonitorPane {
  id: string;
  label?: string;
  /** Content when split = 1 (full frame) */
  children: ReactNode;
  /** Up to 8 content panes shown when split > 1. Falls back to children-repeat if not provided. */
  cells?: ReactNode[];
  /** Override default split mode for this monitor */
  defaultSplit?: MonitorSplitMode;
}

export interface CanonicalDualMonitorStackProps {
  monitors: CanonicalMonitorPane[];
  variant?: DualMonitorBezelVariant;
  /** Series plate under the bezel top edge */
  seriesLabel?: string;
  style?: CSSProperties;
  /** Optional toolbar above the stack (grid mode, etc.) */
  toolbar?: ReactNode;
  /**
   * Show per-monitor split controls (□ ⬓ ⊞ ⊟⊟).
   * Defaults true — matches the prototype's splitCtrl() behavior.
   */
  showSplitControls?: boolean;
}

// ─── Split control bar ────────────────────────────────────────────────────────

function MonitorSplitBar({
  label,
  split,
  onSplitChange,
  accent,
}: {
  label: string;
  split: MonitorSplitMode;
  onSplitChange: (s: MonitorSplitMode) => void;
  accent: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        marginBottom: 6,
        padding: "2px 0",
      }}
    >
      <span style={{ fontSize: 9, color: "#7878AA", fontWeight: 700, letterSpacing: "0.5px", flex: 1 }}>
        {label}
      </span>
      {([1, 2, 4, 8] as MonitorSplitMode[]).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onSplitChange(n)}
          title={`${n === 1 ? "Single" : n === 2 ? "Dual" : n === 4 ? "Quad" : "Octo"} (${n}× split)`}
          style={{
            padding: "3px 10px",
            fontSize: 11,
            fontWeight: 700,
            border: `1px solid ${split === n ? accent : "#1E1E45"}`,
            borderRadius: 4,
            background: split === n ? accent : "#0D0D24",
            color: split === n ? "#fff" : "#7878AA",
            cursor: "pointer",
            fontFamily: "inherit",
            lineHeight: 1,
          }}
        >
          {SPLIT_ICONS[n]}
        </button>
      ))}
      <span style={{ fontSize: 8, color: "#7878AA", marginLeft: 4, whiteSpace: "nowrap" }}>
        {split}× split
      </span>
    </div>
  );
}

// ─── Monitor cell grid ────────────────────────────────────────────────────────

function MonitorCellGrid({
  split,
  children,
  cells,
}: {
  split: MonitorSplitMode;
  children: ReactNode;
  cells?: ReactNode[];
}) {
  if (split === 1) return <>{children}</>;

  const columns = split === 8 ? 4 : 2;
  const filled: ReactNode[] = [];

  for (let i = 0; i < split; i++) {
    filled.push(cells?.[i] ?? <StandbyFill key={`empty-${i}`} />);
  }

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: 1,
        background: "#0a0a1a",
      }}
    >
      {filled.map((cell, i) => (
        <div
          key={i}
          style={{
            position: "relative",
            overflow: "hidden",
            background: "#030318",
            border: "1px solid #1A1A3A",
          }}
        >
          {cell}
        </div>
      ))}
    </div>
  );
}

const BEZEL: Record<
  DualMonitorBezelVariant,
  { outer: CSSProperties; label: CSSProperties }
> = {
  gold: {
    outer: {
      background: "#B8860B",
      padding: 10,
      borderRadius: 10,
      borderTop: "3px solid #FFD700",
      borderLeft: "2px solid #DAA520",
      borderRight: "2px solid #8B6914",
      borderBottom: "3px solid #6B5000",
    },
    label: {
      fontSize: 9,
      fontWeight: 800,
      letterSpacing: "2px",
      color: "#FFD700",
      textAlign: "center",
      padding: "0 0 6px",
      textTransform: "uppercase",
    },
  },
  chrome: {
    outer: {
      background: "#7A7A7A",
      padding: 10,
      borderRadius: 10,
      borderTop: "3px solid #D0D0D0",
      borderLeft: "2px solid #A0A0A0",
      borderRight: "2px solid #505050",
      borderBottom: "3px solid #3A3A3A",
    },
    label: {
      fontSize: 9,
      fontWeight: 800,
      letterSpacing: "2px",
      color: "#C0C0C0",
      textAlign: "center",
      padding: "0 0 6px",
      textTransform: "uppercase",
    },
  },
};

/** Single 16:9 glass — width 100%, aspect-ratio locks height. */
export function CanonicalMonitorFrame({
  label,
  children,
  style,
}: {
  label?: string;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div data-canonical-monitor style={{ width: "100%", ...style }}>
      {label ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 6,
          }}
        >
          <span
            style={{
              fontSize: 10,
              color: "#7878AA",
              fontWeight: 700,
              letterSpacing: "0.5px",
            }}
          >
            {label}
          </span>
        </div>
      ) : null}
      <div
        data-monitor-frame="16x9"
        style={{
          background: "#020210",
          border: "1px solid #1A1A3A",
          borderRadius: 4,
          overflow: "hidden",
          position: "relative",
          aspectRatio: "16 / 9",
          width: "100%",
          flex: "0 0 auto",
          minHeight: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export default function CanonicalDualMonitorStack({
  monitors,
  variant = "gold",
  seriesLabel,
  style,
  toolbar,
  showSplitControls = true,
}: CanonicalDualMonitorStackProps) {
  const bezel = BEZEL[variant];
  const accent = variant === "gold" ? "#FF6B1A" : "#00D4FF";

  // Per-monitor split state: [mon1Split, mon2Split]
  const [splits, setSplits] = useState<[MonitorSplitMode, MonitorSplitMode]>([
    monitors[0]?.defaultSplit ?? 1,
    monitors[1]?.defaultSplit ?? 1,
  ]);

  const setSplit = (index: 0 | 1, mode: MonitorSplitMode) => {
    setSplits((prev) => {
      const next: [MonitorSplitMode, MonitorSplitMode] = [...prev] as [MonitorSplitMode, MonitorSplitMode];
      next[index] = mode;
      return next;
    });
  };

  const panes = monitors.slice(0, 2);
  while (panes.length < 2) {
    panes.push({
      id: `empty-mon-${panes.length}`,
      label: `MONITOR ${panes.length + 1}`,
      children: <StandbyFill />,
    });
  }

  return (
    <div
      data-canonical-dual-monitor-stack
      data-bezel={variant}
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        ...style,
      }}
    >
      {toolbar}
      <div style={bezel.outer}>
        {seriesLabel ? <div style={bezel.label}>{seriesLabel}</div> : null}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            width: "100%",
          }}
        >
          {panes.map((pane, index) => {
            const split = splits[index as 0 | 1];
            const monLabel = pane.label ?? `MONITOR ${index + 1}`;
            return (
              <div key={pane.id} data-canonical-monitor style={{ width: "100%" }}>
                {/* Per-monitor split control bar */}
                {showSplitControls && (
                  <MonitorSplitBar
                    label={monLabel}
                    split={split}
                    onSplitChange={(s) => setSplit(index as 0 | 1, s)}
                    accent={accent}
                  />
                )}
                {/* 16:9 glass */}
                <div
                  data-monitor-frame="16x9"
                  style={{
                    background: "#020210",
                    border: "1px solid #1A1A3A",
                    borderRadius: 4,
                    overflow: "hidden",
                    position: "relative",
                    aspectRatio: "16 / 9",
                    width: "100%",
                    flex: "0 0 auto",
                    minHeight: 0,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      flexDirection: "column",
                      minHeight: 0,
                      overflow: "hidden",
                    }}
                  >
                    <MonitorCellGrid split={split} cells={pane.cells}>
                      {pane.children}
                    </MonitorCellGrid>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
