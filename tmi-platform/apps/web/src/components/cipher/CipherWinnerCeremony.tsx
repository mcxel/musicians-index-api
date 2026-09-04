"use client";

/**
 * CipherWinnerCeremony — canonical cypher end overlay (evolved, not V2).
 *
 * Motions differ by endKind:
 *   SESSION_WRAP | ROTATION_COMPLETE | GROUP_JAM_CLOSE | MEMORY_MOMENT |
 *   STATS_VOTE_END | NO_MORE_PARTICIPANTS  → non-winner variants
 *   CHAMPION → Cypher King / Battle only (gold + fireworks + crown)
 *
 * Rule 20: never invent champion scores on normal cypher; only show real sessionStats.
 */

import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";
import CipherPerformerPanel from "./CipherPerformerPanel";
import type { CipherPerformer, CipherPresentationState } from "@/lib/cipher/CipherPresentationTypes";
import type { CypherEndKind } from "@/lib/eos/CypherRuntimeEngine";

export interface CipherWinnerStats {
  /** How many audience votes the winner received (from server) — King only */
  votePercentage?: number;
  versesWon?: number;
  reactionCount?: number;
  xpAwarded?: number;
  achievementUnlocked?: string;
}

/** Honest session metrics for non-winner wraps (optional). */
export interface CypherSessionEndStats {
  performerCount?: number;
  reactionCount?: number;
  versesCompleted?: number;
  sessionNumber?: number;
}

export interface CipherWinnerCeremonyProps {
  /** Required for CHAMPION; optional for collaborative wraps. */
  winner?: CipherPerformer | null;
  loser?: CipherPerformer;
  stats?: CipherWinnerStats;
  sessionStats?: CypherSessionEndStats;
  presentationState?: CipherPresentationState;
  /** Default CHAMPION when winner present; prefer explicit endKind. */
  endKind?: CypherEndKind;
  /** Force visible even outside WINNER_DECLARED / CEREMONY (session wrap loop). */
  forceVisible?: boolean;
  sponsor?: { name: string; logoUrl?: string };
  onClose?: () => void;
}

const FIREWORK_COLORS = ["#FFD700", "#FF2DAA", "#00FFFF", "#FFFFFF", "#AA2DFF"];
const CYAN_BURST = ["#00FFFF", "#AA2DFF", "#FF2DAA", "#FFFFFF"];

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

function ParticleLayer({ colors, count = 9 }: { colors: string[]; count?: number }) {
  const bursts = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      x: 60 + Math.random() * 80,
      y: 10 + Math.random() * 50,
      delay: i * 0.22,
      color: colors[i % colors.length]!,
    }));
  }, [colors, count]);

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {bursts.map((b, i) => (
        <FireworkBurst key={i} {...b} />
      ))}
    </div>
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

type MotionProfile = {
  title: string;
  subtitle: string;
  accent: string;
  flood: string;
  titleMotion: {
    initial: Record<string, number>;
    animate: Record<string, number>;
    transition: Record<string, unknown>;
  };
  showFireworks: boolean;
  fireworkColors: string[];
  showCrown: boolean;
};

function profileForKind(kind: CypherEndKind): MotionProfile {
  switch (kind) {
    case "CHAMPION":
      return {
        title: "👑 WINNER 👑",
        subtitle: "Cypher King",
        accent: "#FFD700",
        flood: "radial-gradient(ellipse at center, rgba(255,215,0,0.14) 0%, transparent 70%)",
        titleMotion: {
          initial: { opacity: 0, scale: 0.4, y: -20 },
          animate: { opacity: 1, scale: 1, y: 0 },
          transition: { duration: 0.6, ease: "backOut", delay: 0.1 },
        },
        showFireworks: true,
        fireworkColors: FIREWORK_COLORS,
        showCrown: true,
      };
    case "ROTATION_COMPLETE":
      return {
        title: "ROTATION COMPLETE",
        subtitle: "Spotlight handoff closed",
        accent: "#00FFFF",
        flood: "radial-gradient(ellipse at 80% 40%, rgba(0,255,255,0.12) 0%, transparent 65%)",
        titleMotion: {
          initial: { opacity: 0, x: 40 },
          animate: { opacity: 1, x: 0 },
          transition: { duration: 0.5, ease: "easeOut" },
        },
        showFireworks: false,
        fireworkColors: CYAN_BURST,
        showCrown: false,
      };
    case "GROUP_JAM_CLOSE":
      return {
        title: "GROUP JAM CLOSED",
        subtitle: "Circle stands down",
        accent: "#AA2DFF",
        flood: "radial-gradient(ellipse at center, rgba(170,45,255,0.16) 0%, transparent 70%)",
        titleMotion: {
          initial: { opacity: 0, scale: 1.35 },
          animate: { opacity: 1, scale: 1 },
          transition: { duration: 0.55, ease: "easeOut" },
        },
        showFireworks: true,
        fireworkColors: CYAN_BURST,
        showCrown: false,
      };
    case "MEMORY_MOMENT":
      return {
        title: "MEMORY SAVED",
        subtitle: "Moment captured to Memory Wall",
        accent: "#FF2DAA",
        flood: "radial-gradient(ellipse at 50% 70%, rgba(255,45,170,0.14) 0%, transparent 70%)",
        titleMotion: {
          initial: { opacity: 0, y: 28, scale: 0.9 },
          animate: { opacity: 1, y: 0, scale: 1 },
          transition: { duration: 0.5, ease: "easeOut" },
        },
        showFireworks: false,
        fireworkColors: ["#FF2DAA", "#FFFFFF"],
        showCrown: false,
      };
    case "STATS_VOTE_END":
      return {
        title: "SESSION STATS IN",
        subtitle: "Votes feed engagement — no champion",
        accent: "#00E5FF",
        flood: "linear-gradient(180deg, rgba(0,229,255,0.1) 0%, transparent 60%)",
        titleMotion: {
          initial: { opacity: 0, y: -12 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.4 },
        },
        showFireworks: false,
        fireworkColors: CYAN_BURST,
        showCrown: false,
      };
    case "NO_MORE_PARTICIPANTS":
      return {
        title: "NO MORE PARTICIPANTS",
        subtitle: "Restarting room · looking for performers",
        accent: "#FF2DAA",
        flood: "radial-gradient(ellipse at center, rgba(255,45,170,0.1) 0%, transparent 70%)",
        titleMotion: {
          initial: { opacity: 0, scale: 0.85, rotate: -2 },
          animate: { opacity: 1, scale: 1, rotate: 0 },
          transition: { duration: 0.55, ease: "backOut" },
        },
        showFireworks: false,
        fireworkColors: CYAN_BURST,
        showCrown: false,
      };
    case "SESSION_WRAP":
    default:
      return {
        title: "CYPHER SESSION CLOSED",
        subtitle: "Thanks for rolling through",
        accent: "#AA2DFF",
        flood: "radial-gradient(ellipse at center, rgba(170,45,255,0.12) 0%, transparent 70%)",
        titleMotion: {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.45 },
        },
        showFireworks: false,
        fireworkColors: CYAN_BURST,
        showCrown: false,
      };
  }
}

function SessionStatsCard({
  stats,
  accent,
}: {
  stats: CypherSessionEndStats;
  accent: string;
}) {
  const rows: { label: string; value: string }[] = [];
  if (stats.sessionNumber != null) rows.push({ label: "SESSION", value: `#${stats.sessionNumber}` });
  if (stats.performerCount != null) rows.push({ label: "PERFORMERS", value: String(stats.performerCount) });
  if (stats.versesCompleted != null) rows.push({ label: "VERSES", value: String(stats.versesCompleted) });
  if (stats.reactionCount != null) rows.push({ label: "REACTIONS", value: String(stats.reactionCount) });
  if (rows.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      style={{
        background: "rgba(5,5,16,0.88)",
        border: `1px solid ${accent}55`,
        borderRadius: 10,
        padding: "14px 18px",
        minWidth: 180,
      }}
    >
      <div style={{ color: accent, fontSize: 9, fontWeight: 900, letterSpacing: 2, marginBottom: 10 }}>
        SESSION STATS
      </div>
      {rows.map((r) => (
        <StatRow key={r.label} label={r.label} value={r.value} accent={accent} />
      ))}
    </motion.div>
  );
}

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
      {stats.votePercentage != null && (
        <StatRow label="AUDIENCE VOTE" value={`${Math.round(stats.votePercentage)}%`} accent="#FFD700" />
      )}
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

export default function CipherWinnerCeremony({
  winner,
  loser,
  stats,
  sessionStats,
  presentationState = "EXIT",
  endKind: endKindProp,
  forceVisible = false,
  sponsor,
  onClose,
}: CipherWinnerCeremonyProps) {
  const endKind: CypherEndKind =
    endKindProp ?? (winner ? "CHAMPION" : "SESSION_WRAP");
  const isChampion = endKind === "CHAMPION";
  const machineVisible =
    presentationState === "WINNER_DECLARED" ||
    presentationState === "CEREMONY" ||
    presentationState === "EXIT";
  const visible = forceVisible || (isChampion ? machineVisible && Boolean(winner) : forceVisible || machineVisible);
  const profile = profileForKind(endKind);

  // Champion path requires a real winner — never fabricate
  if (isChampion && !winner) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={`cypher-end-${endKind}`}
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
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: profile.flood,
              pointerEvents: "none",
            }}
          />

          {profile.showFireworks && <ParticleLayer colors={profile.fireworkColors} />}

          {/* Soft orbital ring for non-champion wraps (different motion language) */}
          {!isChampion && (
            <motion.div
              aria-hidden
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 0.35, scale: 1.15 }}
              transition={{ duration: 1.1, ease: "easeOut" }}
              style={{
                position: "absolute",
                width: 220,
                height: 220,
                borderRadius: "50%",
                border: `2px solid ${profile.accent}44`,
                boxShadow: `0 0 40px ${profile.accent}22`,
              }}
            />
          )}

          <motion.div
            initial={profile.titleMotion.initial}
            animate={profile.titleMotion.animate}
            transition={profile.titleMotion.transition}
            style={{
              fontSize: isChampion ? 36 : 22,
              fontWeight: 900,
              letterSpacing: isChampion ? 8 : 4,
              color: profile.accent,
              textShadow: `0 0 30px ${profile.accent}`,
              textTransform: "uppercase",
              marginBottom: 8,
              textAlign: "center",
              padding: "0 16px",
            }}
          >
            {profile.title}
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.5)",
              letterSpacing: 1.5,
              marginBottom: 18,
              textAlign: "center",
            }}
          >
            {profile.subtitle}
          </motion.div>

          {isChampion && winner && stats ? (
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
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2, ease: "backOut" }}
                style={{ flex: "0 0 220px" }}
              >
                <CipherPerformerPanel
                  performer={{ ...winner, accentColor: "#FFD700" }}
                  variant="WINNER"
                  presentationState={presentationState}
                />
              </motion.div>
              <WinnerStatsCard winner={winner} stats={stats} />
            </div>
          ) : (
            sessionStats && <SessionStatsCard stats={sessionStats} accent={profile.accent} />
          )}

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
                border: `1px solid ${profile.accent}40`,
              }}
            >
              {sponsor.logoUrl && (
                <img
                  src={sponsor.logoUrl}
                  alt={sponsor.name}
                  style={{ height: 22, objectFit: "contain" }}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
              <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 10, letterSpacing: 1 }}>
                Presented by <strong style={{ color: profile.accent }}>{sponsor.name}</strong>
              </span>
            </motion.div>
          )}

          {onClose && (
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: isChampion ? 1.5 : 0.9 }}
              onClick={onClose}
              style={{
                marginTop: 24,
                padding: "10px 28px",
                borderRadius: 8,
                border: `1px solid ${profile.accent}73`,
                background: `${profile.accent}1f`,
                color: profile.accent,
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: 2,
                textTransform: "uppercase",
                cursor: "pointer",
                pointerEvents: "auto",
              }}
            >
              {endKind === "NO_MORE_PARTICIPANTS" ? "Open Recruiting →" : "Continue →"}
            </motion.button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
