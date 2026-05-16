"use client";

import Link from "next/link";
import { useState } from "react";

type DockAction = "home" | "alerts" | "chain" | "feeds" | "revenue" | "security" | "inbox" | "settings" | "logout";

interface DockButton {
  id: DockAction;
  label: string;
  href?: string;
  color: string;
  count?: number;
}

const DOCK_BUTTONS: DockButton[] = [
  { id: "home",     label: "Home",     href: "/admin",                  color: "border-amber-400/50 text-amber-200 hover:bg-amber-500/20" },
  { id: "chain",    label: "Chain",    href: "#chain-command",           color: "border-violet-400/50 text-violet-200 hover:bg-violet-500/20" },
  { id: "feeds",    label: "Feeds",    href: "#live-feed-router",        color: "border-cyan-400/50 text-cyan-200 hover:bg-cyan-500/20" },
  { id: "security", label: "Security", href: "#sentinel-wall",          color: "border-rose-400/50 text-rose-200 hover:bg-rose-500/20", count: 3 },
  { id: "inbox",    label: "Inbox",    href: "#unified-inbox",          color: "border-fuchsia-400/50 text-fuchsia-200 hover:bg-fuchsia-500/20", count: 3 },
  { id: "revenue",  label: "Revenue",  href: "#revenue-analytics",      color: "border-green-400/50 text-green-200 hover:bg-green-500/20" },
  { id: "alerts",   label: "Alerts",   href: "/platform-status",        color: "border-amber-400/50 text-amber-200 hover:bg-amber-500/20" },
  { id: "settings", label: "Settings", href: "/admin/settings",         color: "border-zinc-500/50 text-zinc-300 hover:bg-zinc-500/20" },
  { id: "logout",   label: "Exit",     href: "/",                       color: "border-red-500/50 text-red-300 hover:bg-red-500/20" },
];

interface OverseerDockProps {
  operatorName?: string;
  operatorRole?: string;
  systemHealth?: number;
}

export default function OverseerDock({
  operatorName = "Big Ace",
  operatorRole = "Platform Director",
  systemHealth = 98,
}: OverseerDockProps) {
  const [lastAction, setLastAction] = useState<string | null>(null);

  return (
    <footer className="sticky bottom-0 z-50 w-full border-t border-amber-400/20 bg-black/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1800px] items-center justify-between gap-3 px-4 py-2">
        {/* Operator identity */}
        <div className="flex shrink-0 items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-amber-400/60 bg-amber-500/15 text-[10px] font-black uppercase text-amber-200">
            {operatorName.slice(0, 2)}
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-amber-200">{operatorName}</p>
            <p className="text-[8px] text-zinc-500">{operatorRole}</p>
          </div>
        </div>

        {/* System health */}
        <div className="hidden items-center gap-2 sm:flex">
          <span className="text-[8px] font-black uppercase text-zinc-500">System</span>
          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/8">
            <div
              className={`h-full rounded-full ${systemHealth >= 95 ? "bg-green-400" : systemHealth >= 80 ? "bg-amber-400" : "bg-red-500"}`}
              style={{ width: `${systemHealth}%` }}
            />
          </div>
          <span className={`text-[9px] font-black ${systemHealth >= 95 ? "text-green-300" : "text-amber-300"}`}>{systemHealth}%</span>
        </div>

        {/* Dock buttons */}
        <nav className="flex flex-wrap items-center gap-1">
          {DOCK_BUTTONS.map((btn) => (
            btn.href ? (
              <Link
                key={btn.id}
                href={btn.href}
                onClick={() => setLastAction(btn.label)}
                className={`relative rounded border px-3 py-1 text-[9px] font-black uppercase tracking-[0.1em] transition ${btn.color}`}
              >
                {btn.label}
                {btn.count ? (
                  <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[7px] font-black text-white">
                    {btn.count}
                  </span>
                ) : null}
              </Link>
            ) : (
              <button
                key={btn.id}
                onClick={() => setLastAction(btn.label)}
                className={`rounded border px-3 py-1 text-[9px] font-black uppercase tracking-[0.1em] transition ${btn.color}`}
              >
                {btn.label}
              </button>
            )
          ))}
        </nav>

        {/* Last action */}
        {lastAction && (
          <p className="hidden shrink-0 text-[8px] text-zinc-500 xl:block">→ {lastAction}</p>
        )}
      </div>
    </footer>
  );
}
