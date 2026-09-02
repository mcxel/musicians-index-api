"use client";

/**
 * CypherPresentationShell — production circle + mic presentation for Cypher rooms (Phase 1).
 *
 * Center of gravity = active mic + next-up / circle rotation — NOT Battle VS corners.
 * Never invents participants, winners, or scores. Battle/Challenge must not use this shell.
 * surfaceKind = production (green/debug cannot certify experienceCert).
 */

import {
  PROGRAM_CYPHER_FOCUS,
  type CypherProgramComposition,
} from "@/lib/experiencePresentation/composeCypherProgram";

export type CypherPresentationShellProps = {
  composition: CypherProgramComposition | null;
  programSourceId?: string;
};

export default function CypherPresentationShell({
  composition,
  programSourceId = PROGRAM_CYPHER_FOCUS,
}: CypherPresentationShellProps) {
  const layout = composition?.composition ?? "CIRCLE_FOCUS";
  const circle = composition?.circle ?? [];
  const activeMic = composition?.activeMic ?? null;
  const nextUp = composition?.nextUp ?? null;

  return (
    <div
      data-cypher-presentation="production"
      data-experience-pack="Cypher"
      data-presentation-composition={layout}
      data-program-source={programSourceId}
      data-surface-kind="production"
      data-vs-layout="false"
      data-allows-winner-finale="false"
      data-lifecycle-phase={composition?.lifecyclePhase ?? "LOBBY_OPEN"}
      data-winner-id=""
      style={{
        position: "relative",
        width: "100%",
        minHeight: 280,
        overflow: "hidden",
        background: "#050510",
        border: "1px solid rgba(170,45,255,0.45)",
        borderRadius: 4,
        boxShadow: "inset 0 0 36px rgba(0,255,255,0.1)",
      }}
    >
      <div
        data-primitive="CypherCircle"
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          gap: 10,
          minHeight: 280,
          padding: 16,
          background:
            "linear-gradient(180deg, rgba(5,5,16,0.35) 0%, rgba(20,6,32,0.96) 100%)",
        }}
      >
        <div
          style={{
            fontSize: 9,
            fontWeight: 900,
            letterSpacing: "0.16em",
            color: "#AA2DFF",
          }}
        >
          CYPHER · CIRCLE + MIC HANDOFF
        </div>

        <div
          data-primitive="MicHandoff"
          style={{
            fontSize: 20,
            fontWeight: 900,
            color: "#fff",
            textShadow: "0 0 18px rgba(0,255,255,0.35)",
            lineHeight: 1.25,
          }}
        >
          {activeMic
            ? `ON MIC · ${activeMic.displayName}`
            : "Waiting for mic — join the circle"}
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            fontSize: 12,
          }}
        >
          <div data-primitive="IdentityPanel" style={{ color: "rgba(255,255,255,0.85)" }}>
            <span style={{ color: "rgba(0,255,255,0.75)", fontSize: 9, fontWeight: 800 }}>
              NEXT UP{" "}
            </span>
            {nextUp?.displayName ?? "— awaiting handoff"}
          </div>
          <div style={{ color: "rgba(255,255,255,0.65)" }}>
            <span style={{ color: "rgba(170,45,255,0.85)", fontSize: 9, fontWeight: 800 }}>
              CIRCLE{" "}
            </span>
            {circle.length > 0
              ? `${circle.length} in rotation`
              : "empty — no invented performers"}
          </div>
        </div>

        {circle.length > 0 ? (
          <div
            data-primitive="QueueRail"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              fontSize: 11,
              color: "rgba(255,255,255,0.7)",
            }}
          >
            {circle.map((p) => {
              const isMic = activeMic?.id === p.id;
              const isNext = nextUp?.id === p.id;
              return (
                <span
                  key={p.id}
                  style={{
                    padding: "3px 8px",
                    borderRadius: 4,
                    border: isMic
                      ? "1px solid rgba(0,255,255,0.55)"
                      : isNext
                        ? "1px solid rgba(255,215,0,0.45)"
                        : "1px solid rgba(255,255,255,0.15)",
                    background: isMic
                      ? "rgba(0,255,255,0.12)"
                      : isNext
                        ? "rgba(255,215,0,0.08)"
                        : "rgba(255,255,255,0.04)",
                    color: isMic ? "#00FFFF" : isNext ? "#FFD700" : "rgba(255,255,255,0.7)",
                  }}
                >
                  {isMic ? "🎤 " : isNext ? "→ " : ""}
                  {p.displayName}
                </span>
              );
            })}
          </div>
        ) : null}

        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
          Collaborative rotation — not Battle VS. No winner / elimination chrome.
        </div>

        {composition?.programSourceId ? (
          <div
            style={{
              marginTop: 4,
              fontSize: 9,
              fontFamily: "monospace",
              color: "rgba(170,45,255,0.65)",
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
