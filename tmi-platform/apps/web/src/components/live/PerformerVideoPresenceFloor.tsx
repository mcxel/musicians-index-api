"use client";

/**
 * Performer lobby free-roam floor — WebRTC video panels only, NO avatar meshes.
 * Wired via PerformerLobbyPersonality on the same mill as LOUNGE_SIDE_ROOM.
 */

import { useEffect, useMemo, useRef, type MouseEvent, type TouchEvent } from "react";
import { useVideoPresenceLocomotion } from "@/hooks/useVideoPresenceLocomotion";
import {
  PERFORMER_LOBBY_FLOOR_BOUNDS,
  PERFORMER_LOBBY_PROPS,
  PERFORMER_LOBBY_VIDEO_PRESENCE_LAW,
  applyPerformerProximity,
  collidePerformerMove,
  joinPerformerVideoPanel,
  leavePerformerVideoPanel,
} from "@/lib/live/performerLobbyVideoPresenceLaw";
import type { PerformerPanelSkinId } from "@/lib/live/PerformerLobbyPersonality";
import { getPerformerGenreRoomTheme } from "@/lib/live/performerGenreRoomNetwork";
import { listSpatialPanels } from "@/lib/venue-hud/SpatialVideoPresenceDirector";

export interface PerformerVideoPresenceMember {
  userId: string;
  displayName: string;
  panelSkin?: PerformerPanelSkinId;
}

export default function PerformerVideoPresenceFloor({
  roomId,
  members,
  localUserId,
  lobbyMode,
}: {
  roomId: string;
  members: PerformerVideoPresenceMember[];
  localUserId?: string;
  lobbyMode?: string;
}) {
  const floorRef = useRef<HTMLDivElement>(null);
  const localId = localUserId ?? "local-performer";
  const panelId = `performer-panel-${localId}`;
  const genreTheme = useMemo(() => getPerformerGenreRoomTheme(roomId), [roomId]);

  useEffect(() => {
    joinPerformerVideoPanel({
      userId: localId,
      streamId: `stream-${localId}`,
      positionXyz: [0, 1.5, 0],
    });
    return () => {
      leavePerformerVideoPanel(localId);
    };
  }, [localId]);

  const locomotion = useVideoPresenceLocomotion({
    panelId,
    floorBounds: PERFORMER_LOBBY_FLOOR_BOUNDS,
    collideMove: collidePerformerMove,
    applyProximity: applyPerformerProximity,
    initialPosition: [0, 1.5, 0],
  });

  const panels = listSpatialPanels().filter((p) => p.userId);

  const onFloorClick = (e: MouseEvent<HTMLDivElement>) => {
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

  const modeLabel = useMemo(() => (lobbyMode ?? "SOCIAL").replace(/_/g, " "), [lobbyMode]);
  const floorBg =
    genreTheme?.floorGradient ??
    "radial-gradient(ellipse at 50% 18%, rgba(255,45,170,0.14), transparent 52%), linear-gradient(180deg, #0a0614 0%, #050510 72%)";
  const floorBorder = genreTheme?.borderColor ?? "rgba(255,45,170,0.32)";

  return (
    <div
      ref={floorRef}
      data-performer-video-presence-floor="true"
      data-performer-lobby-avatars="false"
      data-room-id={roomId}
      data-lobby-mode={lobbyMode ?? "SOCIAL"}
      data-gate3="OPEN"
      data-collision-certified={String(PERFORMER_LOBBY_VIDEO_PRESENCE_LAW.collisionMeshCertified)}
      data-locomotion-input="mouse,touch,keyboard"
      data-stream-reconnect-on-move="false"
      data-voice-gain={locomotion.voiceGain.toFixed(2)}
      tabIndex={0}
      onClick={onFloorClick}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{
        position: "relative",
        minHeight: 300,
        borderRadius: 10,
        overflow: "hidden",
        cursor: "crosshair",
        touchAction: "none",
        outline: "none",
        background: floorBg,
        border: `1px solid ${floorBorder}`,
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
        PERFORMER LOBBY · {genreTheme?.label ?? modeLabel} · FREE ROAM · VIDEO PANELS · NO AVATARS · WASD/ARROWS
      </div>

      {PERFORMER_LOBBY_PROPS.map((prop) => (
        <div
          key={prop.id}
          data-performer-lobby-prop={prop.kind}
          style={{
            position: "absolute",
            left: `${prop.xPct}%`,
            top: `${prop.yPct}%`,
            width: `${prop.wPct}%`,
            height: `${prop.hPct}%`,
            transform: "translate(-50%, -50%)",
            borderRadius: prop.kind === "rehearsal_couch" ? 12 : 4,
            background:
              prop.kind === "mixing_desk"
                ? "linear-gradient(180deg, rgba(30,30,50,0.85), rgba(10,10,20,0.95))"
                : prop.kind === "amp_rack"
                  ? "linear-gradient(90deg, rgba(40,20,20,0.8), rgba(20,10,10,0.9))"
                  : prop.kind === "mic_stand"
                    ? "rgba(255,255,255,0.08)"
                    : "linear-gradient(180deg, rgba(60,30,50,0.6), rgba(20,10,18,0.85))",
            border: `1px solid ${genreTheme?.propAccent ?? "rgba(255,45,170,0.2)"}`,
            pointerEvents: "none",
          }}
        />
      ))}

      {members.map((m, i) => {
        const panel = panels.find((p) => p.userId === m.userId);
        const xPct = panel ? 26 + ((panel.positionXyz[0] + 2) / 4) * 44 : 24 + (i % 4) * 17;
        const yPct = panel ? 26 + ((panel.positionXyz[2] + 2) / 4) * 38 : 28 + Math.floor(i / 4) * 16;
        const scale = panel?.scale ?? 1;
        const skin = m.panelSkin ?? "DEFAULT_MONITOR";
        const isLocal = m.userId === localUserId;
        return (
          <div
            key={m.userId}
            data-performer-webrtc-panel={m.userId}
            data-panel-skin={skin}
            style={{
              position: "absolute",
              left: `${xPct}%`,
              top: `${yPct}%`,
              width: 80 * scale,
              height: 52 * scale,
              transform: "translate(-50%, -50%)",
              borderRadius: 6,
              border: isLocal ? "2px solid #FFD700" : "2px solid rgba(255,45,170,0.55)",
              background: "rgba(5,5,16,0.92)",
              boxShadow: isLocal ? "0 0 14px rgba(255,215,0,0.25)" : "0 0 10px rgba(255,45,170,0.18)",
              pointerEvents: "none",
              display: "grid",
              placeItems: "center",
              padding: 4,
            }}
          >
            <span style={{ fontSize: 7, fontWeight: 800, color: "#FF2DAA", letterSpacing: "0.08em" }}>
              {skin.replace(/_/g, " ").slice(0, 12)}
            </span>
            <span style={{ fontSize: 9, color: "#fff", fontWeight: 700 }}>
              {m.displayName.split("|")[0]?.slice(0, 12) ?? "Performer"}
            </span>
          </div>
        );
      })}

      <div
        data-performer-viewer-position="true"
        data-local-panel-id={panelId}
        style={{
          position: "absolute",
          left: `${locomotion.viewerPct.xPct}%`,
          top: `${locomotion.viewerPct.yPct}%`,
          width: 10,
          height: 10,
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          background: "#FFD700",
          boxShadow: "0 0 8px rgba(255,215,0,0.6)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
