"use client";
import { motion } from "framer-motion";

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  accent?: "cyan" | "pink" | "purple" | "gold";
  badge?: string;
}

const ACCENT: Record<string, string> = {
  cyan: "#00FFFF",
  pink: "#FF2DAA",
  purple: "#AA2DFF",
  gold: "#FFD700",
};

export default function SectionTitle({
  title,
  subtitle,
  accent = "cyan",
  badge,
}: SectionTitleProps) {
  const color = ACCENT[accent];
  return (
    <div style={{ marginBottom: 20, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: subtitle ? 4 : 0 }}>
          <motion.div
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            style={{ width: 3, height: 18, background: color, borderRadius: 2, boxShadow: `0 0 8px ${color}`, flexShrink: 0 }}
          />
          <h2 style={{ margin: 0, fontSize: 11, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color, textShadow: `0 0 10px ${color}` }}>
            {title}
          </h2>
        </div>
        {subtitle && <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.4)", paddingLeft: 13 }}>{subtitle}</p>}
      </div>
      {badge && (
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color, border: `1px solid ${color}`, borderRadius: 4, padding: "2px 8px" }}>
          {badge}
        </span>
      )}
    </div>
  );
}
