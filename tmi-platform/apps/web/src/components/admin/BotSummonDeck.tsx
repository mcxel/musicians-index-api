"use client";

import { useState } from "react";

type BotStatus = "ACTIVE" | "STANDBY" | "SUMMONING" | "OFFLINE";

interface BotUnit {
  id: string;
  name: string;
  role: string;
  description: string;
  status: BotStatus;
  accentClass: string;
  badgeClass: string;
  actionLabel: string;
}

const BOTS: BotUnit[] = [
  {
    id: "big-ace",
    name: "Big Ace",
    role: "Platform Director Bot",
    description: "Hosts rooms, manages crown flow, directs fan energy.",
    status: "ACTIVE",
    accentClass: "border-amber-400/50",
    badgeClass: "border-amber-400/60 text-amber-200 bg-amber-500/10",
    actionLabel: "Command",
  },
  {
    id: "sentinel",
    name: "Sentinel Squad",
    role: "Moderation Bots",
    description: "Auto-bans, content flags, spam guard, rate-limit enforcement.",
    status: "ACTIVE",
    accentClass: "border-rose-400/50",
    badgeClass: "border-rose-400/60 text-rose-200 bg-rose-500/10",
    actionLabel: "Dispatch",
  },
  {
    id: "booking",
    name: "Booking Bots",
    role: "Event Booking Automation",
    description: "Slot holds, confirmation flows, venue coordination triggers.",
    status: "STANDBY",
    accentClass: "border-cyan-400/50",
    badgeClass: "border-cyan-400/60 text-cyan-200 bg-cyan-500/10",
    actionLabel: "Summon",
  },
  {
    id: "revenue",
    name: "Revenue Bots",
    role: "Commerce Automation",
    description: "Tip collection, sponsor billing cycles, NFT mint triggers.",
    status: "ACTIVE",
    accentClass: "border-green-400/50",
    badgeClass: "border-green-400/60 text-green-200 bg-green-500/10",
    actionLabel: "Command",
  },
  {
    id: "moderation",
    name: "Moderation Bots",
    role: "Live Safety Layer",
    description: "Chat review, age-gate enforcement, violation escalation.",
    status: "ACTIVE",
    accentClass: "border-violet-400/50",
    badgeClass: "border-violet-400/60 text-violet-200 bg-violet-500/10",
    actionLabel: "Override",
  },
];

const STATUS_DOT: Record<BotStatus, string> = {
  ACTIVE:    "bg-green-400",
  STANDBY:   "bg-amber-400",
  SUMMONING: "bg-cyan-400 animate-pulse",
  OFFLINE:   "bg-zinc-600",
};

const STATUS_LABEL: Record<BotStatus, string> = {
  ACTIVE:    "ACTIVE",
  STANDBY:   "STANDBY",
  SUMMONING: "SUMMONING",
  OFFLINE:   "OFFLINE",
};

export default function BotSummonDeck() {
  const [bots, setBots] = useState(BOTS);
  const [log, setLog] = useState<string[]>([]);

  function summon(id: string) {
    setBots((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        if (b.status === "OFFLINE" || b.status === "STANDBY") {
          setTimeout(() => {
            setBots((curr) =>
              curr.map((x) => x.id === id ? { ...x, status: "ACTIVE" } : x)
            );
          }, 2000);
          return { ...b, status: "SUMMONING" };
        }
        return b;
      })
    );
    const bot = bots.find((b) => b.id === id);
    if (bot) {
      setLog((prev) => [`[${new Date().toLocaleTimeString()}] ${bot.name} — ${bot.actionLabel} issued`, ...prev.slice(0, 7)]);
    }
  }

  const activeCount = bots.filter((b) => b.status === "ACTIVE").length;

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 8px", fontFamily: "'Inter', sans-serif" }}>
      {[
        { name: "Ace", initial: "A" },
        { name: "Micah", initial: "M" },
        { name: "Ali", initial: "Al" },
        { name: "Nova", initial: "N" }
      ].map((bot) => (
        <div key={bot.name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            border: "2px solid #8A2BE2",
            background: "linear-gradient(135deg, #8A2BE2, #DA70D6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 8px rgba(138,43,226,0.3)"
          }}>
            <span style={{ fontSize: 10, fontWeight: 900, color: "#fff" }}>{bot.initial}</span>
          </div>
          <span style={{ fontSize: 8, fontWeight: 900, color: "#ffe9bb", textTransform: "uppercase" }}>{bot.name}</span>
        </div>
      ))}
    </div>
  );
}
