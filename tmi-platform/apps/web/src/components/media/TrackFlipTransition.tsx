/**
 * TrackFlipTransition — GPU transform flip/slide when now-playing / queue row changes.
 * Optional neon sweep; respects prefers-reduced-motion.
 */

"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

export interface TrackFlipTransitionProps {
  /** Change this key to trigger the flip (e.g. track id). */
  transitionKey: string;
  children: ReactNode;
  mode?: "flip" | "slide";
  neonSweep?: boolean;
  accent?: string;
  durationMs?: number;
  style?: CSSProperties;
}

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

export default function TrackFlipTransition({
  transitionKey,
  children,
  mode = "flip",
  neonSweep = true,
  accent = "#00FFFF",
  durationMs = 420,
  style,
}: TrackFlipTransitionProps) {
  const reduced = usePrefersReducedMotion();
  const [phase, setPhase] = useState<"idle" | "out" | "in">("idle");
  const [displayKey, setDisplayKey] = useState(transitionKey);
  const [content, setContent] = useState(children);

  useEffect(() => {
    if (transitionKey === displayKey) {
      setContent(children);
      return;
    }
    if (reduced) {
      setDisplayKey(transitionKey);
      setContent(children);
      setPhase("idle");
      return;
    }
    setPhase("out");
    const t1 = window.setTimeout(() => {
      setDisplayKey(transitionKey);
      setContent(children);
      setPhase("in");
    }, durationMs * 0.45);
    const t2 = window.setTimeout(() => setPhase("idle"), durationMs);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
    // children intentionally applied on mid-flip
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transitionKey, children, reduced, durationMs, displayKey]);

  const transform =
    phase === "out"
      ? mode === "flip"
        ? "perspective(800px) rotateY(-72deg) translateX(-8%) scale(0.96)"
        : "translateX(-28%) scale(0.98)"
      : phase === "in"
        ? mode === "flip"
          ? "perspective(800px) rotateY(8deg) translateX(2%) scale(1)"
          : "translateX(6%) scale(1)"
        : "perspective(800px) rotateY(0deg) translateX(0) scale(1)";

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        transformStyle: "preserve-3d",
        ...style,
      }}
    >
      <div
        key={displayKey}
        style={{
          transform,
          opacity: phase === "out" ? 0.35 : 1,
          transition: reduced
            ? "none"
            : `transform ${durationMs}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${durationMs * 0.7}ms ease`,
          willChange: reduced ? undefined : "transform, opacity",
          backfaceVisibility: "hidden",
        }}
      >
        {content}
      </div>
      {neonSweep && !reduced && phase !== "idle" ? (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: `linear-gradient(105deg, transparent 35%, ${accent}55 50%, transparent 65%)`,
            backgroundSize: "200% 100%",
            animation: `tmiTrackSweep ${durationMs}ms ease-out`,
            mixBlendMode: "screen",
          }}
        />
      ) : null}
      <style>{`@keyframes tmiTrackSweep{from{background-position:120% 0}to{background-position:-40% 0}}`}</style>
    </div>
  );
}
