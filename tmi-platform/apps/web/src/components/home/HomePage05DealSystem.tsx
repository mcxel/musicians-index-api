"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Link from "next/link";

type Deal = {
  id: string;
  type: "brand" | "venue" | "sponsorship" | "feature";
  brand: string;
  value: string;
  status: "new" | "expiring" | "active";
  accent: string;
  href: string;
};

const DEALS: Deal[] = [
  { id: "d1", type: "brand",       brand: "SoundWave Audio", value: "$4,200 / mo",  status: "new",      accent: "#FFD700", href: "/advertise" },
  { id: "d2", type: "venue",       brand: "TMI Arena",        value: "$1,800 / show", status: "expiring", accent: "#00FFFF", href: "/venues" },
  { id: "d3", type: "sponsorship", brand: "Crown Energy",     value: "$9,500 deal",   status: "active",   accent: "#FF6B35", href: "/advertise" },
  { id: "d4", type: "feature",     brand: "BeatVault Pro",   value: "$650 placement", status: "new",      accent: "#FF2DAA", href: "/advertise" },
];

const TYPE_ICONS: Record<Deal["type"], string> = {
  brand: "🏷️", venue: "🏟️", sponsorship: "⭐", feature: "🎯",
};

const STATUS_COLORS: Record<Deal["status"], string> = {
  new: "#00FF88", expiring: "#FFD700", active: "#00FFFF",
};

export default function HomePage05DealSystem() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div>
      <div style={{ fontSize: 6, fontWeight: 900, letterSpacing: "0.24em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase", marginBottom: 6 }}>
        CREATOR DEALS
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {DEALS.map((deal) => (
          <motion.div
            key={deal.id}
            layout
            style={{
              borderRadius: 8,
              border: `1px solid ${deal.accent}2a`,
              background: expanded === deal.id ? `${deal.accent}0c` : "rgba(0,0,0,0.35)",
              overflow: "hidden",
            }}
          >
            <button
              type="button"
              onClick={() => setExpanded(expanded === deal.id ? null : deal.id)}
              style={{
                width: "100%", background: "none", border: "none", cursor: "pointer",
                padding: "7px 10px",
                display: "flex", alignItems: "center", gap: 8,
              }}
            >
              <span style={{ fontSize: 12, flexShrink: 0 }}>{TYPE_ICONS[deal.type]}</span>
              <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                <div style={{ fontSize: 9, fontWeight: 900, color: "#fff" }}>{deal.brand}</div>
                <div style={{ fontSize: 7, color: deal.accent }}>{deal.value}</div>
              </div>
              {/* Status pulse */}
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.4, repeat: Infinity }}
                style={{ width: 6, height: 6, borderRadius: "50%", background: STATUS_COLORS[deal.status], flexShrink: 0 }}
              />
              <span style={{ fontSize: 6, fontWeight: 900, color: STATUS_COLORS[deal.status], letterSpacing: "0.12em", textTransform: "uppercase", flexShrink: 0 }}>
                {deal.status}
              </span>
            </button>

            <AnimatePresence>
              {expanded === deal.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  style={{ overflow: "hidden" }}
                >
                  <div style={{ padding: "0 10px 8px", display: "flex", gap: 6 }}>
                    <Link href={deal.href} style={{ textDecoration: "none" }}>
                      <motion.span
                        whileHover={{ scale: 1.05 }}
                        style={{
                          padding: "4px 12px", borderRadius: 999,
                          background: deal.accent, color: "#000",
                          fontSize: 6, fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase",
                        }}
                      >
                        Accept Deal
                      </motion.span>
                    </Link>
                    <Link href="/advertise" style={{ textDecoration: "none" }}>
                      <span style={{ padding: "4px 10px", borderRadius: 999, border: `1px solid ${deal.accent}44`, fontSize: 6, fontWeight: 700, color: deal.accent, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                        Negotiate
                      </span>
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
