"use client";

/**
 * Drawer bezel chrome — texture language from CanonicalDualMonitorStack /
 * Profiles/tmi_platform_prototype_complete.html. Enrich drawer panels only;
 * does not replace dual 16:9 monitor geometry.
 */

import type { CSSProperties, ReactNode } from "react";
import type { DualMonitorBezelVariant } from "@/components/monitors/CanonicalDualMonitorStack";

const BEZEL_OUTER: Record<DualMonitorBezelVariant, CSSProperties> = {
  gold: {
    background: "linear-gradient(165deg, #C9A227 0%, #B8860B 35%, #8B6914 70%, #6B5000 100%)",
    padding: 8,
    borderRadius: 12,
    borderTop: "3px solid #FFD700",
    borderLeft: "2px solid #DAA520",
    borderRight: "2px solid #8B6914",
    borderBottom: "4px solid #4A3800",
    boxShadow: "inset 0 1px 0 rgba(255,215,0,0.35), 0 8px 28px rgba(0,0,0,0.45)",
  },
  chrome: {
    background: "linear-gradient(165deg, #B0B0B0 0%, #7A7A7A 40%, #555 75%, #3A3A3A 100%)",
    padding: 8,
    borderRadius: 12,
    borderTop: "3px solid #E8E8E8",
    borderLeft: "2px solid #A0A0A0",
    borderRight: "2px solid #505050",
    borderBottom: "4px solid #2A2A2A",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 8px 28px rgba(0,0,0,0.45)",
  },
};

export interface DrawerBezelChromeProps {
  children: ReactNode;
  variant?: DualMonitorBezelVariant;
  seriesLabel?: string;
  accentColor?: string;
  style?: CSSProperties;
}

export default function DrawerBezelChrome({
  children,
  variant = "chrome",
  seriesLabel,
  accentColor,
  style,
}: DrawerBezelChromeProps) {
  const labelColor = accentColor ?? (variant === "gold" ? "#FFD700" : "#C0C0C0");

  return (
    <div data-drawer-bezel={variant} style={{ ...BEZEL_OUTER[variant], ...style }}>
      {seriesLabel ? (
        <div
          style={{
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: "0.18em",
            color: labelColor,
            textAlign: "center",
            padding: "0 0 6px",
            textTransform: "uppercase",
            textShadow: "0 1px 2px rgba(0,0,0,0.5)",
          }}
        >
          {seriesLabel}
        </div>
      ) : null}
      <div
        style={{
          background: "linear-gradient(180deg, #0a0a18 0%, #050510 55%, #030208 100%)",
          border: "1px solid rgba(26,26,58,0.95)",
          borderRadius: 6,
          overflow: "hidden",
          boxShadow: "inset 0 0 40px rgba(0,0,0,0.55)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
