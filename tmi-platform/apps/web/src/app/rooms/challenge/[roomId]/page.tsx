"use client";

/**
 * /rooms/challenge/[roomId] — Phase 1 Challenge world presentation consumer.
 *
 * Mirrors Battle room upward pattern: lifecycle/objective → composeChallengeProgram
 * → ChallengePresentationShell. Objective/contract centered — NOT Battle VS.
 * Never invents challenged participant, scores, or results (Rule 20).
 */

import Link from "next/link";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import ChallengePresentationShell from "@/components/live/ChallengePresentationShell";
import TMIInteractiveVenueHud from "@/components/venue-hud/TMIInteractiveVenueHud";
import type {
  ChallengeJudgmentPolicy,
  ChallengeLifecyclePhase,
} from "@/lib/challenge/ChallengeOperationalLifecycle";
import {
  clearChallengeProgram,
  composeChallengeProgram,
  getActiveChallengeProgram,
  type ChallengeAuthorizedResult,
  type ChallengeObjectiveSnapshot,
  type ChallengeProgramComposition,
} from "@/lib/experiencePresentation/composeChallengeProgram";

const UniversalVenueRenderer = dynamic(
  () => import("@/components/live/UniversalVenueRenderer"),
  { ssr: false },
);

const DEFAULT_OBJECTIVE: Omit<ChallengeObjectiveSnapshot, "judgingPolicy"> = {
  objectiveId: "obj-open-work",
  objective: "Complete the stated objective within the time limit",
  category: "OPEN WORK",
  timeLimitSec: 60,
  attemptCount: 1,
  realStakeOrReward: "NONE",
  qualificationRules: ["Real attempt only", "No fabricated scores"],
};

export default function ChallengeRoomByIdPage() {
  const params = useParams();
  const roomId = typeof params?.roomId === "string" ? params.roomId : "challenge-open";
  const challengeId = roomId.startsWith("challenge-")
    ? roomId.replace(/^challenge-/, "")
    : roomId;

  const actor = useMemo(
    () => ({
      userId: "local-challenger",
      displayName: "Local Challenger",
    }),
    [],
  );

  const [phase, setPhase] = useState<ChallengeLifecyclePhase>("OBJECTIVE_CONTRACT_ASSEMBLY");
  const [policy, setPolicy] = useState<ChallengeJudgmentPolicy>("MEASURABLE_RESULT");
  const [challenged, setChallenged] = useState<{ id: string; displayName: string } | null>(null);
  const [result, setResult] = useState<ChallengeAuthorizedResult | null>(null);
  const [challengeProgram, setChallengeProgram] = useState<ChallengeProgramComposition | null>(
    null,
  );

  const objective = useMemo<ChallengeObjectiveSnapshot>(
    () => ({
      ...DEFAULT_OBJECTIVE,
      objectiveId: `obj-${challengeId}`,
      judgingPolicy: policy,
    }),
    [challengeId, policy],
  );

  // Production Challenge PROGRAM — same upward pattern as composeBattleProgram.
  useEffect(() => {
    const composed = composeChallengeProgram({
      sessionId: `challenge-session:${challengeId}`,
      challengeId,
      roomId,
      objective,
      challenger: { id: actor.userId, displayName: actor.displayName },
      challenged,
      lifecyclePhase: phase,
      result,
      bindJumbotron: true,
    });
    setChallengeProgram(composed);

    return () => {
      if (getActiveChallengeProgram()?.challengeId === challengeId) {
        clearChallengeProgram("challenge-room-unmount");
      }
    };
  }, [actor.userId, actor.displayName, challengeId, roomId, objective, challenged, phase, result]);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", position: "relative" }}>
      <div
        style={{
          padding: "16px 18px",
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          borderBottom: "1px solid rgba(255,215,0,0.3)",
          position: "relative",
          zIndex: 3,
          background: "rgba(5,5,16,0.92)",
        }}
      >
        <div>
          <div style={{ fontSize: 10, letterSpacing: "0.16em", color: "#FFD700", fontWeight: 900 }}>
            CHALLENGE · OBJECTIVE STAGE
          </div>
          <h1 style={{ margin: "4px 0 0", fontSize: 22, color: "#FFD700" }}>Challenge Room</h1>
          <p style={{ margin: "6px 0 0", color: "rgba(255,255,255,0.65)", fontSize: 13 }}>
            Room {roomId} — contract/objective centered; not Battle VS.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <button
            type="button"
            onClick={() =>
              setChallenged((prev) =>
                prev
                  ? null
                  : { id: "local-challenged", displayName: "Local Challenged" },
              )
            }
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid rgba(0,255,255,0.4)",
              background: "rgba(0,255,255,0.1)",
              color: "#00FFFF",
              fontWeight: 900,
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            {challenged ? "CLEAR CHALLENGED" : "ADD REAL CHALLENGED"}
          </button>
          <button
            type="button"
            onClick={() => setPhase("ATTEMPT_1_ACTIVE")}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid rgba(255,215,0,0.4)",
              background: "rgba(255,215,0,0.12)",
              color: "#FFD700",
              fontWeight: 900,
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            START ATTEMPT
          </button>
          <button
            type="button"
            onClick={() => {
              // Result only when both participants exist — never invent a winner alone.
              if (!challenged) return;
              setPhase("RESULT_PRESENTATION");
              setResult({
                outcome: "COMPLETED",
                winnerId: null,
                summaryText: "Attempt complete — no invented winner (measurable pending).",
              });
            }}
            disabled={!challenged}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid rgba(255,45,170,0.4)",
              background: challenged ? "rgba(255,45,170,0.12)" : "rgba(255,255,255,0.05)",
              color: challenged ? "#FF2DAA" : "rgba(255,255,255,0.35)",
              fontWeight: 900,
              fontSize: 11,
              cursor: challenged ? "pointer" : "not-allowed",
            }}
          >
            RECORD COMPLETE (NO WINNER)
          </button>
          <Link
            href="/challenges"
            style={{
              textDecoration: "none",
              color: "#00FFFF",
              border: "1px solid rgba(0,255,255,0.35)",
              borderRadius: 6,
              padding: "8px 12px",
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            Challenges Wall
          </Link>
          <Link
            href={`/live/challenge/${encodeURIComponent(challengeId)}`}
            style={{
              textDecoration: "none",
              color: "#FFD700",
              border: "1px solid rgba(255,215,0,0.4)",
              borderRadius: 6,
              padding: "8px 12px",
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            Live Challenge
          </Link>
        </div>
      </div>

      <div style={{ position: "relative", minHeight: 420 }}>
        <UniversalVenueRenderer roomId={roomId} mode="audience" venueIndex={0} instantEmptyStage />
        <div
          style={{
            position: "absolute",
            left: 12,
            right: 12,
            top: 12,
            zIndex: 4,
            maxWidth: 720,
            margin: "0 auto",
            pointerEvents: "none",
          }}
        >
          <ChallengePresentationShell composition={challengeProgram} />
        </div>
        <TMIInteractiveVenueHud
          roomId={roomId}
          roomTitle="Challenge Room"
          experienceType="CHALLENGE"
          role="performer"
          ownership="human_owned"
          isRoomOwner
        />
      </div>

      <div style={{ padding: 16, maxWidth: 640, fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
        Judgment policy:{" "}
        <select
          value={policy}
          onChange={(e) => setPolicy(e.target.value as ChallengeJudgmentPolicy)}
          style={{
            marginLeft: 8,
            background: "#0a0614",
            color: "#FFD700",
            border: "1px solid rgba(255,215,0,0.35)",
            borderRadius: 4,
            padding: "4px 8px",
          }}
        >
          <option value="MEASURABLE_RESULT">MEASURABLE_RESULT</option>
          <option value="AUDIENCE_VOTE">AUDIENCE_VOTE</option>
          <option value="AUTHORIZED_JUDGES">AUTHORIZED_JUDGES</option>
        </select>
        <span style={{ marginLeft: 12 }}>Phase: {phase}</span>
      </div>
    </main>
  );
}
