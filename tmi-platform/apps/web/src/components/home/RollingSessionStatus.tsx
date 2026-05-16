"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ROTATION_SCHEDULE,
  resolvePhaseState,
  formatMsRemaining,
  getPhaseLabel,
  getNextRotationSlot,
  type PhaseState,
  type SessionType,
} from "@/engines/performance/RollingCypherBattleEngine";
import { getBeatsByGenre, getBeatLabel } from "@/engines/performance/BeatQueueEngine";

// Stable epoch — all clients sync to the same rotation without a server
// Anchored to a fixed unix timestamp so the cycle is deterministic
const ROTATION_EPOCH_MS = 1746316800000; // 2026-05-04 00:00:00 UTC

function useRollingPhase(filterType?: SessionType): PhaseState | null {
  const [phase, setPhase] = useState<PhaseState | null>(null);

  useEffect(() => {
    function compute() {
      const state = resolvePhaseState(Date.now(), ROTATION_EPOCH_MS);
      if (!filterType || state.slot.type === filterType) {
        setPhase(state);
        return;
      }
      // Scan forward to find next slot of matching type
      const totalSlots = ROTATION_SCHEDULE.length;
      for (let offset = 1; offset < totalSlots; offset++) {
        const idx = (state.rotationIndex + offset) % totalSlots;
        const candidate = ROTATION_SCHEDULE[idx];
        if (candidate && candidate.type === filterType) {
          setPhase({ ...state, slot: candidate, rotationIndex: idx, phase: "join_window", msRemaining: candidate.joinWindowMs, msElapsed: 0 });
          return;
        }
      }
      setPhase(state);
    }

    compute();
    const interval = setInterval(compute, 1000);
    return () => clearInterval(interval);
  }, [filterType]);

  return phase;
}

type Props = {
  mode: SessionType;
  accentColor?: string;
  beatGenre?: string;
};

export default function RollingSessionStatus({ mode, accentColor = "#AA2DFF", beatGenre }: Props) {
  const phase = useRollingPhase(mode);

  if (!phase) return null;

  const { slot, phase: currentPhase, msRemaining } = phase;
  const isOpen = currentPhase === "join_window";
  const isLive = currentPhase === "performance";
  const isBeatLocked = currentPhase !== "join_window" && currentPhase !== "beat_selection" && currentPhase !== "reset_window";

  const genreForBeats = beatGenre ?? slot.genre;
  const beats = getBeatsByGenre(genreForBeats);
  const topBeat = beats[0];

  const nextSlot = getNextRotationSlot(phase.rotationIndex);
  const statusLabel = getPhaseLabel(currentPhase);
  const timeStr = formatMsRemaining(msRemaining);

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        borderRadius: 10,
        border: `1px solid ${accentColor}2a`,
        background: `${accentColor}07`,
        padding: "8px 12px",
        marginBottom: 8,
      }}
    >
      {/* Status row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <motion.span
            animate={isOpen || isLive ? { opacity: [1, 0.3, 1] } : { opacity: 1 }}
            transition={{ duration: 1.2, repeat: Infinity }}
            style={{
              width: 6, height: 6, borderRadius: "50%",
              background: isLive ? "#FF2DAA" : isOpen ? "#00FF88" : accentColor,
              boxShadow: `0 0 6px ${isLive ? "#FF2DAA" : isOpen ? "#00FF88" : accentColor}`,
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: 7, fontWeight: 900, letterSpacing: "0.2em", color: isLive ? "#FF2DAA" : isOpen ? "#00FF88" : accentColor, textTransform: "uppercase" }}>
            {isOpen ? (mode === "cypher" ? "OPEN NOW" : "JOIN NOW") : statusLabel}
          </span>
        </div>
        <span style={{ fontSize: 8, fontWeight: 900, color: accentColor, fontVariantNumeric: "tabular-nums" }}>
          {isOpen ? `${timeStr} remaining` : timeStr}
        </span>
      </div>

      {/* Info row */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {/* Beat info */}
        <div style={{ fontSize: 7, color: "rgba(255,255,255,0.4)" }}>
          {isBeatLocked ? (
            <span>Beat locked · <span style={{ color: accentColor }}>{topBeat ? getBeatLabel(topBeat) : slot.genre}</span></span>
          ) : (
            <span>Beat Queue · <span style={{ color: "rgba(255,255,255,0.6)" }}>{topBeat ? `${topBeat.genre} / ${topBeat.subGenre ?? topBeat.genre}` : slot.genre}</span></span>
          )}
        </div>

        {/* Slot info (cypher) or genre (battle) */}
        {mode === "cypher" ? (
          <div style={{ fontSize: 7, color: "rgba(255,255,255,0.4)" }}>
            Slots · <span style={{ color: accentColor }}>{Math.floor(slot.slots * 0.6)}/{slot.slots}</span>
          </div>
        ) : (
          <div style={{ fontSize: 7, color: "rgba(255,255,255,0.4)" }}>
            Genre · <span style={{ color: accentColor }}>{slot.genre} {slot.modeType}</span>
          </div>
        )}

        {/* Next rotation */}
        {(currentPhase === "winner_window" || currentPhase === "reset_window") && (
          <div style={{ fontSize: 7, color: "rgba(255,255,255,0.3)" }}>
            Next · <span style={{ color: "rgba(255,255,255,0.5)" }}>{nextSlot.label}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
