"use client";
/**
 * WorldMiniBadge — Rule 21 (AGENTS.md)
 * Every event card, tile, and live-wall entry MUST show one of these badges.
 * 🌍 WORLD = platform-controlled, bot-hosted flagship event.
 * ⭐ MINI  = qualified-user-created instant event.
 * Omit badge only when event type is genuinely unknown.
 */
import React from "react";

export type EventAuthority = "world" | "mini";

export interface WorldMiniBadgeProps {
  authority: EventAuthority;
  size?: "xs" | "sm" | "md";
  className?: string;
  style?: React.CSSProperties;
}

const SIZE = {
  xs: { fontSize: 9,  padding: "1px 6px",  gap: 2 },
  sm: { fontSize: 10, padding: "2px 8px",  gap: 3 },
  md: { fontSize: 12, padding: "3px 10px", gap: 4 },
};

export function WorldMiniBadge({ authority, size = "sm", className, style }: WorldMiniBadgeProps) {
  const isWorld = authority === "world";
  const sz = SIZE[size];

  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: sz.gap,
        padding: sz.padding,
        borderRadius: 999,
        background: isWorld ? "rgba(0,255,255,0.12)" : "rgba(255,215,0,0.12)",
        border: `1px solid ${isWorld ? "#00FFFF" : "#FFD700"}44`,
        color: isWorld ? "#00FFFF" : "#FFD700",
        fontSize: sz.fontSize,
        fontWeight: 900,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        lineHeight: 1.4,
        whiteSpace: "nowrap",
        flexShrink: 0,
        ...style,
      }}
    >
      {isWorld ? "🌍" : "⭐"}&nbsp;{isWorld ? "WORLD" : "MINI"}
    </span>
  );
}

/** Derive authority from a boolean or string flag. */
export function resolveAuthority(isMini?: boolean | null, isWorld?: boolean | null): EventAuthority | null {
  if (isWorld) return "world";
  if (isMini) return "mini";
  return null;
}
