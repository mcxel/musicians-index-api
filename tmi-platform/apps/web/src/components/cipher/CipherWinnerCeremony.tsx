"use client";

/**
 * CipherWinnerCeremony.tsx
 *
 * Full gold winner ceremony layer for TMI Cipher / Battle rooms.
 *
 * Triggered when CipherPresentationStateMachine reaches WINNER_DECLARED
 * or CEREMONY state. All values come from BattleWinnerEngine.settleWinner()
 * — never invented (Rule 20).
 *
 * Visual layers (rendered in z-order):
 *   1. Gold light flood (radial gradient overlay)
 *   2. Winner performer panel (centered, gold border, 👑)
 *   3. Winner stats card (right column)
 *   4. Loser PiP (bottom-left)
 *   5. WINNER title burst (animated)
 *   6. Fireworks (CSS particle bursts — no Three.js)
 *   7. Sponsor lower-third (optional, from SponsorRegistry)
 */

import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";
import CipherPerformerPanel from "./CipherPerformerPanel";
import type { CipherPerformer, CipherPresentationState } from "@/lib/cipher/CipherPresentationTypes";

export interface CipherWinnerStats {
  /** How many audience votes the winner received (from server) */
  votePercentage: number;
  /** Battle wins this session */
  versesWon?: number;
  /** Total audience reactions during their performance */
  reactionCount?: number;
  /** XP awarded — from ProgressionEngine.processCompetitiveWin */
  xpAwarded?: number;
  /** Achievement unlocked */
  achievementUnlocked?: string;
}

export interface CipherWinnerCeremonyProps {
  winner: CipherPerformer;
  loser?: CipherPerformer;
  stats: CipherWinnerStats;
  presentationState: CipherPresentationState;
  /** Sponsor name/logo to display in lower-third */
  sponsor?: { name: string; logoUrl?: string };
  onClose?: () => void;
}

// ─── CSS Keyframe firework particle ──────────────────────────────────────────
// Each FireworkBurst produces 8 particles radiating outward from a center point.

const FIREWORK_COLORS = ["#FFD700", "#FF2DAA", "#00FFFF", "#FFFFFF", "#AA2DFF"];

interface BurstProps {
  x: number;
  y: number;
  delay: number;
  color: string;
}

function FireworkBurst({ x, y, delay, color }: BurstProps) {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * 360;
        const dist = 55 + Math.random() * 35;
        const tx = Math.cos((angle * Math.PI) / 180) * dist;
        const ty = Math.sin((angle * Math.PI) / 180) * dist;
        return (
          <motion.div
            key={i}
            initial={{ x, y, opacity: 1, scale: 1 }}
            animate={{ x: x + tx, y: y + ty, opacity: 0, scale: 0.3 }}
            transition={{ duration: 0.9 + Math.random() * 0.4, delay, ease: "easeOut" }}
            style={{
              position: "absolute",
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: color,
              boxShadow: `0 0 6px 2px ${color}`,
              pointerEvents: "none",
            }}
          />
        );
      })}
    </>
  );
}

function FireworksLayer() {
  const bursts = useMemo(() => {
    return Array.from({ length: 9 }).map((_, i) => ({
      x: 60 + Math.random() * 80,
      y: 10 + Math.random() * 50,
      delay: i * 0.22,
      color: FIREWORK_COLORS[i % FIREWORK_COLORS.length]!,
    }));
  }, []);

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {bursts.map((b, i) => (
        <FireworkBurst key={i} {...b} />
      ))}
    </div>
  );
}

// ─── Winner stats card ────────────────────────────────────────────────────────

function WinnerStatsCard({ winner, stats }: { winner: CipherPerformer; stats: CipherWinnerStats }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      style={{
        background: "rgba(5,5,16,0.88)",
        border: "1px solid rgba(255,215,0,0.4)",
        borderRadius: 10,
        padding: "18px 20px",
        minWidth: 200,
        backdropFilter: "blur(12px)",
      }}
    >
      <div
        style={{
          color: "#FFD700",
          fontSize: 10,
          fontWeight: 900,
          letterSpacing: 2,
          marginBottom: 12,
          textTransform: "uppercase",
        }}
      >
        WINNER STATS
      </div>
      <StatRow label="AUDIENCE VOTE" value={`${Math.round(stats.votePercentage)}%`} accent="#FFD700" />
      {stats.versesWon !== undefined && (
        <StatRow label="VERSES WON" value={String(stats.versesWon)} accent="#00FFFF" />
      )}
      {stats.reactionCount !== undefined && (
        <StatRow label="REACTIONS" value={String(stats.reactionCount)} accent="#FF2DAA" />
      )}
      {stats.xpAwarded !== undefined && (
        <StatRow label="XP EARNED" value={`+${stats.xpAwarded}`} accent="#AA2DFF" />
      )}
      {stats.achievementUnlocked && (
        <div style={{ marginTop: 12, padding: "8px 10px", background: "rgba(255,215,0,0.08)", borderRadius: 6 }}>
          <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 9, marginBottom: 3 }}>ACHIEVEMENT UNLOCKED</div>
          <div style={{ color: "#FFD700", fontSize: 12, fontWeight: 800 }}>🏆 {stats.achievementUnlocked}</div>
        </div>
      )}
    </motion.div>
  );
}

function StatRow({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
      <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, letterSpacing: 1 }}>{label}</span>
      <span style={{ color: accent, fontSize: 14, fontWeight: 900 }}>{value}</span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CipherWinnerCeremony({
  winner,
  loser,
  stats,
  presentationState,
  sponsor,
  onClose,
}: CipherWinnerCeremonyProps) {
  const visible = presentationState === "WINNER_DECLARED" || presentationState === "CEREMONY";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="winner-ceremony"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 60,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          {/* Gold light flood */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(ellipse at center, rgba(255,215,0,0.14) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          {/* Fireworks */}
          <FireworksLayer />

          {/* WINNER title burst */}
          <motion.div
            initial={{ opacity: 0, scale: 0.4, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "backOut", delay: 0.1 }}
            style={{
              fontSize: 36,
              fontWeight: 900,
              letterSpacing: 8,
              color: "#FFD700",
              textShadow: "0 0 30px #FFD700, 0 0 60px rgba(255,215,0,0.5)",
              textTransform: "uppercase",
              marginBottom: 16,
              textAlign: "center",
            }}
          >
            👑 WINNER 👑
          </motion.div>

          {/* Main content row: loser PiP | winner panel | stats card */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 20,
              width: "100%",
              maxWidth: 900,
              padding: "0 20px",
            }}
          >
            {/* Loser PiP (left) */}
            {loser && (
              <motion.div
                initial={{ opacity: 0, scale: 0.7, x: -20 }}
                animate={{ opacity: 0.65, scale: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                style={{ flex: "0 0 120px" }}
              >
                <CipherPerformerPanel
                  performer={loser}
                  variant="SECONDARY"
                  presentationState={presentationState}
                  style={{ filter: "grayscale(55%) brightness(0.7)" }}
                />
              </motion.div>
            )}

            {/* Winner panel (center) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "backOut" }}
              style={{
                flex: "0 0 220px",
              }}
            >
              <CipherPerformerPanel
                performer={{ ...winner, accentColor: "#FFD700" }}
                variant="WINNER"
                presentationState={presentationState}
              />
            </motion.div>

            {/* Stats card (right) */}
            <WinnerStatsCard winner={winner} stats={stats} />
          </div>

          {/* Sponsor lower-third */}
          {sponsor && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              style={{
                marginTop: 20,
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "rgba(0,0,0,0.6)",
                padding: "6px 16px",
                borderRadius: 6,
                border: "1px solid rgba(255,215,0,0.25)",
              }}
            >
              {sponsor.logoUrl && (
                <img
                  src={sponsor.logoUrl}
                  alt={sponsor.name}
                  style={{ height: 22, objectFit: "contain" }}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
              )}
              <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 10, letterSpacing: 1 }}>
                Presented by <strong style={{ color: "#FFD700" }}>{sponsor.name}</strong>
              </span>
            </motion.div>
          )}

          {/* Close / continue button — pointer-events re-enabled */}
          {onClose && (
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              onClick={onClose}
              style={{
                marginTop: 24,
                padding: "10px 28px",
                borderRadius: 8,
                border: "1px solid rgba(255,215,0,0.45)",
                background: "rgba(255,215,0,0.12)",
                color: "#FFD700",
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: 2,
                textTransform: "uppercase",
                cursor: "pointer",
                pointerEvents: "auto",
              }}
            >
              Continue →
            </motion.button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
