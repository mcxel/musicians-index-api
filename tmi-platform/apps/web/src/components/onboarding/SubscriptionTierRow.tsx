"use client";

// Canonical tier order: FREE → PRO → RUBY → SILVER → GOLD → PLATINUM → DIAMOND
// This component is only rendered when a user explicitly asks to upgrade —
// never shown during initial signup (Rule 26 / "don't scare free users off").
// PRO is the entry-level paid option: low price, easy yes.

import React, { useState } from "react";

export type SubscriptionTier = "FREE" | "PRO" | "RUBY" | "SILVER" | "GOLD" | "PLATINUM";

interface TierOption {
  tier: SubscriptionTier;
  displayLabel: string;
  color: string;
  bg: string;
  price: string;
  perks: string[];
  recommended?: boolean;
}

const TIER_OPTIONS: TierOption[] = [
  {
    tier: "FREE",
    displayLabel: "FREE",
    color: "#00FFFF",
    bg: "rgba(0,255,255,0.05)",
    price: "$0",
    perks: ["Watch Rooms", "Vote", "Basic Chat"],
  },
  {
    tier: "PRO",
    displayLabel: "PRO",
    color: "#00FFFF",
    bg: "rgba(0,255,255,0.09)",
    price: "$4.99/mo",
    perks: ["+ Tips & Reactions", "Pro Badge", "Priority Chat"],
    recommended: true,
  },
  {
    tier: "RUBY",
    displayLabel: "RUBY",
    color: "#FF4444",
    bg: "rgba(255,68,68,0.08)",
    price: "$9.99/mo",
    perks: ["+ Cypher Entry", "Avatar Badge", "Merch Drops"],
  },
  {
    tier: "SILVER",
    displayLabel: "SILVER",
    color: "#C0C0C0",
    bg: "rgba(192,192,192,0.08)",
    price: "$14.99/mo",
    perks: ["+ Beat Battles", "VIP Rooms", "Crown Voting"],
  },
  {
    tier: "GOLD",
    displayLabel: "GOLD",
    color: "#FFD700",
    bg: "rgba(255,215,0,0.08)",
    price: "$24.99/mo",
    perks: ["+ Booking", "Season Pass", "Stage Slot"],
  },
  {
    tier: "PLATINUM",
    displayLabel: "DIAMOND",
    color: "#AA2DFF",
    bg: "rgba(170,45,255,0.10)",
    price: "$49.99/mo",
    perks: ["All Access", "NFT Drops", "Diamond Badge"],
  },
];

interface SubscriptionTierRowProps {
  value?: SubscriptionTier;
  onChange?: (tier: SubscriptionTier) => void;
  /** Show price labels — default true */
  showPrices?: boolean;
  /** Show perk bullets — default true */
  showPerks?: boolean;
  label?: string;
}

export default function SubscriptionTierRow({
  value,
  onChange,
  showPrices = true,
  showPerks = true,
  label = "CHOOSE YOUR TIER",
}: SubscriptionTierRowProps) {
  const [internal, setInternal] = useState<SubscriptionTier>("FREE");
  const selected = value ?? internal;

  function handleSelect(tier: SubscriptionTier) {
    setInternal(tier);
    onChange?.(tier);
  }

  return (
    <div style={{ width: "100%" }}>
      {/* Section label */}
      <p
        style={{
          fontSize: 9,
          fontWeight: 900,
          letterSpacing: "0.22em",
          color: "rgba(255,255,255,0.45)",
          marginBottom: 10,
          textTransform: "uppercase",
        }}
      >
        {label}
      </p>

      {/* Card row */}
      <div
        style={{
          display: "flex",
          gap: 8,
          overflowX: "auto",
          paddingBottom: 4,
        }}
      >
        {TIER_OPTIONS.map((opt) => {
          const isSelected = selected === opt.tier;
          return (
            <button
              key={opt.tier}
              onClick={() => handleSelect(opt.tier)}
              aria-label={`Select ${opt.displayLabel} tier`}
              aria-pressed={isSelected}
              style={{
                flex: "0 0 auto",
                width: 90,
                background: isSelected ? opt.bg : "rgba(255,255,255,0.02)",
                border: `1.5px solid ${isSelected ? opt.color : `${opt.color}25`}`,
                borderRadius: 10,
                padding: "10px 6px",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                boxShadow: isSelected ? `0 0 14px ${opt.color}40` : "none",
                transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s",
                position: "relative",
              }}
            >
              {/* Recommended badge */}
              {opt.recommended && (
                <span
                  style={{
                    position: "absolute",
                    top: -8,
                    left: "50%",
                    transform: "translateX(-50%)",
                    fontSize: 7,
                    fontWeight: 900,
                    letterSpacing: "0.15em",
                    background: opt.color,
                    color: "#050510",
                    borderRadius: 4,
                    padding: "2px 6px",
                    whiteSpace: "nowrap",
                  }}
                >
                  POPULAR
                </span>
              )}

              {/* Tier name */}
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 900,
                  letterSpacing: "0.18em",
                  color: isSelected ? opt.color : "rgba(255,255,255,0.55)",
                  transition: "color 0.2s",
                }}
              >
                {opt.displayLabel}
              </span>

              {/* Price */}
              {showPrices && (
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 900,
                    color: isSelected ? opt.color : "rgba(255,255,255,0.7)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {opt.price}
                </span>
              )}

              {/* Perks */}
              {showPerks && (
                <ul style={{ listStyle: "none", margin: 0, padding: 0, width: "100%" }}>
                  {opt.perks.map((perk) => (
                    <li
                      key={perk}
                      style={{
                        fontSize: 7,
                        color: "rgba(255,255,255,0.45)",
                        textAlign: "center",
                        lineHeight: 1.6,
                      }}
                    >
                      {perk}
                    </li>
                  ))}
                </ul>
              )}

              {/* Selected indicator dot */}
              {isSelected && (
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: opt.color,
                    boxShadow: `0 0 6px ${opt.color}`,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
