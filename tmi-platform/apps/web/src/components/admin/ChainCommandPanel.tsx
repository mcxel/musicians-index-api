"use client";

import { useState } from "react";
import Link from "next/link";

type CommandCategory = "platform" | "revenue" | "safety" | "bots" | "content";

interface ChainCommand {
  id: string;
  label: string;
  description: string;
  category: CommandCategory;
  route?: string;
  destructive?: boolean;
}

const COMMANDS: ChainCommand[] = [
  { id: "lock-platform",    label: "Lock Platform",        description: "Suspend all live rooms and public actions.", category: "platform", destructive: true },
  { id: "flush-sessions",   label: "Flush Sessions",       description: "Force re-auth across all active users.",     category: "platform", destructive: true },
  { id: "open-boardroom",   label: "Open Boardroom",       description: "Activate the Boardroom Live feed.",          category: "platform", route: "/admin/big-ace" },
  { id: "trigger-payout",   label: "Trigger Artist Payout",description: "Run the pending artist revenue batch.",      category: "revenue" },
  { id: "sponsor-cycle",    label: "Advance Sponsor Cycle",description: "Rotate sponsor slot to next queued brand.",  category: "revenue" },
  { id: "ticket-lockdown",  label: "Ticket Lockdown",      description: "Halt all ticket issuance immediately.",      category: "safety", destructive: true },
  { id: "ban-flood",        label: "Ban Flood Response",   description: "Auto-ban top offenders in flood list.",      category: "safety" },
  { id: "summon-bigace",    label: "Summon Big Ace",       description: "Activate Big Ace in target room.",           category: "bots", route: "/admin/big-ace" },
  { id: "run-sentinels",    label: "Deploy Sentinels",     description: "Push Sentinel bots to all live rooms.",      category: "bots" },
  { id: "publish-issue",    label: "Publish Issue",        description: "Lock and publish Magazine Issue to live.",   category: "content" },
  { id: "clear-feed-cache", label: "Clear Feed Cache",     description: "Purge homepage editorial feed cache.",       category: "content" },
];

const CAT_STYLE: Record<CommandCategory, string> = {
  platform: "border-amber-400/40 text-amber-200",
  revenue:  "border-green-400/40 text-green-200",
  safety:   "border-rose-400/40 text-rose-200",
  bots:     "border-fuchsia-400/40 text-fuchsia-200",
  content:  "border-cyan-400/40 text-cyan-200",
};

const CAT_LABELS: Record<CommandCategory, string> = {
  platform: "Platform",
  revenue:  "Revenue",
  safety:   "Safety",
  bots:     "Bots",
  content:  "Content",
};

const ALL_CATS = Object.keys(CAT_LABELS) as CommandCategory[];

export default function ChainCommandPanel() {
  const [activeCategory, setActiveCategory] = useState<CommandCategory | "all">("all");
  const [fired, setFired] = useState<Set<string>>(new Set());
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const visible = activeCategory === "all"
    ? COMMANDS
    : COMMANDS.filter((c) => c.category === activeCategory);

  function fire(cmd: ChainCommand) {
    if (cmd.destructive && confirmId !== cmd.id) {
      setConfirmId(cmd.id);
      return;
    }
    setConfirmId(null);
    setFired((prev) => new Set(prev).add(cmd.id));
    setTimeout(() => {
      setFired((prev) => { const n = new Set(prev); n.delete(cmd.id); return n; });
    }, 3000);
  }

  return (
    <section className="flex h-full flex-col rounded-xl border border-amber-400/30 bg-black/60 p-3">
      <header className="mb-3">
        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-amber-400">Chain Command</p>
        <p className="text-[11px] font-black uppercase text-white">Platform Directives</p>
      </header>

      {/* Category filter */}
      <div className="mb-3 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => setActiveCategory("all")}
          className={`rounded border px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.1em] transition ${activeCategory === "all" ? "border-white/30 bg-white/10 text-white" : "border-white/10 bg-transparent text-zinc-500 hover:text-zinc-300"}`}
        >
          All
        </button>
        {ALL_CATS.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`rounded border px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.1em] transition ${activeCategory === cat ? `${CAT_STYLE[cat]} bg-white/5` : "border-white/10 bg-transparent text-zinc-500 hover:text-zinc-300"}`}
          >
            {CAT_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Command list */}
      <div className="flex flex-col gap-1.5 overflow-y-auto">
        {visible.map((cmd) => {
          const isFired = fired.has(cmd.id);
          const isConfirm = confirmId === cmd.id;
          return (
            <div
              key={cmd.id}
              className={`rounded border bg-black/40 p-2 transition ${CAT_STYLE[cmd.category].split(" ")[0]}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className={`text-[9px] font-black uppercase ${CAT_STYLE[cmd.category].split(" ")[1]}`}>
                    {cmd.label}
                    {cmd.destructive && (
                      <span className="ml-1.5 rounded border border-red-500/50 bg-red-500/10 px-1 py-0.5 text-[7px] text-red-300">
                        DANGER
                      </span>
                    )}
                  </p>
                  <p className="text-[8px] text-zinc-500">{cmd.description}</p>
                </div>
                <div className="flex flex-shrink-0 gap-1">
                  {cmd.route && (
                    <Link
                      href={cmd.route}
                      className="rounded border border-white/10 bg-black/30 px-2 py-0.5 text-[7px] font-black uppercase tracking-[0.1em] text-zinc-400 hover:border-white/25 hover:text-white"
                    >
                      Open
                    </Link>
                  )}
                  {isConfirm ? (
                    <button
                      type="button"
                      onClick={() => fire(cmd)}
                      className="rounded border border-red-500/60 bg-red-500/15 px-2 py-0.5 text-[7px] font-black uppercase tracking-[0.1em] text-red-300 hover:bg-red-500/25"
                    >
                      Confirm
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fire(cmd)}
                      disabled={isFired}
                      className="rounded border border-white/10 bg-black/30 px-2 py-0.5 text-[7px] font-black uppercase tracking-[0.1em] text-zinc-400 transition hover:border-white/25 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {isFired ? "Sent ✓" : "Fire"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
