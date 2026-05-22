"use client";

import type { MagazineRuntimePhase } from "@/engines/magazine/MagazineRuntimeEngine";

/**
 * FeatherRuffleOverlay
 *
 * A pure CSS overlay that fires during the "flipping" phase of the magazine
 * runtime. Gives the page-turn a physical feel: left-edge curl shadow,
 * a paper-glint light sweep, and a micro-opacity flicker.
 *
 * Renders nothing outside of the flipping phase — zero cost at rest.
 */
export default function FeatherRuffleOverlay({ phase }: { phase: MagazineRuntimePhase }) {
  if (phase !== "flipping") return null;

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        pointerEvents: "none",
        animation: "fro-base 720ms ease forwards",
      }}
    >
      {/* Page-turn curl shadow on the left edge */}
      <div
        style={{
          position: "absolute",
          left: 0, top: 0, bottom: 0,
          width: "18%",
          background: "linear-gradient(90deg, rgba(0,0,0,0.28) 0%, transparent 100%)",
          animation: "fro-curl 720ms ease forwards",
        }}
      />

      {/* Paper glint — light streak sweeping left → right like reflected light */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(108deg, transparent 0%, rgba(255,255,255,0.045) 48%, transparent 56%, transparent 100%)",
          animation: "fro-glint 620ms cubic-bezier(0.4,0,0.6,1) forwards",
        }}
      />

      {/* Micro opacity flicker — simulates paper catching then releasing light */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(255,255,255,0.015)",
          animation: "fro-flicker 720ms ease forwards",
        }}
      />

      <style>{`
        @keyframes fro-base {
          0%   { opacity: 0; }
          8%   { opacity: 1; }
          80%  { opacity: 0.7; }
          100% { opacity: 0; }
        }
        @keyframes fro-curl {
          0%   { opacity: 0; width: 0%; }
          20%  { opacity: 1; width: 18%; }
          100% { opacity: 0; width: 6%; }
        }
        @keyframes fro-glint {
          0%   { transform: translateX(-110%); opacity: 0; }
          25%  { opacity: 1; }
          100% { transform: translateX(210%); opacity: 0; }
        }
        @keyframes fro-flicker {
          0%   { opacity: 0; }
          18%  { opacity: 1; }
          34%  { opacity: 0.3; }
          50%  { opacity: 0.8; }
          70%  { opacity: 0.2; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
