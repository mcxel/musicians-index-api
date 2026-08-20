"use client";

/**
 * Free-roam floor + seat anchors.
 * Perf: local fan uses AvatarRig (3D Avatar Runtime v0); peers stay simpler emoji bubbles.
 * Sit/stand syncs isSeated → AvatarRig sit pose at seat anchors.
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { LobbyPropEffectLayer } from "./LobbyPropEffectLayer";
import { AvatarHeadMediaSurface } from "./AvatarHeadMediaSurface";
import type { LobbyParticipant } from "@/lib/lobby/FanLobbyPresence";
import type { SeatAnchor } from "@/lib/lobby/FanLobbySkinRegistry";
import type { FanLobbyNavigationState } from "@/lib/lobby/FanLobbyPresence";
import {
  lobbyFloorDistancePct,
  resolveAvatarHeadMediaMode,
  type LobbyPeerMediaSnapshot,
} from "@/lib/lobby/lobbyPeerMediaBinding";
import {
  cosmeticIdsToAttachments,
  equippedIdsFromInventory,
  resolveOutfitTint,
} from "@/lib/avatars/fanAvatarLoadout";
import type { AvatarInventoryItem } from "@/lib/avatar/avatarInventoryEngine";
import {
  bobbleheadRuntimeToRigProps,
  readPersistedBobbleheadBaseId,
  resolveBobbleheadRuntimeCharacter,
} from "@/lib/avatars/BobbleheadRuntimeCharacter";

const AvatarViewer = dynamic(
  () => import("@/components/3d/AvatarLobbyCanvas").then((m) => m.AvatarViewer),
  { ssr: false },
);

interface SelfAvatar {
  userId: string;
  userName: string;
  emoji: string;
  x: number;
  y: number;
  propTrigger: string;
  isSpeaking: boolean;
  hasCameraOn: boolean;
  micEnabled?: boolean;
  localStream: MediaStream | null;
  frameGlowColor?: string;
  isSeated?: boolean;
  seatId?: string | null;
  seatAnchorId?: string | null;
  locomotion?: FanLobbyNavigationState;
  navigationState?: FanLobbyNavigationState;
  /** Optional skin tint from forge snapshot. */
  skinColor?: string;
}

interface LobbyFreeRoamAvatarsProps {
  self: SelfAvatar;
  participants: LobbyParticipant[];
  seats?: SeatAnchor[];
  occupiedSeatIds?: Set<string>;
  accentColor?: string;
  onFloorTap: (xPercent: number, yPercent: number) => void;
  onSeatTap?: (anchor: SeatAnchor) => void;
  onAvatarSelect?: (participant: LobbyParticipant) => void;
  hiddenUserIds?: Set<string>;
  peerMedia?: LobbyPeerMediaSnapshot | null;
  localHideHeadPanel?: boolean;
  /** Equipped cosmetic SKUs from inventory / menus. */
  equippedCosmeticIds?: string[];
}

export function LobbyFreeRoamAvatars({
  self,
  participants,
  seats = [],
  occupiedSeatIds,
  accentColor = "#FFD700",
  onFloorTap,
  onSeatTap,
  onAvatarSelect,
  hiddenUserIds,
  peerMedia = null,
  localHideHeadPanel = false,
  equippedCosmeticIds: equippedProp,
}: LobbyFreeRoamAvatarsProps) {
  const floorRef = useRef<HTMLDivElement>(null);
  const [loadoutIds, setLoadoutIds] = useState<string[]>(equippedProp ?? []);

  useEffect(() => {
    if (equippedProp?.length) {
      setLoadoutIds(equippedProp);
      return;
    }
    let cancelled = false;
    fetch("/api/avatar/inventory", { credentials: "include", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { AvatarInventory?: { items?: AvatarInventoryItem[] } } | null) => {
        if (cancelled || !data?.AvatarInventory?.items) return;
        setLoadoutIds(equippedIdsFromInventory(data.AvatarInventory.items));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [equippedProp]);

  function handleFloorClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = floorRef.current?.getBoundingClientRect();
    if (!rect) return;
    const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
    const yPercent = ((e.clientY - rect.top) / rect.height) * 100;
    onFloorTap(xPercent, yPercent);
  }

  const visible = participants.filter((p) => !hiddenUserIds?.has(p.userId));
  const occupied =
    occupiedSeatIds ??
    new Set(
      visible
        .filter((p) => p.isSeated && (p.seatAnchorId ?? p.seatId))
        .map((p) => (p.seatAnchorId ?? p.seatId)!),
    );
  const selfSeat = self.seatAnchorId ?? self.seatId;
  if (self.isSeated && selfSeat) occupied.add(selfSeat);

  const peerUnavailable = Boolean(peerMedia && !peerMedia.sessionReady);

  const attachmentIds = useMemo(() => {
    const ids = [...loadoutIds];
    if (self.propTrigger && self.propTrigger !== "none") ids.push(self.propTrigger);
    return ids;
  }, [loadoutIds, self.propTrigger]);

  const attachments = useMemo(
    () => cosmeticIdsToAttachments(attachmentIds, { activePropId: self.propTrigger }),
    [attachmentIds, self.propTrigger],
  );
  const outfitTint = resolveOutfitTint(attachmentIds);

  const bobbleCharacter = useMemo(
    () => resolveBobbleheadRuntimeCharacter(readPersistedBobbleheadBaseId()),
    // Re-resolve when loadout changes so session base stays fresh after picker
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loadoutIds, self.isSeated],
  );
  const bobbleRig = useMemo(
    () =>
      bobbleheadRuntimeToRigProps(bobbleCharacter, {
        isSeated: Boolean(self.isSeated),
        isPlaying: (self.navigationState ?? self.locomotion) === "WALKING",
        extraAccessoryIds: attachmentIds,
        activePropId: self.propTrigger !== "none" ? self.propTrigger : undefined,
      }),
    [bobbleCharacter, self.isSeated, self.navigationState, self.locomotion, attachmentIds, self.propTrigger],
  );

  return (
    <div
      ref={floorRef}
      onClick={handleFloorClick}
      style={{ position: "absolute", inset: 0, cursor: "crosshair" }}
      title="Tap floor to walk · tap a chair to sit"
    >
      {seats.map((seat) => {
        const taken = occupied.has(seat.id);
        const mine = selfSeat === seat.id && self.isSeated;
        return (
          <button
            key={seat.id}
            type="button"
            aria-label={taken ? `Seat ${seat.id} occupied` : `Sit at ${seat.id}`}
            disabled={taken && !mine}
            onClick={(e) => {
              e.stopPropagation();
              if (!taken && onSeatTap) onSeatTap(seat);
            }}
            style={{
              position: "absolute",
              left: `${seat.xPct}%`,
              top: `${seat.yPct}%`,
              transform: "translate(-50%, -50%)",
              zIndex: 8,
              width: 36,
              height: 28,
              borderRadius: 8,
              border: mine
                ? `2px solid ${accentColor}`
                : taken
                  ? "1px solid rgba(255,255,255,0.12)"
                  : `1.5px dashed ${accentColor}88`,
              background: mine
                ? `${accentColor}33`
                : taken
                  ? "rgba(0,0,0,0.35)"
                  : `${accentColor}14`,
              color: taken && !mine ? "rgba(255,255,255,0.25)" : accentColor,
              fontSize: 14,
              cursor: taken && !mine ? "default" : "pointer",
              opacity: taken && !mine ? 0.45 : 0.9,
              padding: 0,
              lineHeight: 1,
            }}
            title={mine ? "Your chair" : taken ? "Occupied" : "Sit here"}
          >
            🪑
          </button>
        );
      })}

      {visible.map((p) => {
        const media = peerMedia?.byUserId.get(p.userId);
        const dist = lobbyFloorDistancePct(self.x, self.y, p.x, p.y);
        const mode = resolveAvatarHeadMediaMode({
          isSelf: false,
          distancePct: dist,
        });
        return (
          <AvatarBubble
            key={p.userId}
            x={p.x}
            y={p.y}
            emoji={p.emoji}
            name={p.userName}
            isSpeaking={p.isSpeaking}
            hasCameraOn={p.cameraEnabled ?? p.hasCameraOn}
            micEnabled={p.micEnabled}
            isSeated={p.isSeated}
            locomotion={p.navigationState ?? p.locomotion}
            onSelect={onAvatarSelect ? () => onAvatarSelect(p) : undefined}
            headMode={mode}
            videoTrack={media?.videoTrack ?? null}
            peerMediaUnavailable={peerUnavailable || (Boolean(p.cameraEnabled) && !media?.hasVideoTrack)}
          />
        );
      })}

      {/* Local fan — hero 3D AvatarRig; peers stay 2D for perf */}
      <motion.div
        animate={{ left: `${self.x}%`, top: `${self.y}%` }}
        transition={{
          type: "spring",
          stiffness: (self.navigationState ?? self.locomotion) === "WALKING" ? 90 : 140,
          damping: 18,
        }}
        style={{
          position: "absolute",
          transform: "translate(-50%, -70%)",
          zIndex: 16,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          pointerEvents: "none",
        }}
      >
        <div style={{ marginBottom: 2 }}>
          <AvatarHeadMediaSurface
            mode={resolveAvatarHeadMediaMode({
              isSelf: true,
              distancePct: 0,
              localHidePanel: localHideHeadPanel,
            })}
            videoTrack={
              peerMedia?.byUserId.get(self.userId)?.videoTrack ??
              self.localStream?.getVideoTracks()[0] ??
              null
            }
            cameraEnabled={self.hasCameraOn}
            micEnabled={self.micEnabled ?? true}
            isSpeaking={self.isSpeaking}
            isSelf
            peerMediaUnavailable={false}
            label={`${self.userName} (you)`}
          />
        </div>
        <div
          style={{
            width: self.isSeated ? 72 : 88,
            height: self.isSeated ? 72 : 88,
            borderRadius: 12,
            border: `2px solid ${self.isSpeaking ? "#00FF88" : self.frameGlowColor ?? "#00FFFF66"}`,
            boxShadow: self.isSpeaking ? "0 0 16px #00FF88" : undefined,
            overflow: "hidden",
            background: "rgba(5,5,16,0.55)",
          }}
        >
          <AvatarViewer
            {...bobbleRig}
            color={bobbleRig.color ?? self.skinColor ?? "#AA2DFF"}
            outfitTint={bobbleRig.outfitTint ?? outfitTint}
            attachments={bobbleRig.attachments?.length ? bobbleRig.attachments : attachments}
            size={self.isSeated ? 72 : 88}
            enableOrbit={false}
          />
        </div>
        <div
          style={{
            fontSize: 8,
            fontWeight: 800,
            color: "#fff",
            background: "rgba(0,0,0,0.55)",
            padding: "2px 6px",
            borderRadius: 6,
            whiteSpace: "nowrap",
            marginTop: 2,
          }}
        >
          {self.isSeated ? `🪑 ${self.userName} (you)` : `${self.userName} (you)`}
        </div>
        <div style={{ fontSize: 7, color: "#00FFFF99", letterSpacing: "0.08em", fontWeight: 800 }}>
          {bobbleCharacter.displayName.toUpperCase()} · 3D WORLD CITIZEN
        </div>
      </motion.div>

      {visible.map((p) => (
        <LobbyPropEffectLayer key={`${p.userId}-prop`} propId={p.propTrigger} x={p.x} y={p.y} />
      ))}
      <LobbyPropEffectLayer propId={self.propTrigger} x={self.x} y={self.y} />
    </div>
  );
}

function AvatarBubble({
  x,
  y,
  emoji,
  name,
  isSpeaking,
  hasCameraOn,
  micEnabled = true,
  localStream,
  frameGlowColor,
  isSelf,
  isSeated,
  locomotion,
  onSelect,
  headMode,
  videoTrack,
  peerMediaUnavailable,
}: {
  x: number;
  y: number;
  emoji: string;
  name: string;
  isSpeaking: boolean;
  hasCameraOn: boolean;
  micEnabled?: boolean;
  localStream?: MediaStream | null;
  frameGlowColor?: string;
  isSelf?: boolean;
  isSeated?: boolean;
  locomotion?: FanLobbyNavigationState;
  onSelect?: () => void;
  headMode: ReturnType<typeof resolveAvatarHeadMediaMode>;
  videoTrack: MediaStreamTrack | null;
  peerMediaUnavailable?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && localStream && isSelf && headMode === "HIDDEN") {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream, isSelf, headMode]);

  const ringColor = isSpeaking
    ? "#00FF88"
    : isSelf
      ? (frameGlowColor ?? "#00FFFF66")
      : "rgba(255,255,255,0.25)";
  const size = isSeated ? 48 : 56;

  return (
    <motion.div
      animate={{ left: `${x}%`, top: `${y}%` }}
      transition={{ type: "spring", stiffness: locomotion === "WALKING" ? 90 : 140, damping: 18 }}
      style={{
        position: "absolute",
        transform: "translate(-50%, -50%)",
        zIndex: 15,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
        pointerEvents: onSelect ? "auto" : "none",
        cursor: onSelect ? "pointer" : undefined,
      }}
      onClick={
        onSelect
          ? (e) => {
              e.stopPropagation();
              onSelect();
            }
          : undefined
      }
      title={onSelect ? `Safety options for ${name}` : undefined}
    >
      <div style={{ marginBottom: 2, pointerEvents: "none" }}>
        <AvatarHeadMediaSurface
          mode={headMode}
          videoTrack={videoTrack}
          cameraEnabled={hasCameraOn}
          micEnabled={micEnabled}
          isSpeaking={isSpeaking}
          isSelf={isSelf}
          peerMediaUnavailable={peerMediaUnavailable}
          label={name}
        />
      </div>

      <motion.div
        animate={isSpeaking ? { scale: [1, 1.08, 1] } : { scale: 1 }}
        transition={{ repeat: isSpeaking ? Infinity : 0, duration: 0.8 }}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          border: `2.5px solid ${ringColor}`,
          boxShadow: isSpeaking ? `0 0 16px ${ringColor}` : isSeated ? "0 8px 0 rgba(0,0,0,0.35)" : "none",
          background: "rgba(5,5,16,0.9)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: isSeated ? 22 : 26,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {isSelf && localStream && headMode === "HIDDEN" ? (
          <video ref={videoRef} autoPlay muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          emoji
        )}
      </motion.div>
      <div
        style={{
          fontSize: 8,
          fontWeight: 800,
          color: "#fff",
          background: "rgba(0,0,0,0.55)",
          padding: "2px 6px",
          borderRadius: 6,
          whiteSpace: "nowrap",
        }}
      >
        {isSeated ? `🪑 ${name}` : name}
      </div>
    </motion.div>
  );
}
