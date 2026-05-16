"use client";

// Canon source: Adminisratation Hub.jpg — Approve Queue rail
// Structure: pending approval items (bookings, artist applications, sponsor contracts)
//            + APPROVE / DENY / SANCTION action buttons per item
// Interactions: approve → green flash + remove; deny → red flash + remove; sanction → modal

import React, { useState } from "react";
import Link from "next/link";

type ApprovalCategory = "booking" | "artist" | "sponsor" | "advertiser" | "content" | "withdrawal";
type ApprovalStatus = "pending" | "approved" | "denied" | "sanctioned";

interface ApprovalItem {
  id: string;
  category: ApprovalCategory;
  title: string;
  sub: string;
  amount?: string;
  urgency: "normal" | "high" | "critical";
  ts: string;
}

const CAT_COLOR: Record<ApprovalCategory, string> = {
  booking:    "#00FFFF",
  artist:     "#FF2DAA",
  sponsor:    "#FFD700",
  advertiser: "#AA2DFF",
  content:    "#00FF88",
  withdrawal: "#FF6B00",
};

const SEED_QUEUE: ApprovalItem[] = [
  { id: "aq1", category: "booking",    title: "KOVA — Main Stage Booking",       sub: "Sat 8PM · 2,400 seats",   amount: "$12,500",  urgency: "high",   ts: "10m" },
  { id: "aq2", category: "artist",     title: "Nova Flux — Artist Application",  sub: "Electronic · 4.2K followers",               urgency: "normal", ts: "25m" },
  { id: "aq3", category: "sponsor",    title: "RetroLogo — Sponsor Contract",    sub: "FEATURED tier · 3 months", amount: "$8,000",   urgency: "high",   ts: "1h"  },
  { id: "aq4", category: "withdrawal", title: "Drift Sound — Revenue Withdrawal",sub: "Monthly split",             amount: "$4,200",   urgency: "critical",ts: "1h" },
  { id: "aq5", category: "content",    title: "Magazine Article — Week 14",      sub: "Awaiting editorial review",                  urgency: "normal", ts: "2h"  },
  { id: "aq6", category: "advertiser", title: "BeatBox Ads — Campaign Launch",   sub: "Video Ads · $350 budget",  amount: "$350",     urgency: "normal", ts: "3h"  },
];

export default function ApprovalQueueRail() {
  const [queue, setQueue] = useState(SEED_QUEUE);
  const [flash, setFlash] = useState<Record<string, "approved" | "denied">>({});

  function act(id: string, action: "approve" | "deny") {
    setFlash((prev) => ({ ...prev, [id]: action === "approve" ? "approved" : "denied" }));
    setTimeout(() => {
      setQueue((q) => q.filter((item) => item.id !== id));
      setFlash((prev) => { const next = { ...prev }; delete next[id]; return next; });
    }, 600);
  }

  return (
    <div
      data-approval-queue-rail
      style={{ display: "flex", flexDirection: "column", gap: 8 }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 8, fontWeight: 900, color: "rgba(255,255,255,0.45)", letterSpacing: "0.2em" }}>
          APPROVAL QUEUE · {queue.length}
        </span>
        <Link href="/admin/approvals" style={{ fontSize: 7, color: "#00FFFF", textDecoration: "none", letterSpacing: "0.1em" }}>
          ALL →
        </Link>
      </div>

      {/* Queue items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {queue.map((item) => {
          const color = CAT_COLOR[item.category];
          const flashState = flash[item.id];
          return (
            <div
              key={item.id}
              style={{
                padding: "8px 10px",
                borderRadius: 7,
                background: flashState === "approved"
                  ? "rgba(0,255,136,0.15)"
                  : flashState === "denied"
                  ? "rgba(255,68,68,0.15)"
                  : `${color}06`,
                border: `1px solid ${flashState ? (flashState === "approved" ? "#00FF88" : "#FF4444") : `${color}20`}`,
                transition: "background 0.2s, border-color 0.2s",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 6 }}>
                {/* Category tag */}
                <span
                  style={{
                    fontSize: 6,
                    fontWeight: 900,
                    letterSpacing: "0.12em",
                    color: color,
                    background: `${color}15`,
                    borderRadius: 3,
                    padding: "1px 5px",
                    flexShrink: 0,
                    textTransform: "uppercase",
                  }}
                >
                  {item.category}
                </span>

                {/* Urgency */}
                {item.urgency !== "normal" && (
                  <span
                    style={{
                      fontSize: 6,
                      fontWeight: 900,
                      color: item.urgency === "critical" ? "#FF4444" : "#FFD700",
                      letterSpacing: "0.1em",
                      flexShrink: 0,
                    }}
                  >
                    {item.urgency.toUpperCase()}
                  </span>
                )}

                <span style={{ flex: 1, fontSize: 7, color: "rgba(255,255,255,0.25)", textAlign: "right" }}>
                  {item.ts} ago
                </span>
              </div>

              <p style={{ fontSize: 9, fontWeight: 800, color: "#fff", marginBottom: 2, letterSpacing: "0.04em" }}>
                {item.title}
              </p>
              <p style={{ fontSize: 7, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>
                {item.sub}{item.amount ? ` · ${item.amount}` : ""}
              </p>

              {/* Actions */}
              <div style={{ display: "flex", gap: 5 }}>
                <button
                  onClick={() => act(item.id, "approve")}
                  style={{
                    flex: 1,
                    padding: "4px 0",
                    borderRadius: 5,
                    background: "rgba(0,255,136,0.1)",
                    border: "1px solid rgba(0,255,136,0.3)",
                    color: "#00FF88",
                    fontSize: 7,
                    fontWeight: 900,
                    letterSpacing: "0.12em",
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                >
                  APPROVE
                </button>
                <button
                  onClick={() => act(item.id, "deny")}
                  style={{
                    flex: 1,
                    padding: "4px 0",
                    borderRadius: 5,
                    background: "rgba(255,68,68,0.08)",
                    border: "1px solid rgba(255,68,68,0.25)",
                    color: "#FF4444",
                    fontSize: 7,
                    fontWeight: 900,
                    letterSpacing: "0.12em",
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                >
                  DENY
                </button>
                <button
                  style={{
                    padding: "4px 8px",
                    borderRadius: 5,
                    background: "rgba(255,215,0,0.06)",
                    border: "1px solid rgba(255,215,0,0.2)",
                    color: "#FFD700",
                    fontSize: 7,
                    fontWeight: 900,
                    letterSpacing: "0.1em",
                    cursor: "pointer",
                  }}
                >
                  ⚑
                </button>
              </div>
            </div>
          );
        })}

        {queue.length === 0 && (
          <p style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", textAlign: "center", padding: "16px 0", letterSpacing: "0.15em" }}>
            QUEUE CLEAR
          </p>
        )}
      </div>
    </div>
  );
}
