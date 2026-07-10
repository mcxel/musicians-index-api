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
  tone: "amber" | "cyan" | "rose" | "violet" | "fuchsia" | "green" | "zinc" | "red" | "sky" | "yellow";
  count?: number;
}

const DOCK_BUTTONS: DockButton[] = [
  { id: "home",     label: "Quick Dock",   href: "/admin/overseer",                   tone: "amber" },
  { id: "home",     label: "Legal Center", href: "/admin/overseer?workspace=legal",   tone: "amber" },
  { id: "inbox",    label: "Contact Us",   href: "/contact",                          tone: "sky" },
  { id: "revenue",  label: "Tax / Billing", href: "/admin/revenue",                    tone: "yellow" },
  { id: "alerts",   label: "Alerts",       href: "/platform-status",                   tone: "rose", count: 8 },
  { id: "chain",    label: "Chain Pulse",  href: "/admin/overseer#chain-command",      tone: "violet" },
  { id: "feeds",    label: "Start Meeting",href: "/admin/overseer#live-feed-router",   tone: "cyan" },
  { id: "security", label: "Summon Big Ace", href: "/admin/overseer#chain-command",    tone: "fuchsia" },
  { id: "inbox",    label: "Approve Queue", href: "/admin/overseer#revenue-analytics", tone: "green" },
  { id: "settings", label: "Settings",      href: "/admin/settings",                    tone: "zinc" },
  { id: "logout",   label: "Exit",          href: "/",                                  tone: "red" },
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

  const toneStyles: Record<DockButton["tone"], { border: string; text: string; bg: string }> = {
    amber: { border: "rgba(251,191,36,0.55)", text: "#FCD68A", bg: "rgba(251,191,36,0.15)" },
    cyan: { border: "rgba(34,211,238,0.55)", text: "#A5F3FC", bg: "rgba(34,211,238,0.15)" },
    rose: { border: "rgba(251,113,133,0.55)", text: "#FECDD3", bg: "rgba(251,113,133,0.15)" },
    violet: { border: "rgba(167,139,250,0.55)", text: "#DDD6FE", bg: "rgba(167,139,250,0.15)" },
    fuchsia: { border: "rgba(232,121,249,0.55)", text: "#F5D0FE", bg: "rgba(232,121,249,0.15)" },
    green: { border: "rgba(74,222,128,0.55)", text: "#BBF7D0", bg: "rgba(74,222,128,0.15)" },
    zinc: { border: "rgba(161,161,170,0.55)", text: "#E4E4E7", bg: "rgba(161,161,170,0.15)" },
    red: { border: "rgba(248,113,113,0.55)", text: "#FECACA", bg: "rgba(248,113,113,0.15)" },
    sky: { border: "rgba(56,189,248,0.55)", text: "#BAE6FD", bg: "rgba(56,189,248,0.15)" },
    yellow: { border: "rgba(250,204,21,0.55)", text: "#FEF08A", bg: "rgba(250,204,21,0.15)" },
  };

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
      style={{
        position: "relative",
        zIndex: 50,
        width: "100%",
        overflow: "hidden",
        borderRadius: 10,
        background: "linear-gradient(120deg, rgba(40,10,40,0.95), rgba(20,5,24,0.97))",
        border: "1px solid rgba(255,215,0,0.4)",
        boxShadow: "0 0 0 1px rgba(255,215,0,0.1), inset 0 1px 0 rgba(255,255,255,0.08), 0 4px 14px rgba(0,0,0,0.5)",
      }}
    >
      <div
        style={{
          margin: "0 auto",
          maxWidth: 1800,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          padding: "10px 12px",
        }}
      >
        {/* Brand + operator identity */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <span style={{ fontSize: 17 }}>🛰️</span>
          <div>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.13em", color: "#FCD68A", textShadow: "0 0 8px rgba(255,215,0,0.4)" }}>
              BerntoutGlobal — Overseer Deck
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 9, letterSpacing: "0.1em", color: "rgba(255,251,235,0.45)", textTransform: "uppercase" }}>MISSION CONTROL V1.0</p>
          </div>
          <div style={{ marginLeft: 8, display: "flex", width: 30, height: 30, alignItems: "center", justifyContent: "center", borderRadius: "50%", border: "1px solid rgba(251,191,36,0.6)", background: "rgba(251,191,36,0.15)", fontSize: 10, fontWeight: 900, textTransform: "uppercase", color: "#FDE68A" }}>
            {operatorName.slice(0, 2)}
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 900, textTransform: "uppercase", color: "#FDE68A", letterSpacing: "0.08em" }}>{operatorName}</p>
            <p style={{ margin: "2px 0 0", fontSize: 10, color: "rgba(161,161,170,0.9)" }}>{operatorRole}</p>
          </div>
        </div>

        {/* Live indicator + clock */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#00FF88", boxShadow: "0 0 8px #00FF88" }} />
            <span style={{ fontSize: 10, fontWeight: 900, color: "#86EFAC", letterSpacing: "0.08em", textTransform: "uppercase" }}>Live</span>
          </div>
          {clock && <span style={{ fontSize: 10, color: "rgba(254,243,199,0.6)", letterSpacing: "0.06em" }}>{clock}</span>}
          <span
            title={revenueGateReason}
            style={{
              border: revenueGateStatus === "PASS" ? "1px solid rgba(0,255,136,0.5)" : "1px solid rgba(244,63,94,0.55)",
              background: revenueGateStatus === "PASS" ? "rgba(0,255,136,0.12)" : "rgba(244,63,94,0.16)",
              color: revenueGateStatus === "PASS" ? "#00FF88" : "#FF6B8A",
              borderRadius: 999,
              padding: "5px 10px",
              fontSize: 10,
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
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", color: "rgba(161,161,170,0.9)", letterSpacing: "0.08em" }}>System</span>
          <div style={{ height: 7, width: 90, overflow: "hidden", borderRadius: 999, background: "rgba(255,255,255,0.1)" }}>
            <div
              style={{
                height: "100%",
                borderRadius: 999,
                width: `${systemHealth}%`,
                background: systemHealth >= 95 ? "#4ADE80" : systemHealth >= 80 ? "#FACC15" : "#F87171",
              }}
            />
          </div>
          <span style={{ fontSize: 10, fontWeight: 900, color: systemHealth >= 95 ? "#86EFAC" : "#FDE68A" }}>{systemHealth}%</span>
        </div>

        {/* Dock buttons */}
        <nav style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
          {DOCK_BUTTONS.map((btn) => (
            btn.href ? (
              <Link
                key={`${btn.id}-${btn.label}`}
                href={btn.href}
                onClick={() => setLastAction(btn.label)}
                style={{
                  position: "relative",
                  borderRadius: 8,
                  border: `1px solid ${toneStyles[btn.tone].border}`,
                  padding: "6px 10px",
                  fontSize: 10,
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.09em",
                  color: toneStyles[btn.tone].text,
                  background: toneStyles[btn.tone].bg,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.35)",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
              >
                {btn.label}
                {btn.count ? (
                  <span style={{ position: "absolute", right: -6, top: -6, display: "flex", height: 16, width: 16, alignItems: "center", justifyContent: "center", borderRadius: "50%", background: "#EF4444", color: "#fff", fontSize: 8, fontWeight: 900 }}>
                    {btn.count}
                  </span>
                ) : null}
              </Link>
            ) : (
              <button
                key={`${btn.id}-${btn.label}`}
                onClick={() => setLastAction(btn.label)}
                style={{
                  borderRadius: 8,
                  border: `1px solid ${toneStyles[btn.tone].border}`,
                  padding: "6px 10px",
                  fontSize: 10,
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.09em",
                  color: toneStyles[btn.tone].text,
                  background: toneStyles[btn.tone].bg,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.35)",
                  cursor: "pointer",
                }}
              >
                {btn.label}
              </button>
            )
          ))}
        </nav>

        {/* Last action */}
        {lastAction && (
          <p style={{ margin: 0, fontSize: 10, color: "rgba(161,161,170,0.9)", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>→ {lastAction}</p>
        )}
      </div>
    </header>
  );
}
