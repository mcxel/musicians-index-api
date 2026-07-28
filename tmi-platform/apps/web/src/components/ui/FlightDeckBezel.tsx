"use client";

import type { CSSProperties, ReactNode } from "react";
import { getFlightDeckTheme, type FlightDeckThemeId } from "@/registries/eos/ThemeRegistry";

export interface FlightDeckBezelProps {
  title: string;
  children: ReactNode;
  /** ThemeRegistry bezel preset — change once, updates everywhere. */
  themeId?: FlightDeckThemeId;
  headerRight?: ReactNode;
  /** Remove inner padding for full-bleed monitors. */
  flush?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Optional 16:9 aspect ratio lock for monitor bezels. */
  aspectRatio?: string;
}

/**
 * FlightDeckBezel — uniform Obsidian & Gold UI wrapper (Phase 3 Flight Deck).
 * Every monitor, panel, drawer, and rail widget inherits the same visual language.
 */
export default function FlightDeckBezel({
  title,
  children,
  themeId = "obsidian_gold",
  headerRight,
  flush = false,
  className,
  style,
  aspectRatio,
}: FlightDeckBezelProps) {
  const theme = getFlightDeckTheme(themeId);

  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        background: theme.panelBg,
        border: `2px solid ${theme.borderColor}`,
        borderRadius: theme.borderRadius,
        boxShadow: theme.shadow,
        overflow: "hidden",
        ...style,
      }}
    >
      {/* h-6 header strip */}
      <div
        style={{
          height: 24,
          minHeight: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 10px",
          background: theme.headerBg,
          borderBottom: `1px solid ${theme.borderColor}66`,
        }}
      >
        <span
          style={{
            fontSize: 9,
            fontWeight: 900,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: theme.headerText,
          }}
        >
          {title}
        </span>
        {headerRight && <div style={{ display: "flex", alignItems: "center", gap: 6 }}>{headerRight}</div>}
      </div>

      <div
        style={{
          flex: 1,
          position: "relative",
          padding: flush ? 0 : theme.contentPadding,
          aspectRatio: aspectRatio ?? undefined,
          minHeight: aspectRatio ? 0 : undefined,
          overflow: flush ? "hidden" : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
}
