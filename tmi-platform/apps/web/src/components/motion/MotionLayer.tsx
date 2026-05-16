"use client";

/**
 * MOTION LAYER
 * Global page-level motion wrapper.
 * Wraps page content with registered effects for the current route.
 * All animated children are click-safe (pointerEvents:none on overlays).
 */

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import GlitchOverlay from "./GlitchOverlay";
import { getMotionRule } from "@/lib/motion/motionRegistry";
import { prefersReducedMotion } from "@/lib/motion/reducedMotionGuard";

interface MotionLayerProps {
  children: React.ReactNode;
}

function pathToKey(pathname: string): string {
  return pathname.replace(/^\//, "").replace(/\/+$/, "") || "default";
}

export default function MotionLayer({ children }: MotionLayerProps) {
  const pathname = usePathname() ?? "";
  const key = pathToKey(pathname ?? "");
  const rule = getMotionRule(key);

  // Defer reduced-motion check to client to avoid SSR/hydration mismatch.
  // Server always renders false (no overlay); client corrects after mount.
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    setReduced(prefersReducedMotion());
  }, []);

  const showGlitch =
    !reduced &&
    rule.glitchAllowed &&
    rule.families.includes("glitch-overlay");

  const showScanlines =
    !reduced &&
    rule.families.includes("scanlines");

  const intensity = rule.heavy ? "medium" : "subtle";

  return (
    <div style={{ position: "relative", minHeight: "inherit" }}>
      {children}
      {(showGlitch || showScanlines) && (
        <GlitchOverlay
          active
          intensity={intensity}
          showScanlines={showScanlines}
          flicker={showGlitch}
        />
      )}
    </div>
  );
}
