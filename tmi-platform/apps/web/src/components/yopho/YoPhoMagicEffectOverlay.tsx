"use client";

/**
 * Canonical YoPho visual overlay — rain, smoke, fog, glow, particles, lighting.
 * One renderer for editor preview, public card, and export capture (§6260/§6263).
 * Effects stay inside the artwork frame: overflow hidden, pointer-events none.
 */

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import type { YoPhoMagicEffectId } from "@/lib/yopho/YoPhoMagicEffects";
import {
  defaultEffectParams,
  lightingWashCss,
  type YoPhoEffectParams,
  type YoPhoLightingState,
  type YoPhoResolvedEffect,
  type YoPhoResolvedVisual,
} from "@/lib/yopho/YoPhoVisualRuntime";

interface Props {
  effects?: YoPhoMagicEffectId[];
  resolved?: YoPhoResolvedVisual | null;
  lighting?: YoPhoLightingState;
  /** When true, pause particle motion (pause-react / static preview) */
  paused?: boolean;
  /** Split stack so rain sits above the subject and smoke sits behind it. */
  slot?: "underlay" | "foreground" | "all";
  style?: CSSProperties;
}

const KEYFRAMES = `
@keyframes yopho-fx-rain {
  0% { transform: translate3d(var(--fx-dx-start), -12%, 0); }
  100% { transform: translate3d(var(--fx-dx-end), 118%, 0); }
}
@keyframes yopho-fx-snow {
  0% { transform: translate3d(0, -8%, 0); opacity: 0.9; }
  100% { transform: translate3d(12%, 110%, 0); opacity: 0.35; }
}
@keyframes yopho-fx-fog {
  0%, 100% { opacity: var(--fx-op-lo); transform: translateX(-6%); }
  50% { opacity: var(--fx-op-hi); transform: translateX(6%); }
}
@keyframes yopho-fx-neon {
  0%, 100% { opacity: var(--fx-op-lo); }
  50% { opacity: var(--fx-op-hi); }
}
@keyframes yopho-fx-smoke {
  0% { transform: translate3d(var(--fx-sx), 18%, 0) scale(0.92); opacity: 0.12; }
  45% { transform: translate3d(calc(var(--fx-sx) * -1), -8%, 0) scale(1.18); opacity: var(--fx-op-hi); }
  100% { transform: translate3d(var(--fx-sx), -48%, 0) scale(1.38); opacity: 0.04; }
}
@keyframes yopho-fx-confetti {
  0% { transform: translateY(-10%) rotate(0deg); opacity: 1; }
  100% { transform: translateY(120%) rotate(240deg); opacity: 0.15; }
}
@keyframes yopho-fx-leak {
  0%, 100% { opacity: var(--fx-op-lo); }
  50% { opacity: var(--fx-op-hi); }
}
@keyframes yopho-fx-spark {
  0% { transform: translate3d(0, 8%, 0) scale(0.6); opacity: 0; }
  18% { opacity: 1; }
  100% { transform: translate3d(var(--fx-dx-end), -30%, 0) scale(1.1); opacity: 0; }
}
`;

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);
  return reduced;
}

function paramsFor(
  resolved: YoPhoResolvedVisual | null | undefined,
  id: YoPhoMagicEffectId,
  fallbackIds: YoPhoMagicEffectId[],
): YoPhoEffectParams | null {
  const hit = resolved?.effects.find((e) => e.id === id);
  if (hit) return hit.params;
  if (fallbackIds.includes(id)) return defaultEffectParams(id);
  return null;
}

function driftFor(direction: YoPhoEffectParams["direction"], intensity: number): { start: string; end: string } {
  const mag = 4 + intensity * 0.12;
  switch (direction) {
    case "left":
      return { start: "0%", end: `${-mag}%` };
    case "right":
      return { start: "0%", end: `${mag}%` };
    case "up":
      return { start: "0%", end: "0%" };
    default:
      return { start: "0%", end: `${-mag * 0.45}%` };
  }
}

function RainLayer({ params, paused }: { params: YoPhoEffectParams; paused: boolean }) {
  const count = Math.max(8, Math.round((params.density / 100) * 36));
  const streaks = Array.from({ length: count }, (_, i) => i);
  const drift = driftFor(params.direction, params.intensity);
  const durationBase = 0.85 / params.speed;
  return (
    <div
      aria-hidden
      data-yopho-fx="rain"
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        ["--fx-dx-start" as string]: drift.start,
        ["--fx-dx-end" as string]: drift.end,
      }}
    >
      {streaks.map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${(i * 19 + (i % 7) * 3) % 100}%`,
            top: "-8%",
            width: 1 + (i % 3 === 0 ? 1 : 0),
            height: 16 + (i % 6) * 5,
            background: `linear-gradient(transparent, ${params.color})`,
            opacity: params.opacity * (0.35 + (params.intensity / 100) * 0.65),
            transform: `rotate(${params.direction === "left" ? 18 : params.direction === "right" ? -18 : 12}deg)`,
            animation: paused ? undefined : `yopho-fx-rain ${durationBase + (i % 5) * 0.1}s linear infinite`,
            animationDelay: `${(i % 9) * 0.07}s`,
          }}
        />
      ))}
    </div>
  );
}

function SnowLayer({ params, paused }: { params: YoPhoEffectParams; paused: boolean }) {
  const count = Math.max(8, Math.round((params.density / 100) * 28));
  return (
    <div aria-hidden data-yopho-fx="snow" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${(i * 13 + 5) % 100}%`,
            top: 0,
            width: 2 + (i % 3),
            height: 2 + (i % 3),
            borderRadius: "50%",
            background: params.color,
            boxShadow: `0 0 4px ${params.color}`,
            opacity: params.opacity,
            animation: paused ? undefined : `yopho-fx-snow ${2.4 / params.speed + (i % 6) * 0.3}s linear infinite`,
            animationDelay: `${(i % 9) * 0.14}s`,
          }}
        />
      ))}
    </div>
  );
}

function FogLayer({ params, paused }: { params: YoPhoEffectParams; paused: boolean }) {
  return (
    <div
      aria-hidden
      data-yopho-fx="fog"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        ["--fx-op-lo" as string]: String(params.opacity * 0.45),
        ["--fx-op-hi" as string]: String(params.opacity * (0.55 + params.intensity / 200)),
        background: `radial-gradient(ellipse at 50% 92%, ${params.color}66 0%, transparent 55%), radial-gradient(ellipse at 18% 80%, ${params.color}44 0%, transparent 42%)`,
        animation: paused ? undefined : `yopho-fx-fog ${7 / params.speed}s ease-in-out infinite`,
        mixBlendMode: "screen",
      }}
    />
  );
}

function NeonGlowLayer({ params, paused }: { params: YoPhoEffectParams; paused: boolean }) {
  return (
    <div
      aria-hidden
      data-yopho-fx="neon_glow"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        ["--fx-op-lo" as string]: String(params.opacity * 0.4),
        ["--fx-op-hi" as string]: String(params.opacity * (0.55 + params.intensity / 180)),
        background: `radial-gradient(ellipse at 30% 70%, ${params.color}66 0%, transparent 45%), radial-gradient(ellipse at 72% 38%, rgba(255,45,170,0.32) 0%, transparent 40%), radial-gradient(ellipse at 50% 16%, rgba(255,215,0,0.16) 0%, transparent 35%)`,
        animation: paused ? undefined : `yopho-fx-neon ${3.6 / params.speed}s ease-in-out infinite`,
        mixBlendMode: "screen",
      }}
    />
  );
}

function SmokeLayer({ params, paused }: { params: YoPhoEffectParams; paused: boolean }) {
  const columns = Math.max(2, Math.round((params.density / 100) * 5));
  return (
    <div
      aria-hidden
      data-yopho-fx="smoke"
      style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}
    >
      {Array.from({ length: columns }, (_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            bottom: "-12%",
            left: `${8 + i * (72 / columns)}%`,
            width: `${28 + (i % 2) * 10}%`,
            height: `${58 + params.intensity * 0.28}%`,
            borderRadius: "50%",
            background: `radial-gradient(ellipse, ${params.color}77 0%, transparent 70%)`,
            filter: "blur(16px)",
            ["--fx-sx" as string]: `${i % 2 === 0 ? 6 : -5}%`,
            ["--fx-op-hi" as string]: String(params.opacity * (0.35 + params.intensity / 220)),
            animation: paused ? undefined : `yopho-fx-smoke ${5.2 / params.speed + i * 0.55}s ease-in-out infinite`,
            animationDelay: `${i * 0.7}s`,
          }}
        />
      ))}
    </div>
  );
}

function ConfettiLayer({ params, paused }: { params: YoPhoEffectParams; paused: boolean }) {
  const bits = Math.max(8, Math.round((params.density / 100) * 20));
  const colors = [params.color, "#00E5FF", "#FFD700", "#AA2DFF", "#00FF88"];
  return (
    <div aria-hidden data-yopho-fx="confetti" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {Array.from({ length: bits }, (_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${(i * 19) % 100}%`,
            top: 0,
            width: 4,
            height: 7,
            borderRadius: 1,
            background: colors[i % colors.length],
            opacity: params.opacity,
            animation: paused ? undefined : `yopho-fx-confetti ${1.7 / params.speed + (i % 4) * 0.2}s linear infinite`,
            animationDelay: `${(i % 8) * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
}

function LightLeakLayer({ params, paused }: { params: YoPhoEffectParams; paused: boolean }) {
  return (
    <div
      aria-hidden
      data-yopho-fx="light_leak"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        ["--fx-op-lo" as string]: String(params.opacity * 0.35),
        ["--fx-op-hi" as string]: String(params.opacity * (0.5 + params.intensity / 200)),
        background: `linear-gradient(125deg, transparent 40%, ${params.color}66 58%, rgba(255,45,170,0.22) 68%, transparent 82%)`,
        mixBlendMode: "screen",
        animation: paused ? undefined : `yopho-fx-leak ${4.8 / params.speed}s ease-in-out infinite`,
      }}
    />
  );
}

function ParticlesLayer({ params, paused }: { params: YoPhoEffectParams; paused: boolean }) {
  const count = Math.max(8, Math.round((params.density / 100) * 26));
  const drift = driftFor(params.direction === "down" ? "up" : params.direction, params.intensity);
  return (
    <div
      aria-hidden
      data-yopho-fx="particles"
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        ["--fx-dx-end" as string]: drift.end,
      }}
    >
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${(i * 17 + 4) % 100}%`,
            bottom: `${(i * 9) % 30}%`,
            width: 2 + (i % 3),
            height: 2 + (i % 3),
            borderRadius: "50%",
            background: i % 2 === 0 ? params.color : "#FF2DAA",
            boxShadow: `0 0 6px ${params.color}`,
            opacity: params.opacity,
            animation: paused ? undefined : `yopho-fx-spark ${2.1 / params.speed + (i % 5) * 0.18}s linear infinite`,
            animationDelay: `${(i % 8) * 0.11}s`,
          }}
        />
      ))}
    </div>
  );
}

function LightingWash({ lighting }: { lighting: YoPhoLightingState }) {
  return (
    <div
      aria-hidden
      data-yopho-fx="lighting"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        background: lightingWashCss(lighting),
        mixBlendMode: "screen",
      }}
    />
  );
}

export default function YoPhoMagicEffectOverlay({
  effects = [],
  resolved,
  lighting,
  paused,
  slot = "all",
  style,
}: Props) {
  const reduced = usePrefersReducedMotion();
  const motionPaused = Boolean(paused || reduced || resolved?.paused);
  const activeIds = useMemo(() => {
    if (resolved) return resolved.effects.map((e: YoPhoResolvedEffect) => e.id);
    return effects;
  }, [resolved, effects]);
  const light = lighting ?? resolved?.lighting ?? null;

  const showUnder = slot === "all" || slot === "underlay";
  const showFore = slot === "all" || slot === "foreground";
  if (!activeIds.length && !(light && showUnder)) return null;

  return (
    <div
      data-testid="yopho-visual-overlay"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 8,
        overflow: "hidden",
        pointerEvents: "none",
        filter: resolved?.cssFilter,
        ...style,
      }}
    >
      <style>{KEYFRAMES}</style>
      {showUnder && light ? <LightingWash lighting={light} /> : null}
      {showUnder && paramsFor(resolved, "fog", activeIds) ? (
        <FogLayer params={paramsFor(resolved, "fog", activeIds)!} paused={motionPaused} />
      ) : null}
      {showUnder && paramsFor(resolved, "smoke", activeIds) ? (
        <SmokeLayer params={paramsFor(resolved, "smoke", activeIds)!} paused={motionPaused} />
      ) : null}
      {showUnder && paramsFor(resolved, "neon_glow", activeIds) ? (
        <NeonGlowLayer params={paramsFor(resolved, "neon_glow", activeIds)!} paused={motionPaused} />
      ) : null}
      {showUnder && paramsFor(resolved, "light_leak", activeIds) ? (
        <LightLeakLayer params={paramsFor(resolved, "light_leak", activeIds)!} paused={motionPaused} />
      ) : null}
      {showFore && paramsFor(resolved, "rain", activeIds) ? (
        <RainLayer params={paramsFor(resolved, "rain", activeIds)!} paused={motionPaused} />
      ) : null}
      {showFore && paramsFor(resolved, "snow", activeIds) ? (
        <SnowLayer params={paramsFor(resolved, "snow", activeIds)!} paused={motionPaused} />
      ) : null}
      {showFore && paramsFor(resolved, "confetti", activeIds) ? (
        <ConfettiLayer params={paramsFor(resolved, "confetti", activeIds)!} paused={motionPaused} />
      ) : null}
      {showFore && paramsFor(resolved, "particles", activeIds) ? (
        <ParticlesLayer params={paramsFor(resolved, "particles", activeIds)!} paused={motionPaused} />
      ) : null}
    </div>
  );
}
