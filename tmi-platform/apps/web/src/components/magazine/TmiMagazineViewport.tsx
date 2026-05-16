"use client";

import type { ReactNode } from "react";
import React from "react";
import MagazineAtmosphereLayer from "@/components/atmosphere/MagazineAtmosphereLayer";

// ─── Canonical magazine dimensions (export for use in other files) ─────────────
export const MAGAZINE_WIDTH   = 1280;
export const MAGAZINE_HEIGHT  = 760;
export const MAGAZINE_GUTTER  = 36;
export const MAGAZINE_BLEED   = 18;

// ─── Types ────────────────────────────────────────────────────────────────────

interface AtmosphereConfig {
  primary: string;
  secondary: string;
  tertiary?: string;
  intensity?: number;
  speed?: number;
  zBase?: number;
}

export interface TmiMagazineViewportProps {
  /**
   * Page-specific underlay nodes — gradients, particle fields, scan lines.
   * Rendered at z-index 1 inside the shell, behind all content.
   */
  underlay?: ReactNode;

  /**
   * Page-specific overlay chrome — orbit nodes, confetti, lightning, etc.
   * Rendered above atmosphere, below the shell object.
   */
  overlays?: ReactNode;

  /**
   * Atmosphere layer configuration. Omit to skip MagazineAtmosphereLayer.
   */
  atmosphere?: AtmosphereConfig;

  /**
   * Content for the mag-cover-zone strip — section-nav dots, mode toggles,
   * kicker chips. Rendered at the top of mag-shell__object.
   */
  coverZone?: ReactNode;

  /**
   * The spread content. Should be a single `<div className="mag-spread">` with
   * `.mag-spread__page.mag-left` and `.mag-spread__page.mag-right` children.
   */
  children: ReactNode;

  /** Additional class names for the outer mag-shell wrapper. */
  className?: string;
}

/**
 * TmiMagazineViewport
 *
 * Canonical magazine shell wrapper for all TMI spread homepages.
 * Enforces the single physical object identity: one magazine, five page states.
 *
 * Usage — replace the `<div className="mag-shell">` block in each artifact with:
 * ```tsx
 * <TmiMagazineViewport
 *   underlay={<><UnderlayA /><UnderlayB /></>}
 *   atmosphere={{ primary: "#00ffff", secondary: "#ff2daa", tertiary: "#aa2dff", intensity: 1.15 }}
 *   overlays={<OverlayNodes />}
 *   coverZone={<SectionNav />}
 * >
 *   <div className="mag-spread">
 *     <div className="mag-spread__page mag-left" style={{ overflow: "auto" }}>
 *       {leftContent}
 *     </div>
 *     <div className="mag-spread__page mag-right" style={{ overflow: "auto" }}>
 *       {rightContent}
 *     </div>
 *   </div>
 * </TmiMagazineViewport>
 * ```
 */
export default function TmiMagazineViewport({
  underlay,
  overlays,
  atmosphere,
  coverZone,
  children,
  className,
}: TmiMagazineViewportProps) {
  return (
    <div
      className={["mag-shell tmi-mag-viewport", className].filter(Boolean).join(" ")}
      style={{ position: "relative" }}
      data-tmi-viewport="true"
    >
      {/* ── Physical page-thickness stack (right edge) ───────────────────── */}
      <div className="mag-page-stack" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>

      {/* ── Page-specific underlay (z1 — deepest, behind all content) ─────── */}
      {underlay}

      {/* ── Magazine atmosphere particles / light rays ────────────────────── */}
      {atmosphere && (
        <MagazineAtmosphereLayer
          zBase={atmosphere.zBase ?? 2}
          intensity={atmosphere.intensity ?? 1}
          speed={atmosphere.speed ?? 1}
          primary={atmosphere.primary}
          secondary={atmosphere.secondary}
          tertiary={atmosphere.tertiary}
        />
      )}

      {/* ── Page-specific overlay chrome (above atmosphere, below content) ── */}
      {overlays}

      {/* ── Shell object — cover zone + spread ───────────────────────────── */}
      <div className="mag-shell__object" style={{ position: "relative", zIndex: 6 }}>
        {/* Cover zone: section dots, mode toggles, kicker chips */}
        {coverZone}

        {/* Spread: left + right pages */}
        <div className="mag-shell__spread">
          {children}
        </div>
      </div>
    </div>
  );
}
