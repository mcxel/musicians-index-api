"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getVisibleBots, getSentinelBots, type PageSurface, type BotDefinition, type BotStatus } from "@/lib/bots/botRegistry";

const STATUS_COLOR: Record<BotStatus, string> = {
  ACTIVE:  "#00FF88",
  IDLE:    "#FFD700",
  ALERT:   "#FF5555",
  OFFLINE: "#666",
};

interface BotDutyMonitorProps {
  surface: PageSurface;
  compact?: boolean;
  showSentinelOnly?: boolean;
}

export default function BotDutyMonitor({ surface, compact = false, showSentinelOnly = false }: BotDutyMonitorProps) {
  const [bots, setBots] = useState<BotDefinition[]>([]);
  const [expanded, setExpanded] = useState(!compact);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const list = showSentinelOnly ? getSentinelBots(surface) : getVisibleBots(surface);
    setBots(list);
  }, [surface, showSentinelOnly]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(p => !p);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const activeCount = bots.filter(b => b.status === "ACTIVE").length;
  const alertCount  = bots.filter(b => b.status === "ALERT").length;

  if (bots.length === 0) return null;

  return (
    <div
      role="region"
      aria-label={`Bot duty monitor for ${surface}`}
      style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, overflow: "hidden", fontSize: 10 }}>

      <button
        onClick={() => setExpanded(e => !e)}
        aria-expanded={expanded}
        style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: compact ? "8px 12px" : "10px 14px", background: "none", border: "none", cursor: "pointer", color: "#fff" }}>
        <motion.span animate={{ scale: pulse ? 1.2 : 1 }} transition={{ duration: 0.4 }} style={{ fontSize: 14 }}>🤖</motion.span>
        <span style={{ flex: 1, textAlign: "left", fontWeight: 800, letterSpacing: "0.1em", color: "rgba(255,255,255,0.7)", fontSize: 9 }}>
          BOT DUTY — {surface.replace(/_/g, " ")}
        </span>
        <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {alertCount > 0 && (
            <span style={{ background: "#FF5555", color: "#fff", borderRadius: 4, padding: "1px 5px", fontWeight: 800, fontSize: 8 }}>
              {alertCount} ALERT
            </span>
          )}
          <span style={{ background: "rgba(0,255,136,0.15)", color: "#00FF88", borderRadius: 4, padding: "1px 5px", fontWeight: 800, fontSize: 8 }}>
            {activeCount}/{bots.length} ACTIVE
          </span>
          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}>{expanded ? "▲" : "▼"}</span>
        </span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: "hidden" }}>
            <div style={{ padding: compact ? "6px 12px 10px" : "8px 14px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
              {bots.map(bot => (
                <div key={bot.id} role="listitem" aria-label={`${bot.name}: ${bot.status}`}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <span style={{ fontSize: 14, flexShrink: 0 }}>{bot.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: "rgba(255,255,255,0.8)", fontSize: 9, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {bot.name}
                    </div>
                    {!compact && (
                      <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {bot.description}
                      </div>
                    )}
                  </div>
                  <span style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                    <motion.span
                      animate={{ opacity: bot.status === "ACTIVE" ? [1, 0.4, 1] : 1 }}
                      transition={{ duration: 1.5, repeat: bot.status === "ACTIVE" ? Infinity : 0 }}
                      style={{ width: 6, height: 6, borderRadius: "50%", background: STATUS_COLOR[bot.status], display: "inline-block" }} />
                    <span style={{ fontSize: 7, fontWeight: 800, letterSpacing: "0.05em", color: STATUS_COLOR[bot.status] }}>
                      {bot.status}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
