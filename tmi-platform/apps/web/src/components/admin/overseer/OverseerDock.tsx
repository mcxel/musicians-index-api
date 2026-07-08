"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type StripeWebhookHealth = {
  stripeMode: "test" | "live" | "not_configured" | "unknown";
  webhookSecretConfigured: boolean;
  webhookConnected: boolean;
  lastEventTs: number | null;
  deliveryHealth: {
    ok200Count: number;
    failedDeliveries: number;
    retryCount: number;
  };
};

const REVENUE_GATE_TIMEOUT_MS = 6000;
const REVENUE_GATE_POLL_MS = 30000;
const MAX_EVENT_AGE_MS = 24 * 60 * 60 * 1000;

type DockAction = "home" | "alerts" | "chain" | "feeds" | "revenue" | "security" | "inbox" | "settings" | "logout";

interface DockButton {
  id: DockAction;
  label: string;
  href?: string;
  color: string;
  count?: number;
}

const DOCK_BUTTONS: DockButton[] = [
  { id: "home",     label: "Home",     href: "/admin",                  color: "border-amber-400/60 text-amber-200 bg-amber-500/10 hover:bg-amber-500/25" },
  { id: "chain",    label: "Chain",    href: "#chain-command",           color: "border-violet-400/60 text-violet-200 bg-violet-500/10 hover:bg-violet-500/25" },
  { id: "feeds",    label: "Feeds",    href: "#live-feed-router",        color: "border-cyan-400/60 text-cyan-200 bg-cyan-500/10 hover:bg-cyan-500/25" },
  { id: "security", label: "Security", href: "#sentinel-wall",          color: "border-rose-400/60 text-rose-200 bg-rose-500/10 hover:bg-rose-500/25", count: 3 },
  { id: "inbox",    label: "Inbox",    href: "#unified-inbox",          color: "border-fuchsia-400/60 text-fuchsia-200 bg-fuchsia-500/10 hover:bg-fuchsia-500/25", count: 3 },
  { id: "revenue",  label: "Revenue",  href: "#revenue-analytics",      color: "border-green-400/60 text-green-200 bg-green-500/10 hover:bg-green-500/25" },
  { id: "alerts",   label: "Alerts",   href: "/platform-status",        color: "border-amber-400/60 text-amber-200 bg-amber-500/10 hover:bg-amber-500/25" },
  { id: "settings", label: "Settings", href: "/admin/settings",         color: "border-zinc-400/50 text-zinc-300 bg-zinc-500/10 hover:bg-zinc-500/25" },
  { id: "logout",   label: "Exit",     href: "/",                       color: "border-red-500/60 text-red-300 bg-red-500/10 hover:bg-red-500/25" },
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
  const [clock, setClock] = useState<string | null>(null);
  const [revenueGateStatus, setRevenueGateStatus] = useState<"PASS" | "HOLD">("HOLD");
  const [revenueGateReason, setRevenueGateReason] = useState("Loading Stripe telemetry…");

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let active = true;

    const updateRevenueGate = async () => {
      const ctrl = new AbortController();
      const timeoutId = setTimeout(() => ctrl.abort(), REVENUE_GATE_TIMEOUT_MS);

      try {
        const res = await fetch("/api/stripe/webhook-health", {
          cache: "no-store",
          credentials: "include",
          signal: ctrl.signal,
        });

        if (!res.ok) {
          if (active) {
            setRevenueGateStatus("HOLD");
            setRevenueGateReason(`Stripe health unavailable (${res.status})`);
          }
          return;
        }

        const data = (await res.json()) as StripeWebhookHealth;
        const now = Date.now();
        const hasRecentEvent = Boolean(data.lastEventTs && now - data.lastEventTs < MAX_EVENT_AGE_MS);
        const noDeliveryFailures = data.deliveryHealth.failedDeliveries === 0;
        const operational = data.webhookConnected && data.webhookSecretConfigured && noDeliveryFailures;
        const shouldPass = operational && hasRecentEvent;

        if (active) {
          setRevenueGateStatus(shouldPass ? "PASS" : "HOLD");
          if (shouldPass) {
            setRevenueGateReason(
              data.stripeMode === "live"
                ? "Stripe live telemetry healthy"
                : `Stripe ${data.stripeMode} telemetry healthy`
            );
          } else if (!data.webhookConnected || !data.webhookSecretConfigured) {
            setRevenueGateReason("Stripe webhook config incomplete");
          } else if (!noDeliveryFailures) {
            setRevenueGateReason("Stripe delivery failures detected");
          } else {
            setRevenueGateReason("No recent verified Stripe webhook events");
          }
        }
      } catch {
        if (active) {
          setRevenueGateStatus("HOLD");
          setRevenueGateReason("Stripe telemetry timeout or network error");
        }
      } finally {
        clearTimeout(timeoutId);
      }
    };

    void updateRevenueGate();
    const pollId = setInterval(() => {
      void updateRevenueGate();
    }, REVENUE_GATE_POLL_MS);

    return () => {
      active = false;
      clearInterval(pollId);
    };
  }, []);

  return (
    <header
      className="relative z-50 w-full overflow-hidden rounded-lg"
      style={{
        background: "linear-gradient(120deg, rgba(40,10,40,0.95), rgba(20,5,24,0.97))",
        border: "1px solid rgba(255,215,0,0.4)",
        boxShadow: "0 0 0 1px rgba(255,215,0,0.1), inset 0 1px 0 rgba(255,255,255,0.08), 0 4px 14px rgba(0,0,0,0.5)",
      }}
    >
      <div className="mx-auto flex max-w-[1800px] flex-wrap items-center justify-between gap-3 px-4 py-2">
        {/* Brand + operator identity */}
        <div className="flex shrink-0 items-center gap-3">
          <span className="text-base">🛰️</span>
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-amber-300" style={{ textShadow: "0 0 8px rgba(255,215,0,0.4)" }}>
              BerntoutGlobal — Overseer Deck
            </p>
            <p className="text-[8px] tracking-[0.1em] text-amber-100/40">MISSION CONTROL V1.0</p>
          </div>
          <div className="ml-2 flex h-7 w-7 items-center justify-center rounded-full border border-amber-400/60 bg-amber-500/15 text-[10px] font-black uppercase text-amber-200">
            {operatorName.slice(0, 2)}
          </div>
          <div className="hidden sm:block">
            <p className="text-[9px] font-black uppercase text-amber-200">{operatorName}</p>
            <p className="text-[8px] text-zinc-500">{operatorRole}</p>
          </div>
        </div>

        {/* Live indicator + clock */}
        <div className="flex shrink-0 items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" style={{ boxShadow: "0 0 6px #00FF88" }} />
            <span className="text-[8px] font-black text-green-300">LIVE</span>
          </div>
          {clock && <span className="text-[8px] text-amber-100/40">{clock}</span>}
          <span
            title={revenueGateReason}
            style={{
              border: revenueGateStatus === "PASS" ? "1px solid rgba(0,255,136,0.5)" : "1px solid rgba(244,63,94,0.55)",
              background: revenueGateStatus === "PASS" ? "rgba(0,255,136,0.12)" : "rgba(244,63,94,0.16)",
              color: revenueGateStatus === "PASS" ? "#00FF88" : "#FF6B8A",
              borderRadius: 999,
              padding: "4px 9px",
              fontSize: 8,
              fontWeight: 900,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            Revenue {revenueGateStatus}
          </span>
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
        <nav className="flex flex-wrap items-center gap-1.5">
          {DOCK_BUTTONS.map((btn) => (
            btn.href ? (
              <Link
                key={btn.id}
                href={btn.href}
                onClick={() => setLastAction(btn.label)}
                className={`relative rounded-md border px-3 py-1 text-[9px] font-black uppercase tracking-[0.1em] shadow-sm transition ${btn.color}`}
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
                className={`rounded-md border px-3 py-1 text-[9px] font-black uppercase tracking-[0.1em] shadow-sm transition ${btn.color}`}
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
    </header>
  );
}
