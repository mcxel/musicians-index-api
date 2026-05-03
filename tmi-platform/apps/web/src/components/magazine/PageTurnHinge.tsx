"use client";

import { useEffect, useRef, useState } from "react";
import type { TmiFlipDirection, TmiPeelOrigin } from "@/lib/magazine/tmiMagazinePageFlipEngine";

// ─── Types ────────────────────────────────────────────────────────────────────

type HingeAxis = "vertical" | "horizontal";

type Props = {
  active: boolean;
  direction: TmiFlipDirection;
  peelOrigin?: TmiPeelOrigin;
  reducedMotion?: boolean;
  axis?: HingeAxis;
  thickness?: number;   // spine width in px
};

// ─── Derive hinge axis from peel origin ───────────────────────────────────────

function deriveAxis(peelOrigin: TmiPeelOrigin, _direction: TmiFlipDirection): HingeAxis {
  if (peelOrigin === "top-edge" || peelOrigin === "bottom-edge") return "horizontal";
  return "vertical";
}

function derivePerspectiveOrigin(peelOrigin: TmiPeelOrigin): string {
  switch (peelOrigin) {
    case "right-edge":
    case "top-right":
    case "bottom-right": return "left center";
    case "left-edge":
    case "top-left":
    case "bottom-left":  return "right center";
    case "top-edge":     return "center bottom";
    case "bottom-edge":  return "center top";
    default:             return "left center";
  }
}

function deriveRotateSign(direction: TmiFlipDirection, peelOrigin: TmiPeelOrigin): number {
  if (direction === "forward") {
    return peelOrigin.includes("right") || peelOrigin === "right-edge" ? -1 : 1;
  }
  return peelOrigin.includes("left") || peelOrigin === "left-edge" ? 1 : -1;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PageTurnHinge({
  active,
  direction,
  peelOrigin = "right-edge",
  reducedMotion = false,
  axis,
  thickness = 8,
}: Props) {
  const [phase, setPhase] = useState<"idle" | "opening" | "peak" | "closing">("idle");

  // Queue holds every scheduled timer — all cleared together, no orphans.
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  function drainTimers() {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }

  // Phase-change effect: drain previous queue before scheduling new chain.
  useEffect(() => {
    drainTimers();

    if (!active || reducedMotion) {
      setPhase("idle");
      return drainTimers;
    }

    setPhase("opening");
    timersRef.current.push(setTimeout(() => setPhase("peak"),    140));
    timersRef.current.push(setTimeout(() => setPhase("closing"), 280));
    timersRef.current.push(setTimeout(() => setPhase("idle"),    420));

    return drainTimers;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, reducedMotion]);

  // Explicit unmount cleanup — drain any timers that survived a mid-chain unmount.
  useEffect(() => drainTimers, []);

  if (phase === "idle" || reducedMotion) return null;

  const resolvedAxis = axis ?? deriveAxis(peelOrigin, direction);
  const perspectiveOrigin = derivePerspectiveOrigin(peelOrigin);
  const rotateSign = deriveRotateSign(direction, peelOrigin);

  const rotateAngle =
    phase === "opening" ? rotateSign * 12 :
    phase === "peak"    ? rotateSign * 22 :
    phase === "closing" ? rotateSign * 6  : 0;

  const foldDepth =
    phase === "opening" ? 10 :
    phase === "peak" ? 18 :
    phase === "closing" ? 8 : 0;

  const spineFlex =
    phase === "opening" ? 0.78 :
    phase === "peak" ? 1 :
    phase === "closing" ? 0.7 : 0.6;

  const rotateAxis = resolvedAxis === "vertical"
    ? `rotateY(${rotateAngle}deg)`
    : `rotateX(${rotateAngle}deg)`;

  // Spine flex: depth thickens at peak for physical hinge continuity, tapers on close.
  const spineWidth = phase === "peak" ? thickness * 1.5 : thickness;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 30,
        perspective: "900px",
        perspectiveOrigin,
      }}
    >
      {/* Spine shadow — hinge crease, flexes with phase depth */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          ...(resolvedAxis === "vertical"
            ? {
                left: perspectiveOrigin.startsWith("left") ? 0 : "auto",
                right: perspectiveOrigin.startsWith("right") ? 0 : "auto",
                width: spineWidth,
              }
            : {
                left: 0,
                right: 0,
                top: perspectiveOrigin.startsWith("center top") ? 0 : "auto",
                bottom: perspectiveOrigin.startsWith("center bottom") ? 0 : "auto",
                height: spineWidth,
                width: "100%",
              }),
          background: `linear-gradient(${resolvedAxis === "vertical" ? "90deg" : "180deg"},
            rgba(0,0,0,0.55),
            rgba(0,245,255,0.06),
            transparent)`,
          borderRadius: 2,
          transition: "opacity 0.15s ease, width 0.12s ease, height 0.12s ease",
          opacity: phase === "peak" ? 1 : 0.6,
          transform: resolvedAxis === "vertical" ? `scaleX(${spineFlex})` : `scaleY(${spineFlex})`,
        }}
      />

      {/* Page fold plane */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformStyle: "preserve-3d",
          transform: `${rotateAxis} translateZ(${foldDepth}px)`,
          transition: "transform 120ms cubic-bezier(0.4,0,0.2,1)",
          transformOrigin: perspectiveOrigin,
          background: `linear-gradient(
            ${resolvedAxis === "vertical" ? (rotateSign > 0 ? "90deg" : "270deg") : (rotateSign > 0 ? "0deg" : "180deg")},
            rgba(0,245,255,0.04) 0%,
            rgba(167,139,250,0.04) 50%,
            transparent 100%
          )`,
          borderRadius: 12,
          pointerEvents: "none",
        }}
      />

      {/* Crease highlight — tracks spine outer edge */}
      <div
        style={{
          position: "absolute",
          ...(resolvedAxis === "vertical"
            ? {
                top: "10%",
                bottom: "10%",
                left: perspectiveOrigin.startsWith("left") ? spineWidth : "auto",
                right: perspectiveOrigin.startsWith("right") ? spineWidth : "auto",
                width: 1,
              }
            : {
                left: "10%",
                right: "10%",
                top: perspectiveOrigin.startsWith("center top") ? spineWidth : "auto",
                bottom: perspectiveOrigin.startsWith("center bottom") ? spineWidth : "auto",
                height: 1,
              }),
          background: "rgba(0,245,255,0.22)",
          opacity: phase === "peak" ? 1 : 0,
          transition: "opacity 0.1s ease",
        }}
      />
    </div>
  );
}
