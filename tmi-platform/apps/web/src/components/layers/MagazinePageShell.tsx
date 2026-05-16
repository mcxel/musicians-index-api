"use client";

/**
 * MagazinePageShell.tsx
 * Layer 0 — Physical magazine object.
 * Provides spine, paper edges, shadow, crease, and page thickness.
 * All other layers are passed as named props and rendered in order.
 */

import { ReactNode } from "react";
import { ImageSlotWrapper } from "@/components/visual-enforcement";

interface MagazinePageShellProps {
  children: ReactNode; // Layer 4 — Functional content
  bgImage?: string; // Layer 1 — Magazine background art
  bgColor?: string; // Layer 1 fallback color
  accent?: string; // Spine / edge accent color (matches page identity)
  underlayA?: ReactNode; // Layer 2 — Ambient motion
  underlayB?: ReactNode; // Layer 3 — Particle motion
  overlayA?: ReactNode; // Layer 5 — Labels / numbers
  overlayB?: ReactNode; // Layer 6 — Crown / star artifacts
  overlayC?: ReactNode; // Layer 7 — Floating text
}

export default function MagazinePageShell({
  children,
  bgImage,
  bgColor = "#050510",
  accent = "#00FFFF",
  underlayA,
  underlayB,
  overlayA,
  overlayB,
  overlayC,
}: MagazinePageShellProps) {
  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        // Layer 0: Physical magazine object
        // Spine on left edge
        borderLeft: `3px solid ${accent}`,
        // Paper edge shadow — depth artifact
        boxShadow: `
          inset 6px 0 18px rgba(0,0,0,0.5),
          inset -2px 0 8px rgba(0,0,0,0.3),
          -8px 0 24px rgba(0,0,0,0.8),
          8px 0 16px rgba(0,0,0,0.4),
          0 0 40px rgba(0,0,0,0.6)
        `,
        // Page crease on left (spine fold)
        background: bgColor,
      }}
    >
      {/* Layer 1 — Magazine background art */}
      {bgImage && (
        <ImageSlotWrapper
          imageId="magazine-page-background"
          roomId="magazine-shell"
          priority="normal"
          fallbackUrl={bgImage}
          altText="Magazine page background"
          className="w-full h-full object-cover"
          containerStyle={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            opacity: 0.08,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Layer 2 — Underlay A (ambient motion) — rendered over background, under content */}
      {underlayA && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            pointerEvents: "none",
            mixBlendMode: "screen",
          }}
        >
          {underlayA}
        </div>
      )}

      {/* Layer 3 — Underlay B (particle motion) — screen blend */}
      {underlayB && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 3,
            pointerEvents: "none",
            mixBlendMode: "screen",
          }}
        >
          {underlayB}
        </div>
      )}

      {/* Layer 4 — Functional content (surface) */}
      <div style={{ position: "relative", zIndex: 4 }}>{children}</div>

      {/* Layer 5 — Overlay A (labels / ranking numerals) */}
      {overlayA && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 50,
            pointerEvents: "none",
          }}
        >
          {overlayA}
        </div>
      )}

      {/* Layer 6 — Overlay B (crown / star artifacts) */}
      {overlayB && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 51,
            pointerEvents: "none",
          }}
        >
          {overlayB}
        </div>
      )}

      {/* Layer 7 — Overlay C (editable floating text) */}
      {overlayC && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 52,
            pointerEvents: "none",
          }}
        >
          {overlayC}
        </div>
      )}

      {/* Page thickness illusion — right edge */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 4,
          bottom: 0,
          background: `linear-gradient(to left, rgba(255,255,255,0.04), transparent)`,
          zIndex: 60,
          pointerEvents: "none",
        }}
      />

      {/* Spine crease line */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          left: 16,
          width: 1,
          bottom: 0,
          background: `linear-gradient(to bottom, transparent, ${accent}22, ${accent}44, ${accent}22, transparent)`,
          zIndex: 60,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
