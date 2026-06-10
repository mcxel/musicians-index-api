"use client";

import React from "react";

export const MAG_COLORS = {
  gold:    "#FFD700",
  cyan:    "#00FFFF",
  fuchsia: "#FF2DAA",
  purple:  "#AA2DFF",
  green:   "#00FF88",
  dark:    "#050510",
  // shorthand aliases used by articles/c/[slug]/page.tsx
  GD: "#FFD700",
  CY: "#00FFFF",
  PK: "#FF2DAA",
  PU: "#AA2DFF",
  GN: "#00FF88",
  DT: "#050510",
  TL: "#00CCCC",
  OR: "#FF8C00",
};

export function ConfettiBackground({ count = 20 }: { count?: number }) {
  const items = Array.from({ length: count });
  const colors = [MAG_COLORS.gold, MAG_COLORS.fuchsia, MAG_COLORS.cyan, MAG_COLORS.purple, MAG_COLORS.green];
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      {items.map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 8 + (i % 5) * 4,
            height: 8 + (i % 5) * 4,
            background: colors[i % colors.length],
            clipPath: "polygon(50% 0%,0% 100%,100% 100%)",
            left: `${(i * 13 + 3) % 100}%`,
            top: `${(i * 17 + 5) % 90}%`,
            opacity: 0.12,
            transform: `rotate(${i * 37}deg)`,
          }}
        />
      ))}
    </div>
  );
}

export function GeoBlock({
  children,
  color,
  style,
  bg,
  border,
  shape: _shape,
  height,
  label,
}: {
  children?: React.ReactNode;
  color?: string;
  style?: React.CSSProperties;
  bg?: string;
  border?: string;
  shape?: string;
  height?: number;
  label?: string;
}) {
  const bgColor = bg || (color ? `${color}12` : "#00FFFF12");
  const borderColor = border || color || "#00FFFF";
  return (
    <div
      style={{
        background: bgColor,
        border: `1px solid ${borderColor}33`,
        borderRadius: 8,
        padding: "12px 16px",
        minHeight: height,
        position: "relative",
        ...style,
      }}
    >
      {label && (
        <span style={{ position: "absolute", top: -10, left: 12, background: "#050510", padding: "0 6px", fontSize: 9, fontWeight: 700, color: borderColor, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          {label}
        </span>
      )}
      {children}
    </div>
  );
}

export function MagButton({
  children,
  label,
  href,
  color,
  bg,
  border: _border,
  onClick,
}: {
  children?: React.ReactNode;
  label?: string;
  href?: string;
  color?: string;
  bg?: string;
  border?: string;
  onClick?: () => void;
}) {
  const resolvedColor = color || bg || "#00FFFF";
  const content = children ?? label;
  const btnStyle: React.CSSProperties = {
    display: "inline-block",
    padding: "10px 20px",
    background: `${resolvedColor}18`,
    border: `1.5px solid ${resolvedColor}`,
    borderRadius: 8,
    color: resolvedColor,
    fontWeight: 900,
    fontSize: 11,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    textDecoration: "none",
    cursor: "pointer",
    fontFamily: "var(--font-orbitron, Inter, sans-serif)",
  };
  if (href) return <a href={href} style={btnStyle}>{content}</a>;
  return <button onClick={onClick} style={btnStyle}>{content}</button>;
}

export function MagPill({
  children,
  text,
  color,
  bg,
}: {
  children?: React.ReactNode;
  text?: string;
  color?: string;
  bg?: string;
}) {
  const resolvedColor = color || bg || "#00FFFF";
  const content = children ?? text;
  return (
    <span style={{ display: "inline-block", padding: "3px 10px", background: `${resolvedColor}22`, border: `1px solid ${resolvedColor}55`, borderRadius: 20, fontSize: 9, fontWeight: 700, color: resolvedColor, letterSpacing: "0.1em", textTransform: "uppercase" }}>
      {content}
    </span>
  );
}

export function NeonHead({
  children,
  text,
  color = MAG_COLORS.gold,
  as: Tag = "h1",
  size,
}: {
  children?: React.ReactNode;
  text?: string;
  color?: string;
  as?: "h1" | "h2" | "h3";
  size?: number;
}) {
  const content = children ?? text;
  return (
    <Tag style={{ fontFamily: "var(--font-orbitron, Impact, sans-serif)", color, textShadow: `0 0 20px ${color}88`, fontWeight: 900, letterSpacing: "0.05em", margin: 0, fontSize: size }}>
      {content}
    </Tag>
  );
}
