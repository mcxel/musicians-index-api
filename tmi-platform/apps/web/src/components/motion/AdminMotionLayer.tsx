"use client";

/**
 * ADMIN MOTION LAYER
 * Wraps admin/operator pages with registered effects.
 * Never blocks clicks — all overlays are pointerEvents:none.
 */

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getAdminPanelMotion } from "@/lib/motion/adminMotionRegistry";
import { prefersReducedMotion } from "@/lib/motion/reducedMotionGuard";
import { TIMING } from "@/lib/motion/timingRegistry";
import GlitchOverlay from "./GlitchOverlay";

interface AdminMotionLayerProps {
  children: React.ReactNode;
  /** Override page key (defaults to pathname) */
  pageKey?: string;
}

function pathToAdminKey(pathname: string): string {
  return pathname.replace(/^\//, "").replace(/\/+$/, "") || "admin";
}

export default function AdminMotionLayer({ children, pageKey }: AdminMotionLayerProps) {
  const pathname = usePathname() ?? "";
  const key = pageKey ?? pathToAdminKey(pathname ?? "admin");
  const rule = getAdminPanelMotion(key);

  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    setReduced(prefersReducedMotion());
  }, []);

  const hasScanlines = !reduced && rule.effects.includes("scanline-overlay");
  const hasGlitch = !reduced && rule.allowGlitch;
  const hasHeartbeat = !reduced && rule.looping.includes("heartbeat");
  const heartbeatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasHeartbeat || !heartbeatRef.current) return;
    const el = heartbeatRef.current;
    let forward = true;
    const id = setInterval(() => {
      el.style.opacity = forward ? "0.18" : "0.04";
      forward = !forward;
    }, TIMING.heartbeat / 2);
    return () => clearInterval(id);
  }, [hasHeartbeat]);

  return (
    <div style={{ position: "relative", minHeight: "inherit" }}>
      {children}

      {/* Heartbeat glow overlay (looping panels) */}
      {hasHeartbeat && (
        <div
          ref={heartbeatRef}
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            userSelect: "none",
            zIndex: 0,
            background:
              "radial-gradient(ellipse at 50% 50%, rgba(0,245,255,0.18) 0%, transparent 70%)",
            opacity: 0.04,
            transition: `opacity ${TIMING.heartbeat / 2}ms ease-in-out`,
          }}
        />
      )}

      {/* Scanline + glitch overlay */}
      {(hasScanlines || hasGlitch) && (
        <GlitchOverlay
          active
          intensity="subtle"
          showScanlines={hasScanlines}
          flicker={hasGlitch}
        />
      )}
    </div>
  );
}
