"use client";

/**
 * BattlePresentationShell — production VS presentation for Battle rooms (Phase 1).
 *
 * Uses existing BattleSplitScreenPanel for dual occupancy. Never invents a second
 * competitor, score, or winner. Cypher must not use this shell.
 * surfaceKind = production (green/debug cannot certify experienceCert).
 */

import BattleSplitScreenPanel, {
  type BattlePerformer,
} from "@/components/live/BattleSplitScreenPanel";
import {
  PROGRAM_BATTLE_COMPOSITE,
  type BattleProgramComposition,
} from "@/lib/experiencePresentation/composeBattleProgram";

export type BattlePresentationShellProps = {
  composition: BattleProgramComposition | null;
  programSourceId?: string;
  /** Optional profile images when known — never required for identity. */
  cornerAImageUrl?: string | null;
  cornerBImageUrl?: string | null;
};

function toPerformer(
  corner: { id: string; displayName: string } | null,
  imageUrl: string | null | undefined,
  score: number | undefined
): BattlePerformer | null {
  if (!corner) return null;
  return {
    id: corner.id,
    name: corner.displayName,
    profileImageUrl: imageUrl?.trim() || "/images/tmi-placeholder.jpg",
    score,
  };
}

export default function BattlePresentationShell({
  composition,
  programSourceId = PROGRAM_BATTLE_COMPOSITE,
  cornerAImageUrl = null,
  cornerBImageUrl = null,
}: BattlePresentationShellProps) {
  const layout = composition?.composition ?? "A_DOMINANT";
  const dual = Boolean(composition?.dualOccupancy && composition.cornerA && composition.cornerB);
  const scores = composition?.scores;
  const winnerId = composition?.winnerId ?? undefined;

  const performerA = toPerformer(
    composition?.cornerA ?? null,
    cornerAImageUrl,
    scores?.scoreA
  );
  const performerB = toPerformer(
    composition?.cornerB ?? null,
    cornerBImageUrl,
    scores?.scoreB
  );

  return (
    <div
      data-battle-presentation="production"
      data-experience-pack="Battle"
      data-presentation-composition={layout}
      data-program-source={programSourceId}
      data-surface-kind="production"
      data-dual-occupancy={dual ? "true" : "false"}
      data-winner-id={winnerId ?? ""}
      data-broadcast-state={composition?.broadcastState ?? "SOLO_WAITING"}
      style={{
        position: "relative",
        width: "100%",
        minHeight: 280,
        overflow: "hidden",
        background: "#050510",
        border: "1px solid rgba(255,45,170,0.35)",
        borderRadius: 4,
        boxShadow: "inset 0 0 36px rgba(255,45,170,0.1)",
      }}
    >
      {dual && performerA && performerB ? (
        <div data-primitive="LiveVideoPanel" data-vs-layout="true">
          <BattleSplitScreenPanel
            performerA={performerA}
            performerB={performerB}
            eventType="battle"
            showHost={false}
            initialLayout="VS_MODE"
            winnerId={winnerId}
            roundLabel={
              composition?.broadcastState === "VS_REVEAL"
                ? "VS"
                : composition?.broadcastState === "WINNER_REVEAL"
                  ? "WINNER"
                  : "BATTLE"
            }
          />
        </div>
      ) : (
        <div
          data-primitive="IdentityPanel"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            gap: 8,
            minHeight: 280,
            padding: 16,
            background:
              "linear-gradient(180deg, rgba(5,5,16,0.4) 0%, rgba(10,6,20,0.95) 100%)",
          }}
        >
          <div
            style={{
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: "0.16em",
              color: "#FF2DAA",
            }}
          >
            BATTLE · CORNER A
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 900,
              color: "#fff",
              textShadow: "0 0 18px rgba(0,255,255,0.35)",
            }}
          >
            {performerA?.name ?? "Waiting for competitor"}
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
            Dual VS unlocks when a real second competitor joins — no placeholder opponent.
          </div>
          {composition?.programSourceId ? (
            <div
              style={{
                marginTop: 4,
                fontSize: 9,
                fontFamily: "monospace",
                color: "rgba(0,255,255,0.55)",
                letterSpacing: "0.06em",
              }}
            >
              {composition.programSourceId}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
