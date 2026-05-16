"use client";

/**
 * GLITCH OVERLAY
 * Renders scanlines + RGB shift effects as a click-safe overlay.
 * Mount inside any container with position:relative.
 * All layers are pointerEvents:none — clicks pass through.
 */

import { useEffect, useRef, useState } from "react";
import { scanlineOverlay } from "@/lib/motion/glitchEngine";
import { randomFlicker } from "@/lib/motion/glitchEngine";
import { prefersReducedMotion } from "@/lib/motion/reducedMotionGuard";
import { SCANLINE_LAYER, GLITCH_LAYER } from "@/lib/motion/clickSafeAnimationGuard";

interface GlitchOverlayProps {
  active?: boolean;
  intensity?: "subtle" | "medium" | "heavy";
  showScanlines?: boolean;
  flicker?: boolean;
  /** CSS class added to outermost wrapper, e.g. for stacking context */
  className?: string;
}

export default function GlitchOverlay({
  active = true,
  intensity = "subtle",
  showScanlines = true,
  flicker = true,
  className,
}: GlitchOverlayProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setMounted(true);
    setReduced(prefersReducedMotion());
  }, []);

  useEffect(() => {
    if (!active || !flicker || reduced) return;
    const cleanup = randomFlicker(ref.current, 4000, 9000);
    return cleanup;
  }, [active, flicker, reduced]);

  // Never render on server — eliminates all possible SSR/client mismatches
  if (!mounted || !active || reduced) return null;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        userSelect: "none",
        zIndex: 1,
        overflow: "hidden",
      }}
    >
      {/* Scanline layer */}
      {showScanlines && (
        <div
          style={{
            ...SCANLINE_LAYER,
            ...scanlineOverlay(),
            opacity: intensity === "heavy" ? 0.07 : intensity === "medium" ? 0.045 : 0.025,
          }}
        />
      )}

      {/* RGB shift vignette */}
      <div
        style={{
          ...GLITCH_LAYER,
          opacity: intensity === "heavy" ? 0.12 : intensity === "medium" ? 0.07 : 0.035,
          background:
            "radial-gradient(ellipse at 20% 50%, rgba(0,255,255,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, rgba(255,0,128,0.06) 0%, transparent 60%)",
        }}
      />

      {/* Noise texture overlay */}
      {intensity !== "subtle" && (
        <div
          style={{
            ...GLITCH_LAYER,
            opacity: 0.03,
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            backgroundSize: "180px 180px",
          }}
        />
      )}
    </div>
  );
}
