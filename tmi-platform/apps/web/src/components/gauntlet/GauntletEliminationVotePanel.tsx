"use client";

/**
 * Audience elimination vote UI — pick who leaves the main field.
 * Real ballots only; gifts never count.
 */

import { useMemo, useState, type CSSProperties } from "react";
import {
  castAudienceEliminationVote,
  getEliminationTallies,
  isEliminationVoteOpen,
} from "@/lib/gauntlet/GauntletAudienceEliminationVote";

type Props = {
  runId: string;
  aliveIds: string[];
  voterId?: string | null;
  onVoted?: () => void;
};

export default function GauntletEliminationVotePanel({
  runId,
  aliveIds,
  voterId,
  onVoted,
}: Props) {
  const [msg, setMsg] = useState<string | null>(null);
  const open = isEliminationVoteOpen(runId);
  const tallies = useMemo(() => getEliminationTallies(runId), [runId, msg, open]);

  if (!open && tallies.every((t) => t.audienceVotes === 0)) {
    return (
      <div style={box}>
        <div style={title}>AUDIENCE ELIMINATION</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
          Voting open — waiting for ballots. Gifts never count as votes.
        </div>
      </div>
    );
  }

  return (
    <div style={box}>
      <div style={title}>
        {open ? "VOTE WHO IS ELIMINATED" : "TALLY (CLOSED)"}
      </div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>
        Wrestling-ladder style — audience picks who didn't win. One ballot per voter.
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {aliveIds.map((id) => {
          const row = tallies.find((t) => t.competitorId === id);
          return (
            <button
              key={id}
              type="button"
              disabled={!open || !voterId}
              onClick={() => {
                if (!voterId) {
                  setMsg("Sign in to vote");
                  return;
                }
                const result = castAudienceEliminationVote({
                  runId,
                  voterId,
                  eliminateCompetitorId: id,
                });
                setMsg(result.ok ? `Ballot cast against ${id.slice(0, 8)}` : result.reason ?? "failed");
                onVoted?.();
              }}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid rgba(255,45,170,0.4)",
                background: open ? "rgba(255,45,170,0.15)" : "rgba(255,255,255,0.04)",
                color: open ? "#FF2DAA" : "rgba(255,255,255,0.4)",
                fontWeight: 800,
                fontSize: 11,
                cursor: open && voterId ? "pointer" : "not-allowed",
              }}
            >
              ELIM {id.slice(0, 8)} · {row?.audienceVotes ?? 0}
            </button>
          );
        })}
      </div>
      {msg && (
        <div style={{ marginTop: 8, fontSize: 11, color: "rgba(255,255,255,0.55)" }}>{msg}</div>
      )}
    </div>
  );
}

const box: CSSProperties = {
  margin: "0 16px 12px",
  padding: 12,
  borderRadius: 10,
  border: "1px solid rgba(0,255,255,0.3)",
  background: "rgba(0,255,255,0.06)",
};

const title: CSSProperties = {
  fontSize: 10,
  fontWeight: 900,
  letterSpacing: "0.14em",
  color: "#00FFFF",
  marginBottom: 6,
};
