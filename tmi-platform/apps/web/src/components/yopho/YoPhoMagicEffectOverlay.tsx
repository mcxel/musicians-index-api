"use client";

/**
 * Live CSS/SVG magic effect overlays for YoPho cards.
 * Instant toggle preview — no AI, no network.
 */

import type { CSSProperties } from "react";
import type { YoPhoMagicEffectId } from "@/lib/yopho/YoPhoMagicEffects";

interface Props {
  effects: YoPhoMagicEffectId[];
  /** When true, pause particle motion slightly (pause-react) */
  paused?: boolean;
  style?: CSSProperties;
}

const KEYFRAMES = `
@keyframes yopho-fx-rain {
  0% { transform: translateY(-10%) translateX(0); }
  100% { transform: translateY(110%) translateX(-8%); }
}
@keyframes yopho-fx-snow {
  0% { transform: translateY(-8%) translateX(0); opacity: 0.9; }
  100% { transform: translateY(110%) translateX(12%); opacity: 0.4; }
}
@keyframes yopho-fx-fog {
  0%, 100% { opacity: 0.35; transform: translateX(-4%); }
  50% { opacity: 0.55; transform: translateX(4%); }
}
@keyframes yopho-fx-neon {
  0%, 100% { opacity: 0.35; }
  50% { opacity: 0.7; }
}
@keyframes yopho-fx-smoke {
  0% { transform: translateY(20%) scale(1); opacity: 0.25; }
  50% { transform: translateY(-10%) scale(1.15); opacity: 0.4; }
  100% { transform: translateY(-40%) scale(1.3); opacity: 0.1; }
}
@keyframes yopho-fx-confetti {
  0% { transform: translateY(-10%) rotate(0deg); opacity: 1; }
  100% { transform: translateY(120%) rotate(240deg); opacity: 0.2; }
}
@keyframes yopho-fx-leak {
  0%, 100% { opacity: 0.25; }
  50% { opacity: 0.55; }
}
`;

function RainLayer({ paused }: { paused?: boolean }) {
  const streaks = Array.from({ length: 18 }, (_, i) => i);
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {streaks.map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${(i * 17) % 100}%`,
            top: 0,
            width: 1,
            height: 14 + (i % 5) * 4,
            background: "linear-gradient(transparent, rgba(180,220,255,0.55))",
            animation: paused ? undefined : `yopho-fx-rain ${0.7 + (i % 5) * 0.12}s linear infinite`,
            animationDelay: `${(i % 7) * 0.08}s`,
            opacity: 0.55,
          }}
        />
      ))}
    </div>
  );
}

function SnowLayer({ paused }: { paused?: boolean }) {
  const flakes = Array.from({ length: 22 }, (_, i) => i);
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {flakes.map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${(i * 13 + 5) % 100}%`,
            top: 0,
            width: 3 + (i % 3),
            height: 3 + (i % 3),
            borderRadius: "50%",
            background: "rgba(255,255,255,0.85)",
            boxShadow: "0 0 4px rgba(255,255,255,0.5)",
            animation: paused ? undefined : `yopho-fx-snow ${2.2 + (i % 6) * 0.35}s linear infinite`,
            animationDelay: `${(i % 9) * 0.15}s`,
          }}
        />
      ))}
    </div>
  );
}

function FogLayer({ paused }: { paused?: boolean }) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        background:
          "radial-gradient(ellipse at 50% 90%, rgba(200,210,230,0.35) 0%, transparent 55%), radial-gradient(ellipse at 20% 80%, rgba(180,190,210,0.2) 0%, transparent 40%)",
        animation: paused ? undefined : "yopho-fx-fog 6s ease-in-out infinite",
        mixBlendMode: "screen",
      }}
    />
  );
}

function NeonGlowLayer({ paused }: { paused?: boolean }) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        background:
          "radial-gradient(ellipse at 30% 70%, rgba(0,229,255,0.35) 0%, transparent 45%), radial-gradient(ellipse at 70% 40%, rgba(255,45,170,0.3) 0%, transparent 40%), radial-gradient(ellipse at 50% 20%, rgba(255,215,0,0.15) 0%, transparent 35%)",
        animation: paused ? undefined : "yopho-fx-neon 3.5s ease-in-out infinite",
        mixBlendMode: "screen",
      }}
    />
  );
}

function SmokeLayer({ paused }: { paused?: boolean }) {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            bottom: "-10%",
            left: `${15 + i * 28}%`,
            width: "40%",
            height: "70%",
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(160,170,190,0.35) 0%, transparent 70%)",
            filter: "blur(18px)",
            animation: paused ? undefined : `yopho-fx-smoke ${5 + i}s ease-in-out infinite`,
            animationDelay: `${i * 0.8}s`,
          }}
        />
      ))}
    </div>
  );
}

function ConfettiLayer({ paused }: { paused?: boolean }) {
  const bits = Array.from({ length: 16 }, (_, i) => i);
  const colors = ["#FF2DAA", "#00E5FF", "#FFD700", "#AA2DFF", "#00FF88"];
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {bits.map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${(i * 19) % 100}%`,
            top: 0,
            width: 5,
            height: 8,
            borderRadius: 1,
            background: colors[i % colors.length],
            animation: paused ? undefined : `yopho-fx-confetti ${1.6 + (i % 4) * 0.25}s linear infinite`,
            animationDelay: `${(i % 8) * 0.12}s`,
          }}
        />
      ))}
    </div>
  );
}

function LightLeakLayer({ paused }: { paused?: boolean }) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        background:
          "linear-gradient(125deg, transparent 40%, rgba(255,180,60,0.35) 58%, rgba(255,45,170,0.2) 68%, transparent 82%)",
        mixBlendMode: "screen",
        animation: paused ? undefined : "yopho-fx-leak 4.5s ease-in-out infinite",
      }}
    />
  );
}

export default function YoPhoMagicEffectOverlay({ effects, paused, style }: Props) {
  if (!effects.length) return null;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 8,
        pointerEvents: "none",
        ...style,
      }}
    >
      <style>{KEYFRAMES}</style>
      {effects.includes("fog") ? <FogLayer paused={paused} /> : null}
      {effects.includes("smoke") ? <SmokeLayer paused={paused} /> : null}
      {effects.includes("neon_glow") ? <NeonGlowLayer paused={paused} /> : null}
      {effects.includes("light_leak") ? <LightLeakLayer paused={paused} /> : null}
      {effects.includes("rain") ? <RainLayer paused={paused} /> : null}
      {effects.includes("snow") ? <SnowLayer paused={paused} /> : null}
      {effects.includes("confetti") ? <ConfettiLayer paused={paused} /> : null}
    </div>
  );
}
