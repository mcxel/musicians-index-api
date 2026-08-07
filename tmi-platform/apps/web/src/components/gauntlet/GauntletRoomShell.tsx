"use client";

/**
 * GauntletRoomShell — persistent destination.
 * Sequenced: main round → audience elimination → survivor rest + visible side battles → next round.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  getOrCreateGauntletRoom,
  getGauntletRoom,
  isGauntletEnabled,
  isGauntletEntryEnabled,
  joinGauntletRoom,
  listGauntletParticipants,
  setGauntletVenueSkin,
  type GauntletRoomState,
} from "@/lib/gauntlet/GauntletRoomRuntime";
import {
  advanceGauntletPhase,
  beginRound,
  createGauntletRun,
  getGauntletRun,
  getPerformanceClockRemaining,
  type GauntletRunState,
} from "@/lib/gauntlet/GauntletRunRuntime";
import { getGauntletVenueSkin, listGauntletVenueSkins } from "@/lib/gauntlet/GauntletVenueManifest";
import { buildGauntletPresentationFrame } from "@/lib/gauntlet/GauntletPresentationSystem";
import { getGauntletJudgingConfig } from "@/lib/gauntlet/GauntletJudgingConfig";
import {
  getSideStageSummary,
  getVisibleSideBattles,
} from "@/lib/gauntlet/GauntletSideBattleEngine";
import { isEliminationVoteOpen } from "@/lib/gauntlet/GauntletAudienceEliminationVote";
import {
  captureGauntletBadge,
  championBadgeTitle,
} from "@/lib/gauntlet/GauntletMemoryHooks";
import GauntletPresentationOverlay from "@/components/gauntlet/GauntletPresentationOverlay";
import GauntletRoundHUD from "@/components/gauntlet/GauntletRoundHUD";
import GauntletEliminationVotePanel from "@/components/gauntlet/GauntletEliminationVotePanel";
import { getGuestId } from "@/lib/identity/getGuestId";

const UniversalVenueRenderer = dynamic(
  () => import("@/components/live/UniversalVenueRenderer"),
  { ssr: false },
);

type Props = { roomId: string };

export default function GauntletRoomShell({ roomId }: Props) {
  const [room, setRoom] = useState<GauntletRoomState | null>(null);
  const [run, setRun] = useState<GauntletRunState | null>(null);
  const [clock, setClock] = useState(0);
  const [joinMsg, setJoinMsg] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const [voterId] = useState(() => getGuestId());

  useEffect(() => {
    if (!isGauntletEnabled()) return;
    const r = getOrCreateGauntletRoom(roomId);
    if (r) {
      joinGauntletRoom({
        roomId,
        userId: "guest-preview",
        displayName: "Guest",
        asCompetitor: false,
      });
      setRoom(getGauntletRoom(roomId));
    }
  }, [roomId]);

  useEffect(() => {
    if (!run) return;
    const id = setInterval(() => {
      setClock(getPerformanceClockRemaining(run.runId));
      setTick((n) => n + 1);
    }, 250);
    return () => clearInterval(id);
  }, [run]);

  const venue = useMemo(
    () => (room ? getGauntletVenueSkin(room.venueSkinId) : null),
    [room],
  );

  const side = useMemo(() => getSideStageSummary(roomId), [roomId, tick, run?.phase]);
  const visibleSides = useMemo(() => getVisibleSideBattles(roomId), [roomId, tick, run?.phase]);
  const voteOpen = run ? isEliminationVoteOpen(run.runId) : false;

  const frame = useMemo(() => {
    if (!run) {
      return buildGauntletPresentationFrame({
        phase: "REGISTRATION",
        roundSize: 32,
        aliveCount: room?.waitingCount ?? 0,
        clockSeconds: 0,
        sideStageLabel: side.latestLabel,
        realPulse: 0,
      });
    }
    return buildGauntletPresentationFrame({
      phase: run.phase,
      roundSize: run.roundSize,
      roundNumber: run.roundNumber,
      aliveCount: run.aliveIds.length,
      clockSeconds: clock,
      championName: run.championId ?? undefined,
      sideStageLabel: side.latestLabel,
      voteOpen,
      realPulse: 0,
    });
  }, [run, clock, room?.waitingCount, side.latestLabel, voteOpen]);

  const judging = getGauntletJudgingConfig(roomId);
  const showMainVenue = !run || run.mainStageFocus || run.phase === "FINAL" || run.phase === "CHAMPION";

  if (!isGauntletEnabled()) {
    return (
      <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: 28 }}>
        <h1 style={{ color: "#FFD700" }}>TMI Musical Gauntlet</h1>
        <p style={{ color: "rgba(255,255,255,0.65)" }}>
          Gauntlet is feature-flagged off (GAUNTLET_ENABLED). Enable flags to open the persistent destination.
        </p>
        <Link href="/battles/lobby-wall" style={{ color: "#00FFFF" }}>
          ← Battles Lobby Wall
        </Link>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", position: "relative" }}>
      <div
        style={{
          position: "relative",
          zIndex: 2,
          padding: "16px 18px",
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          borderBottom: "1px solid rgba(255,215,0,0.25)",
          background: "rgba(5,5,16,0.92)",
        }}
      >
        <div>
          <div style={{ fontSize: 10, letterSpacing: "0.18em", color: "#FFD700", fontWeight: 900 }}>
            PERSISTENT GAUNTLET · {room?.roomClass ?? "PERSISTENT_GAUNTLET"}
          </div>
          <h1 style={{ margin: "4px 0 0", fontSize: 22, color: "#fff" }}>TMI Musical Gauntlet</h1>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
            {venue?.label ?? "Venue"} · Judging {judging.mode} · Audience elimination · sequenced sides
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, color: "#00FF88" }}>
            Spec {room?.spectatorCount ?? 0} · Wait {room?.waitingCount ?? 0} · Active {room?.activeCount ?? 0}
          </span>
          <Link
            href="/battles/lobby-wall"
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: "#00FFFF",
              textDecoration: "none",
              border: "1px solid rgba(0,255,255,0.35)",
              borderRadius: 8,
              padding: "8px 12px",
            }}
          >
            Battles Wall
          </Link>
        </div>
      </div>

      <div style={{ margin: "12px 16px 0", position: "relative", zIndex: 3 }}>
        <GauntletRoundHUD run={run} clockSeconds={clock} roomId={roomId} />
      </div>

      <div style={{ margin: 16, position: "relative", zIndex: 2 }}>
        <GauntletPresentationOverlay frame={frame} />
      </div>

      {/* Main stage venue — primary when performing; still visible during rest as dimmed shell */}
      <div
        style={{
          position: "relative",
          minHeight: 320,
          zIndex: 1,
          opacity: showMainVenue ? 1 : 0.55,
        }}
      >
        {venue && (
          <UniversalVenueRenderer
            roomId={roomId}
            mode="audience"
            venueIndex={venue.venueIndex as 0 | 1 | 2 | 3 | 4}
            instantEmptyStage
          />
        )}
        {run?.survivorsResting && (
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              zIndex: 5,
              padding: "6px 10px",
              borderRadius: 8,
              background: "rgba(5,5,16,0.85)",
              border: "1px solid rgba(255,215,0,0.4)",
              fontSize: 11,
              fontWeight: 800,
              color: "#FFD700",
            }}
          >
            SURVIVORS RESTING · SIDE WINDOW LIVE
          </div>
        )}
      </div>

      {/* Visible side-stage PiP / wall cards — everyone can see */}
      <div
        style={{
          margin: "0 16px 12px",
          padding: 12,
          borderRadius: 10,
          border: "1px solid rgba(255,45,170,0.35)",
          background: "rgba(255,45,170,0.08)",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.14em", color: "#FF2DAA" }}>
          SIDE STAGE · {side.windowOpen ? "LIVE WINDOW (BETWEEN ROUNDS)" : "QUEUED (WAITS FOR NEXT SLOT)"}
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 4 }}>
          Visible to everyone. Side battles never run during the main performance window.
        </div>
        {visibleSides.length === 0 ? (
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 8 }}>
            No side battles queued yet.
          </div>
        ) : (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
            {visibleSides.slice(0, 6).map((b) => (
              <div
                key={b.sideBattleId}
                style={{
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: `1px solid ${b.status === "LIVE" ? "rgba(255,45,170,0.6)" : "rgba(255,255,255,0.2)"}`,
                  background: b.status === "LIVE" ? "rgba(255,45,170,0.18)" : "rgba(0,0,0,0.35)",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#fff",
                  minWidth: 140,
                }}
              >
                <div style={{ color: b.status === "LIVE" ? "#FF2DAA" : "#FFD700", fontSize: 9 }}>
                  {b.status}
                </div>
                {b.competitorAId.slice(0, 8)} vs {b.competitorBId?.slice(0, 8) ?? "…"}
              </div>
            ))}
          </div>
        )}
      </div>

      {run?.phase === "AUDIENCE_ELIMINATION_VOTE" && (
        <GauntletEliminationVotePanel
          runId={run.runId}
          aliveIds={run.aliveIds}
          voterId={voterId}
          onVoted={() => setTick((n) => n + 1)}
        />
      )}

      <div
        style={{
          padding: 16,
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          position: "relative",
          zIndex: 2,
        }}
      >
        <button
          type="button"
          disabled={!isGauntletEntryEnabled()}
          onClick={() => {
            const result = joinGauntletRoom({
              roomId,
              userId: `comp-${Date.now()}`,
              displayName: "Competitor",
              asCompetitor: true,
            });
            setJoinMsg(result.ok ? "Joined as Waiting Competitor" : result.reason ?? "join-failed");
            setRoom(getGauntletRoom(roomId));
          }}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            border: "none",
            fontWeight: 900,
            background: isGauntletEntryEnabled() ? "#FFD700" : "rgba(255,255,255,0.1)",
            color: "#050510",
            cursor: isGauntletEntryEnabled() ? "pointer" : "not-allowed",
          }}
        >
          ENTER AS COMPETITOR
        </button>
        <button
          type="button"
          onClick={() => {
            const waiting = listGauntletParticipants(roomId);
            const next = createGauntletRun(roomId, waiting);
            beginRound(next.runId);
            setRun(getGauntletRun(next.runId));
            setRoom(getGauntletRoom(roomId));
          }}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            border: "1px solid rgba(0,255,255,0.4)",
            background: "rgba(0,255,255,0.12)",
            color: "#00FFFF",
            fontWeight: 900,
            cursor: "pointer",
          }}
        >
          START RUN
        </button>
        <button
          type="button"
          disabled={!run}
          onClick={() => {
            if (!run) return;
            const next = advanceGauntletPhase(run.runId);
            if (next?.phase === "CHAMPION" && next.championId) {
              void captureGauntletBadge({
                userId: next.championId,
                roomId,
                runId: next.runId,
                kind: "CHAMPION",
                title: championBadgeTitle(),
              });
            }
            setRun(next ? { ...next } : null);
            setRoom(getGauntletRoom(roomId));
            setTick((n) => n + 1);
          }}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            border: "1px solid rgba(255,215,0,0.4)",
            background: run ? "rgba(255,215,0,0.12)" : "rgba(255,255,255,0.06)",
            color: "#FFD700",
            fontWeight: 900,
            cursor: run ? "pointer" : "not-allowed",
            opacity: run ? 1 : 0.45,
          }}
        >
          ADVANCE PHASE
        </button>
        {listGauntletVenueSkins().map((skin) => (
          <button
            key={skin.id}
            type="button"
            onClick={() => {
              setGauntletVenueSkin(roomId, skin.id);
              setRoom(getGauntletRoom(roomId));
            }}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.15)",
              background: room?.venueSkinId === skin.id ? "rgba(255,215,0,0.2)" : "transparent",
              color: "#fff",
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            {skin.label}
          </button>
        ))}
      </div>
      {joinMsg && (
        <div style={{ padding: "0 16px 20px", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
          {joinMsg}
        </div>
      )}
      {run && (
        <div style={{ padding: "0 16px 24px", fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
          {run.phase} · round {run.roundNumber} · alive {run.aliveIds.length}
          {run.lastEliminatedIds.length ? ` · eliminated ${run.lastEliminatedIds.map((id) => id.slice(0, 6)).join(",")}` : ""}
          {run.survivorsResting ? " · survivors resting" : ""}
        </div>
      )}
    </main>
  );
}
