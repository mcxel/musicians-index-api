"use client";
import React, { useState } from "react";
import type { SubscriptionTier, TierFeatures } from "@/lib/billing/SubscriptionEngine";

interface SubscriptionCardProps {
  tier: SubscriptionTier;
  features: TierFeatures;
  priceMonthly: number;
  priceAnnual: number;
  isCurrentTier: boolean;
  isHighlighted?: boolean;
  onSelect: (tier: SubscriptionTier, interval: "monthly" | "annual") => void;
}

const TIER_DISPLAY: Record<SubscriptionTier, { label: string; icon: string; color: string }> = {
  free: { label: "Free", icon: "🌱", color: "#64748b" },
  fan_pro: { label: "Fan Pro", icon: "⭐", color: "#34d399" },
  performer_pro: { label: "Performer Pro", icon: "🎤", color: "#00ffff" },
  venue_pro: { label: "Venue Pro", icon: "🏟️", color: "#ff9f43" },
  sponsor_pro: { label: "Sponsor Pro", icon: "💼", color: "#00ff88" },
  platform_vip: { label: "Platform VIP", icon: "👑", color: "#ffd700" },
};

const FEATURE_LABELS: Array<{ key: keyof TierFeatures; label: string }> = [
  { key: "canGoLive", label: "Go Live" },
  { key: "canSellTickets", label: "Sell Tickets" },
  { key: "canMintNFTs", label: "Mint NFTs" },
  { key: "hasAdFreeExperience", label: "Ad-Free" },
  { key: "canAccessBeatLab", label: "Beat Lab" },
  { key: "hasAnalyticsDashboard", label: "Analytics" },
  { key: "canCreateSponsorCampaigns", label: "Sponsor Campaigns" },
  { key: "hasPrioritySupport", label: "Priority Support" },
];

export function SubscriptionCard({
  tier,
  features,
  priceMonthly,
  priceAnnual,
  isCurrentTier,
  isHighlighted,
  onSelect,
}: SubscriptionCardProps) {
  const [interval, setInterval] = useState<"monthly" | "annual">("monthly");
  const display = TIER_DISPLAY[tier];
  const price = interval === "monthly" ? priceMonthly : priceAnnual;
  const annualSavings = priceMonthly > 0
    ? Math.round(((priceMonthly * 12 - priceAnnual) / (priceMonthly * 12)) * 100)
    : 0;

  return (
    <div
      style={{
        background: "rgba(2,6,23,0.96)",
        border: `2px solid ${isHighlighted ? display.color : isCurrentTier ? `${display.color}60` : "rgba(51,65,85,0.5)"}`,
        borderRadius: 16,
        padding: "22px",
        fontFamily: "system-ui, sans-serif",
        color: "#e2e8f0",
        minWidth: 220,
        boxShadow: isHighlighted ? `0 0 32px ${display.color}25` : "none",
        position: "relative",
        transition: "transform 0.2s",
      }}
    >
      {isHighlighted && (
        <div
          style={{
            position: "absolute",
            top: -12,
            left: "50%",
            transform: "translateX(-50%)",
            background: display.color,
            color: "#0f172a",
            padding: "3px 16px",
            borderRadius: 12,
            fontSize: 10,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: 1,
            whiteSpace: "nowrap",
          }}
        >
          Most Popular
        </div>
      )}

      {isCurrentTier && (
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            background: `${display.color}20`,
            border: `1px solid ${display.color}50`,
            color: display.color,
            padding: "2px 10px",
            borderRadius: 10,
            fontSize: 9,
            fontWeight: 700,
            textTransform: "uppercase",
          }}
        >
          Current
        </div>
      )}

      <div style={{ fontSize: 30, marginBottom: 8 }}>{display.icon}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: display.color }}>{display.label}</div>

      {/* Price */}
      <div style={{ margin: "14px 0", display: "flex", alignItems: "flex-end", gap: 4 }}>
        <span style={{ fontSize: 32, fontWeight: 900, color: "#e2e8f0" }}>
          {price === 0 ? "Free" : `$${price.toFixed(2)}`}
        </span>
        {price > 0 && (
          <span style={{ fontSize: 12, color: "#64748b", paddingBottom: 4 }}>
            /{interval === "monthly" ? "mo" : "yr"}
          </span>
        )}
      </div>

      {/* Annual toggle */}
      {priceMonthly > 0 && (
        <div style={{ display: "flex", gap: 0, marginBottom: 14, background: "rgba(15,23,42,0.8)", borderRadius: 8, overflow: "hidden" }}>
          {(["monthly", "annual"] as const).map((iv) => (
            <button
              key={iv}
              onClick={() => setInterval(iv)}
              style={{
                flex: 1,
                padding: "5px 8px",
                background: interval === iv ? display.color : "transparent",
                border: "none",
                color: interval === iv ? "#0f172a" : "#64748b",
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 600,
                textTransform: "capitalize",
              }}
            >
              {iv}
              {iv === "annual" && annualSavings > 0 && ` (-${annualSavings}%)`}
            </button>
          ))}
        </div>
      )}

      {/* Features */}
      <div style={{ marginBottom: 16 }}>
        {FEATURE_LABELS.map(({ key, label }) => {
          const val = features[key];
          const enabled = typeof val === "boolean" ? val : (typeof val === "number" ? val > 0 : val !== null);
          return (
            <div
              key={key}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "4px 0",
                opacity: enabled ? 1 : 0.4,
              }}
            >
              <span style={{ fontSize: 12, color: enabled ? display.color : "#475569" }}>
                {enabled ? "✓" : "✗"}
              </span>
              <span style={{ fontSize: 12, color: enabled ? "#94a3b8" : "#475569" }}>{label}</span>
            </div>
          );
        })}
        {features.maxBotSlots > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
            <span style={{ fontSize: 12, color: display.color }}>✓</span>
            <span style={{ fontSize: 12, color: "#94a3b8" }}>{features.maxBotSlots} Bot Slots</span>
          </div>
        )}
      </div>

      <button
        onClick={() => onSelect(tier, interval)}
        disabled={isCurrentTier}
        style={{
          width: "100%",
          padding: "10px",
          background: isCurrentTier
            ? "rgba(51,65,85,0.4)"
            : `linear-gradient(135deg, ${display.color}, ${display.color}aa)`,
          border: "none",
          color: isCurrentTier ? "#64748b" : "#0f172a",
          borderRadius: 8,
          cursor: isCurrentTier ? "default" : "pointer",
          fontSize: 13,
          fontWeight: 800,
          letterSpacing: 0.5,
        }}
      >
        {isCurrentTier ? "Current Plan" : tier === "free" ? "Get Started" : "Upgrade"}
      </button>
    </div>
  );
}
