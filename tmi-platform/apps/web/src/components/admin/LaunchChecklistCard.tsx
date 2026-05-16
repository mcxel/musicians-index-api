"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export type ChecklistItemStatus = "done" | "in_progress" | "pending" | "blocked";

export interface ChecklistItem {
  id: string;
  label: string;
  href?: string;
  status: ChecklistItemStatus;
  note?: string;
}

interface LaunchChecklistCardProps {
  title?: string;
  items: ChecklistItem[];
  compact?: boolean;
}

const STATUS_CONFIG: Record<ChecklistItemStatus, { icon: string; color: string; label: string }> = {
  done:        { icon: "✅", color: "#00FF88", label: "DONE"        },
  in_progress: { icon: "🔄", color: "#00FFFF", label: "IN PROGRESS" },
  pending:     { icon: "⏳", color: "#FFD700", label: "PENDING"     },
  blocked:     { icon: "🚫", color: "#FF5555", label: "BLOCKED"     },
};

export default function LaunchChecklistCard({ title = "LAUNCH CHECKLIST", items, compact = false }: LaunchChecklistCardProps) {
  const [expanded, setExpanded] = useState(!compact);

  const doneCount = items.filter(i => i.status === "done").length;
  const pct       = Math.round((doneCount / items.length) * 100);
  const allDone   = doneCount === items.length;

  return (
    <div
      role="region"
      aria-label="Launch checklist"
      style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${allDone ? "rgba(0,255,136,0.3)" : "rgba(255,255,255,0.08)"}`, borderRadius: 12, overflow: "hidden" }}>

      <button
        onClick={() => setExpanded(e => !e)}
        aria-expanded={expanded}
        style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", background: "none", border: "none", cursor: "pointer", color: "#fff" }}>
        <span style={{ fontSize: 18 }}>{allDone ? "🚀" : "📋"}</span>
        <div style={{ flex: 1, textAlign: "left" }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>{title}</div>
          <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{ height: "100%", background: allDone ? "#00FF88" : "linear-gradient(90deg,#00FFFF,#FF2DAA)", borderRadius: 2 }} />
          </div>
        </div>
        <span style={{ fontSize: 10, fontWeight: 800, color: allDone ? "#00FF88" : "rgba(255,255,255,0.4)", flexShrink: 0 }}>
          {doneCount}/{items.length}
        </span>
        <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}>{expanded ? "▲" : "▼"}</span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: "hidden" }}>
            <div style={{ padding: "0 18px 14px", display: "flex", flexDirection: "column", gap: 2 }}>
              {items.map(item => {
                const cfg = STATUS_CONFIG[item.status];
                const inner = (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <span style={{ fontSize: 14, flexShrink: 0 }}>{cfg.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: item.status === "done" ? "rgba(255,255,255,0.5)" : "#fff", textDecoration: item.status === "done" ? "line-through" : "none", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {item.label}
                      </div>
                      {item.note && (
                        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)" }}>{item.note}</div>
                      )}
                    </div>
                    <span style={{ fontSize: 7, fontWeight: 800, letterSpacing: "0.08em", color: cfg.color, flexShrink: 0 }}>
                      {cfg.label}
                    </span>
                  </div>
                );
                return (
                  <div key={item.id}>
                    {item.href ? (
                      <Link href={item.href} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
                        {inner}
                      </Link>
                    ) : inner}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
