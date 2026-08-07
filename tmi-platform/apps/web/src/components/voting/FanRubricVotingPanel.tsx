"use client";

/**
 * Fan Real-Time Rubric Voting Panel — pops when window open, dismisses when closed.
 * Complements Gauntlet elimination vote; gifts never count.
 */

import { useCallback, useEffect, useState, type CSSProperties } from "react";
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
};

export default function FanRubricVotingPanel({
  roomId,
  eventId,
  performerIds,
  voterId,
  votingOpen,
  performerLabels = {},
  onDismiss,
}: Props) {
  const [tallies, setTallies] = useState<Tallies | null>(null);
  const [selected, setSelected] = useState<string | null>(performerIds[0] ?? null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [dismissed, setDismissed] = useState(false);

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
      setDismissed(false);
      void fetch(`/api/rooms/${encodeURIComponent(roomId)}/rubric-vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "close", eventId }),
      }).catch(() => {});
      return;
    }

    const ids = performerKey.split("|").filter(Boolean);
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

  if (!votingOpen || dismissed) return null;

  const criteria = tallies?.criteria?.length ? tallies.criteria : DEFAULT_RUBRIC_CRITERIA;
  const open = tallies?.open ?? votingOpen;

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
    <div style={shell} data-fan-rubric-voting-panel>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.18em", color: "#FFD700" }}>
            FAN RUBRIC VOTE {open ? "· OPEN" : "· CLOSED"}
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
            Gifts ≠ votes · Real tallies only · Complements elimination vote
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setDismissed(true);
            onDismiss?.();
          }}
          style={dismissBtn}
        >
          DISMISS
        </button>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
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
              {performerLabels[id] ?? id.slice(0, 10)}
              <span style={{ opacity: 0.7, marginLeft: 6 }}>
                {row?.ballotCount ?? 0} · won {row?.whoWonCount ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
        {criteria
          .filter((c) => c.id !== "who_won")
          .map((c) => (
            <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 120, fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>{c.label}</span>
              <div style={{ display: "flex", gap: 4 }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    disabled={!open}
                    onClick={() => setScores((s) => ({ ...s, [c.id]: n }))}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      border: `1px solid ${(scores[c.id] ?? 0) >= n ? "#00FFFF" : "rgba(255,255,255,0.15)"}`,
                      background: (scores[c.id] ?? 0) >= n ? "rgba(0,255,255,0.2)" : "transparent",
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 800,
                      cursor: open ? "pointer" : "not-allowed",
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
              {selected && (
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
                  avg {tallies?.byPerformer.find((p) => p.performerId === selected)?.averages[c.id] ?? "—"}
                </span>
              )}
            </div>
          ))}
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <button type="button" disabled={!open || busy || !selected} onClick={() => void submit()} style={submitBtn}>
          {busy ? "SUBMITTING…" : "CAST RUBRIC BALLOT"}
        </button>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
          {tallies?.totalBallots ?? 0} ballots this window
        </span>
      </div>
      {msg && <p style={{ margin: "10px 0 0", fontSize: 11, color: "rgba(255,255,255,0.55)" }}>{msg}</p>}
    </div>
  );
}

const shell: CSSProperties = {
  margin: "0 16px 12px",
  padding: 14,
  borderRadius: 12,
  border: "1px solid rgba(255,215,0,0.35)",
  background: "linear-gradient(135deg, rgba(40,30,5,0.85), rgba(5,5,16,0.95))",
  boxShadow: "0 0 24px rgba(255,215,0,0.08)",
};

const dismissBtn: CSSProperties = {
  border: "1px solid rgba(255,255,255,0.2)",
  background: "transparent",
  color: "rgba(255,255,255,0.55)",
  fontSize: 9,
  fontWeight: 800,
  letterSpacing: "0.12em",
  borderRadius: 6,
  padding: "5px 10px",
  cursor: "pointer",
};

const chip: CSSProperties = {
  padding: "7px 10px",
  borderRadius: 8,
  border: "1px solid",
  fontSize: 11,
  fontWeight: 800,
  cursor: "pointer",
};

const submitBtn: CSSProperties = {
  padding: "10px 16px",
  borderRadius: 8,
  border: "1px solid rgba(255,215,0,0.5)",
  background: "linear-gradient(90deg,#FFD700,#FF9500)",
  color: "#050510",
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: "0.08em",
  cursor: "pointer",
};
