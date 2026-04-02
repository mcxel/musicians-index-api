"use client";
import React from "react";
import { motion } from "framer-motion";

interface CardProps {
  children: React.ReactNode;
  glow?: "cyan" | "pink" | "purple" | "gold" | "none";
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  hover?: boolean;
}

const GLOW_COLORS: Record<string, string> = {
  cyan: "rgba(0,255,255,0.25)",
  pink: "rgba(255,45,170,0.25)",
  purple: "rgba(170,45,255,0.25)",
  gold: "rgba(255,215,0,0.25)",
  none: "transparent",
};

const BORDER_COLORS: Record<string, string> = {
  cyan: "rgba(0,255,255,0.35)",
  pink: "rgba(255,45,170,0.35)",
  purple: "rgba(170,45,255,0.35)",
  gold: "rgba(255,215,0,0.35)",
  none: "rgba(255,255,255,0.08)",
};

export default function Card({
  children,
  glow = "cyan",
  className,
  style,
  onClick,
  hover = false,
}: CardProps) {
  const borderColor = BORDER_COLORS[glow];
  const glowColor = GLOW_COLORS[glow];

  return (
    <motion.div
      onClick={onClick}
      whileHover={hover ? { scale: 1.02, y: -2 } : undefined}
      transition={{ duration: 0.2 }}
      className={className}
      style={{
        background: "linear-gradient(135deg, #0A0A12 0%, #0D0D1C 100%)",
        border: `1px solid ${borderColor}`,
        borderRadius: 10,
        padding: "20px 24px",
        marginBottom: 16,
        color: "white",
        position: "relative",
        overflow: "hidden",
        boxShadow: `0 0 20px ${glowColor}, inset 0 0 20px rgba(0,0,0,0.6)`,
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >
      {/* Corner accents */}
      <span style={{
        position: "absolute", top: 0, left: 0,
        width: 12, height: 12,
        borderTop: `2px solid ${borderColor}`,
        borderLeft: `2px solid ${borderColor}`,
      }} />
      <span style={{
        position: "absolute", top: 0, right: 0,
        width: 12, height: 12,
        borderTop: `2px solid ${borderColor}`,
        borderRight: `2px solid ${borderColor}`,
      }} />
      <span style={{
        position: "absolute", bottom: 0, left: 0,
        width: 12, height: 12,
        borderBottom: `2px solid ${borderColor}`,
        borderLeft: `2px solid ${borderColor}`,
      }} />
      <span style={{
        position: "absolute", bottom: 0, right: 0,
        width: 12, height: 12,
        borderBottom: `2px solid ${borderColor}`,
        borderRight: `2px solid ${borderColor}`,
      }} />
      {children}
    </motion.div>
  );
}
