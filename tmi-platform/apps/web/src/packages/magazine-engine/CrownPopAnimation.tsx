"use client";

/**
 * CrownPopAnimation
 *
 * Crown animates over the #1 artist's head:
 *   1. Pop in (scale 0 → 1.2 → 1)
 *   2. Bounce / funny hover
 *   3. Shine / sparkle burst
 *   4. Hold 1s
 *   5. Fade out
 *
 * Auto-triggers when `active` changes true→false or on `key` prop change.
 * pointer-events: none — purely decorative.
 */

import { useEffect, useRef, useState } from "react";

type CrownPhase = "hidden" | "popping" | "hovering" | "shining" | "fading";

export type CrownPopAnimationProps = {
  /** Whether to show/trigger the crown animation */
  active: boolean;
  artistName?: string;
  /** px size of the crown emoji/graphic */
  size?: number;
  "data-testid"?: string;
};

export default function CrownPopAnimation({
  active,
  artistName,
  size = 48,
  "data-testid": testId,
}: CrownPopAnimationProps) {
  const [phase, setPhase] = useState<CrownPhase>("hidden");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearTimer() {
    if (timerRef.current) clearTimeout(timerRef.current);
  }

  useEffect(() => {
    if (!active) {
      setPhase("hidden");
      return;
    }

    // Phase sequence
    setPhase("popping");

    clearTimer();
    // Pop in → hovering after 500ms
    timerRef.current = setTimeout(() => {
      setPhase("hovering");
      // Hovering → shining after 800ms
      timerRef.current = setTimeout(() => {
        setPhase("shining");
        // Shining → fading after 1200ms
        timerRef.current = setTimeout(() => {
          setPhase("fading");
          // Fully hidden after fade
          timerRef.current = setTimeout(() => {
            setPhase("hidden");
          }, 600);
        }, 1200);
      }, 800);
    }, 500);

    return () => clearTimer();
  }, [active]);

  if (phase === "hidden") return null;

  const transform = {
    hidden: "scale(0) translateY(20px)",
    popping: "scale(1.25) translateY(-8px)",
    hovering: "scale(1.08) translateY(-4px)",
    shining: "scale(1.15) translateY(-10px)",
    fading: "scale(0.7) translateY(-4px)",
  }[phase];

  const opacity = {
    hidden: 0,
    popping: 1,
    hovering: 1,
    shining: 1,
    fading: 0,
  }[phase];

  const filter = phase === "shining"
    ? "drop-shadow(0 0 12px #FFD700) drop-shadow(0 0 24px #FFD700) brightness(1.3)"
    : phase === "hovering"
    ? "drop-shadow(0 0 6px #FFD700)"
    : "none";

  return (
    <div
      aria-label={artistName ? `${artistName} is #1 this week` : "Crown #1"}
      className="crown-pop pointer-events-none absolute"
      style={{
        top: "-18%",
        left: "50%",
        transform: `translateX(-50%) ${transform}`,
        opacity,
        transition:
          phase === "fading"
            ? "all 0.6s ease-in"
            : phase === "popping"
            ? "all 0.45s cubic-bezier(0.34,1.56,0.64,1)"
            : "all 0.3s ease",
        zIndex: 30,
        filter,
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size,
        userSelect: "none",
      }}
      data-testid={testId ?? "crown-pop-animation"}
      data-phase={phase}
    >
      👑
      {/* Sparkle burst on shining phase */}
      {phase === "shining" && (
        <span
          aria-hidden
          className="crown-pop__sparkle"
          style={{
            position: "absolute",
            inset: "-50%",
            background:
              "radial-gradient(circle, rgba(255,215,0,0.6) 0%, rgba(255,215,0,0) 70%)",
            borderRadius: "50%",
            animation: "crownSparkle 0.6s ease-out forwards",
          }}
        />
      )}
    </div>
  );
}
