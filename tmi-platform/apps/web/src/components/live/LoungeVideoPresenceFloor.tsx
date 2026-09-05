"use client";

/**
 * Lounge free-roam floor — video panels only, no avatar meshes.
 * Furniture is CSS (couches/bar). Collision mesh is honest OPEN / not photoreal.
 * Ad chassis are in-world objects fed by getAdSlotForZone.
 */

import { useEffect, useMemo, useRef, type MouseEvent, type TouchEvent } from "react";
import { useVideoPresenceLocomotion } from "@/hooks/useVideoPresenceLocomotion";
import LoungeAdChassisPanel from "@/components/live/LoungeAdChassisPanel";
import {
  LOUNGE_FLOOR_BOUNDS,
  LOUNGE_FURNITURE_PROPS,
  LOUNGE_VIDEO_PRESENCE_LAW,
  listLoungeAdSurfaces,
  applyLoungeProximity,
  collideLoungeMove,
  joinLoungeVideoPanel,
  leaveLoungeVideoPanel,
  type LoungeParticipantChassis,
} from "@/lib/live/loungeVideoPresenceLaw";
import { listSpatialPanels } from "@/lib/venue-hud/SpatialVideoPresenceDirector";

export interface LoungeVideoPresenceMember {
  userId: string;
  displayName: string;
  chassis?: LoungeParticipantChassis;
}

export default function LoungeVideoPresenceFloor({
  roomId,
  members,
  localUserId,
}: {
  roomId: string;
  members: LoungeVideoPresenceMember[];
  localUserId?: string;
}) {
  const floorRef = useRef<HTMLDivElement>(null);
  const localId = localUserId ?? "local-lounge";
  const panelId = `lounge-panel-${localId}`;
  const surfaces = useMemo(() => listLoungeAdSurfaces(), []);

  useEffect(() => {
    joinLoungeVideoPanel({
      userId: localId,
      streamId: `stream-${localId}`,
      positionXyz: [0, 1.5, 0],
    });
    return () => {
      leaveLoungeVideoPanel(localId);
    };
  }, [localId]);

  const locomotion = useVideoPresenceLocomotion({
    panelId,
    floorBounds: LOUNGE_FLOOR_BOUNDS,
    collideMove: collideLoungeMove,
    applyProximity: applyLoungeProximity,
    initialPosition: [0, 1.5, 0],
  });

  const panels = listSpatialPanels().filter((p) => p.userId);

  const onFloor = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;
    locomotion.onFloorClick(xPct, yPct, panels);
  };

  const onTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    const t = e.touches[0];
    if (!t || !floorRef.current) return;
    locomotion.onFloorTouchStart(t.clientX, t.clientY, floorRef.current.getBoundingClientRect());
  };

  const onTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    const t = e.touches[0];
    if (!t || !floorRef.current) return;
    e.preventDefault();
    locomotion.onFloorTouchMove(t.clientX, t.clientY, floorRef.current.getBoundingClientRect(), panels);
  };

  const onTouchEnd = () => {
    locomotion.onFloorTouchEnd();
  };

  return (
    <div
      ref={floorRef}
      data-lounge-video-presence-floor="true"
      data-lounge-avatars="false"
      data-room-id={roomId}
      data-gate3="OPEN"
      data-collision-certified={String(LOUNGE_VIDEO_PRESENCE_LAW.collisionMeshCertified)}
      data-locomotion-input="mouse,touch,keyboard"
      data-stream-reconnect-on-move="false"
      data-voice-gain={locomotion.voiceGain.toFixed(2)}
      tabIndex={0}
      onClick={onFloor}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{
        position: "relative",
        minHeight: 280,
        borderRadius: 10,
        overflow: "hidden",
        cursor: "crosshair",
        touchAction: "none",
        outline: "none",
        background:
          "radial-gradient(ellipse at 50% 20%, rgba(170,45,255,0.16), transparent 50%), linear-gradient(180deg, #120818 0%, #050510 70%)",
        border: "1px solid rgba(170,45,255,0.28)",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 8,
          top: 8,
          zIndex: 4,
          fontSize: 8,
          fontWeight: 800,
          letterSpacing: "0.12em",
          color: "rgba(255,255,255,0.45)",
        }}
      >
        FREE ROAM · VIDEO PANELS · NO AVATARS · WASD/ARROWS · COLLISION MESH OPEN · GATE 3 OPEN
      </div>

      {LOUNGE_FURNITURE_PROPS.map((prop) => (
        <div
          key={prop.id}
          data-lounge-furniture={prop.kind}
          style={{
            position: "absolute",
            left: `${prop.xPct}%`,
            top: `${prop.yPct}%`,
            width: `${prop.wPct}%`,
            height: `${prop.hPct}%`,
            transform: "translate(-50%, -50%)",
            borderRadius: prop.kind === "couch" ? 14 : 4,
            background:
              prop.kind === "couch"
                ? "linear-gradient(180deg, rgba(90,40,80,0.65), rgba(30,12,28,0.85))"
                : prop.kind === "bar"
                  ? "linear-gradient(90deg, rgba(40,28,18,0.8), rgba(20,12,8,0.9))"
                  : "rgba(40,30,20,0.55)",
            border: "1px solid rgba(255,215,0,0.18)",
            pointerEvents: "none",
          }}
        />
      ))}

      {surfaces.map((surface) => (
        <LoungeAdChassisPanel key={surface.anchor.id} surface={surface} />
      ))}

      {(members.length ? members : []).map((m, i) => {
        const panel = panels.find((p) => p.userId === m.userId);
        const xPct = panel ? 30 + ((panel.positionXyz[0] + 2) / 4) * 40 : 28 + (i % 4) * 16;
        const yPct = panel ? 28 + ((panel.positionXyz[2] + 2) / 4) * 36 : 30 + Math.floor(i / 4) * 18;
        const scale = panel?.scale ?? 1;
        const chassis = (panel?.chassisSkinId ?? m.chassis ?? "tv").toUpperCase();
        return (
          <div
            key={m.userId}
            data-lounge-webrtc-panel={m.userId}
            data-chassis={chassis}
            style={{
              position: "absolute",
              left: `${xPct}%`,
              top: `${yPct}%`,
              width: 72 * scale,
              height: 48 * scale,
              transform: "translate(-50%, -50%)",
              borderRadius: chassis === "PHONE" ? 10 : 4,
              border: "2px solid rgba(0,255,255,0.5)",
              background: "rgba(5,5,16,0.92)",
              boxShadow: "0 0 12px rgba(0,255,255,0.2)",
              pointerEvents: "none",
              display: "grid",
              placeItems: "center",
              padding: 4,
            }}
          >
            <span style={{ fontSize: 8, fontWeight: 800, color: "#00FFFF", letterSpacing: "0.08em" }}>
              {chassis}
            </span>
            <span style={{ fontSize: 9, color: "#fff", fontWeight: 700 }}>
              {m.displayName.split("|")[0]?.slice(0, 10) ?? "Fan"}
            </span>
          </div>
        );
      })}

      <div
        data-lounge-viewer
        style={{
          position: "absolute",
          left: `${locomotion.viewerPct.xPct}%`,
          top: `${locomotion.viewerPct.yPct}%`,
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: localUserId ? "#00FF88" : "#FFD700",
          transform: "translate(-50%, -50%)",
          boxShadow: "0 0 8px #00FF88",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
