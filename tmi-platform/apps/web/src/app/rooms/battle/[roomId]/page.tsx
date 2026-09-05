"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import WinnerStaysChallengerHUD from "@/components/battles/WinnerStaysChallengerHUD";
import ChallengeThisPerformanceButton from "@/components/battles/ChallengeThisPerformanceButton";
import FanRubricVotingPanel from "@/components/voting/FanRubricVotingPanel";
import CompetitionBeatDock from "@/components/competition/CompetitionBeatDock";
import TMIInteractiveVenueHud from "@/components/venue-hud/TMIInteractiveVenueHud";
import BattlePresentationShell from "@/components/live/BattlePresentationShell";
import {
  winnerStaysLifecycleEngine,
  type WinnerStaysSession,
} from "@/lib/competition/WinnerStaysLifecycleEngine";
import { battleBroadcastStateMachine } from "@/lib/competition/BattleBroadcastStateMachine";
import { battleChallengeEconomyEngine } from "@/lib/competition/BattleChallengeEconomyEngine";
import { getGuestId } from "@/lib/identity/getGuestId";
import {
  clearBattleProgram,
  composeBattleProgram,
  getActiveBattleProgram,
  type BattleProgramComposition,
} from "@/lib/experiencePresentation/composeBattleProgram";

const UniversalVenueRenderer = dynamic(
  () => import("@/components/live/UniversalVenueRenderer"),
  { ssr: false },
);

const CHALLENGER_SLOT = {
  userId: "challenger-fan",
  displayName: "Challenger",
};

export default function BattleRoomByIdPage() {
  const params = useParams();
  const roomId = typeof params?.roomId === "string" ? params.roomId : "battle-open";
  const battleId = roomId.startsWith("battle-") ? roomId.replace(/^battle-/, "") : roomId;
  const [session, setSession] = useState<WinnerStaysSession | null>(null);
  const [battleProgram, setBattleProgram] = useState<BattleProgramComposition | null>(null);
  const [voterId] = useState(() => getGuestId());

  const actor = useMemo(
    () => ({
      userId: "local-performer",
      displayName: "Local Performer",
      tier: "gold" as const,
      role: "performer" as const,
      ageVerified: true,
    }),
    [],
  );

  /** Real roster only — challenger appears when lifecycle locks one; never invent dual. */
  const matchRoster = useMemo(() => {
    const championId = session?.championId?.trim() || actor.userId;
    const challengerId = session?.challengerId?.trim() || "";
    const ids = [championId, challengerId].filter(Boolean).filter((id, i, arr) => arr.indexOf(id) === i);
    const labels: Record<string, string> = {
      [championId]: session?.championName?.trim() || actor.displayName,
    };
    if (challengerId) {
      labels[challengerId] = session?.challengerName?.trim() || CHALLENGER_SLOT.displayName;
    }
    return { ids, labels, championId, challengerId };
  }, [session, actor.userId, actor.displayName]);

  const rubricOpen =
    session?.phase === "RESULT_PENDING" || session?.phase === "CHALLENGER_CALL";

  useEffect(() => {
    if (!winnerStaysLifecycleEngine.getSession(battleId)) {
      winnerStaysLifecycleEngine.startMatch(battleId, roomId, actor.userId, actor.displayName);
    }
    // Drive broadcast machine with real corner A (read by compose — no fake B).
    if (!battleBroadcastStateMachine.getState(battleId)) {
      battleBroadcastStateMachine.competitorAJoins(battleId, actor.userId);
    }
    // Seed earned points so CHALLENGE eligibility is real for the demo actor.
    battleChallengeEconomyEngine.seedUser(actor.userId, 100);
    return winnerStaysLifecycleEngine.subscribe(battleId, (s) => setSession({ ...s }));
  }, [actor.userId, actor.displayName, battleId, roomId]);

  // Production Battle PROGRAM — same pattern as composePerformerLiveProgram on Regular GO LIVE.
  useEffect(() => {
    const championId = session?.championId?.trim() || actor.userId;
    const championName = session?.championName?.trim() || actor.displayName;
    const challengerId = session?.challengerId?.trim() || "";
    const challengerName = session?.challengerName?.trim() || "";

    if (challengerId && !battleBroadcastStateMachine.getState(battleId)?.competitorBId) {
      battleBroadcastStateMachine.competitorBJoins(battleId, challengerId);
    }

    const composed = composeBattleProgram({
      sessionId: `battle-session:${battleId}`,
      battleId,
      roomId,
      cornerA: { id: championId, displayName: championName },
      cornerB: challengerId
        ? { id: challengerId, displayName: challengerName || CHALLENGER_SLOT.displayName }
        : null,
      bindJumbotron: true,
    });
    setBattleProgram(composed);

    return () => {
      if (getActiveBattleProgram()?.battleId === battleId) {
        clearBattleProgram("battle-room-unmount");
      }
    };
  }, [session, actor.userId, actor.displayName, battleId, roomId]);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", position: "relative" }}>
      <div
        style={{
          padding: "16px 18px",
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          borderBottom: "1px solid rgba(255,45,170,0.3)",
          position: "relative",
          zIndex: 3,
          background: "rgba(5,5,16,0.92)",
        }}
      >
        <div>
          <div style={{ fontSize: 10, letterSpacing: "0.16em", color: "#FF2DAA", fontWeight: 900 }}>
            TEMPORARY_BATTLE · WINNER STAYS
          </div>
          <h1 style={{ margin: "4px 0 0", fontSize: 22, color: "#ff6b35" }}>Battle Room</h1>
          <p style={{ margin: "6px 0 0", color: "rgba(255,255,255,0.65)", fontSize: 13 }}>
            Room {roomId} — matchup end opens challenger call; room does not auto-close.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <button
            type="button"
            onClick={() =>
              winnerStaysLifecycleEngine.enterResultPending(battleId, actor.userId, actor.displayName)
            }
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
            SIMULATE MATCH RESULT
          </button>
          <Link
            href={`/battles/${battleId}`}
            style={{
              textDecoration: "none",
              color: "#ffd700",
              border: "1px solid rgba(255,215,0,0.4)",
              borderRadius: 6,
              padding: "8px 12px",
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            Battle Detail
          </Link>
          <Link
            href="/battles/lobby-wall"
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
            Battles Wall
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
          <BattlePresentationShell composition={battleProgram} />
        </div>
        <WinnerStaysChallengerHUD battleId={battleId} actor={actor} />
        <TMIInteractiveVenueHud
          roomId={roomId}
          roomTitle="Battle Room"
          experienceType="BATTLE"
          role="performer"
          votingOpen={rubricOpen}
          ownership="human_owned"
          battleId={battleId}
          isRoomOwner
        />
      </div>

      {rubricOpen && (
        <FanRubricVotingPanel
          roomId={roomId}
          eventId={`${battleId}-${session?.phase ?? "result"}`}
          performerIds={matchRoster.ids}
          performerLabels={matchRoster.labels}
          voterId={voterId}
          votingOpen={rubricOpen}
        />
      )}

      <CompetitionBeatDock
        roomId={roomId}
        lane="battle"
        performerId={actor.userId}
        performerIds={matchRoster.ids}
      />

      <div style={{ padding: 16, maxWidth: 480 }}>
        <ChallengeThisPerformanceButton
          performerId={actor.userId}
          contentType="freestyle"
          contentLabel="Freestyle set"
          actor={{ userId: "challenger-fan", tier: "gold", followsPerformer: true }}
          challengeHref={`/battles/create?target=${encodeURIComponent(actor.userId)}`}
        />
      </div>
    </main>
  );
}
