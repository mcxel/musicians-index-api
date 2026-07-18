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
    <div style={{ display: "flex", flexDirection: "column", gap: 6, fontFamily: "'Inter', sans-serif" }}>
      {[
        { name: "Google Ads", count: 8, checked: false },
        { name: "Meta Business Suite", count: 18, checked: false },
        { name: "stripe", checked: true },
        { name: "Pay Pa/", checked: true },
        { name: "Visionary Streams", checked: true },
        { name: "S&R Hosting", checked: true },
        { name: "Pundworthy", count: 29, checked: true }
      ].map((item, idx) => (
        <div key={idx} style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "5px 8px",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,215,0,0.15)",
          borderRadius: 8,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {item.checked ? (
              <span style={{ color: "#00FF88", fontSize: 10, fontWeight: 900 }}>✔</span>
            ) : (
              <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 10 }}>☐</span>
            )}
            <span style={{ fontSize: 9, fontWeight: 900, color: "#ffe9bb", textTransform: "uppercase" }}>{item.name}</span>
          </div>
          {item.count ? (
            <span style={{ background: "rgba(255,255,255,0.1)", color: "#fff", fontSize: 8, fontWeight: 900, padding: "1px 5px", borderRadius: 4 }}>{item.count}</span>
          ) : null}
        </div>
      ))}
    </div>
  );
}
