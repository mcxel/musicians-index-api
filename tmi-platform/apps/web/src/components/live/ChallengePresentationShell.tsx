"use client";

/**
 * ChallengePresentationShell — production objective presentation for Challenge rooms (Phase 1).
 *
 * Center of gravity = ChallengeContract (objective), NOT Battle VS corners.
 * Never invents a second participant, score, or result. Cypher/Battle must not use this shell.
 * surfaceKind = production (green/debug cannot certify experienceCert).
 */

import {
  PROGRAM_CHALLENGE_PRIMARY,
  type ChallengeProgramComposition,
} from "@/lib/experiencePresentation/composeChallengeProgram";

export type ChallengePresentationShellProps = {
  composition: ChallengeProgramComposition | null;
  programSourceId?: string;
};

function policyLabel(policy: string): string {
  switch (policy) {
    case "AUDIENCE_VOTE":
      return "AUDIENCE VOTE";
    case "AUTHORIZED_JUDGES":
      return "AUTHORIZED JUDGES";
    case "MEASURABLE_RESULT":
      return "MEASURABLE RESULT";
    default:
      return policy;
  }
}

export default function ChallengePresentationShell({
  composition,
  programSourceId = PROGRAM_CHALLENGE_PRIMARY,
}: ChallengePresentationShellProps) {
  const layout = composition?.composition ?? "OBJECTIVE_FOCUS";
  const objective = composition?.objective;
  const result = composition?.result;
  const winnerId = composition?.winnerId ?? undefined;
  const stake = objective?.realStakeOrReward?.trim() || "NONE";

  return (
    <div
      data-challenge-presentation="production"
      data-experience-pack="Challenge"
      data-presentation-composition={layout}
      data-program-source={programSourceId}
      data-surface-kind="production"
      data-vs-layout="false"
      data-prefers-challenge-contract="true"
      data-lifecycle-phase={composition?.lifecyclePhase ?? "OBJECTIVE_CONTRACT_ASSEMBLY"}
      data-winner-id={winnerId ?? ""}
      style={{
        position: "relative",
        width: "100%",
        minHeight: 280,
        overflow: "hidden",
        background: "#050510",
        border: "1px solid rgba(255,215,0,0.35)",
        borderRadius: 4,
        boxShadow: "inset 0 0 36px rgba(255,215,0,0.12)",
      }}
    >
      <div
        data-primitive="ChallengeContract"
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          gap: 10,
          minHeight: 280,
          padding: 16,
          background:
            "linear-gradient(180deg, rgba(5,5,16,0.35) 0%, rgba(12,8,4,0.96) 100%)",
        }}
      >
        <div
          style={{
            fontSize: 9,
            fontWeight: 900,
            letterSpacing: "0.16em",
            color: "#FFD700",
          }}
        >
          CHALLENGE · OBJECTIVE CONTRACT
        </div>

        <div
          style={{
            fontSize: 20,
            fontWeight: 900,
            color: "#fff",
            textShadow: "0 0 18px rgba(255,215,0,0.35)",
            lineHeight: 1.25,
          }}
        >
          {objective?.objective ?? "Waiting for objective contract"}
        </div>

        {objective ? (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              fontSize: 11,
              color: "rgba(255,255,255,0.7)",
            }}
          >
            <span data-primitive="TimerRing">
              {objective.timeLimitSec}s · {objective.attemptCount} attempt
              {objective.attemptCount === 1 ? "" : "s"}
            </span>
            <span style={{ color: "rgba(255,215,0,0.85)" }}>
              {policyLabel(objective.judgingPolicy)}
            </span>
            <span>STAKE: {stake}</span>
            {objective.category ? (
              <span style={{ color: "rgba(0,255,255,0.75)" }}>{objective.category}</span>
            ) : null}
          </div>
        ) : null}

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            marginTop: 4,
            fontSize: 12,
          }}
        >
          <div data-primitive="IdentityPanel" style={{ color: "rgba(255,255,255,0.85)" }}>
            <span style={{ color: "rgba(0,255,255,0.7)", fontSize: 9, fontWeight: 800 }}>
              CHALLENGER{" "}
            </span>
            {composition?.challenger?.displayName ?? "— awaiting"}
          </div>
          <div data-primitive="IdentityPanel" style={{ color: "rgba(255,255,255,0.85)" }}>
            <span style={{ color: "rgba(255,45,170,0.75)", fontSize: 9, fontWeight: 800 }}>
              CHALLENGED{" "}
            </span>
            {composition?.challenged?.displayName ?? "— awaiting"}
          </div>
        </div>

        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
          Objective-centered — not Battle VS. Dual split only if a future format authorizes it;
          this shell never forces corner collision.
        </div>

        {result ? (
          <div
            data-primitive="ResultCard"
            style={{
              marginTop: 4,
              padding: "8px 10px",
              borderRadius: 4,
              border: "1px solid rgba(255,215,0,0.4)",
              background: "rgba(255,215,0,0.08)",
            }}
          >
            <div
              style={{
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: "0.12em",
                color: "#FFD700",
              }}
            >
              RESULT · {result.outcome}
            </div>
            <div style={{ fontSize: 13, color: "#fff", marginTop: 4 }}>
              {result.summaryText || "Authorized result recorded."}
            </div>
            {winnerId ? (
              <div style={{ fontSize: 11, color: "rgba(0,255,255,0.8)", marginTop: 4 }}>
                Winner id: {winnerId}
              </div>
            ) : null}
          </div>
        ) : null}

        {composition?.programSourceId ? (
          <div
            style={{
              marginTop: 4,
              fontSize: 9,
              fontFamily: "monospace",
              color: "rgba(255,215,0,0.55)",
              letterSpacing: "0.06em",
            }}
          >
            {composition.programSourceId} · {layout}
          </div>
        ) : null}
      </div>
    </div>
  );
}
