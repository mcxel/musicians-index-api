"use client";

import { useEffect, useMemo, useState } from "react";
import CutoutPortraitRenderer from "./CutoutPortraitRenderer";
import { getBlinkFrame, nextBlinkAt } from "./BlinkEngine";
import { getGestureFrame, type GestureState } from "./GestureEngine";
import { getIdleLoopFrame } from "./IdleLoopEngine";

type MotionPortraitEngineProps = {
  name: string;
  accent?: string;
  mode?: "cutout" | "circle";
  gesture?: GestureState;
  loopPreset?: "standard" | "champion";
};

export default function MotionPortraitEngine({
  name,
  accent = "#63e5ff",
  mode = "cutout",
  gesture = "idle",
  loopPreset = "standard",
}: MotionPortraitEngineProps) {
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [blinkStartedAtMs, setBlinkStartedAtMs] = useState(() => Date.now() - 5000);
  const [nextBlinkMs, setNextBlinkMs] = useState(() => nextBlinkAt(Date.now()));

  useEffect(() => {
    const speed = loopPreset === "champion" ? 50 : 80;
    const timer = window.setInterval(() => {
      const now = Date.now();
      setNowMs(now);
      if (now >= nextBlinkMs) {
        setBlinkStartedAtMs(now);
        setNextBlinkMs(nextBlinkAt(now));
      }
    }, speed);
    return () => window.clearInterval(timer);
  }, [loopPreset, nextBlinkMs]);

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
      <CutoutPortraitRenderer name={name} accent={accent} mode={mode} />
      <div style={{ color: accent, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase" }}>
        blink {Math.round(blink.openness * 100)}% | {gesture}
      </div>
    </div>
  );
}
