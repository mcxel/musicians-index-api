"use client";
import { motion } from "framer-motion";
import Link from "next/link";

interface RevenueCardProps {
  label: string;
  amount: number;
  currency?: string;
  change?: number;
  changeLabel?: string;
  href?: string;
  icon?: string;
  color?: string;
  compact?: boolean;
}

function formatCents(cents: number): string {
  if (cents >= 100000) return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  return `$${(cents / 100).toFixed(2)}`;
}

export default function RevenueCard({
  label,
  amount,
  change,
  changeLabel = "vs last period",
  href,
  icon = "💰",
  color = "#00FF88",
  compact = false,
}: RevenueCardProps) {
  const isPositive = (change ?? 0) >= 0;
  const changeColor = isPositive ? "#00FF88" : "#FF5555";

  const inner = (
    <div
      role="region"
      aria-label={`${label}: ${formatCents(amount)}`}
      style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${color}20`, borderRadius: compact ? 8 : 12, padding: compact ? "14px 16px" : "20px 22px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <span style={{ fontSize: compact ? 20 : 28, flexShrink: 0 }}>{icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", marginBottom: 4, textTransform: "uppercase" }}>
            {label}
          </div>
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ fontSize: compact ? 20 : 28, fontWeight: 900, color, lineHeight: 1, marginBottom: change !== undefined ? 6 : 0 }}>
            {formatCents(amount)}
          </motion.div>
          {change !== undefined && (
            <div style={{ fontSize: 9, color: changeColor, fontWeight: 700 }}>
              {isPositive ? "▲" : "▼"} {Math.abs(change).toFixed(1)}% {changeLabel}
            </div>
          )}
        </div>
        {href && <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 16, flexShrink: 0 }}>→</span>}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} style={{ textDecoration: "none", display: "block" }} aria-label={`View ${label} details`}>
        {inner}
      </Link>
    );
  }
  return inner;
}
