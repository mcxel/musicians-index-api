"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { LobbyPropEffectLayer } from "./LobbyPropEffectLayer";
import type { LobbyParticipant } from "@/lib/lobby/useLobbyPresenceSync";

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
  /** Presence Frame accent (PresenceFrameRegistry) - only synced for self today; remote frame choice isn't broadcast yet. */
  frameGlowColor?: string;
}

interface LobbyFreeRoamAvatarsProps {
  self: SelfAvatar;
  participants: LobbyParticipant[];
  onFloorTap: (xPercent: number, yPercent: number) => void;
  /** Trust & Safety — open report/block menu for a remote avatar */
  onAvatarSelect?: (participant: LobbyParticipant) => void;
  /** Locally blocked ids — hidden for reporter (Level-1 friction) */
  hiddenUserIds?: Set<string>;
}

/**
 * Free-roam floor: self and every synced participant rendered at their
 * live x/y%. Speaking glow is driven by each person's own real mic reading
 * (broadcast via lobby-sync) - never inferred locally about someone else.
 * Only the local user gets an actual camera preview; remote participants'
 * camera state shows as a badge, not a fabricated video feed, since there's
 * no shared WebRTC video transport in this room (honest limitation, not faked).
 */
export function LobbyFreeRoamAvatars({
  self,
  participants,
  onFloorTap,
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

  return (
    <div
      ref={floorRef}
      onClick={handleFloorClick}
      style={{ position: "absolute", inset: 0, cursor: "crosshair" }}
      title="Tap the floor to walk there"
    >
      {visible.map((p) => (
        <AvatarBubble
          key={p.userId}
          x={p.x}
          y={p.y}
          emoji={p.emoji}
          name={p.userName}
          isSpeaking={p.isSpeaking}
          hasCameraOn={p.hasCameraOn}
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
  x, y, emoji, name, isSpeaking, hasCameraOn, localStream, frameGlowColor, isSelf, onSelect,
}: {
  x: number; y: number; emoji: string; name: string;
  isSpeaking: boolean; hasCameraOn: boolean;
  localStream?: MediaStream | null; frameGlowColor?: string; isSelf?: boolean;
  onSelect?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const ringColor = isSpeaking ? "#00FF88" : isSelf ? (frameGlowColor ?? "#00FFFF66") : "rgba(255,255,255,0.25)";

  return (
    <motion.div
      animate={{ left: `${x}%`, top: `${y}%` }}
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
      style={{
        position: "absolute",
        transform: "translate(-50%, -50%)",
        zIndex: 15,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
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
          width: 56, height: 56, borderRadius: "50%",
          border: `2.5px solid ${ringColor}`,
          boxShadow: isSpeaking ? `0 0 16px ${ringColor}` : "none",
          background: "rgba(5,5,16,0.9)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 26, overflow: "hidden", position: "relative",
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
      <div style={{ fontSize: 9, fontWeight: 800, color: "#fff", background: "rgba(0,0,0,0.55)", padding: "2px 6px", borderRadius: 6, whiteSpace: "nowrap" }}>
        {name}
      </div>
    </motion.div>
  );
}
