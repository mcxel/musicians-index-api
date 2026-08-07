"use client";

/**
 * Fan Real-Time Rubric Voting — docked edge glass capsule (canister-style).
 * Frosted neon glass · non-blocking of the performance · collapse tab re-opens.
 * Complements elimination / crowd votes; gifts never count (Rule 20 honest tallies).
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

const CYAN = "#00FFFF";
const FUCHSIA = "#FF2DAA";
const GOLD = "#FFD700";
const PURPLE = "#AA2DFF";

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
  const slideX = dock === "right" ? 72 : -72;

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
        top: "16%",
        bottom: "10%",
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
            initial={{ opacity: 0, x: slideX * 0.55 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: slideX * 0.55 }}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
            whileHover={{ scale: 1.04, boxShadow: `0 0 28px ${FUCHSIA}55` }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setCollapsed(false)}
            style={{
              ...edgeTab,
              pointerEvents: "auto",
              [dock === "right" ? "borderTopLeftRadius" : "borderTopRightRadius"]: 14,
              [dock === "right" ? "borderBottomLeftRadius" : "borderBottomRightRadius"]: 14,
              [dock === "right" ? "borderRight" : "borderLeft"]: "none",
            }}
            aria-label="Expand fan rubric vote"
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: open ? CYAN : "rgba(255,255,255,0.35)",
                boxShadow: open ? `0 0 10px ${CYAN}` : "none",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                writingMode: "vertical-rl",
                transform: dock === "right" ? "rotate(180deg)" : undefined,
                letterSpacing: "0.16em",
              }}
            >
              FAN RUBRIC · {open ? "OPEN" : "CLOSED"}
            </span>
          </motion.button>
        ) : (
          <motion.aside
            key="rubric-dock"
            initial={{ opacity: 0, x: slideX, scale: 0.94 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: slideX, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 340, damping: 26 }}
            style={{
              ...capsule,
              pointerEvents: "auto",
              [dock === "right" ? "marginRight" : "marginLeft"]: 10,
              [dock === "right" ? "borderTopRightRadius" : "borderTopLeftRadius"]: 6,
              [dock === "right" ? "borderBottomRightRadius" : "borderBottomLeftRadius"]: 6,
            }}
          >
            {/* Neon glass sheen */}
            <div aria-hidden style={sheen} />
            <div aria-hidden style={glowRing} />

            <div style={headerRow}>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 900,
                    letterSpacing: "0.2em",
                    background: `linear-gradient(90deg, ${GOLD}, ${CYAN}, ${FUCHSIA})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  FAN RUBRIC VOTE
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginTop: 4,
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      fontSize: 8,
                      fontWeight: 900,
                      letterSpacing: "0.12em",
                      padding: "2px 7px",
                      borderRadius: 999,
                      border: `1px solid ${open ? `${CYAN}88` : "rgba(255,255,255,0.2)"}`,
                      color: open ? CYAN : "rgba(255,255,255,0.45)",
                      background: open ? "rgba(0,255,255,0.12)" : "rgba(255,255,255,0.04)",
                      boxShadow: open ? `0 0 12px ${CYAN}33` : "none",
                    }}
                  >
                    {open ? "● LIVE OPEN" : "○ CLOSED"}
                  </span>
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,0.48)", fontWeight: 600 }}>
                    Gifts ≠ votes · Watch & score
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.06, borderColor: `${CYAN}99` }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setCollapsed(true)}
                  style={iconBtn}
                  aria-label="Collapse rubric panel"
                >
                  COLLAPSE
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.08, borderColor: `${FUCHSIA}99`, color: FUCHSIA }}
                  whileTap={{ scale: 0.88 }}
                  onClick={() => {
                    setCollapsed(true);
                    onDismiss?.();
                  }}
                  style={{ ...iconBtn, minWidth: 28, padding: "4px 8px" }}
                  aria-label="Dismiss rubric panel"
                >
                  ✕
                </motion.button>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                marginBottom: 10,
                flexShrink: 0,
              }}
            >
              {performerIds.map((id, i) => {
                const row = tallies?.byPerformer.find((p) => p.performerId === id);
                const active = selected === id;
                const accent = i % 2 === 0 ? FUCHSIA : CYAN;
                return (
                  <motion.button
                    key={id}
                    type="button"
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setSelected(id)}
                    style={{
                      ...chip,
                      borderColor: active ? accent : "rgba(255,255,255,0.14)",
                      background: active
                        ? `linear-gradient(135deg, ${accent}33, rgba(5,5,16,0.55))`
                        : "rgba(255,255,255,0.05)",
                      color: active ? accent : "rgba(255,255,255,0.88)",
                      boxShadow: active
                        ? `0 0 16px ${accent}44, inset 0 1px 0 rgba(255,255,255,0.12)`
                        : "inset 0 1px 0 rgba(255,255,255,0.06)",
                    }}
                  >
                    {(performerLabels[id] ?? id).slice(0, 14)}
                    <span
                      style={{
                        marginLeft: 6,
                        fontSize: 9,
                        fontWeight: 900,
                        padding: "1px 5px",
                        borderRadius: 999,
                        background: active ? `${accent}22` : "rgba(0,0,0,0.35)",
                        color: active ? accent : GOLD,
                      }}
                    >
                      {row?.ballotCount ?? 0}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            <div
              style={{
                fontSize: 9,
                color: `${GOLD}cc`,
                marginBottom: 8,
                fontWeight: 800,
                letterSpacing: "0.06em",
                flexShrink: 0,
              }}
            >
              WHO WON → tap a performer chip · score 1–5 below
            </div>

            <div style={criteriaScroll}>
              {criteria
                .filter((c) => c.id !== "who_won")
                .map((c) => {
                  const filled = scores[c.id] ?? 0;
                  const avg =
                    selected &&
                    tallies?.byPerformer.find((p) => p.performerId === selected)?.averages[c.id];
                  return (
                    <div
                      key={c.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 9,
                        padding: "6px 8px",
                        borderRadius: 10,
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      <span
                        style={{
                          width: 100,
                          flexShrink: 0,
                          fontSize: 10,
                          fontWeight: 800,
                          color: "rgba(255,255,255,0.82)",
                          letterSpacing: "0.02em",
                        }}
                      >
                        {c.label}
                      </span>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {[1, 2, 3, 4, 5].map((n) => {
                          const on = filled >= n;
                          return (
                            <motion.button
                              key={n}
                              type="button"
                              disabled={!open}
                              whileHover={open ? { scale: 1.14, y: -2 } : undefined}
                              whileTap={open ? { scale: 0.86 } : undefined}
                              onClick={() => setScores((s) => ({ ...s, [c.id]: n }))}
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: 8,
                                border: `1px solid ${on ? CYAN : "rgba(255,255,255,0.16)"}`,
                                background: on
                                  ? `linear-gradient(145deg, ${CYAN}55, ${PURPLE}44)`
                                  : "rgba(0,0,0,0.28)",
                                color: on ? "#050510" : "rgba(255,255,255,0.75)",
                                fontSize: 11,
                                fontWeight: 900,
                                cursor: open ? "pointer" : "not-allowed",
                                boxShadow: on
                                  ? `0 0 14px ${CYAN}55, inset 0 1px 0 rgba(255,255,255,0.35)`
                                  : "inset 0 1px 0 rgba(255,255,255,0.05)",
                                opacity: open ? 1 : 0.45,
                                transition: "border-color 120ms ease, background 120ms ease",
                              }}
                            >
                              {n}
                            </motion.button>
                          );
                        })}
                      </div>
                      {selected && (
                        <span
                          style={{
                            fontSize: 9,
                            color: "rgba(255,255,255,0.4)",
                            marginLeft: "auto",
                            fontWeight: 700,
                            whiteSpace: "nowrap",
                          }}
                        >
                          avg {avg ?? "—"}
                        </span>
                      )}
                    </div>
                  );
                })}
            </div>

            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                flexWrap: "wrap",
                marginTop: 10,
                flexShrink: 0,
                paddingTop: 10,
                borderTop: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <motion.button
                type="button"
                disabled={!open || busy || !selected}
                whileHover={open && !busy && selected ? { scale: 1.04, y: -1 } : undefined}
                whileTap={open && !busy && selected ? { scale: 0.94 } : undefined}
                onClick={() => void submit()}
                style={{
                  ...submitBtn,
                  opacity: !open || busy || !selected ? 0.45 : 1,
                  cursor: !open || busy || !selected ? "not-allowed" : "pointer",
                }}
              >
                {busy ? "SUBMITTING…" : "CAST BALLOT"}
              </motion.button>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: GOLD,
                  letterSpacing: "0.04em",
                  textShadow: `0 0 10px ${GOLD}44`,
                }}
              >
                {tallies?.totalBallots ?? 0} ballots
              </span>
            </div>
            {msg && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  margin: "8px 0 0",
                  fontSize: 10,
                  fontWeight: 700,
                  color: msg.includes("recorded") ? CYAN : FUCHSIA,
                  textShadow: msg.includes("recorded")
                    ? `0 0 12px ${CYAN}55`
                    : `0 0 12px ${FUCHSIA}44`,
                }}
              >
                {msg}
              </motion.p>
            )}
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}

const capsule: CSSProperties = {
  position: "relative",
  width: "min(328px, calc(100vw - 24px))",
  maxHeight: "100%",
  display: "flex",
  flexDirection: "column",
  padding: 14,
  borderRadius: 18,
  border: "1px solid rgba(0,255,255,0.35)",
  background:
    "linear-gradient(155deg, rgba(12,8,28,0.55) 0%, rgba(5,5,16,0.42) 45%, rgba(40,10,48,0.5) 100%)",
  boxShadow: `
    0 16px 48px rgba(0,0,0,0.55),
    0 0 0 1px rgba(255,45,170,0.18),
    0 0 36px rgba(0,255,255,0.12),
    inset 0 1px 0 rgba(255,255,255,0.18),
    inset 0 -1px 0 rgba(170,45,255,0.12)
  `,
  backdropFilter: "blur(22px) saturate(1.45)",
  WebkitBackdropFilter: "blur(22px) saturate(1.45)",
  overflow: "hidden",
};

const sheen: CSSProperties = {
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  background:
    "linear-gradient(125deg, rgba(255,255,255,0.14) 0%, transparent 38%, transparent 62%, rgba(0,255,255,0.06) 100%)",
  borderRadius: "inherit",
};

const glowRing: CSSProperties = {
  position: "absolute",
  top: -40,
  right: -30,
  width: 120,
  height: 120,
  borderRadius: "50%",
  background: `radial-gradient(circle, ${FUCHSIA}33 0%, transparent 70%)`,
  pointerEvents: "none",
  filter: "blur(8px)",
};

const headerRow: CSSProperties = {
  position: "relative",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 8,
  marginBottom: 12,
  flexShrink: 0,
};

const criteriaScroll: CSSProperties = {
  position: "relative",
  overflowY: "auto",
  flex: 1,
  minHeight: 0,
  paddingRight: 4,
  marginRight: -2,
  scrollbarWidth: "thin",
  scrollbarColor: `${CYAN}66 transparent`,
};

const edgeTab: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 10,
  border: `1px solid ${GOLD}77`,
  background:
    "linear-gradient(180deg, rgba(255,215,0,0.18) 0%, rgba(5,5,16,0.55) 40%, rgba(255,45,170,0.16) 100%)",
  color: GOLD,
  fontSize: 9,
  fontWeight: 900,
  letterSpacing: "0.14em",
  padding: "16px 10px",
  cursor: "pointer",
  backdropFilter: "blur(18px) saturate(1.4)",
  WebkitBackdropFilter: "blur(18px) saturate(1.4)",
  boxShadow: `0 10px 28px rgba(0,0,0,0.5), 0 0 22px ${GOLD}33, inset 0 1px 0 rgba(255,255,255,0.2)`,
};

const iconBtn: CSSProperties = {
  border: "1px solid rgba(255,255,255,0.22)",
  background: "rgba(255,255,255,0.06)",
  color: "rgba(255,255,255,0.7)",
  fontSize: 8,
  fontWeight: 800,
  letterSpacing: "0.1em",
  borderRadius: 8,
  padding: "5px 9px",
  cursor: "pointer",
  backdropFilter: "blur(8px)",
};

const chip: CSSProperties = {
  padding: "7px 10px",
  borderRadius: 10,
  border: "1px solid",
  fontSize: 10,
  fontWeight: 800,
  cursor: "pointer",
  backdropFilter: "blur(8px)",
};

const submitBtn: CSSProperties = {
  padding: "10px 16px",
  borderRadius: 12,
  border: `1px solid ${GOLD}`,
  background: `linear-gradient(100deg, ${GOLD} 0%, #FF9500 45%, ${FUCHSIA} 100%)`,
  color: "#050510",
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: "0.1em",
  cursor: "pointer",
  boxShadow: `0 6px 22px ${GOLD}44, 0 0 18px ${FUCHSIA}33, inset 0 1px 0 rgba(255,255,255,0.45)`,
};
