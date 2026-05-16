"use client";

import { useState } from "react";

type LinkStatus = "CONNECTED" | "EXPIRED" | "MISSING" | "PENDING";

interface AccountLink {
  id: string;
  label: string;
  provider: string;
  identifier: string;
  status: LinkStatus;
  lastSynced: string;
  accentClass: string;
}

const LINKS: AccountLink[] = [
  { id: "stripe",    label: "Stripe",          provider: "payments",  identifier: "acct_1PXk…aBcD", status: "CONNECTED", lastSynced: "2m ago",   accentClass: "border-violet-400/40" },
  { id: "paypal",    label: "PayPal",           provider: "payments",  identifier: "berntout@tmi.io", status: "CONNECTED", lastSynced: "5m ago",   accentClass: "border-blue-400/40" },
  { id: "meta",      label: "Meta Business",    provider: "ads",       identifier: "pg_1922…FF2",    status: "EXPIRED",   lastSynced: "3d ago",   accentClass: "border-rose-400/40" },
  { id: "google-ads",label: "Google Ads",       provider: "ads",       identifier: "cx_4482…K9J",    status: "CONNECTED", lastSynced: "1h ago",   accentClass: "border-amber-400/40" },
  { id: "vercel",    label: "Vercel Hosting",   provider: "hosting",   identifier: "tmi-platform.vercel.app",  status: "CONNECTED", lastSynced: "12m ago",  accentClass: "border-cyan-400/40" },
  { id: "domain",    label: "Domain Authority", provider: "domains",   identifier: "themusicianindex.com",     status: "CONNECTED", lastSynced: "1h ago",   accentClass: "border-emerald-400/40" },
  { id: "ticket",    label: "Ticket Authority", provider: "ticketing", identifier: "/api/tickets — active",   status: "CONNECTED", lastSynced: "just now", accentClass: "border-amber-400/40" },
  { id: "nft",       label: "NFT Authority",    provider: "commerce",  identifier: "contract_0x8f…d2",        status: "PENDING",   lastSynced: "pending",  accentClass: "border-fuchsia-400/40" },
];

const STATUS_STYLE: Record<LinkStatus, string> = {
  CONNECTED: "border-green-400/50 text-green-300 bg-green-500/10",
  EXPIRED:   "border-red-400/50 text-red-300 bg-red-500/10",
  MISSING:   "border-zinc-500/40 text-zinc-500 bg-zinc-800/20",
  PENDING:   "border-amber-400/50 text-amber-300 bg-amber-500/10",
};

const STATUS_DOT: Record<LinkStatus, string> = {
  CONNECTED: "bg-green-400",
  EXPIRED:   "bg-red-400",
  MISSING:   "bg-zinc-600",
  PENDING:   "bg-amber-400 animate-pulse",
};

export default function AccountLinkerPanel() {
  const [links, setLinks] = useState(LINKS);

  function reconnect(id: string) {
    setLinks((prev) =>
      prev.map((l) => l.id === id ? { ...l, status: "PENDING", lastSynced: "reconnecting…" } : l)
    );
    setTimeout(() => {
      setLinks((prev) =>
        prev.map((l) => l.id === id ? { ...l, status: "CONNECTED", lastSynced: "just now" } : l)
      );
    }, 2500);
  }

  const connected = links.filter((l) => l.status === "CONNECTED").length;
  const issues    = links.filter((l) => l.status !== "CONNECTED" && l.status !== "PENDING").length;

  return (
    <section className="flex h-full flex-col rounded-xl border border-violet-400/30 bg-black/60 p-3">
      <header className="mb-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-violet-400">Account Linker</p>
          <p className="text-[11px] font-black uppercase text-white">Platform Connections</p>
        </div>
        <div className="flex gap-1.5">
          <span className="rounded border border-green-400/50 bg-green-500/10 px-2 py-0.5 text-[9px] font-black uppercase text-green-300">
            {connected} OK
          </span>
          {issues > 0 && (
            <span className="rounded border border-red-400/50 bg-red-500/10 px-2 py-0.5 text-[9px] font-black uppercase text-red-300">
              {issues} ERR
            </span>
          )}
        </div>
      </header>

      <div className="flex flex-col gap-1.5 overflow-y-auto">
        {links.map((link) => (
          <div key={link.id} className={`flex items-center gap-2 rounded-lg border bg-black/40 px-2.5 py-2 ${link.accentClass}`}>
            <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${STATUS_DOT[link.status]}`} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-[9px] font-black uppercase text-white">{link.label}</p>
                <span className="text-[7px] uppercase text-zinc-600">{link.provider}</span>
              </div>
              <p className="truncate text-[8px] text-zinc-500">{link.identifier}</p>
            </div>
            <div className="flex flex-shrink-0 items-center gap-1.5">
              <span className={`rounded border px-1.5 py-0.5 text-[7px] font-black uppercase ${STATUS_STYLE[link.status]}`}>
                {link.status}
              </span>
              {(link.status === "EXPIRED" || link.status === "MISSING") && (
                <button
                  type="button"
                  onClick={() => reconnect(link.id)}
                  className="rounded border border-white/15 bg-white/5 px-1.5 py-0.5 text-[7px] font-black uppercase tracking-[0.1em] text-zinc-400 hover:border-white/30 hover:text-white"
                >
                  Fix
                </button>
              )}
              {link.status !== "MISSING" && (
                <span className="text-[7px] text-zinc-600">{link.lastSynced}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
