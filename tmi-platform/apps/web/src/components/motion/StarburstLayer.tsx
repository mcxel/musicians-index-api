"use client";

/**
 * STARBURST LAYER
 * Fires a burst animation to signal genre change or key homepage transitions.
 * Click-safe: pointerEvents:none always.
 */

import { useEffect, useRef, forwardRef } from "react";
import { prefersReducedMotion } from "@/lib/motion/reducedMotionGuard";
import { TIMING } from "@/lib/motion/timingRegistry";

interface StarburstLayerProps {
  trigger: boolean;       // flip true to fire a burst
  color?: string;
  onBurstEnd?: () => void;
}

export default function StarburstLayer({ trigger, color = "#48d8ff", onBurstEnd }: StarburstLayerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prev = useRef(false);

  useEffect(() => {
    if (trigger === prev.current || !ref.current || prefersReducedMotion()) return;
    prev.current = trigger;
    if (!trigger) return;

    const el = ref.current;
    el.style.opacity = "1";
    el.style.transform = "scale(0.2)";
    el.style.transition = "none";

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = `transform ${TIMING.starburstDuration}ms cubic-bezier(0.22,1,0.36,1), opacity ${TIMING.starburstDuration * 0.6}ms ease-out`;
        el.style.transform = "scale(3.5)";
        el.style.opacity = "0";
      });
    });

    const timeout = window.setTimeout(() => {
      el.style.opacity = "0";
      el.style.transform = "scale(0.2)";
      onBurstEnd?.();
    }, TIMING.starburstDuration + 60);

    return () => window.clearTimeout(timeout);
  }, [trigger, onBurstEnd]);

  if (prefersReducedMotion()) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        display: "grid",
        placeItems: "center",
        pointerEvents: "none",
        userSelect: "none",
        zIndex: 4,
        overflow: "hidden",
      }}
    >
      <div
        ref={ref}
        style={{
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${color}44 0%, ${color}00 70%)`,
          boxShadow: `0 0 60px 20px ${color}33`,
          opacity: 0,
          transform: "scale(0.2)",
          willChange: "transform, opacity",
        }}
      />
    </div>
  );
}
