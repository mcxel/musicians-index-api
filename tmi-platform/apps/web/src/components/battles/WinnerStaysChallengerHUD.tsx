"use client";

/**
 * WinnerStaysChallengerHUD — CHALLENGER_CALL window + CHALLENGE button.
 * Wired to WinnerStaysLifecycleEngine + ChallengeQueueEngine.
 */

import { useCallback, useEffect, useState } from "react";
import {
  winnerStaysLifecycleEngine,
  type WinnerStaysSession,
} from "@/lib/competition/WinnerStaysLifecycleEngine";
import { challengeQueueEngine } from "@/lib/competition/ChallengeQueueEngine";
import type { BattleActor } from "@/lib/competition/BattleEligibilityEngine";

type Props = {
  battleId: string;
  actor?: BattleActor | null;
};

export default function WinnerStaysChallengerHUD({ battleId, actor }: Props) {
  const [session, setSession] = useState<WinnerStaysSession | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [queueLen, setQueueLen] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    return winnerStaysLifecycleEngine.subscribe(battleId, (s) => {
      setSession({ ...s });
      setQueueLen(challengeQueueEngine.getQueue(battleId).length);
    });
  }, [battleId]);

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining(winnerStaysLifecycleEngine.getRemainingSeconds(battleId));
      setQueueLen(challengeQueueEngine.getQueue(battleId).length);
    }, 250);
    return () => clearInterval(id);
  }, [battleId]);

  const onChallenge = useCallback(() => {
    if (!actor) {
      setMessage("Sign in as a performer to challenge");
      return;
    }
    const result = challengeQueueEngine.enqueue({ battleId, challenger: actor });
    if (!result.ok) {
      setMessage(result.reason ?? "Unable to join queue");
      return;
    }
    setMessage("Queued — waiting for lock");
    setQueueLen(challengeQueueEngine.getQueue(battleId).length);
  }, [actor, battleId]);

  if (!session || session.phase === "CLOSED" || session.phase === "ACTIVE_MATCH") {
    return null;
  }

  const callOpen = session.phase === "CHALLENGER_CALL";

  return (
    <div
      style={{
        position: "absolute",
        left: 12,
        right: 12,
        bottom: 16,
        zIndex: 40,
        borderRadius: 12,
        border: "1px solid rgba(255,215,0,0.45)",
        background: "linear-gradient(160deg, rgba(12,8,24,0.96), rgba(5,5,16,0.98))",
        padding: "14px 16px",
        boxShadow: "0 12px 40px rgba(0,0,0,0.55)",
        display: "grid",
        gap: 10,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: "0.16em",
              color: "#FFD700",
            }}
          >
            {session.phase.replace(/_/g, " ")}
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", marginTop: 4 }}>
            {callOpen ? session.callPrompt : session.championName ? `${session.championName} holds the stage` : "Winner stays"}
          </div>
        </div>
        {session.phaseEndsAt > 0 && (
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 22,
              fontWeight: 900,
              color: "#00FFFF",
              minWidth: 48,
              textAlign: "right",
            }}
          >
            {remaining}s
          </div>
        )}
      </div>

      {callOpen && (
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={onChallenge}
            style={{
              border: "none",
              borderRadius: 8,
              padding: "10px 18px",
              fontWeight: 900,
              letterSpacing: "0.1em",
              background: "linear-gradient(90deg, #FF2DAA, #FFD700)",
              color: "#050510",
              cursor: "pointer",
            }}
          >
            CHALLENGE
          </button>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.65)" }}>
            Queue: {queueLen} · Window {session.config.challengerWindowSeconds}s
          </span>
        </div>
      )}

      {session.phase === "NEXT_CHALLENGER_LOCKED" && session.challengerName && (
        <div style={{ fontSize: 13, color: "#00FF88", fontWeight: 800 }}>
          Next challenger locked: {session.challengerName}
        </div>
      )}

      {session.phase === "CHAMPION_CEREMONY" && (
        <div style={{ fontSize: 13, color: "#FFD700", fontWeight: 800 }}>
          No challenger — champion ceremony
        </div>
      )}

      {message && (
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>{message}</div>
      )}
    </div>
  );
}
