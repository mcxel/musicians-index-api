"use client";

/**
 * VenueHUDParticipantRail
 * Right-side presence rail — real participants only.
 *
 * Video-reference geometry (1280×720):
 *   x: ~1165–1220
 *   y: ~185–630
 *   Portrait diameter: 38–42 px
 *   Vertical pitch:    44–47 px
 *
 * Normalized:
 *   right:  4.1%
 *   top:    25.7%
 *   height: 61.8%
 *   width:  4.3%
 *
 * Rules:
 *   - No fake participants (Rule 20)
 *   - Real presence from roomPresence prop or empty state
 *   - Speaking state → pulsing ring
 *   - Muted state → mute icon overlay
 *   - Camera off → avatar identity placeholder
 *   - Tap/click → inspects participant (where policy allows)
 *
 * Certification: L1 IMPLEMENTED
 */

import { motion } from "framer-motion";

export interface PresenceParticipant {
  id: string;
  displayName: string;
  avatarUrl?: string;
  isSpeaking?: boolean;
  isMuted?: boolean;
  isCameraOff?: boolean;
  isConnected?: boolean;
  role?: "host" | "performer" | "fan" | "guest";
}

interface VenueHUDParticipantRailProps {
  participants: PresenceParticipant[];
  onParticipantTap?: (participant: PresenceParticipant) => void;
  maxVisible?: number;
}

const SPEAKING_COLOR = "#00FFFF";
const MUTED_COLOR    = "#FF4466";

export default function VenueHUDParticipantRail({
  participants,
  onParticipantTap,
  maxVisible = 10,
}: VenueHUDParticipantRailProps) {
  const visible = participants.slice(0, maxVisible);
  const overflow = participants.length - maxVisible;

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1], delay: 0.06 }}
      style={{
        position: "absolute",
        right: "4.1%",
        top: "25.7%",
        width: 46,
        maxHeight: "61.8%",
        overflowY: "auto",
        overflowX: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 5,
        padding: "8px 0",
        borderRadius: 20,
        background: "rgba(12,14,22,0.62)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.14)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.45)",
        zIndex: 95,
        pointerEvents: "auto",
        scrollbarWidth: "none",
      }}
    >
      {visible.length === 0 ? (
        <div
          style={{
            fontSize: 9,
            color: "rgba(255,255,255,0.25)",
            textAlign: "center",
            padding: "8px 4px",
            letterSpacing: "0.04em",
            lineHeight: 1.4,
          }}
        >
          No participants
        </div>
      ) : (
        visible.map((p, i) => (
          <ParticipantPortrait
            key={p.id}
            participant={p}
            index={i}
            onTap={onParticipantTap}
          />
        ))
      )}

      {overflow > 0 && (
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 9,
            fontWeight: 800,
            color: "rgba(255,255,255,0.5)",
            letterSpacing: "0",
          }}
        >
          +{overflow}
        </div>
      )}
    </motion.div>
  );
}

function ParticipantPortrait({
  participant,
  index,
  onTap,
}: {
  participant: PresenceParticipant;
  index: number;
  onTap?: (p: PresenceParticipant) => void;
}) {
  const initials = participant.displayName
    .split(" ")
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const ringColor = participant.isSpeaking
    ? SPEAKING_COLOR
    : participant.isMuted
    ? MUTED_COLOR
    : "transparent";

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03, duration: 0.2, ease: "easeOut" }}
      title={`${participant.displayName}${participant.isMuted ? " (muted)" : ""}${participant.isSpeaking ? " (speaking)" : ""}`}
      onClick={() => onTap?.(participant)}
      style={{
        width: 38,
        height: 38,
        borderRadius: "50%",
        border: `2px solid ${ringColor}`,
        background: participant.avatarUrl
          ? `url(${participant.avatarUrl}) center/cover`
          : "rgba(255,255,255,0.08)",
        overflow: "hidden",
        position: "relative",
        cursor: "pointer",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 800,
        color: "rgba(255,255,255,0.8)",
        boxShadow: participant.isSpeaking
          ? `0 0 8px ${SPEAKING_COLOR}88`
          : "0 2px 6px rgba(0,0,0,0.4)",
        transition: "border-color 0.2s ease",
        padding: 0,
      }}
    >
      {!participant.avatarUrl && initials}

      {/* Speaking ring pulse */}
      {participant.isSpeaking && (
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0, 0.8] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          style={{
            position: "absolute",
            inset: -4,
            borderRadius: "50%",
            border: `2px solid ${SPEAKING_COLOR}`,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Mute badge */}
      {participant.isMuted && !participant.isSpeaking && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: MUTED_COLOR,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 7,
            color: "#fff",
            fontWeight: 900,
          }}
        >
          M
        </div>
      )}
    </motion.button>
  );
}
