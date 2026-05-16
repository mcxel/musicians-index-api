"use client";
import React from "react";
import type { Giveaway } from "@/lib/giveaway/SponsorGiveawayEngine";

interface SponsorGiveawayBannerProps {
  giveaway: Giveaway;
  hasEntered: boolean;
  onEnter: () => void;
}

export function SponsorGiveawayBanner({ giveaway, hasEntered, onEnter }: SponsorGiveawayBannerProps) {
  const isOpen = giveaway.status === "open";
  const prizeValue = giveaway.prizes.reduce((sum, p) => sum + p.value, 0);

  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(2,6,23,0.97) 0%, rgba(0,255,136,0.05) 100%)",
        border: "2px solid rgba(0,255,136,0.4)",
        borderRadius: 16,
        padding: "20px 24px",
        fontFamily: "system-ui, sans-serif",
        color: "#e2e8f0",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 0 40px rgba(0,255,136,0.12)",
        maxWidth: 500,
      }}
    >
      {/* Sponsor badge */}
      <div
        style={{
          position: "absolute",
          top: 12,
          right: 14,
          background: "rgba(0,255,136,0.15)",
          border: "1px solid rgba(0,255,136,0.4)",
          color: "#00ff88",
          padding: "3px 10px",
          borderRadius: 12,
          fontSize: 10,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        Sponsored by {giveaway.sponsorName}
      </div>

      {/* Live pulse */}
      {isOpen && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#00ff88",
              boxShadow: "0 0 8px #00ff88",
              animation: "giveawayPulse 1.5s ease-in-out infinite",
            }}
          />
          <span style={{ fontSize: 10, color: "#00ff88", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>
            Live Giveaway
          </span>
          <style>{`@keyframes giveawayPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
        </div>
      )}

      <div style={{ fontSize: 20, fontWeight: 800, color: "#e2e8f0", marginBottom: 6 }}>
        {giveaway.title}
      </div>

      <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 14, lineHeight: 1.5 }}>
        {giveaway.description}
      </div>

      {/* Prizes */}
      {giveaway.prizes.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 2, marginBottom: 6 }}>
            Prizes
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {giveaway.prizes.slice(0, 3).map((prize) => (
              <div
                key={prize.id}
                style={{
                  background: "rgba(0,255,136,0.08)",
                  border: "1px solid rgba(0,255,136,0.25)",
                  color: "#00ff88",
                  padding: "4px 10px",
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                {prize.label}
              </div>
            ))}
            {giveaway.prizes.length > 3 && (
              <div
                style={{
                  color: "#64748b",
                  fontSize: 11,
                  padding: "4px 6px",
                }}
              >
                +{giveaway.prizes.length - 3} more
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontSize: 11, color: "#64748b" }}>
            {giveaway.entries.length.toLocaleString()} entries
          </div>
          {prizeValue > 0 && (
            <div style={{ fontSize: 12, color: "#00ff88", fontWeight: 700 }}>
              ${prizeValue.toLocaleString()} prize pool
            </div>
          )}
        </div>

        <button
          onClick={onEnter}
          disabled={!isOpen || hasEntered}
          style={{
            background: hasEntered
              ? "rgba(51,65,85,0.5)"
              : "linear-gradient(135deg, #00ff88, #00cc6a)",
            border: "none",
            color: hasEntered ? "#64748b" : "#0f172a",
            padding: "10px 24px",
            borderRadius: 8,
            cursor: hasEntered || !isOpen ? "default" : "pointer",
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: 0.5,
            transition: "opacity 0.2s",
          }}
        >
          {hasEntered ? "✓ Entered" : isOpen ? "Enter Now" : "Giveaway Closed"}
        </button>
      </div>
    </div>
  );
}
