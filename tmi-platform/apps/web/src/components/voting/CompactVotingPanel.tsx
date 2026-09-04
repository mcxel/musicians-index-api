"use client";

/**
 * CompactVotingPanel
 * Server-deadline-aware voting overlay.
 *
 * States: HIDDEN → AVAILABLE → OPEN → VOTED → LOCKED → RESULTS → CLOSED
 *
 * Rules:
 *   - Never navigates away from the current page
 *   - Countdown from server deadline (closesAt prop)
 *   - Votes submitted to /api/votes/[id]/submit
 *   - Auto-fades after VOTED and RESULTS states
 *   - Desktop: ≤15% viewport width, bottom-right
 *   - Mobile: bottom sheet
 *
 * Certification: L1 IMPLEMENTED
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

type PanelState =
  | "HIDDEN"
  | "AVAILABLE"
  | "OPEN"
  | "VOTED"
  | "LOCKED"
  | "RESULTS"
  | "CLOSED";

export interface VoteChoice {
  id: string;
  label: string;
}

export interface VoteResult {
  choiceId: string;
  label: string;
  count: number;
  percent: number;
}

interface CompactVotingPanelProps {
  voteId: string;
  title?: string;
  choices: VoteChoice[];
  opensAt: number; // UTC ms
  closesAt: number; // UTC ms
  allowWinnerVote?: boolean;
  /** External state override — LOCKED closes voting from server push */
  forceLocked?: boolean;
  accentColor?: string;
  onVoteCast?: (choiceId: string) => void;
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "0:00";
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function CompactVotingPanel({
  voteId,
  title = "VOTE",
  choices,
  opensAt,
  closesAt,
  allowWinnerVote = true,
  forceLocked = false,
  accentColor = "#FF2DAA",
  onVoteCast,
}: CompactVotingPanelProps) {
  const [panelState, setPanelState] = useState<PanelState>("HIDDEN");
  const [myVote, setMyVote] = useState<string | null>(null);
  const [results, setResults] = useState<VoteResult[]>([]);
  const [winner, setWinner] = useState<string | null>(null);
  const [totalVotes, setTotalVotes] = useState(0);
  const [timeMs, setTimeMs] = useState(Math.max(0, closesAt - Date.now()));
  const [submitting, setSubmitting] = useState(false);
  const autoFadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Tick countdown
  useEffect(() => {
    const id = setInterval(() => {
      const remaining = Math.max(0, closesAt - Date.now());
      setTimeMs(remaining);
      if (remaining === 0 && panelState === "OPEN") {
        setPanelState("LOCKED");
      }
    }, 500);
    return () => clearInterval(id);
  }, [closesAt, panelState]);

  // Determine initial state from server timestamps
  useEffect(() => {
    const n = Date.now();
    if (n < opensAt) {
      setPanelState("HIDDEN");
    } else if (n >= opensAt && n < closesAt) {
      setPanelState("OPEN");
    } else {
      setPanelState("CLOSED");
    }
  }, [opensAt, closesAt]);

  // External lock
  useEffect(() => {
    if (forceLocked && panelState === "OPEN") {
      setPanelState("LOCKED");
    }
  }, [forceLocked, panelState]);

  // Auto-fade after VOTED and RESULTS
  const scheduleAutoFade = useCallback((delay: number) => {
    if (autoFadeTimer.current) clearTimeout(autoFadeTimer.current);
    autoFadeTimer.current = setTimeout(() => {
      setPanelState("CLOSED");
    }, delay);
  }, []);

  useEffect(() => {
    if (panelState === "VOTED") scheduleAutoFade(8000);
    if (panelState === "RESULTS") scheduleAutoFade(12000);
    return () => {
      if (autoFadeTimer.current) clearTimeout(autoFadeTimer.current);
    };
  }, [panelState, scheduleAutoFade]);

  const handleVote = useCallback(
    async (choiceId: string) => {
      if (submitting || myVote || panelState !== "OPEN") return;
      setSubmitting(true);

      try {
        const idempotencyKey = `${voteId}_${choiceId}_${Date.now()}`;
        const res = await fetch(`/api/votes/${voteId}/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ choiceId, idempotencyKey }),
        });

        const data = (await res.json()) as {
          ok: boolean;
          reason?: string;
          choiceId?: string;
          results?: {
            visible: boolean;
            tally: VoteResult[];
            winner: string | null;
            totalVotes: number;
          };
        };

        if (data.ok && data.choiceId) {
          setMyVote(data.choiceId);
          onVoteCast?.(data.choiceId);

          if (data.results?.visible && data.results.tally.length > 0) {
            setResults(data.results.tally);
            setWinner(data.results.winner);
            setTotalVotes(data.results.totalVotes);
            setPanelState("RESULTS");
          } else {
            setPanelState("VOTED");
          }
        }
      } catch {
        // Vote failed silently — user can retry
      } finally {
        setSubmitting(false);
      }
    },
    [submitting, myVote, panelState, voteId, onVoteCast],
  );

  if (panelState === "HIDDEN" || panelState === "CLOSED") return null;

  return (
    <AnimatePresence>
      <motion.div
        key="compact-voting-panel"
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.96 }}
        transition={{ duration: 0.25 }}
        style={{
          position: "fixed",
          bottom: 24,
          right: 20,
          zIndex: 90,
          width: "min(320px, 90vw)",
          background: "rgba(5,5,16,0.97)",
          border: `1px solid ${accentColor}40`,
          borderRadius: 14,
          overflow: "hidden",
          backdropFilter: "blur(12px)",
          boxShadow: `0 4px 32px rgba(0,0,0,0.6), 0 0 24px ${accentColor}22`,
          fontFamily: "'Inter', sans-serif",
          color: "#fff",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "10px 14px",
            background: "rgba(255,255,255,0.02)",
            borderBottom: `1px solid ${accentColor}20`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            {panelState === "OPEN" && (
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.1, repeat: Infinity }}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: accentColor,
                  boxShadow: `0 0 6px ${accentColor}`,
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
            )}
            <span
              style={{
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: "0.2em",
                color:
                  panelState === "VOTED" || panelState === "RESULTS"
                    ? "#00FF88"
                    : panelState === "LOCKED"
                    ? "#FFD700"
                    : "rgba(255,255,255,0.6)",
              }}
            >
              {panelState === "VOTED"
                ? "VOTE CAST ✓"
                : panelState === "RESULTS"
                ? "RESULTS"
                : panelState === "LOCKED"
                ? "VOTING CLOSED"
                : title}
            </span>
          </div>
          {panelState === "OPEN" && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: timeMs < 30_000 ? "#FF4444" : accentColor,
                letterSpacing: "0.05em",
              }}
            >
              {formatCountdown(timeMs)}
            </span>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: "12px 14px" }}>
          {/* OPEN — choices */}
          {panelState === "OPEN" && !myVote && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {choices.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => void handleVote(ch.id)}
                  disabled={submitting}
                  style={{
                    padding: "11px 14px",
                    background: `${accentColor}12`,
                    border: `1px solid ${accentColor}40`,
                    borderRadius: 9,
                    color: accentColor,
                    fontWeight: 800,
                    fontSize: 13,
                    cursor: submitting ? "wait" : "pointer",
                    textAlign: "left",
                    transition: "all 0.15s",
                    letterSpacing: "0.04em",
                  }}
                >
                  {ch.label}
                </button>
              ))}
            </div>
          )}

          {/* VOTED — waiting for results */}
          {panelState === "VOTED" && (
            <div
              style={{
                textAlign: "center",
                padding: "12px 0",
                fontSize: 13,
                color: "#00FF88",
                fontWeight: 700,
              }}
            >
              Your vote is in.
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>
                Results reveal when voting closes.
              </div>
            </div>
          )}

          {/* LOCKED — closed without my vote */}
          {panelState === "LOCKED" && !myVote && (
            <div
              style={{
                textAlign: "center",
                padding: "12px 0",
                fontSize: 12,
                color: "#FFD700",
                fontWeight: 700,
              }}
            >
              Voting closed.
            </div>
          )}

          {/* RESULTS */}
          {panelState === "RESULTS" && results.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {results.map((r) => {
                const isWinner = allowWinnerVote && winner === r.choiceId;
                const isMyChoice = myVote === r.choiceId;
                return (
                  <div key={r.choiceId}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 4,
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      <span
                        style={{
                          color: isWinner ? "#FFD700" : isMyChoice ? accentColor : "#fff",
                        }}
                      >
                        {isWinner ? "👑 " : ""}
                        {r.label}
                        {isMyChoice ? " ✓" : ""}
                      </span>
                      <span style={{ color: "rgba(255,255,255,0.5)" }}>
                        {r.percent}%
                      </span>
                    </div>
                    <div
                      style={{
                        height: 5,
                        borderRadius: 2,
                        background: "rgba(255,255,255,0.07)",
                        overflow: "hidden",
                      }}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${r.percent}%` }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        style={{
                          height: "100%",
                          borderRadius: 2,
                          background: isWinner ? "#FFD700" : accentColor,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
              <div
                style={{
                  fontSize: 9,
                  color: "rgba(255,255,255,0.25)",
                  marginTop: 4,
                  textAlign: "center",
                  letterSpacing: "0.1em",
                }}
              >
                {totalVotes} VOTE{totalVotes !== 1 ? "S" : ""}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
