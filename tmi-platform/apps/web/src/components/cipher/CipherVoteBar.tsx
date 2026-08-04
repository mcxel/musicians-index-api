"use client";

/**
 * CipherVoteBar.tsx
 *
 * Two-color split vote meter for TMI Cipher / Battle clash moments.
 *
 * Anti-manipulation design (Rule 20):
 *   - displayedPercentages MUST come from the server-validated vote store
 *     (BattleVoteClosureEngine or equivalent) — never from raw client clicks
 *   - This component is a DISPLAY layer only. It calls onVote() which
 *     dispatches to the server; the server returns an updated percentage.
 *   - No optimistic percentage update — the display waits for server confirm.
 *
 * Vote states (CipherVoteStatus):
 *   CLOSED    — bar hidden / collapsed
 *   OPENING   — animate in
 *   OPEN      — voting active, counts updating from server
 *   LOCKING   — countdown reaching zero, red pulse
 *   LOCKED    — voting ended, final percentages shown, no interaction
 */

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import type { CipherVoteState, CipherPerformer } from "@/lib/cipher/CipherPresentationTypes";

export interface CipherVoteBarProps {
  voteState: CipherVoteState;
  leftPerformer: CipherPerformer;
  rightPerformer: CipherPerformer;
  /** Called when a viewer taps a vote button. The server must handle the rest. */
  onVote?: (performerId: string) => void;
  /** Whether the current viewer has already voted (from server session) */
  hasVoted?: boolean;
  /** The performer ID this viewer voted for (from server session) */
  votedForId?: string;
}

// ─── Countdown clock ─────────────────────────────────────────────────────────

function useCountdownMs(closesAt?: number): number {
  const [remaining, setRemaining] = useState<number>(
    closesAt ? Math.max(0, closesAt - Date.now()) : 0
  );
  useEffect(() => {
    if (!closesAt) return;
    const id = setInterval(() => {
      setRemaining(Math.max(0, closesAt - Date.now()));
    }, 250);
    return () => clearInterval(id);
  }, [closesAt]);
  return remaining;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CipherVoteBar({
  voteState,
  leftPerformer,
  rightPerformer,
  onVote,
  hasVoted = false,
  votedForId,
}: CipherVoteBarProps) {
  const { status, closesAt, displayedPercentages } = voteState;
  const remainingMs = useCountdownMs(closesAt);
  const remainingSec = Math.ceil(remainingMs / 1000);
  const isLocking = status === "LOCKING";
  const isLocked = status === "LOCKED";
  const canVote = (status === "OPEN" || status === "LOCKING") && !hasVoted;

  const leftPct = displayedPercentages[leftPerformer.id] ?? 50;
  const rightPct = displayedPercentages[rightPerformer.id] ?? 50;

  if (status === "CLOSED") return null;

  return (
    <AnimatePresence>
      <motion.div
        key="vote-bar"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.35, ease: "backOut" }}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 580,
          margin: "0 auto",
          padding: "0 4px 4px",
        }}
      >
        {/* Status header */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 10,
            marginBottom: 6,
          }}
        >
          {/* Locking pulse indicator */}
          {isLocking && (
            <motion.div
              style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF2020" }}
              animate={{ opacity: [1, 0.2, 1], scale: [1, 1.3, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
          )}
          <span
            style={{
              color: isLocked ? "rgba(255,255,255,0.45)" : isLocking ? "#FF2020" : "#FFD700",
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            {isLocked ? "VOTES LOCKED" : isLocking ? "LOCKING…" : "VOTE NOW"}
          </span>
          {/* Countdown */}
          {(status === "OPEN" || status === "LOCKING") && closesAt && (
            <span
              style={{
                color: remainingSec <= 5 ? "#FF2020" : "rgba(255,255,255,0.6)",
                fontSize: 11,
                fontWeight: 700,
                minWidth: 28,
                textAlign: "right",
              }}
            >
              {remainingSec}s
            </span>
          )}
        </div>

        {/* Split percentage bar */}
        <div
          style={{
            position: "relative",
            height: 8,
            borderRadius: 4,
            overflow: "hidden",
            background: "rgba(255,255,255,0.08)",
          }}
        >
          <motion.div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              background: leftPerformer.accentColor ?? "#00FFFF",
              borderRadius: "4px 0 0 4px",
            }}
            animate={{ width: `${leftPct}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
          {/* Center divider */}
          <div
            style={{
              position: "absolute",
              left: `${leftPct}%`,
              top: -2,
              bottom: -2,
              width: 2,
              background: "#fff",
              transform: "translateX(-50%)",
            }}
          />
          <motion.div
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              bottom: 0,
              background: rightPerformer.accentColor ?? "#FFD700",
              borderRadius: "0 4px 4px 0",
            }}
            animate={{ width: `${rightPct}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        {/* Percentages row */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          <span style={{ color: leftPerformer.accentColor ?? "#00FFFF", fontSize: 14, fontWeight: 900 }}>
            {Math.round(leftPct)}%
          </span>
          <span style={{ color: rightPerformer.accentColor ?? "#FFD700", fontSize: 14, fontWeight: 900 }}>
            {Math.round(rightPct)}%
          </span>
        </div>

        {/* Vote buttons */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginTop: 8,
          }}
        >
          {/* Left performer vote */}
          <VoteButton
            performerId={leftPerformer.id}
            label={leftPerformer.displayName}
            accent={leftPerformer.accentColor ?? "#00FFFF"}
            canVote={canVote}
            hasVoted={hasVoted}
            isMyVote={votedForId === leftPerformer.id}
            onVote={onVote}
          />
          {/* Right performer vote */}
          <VoteButton
            performerId={rightPerformer.id}
            label={rightPerformer.displayName}
            accent={rightPerformer.accentColor ?? "#FFD700"}
            canVote={canVote}
            hasVoted={hasVoted}
            isMyVote={votedForId === rightPerformer.id}
            onVote={onVote}
          />
        </div>

        {/* Already voted confirmation */}
        {hasVoted && !isLocked && (
          <div
            style={{
              textAlign: "center",
              color: "rgba(255,255,255,0.45)",
              fontSize: 10,
              marginTop: 6,
            }}
          >
            Your vote is locked in — waiting for results.
          </div>
        )}

        {/* Locked state final message */}
        {isLocked && (
          <div
            style={{
              textAlign: "center",
              color: "rgba(255,255,255,0.4)",
              fontSize: 10,
              marginTop: 6,
            }}
          >
            Voting closed · Calculating winner…
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// ─── VoteButton subcomponent ──────────────────────────────────────────────────

interface VoteButtonProps {
  performerId: string;
  label: string;
  accent: string;
  canVote: boolean;
  hasVoted: boolean;
  isMyVote: boolean;
  onVote?: (performerId: string) => void;
}

function VoteButton({ performerId, label, accent, canVote, hasVoted, isMyVote, onVote }: VoteButtonProps) {
  return (
    <motion.button
      type="button"
      disabled={!canVote}
      onClick={() => canVote && onVote?.(performerId)}
      whileHover={canVote ? { scale: 1.04 } : undefined}
      whileTap={canVote ? { scale: 0.96 } : undefined}
      style={{
        flex: 1,
        padding: "10px 8px",
        borderRadius: 6,
        border: `2px solid ${accent}`,
        background: isMyVote
          ? `${accent}25`
          : canVote
          ? "rgba(255,255,255,0.04)"
          : "transparent",
        color: canVote || isMyVote ? accent : "rgba(255,255,255,0.25)",
        fontSize: 11,
        fontWeight: 900,
        letterSpacing: 1,
        textTransform: "uppercase",
        cursor: canVote ? "pointer" : "default",
        opacity: !canVote && !isMyVote && hasVoted ? 0.45 : 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        transition: "background 0.2s ease",
      }}
    >
      {isMyVote && <span style={{ fontSize: 10 }}>✓</span>}
      {label}
    </motion.button>
  );
}
