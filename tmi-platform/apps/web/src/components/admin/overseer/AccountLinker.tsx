"use client";

import { useState } from "react";

type ServiceStatus = "CONNECTED" | "DISCONNECTED" | "PENDING" | "ERROR";

interface LinkedAccount {
  id: string;
  name: string;
  category: "payments" | "ads" | "analytics" | "infra" | "streaming";
  status: ServiceStatus;
  detail: string;
  actionLabel: string;
}

const ACCOUNTS: LinkedAccount[] = [
  { id: "stripe",      name: "Stripe",       category: "payments",  status: "CONNECTED",    detail: "Live · $0 balance hold",       actionLabel: "Dashboard" },
  { id: "paypal",      name: "PayPal",        category: "payments",  status: "CONNECTED",    detail: "Live · Payouts enabled",       actionLabel: "Dashboard" },
  { id: "google-ads",  name: "Google Ads",    category: "ads",       status: "CONNECTED",    detail: "Campaign active",              actionLabel: "Manage Ads" },
  { id: "sponsors",    name: "Sponsor CRM",   category: "ads",       status: "PENDING",      detail: "Awaiting sponsor portal auth", actionLabel: "Connect" },
  { id: "analytics",   name: "Analytics",     category: "analytics", status: "CONNECTED",    detail: "Real-time tracking on",        actionLabel: "View" },
  { id: "cloudflare",  name: "Cloudflare",    category: "infra",     status: "CONNECTED",    detail: "CDN + DDoS active",            actionLabel: "Dashboard" },
  { id: "hosting",     name: "Hosting",       category: "infra",     status: "CONNECTED",    detail: "Uptime 99.98%",                actionLabel: "Logs" },
  { id: "streaming",   name: "Stream Engine", category: "streaming", status: "DISCONNECTED", detail: "RTMP relay offline",           actionLabel: "Reconnect" },
];

const STATUS_STYLE: Record<ServiceStatus, string> = {
  CONNECTED:    "border-green-400/50 bg-green-500/10 text-green-300",
  DISCONNECTED: "border-red-500/50 bg-red-500/10 text-red-300",
  PENDING:      "border-amber-400/40 bg-amber-500/10 text-amber-200",
  ERROR:        "border-rose-500/60 bg-rose-500/15 text-rose-300",
};

const CAT_COLOR: Record<LinkedAccount["category"], string> = {
  payments:  "text-amber-300",
  ads:       "text-cyan-300",
  analytics: "text-violet-300",
  infra:     "text-green-300",
  streaming: "text-fuchsia-300",
};

export default function AccountLinker() {
  const [log, setLog] = useState<string[]>([]);

  function handleAction(account: LinkedAccount) {
    setLog((prev) => [`${account.actionLabel} → ${account.name}`, ...prev.slice(0, 4)]);
  }

  return (
    <section className="flex h-full flex-col rounded-xl border border-amber-400/30 bg-black/60 p-3">
      <header className="mb-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-amber-400">Account Linker</p>
          <p className="text-[11px] font-black uppercase text-white">Connected Services</p>
        </div>
        <div className="flex gap-1">
          <span className="rounded border border-green-400/40 bg-green-500/10 px-2 py-0.5 text-[9px] font-black uppercase text-green-300">
            {ACCOUNTS.filter((a) => a.status === "CONNECTED").length} UP
          </span>
          <span className="rounded border border-red-500/40 bg-red-500/10 px-2 py-0.5 text-[9px] font-black uppercase text-red-300">
            {ACCOUNTS.filter((a) => a.status !== "CONNECTED").length} DOWN
          </span>
        </div>
      </header>

      <div className="flex-1 space-y-1.5 overflow-y-auto">
        {ACCOUNTS.map((account) => (
          <div key={account.id} className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/45 p-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className={`text-[9px] font-black uppercase ${CAT_COLOR[account.category]}`}>{account.category}</span>
                <span className="text-[10px] font-black text-white">{account.name}</span>
              </div>
              <p className="text-[8px] text-zinc-400">{account.detail}</p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <span className={`rounded border px-1.5 py-0.5 text-[7px] font-black uppercase ${STATUS_STYLE[account.status]}`}>
                {account.status}
              </span>
              <button
                onClick={() => handleAction(account)}
                className="rounded border border-amber-300/30 bg-amber-500/10 px-2 py-0.5 text-[8px] font-black uppercase text-amber-100 hover:bg-amber-500/25"
              >
                {account.actionLabel}
              </button>
            </div>
          </div>
        ))}
      </div>

      {log.length > 0 && (
        <div className="mt-2 rounded border border-white/10 bg-black/40 p-1.5">
          {log.slice(0, 3).map((e, i) => (
            <p key={i} className="text-[8px] text-zinc-500">{e}</p>
          ))}
        </div>
      )}
    </section>
  );
}
