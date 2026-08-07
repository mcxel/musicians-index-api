"use client";

/**
 * GauntletRoomShell — persistent Musical Gauntlet destination.
 * Uses UniversalVenueRenderer (Rule 21) + GauntletVenueManifest skins.
 * Run end ≠ room end.
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
  createGauntletRun,
  getGauntletRun,
  getPerformanceClockRemaining,
  type GauntletRunState,
} from "@/lib/gauntlet/GauntletRunRuntime";
import { getGauntletVenueSkin, listGauntletVenueSkins } from "@/lib/gauntlet/GauntletVenueManifest";
import { buildGauntletPresentationFrame } from "@/lib/gauntlet/GauntletPresentationSystem";
import { getGauntletJudgingConfig } from "@/lib/gauntlet/GauntletJudgingConfig";

const UniversalVenueRenderer = dynamic(
  () => import("@/components/live/UniversalVenueRenderer"),
  { ssr: false },
);

type Props = {
  roomId: string;
};

export default function GauntletRoomShell({ roomId }: Props) {
  const [room, setRoom] = useState<GauntletRoomState | null>(null);
  const [run, setRun] = useState<GauntletRunState | null>(null);
  const [clock, setClock] = useState(0);
  const [joinMsg, setJoinMsg] = useState<string | null>(null);

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
    const id = setInterval(() => setClock(getPerformanceClockRemaining(run.runId)), 250);
    return () => clearInterval(id);
  }, [run]);

  const venue = useMemo(
    () => (room ? getGauntletVenueSkin(room.venueSkinId) : null),
    [room],
  );

  const frame = useMemo(() => {
    if (!run) {
      return buildGauntletPresentationFrame({
        phase: "WHOS_ENTERING_NEXT",
        roundSize: 32,
        aliveCount: room?.waitingCount ?? 0,
        clockSeconds: 0,
        realPulse: 0,
      });
    }
    return buildGauntletPresentationFrame({
      phase: run.phase,
      roundSize: run.roundSize,
      aliveCount: run.aliveIds.length,
      clockSeconds: clock,
      realPulse: 0,
    });
  }, [run, clock, room?.waitingCount]);

  const judging = getGauntletJudgingConfig(roomId);

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
            {venue?.label ?? "Venue"} · Judging {judging.mode} · Gifts never silent votes
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

      {/* Jumbotron / presentation scaffold */}
      <div
        style={{
          margin: 16,
          borderRadius: 12,
          border: "1px solid rgba(255,215,0,0.35)",
          background: "linear-gradient(160deg, rgba(20,10,40,0.95), rgba(5,5,16,0.98))",
          padding: 16,
          position: "relative",
          zIndex: 2,
        }}
      >
        <div style={{ fontSize: 10, color: "#FFD700", fontWeight: 900, letterSpacing: "0.14em" }}>
          {frame.jumbotron.roundLabel} · {frame.overlay}
        </div>
        <div style={{ fontSize: 26, fontWeight: 900, marginTop: 6 }}>{frame.jumbotron.headline}</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>
          {frame.jumbotron.subline}
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 12, fontSize: 12 }}>
          <span>Alive: {frame.jumbotron.aliveCount}</span>
          <span style={{ color: "#00FFFF", fontFamily: "monospace", fontWeight: 900 }}>
            Clock {frame.jumbotron.clockSeconds}s
          </span>
          <span style={{ color: "rgba(255,255,255,0.4)" }}>
            Pulse {Math.round(frame.pulseIntensity * 100)}% (real only)
          </span>
        </div>
      </div>

      <div style={{ position: "relative", minHeight: 360, zIndex: 1 }}>
        {venue && (
          <UniversalVenueRenderer
            roomId={roomId}
            mode="audience"
            venueIndex={venue.venueIndex as 0 | 1 | 2 | 3 | 4}
            instantEmptyStage
          />
        )}
      </div>

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
            setRun(next);
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
          Run {run.runId} · phase {run.phase} · bracket {run.roundSize}
          {run.championId ? ` · champion ${run.championId}` : ""}
          {" · "}
          <button
            type="button"
            onClick={() => setRun(getGauntletRun(run.runId))}
            style={{
              background: "none",
              border: "none",
              color: "#00FFFF",
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            refresh
          </button>
        </div>
      )}
    </main>
  );
}
