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
import { planChallengeJumbotronFaces } from "@/lib/acgbr";
import VenueAutomatedJumbotronMount from "@/components/jumbotron/VenueAutomatedJumbotronMount";

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
  const [sessionRestored, setSessionRestored] = useState(false);

  const sessionKey = `tmi.challenge.operational.${roomId}`;

  const objective = useMemo<ChallengeObjectiveSnapshot>(
    () => ({
      ...DEFAULT_OBJECTIVE,
      objectiveId: `obj-${challengeId}`,
      judgingPolicy: policy,
    }),
    [challengeId, policy],
  );

  // Derive PROGRAM during render so the objective contract is present on first paint
  // (useEffect-only compose left the shell on "Waiting for objective contract" in physical cert).
  const challengeProgram = useMemo<ChallengeProgramComposition>(() => {
    return composeChallengeProgram({
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
  }, [actor.userId, actor.displayName, challengeId, roomId, objective, challenged, phase, result]);

  // Mid-flow resume: restore last phase/participants/result for this room (no invented state).
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(sessionKey);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          phase?: ChallengeLifecyclePhase;
          policy?: ChallengeJudgmentPolicy;
          challenged?: { id: string; displayName: string } | null;
          result?: ChallengeAuthorizedResult | null;
        };
        if (parsed.phase) setPhase(parsed.phase);
        if (parsed.policy) setPolicy(parsed.policy);
        if (parsed.challenged !== undefined) setChallenged(parsed.challenged);
        if (parsed.result !== undefined) setResult(parsed.result);
      }
    } catch {
      /* ignore corrupt resume blob */
    }
    setSessionRestored(true);
  }, [sessionKey]);

  useEffect(() => {
    if (!sessionRestored) return;
    try {
      sessionStorage.setItem(
        sessionKey,
        JSON.stringify({ phase, policy, challenged, result }),
      );
    } catch {
      /* quota / private mode */
    }
  }, [sessionKey, sessionRestored, phase, policy, challenged, result]);

  // Frozen SM: COUNTDOWN precedes ACTIVE — expose countdown, then advance.
  useEffect(() => {
    if (phase !== "ATTEMPT_1_COUNTDOWN" && phase !== "ATTEMPT_2_COUNTDOWN") return;
    const timer = window.setTimeout(() => {
      setPhase(phase === "ATTEMPT_1_COUNTDOWN" ? "ATTEMPT_1_ACTIVE" : "ATTEMPT_2_ACTIVE");
    }, 2500);
    return () => window.clearTimeout(timer);
  }, [phase]);

  // ACGBR face plan is derived read-only from phase (never writes Challenge truth).
  useEffect(() => {
    const facePlan = planChallengeJumbotronFaces(phase, {
      sessionId: `challenge-session:${challengeId}`,
      objectiveLabel: objective.objective,
      activeParticipantId:
        phase === "ATTEMPT_1_ACTIVE"
          ? actor.userId
          : phase === "ATTEMPT_2_ACTIVE"
            ? challenged?.id ?? null
            : null,
    });
    (
      window as unknown as {
        __TMI_CHALLENGE_ACGBR_FACES__?: ReturnType<typeof planChallengeJumbotronFaces>;
      }
    ).__TMI_CHALLENGE_ACGBR_FACES__ = facePlan;

    return () => {
      (
        window as unknown as {
          __TMI_CHALLENGE_ACGBR_FACES__?: unknown;
        }
      ).__TMI_CHALLENGE_ACGBR_FACES__ = null;
    };
  }, [
    actor.userId,
    challengeId,
    objective.objective,
    challenged?.id,
    phase,
  ]);

  // Clear module singleton only on room leave — not on phase ticks (PROGRAM is render-derived).
  useEffect(() => {
    return () => {
      if (getActiveChallengeProgram()?.challengeId === challengeId) {
        clearChallengeProgram("challenge-room-unmount");
      }
    };
  }, [challengeId]);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", position: "relative" }}>
      <div
        data-testid="challenge-room-controls"
        style={{
          padding: "16px 18px",
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          borderBottom: "1px solid rgba(255,215,0,0.3)",
          position: "relative",
          zIndex: 30,
          pointerEvents: "auto",
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
            data-testid="challenge-add-challenged"
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
            data-testid="challenge-start-attempt"
            onClick={() => setPhase("ATTEMPT_1_COUNTDOWN")}
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
            data-testid="challenge-record-complete"
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
        <UniversalVenueRenderer
          roomId={roomId}
          mode="audience"
          venueIndex={0}
          instantEmptyStage
          eventType="challenge"
          venueId={`challenge-${challengeId}`}
          jumbotronLookUpActive
        />
        <VenueAutomatedJumbotronMount
          roomId={roomId}
          eventType="challenge"
          venueId={`challenge-${challengeId}`}
          lookUpActive
        />
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
