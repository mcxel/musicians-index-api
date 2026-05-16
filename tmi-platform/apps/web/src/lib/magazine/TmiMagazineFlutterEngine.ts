import type { CSSProperties } from "react";

export function getFlutterTransform(progress: number): CSSProperties {
  const clamped = Math.min(1, Math.max(0, progress));
  const rotation = (1 - clamped) * 7;
  const y = (1 - clamped) * 26;
  const scale = 0.96 + clamped * 0.04;
  return {
    transform: `translateY(${y}px) rotate(${rotation}deg) scale(${scale})`,
    filter: `blur(${(1 - clamped) * 1.8}px)`,
  };
}
