"use client";

/**
 * Sponsor Fallback Slot — Renders house sponsor inventory when AdSense is unapproved
 * or slot IDs are unconfigured, preventing empty layout boxes and preventing CLS.
 */

import React from "react";
import Link from "next/link";

interface SponsorFallbackSlotProps {
  placement?: "leaderboard" | "sidebar" | "in-content" | "mobile-banner";
  width?: number;
  height?: number;
  label?: string;
}

export function SponsorFallbackSlot({
  placement = "leaderboard",
  width = 728,
  height = 90,
  label = "TMI Featured Sponsor",
}: SponsorFallbackSlotProps) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: width,
        height,
        margin: "12px auto",
        borderRadius: 10,
        border: "1px solid rgba(0, 255, 255, 0.2)",
        background: "linear-gradient(135deg, rgba(5,5,20,0.9), rgba(15,10,35,0.95))",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        boxSizing: "border-box",
        boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: "rgba(0,255,255,0.15)",
            border: "1px solid #00FFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#00FFFF",
            fontSize: 16,
            fontWeight: 900,
          }}
        >
          ★
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 900, color: "#FFD700", letterSpacing: "0.08em" }}>
            {label.toUpperCase()}
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)" }}>
            Official Live Music Platform Partner · TMI Verified
          </div>
        </div>
      </div>

      <Link
        href="/sponsor"
        style={{
          padding: "6px 14px",
          borderRadius: 8,
          border: "1px solid #00FFFF",
          background: "rgba(0,255,255,0.15)",
          color: "#00FFFF",
          fontSize: 10,
          fontWeight: 900,
          textDecoration: "none",
        }}
      >
        SPONSOR SHOW →
      </Link>
    </div>
  );
}

export default SponsorFallbackSlot;
