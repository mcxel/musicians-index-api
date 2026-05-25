"use client";

import { useEffect, useRef, useState } from "react";
import { getSponsorPowerState, SPONSOR_TIERS } from "@/lib/sponsors/SponsorPowerEngine";
import type { SponsorPowerInput } from "@/lib/sponsors/SponsorPowerEngine";

interface SponsorPowerBarProps extends SponsorPowerInput {
  /** "full" = profile card; "compact" = live room badge; "tile" = homepage glow */
  variant?: "full" | "compact" | "tile";
  /** Animated burst when a new sponsor just landed */
  newSponsorBurst?: boolean;
  onBurstComplete?: () => void;
}

export default function SponsorPowerBar({
  totalRevenueCents,
  sponsorCount,
  retentionDays,
  variant = "full",
  newSponsorBurst = false,
  onBurstComplete,
}: SponsorPowerBarProps) {
  const state = getSponsorPowerState({ totalRevenueCents, sponsorCount, retentionDays });
  const { tier, nextTier, pctToNextTier, activeUnlocks, microGoal, score } = state;

  const [displayPct, setDisplayPct] = useState(0);
  const [burst, setBurst] = useState(false);
  const [burstLabel, setBurstLabel] = useState("");
  const animRef = useRef<ReturnType<typeof requestAnimationFrame>>();

  // Animate bar fill on mount
  useEffect(() => {
    const target = pctToNextTier;
    let current = 0;
    const step = () => {
      current = Math.min(target, current + 2);
      setDisplayPct(current);
      if (current < target) animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [pctToNextTier]);

  // New sponsor burst animation
  useEffect(() => {
    if (!newSponsorBurst) return;
    setBurstLabel(`+${tier.icon} SPONSOR POWER UNLOCKED`);
    setBurst(true);
    const t = setTimeout(() => {
      setBurst(false);
      onBurstComplete?.();
    }, 3200);
    return () => clearTimeout(t);
  }, [newSponsorBurst, tier.icon, onBurstComplete]);

  // ── TILE variant — just a glowing ring indicator ───────────────────────────
  if (variant === "tile") {
    if (tier.tier === "NONE") return null;
    return (
      <div style={{
        position: "absolute", inset: -2,
        borderRadius: "50%",
        background: `conic-gradient(${tier.color} ${displayPct * 3.6}deg, transparent 0deg)`,
        opacity: 0.5,
        pointerEvents: "none",
      }} />
    );
  }

  // ── COMPACT variant — small badge + thin bar for live rooms ───────────────
  if (variant === "compact") {
    return (
      <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
        {tier.tier !== "NONE" && (
          <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.12em", color: tier.color, background: `${tier.color}15`, padding: "1px 5px", border: `1px solid ${tier.color}40` }}>
            {tier.icon} {tier.badge}
          </span>
        )}
        <div style={{ width: 48, height: 3, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${displayPct}%`, background: tier.color, transition: "width 0.4s ease" }} />
        </div>
      </div>
    );
  }

  // ── FULL variant ──────────────────────────────────────────────────────────
  return (
    <div style={{ position: "relative", fontFamily: "'Inter',sans-serif" }}>

      {/* Burst banner */}
      {burst && (
        <div style={{
          position: "absolute", top: -44, left: 0, right: 0,
          background: `linear-gradient(135deg, ${tier.color}, ${tier.color}88)`,
          color: "#050510",
          fontFamily: "'Bebas Neue','Impact',sans-serif",
          fontSize: 12, fontWeight: 900, letterSpacing: "0.2em",
          padding: "8px 16px", textAlign: "center",
          animation: "sponsorBurst 3.2s ease-out forwards",
          zIndex: 20,
        }}>
          {burstLabel}
        </div>
      )}

      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.25em", color: tier.color, textTransform: "uppercase" }}>
            SPONSOR POWER
          </span>
          {tier.tier !== "NONE" && (
            <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.15em", color: tier.color, background: `${tier.color}15`, padding: "2px 7px", border: `1px solid ${tier.color}35` }}>
              {tier.icon} {tier.badge}
            </span>
          )}
        </div>
        <span style={{ fontSize: 10, fontWeight: 700, color: tier.color }}>{score} SP</span>
      </div>

      {/* Progress bar */}
      <div style={{ position: "relative", height: 8, background: "rgba(255,255,255,0.06)", marginBottom: 6, overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: "0 auto 0 0",
          width: `${displayPct}%`,
          background: `linear-gradient(90deg, ${tier.color}88, ${tier.color})`,
          transition: "width 0.08s linear",
          boxShadow: `0 0 8px ${tier.color}88`,
        }} />
        {/* Tier notches */}
        {SPONSOR_TIERS.slice(1, -1).map((t) => {
          if (!nextTier) return null;
          const notchPct = ((t.minScore - (state.tier?.minScore ?? 0)) / ((nextTier?.minScore ?? 1) - (state.tier?.minScore ?? 0))) * 100;
          if (notchPct <= 0 || notchPct >= 100) return null;
          return (
            <div key={t.tier} style={{ position: "absolute", top: 0, bottom: 0, left: `${notchPct}%`, width: 1, background: "rgba(255,255,255,0.15)" }} />
          );
        })}
      </div>

      {/* Pct label + micro-goal */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>
          {nextTier ? `${displayPct}% → ${nextTier.label}` : "MAX TIER ACHIEVED"}
        </span>
        {microGoal && (
          <span style={{ fontSize: 9, color: "#FFD700", fontWeight: 700 }}>{microGoal}</span>
        )}
      </div>

      {/* Active unlocks */}
      {activeUnlocks.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {activeUnlocks.map(u => (
            <div key={u.id} style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.12em", color: "#00C896", background: "rgba(0,200,150,0.1)", padding: "2px 7px", border: "1px solid rgba(0,200,150,0.25)", textTransform: "uppercase" }}>
              ✓ {u.label}
            </div>
          ))}
        </div>
      )}

      {/* Tier ladder */}
      <div style={{ display: "flex", gap: 4, marginTop: 10 }}>
        {SPONSOR_TIERS.slice(1).map(t => {
          const active = score >= t.minScore;
          const current = tier.tier === t.tier;
          return (
            <div key={t.tier} title={t.label} style={{
              flex: 1, height: 4,
              background: active ? t.color : "rgba(255,255,255,0.07)",
              boxShadow: current ? `0 0 6px ${t.color}` : "none",
              transition: "background 0.3s, box-shadow 0.3s",
            }} />
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
        {SPONSOR_TIERS.slice(1).map(t => (
          <div key={t.tier} style={{ flex: 1, fontSize: 7, color: score >= t.minScore ? t.color : "rgba(255,255,255,0.2)", textAlign: "center", letterSpacing: "0.06em", fontWeight: 700, textTransform: "uppercase" }}>
            {t.icon}
          </div>
        ))}
      </div>

      {/* CSS keyframe injected once */}
      <style>{`
        @keyframes sponsorBurst {
          0%   { opacity: 0; transform: translateY(6px) scale(0.97); }
          12%  { opacity: 1; transform: translateY(0) scale(1); }
          80%  { opacity: 1; }
          100% { opacity: 0; transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}
