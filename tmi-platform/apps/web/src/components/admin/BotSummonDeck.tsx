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
    <section className="flex h-full flex-col rounded-xl border border-fuchsia-400/30 bg-black/60 p-3">
      <header className="mb-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-fuchsia-400">Bot Summon Deck</p>
          <p className="text-[11px] font-black uppercase text-white">Unit Command Center</p>
        </div>
        <span className="rounded border border-green-400/50 bg-green-500/10 px-2 py-0.5 text-[9px] font-black uppercase text-green-300">
          {activeCount}/{bots.length} ACTIVE
        </span>
      </header>

      <div className="flex flex-col gap-2 overflow-y-auto">
        {bots.map((bot) => (
          <div key={bot.id} className={`rounded-lg border bg-black/50 p-2.5 ${bot.accentClass}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="mb-0.5 flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${STATUS_DOT[bot.status]}`} />
                  <p className="text-[10px] font-black uppercase text-white">{bot.name}</p>
                  <span className={`rounded border px-1.5 py-0.5 text-[8px] font-black uppercase ${bot.badgeClass}`}>
                    {STATUS_LABEL[bot.status]}
                  </span>
                </div>
                <p className="mb-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-zinc-400">{bot.role}</p>
                <p className="text-[8px] text-zinc-500">{bot.description}</p>
              </div>
              <button
                type="button"
                onClick={() => summon(bot.id)}
                disabled={bot.status === "SUMMONING" || bot.status === "ACTIVE"}
                className="flex-shrink-0 rounded border border-white/15 bg-white/5 px-2 py-1 text-[8px] font-black uppercase tracking-[0.12em] text-zinc-300 transition hover:border-white/30 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {bot.status === "SUMMONING" ? "…" : bot.actionLabel}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Command log */}
      {log.length > 0 && (
        <div className="mt-2 rounded border border-white/5 bg-black/40 px-2 py-1.5">
          <p className="mb-1 text-[8px] font-black uppercase tracking-[0.14em] text-zinc-500">Command Log</p>
          {log.map((entry, i) => (
            <p key={i} className="text-[8px] text-zinc-500">{entry}</p>
          ))}
        </div>
      )}
    </section>
  );
}
