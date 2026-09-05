"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AvatarSpeakerVideoTileProps {
  mediaStream?: MediaStream | null;
  displayName: string;
  isSpeaking: boolean;
  /** Diameter of the circular tile in px. Default 52. */
  size?: number;
}

/**
 * AvatarSpeakerVideoTile — circular video tile that appears above an avatar's
 * head when they are speaking. Pulsing cyan ring when isSpeaking, fades silent.
 * Mirrors video to match the speaker's perspective.
 */
export default function AvatarSpeakerVideoTile({
  mediaStream,
  displayName,
  isSpeaking,
  size = 52,
}: AvatarSpeakerVideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (mediaStream) {
      el.srcObject = mediaStream;
      void el.play().catch(() => {});
    } else {
      el.srcObject = null;
    }
  }, [mediaStream]);

  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <AnimatePresence>
      {isSpeaking && (
        <motion.div
          key="speaker-tile"
          initial={{ opacity: 0, scale: 0.6, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 8 }}
          transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
          style={{
            position: "relative",
            width: size,
            height: size,
            borderRadius: "50%",
            overflow: "visible",
            flexShrink: 0,
          }}
        >
          {/* Pulsing ring */}
          <motion.div
            animate={{ scale: [1, 1.18, 1], opacity: [0.7, 0.2, 0.7] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "absolute",
              inset: -4,
              borderRadius: "50%",
              border: "2px solid #00FFFF",
              pointerEvents: "none",
            }}
          />

          {/* Video or fallback initials */}
          <div
            style={{
              width: size,
              height: size,
              borderRadius: "50%",
              overflow: "hidden",
              border: "2px solid #00FFFF",
              background: "#0a0614",
              boxShadow: "0 0 12px rgba(0,255,255,0.45)",
              position: "relative",
            }}
          >
            {mediaStream ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transform: "scaleX(-1)", // mirror
                  borderRadius: "50%",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: size * 0.3,
                  fontWeight: 900,
                  color: "#00FFFF",
                  letterSpacing: "0.04em",
                  background:
                    "radial-gradient(circle at 40% 40%, rgba(0,255,255,0.15), transparent 70%)",
                }}
              >
                {initials}
              </div>
            )}
          </div>

          {/* Name label */}
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              marginTop: 3,
              fontSize: 9,
              fontWeight: 800,
              color: "#00FFFF",
              letterSpacing: "0.08em",
              whiteSpace: "nowrap",
              textShadow: "0 1px 6px rgba(0,0,0,0.8)",
              pointerEvents: "none",
            }}
          >
            {displayName}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
