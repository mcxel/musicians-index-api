"use client";

/**
 * BattleOverlaySystem — Full broadcast overlay for Battles, Ciphers, and Challenges.
 * Sourced from: Profiles/tmi_platform_prototype_complete.html — Battle Overlays tab.
 *
 * Phases: INTRO → VS → PERFORM → VOTE → WINNER
 * Also renders: Cipher Runtime Panels, Overlay Library, Challenge Bracket display.
 *
 * Visual canon: dark space (#050510) + neon fuchsia/cyan/gold. Rule 7.
 * Rule 20: waveform animations are decorative, no fake viewer counts.
 */

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type BattlePhase = "intro" | "vs" | "perform" | "vote" | "winner";
export type OverlayMode = "battle" | "cypher" | "challenge";

export interface BattleContestant {
  id: string;
  name: string;
  city?: string;
  genre?: string;
  record?: string;
  rank?: number;
  emoji?: string;
  accentColor: string;
  side: "A" | "B";
}

export interface CypherPerformer {
  id: string;
  name: string;
  status: "active" | "next" | "completed" | "queued";
  emoji?: string;
  accentColor: string;
  timeLeft?: number;
}

interface BattleOverlaySystemProps {
  mode?: OverlayMode;
  /** If provided, phase is controlled externally */
  phase?: BattlePhase;
  onPhaseChange?: (phase: BattlePhase) => void;
  contestantA?: BattleContestant;
  contestantB?: BattleContestant;
  cypherQueue?: CypherPerformer[];
  voteA?: number;
  voteB?: number;
  totalVotes?: number;
  winnerSide?: "A" | "B";
  winnerPrize?: string;
  winnerScore?: string;
  /** Show the overlay library panel (for admin/broadcast use) */
  showOverlayLibrary?: boolean;
  /** Show phase controls (admin/host only) */
  showPhaseControls?: boolean;
  className?: string;
}

// ─── Waveform bars helper ───────────────────────────────────────────────────────

function WaveformBars({ color, count = 10, height = 18, animated = false }: {
  color: string; count?: number; height?: number; animated?: boolean;
}) {
  const bars = Array.from({ length: count }, (_, i) => {
    const h = 30 + Math.abs(Math.sin(i * 0.8)) * 55;
    return (
      <div
        key={i}
        style={{
          width: 2,
          height: `${h * (height / 100)}px`,
          background: color,
          borderRadius: 1,
          opacity: 0.85,
          ...(animated ? {
            animation: `waveBar${i % 3} 0.${6 + (i % 4)}s ease-in-out infinite alternate`,
          } : {}),
        }}
      />
    );
  });
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 1.5, height }}>
      {bars}
      <style>{`
        @keyframes waveBar0 { from { transform: scaleY(0.4); } to { transform: scaleY(1); } }
        @keyframes waveBar1 { from { transform: scaleY(0.6); } to { transform: scaleY(0.9); } }
        @keyframes waveBar2 { from { transform: scaleY(0.5); } to { transform: scaleY(1.1); } }
      `}</style>
    </div>
  );
}

// ─── Neon frame overlay (performer border) ──────────────────────────────────────

function NeonPerformerFrame({
  contestant,
  isActive = false,
  children,
}: {
  contestant: BattleContestant;
  isActive?: boolean;
  children?: React.ReactNode;
}) {
  const c = contestant.accentColor;
  return (
    <div
      style={{
        border: `2px solid ${isActive ? c : c + "77"}`,
        borderRadius: 8,
        padding: "10px 12px",
        position: "relative",
        background: `${c}0d`,
        boxShadow: isActive ? `0 0 24px ${c}44, inset 0 0 20px ${c}0a` : "none",
        transition: "all 0.3s ease",
      }}
    >
      {/* Corner accent dots */}
      <div style={{ position: "absolute", top: -3, left: -3, width: 6, height: 6, borderRadius: "50%", background: c, boxShadow: `0 0 6px ${c}` }} />
      <div style={{ position: "absolute", top: -3, right: -3, width: 6, height: 6, borderRadius: "50%", background: c, boxShadow: `0 0 6px ${c}` }} />
      <div style={{ position: "absolute", bottom: -3, left: -3, width: 6, height: 6, borderRadius: "50%", background: c, boxShadow: `0 0 6px ${c}` }} />
      <div style={{ position: "absolute", bottom: -3, right: -3, width: 6, height: 6, borderRadius: "50%", background: c, boxShadow: `0 0 6px ${c}` }} />

      {/* Challenger badge */}
      <div style={{
        position: "absolute",
        top: -9,
        left: "50%",
        transform: "translateX(-50%)",
        background: c,
        color: "#fff",
        fontSize: 7,
        fontWeight: 800,
        padding: "1px 10px",
        borderRadius: 10,
        whiteSpace: "nowrap",
        letterSpacing: "0.08em",
      }}>
        CHALLENGER {contestant.side}
      </div>

      {children}
    </div>
  );
}

// ─── Phase: INTRO ───────────────────────────────────────────────────────────────

function IntroPhase({ a, b }: { a: BattleContestant; b: BattleContestant }) {
  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 10, fontWeight: 900, color: "#FF6B1A", letterSpacing: "0.2em" }}>
          ◉ BATTLE PRESENTATION · INTRO PHASE
        </div>
        <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>
          Countdown starting · Audience filling · Beat queued
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <NeonPerformerFrame contestant={a}>
          <div style={{ textAlign: "center", padding: "8px 0 4px" }}>
            <div style={{ fontSize: 32, marginBottom: 6 }}>{a.emoji ?? "🎤"}</div>
            <div style={{ fontSize: 13, fontWeight: 900, color: a.accentColor, marginBottom: 2 }}>{a.name}</div>
            {a.city && a.genre && (
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>
                {a.city} · {a.genre}
              </div>
            )}
            {a.record && (
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>Record {a.record}</div>
            )}
            {a.rank && (
              <div style={{
                display: "inline-block", marginTop: 6,
                background: `${a.accentColor}22`, border: `1px solid ${a.accentColor}44`,
                borderRadius: 12, padding: "2px 8px", fontSize: 8, color: a.accentColor, fontWeight: 700,
              }}>
                SEASON RANK #{a.rank}
              </div>
            )}
          </div>
          <WaveformBars color={a.accentColor} count={12} height={20} />
        </NeonPerformerFrame>

        <NeonPerformerFrame contestant={b}>
          <div style={{ textAlign: "center", padding: "8px 0 4px" }}>
            <div style={{ fontSize: 32, marginBottom: 6 }}>{b.emoji ?? "🎙️"}</div>
            <div style={{ fontSize: 13, fontWeight: 900, color: b.accentColor, marginBottom: 2 }}>{b.name}</div>
            {b.city && b.genre && (
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>
                {b.city} · {b.genre}
              </div>
            )}
            {b.record && (
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>Record {b.record}</div>
            )}
            {b.rank && (
              <div style={{
                display: "inline-block", marginTop: 6,
                background: `${b.accentColor}22`, border: `1px solid ${b.accentColor}44`,
                borderRadius: 12, padding: "2px 8px", fontSize: 8, color: b.accentColor, fontWeight: 700,
              }}>
                SEASON RANK #{b.rank}
              </div>
            )}
          </div>
          <WaveformBars color={b.accentColor} count={12} height={20} />
        </NeonPerformerFrame>
      </div>
    </div>
  );
}

// ─── Phase: VS ─────────────────────────────────────────────────────────────────

function VSPhase({ a, b }: { a: BattleContestant; b: BattleContestant }) {
  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 10, fontSize: 10, fontWeight: 900, color: "#FF4444", letterSpacing: "0.18em" }}>
        ◉ VERSUS INTRO
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12, alignItems: "center", marginBottom: 10 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 36 }}>{a.emoji ?? "🎤"}</div>
          <div style={{ fontSize: 13, fontWeight: 900, color: a.accentColor, marginTop: 4 }}>{a.name}</div>
          {a.genre && <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{a.genre}</div>}
        </div>

        <div style={{
          background: "#FF4444",
          color: "#fff",
          fontSize: 18,
          fontWeight: 900,
          padding: "10px 14px",
          borderRadius: 6,
          textAlign: "center",
          boxShadow: "0 0 28px #FF444488",
          letterSpacing: "0.05em",
        }}>
          VS
        </div>

        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 36 }}>{b.emoji ?? "🎙️"}</div>
          <div style={{ fontSize: 13, fontWeight: 900, color: b.accentColor, marginTop: 4 }}>{b.name}</div>
          {b.genre && <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{b.genre}</div>}
        </div>
      </div>

      {/* Energy bars */}
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <div style={{ flex: 1, height: 3, background: a.accentColor, borderRadius: 2, boxShadow: `0 0 8px ${a.accentColor}` }} />
        <div style={{ flex: 1, height: 3, background: b.accentColor, borderRadius: 2, boxShadow: `0 0 8px ${b.accentColor}` }} />
      </div>
      <div style={{ textAlign: "center", marginTop: 10, fontSize: 8, color: "rgba(255,255,255,0.35)" }}>
        Energy ring activating · Neon frame lock-on · Stage lights shifting
      </div>
    </div>
  );
}

// ─── Phase: PERFORM ─────────────────────────────────────────────────────────────

function PerformPhase({ a, b, activePerformer = "A" }: {
  a: BattleContestant; b: BattleContestant; activePerformer?: "A" | "B";
}) {
  const active = activePerformer === "A" ? a : b;
  const waiting = activePerformer === "A" ? b : a;

  const REACTIONS = [
    { emoji: "❤️", count: "2.4K" },
    { emoji: "🔥", count: "1.1K" },
    { emoji: "⭐", count: "890" },
    { emoji: "💎", count: "340" },
  ];

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 10, fontSize: 10, fontWeight: 700, color: "#FF6B1A", letterSpacing: "0.12em" }}>
        ◉ PERFORMANCE PHASE — ROUND 1
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {/* Active performer */}
        <div>
          <div style={{
            border: `2px solid ${active.accentColor}`,
            borderRadius: 8, padding: 10,
            background: `${active.accentColor}11`,
            boxShadow: `0 0 24px ${active.accentColor}33`,
          }}>
            <div style={{ textAlign: "center", marginBottom: 6 }}>
              <div style={{ fontSize: 28 }}>{active.emoji ?? "🎤"}</div>
              <div style={{ fontSize: 11, fontWeight: 900, color: active.accentColor }}>{active.name}</div>
              <div style={{
                display: "inline-block", marginTop: 4,
                background: active.accentColor, color: "#fff",
                fontSize: 7, fontWeight: 800, padding: "2px 8px",
                borderRadius: 10, letterSpacing: "0.1em",
              }}>
                PERFORMING
              </div>
            </div>
            <WaveformBars color={active.accentColor} count={14} height={22} animated />
          </div>
          <div style={{ textAlign: "center", marginTop: 6, fontSize: 9, color: "rgba(255,255,255,0.5)" }}>
            ⏱ 0:38 / 2:00
          </div>
        </div>

        {/* Waiting performer */}
        <div>
          <div style={{
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8, padding: 10, opacity: 0.55,
            background: "rgba(255,255,255,0.02)",
          }}>
            <div style={{ textAlign: "center", marginBottom: 6 }}>
              <div style={{ fontSize: 20 }}>{waiting.emoji ?? "🎙️"}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: waiting.accentColor }}>{waiting.name}</div>
              <div style={{
                display: "inline-block", marginTop: 4,
                background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)",
                fontSize: 7, fontWeight: 700, padding: "2px 8px", borderRadius: 10,
              }}>
                WAITING
              </div>
            </div>
          </div>

          {/* Live reactions */}
          <div style={{
            marginTop: 8, background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 8, padding: "8px 10px",
          }}>
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", fontWeight: 700, marginBottom: 6, letterSpacing: "0.08em" }}>
              LIVE REACTIONS
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {REACTIONS.map(r => (
                <span key={r.emoji} style={{ fontSize: 10, color: "rgba(255,255,255,0.6)" }}>
                  {r.emoji} {r.count}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Overlay chips */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12, justifyContent: "center" }}>
        {["🎵 Song Title", "👤 Identity Label", "⏱ Timer", "📊 Live Audience Meter", "💎 Sponsor Banner"].map(o => (
          <div key={o} style={{
            fontSize: 8, color: "#FF6B1A",
            background: "rgba(255,107,26,0.12)",
            border: "1px solid rgba(255,107,26,0.3)",
            padding: "3px 8px", borderRadius: 12,
          }}>
            {o}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Phase: VOTE ────────────────────────────────────────────────────────────────

function VotePhase({ a, b, voteA = 62, voteB = 38, totalVotes = 61000 }: {
  a: BattleContestant; b: BattleContestant;
  voteA?: number; voteB?: number; totalVotes?: number;
}) {
  const votesA = Math.round((totalVotes * voteA) / 100);
  const votesB = Math.round((totalVotes * voteB) / 100);

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 12, fontSize: 10, fontWeight: 700, color: "#9B59FF", letterSpacing: "0.12em" }}>
        🗳 VOTING OPEN — AUDIENCE DECIDES
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        {/* Contestant A votes */}
        <div style={{
          border: `2px solid ${a.accentColor}`,
          borderRadius: 8, padding: 12,
          background: `${a.accentColor}0a`,
        }}>
          <div style={{ fontSize: 10, fontWeight: 900, color: a.accentColor, textAlign: "center", marginBottom: 8 }}>
            {a.name}
          </div>
          <div style={{ textAlign: "center", background: "rgba(0,0,0,0.35)", borderRadius: 6, padding: "8px 0", marginBottom: 8 }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: a.accentColor }}>{voteA}%</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{votesA.toLocaleString()} votes</div>
          </div>
          <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${voteA}%`,
              background: a.accentColor,
              borderRadius: 3,
              boxShadow: `0 0 8px ${a.accentColor}88`,
              transition: "width 0.8s ease",
            }} />
          </div>
        </div>

        {/* Contestant B votes */}
        <div style={{
          border: `2px solid ${b.accentColor}`,
          borderRadius: 8, padding: 12,
          background: `${b.accentColor}0a`,
        }}>
          <div style={{ fontSize: 10, fontWeight: 900, color: b.accentColor, textAlign: "center", marginBottom: 8 }}>
            {b.name}
          </div>
          <div style={{ textAlign: "center", background: "rgba(0,0,0,0.35)", borderRadius: 6, padding: "8px 0", marginBottom: 8 }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: b.accentColor }}>{voteB}%</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{votesB.toLocaleString()} votes</div>
          </div>
          <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${voteB}%`,
              background: b.accentColor,
              borderRadius: 3,
              boxShadow: `0 0 8px ${b.accentColor}88`,
              transition: "width 0.8s ease",
            }} />
          </div>
        </div>
      </div>

      <div style={{
        background: "rgba(155,89,255,0.12)",
        border: "1px solid rgba(155,89,255,0.35)",
        borderRadius: 8, padding: "10px 14px", textAlign: "center",
      }}>
        <div style={{ fontSize: 10, fontWeight: 900, color: "#9B59FF", marginBottom: 4 }}>
          VOTE NOW · 0:28 REMAINING
        </div>
        <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)" }}>
          Audience meter live · Judge scoring · Crowd energy pulse active
        </div>
      </div>
    </div>
  );
}

// ─── Phase: WINNER ──────────────────────────────────────────────────────────────

function WinnerPhase({ winner, prize, score }: {
  winner: BattleContestant; prize?: string; score?: string;
}) {
  const CELEBRATION_ELEMENTS = [
    "🎊 Confetti", "✨ Fireworks", "🏆 Trophy Rise",
    "🎵 Champion Music", "👥 Crowd Celebration",
    "💎 Gold Lighting", "📊 Final Stats",
  ];

  return (
    <div>
      {/* Trophy */}
      <div style={{ fontSize: 48, textAlign: "center", marginBottom: 8 }}>🏆</div>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
        <div style={{
          border: `2px solid #FFD700`,
          borderRadius: 10, padding: "12px 24px",
          background: "rgba(255,215,0,0.06)",
          boxShadow: "0 0 40px rgba(255,215,0,0.2)",
          textAlign: "center", minWidth: 220,
        }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: "#FFD700", letterSpacing: "0.18em", marginBottom: 8 }}>
            CHAMPION
          </div>
          <div style={{ fontSize: 32, marginBottom: 6 }}>{winner.emoji ?? "🎤"}</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#FFD700" }}>{winner.name}</div>
          {(prize || score) && (
            <div style={{ marginTop: 8 }}>
              {score && <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>Score: {score}</div>}
              {prize && (
                <div style={{
                  marginTop: 4, display: "inline-block",
                  background: "rgba(0,255,136,0.12)",
                  border: "1px solid rgba(0,255,136,0.3)",
                  borderRadius: 6, padding: "3px 10px",
                  fontSize: 10, color: "#00FF88", fontWeight: 700,
                }}>
                  Prize: {prize}
                </div>
              )}
            </div>
          )}
          <div style={{ fontSize: 9, color: "#00FF88", marginTop: 8, fontWeight: 700 }}>
            → Moves to Championship Round
          </div>
        </div>
      </div>

      {/* Celebration elements */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
        {CELEBRATION_ELEMENTS.map(e => (
          <div key={e} style={{
            fontSize: 8, color: "#FFD700",
            background: "rgba(255,215,0,0.1)",
            border: "1px solid rgba(255,215,0,0.25)",
            padding: "3px 8px", borderRadius: 12,
          }}>
            {e}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Cipher Runtime Panels ──────────────────────────────────────────────────────

function CypherRuntimePanels({ queue }: { queue: CypherPerformer[] }) {
  const active = queue.find(p => p.status === "active");
  const next = queue.find(p => p.status === "next");
  const prev = queue.find(p => p.status === "completed");

  const SLOT_CONFIG = [
    { label: "🎤 ACTIVE", icon: "🎤", performer: active, color: "#FF6B1A", status: "PERFORMING" },
    { label: "⏭ NEXT", icon: "⏭", performer: next, color: "#FFD700", status: "QUEUED #2" },
    { label: "🏅 PREV", icon: "🏅", performer: prev, color: "#9B59FF", status: "COMPLETE" },
  ] as const;

  return (
    <div>
      <div style={{
        fontSize: 10, fontWeight: 900, letterSpacing: "0.1em",
        color: "#FF6B1A", marginBottom: 10, textTransform: "uppercase",
      }}>
        Cipher Runtime Panels
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
        {SLOT_CONFIG.map(({ label, icon, performer, color, status }) => (
          <div key={label} style={{
            border: `1px solid ${color}44`,
            borderRadius: 8, padding: "10px 8px", textAlign: "center",
            background: `${color}0a`,
          }}>
            <div style={{ fontSize: 10, color, fontWeight: 700, marginBottom: 6 }}>{icon}</div>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#E8E8FF", marginBottom: 4 }}>
              {performer?.name ?? "—"}
            </div>
            <div style={{ fontSize: 8, color }}>
              {performer ? status : "EMPTY"}
            </div>
            {performer?.timeLeft != null && (
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
                ⏱ {performer.timeLeft}s left
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Overlay Library ────────────────────────────────────────────────────────────

function OverlayLibrary() {
  const ASSETS = [
    { name: "Performer Frame", desc: "Neon border tracks real cam", color: "#FF2DAA" },
    { name: "Name Card", desc: "Lower-third ID badge", color: "#00FFFF" },
    { name: "Score Bug", desc: "Live judge + audience score", color: "#FFD700" },
    { name: "Timer", desc: "Verse or round countdown", color: "#FF6B1A" },
    { name: "Crowd Meter", desc: "Real-time audience energy", color: "#00FF88" },
    { name: "Winner Crown", desc: "Gold reveal sequence", color: "#FFD700" },
    { name: "Sponsor Banner", desc: "Auto-rotates placements", color: "#9B59FF" },
    { name: "Vote Pulse", desc: "Animated vote counter", color: "#FF2DAA" },
    { name: "Reaction Burst", desc: "Floating gift/reaction FX", color: "#00FFFF" },
  ];

  return (
    <div>
      <div style={{
        fontSize: 10, fontWeight: 900, letterSpacing: "0.1em",
        color: "#9B59FF", marginBottom: 10, textTransform: "uppercase",
      }}>
        Overlay Library — Available Assets
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
        {ASSETS.map(asset => (
          <div key={asset.name} style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 8, padding: "8px 10px",
            cursor: "pointer",
            transition: "border-color 0.2s",
          }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: asset.color, marginBottom: 3 }}>
              {asset.name}
            </div>
            <div style={{ fontSize: 7, color: "rgba(255,255,255,0.4)", lineHeight: 1.4 }}>
              {asset.desc}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Phase control bar ──────────────────────────────────────────────────────────

const PHASE_LABELS: Record<BattlePhase, string> = {
  intro: "INTRO",
  vs: "VS",
  perform: "PERFORM",
  vote: "VOTE",
  winner: "WINNER",
};

function PhaseControlBar({ phase, onPhaseChange }: {
  phase: BattlePhase;
  onPhaseChange: (p: BattlePhase) => void;
}) {
  const phases: BattlePhase[] = ["intro", "vs", "perform", "vote", "winner"];
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
      {phases.map(p => (
        <button
          key={p}
          type="button"
          onClick={() => onPhaseChange(p)}
          style={{
            padding: "6px 14px",
            fontSize: 9, fontWeight: 800, letterSpacing: "0.1em",
            border: `1px solid ${phase === p ? "#9B59FF" : "rgba(255,255,255,0.12)"}`,
            borderRadius: 6,
            background: phase === p ? "rgba(155,89,255,0.22)" : "rgba(255,255,255,0.04)",
            color: phase === p ? "#9B59FF" : "rgba(255,255,255,0.5)",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          {PHASE_LABELS[p]}
        </button>
      ))}
    </div>
  );
}

// ─── Defaults ──────────────────────────────────────────────────────────────────

const DEFAULT_A: BattleContestant = {
  id: "a",
  name: "JAY CARTER",
  city: "Sacramento, CA",
  genre: "Hip-Hop",
  record: "14–2",
  rank: 8,
  emoji: "🎤",
  accentColor: "#FF6B1A",
  side: "A",
};

const DEFAULT_B: BattleContestant = {
  id: "b",
  name: "MIKE WAVE",
  city: "Atlanta, GA",
  genre: "Trap",
  record: "10–3",
  rank: 12,
  emoji: "🎙️",
  accentColor: "#00D4FF",
  side: "B",
};

const DEFAULT_CYPHER_QUEUE: CypherPerformer[] = [
  { id: "1", name: "Tiana (TG)", status: "active", emoji: "🎤", accentColor: "#FF6B1A", timeLeft: 82 },
  { id: "2", name: "Julius", status: "next", emoji: "🦦", accentColor: "#FFD700" },
  { id: "3", name: "Redbeard", status: "completed", emoji: "🎙️", accentColor: "#9B59FF" },
  { id: "4", name: "Record Ralph", status: "queued", emoji: "🎧", accentColor: "#00D4FF" },
];

// ─── Main component ─────────────────────────────────────────────────────────────

export default function BattleOverlaySystem({
  mode = "battle",
  phase: controlledPhase,
  onPhaseChange,
  contestantA = DEFAULT_A,
  contestantB = DEFAULT_B,
  cypherQueue = DEFAULT_CYPHER_QUEUE,
  voteA = 62,
  voteB = 38,
  totalVotes = 61000,
  winnerSide,
  winnerPrize = "$2,500",
  winnerScore = "98.7",
  showOverlayLibrary = true,
  showPhaseControls = true,
}: BattleOverlaySystemProps) {
  const [internalPhase, setInternalPhase] = useState<BattlePhase>("intro");
  const phase = controlledPhase ?? internalPhase;
  const setPhase = (p: BattlePhase) => {
    setInternalPhase(p);
    onPhaseChange?.(p);
  };

  const winner = winnerSide === "B" ? contestantB : contestantA;

  return (
    <div style={{ color: "#E8E8FF", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Phase controls */}
      {showPhaseControls && (
        <PhaseControlBar phase={phase} onPhaseChange={setPhase} />
      )}

      {/* Main battle/phase display */}
      <div style={{
        background: "rgba(10,10,26,0.95)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12,
        padding: "16px 20px",
        marginBottom: 16,
      }}>
        {phase === "intro" && <IntroPhase a={contestantA} b={contestantB} />}
        {phase === "vs" && <VSPhase a={contestantA} b={contestantB} />}
        {phase === "perform" && (
          <PerformPhase a={contestantA} b={contestantB} activePerformer="A" />
        )}
        {phase === "vote" && (
          <VotePhase a={contestantA} b={contestantB} voteA={voteA} voteB={voteB} totalVotes={totalVotes} />
        )}
        {phase === "winner" && (
          <WinnerPhase winner={winner} prize={winnerPrize} score={winnerScore} />
        )}
      </div>

      {/* Cipher queue — shown for cypher mode or always below battle */}
      {(mode === "cypher" || mode === "battle") && (
        <div style={{
          background: "rgba(10,10,26,0.95)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 12,
          padding: "14px 18px",
          marginBottom: 14,
        }}>
          <CypherRuntimePanels queue={cypherQueue} />
        </div>
      )}

      {/* Overlay library */}
      {showOverlayLibrary && (
        <div style={{
          background: "rgba(10,10,26,0.95)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 12,
          padding: "14px 18px",
        }}>
          <OverlayLibrary />
        </div>
      )}
    </div>
  );
}
