"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { LobbyPropEffectLayer } from "./LobbyPropEffectLayer";
import type { LobbyParticipant } from "@/lib/lobby/useLobbyPresenceSync";
import type { SeatAnchor } from "@/lib/lobby/FanLobbySkinRegistry";
import type { LobbyAvatarLocomotion } from "@/lib/lobby/FanLobbySeatAssigner";

interface SelfAvatar {
  userId: string;
  userName: string;
  emoji: string;
  x: number;
  y: number;
  propTrigger: string;
  isSpeaking: boolean;
  hasCameraOn: boolean;
  localStream: MediaStream | null;
  frameGlowColor?: string;
  isSeated?: boolean;
  seatId?: string | null;
  locomotion?: LobbyAvatarLocomotion;
}

interface LobbyFreeRoamAvatarsProps {
  self: SelfAvatar;
  participants: LobbyParticipant[];
  seats?: SeatAnchor[];
  occupiedSeatIds?: Set<string>;
  accentColor?: string;
  onFloorTap: (xPercent: number, yPercent: number) => void;
  /** Tap empty chair marker → sit */
  onSeatTap?: (anchor: SeatAnchor) => void;
  onAvatarSelect?: (participant: LobbyParticipant) => void;
  hiddenUserIds?: Set<string>;
}

/**
 * Free-roam floor + 2D chair anchors (conversation hangout).
 * Local cam bubble is real; remote camera = badge only (Phase B peer WebRTC).
 * No AvatarSeatUI spreadsheet grid.
 */
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
}: LobbyFreeRoamAvatarsProps) {
  const floorRef = useRef<HTMLDivElement>(null);

  function handleFloorClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = floorRef.current?.getBoundingClientRect();
    if (!rect) return;
    const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
    const yPercent = ((e.clientY - rect.top) / rect.height) * 100;
    onFloorTap(xPercent, yPercent);
  }

  const visible = participants.filter((p) => !hiddenUserIds?.has(p.userId));
  const occupied = occupiedSeatIds ?? new Set(
    visible.filter((p) => p.isSeated && p.seatId).map((p) => p.seatId!),
  );
  if (self.isSeated && self.seatId) occupied.add(self.seatId);

  return (
    <div
      ref={floorRef}
      onClick={handleFloorClick}
      style={{ position: "absolute", inset: 0, cursor: "crosshair" }}
      title="Tap floor to walk · tap a chair to sit"
    >
      {seats.map((seat) => {
        const taken = occupied.has(seat.id);
        const mine = self.seatId === seat.id && self.isSeated;
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

      {visible.map((p) => (
        <AvatarBubble
          key={p.userId}
          x={p.x}
          y={p.y}
          emoji={p.emoji}
          name={p.userName}
          isSpeaking={p.isSpeaking}
          hasCameraOn={p.hasCameraOn}
          isSeated={p.isSeated}
          locomotion={p.locomotion}
          onSelect={onAvatarSelect ? () => onAvatarSelect(p) : undefined}
        />
      ))}

      <AvatarBubble
        x={self.x}
        y={self.y}
        emoji={self.emoji}
        name={`${self.userName} (you)`}
        isSpeaking={self.isSpeaking}
        hasCameraOn={self.hasCameraOn}
        localStream={self.localStream}
        frameGlowColor={self.frameGlowColor}
        isSeated={self.isSeated}
        locomotion={self.locomotion}
        isSelf
      />

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
  localStream,
  frameGlowColor,
  isSelf,
  isSeated,
  locomotion,
  onSelect,
}: {
  x: number;
  y: number;
  emoji: string;
  name: string;
  isSpeaking: boolean;
  hasCameraOn: boolean;
  localStream?: MediaStream | null;
  frameGlowColor?: string;
  isSelf?: boolean;
  isSeated?: boolean;
  locomotion?: LobbyAvatarLocomotion;
  onSelect?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream]);

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
        {isSelf && localStream ? (
          <video ref={videoRef} autoPlay muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          emoji
        )}
        {!isSelf && hasCameraOn && (
          <div style={{ position: "absolute", bottom: -2, right: -2, fontSize: 11, background: "#050510", borderRadius: "50%", padding: 2 }}>📹</div>
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
