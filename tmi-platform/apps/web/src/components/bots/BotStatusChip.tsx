"use client";
import { motion } from "framer-motion";
import type { BotDef, BotStatus } from "@/lib/botRegistry";

interface Props {
  bot: BotDef;
  status?: BotStatus;
  compact?: boolean;
}

const STATUS_COLOR: Record<BotStatus, string> = {
  ACTIVE: "#00FF88",
  IDLE:   "#FFD700",
  ALERT:  "#FF3C3C",
  OFFLINE:"#444",
};

export default function BotStatusChip({ bot, status = "ACTIVE", compact = false }: Props) {
  const dot = STATUS_COLOR[status];
  return (
    <motion.div
      whileHover={{ scale: 1.04, y: -1 }}
      title={bot.description}
      style={{
        display: "flex", alignItems: "center", gap: compact ? 5 : 7,
        background: `${bot.color}12`,
        border: `1px solid ${bot.color}30`,
        borderRadius: 20,
        padding: compact ? "4px 9px" : "5px 12px",
        cursor: "default",
        userSelect: "none",
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: compact ? 11 : 13 }}>{bot.icon}</span>
      {!compact && (
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: bot.color, textTransform: "uppercase" }}>
          {bot.name}
        </span>
      )}
      <motion.span
        animate={{ opacity: status === "ACTIVE" ? [1, 0.3, 1] : 1 }}
        transition={{ duration: 1.8, repeat: status === "ACTIVE" ? Infinity : 0 }}
        style={{ width: 5, height: 5, borderRadius: "50%", background: dot, flexShrink: 0 }}
      />
    </motion.div>
  );
}
