"use client";

import { useEffect, useRef, useState } from "react";
import {
  getStageSnapshot,
  subscribeStage,
  type StageSnapshot,
  type StageState,
} from "@/lib/live/StageLifecycleEngine";

// Inject curtain keyframes once
let cssInjected = false;
function injectCSS() {
  if (cssInjected || typeof document === "undefined") return;
  cssInjected = true;
  const s = document.createElement("style");
  s.textContent = `
@keyframes curtainPartLeft {
  from { transform: perspective(800px) rotateY(0deg) translateX(0); }
  to   { transform: perspective(800px) rotateY(-55deg) translateX(-100%); }
}
@keyframes curtainPartRight {
  from { transform: perspective(800px) rotateY(0deg) translateX(0); }
  to   { transform: perspective(800px) rotateY(55deg) translateX(100%); }
}
@keyframes curtainCloseLeft {
  from { transform: perspective(800px) rotateY(-55deg) translateX(-100%); }
  to   { transform: perspective(800px) rotateY(0deg) translateX(0); }
}
@keyframes curtainCloseRight {
  from { transform: perspective(800px) rotateY(55deg) translateX(100%); }
  to   { transform: perspective(800px) rotateY(0deg) translateX(0); }
}
@keyframes ripple {
  0%,100% { background-position: 0% 50%; }
  50%      { background-position: 100% 50%; }
}
@keyframes goldPulse {
  0%,100% { opacity: 0.6; }
  50%      { opacity: 1; }
}
@keyframes countdownPulse {
  0%   { transform: scale(1.4); opacity: 0; }
  30%  { transform: scale(1);   opacity: 1; }
  80%  { transform: scale(1);   opacity: 1; }
  100% { transform: scale(0.9); opacity: 0; }
}
`;
  document.head.appendChild(s);
}

interface Props {
  /** Override duration in ms (default 4000). Synced to StageLifecycleEngine. */
  durationMs?: number;
  /** Called when curtain is fully open */
  onFullyOpen?: () => void;
  /** Called when curtain is fully closed */
  onFullyClosed?: () => void;
}

export default function StageCurtain({ durationMs = 4000, onFullyOpen, onFullyClosed }: Props) {
  const [snap, setSnap] = useState<StageSnapshot>(getStageSnapshot());
  const prevState = useRef<StageState>(snap.state);
  const openFiredRef = useRef(false);
  const closedFiredRef = useRef(false);

  useEffect(() => {
    injectCSS();
    return subscribeStage((s) => {
      setSnap({ ...s });
      prevState.current = s.state;
    });
  }, []);

  const isParting = snap.state === "CURTAIN_PART" || snap.state === "LIGHTING_SNAP" || snap.state === "CAMERA_LIVE" || snap.state === "INTERMISSION";
  const isClosing = snap.state === "CURTAIN_CLOSE" || snap.state === "ENDED";
  const isOpen = snap.state === "CAMERA_LIVE" || snap.state === "INTERMISSION";
  const showCountdown = snap.state === "COUNTDOWN" && snap.countdownRemaining !== null;

  // Fire callbacks
  useEffect(() => {
    if (isOpen && !openFiredRef.current) {
      openFiredRef.current = true;
      const t = setTimeout(() => onFullyOpen?.(), durationMs);
      return () => clearTimeout(t);
    }
  }, [isOpen, durationMs, onFullyOpen]);

  useEffect(() => {
    if (snap.state === "ENDED" && !closedFiredRef.current) {
      closedFiredRef.current = true;
      const t = setTimeout(() => onFullyClosed?.(), durationMs);
      return () => clearTimeout(t);
    }
  }, [snap.state, durationMs, onFullyClosed]);

  // Reset callback guards on prep reset
  useEffect(() => {
    if (snap.state === "STAGE_PREP") {
      openFiredRef.current = false;
      closedFiredRef.current = false;
    }
  }, [snap.state]);

  const animDur = `${durationMs}ms`;
  const curtainFill = "linear-gradient(180deg,#1a0005 0%,#2d0009 30%,#1a0005 60%,#0d0003 100%)";
  const foldLines = Array.from({ length: 8 });

  return (
    <div
      style={{
        position: "absolute", inset: 0,
        pointerEvents: isOpen ? "none" : "all",
        zIndex: 50,
        overflow: "hidden",
      }}
    >
      {/* LEFT PANEL */}
      <div
        style={{
          position: "absolute", top: 0, left: 0, width: "50%", height: "100%",
          background: curtainFill,
          transformOrigin: "left center",
          animation: isParting
            ? `curtainPartLeft ${animDur} cubic-bezier(0.25,0.46,0.45,0.94) forwards`
            : isClosing
            ? `curtainCloseLeft ${animDur} cubic-bezier(0.55,0.06,0.68,0.19) forwards`
            : undefined,
          boxShadow: "inset -8px 0 24px rgba(0,0,0,0.5), 4px 0 20px rgba(0,0,0,0.6)",
        }}
      >
        {/* Velvet fold lines */}
        {foldLines.map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: 0, bottom: 0,
              left: `${(i + 1) * (100 / (foldLines.length + 1))}%`,
              width: 2,
              background: "rgba(0,0,0,0.35)",
              boxShadow: "1px 0 4px rgba(255,255,255,0.04)",
            }}
          />
        ))}
        {/* Gold trim */}
        <div style={{
          position: "absolute", top: 0, bottom: 0, right: 0, width: 6,
          background: "linear-gradient(180deg,#FFD700,#b8860b,#FFD700,#b8860b)",
          animation: "goldPulse 2s ease-in-out infinite",
        }} />
      </div>

      {/* RIGHT PANEL */}
      <div
        style={{
          position: "absolute", top: 0, right: 0, width: "50%", height: "100%",
          background: curtainFill,
          transformOrigin: "right center",
          animation: isParting
            ? `curtainPartRight ${animDur} cubic-bezier(0.25,0.46,0.45,0.94) forwards`
            : isClosing
            ? `curtainCloseRight ${animDur} cubic-bezier(0.55,0.06,0.68,0.19) forwards`
            : undefined,
          boxShadow: "inset 8px 0 24px rgba(0,0,0,0.5), -4px 0 20px rgba(0,0,0,0.6)",
        }}
      >
        {foldLines.map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: 0, bottom: 0,
              left: `${(i + 1) * (100 / (foldLines.length + 1))}%`,
              width: 2,
              background: "rgba(0,0,0,0.35)",
              boxShadow: "1px 0 4px rgba(255,255,255,0.04)",
            }}
          />
        ))}
        <div style={{
          position: "absolute", top: 0, bottom: 0, left: 0, width: 6,
          background: "linear-gradient(180deg,#FFD700,#b8860b,#FFD700,#b8860b)",
          animation: "goldPulse 2s ease-in-out infinite",
        }} />
      </div>

      {/* TOP VALANCE */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 56,
        background: "linear-gradient(180deg,#0d0003,#1a0005)",
        zIndex: 2,
        borderBottom: "3px solid #b8860b",
        boxShadow: "0 4px 20px rgba(0,0,0,0.8)",
      }}>
        <div style={{
          position: "absolute", bottom: 0, left: "10%", right: "10%",
          height: 3,
          background: "linear-gradient(90deg,transparent,#FFD700,transparent)",
        }} />
      </div>

      {/* COUNTDOWN overlay */}
      {showCountdown && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 10,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.5)",
        }}>
          <div
            key={snap.countdownRemaining}
            style={{
              fontSize: "clamp(72px,15vw,140px)",
              fontWeight: 900,
              color: snap.countdownRemaining! <= 3 ? "#FF2DAA" : "#FFD700",
              fontFamily: "'Inter',sans-serif",
              letterSpacing: "-0.04em",
              animation: "countdownPulse 1s ease-out forwards",
              textShadow: `0 0 40px ${snap.countdownRemaining! <= 3 ? "#FF2DAA" : "#FFD700"}`,
            }}
          >
            {snap.countdownRemaining}
          </div>
        </div>
      )}

      {/* STAGE PREP label */}
      {snap.state === "STAGE_PREP" && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 10,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: 12,
        }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: "#FFD700", letterSpacing: "0.35em" }}>
            PREPARING STAGE
          </div>
          <div style={{ width: 40, height: 2, background: "rgba(255,215,0,0.3)" }} />
        </div>
      )}
    </div>
  );
}
