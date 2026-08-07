"use client";

/**
 * Fan Real-Time Rubric Voting — docked edge capsule (canister-style).
 * Pops when the voting window opens; collapse/dismiss never leaves the watch view.
 * Complements elimination / crowd votes; gifts never count.
 */

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DEFAULT_RUBRIC_CRITERIA } from "@/lib/voting/FanRubricVotingEngine";

type Tallies = {
  open: boolean;
  totalBallots: number;
  byPerformer: Array<{
    performerId: string;
    ballotCount: number;
    averages: Record<string, number>;
    whoWonCount: number;
  }>;
  criteria: Array<{ id: string; label: string }>;
};

type Props = {
  roomId: string;
  eventId: string;
  performerIds: string[];
  voterId?: string | null;
  /** When true, panel requests open if not already. */
  votingOpen: boolean;
  performerLabels?: Record<string, string>;
  onDismiss?: () => void;
  /** Dock side — default right so stage stays clear. */
  dock?: "right" | "left";
};

export default function FanRubricVotingPanel({
  roomId,
  eventId,
  performerIds,
  voterId,
  votingOpen,
  performerLabels = {},
  onDismiss,
  dock = "right",
}: Props) {
  const [tallies, setTallies] = useState<Tallies | null>(null);
  const [selected, setSelected] = useState<string | null>(performerIds[0] ?? null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  /** Collapsed by user — room stays live; edge tab can re-expand. */
  const [collapsed, setCollapsed] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const r = await fetch(
        `/api/rooms/${encodeURIComponent(roomId)}/rubric-vote?eventId=${encodeURIComponent(eventId)}`,
        { cache: "no-store" },
      );
      if (!r.ok) return;
      const data = (await r.json()) as Tallies & { ok?: boolean };
      setTallies(data);
    } catch {
      /* keep prior */
    }
  }, [roomId, eventId]);

  const performerKey = performerIds.join("|");

  useEffect(() => {
    if (!votingOpen) {
      setCollapsed(false);
      void fetch(`/api/rooms/${encodeURIComponent(roomId)}/rubric-vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "close", eventId }),
      }).catch(() => {});
      return;
    }

    const ids = performerKey.split("|").filter(Boolean);
    setSelected((prev) => (prev && ids.includes(prev) ? prev : ids[0] ?? null));
    void fetch(`/api/rooms/${encodeURIComponent(roomId)}/rubric-vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "open",
        eventId,
        performerIds: ids,
      }),
    }).then(() => refresh());

    const id = setInterval(() => void refresh(), 4_000);
    return () => clearInterval(id);
  }, [votingOpen, roomId, eventId, performerKey, refresh]);

  if (!votingOpen || performerIds.length === 0) return null;

  const criteria = tallies?.criteria?.length ? tallies.criteria : DEFAULT_RUBRIC_CRITERIA;
  const open = tallies?.open ?? votingOpen;
  const edge = dock === "right" ? { right: 0 } : { left: 0 };

  async function submit() {
    if (!voterId || !selected) {
      setMsg("Sign in (or guest id) required to vote");
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const r = await fetch(`/api/rooms/${encodeURIComponent(roomId)}/rubric-vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "cast",
          eventId,
          voterId,
          performerId: selected,
          performerIds,
          scores: {
            who_won: 5,
            ...scores,
          },
        }),
      });
      const data = (await r.json()) as { ok?: boolean; error?: string; xp?: number };
      if (!r.ok || !data.ok) {
        setMsg(data.error ?? "Vote failed");
      } else {
        setMsg(`Ballot recorded${typeof data.xp === "number" ? ` · +${data.xp} XP` : ""}`);
        void refresh();
      }
    } catch {
      setMsg("Unable to submit vote");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      data-fan-rubric-voting-panel
      style={{
        position: "fixed",
        top: "18%",
        bottom: "12%",
        zIndex: 46,
        pointerEvents: "none",
        ...edge,
      }}
    >
      <AnimatePresence mode="wait">
        {collapsed ? (
          <motion.button
            key="rubric-tab"
            type="button"
            initial={{ opacity: 0, x: dock === "right" ? 40 : -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dock === "right" ? 40 : -40 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            onClick={() => setCollapsed(false)}
            style={{
              ...edgeTab,
              pointerEvents: "auto",
              [dock === "right" ? "borderTopLeftRadius" : "borderTopRightRadius"]: 10,
              [dock === "right" ? "borderBottomLeftRadius" : "borderBottomRightRadius"]: 10,
              [dock === "right" ? "borderRight" : "borderLeft"]: "none",
            }}
            aria-label="Expand fan rubric vote"
          >
            <span style={{ writingMode: "vertical-rl", transform: dock === "right" ? "rotate(180deg)" : undefined }}>
              FAN RUBRIC · {open ? "OPEN" : "CLOSED"}
            </span>
          </motion.button>
        ) : (
          <motion.aside
            key="rubric-dock"
            initial={{ opacity: 0, x: dock === "right" ? 80 : -80, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: dock === "right" ? 80 : -80, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            style={{
              ...capsule,
              pointerEvents: "auto",
              [dock === "right" ? "marginRight" : "marginLeft"]: 10,
              [dock === "right" ? "borderTopRightRadius" : "borderTopLeftRadius"]: 4,
              [dock === "right" ? "borderBottomRightRadius" : "borderBottomLeftRadius"]: 4,
            }}
          >
            <div style={headerRow}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.18em", color: "#FFD700" }}>
                  FAN RUBRIC VOTE {open ? "· OPEN" : "· CLOSED"}
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.42)", marginTop: 2 }}>
                  Gifts ≠ votes · Watch & score in place
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={() => setCollapsed(true)}
                  style={iconBtn}
                  aria-label="Collapse rubric panel"
                >
                  COLLAPSE
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCollapsed(true);
                    onDismiss?.();
                  }}
                  style={iconBtn}
                  aria-label="Dismiss rubric panel"
                >
                  ✕
                </button>
              </div>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10, flexShrink: 0 }}>
              {performerIds.map((id) => {
                const row = tallies?.byPerformer.find((p) => p.performerId === id);
                const active = selected === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelected(id)}
                    style={{
                      ...chip,
                      borderColor: active ? "#FF2DAA" : "rgba(255,255,255,0.15)",
                      background: active ? "rgba(255,45,170,0.18)" : "rgba(0,0,0,0.35)",
                      color: active ? "#FF2DAA" : "#fff",
                    }}
                  >
                    {(performerLabels[id] ?? id).slice(0, 14)}
                    <span style={{ opacity: 0.65, marginLeft: 5, fontSize: 9 }}>
                      {row?.ballotCount ?? 0}
                    </span>
                  </button>
                );
              })}
            </div>

            <div style={{ fontSize: 9, color: "rgba(255,215,0,0.7)", marginBottom: 8, fontWeight: 700 }}>
              Who won → select performer chip above
            </div>
            <div style={criteriaScroll}>
              {criteria
                .filter((c) => c.id !== "who_won")
                .map((c) => (
                  <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span
                      style={{
                        width: 108,
                        flexShrink: 0,
                        fontSize: 10,
                        fontWeight: 700,
                        color: "rgba(255,255,255,0.7)",
                      }}
                    >
                      {c.label}
                    </span>
                    <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          disabled={!open}
                          onClick={() => setScores((s) => ({ ...s, [c.id]: n }))}
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: 6,
                            border: `1px solid ${(scores[c.id] ?? 0) >= n ? "#00FFFF" : "rgba(255,255,255,0.15)"}`,
                            background: (scores[c.id] ?? 0) >= n ? "rgba(0,255,255,0.2)" : "transparent",
                            color: "#fff",
                            fontSize: 10,
                            fontWeight: 800,
                            cursor: open ? "pointer" : "not-allowed",
                          }}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                    {selected && (
                      <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginLeft: "auto" }}>
                        avg {tallies?.byPerformer.find((p) => p.performerId === selected)?.averages[c.id] ?? "—"}
                      </span>
                    )}
                  </div>
                ))}
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginTop: 10, flexShrink: 0 }}>
              <button type="button" disabled={!open || busy || !selected} onClick={() => void submit()} style={submitBtn}>
                {busy ? "SUBMITTING…" : "CAST BALLOT"}
              </button>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
                {tallies?.totalBallots ?? 0} ballots
              </span>
            </div>
            {msg && <p style={{ margin: "8px 0 0", fontSize: 10, color: "rgba(255,255,255,0.55)" }}>{msg}</p>}
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}

const capsule: CSSProperties = {
  width: "min(320px, calc(100vw - 24px))",
  maxHeight: "100%",
  display: "flex",
  flexDirection: "column",
  padding: 12,
  borderRadius: 14,
  border: "1px solid rgba(255,215,0,0.4)",
  background: "linear-gradient(160deg, rgba(28,22,8,0.94), rgba(5,5,16,0.97))",
  boxShadow: "0 12px 40px rgba(0,0,0,0.55), 0 0 28px rgba(255,215,0,0.1)",
  backdropFilter: "blur(12px)",
};

const headerRow: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 8,
  marginBottom: 10,
  flexShrink: 0,
};

const criteriaScroll: CSSProperties = {
  overflowY: "auto",
  flex: 1,
  minHeight: 0,
  paddingRight: 4,
  marginRight: -4,
};

const edgeTab: CSSProperties = {
  border: "1px solid rgba(255,215,0,0.45)",
  background: "linear-gradient(180deg, rgba(40,30,5,0.95), rgba(5,5,16,0.98))",
  color: "#FFD700",
  fontSize: 9,
  fontWeight: 900,
  letterSpacing: "0.14em",
  padding: "14px 8px",
  cursor: "pointer",
  boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
};

const iconBtn: CSSProperties = {
  border: "1px solid rgba(255,255,255,0.2)",
  background: "transparent",
  color: "rgba(255,255,255,0.55)",
  fontSize: 8,
  fontWeight: 800,
  letterSpacing: "0.1em",
  borderRadius: 6,
  padding: "4px 8px",
  cursor: "pointer",
};

const chip: CSSProperties = {
  padding: "6px 8px",
  borderRadius: 8,
  border: "1px solid",
  fontSize: 10,
  fontWeight: 800,
  cursor: "pointer",
};

const submitBtn: CSSProperties = {
  padding: "9px 14px",
  borderRadius: 8,
  border: "1px solid rgba(255,215,0,0.5)",
  background: "linear-gradient(90deg,#FFD700,#FF9500)",
  color: "#050510",
  fontSize: 10,
  fontWeight: 900,
  letterSpacing: "0.08em",
  cursor: "pointer",
};
