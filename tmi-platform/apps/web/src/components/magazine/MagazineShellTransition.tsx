"use client";

// ─── MAGAZINE SHELL TRANSITION ───────────────────────────────────────────────
// Wraps a page surface (cover or spread) and applies enter/exit animations
// driven by MagShellState. Used in /home/1 and /home/1-2.
//
// Usage:
//   <MagazineShellTransition state="MAG_CLOSED" direction="enter">
//     <HomePageCoverArtifact />
//   </MagazineShellTransition>
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { MagShellState } from "@/lib/magazine/MagazineShellState";
import {
  deriveSpineFlexState,
  getSpineShadow,
  getPageBowGradient,
  SPINE_BREATH_CYCLE,
} from "@/lib/magazine/MagazineSpineEngine";

// ─── PROPS ───────────────────────────────────────────────────────────────────

interface MagazineShellTransitionProps {
  /** Current canonical shell state */
  state: MagShellState;
  /** Whether this surface is the active render target */
  active?: boolean;
  children: ReactNode;
  className?: string;
}

// ─── INTERNAL ANIMATION STATE ────────────────────────────────────────────────

type AnimPhase = "pre" | "enter" | "settled" | "exit";

const ENTER_DURATION_MS = 360;
const EXIT_DURATION_MS  = 260;

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function MagazineShellTransition({
  state,
  active = true,
  children,
  className = "",
}: MagazineShellTransitionProps) {
  const [animPhase, setAnimPhase] = useState<AnimPhase>("pre");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [breathStep, setBreathStep] = useState(0);
  const breathRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const spine = deriveSpineFlexState(state);

  // ── Enter animation on mount / active toggle ──────────────────────────────
  useEffect(() => {
    if (!active) {
      setAnimPhase("exit");
      timerRef.current = setTimeout(() => setAnimPhase("pre"), EXIT_DURATION_MS);
      return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }
    setAnimPhase("pre");
    const raf = requestAnimationFrame(() => {
      setAnimPhase("enter");
      timerRef.current = setTimeout(() => setAnimPhase("settled"), ENTER_DURATION_MS);
    });
    return () => {
      cancelAnimationFrame(raf);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [active]);

  // ── Breathing ticker for MAG_CLOSED idle animation ───────────────────────
  useEffect(() => {
    if (state !== "MAG_CLOSED" || !active) {
      if (breathRef.current) clearInterval(breathRef.current);
      setBreathStep(0);
      return;
    }
    breathRef.current = setInterval(() => {
      setBreathStep((s) => (s + 1) % SPINE_BREATH_CYCLE.phases.length);
    }, SPINE_BREATH_CYCLE.durationMs / SPINE_BREATH_CYCLE.phases.length);
    return () => { if (breathRef.current) clearInterval(breathRef.current); };
  }, [state, active]);

  // ── Derive breath scale ───────────────────────────────────────────────────
  const [scaleMin, scaleMax] = SPINE_BREATH_CYCLE.scaleRange;
  const breathProgress = breathStep / Math.max(1, SPINE_BREATH_CYCLE.phases.length - 1);
  const breathScale =
    state === "MAG_CLOSED" && animPhase === "settled"
      ? scaleMin + (scaleMax - scaleMin) * Math.sin(breathProgress * Math.PI)
      : 1;

  // ── CSS transforms ────────────────────────────────────────────────────────
  const translateY =
    animPhase === "pre" ? 12 :
    animPhase === "exit" ? 8 :
    0;

  const opacity =
    animPhase === "pre" ? 0 :
    animPhase === "exit" ? 0 :
    1;

  const scale =
    animPhase === "pre" ? 0.97 :
    animPhase === "exit" ? 0.98 :
    breathScale;

  const transition =
    animPhase === "pre" ? "none" :
    animPhase === "enter" ? `transform ${ENTER_DURATION_MS}ms ${spine.easing}, opacity ${ENTER_DURATION_MS}ms ease` :
    animPhase === "exit" ? `transform ${EXIT_DURATION_MS}ms ease-in, opacity ${EXIT_DURATION_MS}ms ease-in` :
    state === "MAG_CLOSED" ? `transform ${SPINE_BREATH_CYCLE.durationMs / SPINE_BREATH_CYCLE.phases.length}ms ease-in-out` :
    "none";

  // ── Glow halo based on spine glow intensity ───────────────────────────────
  const glowAlpha = (spine.glowIntensity * 0.12).toFixed(3);
  const haloColor = state === "MAG_OPEN" || state === "MAG_TURNING"
    ? `rgba(255,45,170,${glowAlpha})`
    : `rgba(0,255,255,${glowAlpha})`;

  return (
    <div
      className={className}
      style={{
        position: "relative",
        transform: `translateY(${translateY}px) scale(${scale.toFixed(4)})`,
        opacity,
        transition,
        willChange: "transform, opacity",
        // Page surface shadow with spine depth
        filter: animPhase === "settled"
          ? `drop-shadow(0 0 ${Math.round(spine.glowIntensity * 24)}px ${haloColor})`
          : undefined,
      }}
    >
      {/* Page bow — convex surface texture */}
      {(state === "MAG_OPEN" || state === "MAG_TURNING") && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: getPageBowGradient(spine.crease),
            pointerEvents: "none",
            zIndex: 1,
            borderRadius: "inherit",
          }}
        />
      )}

      {children}
    </div>
  );
}

// ─── PAGE CORNER CURL ────────────────────────────────────────────────────────
// Standalone micro-component: animated corner lift on the active spread page.

interface PageCornerCurlProps {
  corner: "bottom-left" | "bottom-right";
  active?: boolean;
}

export function PageCornerCurl({ corner, active = false }: PageCornerCurlProps) {
  const isLeft = corner === "bottom-left";
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        bottom: 0,
        [isLeft ? "left" : "right"]: 0,
        width: 44,
        height: 44,
        background: isLeft
          ? "radial-gradient(ellipse at 0% 100%, rgba(0,0,0,0.48), transparent 78%)"
          : "radial-gradient(ellipse at 100% 100%, rgba(0,0,0,0.48), transparent 78%)",
        opacity: active ? 1 : 0.4,
        transition: "opacity 400ms ease",
        pointerEvents: "none",
        zIndex: 10,
      }}
    />
  );
}

// ─── SPINE GLOW BAR ──────────────────────────────────────────────────────────
// Renders the spine vertical glow line. Placed at the fold edge.

interface SpineGlowBarProps {
  state: MagShellState;
  heightPx?: number | string;
}

export function SpineGlowBar({ state, heightPx = "100%" }: SpineGlowBarProps) {
  const spine = deriveSpineFlexState(state);
  return (
    <div
      aria-hidden="true"
      style={{
        width: 2,
        height: heightPx,
        background: spine.spineGradient,
        opacity: spine.glowIntensity * 0.7,
        boxShadow: getSpineShadow(spine.openness),
        pointerEvents: "none",
        transition: `opacity ${spine.transitionMs}ms ${spine.easing}, box-shadow ${spine.transitionMs}ms ${spine.easing}`,
      }}
    />
  );
}
