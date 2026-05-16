"use client";

import { ImageSlotWrapper } from '@/components/visual-enforcement';
// RankStackRiseLayer
// Vertical rank elevator — entries rise upward from below, snap into place with spring overshoot.
// Micro-animations: thumb pop (👍), rise arrow (↑ green), drop arrow (↓ red), hold (→ gold),
//                   crown pulse (#1), fire streak (streak > 3).
// No circular orbit. Pure vertical chart energy.

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SpreadRankEntry } from "@/engines/home/SpreadRankAuthorityEngine";
import SpreadRankChip from "@/components/ranking/SpreadRankChip";
import VotePulseButton from "@/components/voting/VotePulseButton";

// ─── TIMING ──────────────────────────────────────────────────────────────────
const RISE_STAGGER_MS = 160;     // Build Director: 120ms–220ms per slot
const RISE_BASE_DELAY_MS = 0;
const HOLD_DURATION_MS = 4000;   // Hold visible for 4 seconds after animation

// ─── SPRING ──────────────────────────────────────────────────────────────────
// High stiffness + slight overshoot → "awkward funny rise" as specified
const RISE_SPRING = { type: "spring" as const, stiffness: 420, damping: 22, mass: 0.8 };
const THUMB_SPRING = { type: "spring" as const, stiffness: 600, damping: 18 };

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function movementColor(m: SpreadRankEntry["movement"]): string {
  if (m === "rising")  return "#22c55e"; // green
  if (m === "falling") return "#ef4444"; // red
  return "#eab308";                       // gold
}

function movementArrow(m: SpreadRankEntry["movement"]): string {
  if (m === "rising")  return "↑";
  if (m === "falling") return "↓";
  return "→";
}

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

function ThumbPop({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.span
          key="thumb"
          initial={{ scale: 0, opacity: 0, y: 4 }}
          animate={{ scale: 1.4, opacity: 1, y: 0 }}
          exit={{ scale: 0, opacity: 0, y: -4 }}
          transition={THUMB_SPRING}
          style={{
            position: "absolute",
            top: -10,
            right: -4,
            fontSize: 11,
            lineHeight: 1,
            userSelect: "none",
            pointerEvents: "none",
          }}
        >
          👍
        </motion.span>
      )}
    </AnimatePresence>
  );
}

function ArrowFlash({ movement }: { movement: SpreadRankEntry["movement"] }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 900);
    return () => clearTimeout(t);
  }, [movement]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.span
          key={`arrow-${movement}`}
          initial={{ opacity: 0, x: movement === "rising" ? -4 : 4, scale: 0.7 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.18 }}
          style={{
            color: movementColor(movement),
            fontSize: 10,
            fontWeight: 900,
            marginLeft: 3,
            lineHeight: 1,
          }}
        >
          {movementArrow(movement)}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

function CrownBadge() {
  return (
    <motion.span
      animate={{ scale: [1, 1.25, 1], opacity: [1, 0.7, 1] }}
      transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
      style={{ fontSize: 11, marginRight: 3, lineHeight: 1, userSelect: "none" }}
    >
      👑
    </motion.span>
  );
}

function FireStreak() {
  return (
    <motion.span
      animate={{ scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }}
      transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
      style={{ fontSize: 9, marginLeft: 3, lineHeight: 1, userSelect: "none" }}
    >
      🔥
    </motion.span>
  );
}

function HeatPulse() {
  return (
    <motion.div
      animate={{
        boxShadow: [
          "0 0 0px rgba(255, 69, 0, 0)",
          "0 0 12px rgba(255, 69, 0, 0.6)",
          "0 0 0px rgba(255, 69, 0, 0)",
        ],
      }}
      transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      style={{
        position: "absolute",
        inset: -4,
        borderRadius: 7,
        pointerEvents: "none",
      }}
    />
  );
}

function ApplauseBubbleFloat({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <>
          {([0, 1, 2] as const).map((i) => (
            <motion.span
              key={`clap-${i}`}
              initial={{ opacity: 0.85, y: 0, x: (i - 1) * 9, scale: 0.75 + i * 0.12 }}
              animate={{ opacity: 0, y: -38 - i * 9, x: (i - 1) * 13 }}
              exit={{}}
              transition={{ duration: 0.65 + i * 0.14, ease: "easeOut", delay: i * 0.09 }}
              style={{
                position: "absolute",
                top: "30%",
                left: "42%",
                fontSize: 10,
                lineHeight: 1,
                pointerEvents: "none",
                userSelect: "none",
                zIndex: 22,
              }}
            >
              👏
            </motion.span>
          ))}
        </>
      )}
    </AnimatePresence>
  );
}

function RankDisplacementFlash({
  accentColor,
}: {
  accentColor: string;
}) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0.55 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.38, ease: "easeOut" }}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 7,
          background: `${accentColor}35`,
          pointerEvents: "none",
          zIndex: 12,
        }}
      />
      <motion.div
        initial={{ scale: 0.85, opacity: 0.75 }}
        animate={{ scale: 1.55, opacity: 0 }}
        transition={{ duration: 0.48, ease: "easeOut" }}
        style={{
          position: "absolute",
          inset: -3,
          borderRadius: 10,
          border: `1.5px solid ${accentColor}`,
          pointerEvents: "none",
          zIndex: 12,
        }}
      />
    </>
  );
}

function CrowdHeatMeter({
  score,
  maxScore,
}: {
  score: number;
  maxScore: number;
}) {
  const pct = maxScore > 0 ? Math.min(score / maxScore, 1) : 0;
  const barH = Math.round(pct * 26);
  const color =
    pct > 0.75 ? "#ef4444" : pct > 0.45 ? "#f97316" : "#eab308";

  return (
    <div
      style={{
        width: 3,
        height: 26,
        borderRadius: 2,
        background: "rgba(255,255,255,0.06)",
        overflow: "hidden",
        flexShrink: 0,
        position: "relative",
        alignSelf: "center",
      }}
    >
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: barH }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          background: color,
          borderRadius: 2,
          boxShadow: `0 0 4px ${color}88`,
        }}
      />
    </div>
  );
}

function NewEntryBadge() {
  return (
    <motion.span
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      style={{
        fontSize: 6,
        fontWeight: 900,
        letterSpacing: "0.16em",
        padding: "1px 4px",
        borderRadius: 3,
        background: "#FF2DAA",
        color: "#fff",
        textTransform: "uppercase",
        lineHeight: 1,
        userSelect: "none",
        marginLeft: 4,
      }}
    >
      New
    </motion.span>
  );
}

// ─── RANK ROW ─────────────────────────────────────────────────────────────────

interface RankRowProps {
  entry: SpreadRankEntry;
  index: number;
  activated: boolean;
  accentColor: string;
  maxScore: number;
  enableRowHoverLift: boolean;
  enableVoteGlow: boolean;
}

function RankRow({ entry, index, activated, accentColor, maxScore, enableRowHoverLift, enableVoteGlow }: RankRowProps) {
  const [showThumb, setShowThumb] = useState(false);
  const [showApplause, setShowApplause] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const isFirst = entry.rank === 1;
  const hasStreak = (entry.streak ?? 0) > 3;
  const isNewEntry = entry.previousRank > entry.rank + 2 || entry.previousRank > 50;
  const jumped = entry.previousRank - entry.rank >= 3;
  // Reveal order must be 10 -> 1 (bottom to top), not grouped.
  const revealIndex = Math.max(0, 10 - entry.rank);
  const rowDelay = RISE_BASE_DELAY_MS + revealIndex * RISE_STAGGER_MS;
  const nearWin = entry.rank >= 2 && entry.rank <= 4;
  const fastDrop = entry.previousRank > 0 && entry.rank - entry.previousRank >= 2;

  // thumb pop fires once after row settles
  useEffect(() => {
    if (!activated) return;
    const t = setTimeout(() => {
      setShowThumb(true);
      setTimeout(() => setShowThumb(false), 700);
    }, rowDelay + 380);
    return () => clearTimeout(t);
  }, [activated, rowDelay]);

  // applause bubbles fire once for top-3 entries on activation
  useEffect(() => {
    if (!activated || entry.rank > 3) return;
    const t = setTimeout(() => {
      setShowApplause(true);
      setTimeout(() => setShowApplause(false), 800);
    }, rowDelay + 200);
    return () => clearTimeout(t);
  }, [activated, rowDelay, entry.rank]);

  // displacement flash fires once for big jumps on activation
  useEffect(() => {
    if (!activated || !jumped) return;
    const t = setTimeout(() => {
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 520);
    }, rowDelay + 80);
    return () => clearTimeout(t);
  }, [activated]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.div
      layout
      whileHover={enableRowHoverLift ? { y: -2, boxShadow: `0 0 14px ${accentColor}44` } : undefined}
      initial={{ y: 60, opacity: 0, scale: 0.9 }}
      animate={
        activated
          ? { y: [0, -2, 0], opacity: 1, scale: [0.9, 1.02, 1] }
          : { y: 60, opacity: 0, scale: 0.9 }
      }
      transition={{ ...RISE_SPRING, delay: rowDelay / 1000 }}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 9,
        padding: "5px 8px",
        borderRadius: 7,
        background: isFirst
          ? `linear-gradient(90deg, rgba(255,213,0,0.12), rgba(255,213,0,0.04))`
          : "rgba(255,255,255,0.03)",
        border: isFirst
          ? "1px solid rgba(255,213,0,0.3)"
          : nearWin
            ? "1px solid rgba(255,45,170,0.35)"
            : "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Heat pulse for top entries or on fire */}
      {(isFirst || hasStreak) && <HeatPulse />}

      {/* Near-win pulse for ranks 2-4 */}
      {nearWin && (
        <motion.div
          animate={{ opacity: [0.22, 0.5, 0.22] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            inset: -2,
            borderRadius: 8,
            border: "1px solid rgba(255,45,170,0.5)",
            pointerEvents: "none",
            zIndex: 11,
          }}
        />
      )}

      {/* Falling alert trail for rapid drops */}
      {fastDrop && (
        <motion.div
          initial={{ opacity: 0.7, x: 0 }}
          animate={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          style={{
            position: "absolute",
            left: -8,
            top: "50%",
            transform: "translateY(-50%)",
            width: 18,
            height: 5,
            borderRadius: 6,
            background: "linear-gradient(90deg, rgba(239,68,68,0.85), rgba(239,68,68,0.05))",
            pointerEvents: "none",
            zIndex: 11,
          }}
        />
      )}

      {/* Displacement flash — big rank jump */}
      {showFlash && <RankDisplacementFlash accentColor={accentColor} />}

      {/* Applause bubbles — top-3 vote spike */}
      <ApplauseBubbleFloat active={showApplause} />

      {/* Thumb pop anchor */}
      <ThumbPop show={showThumb} />

      {/* Rank chip — replaces plain text rank number */}
      <SpreadRankChip rank={entry.rank} accentColor={accentColor} />

      {/* Profile image */}
      {entry.profileImage && (
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            overflow: "hidden",
            border: `1px solid ${isFirst ? "#FFD500" : accentColor}44`,
            flexShrink: 0,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <ImageSlotWrapper imageId="img-f0x30c" roomId="runtime-surface" priority="normal" className="w-full h-full object-cover" altText="Content image" containerStyle={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Name + movement */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center" }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: isFirst ? "#FFD500" : "rgba(255,255,255,0.88)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "100%",
          }}
        >
          {entry.name}
        </span>
        {isNewEntry && <NewEntryBadge />}
        {hasStreak && <FireStreak />}
        <ArrowFlash movement={entry.movement} />
      </div>

      {/* Crowd heat meter */}
      <CrowdHeatMeter score={entry.score} maxScore={maxScore} />

      {/* Score */}
      <div
        style={{
          fontSize: 10,
          fontWeight: 800,
          color: accentColor,
          flexShrink: 0,
          letterSpacing: "0.04em",
        }}
      >
        {entry.score.toLocaleString()}
      </div>

      {/* Vote button */}
      <VotePulseButton
        artistId={entry.id}
        initialVotes={0}
        accentColor={accentColor}
        glow={enableVoteGlow}
      />
    </motion.div>
  );
}

// ─── STACK REPLACE WRAPPER ────────────────────────────────────────────────────

interface RankStackRiseLayerProps {
  entries: SpreadRankEntry[];
  category: string;
  accentColor: string;
  activated: boolean;
  /** Optional cycle key — changing this triggers stack replacement animation */
  cycleKey?: string | number;
  enableRowHoverLift?: boolean;
  enableVoteGlow?: boolean;
}

export default function RankStackRiseLayer({
  entries,
  category,
  accentColor,
  activated,
  cycleKey,
  enableRowHoverLift = false,
  enableVoteGlow = false,
}: RankStackRiseLayerProps) {
  const [displayedKey, setDisplayedKey] = useState(cycleKey);
  const [displayedEntries, setDisplayedEntries] = useState(entries);
  const maxScore = displayedEntries.length > 0
    ? Math.max(...displayedEntries.map((e) => e.score))
    : 1;
  const [isReplacing, setIsReplacing] = useState(false);
  const [crownTransfer, setCrownTransfer] = useState<{ from: string; to: string } | null>(null);

  // When cycleKey changes, animate stack replacement from below
  useEffect(() => {
    if (cycleKey === displayedKey) return;
    const prevTop = displayedEntries.find((e) => e.rank === 1)?.id;
    const nextTop = entries.find((e) => e.rank === 1)?.id;
    if (prevTop && nextTop && prevTop !== nextTop) {
      setCrownTransfer({ from: prevTop, to: nextTop });
      const tCrown = setTimeout(() => setCrownTransfer(null), 760);
      void tCrown;
    }
    setIsReplacing(true);
    const t = setTimeout(() => {
      setDisplayedEntries(entries);
      setDisplayedKey(cycleKey);
      setIsReplacing(false);
    }, 280);
    return () => clearTimeout(t);
  }, [cycleKey, entries]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Category header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
          paddingBottom: 5,
          borderBottom: `1px solid ${accentColor}33`,
        }}
      >
        <span
          style={{
            fontSize: 8,
            fontWeight: 900,
            letterSpacing: "0.25em",
            color: accentColor,
            textTransform: "uppercase",
          }}
        >
          Top 10 {category}
        </span>
        {activated && (
          <span
            style={{
              fontSize: 7,
              fontWeight: 800,
              color: "rgba(255,255,255,0.35)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Live
          </span>
        )}
      </div>

      {/* Entry stack */}
      {crownTransfer && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{
            marginBottom: 6,
            fontSize: 8,
            fontWeight: 900,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#FFD500",
          }}
        >
          Crown Transfer Active
        </motion.div>
      )}
      <AnimatePresence mode="wait">
        <motion.div
          key={`stack-${displayedKey ?? "init"}`}
          initial={{ y: isReplacing ? 40 : 0, opacity: isReplacing ? 0 : 1 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -30, opacity: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 0 }}
        >
          {displayedEntries.slice(0, 10).map((entry, i) => (
            <RankRow
              key={entry.id}
              entry={entry}
              index={i}
              activated={activated && !isReplacing}
              accentColor={accentColor}
              maxScore={maxScore}
              enableRowHoverLift={enableRowHoverLift}
              enableVoteGlow={enableVoteGlow}
            />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
