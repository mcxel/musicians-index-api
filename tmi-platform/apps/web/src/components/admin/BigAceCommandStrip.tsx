"use client";

// Canon source: Adminisratation Hub.jpg — Overseer bar top strip
// Structure: Quick Dock pills · Tax Loss indicator · Alerts count · Chain Pulse ticker
//            Staff Meeting · Sanction Group · Approve Queue (these get their own rails)
// Motion: Chain Pulse scrolling ticker

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface CommandAction {
  id: string;
  label: string;
  href: string;
  accent: string;
  count?: number;
  urgent?: boolean;
}

const QUICK_ACTIONS: CommandAction[] = [
  { id: "home",     label: "HQ",          href: "/admin",              accent: "#FFD700" },
  { id: "revenue",  label: "REVENUE",     href: "/admin/revenue",      accent: "#00FF88", count: 0 },
  { id: "feeds",    label: "LIVE FEEDS",  href: "/admin/live-feed",    accent: "#00FFFF" },
  { id: "security", label: "SECURITY",    href: "/admin/security",     accent: "#FF4444", count: 3, urgent: true },
  { id: "bots",     label: "BOTS",        href: "/admin/bots",         accent: "#AA2DFF" },
  { id: "billing",  label: "BILLING",     href: "/admin/billing",      accent: "#FFD700" },
  { id: "inbox",    label: "INBOX",       href: "/admin/inbox",        accent: "#FF2DAA", count: 7 },
];

const CHAIN_PULSE_ITEMS = [
  "Big Ace · ACTIVE · 18 tasks",
  "Marcel · ACTIVE · 12 tasks",
  "Admin Chain · ACTIVE · 7 tasks",
  "Bot Sentinel · 100 units deployed",
  "Revenue stream · $44.1M platform total",
  "Security · STABLE · 3 open alerts",
  "Venue Chain · ACTIVE · 8 tasks",
  "Builder Chain · ACTIVE · 6 tasks",
];

export default function BigAceCommandStrip() {
  const tickerRef = useRef<HTMLDivElement>(null);
  const [taxLoss] = useState("$2.1M YTD");
  const [alertCount] = useState(3);

  // Auto-scroll ticker
  useEffect(() => {
    const el = tickerRef.current;
    if (!el) return;
    let pos = 0;
    const id = setInterval(() => {
      pos += 0.5;
      if (pos >= el.scrollWidth / 2) pos = 0;
      el.style.transform = `translateX(-${pos}px)`;
    }, 16);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      data-big-ace-command-strip
      style={{
        width: "100%",
        background: "linear-gradient(to right, rgba(255,215,0,0.08), rgba(170,45,255,0.06), rgba(0,255,255,0.04))",
        borderBottom: "1px solid rgba(255,215,0,0.15)",
        display: "flex",
        flexDirection: "column",
        gap: 0,
      }}
    >
      {/* Top row: Quick Dock + indicators */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "8px 14px",
          flexWrap: "wrap",
        }}
      >
        {/* BIG ACE label */}
        <span
          style={{
            fontSize: 8,
            fontWeight: 900,
            letterSpacing: "0.22em",
            color: "#FFD700",
            flexShrink: 0,
            marginRight: 4,
          }}
        >
          BIG ACE
        </span>

        {/* Quick Dock pills */}
        {QUICK_ACTIONS.map((action) => (
          <Link
            key={action.id}
            href={action.href}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: "3px 10px",
              borderRadius: 20,
              background: `${action.accent}10`,
              border: `1px solid ${action.accent}${action.urgent ? "60" : "25"}`,
              textDecoration: "none",
              flexShrink: 0,
              boxShadow: action.urgent ? `0 0 6px ${action.accent}40` : "none",
            }}
          >
            <span
              style={{
                fontSize: 7,
                fontWeight: 900,
                letterSpacing: "0.15em",
                color: action.urgent ? action.accent : "rgba(255,255,255,0.7)",
              }}
            >
              {action.label}
            </span>
            {action.count !== undefined && action.count > 0 && (
              <span
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background: action.accent,
                  color: "#050510",
                  fontSize: 7,
                  fontWeight: 900,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {action.count}
              </span>
            )}
          </Link>
        ))}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Tax Loss indicator */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "3px 10px",
            background: "rgba(255,68,68,0.08)",
            border: "1px solid rgba(255,68,68,0.2)",
            borderRadius: 6,
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 7, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em" }}>TAX LOSS</span>
          <span style={{ fontSize: 9, fontWeight: 900, color: "#FF4444" }}>{taxLoss}</span>
        </div>

        {/* Alert count */}
        {alertCount > 0 && (
          <Link
            href="/admin/security"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: "3px 10px",
              background: "rgba(255,68,68,0.12)",
              border: "1px solid rgba(255,68,68,0.4)",
              borderRadius: 6,
              textDecoration: "none",
              flexShrink: 0,
              boxShadow: "0 0 8px rgba(255,68,68,0.3)",
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF4444" }} />
            <span style={{ fontSize: 7, fontWeight: 900, color: "#FF4444", letterSpacing: "0.12em" }}>
              {alertCount} ALERTS
            </span>
          </Link>
        )}
      </div>

      {/* Chain Pulse ticker */}
      <div
        style={{
          overflow: "hidden",
          borderTop: "1px solid rgba(255,215,0,0.08)",
          padding: "4px 0",
          background: "rgba(0,0,0,0.3)",
        }}
      >
        <div ref={tickerRef} style={{ display: "inline-flex", gap: 32, whiteSpace: "nowrap" }}>
          {/* Double for seamless loop */}
          {[...CHAIN_PULSE_ITEMS, ...CHAIN_PULSE_ITEMS].map((item, i) => (
            <span
              key={i}
              style={{
                fontSize: 7,
                color: "rgba(255,215,0,0.5)",
                letterSpacing: "0.15em",
                fontWeight: 700,
              }}
            >
              ◆ {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
