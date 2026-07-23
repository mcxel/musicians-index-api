"use client";

import { useEffect, useMemo, useState } from "react";
import CutoutPortraitRenderer from "./CutoutPortraitRenderer";
import { getBlinkFrame, nextBlinkAt, seedFromId } from "./BlinkEngine";
import { getGestureFrame, type GestureState } from "./GestureEngine";
import { getIdleLoopFrame } from "./IdleLoopEngine";

type MotionPortraitEngineProps = {
  name: string;
  accent?: string;
  mode?: "cutout" | "circle";
  gesture?: GestureState;
  loopPreset?: "standard" | "champion";
  imageSrc?: string;
  // The blink%/gesture readout below the portrait is a debug label - keep it
  // for existing callers by default, but let production placements (e.g. a
  // real DJ booth) turn it off.
  showStatusLabel?: boolean;
};

export default function MotionPortraitEngine({
  name,
  accent = "#63e5ff",
  mode = "cutout",
  gesture = "idle",
  loopPreset = "standard",
  imageSrc,
  showStatusLabel = true,
}: MotionPortraitEngineProps) {
  // Stable per-avatar offset (derived from `name`) so multiple avatars on
  // screen at once don't all compute the same blink phase from the shared
  // wall clock and blink in unison.
  const blinkSeed = useMemo(() => seedFromId(name), [name]);

  const [nowMs, setNowMs] = useState(() => Date.now());
  const [blinkStartedAtMs, setBlinkStartedAtMs] = useState(() => Date.now() - 5000);
  const [nextBlinkMs, setNextBlinkMs] = useState(() => nextBlinkAt(Date.now(), {}, blinkSeed));

  useEffect(() => {
    const speed = loopPreset === "champion" ? 50 : 80;
    const timer = window.setInterval(() => {
      const now = Date.now();
      setNowMs(now);
      if (now >= nextBlinkMs) {
        setBlinkStartedAtMs(now);
        setNextBlinkMs(nextBlinkAt(now, {}, blinkSeed));
      }
    }, speed);
    return () => window.clearInterval(timer);
  }, [loopPreset, nextBlinkMs, blinkSeed]);

  const idle = useMemo(() => getIdleLoopFrame(nowMs), [nowMs]);
  const blink = useMemo(() => getBlinkFrame(nowMs, blinkStartedAtMs), [nowMs, blinkStartedAtMs]);
  const gestureFrame = useMemo(() => getGestureFrame(gesture, nowMs), [gesture, nowMs]);

  return (
    <div
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        transform: `translateY(${idle.bobY + gestureFrame.torsoShiftY}px) rotate(${idle.swayDeg}deg) scale(${idle.breatheScale})`,
        transformOrigin: "50% 70%",
        transition: "transform 120ms linear",
      }}
    >
      <CutoutPortraitRenderer name={name} accent={accent} mode={mode} imageSrc={imageSrc} />
      {showStatusLabel && (
        <div style={{ color: accent, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          blink {Math.round(blink.openness * 100)}% | {gesture}
        </div>
      )}
    </div>
  );
}
