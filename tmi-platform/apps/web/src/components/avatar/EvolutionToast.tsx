"use client";
/**
 * EvolutionToast — XP feedback system for TMI
 *
 * Two display modes:
 *   1. TIER UP toast — full-screen epic animation when tierChanged=true
 *   2. XP pop — small floating "+N XP" notification for every action
 *
 * Usage:
 *   const { showXp, showTierUp } = useEvolutionToast();
 *   showXp(15, "Tipped Artist");                  // small pop
 *   showTierUp("Rising", "#00FFFF", 1000);        // epic level-up
 *
 * Or use the EvolutionToastProvider at the app level and call from anywhere.
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { TIER_CONFIG } from "@/lib/avatar/AvatarEvolutionEngine";
import type { EvolutionTier } from "@/lib/avatar/HeroRegistry";

// ── XP Pop — small "+15 XP · Tipped Artist" notification ────────────────────
interface XpPop {
  id:     number;
  xp:     number;
  reason: string;
  color:  string;
}

function XpPopItem({ pop, onDone }: { pop: XpPop; onDone: () => void }) {
  useEffect(() => {
    const id = setTimeout(onDone, 2200);
    return () => clearTimeout(id);
  }, [onDone]);

  return (
    <div style={{
      animation: "xpPopIn 0.3s ease, xpPopOut 0.5s ease 1.7s forwards",
      background: `${pop.color}18`,
      border: `1px solid ${pop.color}44`,
      borderRadius: 20,
      padding: "5px 14px",
      display: "flex", alignItems: "center", gap: 7,
      backdropFilter: "blur(8px)",
      boxShadow: `0 0 14px ${pop.color}22`,
      pointerEvents: "none",
    }}>
      <span style={{ fontSize: 12, fontWeight: 900, color: pop.color }}>+{pop.xp} XP</span>
      <span style={{ fontSize: 9, color: "rgba(255,255,255,0.55)", letterSpacing: "0.06em" }}>{pop.reason}</span>
    </div>
  );
}

// ── Tier-Up overlay — epic full-moment celebration ────────────────────────────
function TierUpOverlay({ tier, color, onDone }: { tier: EvolutionTier; color: string; onDone: () => void }) {
  const cfg = TIER_CONFIG[tier];

  useEffect(() => {
    const id = setTimeout(onDone, 3500);
    return () => clearTimeout(id);
  }, [onDone]);

  return (
    <div
      onClick={onDone}
      style={{
        position: "fixed", inset: 0, zIndex: 99999,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.82)", backdropFilter: "blur(6px)",
        animation: "tierOverlayIn 0.4s ease",
        cursor: "pointer",
      }}
    >
      {/* Particle ring */}
      <div style={{
        position: "absolute", width: 400, height: 400, borderRadius: "50%",
        border: `2px solid ${color}44`,
        animation: "tierRingExpand 1.5s ease forwards",
      }} />
      <div style={{
        position: "absolute", width: 500, height: 500, borderRadius: "50%",
        border: `1px solid ${color}22`,
        animation: "tierRingExpand 1.8s ease 0.2s forwards",
      }} />

      {/* Core content */}
      <div style={{
        position: "relative", zIndex: 2, textAlign: "center",
        animation: "tierContentIn 0.5s cubic-bezier(0.34,1.56,0.64,1)",
      }}>
        {/* Emoji burst */}
        <div style={{ fontSize: 64, marginBottom: 12, animation: "tierEmojiPop 0.6s cubic-bezier(0.34,1.56,0.64,1)" }}>
          {cfg.emoji}
        </div>

        {/* LEVEL UP label */}
        <div style={{ fontSize: 10, letterSpacing: "0.4em", color: "rgba(255,255,255,0.5)", fontWeight: 800, marginBottom: 6 }}>
          LEVEL UP
        </div>

        {/* Tier name */}
        <div style={{
          fontFamily: "'Orbitron', monospace",
          fontSize: "clamp(32px,6vw,52px)",
          fontWeight: 900,
          color,
          letterSpacing: "0.08em",
          textShadow: `0 0 40px ${color}88, 0 0 80px ${color}44`,
          marginBottom: 8,
        }}>
          {tier.toUpperCase()}
        </div>

        {/* Subtitle */}
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", letterSpacing: "0.14em" }}>
          YOU ARE NOW A TMI {tier.toUpperCase()}
        </div>

        <div style={{ marginTop: 20, fontSize: 9, color: "rgba(255,255,255,0.25)" }}>
          Tap anywhere to continue
        </div>
      </div>

      {/* Color flash */}
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(ellipse 60% 50% at center, ${color}18, transparent 70%)`,
        pointerEvents: "none",
      }} />
    </div>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────────
let _counter = 0;

export function useEvolutionToast() {
  const [pops, setPops] = useState<XpPop[]>([]);
  const [tierUp, setTierUp] = useState<{ tier: EvolutionTier; color: string } | null>(null);

  const showXp = useCallback((xp: number, reason: string, color = "#FFD700") => {
    const id = ++_counter;
    setPops(prev => [...prev, { id, xp, reason, color }]);
  }, []);

  const showTierUp = useCallback((tier: EvolutionTier, color?: string) => {
    const cfg = TIER_CONFIG[tier];
    setTierUp({ tier, color: color ?? cfg.color });
  }, []);

  const removePop = useCallback((id: number) => {
    setPops(prev => prev.filter(p => p.id !== id));
  }, []);

  const ToastRenderer = (
    <>
      <style>{`
        @keyframes xpPopIn  { from{opacity:0;transform:translateY(8px) scale(0.9)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes xpPopOut { from{opacity:1;transform:translateY(0)} to{opacity:0;transform:translateY(-12px)} }
        @keyframes tierOverlayIn { from{opacity:0} to{opacity:1} }
        @keyframes tierRingExpand { from{transform:scale(0.3);opacity:0.8} to{transform:scale(2.5);opacity:0} }
        @keyframes tierContentIn { from{transform:scale(0.6) translateY(20px);opacity:0} to{transform:scale(1) translateY(0);opacity:1} }
        @keyframes tierEmojiPop  { from{transform:scale(0.2) rotate(-20deg)} 70%{transform:scale(1.2) rotate(5deg)} to{transform:scale(1) rotate(0)} }
      `}</style>

      {/* XP pops — stack in bottom-right */}
      <div style={{ position: "fixed", bottom: 80, right: 20, zIndex: 9998, display: "flex", flexDirection: "column-reverse", gap: 6, pointerEvents: "none" }}>
        {pops.map(pop => (
          <XpPopItem key={pop.id} pop={pop} onDone={() => removePop(pop.id)} />
        ))}
      </div>

      {/* Tier-up overlay */}
      {tierUp && (
        <TierUpOverlay tier={tierUp.tier} color={tierUp.color} onDone={() => setTierUp(null)} />
      )}
    </>
  );

  return { showXp, showTierUp, ToastRenderer };
}

// ── Standalone component (for pages that don't use the hook pattern) ──────────
export default function EvolutionToastMount() {
  // This is a placeholder mount point — the hook is the primary API
  return null;
}
