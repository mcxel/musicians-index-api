"use client";

/**
 * Canonical dual-monitor geometry from Profiles/tmi_platform_prototype_complete.html
 *
 * Locked: TWO identical 16:9 monitors stacked VERTICALLY inside one bezel.
 * Same width, same height, true aspect-ratio — never side-by-side, never flex 50/50 of parent height.
 *
 * Shared by Observatory (gold) + Fan/Performer Command Center (chrome).
 */

import type { CSSProperties, ReactNode } from "react";

export type DualMonitorBezelVariant = "gold" | "chrome";

export interface CanonicalMonitorPane {
  id: string;
  label?: string;
  children: ReactNode;
}

export interface CanonicalDualMonitorStackProps {
  monitors: CanonicalMonitorPane[];
  variant?: DualMonitorBezelVariant;
  /** Series plate under the bezel top edge */
  seriesLabel?: string;
  style?: CSSProperties;
  /** Optional toolbar above the stack (grid mode, etc.) */
  toolbar?: ReactNode;
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
}: CanonicalDualMonitorStackProps) {
  const bezel = BEZEL[variant];
  const panes = monitors.slice(0, 2);
  while (panes.length < 2) {
    panes.push({
      id: `empty-mon-${panes.length}`,
      label: `MONITOR ${panes.length + 1}`,
      children: (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(255,255,255,0.35)",
            fontSize: 10,
            letterSpacing: "0.12em",
            fontWeight: 800,
          }}
        >
          NO MEDIA
        </div>
      ),
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
          {panes.map((pane, index) => (
            <CanonicalMonitorFrame
              key={pane.id}
              label={pane.label ?? `MONITOR ${index + 1}`}
            >
              {pane.children}
            </CanonicalMonitorFrame>
          ))}
        </div>
      </div>
    </div>
  );
}
