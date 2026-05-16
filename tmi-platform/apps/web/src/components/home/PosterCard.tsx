"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export type PosterCardSize = "sm" | "md" | "lg";

type PosterCardProps = {
  title: string;
  subtitle?: string;
  kicker?: string;
  badge?: string;
  badgeColor?: string;
  accentColor?: string;
  icon?: string;
  ctaLabel?: string;
  ctaHref: string;
  meta?: string;
  size?: PosterCardSize;
};

export default function PosterCard({
  title,
  subtitle,
  kicker,
  badge,
  badgeColor = "#FF2DAA",
  accentColor = "#FF2DAA",
  icon,
  ctaLabel,
  ctaHref,
  meta,
  size = "md",
}: PosterCardProps) {
  const minHeight = size === "lg" ? 160 : size === "md" ? 120 : 90;
  const titleSize = size === "lg" ? 20 : size === "md" ? 16 : 13;

  return (
    <Link href={ctaHref} style={{ textDecoration: "none", display: "block" }}>
      <motion.div
        whileHover={{ scale: 1.01 }}
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 12,
          border: `1.5px solid ${accentColor}33`,
          background: `linear-gradient(135deg, ${accentColor}10 0%, rgba(0,0,0,0) 100%)`,
          padding: "16px 16px 14px",
          minHeight,
        }}
      >
        {/* Backdrop glow */}
        <div style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(ellipse 80% 60% at 50% 30%, ${accentColor}14 0%, transparent 70%)`,
          pointerEvents: "none",
        }} />

        {/* Icon watermark */}
        {icon && (
          <div style={{
            position: "absolute", right: 12, bottom: 8,
            fontSize: size === "lg" ? 60 : 44, opacity: 0.10,
            filter: `drop-shadow(0 0 8px ${accentColor}44)`,
            pointerEvents: "none",
          }}>
            {icon}
          </div>
        )}

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Kicker + badge row */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
            {kicker && (
              <span style={{
                fontSize: 6, fontWeight: 900, letterSpacing: "0.28em",
                color: accentColor, textTransform: "uppercase",
              }}>
                {kicker}
              </span>
            )}
            {badge && (
              <span style={{
                padding: "1px 7px", borderRadius: 999,
                border: `1px solid ${badgeColor}55`, background: `${badgeColor}14`,
                fontSize: 6, fontWeight: 900, letterSpacing: "0.2em",
                color: badgeColor, textTransform: "uppercase",
              }}>
                {badge}
              </span>
            )}
          </div>

          {/* Title */}
          <div style={{
            fontSize: titleSize, fontWeight: 900, color: "#fff",
            letterSpacing: "0.04em", lineHeight: 1.2,
            textShadow: `0 0 20px ${accentColor}44`,
            textTransform: "uppercase",
          }}>
            {title}
          </div>

          {/* Subtitle */}
          {subtitle && (
            <div style={{
              fontSize: 9, color: "rgba(255,255,255,0.5)",
              marginTop: 4, lineHeight: 1.4,
            }}>
              {subtitle}
            </div>
          )}

          {/* Meta + CTA row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10, flexWrap: "wrap", gap: 6 }}>
            {meta && (
              <span style={{ fontSize: 7, color: "rgba(255,255,255,0.38)", fontWeight: 600 }}>
                {meta}
              </span>
            )}
            {ctaLabel && (
              <span style={{
                fontSize: 7, fontWeight: 900, letterSpacing: "0.16em",
                color: accentColor, textTransform: "uppercase",
              }}>
                {ctaLabel} →
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
