"use client";

/**
 * /rooms/concert/[roomId] — Phase 1 Concert / World Concert presentation consumer.
 *
 * Mirrors Cypher/Challenge/Battle upward pattern: ConcertRuntimeEngine lifecycle
 * → composeConcertProgram → ConcertPresentationShell.
 * Stage + audience — NOT Battle VS, NOT Cypher circle.
 * World vs Mini from roomId prefix (world-*) or ?scope=world — never invent World.
 * Never invents headliner, setlist, attendance, tips, or scores (Rule 20).
 */

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Suspense, useEffect, useMemo, useState } from "react";
import ConcertPresentationShell from "@/components/live/ConcertPresentationShell";
import TMIInteractiveVenueHud from "@/components/venue-hud/TMIInteractiveVenueHud";
import type { ConcertState } from "@/lib/concert/ConcertRuntimeEngine";
import {
  clearConcertProgram,
  composeConcertProgram,
  getActiveConcertProgram,
  type ConcertHeadliner,
  type ConcertProgramComposition,
  type ConcertScope,
  type ConcertSetlistTrack,
} from "@/lib/experiencePresentation/composeConcertProgram";

const UniversalVenueRenderer = dynamic(
  () => import("@/components/live/UniversalVenueRenderer"),
  { ssr: false },
);

function resolveScope(roomId: string, scopeParam: string | null): ConcertScope {
  const q = (scopeParam ?? "").toLowerCase();
  if (q === "world" || q === "world-concert") return "WORLD";
  if (roomId.startsWith("world-") || roomId.includes("world-concert")) return "WORLD";
  return "MINI";
}

function ConcertRoomInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const roomId = typeof params?.roomId === "string" ? params.roomId : "concert-open";
  const concertId = roomId.startsWith("concert-")
    ? roomId.replace(/^concert-/, "")
    : roomId.replace(/^world-/, "");

  const scope = useMemo(
    () => resolveScope(roomId, searchParams?.get("scope") ?? null),
    [roomId, searchParams],
  );

  const seedHeadliner = useMemo<ConcertHeadliner>(
    () => ({
      id: "local-concert-headliner",
      displayName: "Local Headliner",
    }),
    [],
  );

  const [headliner, setHeadliner] = useState<ConcertHeadliner | null>(null);
  const [setlist, setSetlist] = useState<ConcertSetlistTrack[]>([]);
  const [nowPlayingIndex, setNowPlayingIndex] = useState<number | null>(null);
  const [phase, setPhase] = useState<ConcertState>("VENUE_PREP");
  const [concertProgram, setConcertProgram] = useState<ConcertProgramComposition | null>(
    null,
  );

  useEffect(() => {
    const composed = composeConcertProgram({
      sessionId: `concert-session:${concertId}`,
      concertId,
      roomId,
      scope,
      headlinerId: headliner?.id ?? null,
      headlinerDisplayName: headliner?.displayName ?? null,
      setlist,
      nowPlayingIndex,
      lifecyclePhase: phase,
      bindJumbotron: true,
    });
    setConcertProgram(composed);

    return () => {
      if (getActiveConcertProgram()?.concertId === concertId) {
        clearConcertProgram("concert-room-unmount");
      }
    };
  }, [concertId, roomId, scope, headliner, setlist, nowPlayingIndex, phase]);

  const claimStage = () => {
    setHeadliner(seedHeadliner);
    setPhase((p) => (p === "VENUE_PREP" || p === "HOUSE_LIGHTS" || p === "SEATING" ? "ARTIST_INTRO" : p));
  };

  const addRealTrack = () => {
    setSetlist((prev) => {
      if (prev.some((t) => t.trackId === "track-local-1")) return prev;
      return [
        ...prev,
        {
          trackId: "track-local-1",
          title: "Local Set Opener",
          durationLabel: "3:40",
        },
      ];
    });
  };

  const addEncoreTrack = () => {
    setSetlist((prev) => {
      if (prev.some((t) => t.trackId === "track-local-encore")) return prev;
      return [
        ...prev,
        {
          trackId: "track-local-encore",
          title: "Local Encore",
          durationLabel: "4:05",
          isEncoreTrack: true,
        },
      ];
    });
  };

  const startPerformance = () => {
    if (!headliner || setlist.length === 0) return;
    setNowPlayingIndex(0);
    setPhase("PERFORMANCE_ACTIVE");
  };

  const advanceTrack = () => {
    if (setlist.length === 0) return;
    setNowPlayingIndex((idx) => {
      const next = idx == null ? 0 : Math.min(idx + 1, setlist.length - 1);
      const track = setlist[next];
      setPhase(track?.isEncoreTrack ? "ENCORE" : "PERFORMANCE_ACTIVE");
      return next;
    });
  };

  const badgeColor = scope === "WORLD" ? "#00FFFF" : "#FFD700";

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", position: "relative" }}>
      <div
        style={{
          padding: "16px 18px",
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          borderBottom: `1px solid ${scope === "WORLD" ? "rgba(0,255,255,0.35)" : "rgba(255,215,0,0.35)"}`,
          position: "relative",
          zIndex: 3,
          background: "rgba(5,5,16,0.92)",
        }}
      >
        <div>
          <div style={{ fontSize: 10, letterSpacing: "0.16em", color: badgeColor, fontWeight: 900 }}>
            {scope === "WORLD" ? "🌍 WORLD CONCERT" : "⭐ MINI CONCERT"} · STAGE
          </div>
          <h1 style={{ margin: "4px 0 0", fontSize: 22, color: badgeColor }}>Concert Room</h1>
          <p style={{ margin: "6px 0 0", color: "rgba(255,255,255,0.65)", fontSize: 13 }}>
            Room {roomId} — stage + audience; not Battle VS / Cypher combat.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <button
            type="button"
            onClick={claimStage}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid rgba(255,45,170,0.4)",
              background: "rgba(255,45,170,0.1)",
              color: "#FF2DAA",
              fontWeight: 900,
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            CLAIM STAGE
          </button>
          <button
            type="button"
            onClick={addRealTrack}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: `1px solid ${badgeColor}66`,
              background: `${badgeColor}18`,
              color: badgeColor,
              fontWeight: 900,
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            ADD REAL TRACK
          </button>
          <button
            type="button"
            onClick={addEncoreTrack}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid rgba(255,215,0,0.4)",
              background: "rgba(255,215,0,0.1)",
              color: "#FFD700",
              fontWeight: 900,
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            ADD ENCORE TRACK
          </button>
          <button
            type="button"
            onClick={startPerformance}
            disabled={!headliner || setlist.length === 0}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid rgba(0,255,255,0.4)",
              background: "rgba(0,255,255,0.1)",
              color: "#00FFFF",
              fontWeight: 900,
              fontSize: 11,
              cursor: !headliner || setlist.length === 0 ? "not-allowed" : "pointer",
              opacity: !headliner || setlist.length === 0 ? 0.45 : 1,
            }}
          >
            START PERFORMANCE
          </button>
          <button
            type="button"
            onClick={advanceTrack}
            disabled={setlist.length === 0}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid rgba(170,45,255,0.4)",
              background: "rgba(170,45,255,0.1)",
              color: "#AA2DFF",
              fontWeight: 900,
              fontSize: 11,
              cursor: setlist.length === 0 ? "not-allowed" : "pointer",
              opacity: setlist.length === 0 ? 0.45 : 1,
            }}
          >
            NEXT TRACK
          </button>
          <Link
            href="/rooms"
            style={{ color: badgeColor, fontSize: 12, fontWeight: 700, alignSelf: "center" }}
          >
            ← Rooms
          </Link>
        </div>
      </div>

      <div style={{ position: "relative", minHeight: 420 }}>
        <UniversalVenueRenderer
          roomId={roomId}
          mode="audience"
          venueIndex={0}
          instantEmptyStage
          eventType={scope === "WORLD" ? "world-concert" : "mini-concert"}
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
          <ConcertPresentationShell composition={concertProgram} />
        </div>
        <TMIInteractiveVenueHud
          roomId={roomId}
          roomTitle={scope === "WORLD" ? "World Concert" : "Mini Concert"}
          experienceType={scope === "WORLD" ? "WORLD_CONCERT" : "LIVE"}
          role="performer"
          ownership="human_owned"
          isRoomOwner
        />
      </div>

      <div style={{ padding: 16, maxWidth: 640, fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
        Phase: {phase}
        {headliner ? ` · Stage: ${headliner.displayName}` : " · No headliner"}
        {" · "}
        Setlist: {setlist.length}
        {nowPlayingIndex != null ? ` · Track #${nowPlayingIndex + 1}` : ""}
      </div>
    </main>
  );
}

export default function ConcertRoomByIdPage() {
  return (
    <Suspense
      fallback={
        <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: 24 }}>
          Loading concert room…
        </main>
      }
    >
      <ConcertRoomInner />
    </Suspense>
  );
}
