"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getVisibleBots, getSurfaceBotCount, type SurfaceKey } from "@/lib/botRegistry";
import BotStatusChip from "./BotStatusChip";

interface Props { surface: SurfaceKey; defaultOpen?: boolean; }

export default function BotConsole({ surface, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const bots = getVisibleBots(surface);
  const counts = getSurfaceBotCount(surface);
  const sentinelBots = bots.filter(b => b.role === "SENTINEL");
  const funcBots = bots.filter(b => b.role !== "SENTINEL");

  return (
    <div style={{ margin: "12px 0 0" }}>
      {/* Toggle bar */}
      <motion.button
        whileHover={{ opacity: 0.85 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", gap: 10, width: "100%",
          background: "rgba(0,255,255,0.04)", border: "1px solid rgba(0,255,255,0.12)",
          borderRadius: open ? "8px 8px 0 0" : 8, padding: "7px 14px",
          cursor: "pointer", color: "white",
        }}
      >
        <motion.span
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ fontSize: 10, color: "#00FFFF" }}
        >▶</motion.span>
        <span style={{ fontSize: 9, letterSpacing: "0.18em", color: "#00FFFF", fontWeight: 800, textTransform: "uppercase" }}>
          Bot Console
        </span>
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginLeft: 4 }}>
          {counts.total} bots · {counts.visible} visible · {counts.sentinel} sentinel
        </span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <span style={{ fontSize: 8, color: "#00FF88", fontWeight: 700 }}>● ACTIVE</span>
        </div>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{
              background: "rgba(0,0,0,0.35)", border: "1px solid rgba(0,255,255,0.1)",
              borderTop: "none", borderRadius: "0 0 8px 8px", padding: "12px 14px",
            }}>
              {/* Functional bots */}
              {funcBots.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 8, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", marginBottom: 7, fontWeight: 700 }}>
                    ACTIVE BOTS
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {funcBots.map(b => <BotStatusChip key={b.id} bot={b} status="ACTIVE" />)}
                  </div>
                </div>
              )}
              {/* Sentinel bots */}
              {sentinelBots.length > 0 && (
                <div>
                  <div style={{ fontSize: 8, letterSpacing: "0.15em", color: "rgba(255,60,60,0.6)", marginBottom: 7, fontWeight: 700 }}>
                    SENTINEL LAYER
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {sentinelBots.map(b => <BotStatusChip key={b.id} bot={b} status="ACTIVE" />)}
                  </div>
                </div>
              )}
              {/* Background agent count */}
              <div style={{ marginTop: 10, fontSize: 9, color: "rgba(255,255,255,0.2)" }}>
                +{counts.background} background agents running silently
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
