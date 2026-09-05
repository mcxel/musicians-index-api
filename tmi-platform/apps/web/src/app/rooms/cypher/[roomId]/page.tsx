"use client";

/**
 * /rooms/cypher/[roomId] — Phase 1 Cypher world presentation consumer.
 *
 * Mirrors Challenge/Battle upward pattern: circle + mic lifecycle → composeCypherProgram
 * → CypherPresentationShell. Collaborative handoff — NOT Battle VS.
 * Never invents circle members, winners, or scores (Rule 20).
 */

import Link from "next/link";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import CypherPresentationShell from "@/components/live/CypherPresentationShell";
import TMIInteractiveVenueHud from "@/components/venue-hud/TMIInteractiveVenueHud";
import type { CipherPresentationState } from "@/lib/cipher/CipherPresentationTypes";
import {
  clearCypherProgram,
  composeCypherProgram,
  getActiveCypherProgram,
  type CypherCircleParticipant,
  type CypherProgramComposition,
} from "@/lib/experiencePresentation/composeCypherProgram";

const UniversalVenueRenderer = dynamic(
  () => import("@/components/live/UniversalVenueRenderer"),
  { ssr: false },
);

export default function CypherRoomByIdPage() {
  const params = useParams();
  const roomId = typeof params?.roomId === "string" ? params.roomId : "cypher-open";
  const cypherId = roomId.startsWith("cypher-")
    ? roomId.replace(/^cypher-/, "")
    : roomId;

  const seedSelf = useMemo(
    () => ({
      id: "local-cypher-mc",
      displayName: "Local MC",
    }),
    [],
  );

  const [circle, setCircle] = useState<CypherCircleParticipant[]>([]);
  const [activeMicId, setActiveMicId] = useState<string | null>(null);
  const [phase, setPhase] = useState<CipherPresentationState>("LOBBY_OPEN");
  const [cypherProgram, setCypherProgram] = useState<CypherProgramComposition | null>(null);

  // Production Cypher PROGRAM — same upward pattern as composeChallengeProgram.
  useEffect(() => {
    const composed = composeCypherProgram({
      sessionId: `cypher-session:${cypherId}`,
      cypherId,
      roomId,
      circle,
      activeMicId,
      lifecyclePhase: phase,
      bindJumbotron: true,
    });
    setCypherProgram(composed);

    return () => {
      if (getActiveCypherProgram()?.cypherId === cypherId) {
        clearCypherProgram("cypher-room-unmount");
      }
    };
  }, [cypherId, roomId, circle, activeMicId, phase]);

  const addSelfToCircle = () => {
    setCircle((prev) => {
      if (prev.some((p) => p.id === seedSelf.id)) return prev;
      return [...prev, seedSelf];
    });
    setPhase((p) => (p === "LOBBY_OPEN" ? "PARTICIPANTS_READY" : p));
  };

  const addRealPeer = () => {
    setCircle((prev) => {
      if (prev.some((p) => p.id === "local-cypher-peer")) return prev;
      return [...prev, { id: "local-cypher-peer", displayName: "Local Peer" }];
    });
    setPhase((p) => (p === "LOBBY_OPEN" ? "PARTICIPANTS_READY" : p));
  };

  const takeMic = () => {
    if (circle.length === 0) return;
    const micId = activeMicId && circle.some((p) => p.id === activeMicId)
      ? activeMicId
      : circle[0]!.id;
    setActiveMicId(micId);
    setPhase("VERSE_ACTIVE");
  };

  const passMic = () => {
    if (circle.length < 2 || !activeMicId) return;
    const idx = circle.findIndex((p) => p.id === activeMicId);
    const next = circle[(idx + 1) % circle.length];
    if (!next) return;
    setPhase("MIC_PASS");
    setActiveMicId(next.id);
    // Brief handoff → verse on next tick of state (same frame OK for Phase 1).
    queueMicrotask(() => setPhase("VERSE_ACTIVE"));
  };

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", position: "relative" }}>
      <div
        style={{
          padding: "16px 18px",
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          borderBottom: "1px solid rgba(170,45,255,0.35)",
          position: "relative",
          zIndex: 3,
          background: "rgba(5,5,16,0.92)",
        }}
      >
        <div>
          <div style={{ fontSize: 10, letterSpacing: "0.16em", color: "#AA2DFF", fontWeight: 900 }}>
            CYPHER · CIRCLE STAGE
          </div>
          <h1 style={{ margin: "4px 0 0", fontSize: 22, color: "#00FFFF" }}>Cypher Room</h1>
          <p style={{ margin: "6px 0 0", color: "rgba(255,255,255,0.65)", fontSize: 13 }}>
            Room {roomId} — mic handoff + rotation; not Battle VS.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <button
            type="button"
            onClick={addSelfToCircle}
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
            JOIN CIRCLE
          </button>
          <button
            type="button"
            onClick={addRealPeer}
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
            ADD REAL PEER
          </button>
          <button
            type="button"
            onClick={takeMic}
            disabled={circle.length === 0}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid rgba(170,45,255,0.45)",
              background: circle.length ? "rgba(170,45,255,0.15)" : "rgba(255,255,255,0.05)",
              color: circle.length ? "#AA2DFF" : "rgba(255,255,255,0.35)",
              fontWeight: 900,
              fontSize: 11,
              cursor: circle.length ? "pointer" : "not-allowed",
            }}
          >
            TAKE MIC
          </button>
          <button
            type="button"
            onClick={passMic}
            disabled={circle.length < 2 || !activeMicId}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid rgba(255,45,170,0.4)",
              background:
                circle.length >= 2 && activeMicId
                  ? "rgba(255,45,170,0.12)"
                  : "rgba(255,255,255,0.05)",
              color:
                circle.length >= 2 && activeMicId ? "#FF2DAA" : "rgba(255,255,255,0.35)",
              fontWeight: 900,
              fontSize: 11,
              cursor: circle.length >= 2 && activeMicId ? "pointer" : "not-allowed",
            }}
          >
            PASS MIC
          </button>
          <Link
            href="/rooms/cypher"
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
            Cypher Arena
          </Link>
          <Link
            href="/cyphers"
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
            Cyphers Wall
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
          <CypherPresentationShell composition={cypherProgram} />
        </div>
        <TMIInteractiveVenueHud
          roomId={roomId}
          roomTitle="Cypher Room"
          experienceType="CYPHER"
          role="performer"
          ownership="human_owned"
          isRoomOwner
        />
      </div>

      <div style={{ padding: 16, maxWidth: 640, fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
        Phase: {phase}
        {activeMicId ? ` · Mic: ${activeMicId}` : " · No mic"}
        {" · "}
        Circle: {circle.length}
      </div>
    </main>
  );
}
