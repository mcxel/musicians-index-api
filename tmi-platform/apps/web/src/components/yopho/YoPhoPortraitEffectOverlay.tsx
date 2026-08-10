"use client";

import type { CSSProperties } from "react";
import type {
  YoPhoPortraitEffectLayer,
  YoPhoPortraitOverlayEffectId,
} from "@/lib/yopho/YoPhoPortraitEngine";

interface Props {
  layers: YoPhoPortraitEffectLayer[];
  timelineSec?: number;
  durationSec?: number;
  paused?: boolean;
  style?: CSSProperties;
}

const KEYFRAMES = `
@keyframes yopho-portrait-shake {
  0%, 100% { transform: translate(0,0); }
  25% { transform: translate(-3px, 2px); }
  50% { transform: translate(3px, -2px); }
  75% { transform: translate(-2px, -3px); }
}
@keyframes yopho-portrait-neon {
  0%, 100% { opacity: 0.35; }
  50% { opacity: 0.85; }
}
@keyframes yopho-portrait-glitch {
  0%, 92%, 100% { clip-path: inset(0 0 0 0); transform: translate(0); }
  93% { clip-path: inset(12% 0 55% 0); transform: translate(-4px, 0); }
  95% { clip-path: inset(45% 0 8% 0); transform: translate(4px, 0); }
}
@keyframes yopho-portrait-sweep {
  0% { transform: translateX(-120%) skewX(-12deg); opacity: 0; }
  30% { opacity: 0.55; }
  100% { transform: translateX(120%) skewX(-12deg); opacity: 0; }
}
@keyframes yopho-portrait-particle {
  0% { transform: translateY(110%) rotate(0deg); opacity: 0; }
  10% { opacity: 1; }
  100% { transform: translateY(-20%) rotate(280deg); opacity: 0; }
}
`;

function intensityAlpha(intensity: number): number {
  return Math.min(1, Math.max(0.12, intensity / 100));
}

function layerStyle(
  layer: YoPhoPortraitEffectLayer,
  timelineSec: number,
  durationSec: number,
  paused: boolean,
): CSSProperties | null {
  const { effectId, params, enabled } = layer;
  if (!enabled) return null;
  const dur = `${Math.max(0.35, durationSec / Math.max(0.25, params.speed))}s`;
  const t = durationSec > 0 ? timelineSec / durationSec : 0;

  switch (effectId as YoPhoPortraitOverlayEffectId) {
    case "neon_pulse":
      return {
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        background: `radial-gradient(circle at 50% 40%, ${params.color}55 0%, transparent 62%)`,
        mixBlendMode: "screen",
        animation: paused ? undefined : `yopho-portrait-neon ${dur} ease-in-out infinite`,
        opacity: intensityAlpha(params.intensity),
      };
    case "film_burn":
      return {
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        background:
          "linear-gradient(115deg, rgba(255,120,40,0.55) 0%, transparent 38%, transparent 72%, rgba(255,60,20,0.35) 100%)",
        mixBlendMode: "screen",
        opacity: intensityAlpha(params.intensity) * 0.9,
      };
    case "smoke":
      return {
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        background:
          "radial-gradient(ellipse at 30% 90%, rgba(180,190,210,0.35) 0%, transparent 55%), radial-gradient(ellipse at 70% 85%, rgba(140,150,170,0.25) 0%, transparent 50%)",
        opacity: intensityAlpha(params.intensity),
      };
    case "light_sweep":
      return {
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
      };
    case "glitch":
      return {
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        background: `linear-gradient(90deg, transparent, ${params.color}33, transparent)`,
        animation: paused ? undefined : `yopho-portrait-glitch ${dur} steps(1) infinite`,
        opacity: intensityAlpha(params.intensity),
      };
    case "shake":
      return {
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        animation: paused ? undefined : `yopho-portrait-shake ${Math.max(0.2, 0.45 / params.speed)}s linear infinite`,
      };
    case "fade":
      return {
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        background: "rgba(5,5,16,0.35)",
        opacity: 0.15 + intensityAlpha(params.intensity) * (0.35 + 0.25 * Math.sin(t * Math.PI * 2)),
      };
    case "drift":
      return {
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        transform: `translateX(${Math.sin(t * Math.PI * 2) * (params.intensity / 8)}px)`,
      };
    case "zoom":
      return {
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        transform: `scale(${1 + (params.intensity / 500) * (0.5 + 0.5 * Math.sin(t * Math.PI * 2))})`,
        transformOrigin: "center center",
      };
    case "rotate":
      return {
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        transform: `rotate(${Math.sin(t * Math.PI * 2) * (params.intensity / 6)}deg)`,
        transformOrigin: "center center",
      };
    case "particles":
      return { position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" };
    default:
      return null;
  }
}

export default function YoPhoPortraitEffectOverlay({
  layers,
  timelineSec = 0,
  durationSec = 6,
  paused = false,
  style,
}: Props) {
  const active = layers.filter((l) => l.enabled);
  if (active.length === 0) return null;

  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 8, ...style }}>
      <style>{KEYFRAMES}</style>
      {active.map((layer) => {
        const base = layerStyle(layer, timelineSec, durationSec, paused);
        if (!base) return null;
        if (layer.effectId === "light_sweep") {
          const dur = `${Math.max(0.8, durationSec / Math.max(0.25, layer.params.speed))}s`;
          return (
            <div key={layer.effectId} style={base}>
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  width: "42%",
                  background: `linear-gradient(90deg, transparent, ${layer.params.color}66, transparent)`,
                  animation: paused ? undefined : `yopho-portrait-sweep ${dur} ease-in-out infinite`,
                  opacity: intensityAlpha(layer.params.intensity),
                }}
              />
            </div>
          );
        }
        if (layer.effectId === "particles") {
          const count = Math.min(24, 8 + Math.floor(layer.params.intensity / 8));
          const dur = `${Math.max(1.2, durationSec / Math.max(0.25, layer.params.speed))}s`;
          return (
            <div key={layer.effectId} style={base}>
              {Array.from({ length: count }, (_, i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: `${(i * 17 + 5) % 100}%`,
                    bottom: 0,
                    width: 4 + (i % 3),
                    height: 4 + (i % 3),
                    borderRadius: 2,
                    background: i % 2 === 0 ? "#FF2DAA" : "#00FFFF",
                    animation: paused ? undefined : `yopho-portrait-particle ${dur} linear infinite`,
                    animationDelay: `${(i % 7) * 0.12}s`,
                    opacity: intensityAlpha(layer.params.intensity),
                  }}
                />
              ))}
            </div>
          );
        }
        return <div key={layer.effectId} style={base} />;
      })}
    </div>
  );
}
