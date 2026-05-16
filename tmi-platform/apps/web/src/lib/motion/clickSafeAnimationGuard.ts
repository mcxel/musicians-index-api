/**
 * CLICK-SAFE ANIMATION GUARD
 * Ensures animated overlays never intercept pointer events.
 * Apply these CSS properties to every animation layer.
 */

export const MOTION_LAYER_BASE: React.CSSProperties = {
  pointerEvents: "none",
  userSelect: "none",
  position: "absolute",
  inset: 0,
  zIndex: 0,
};

export const SCANLINE_LAYER: React.CSSProperties = {
  ...MOTION_LAYER_BASE,
  zIndex: 1,
  opacity: 0.035,
};

export const GLITCH_LAYER: React.CSSProperties = {
  ...MOTION_LAYER_BASE,
  zIndex: 2,
  mixBlendMode: "screen",
};

export const STARBURST_LAYER: React.CSSProperties = {
  ...MOTION_LAYER_BASE,
  zIndex: 3,
  opacity: 0,
};

/** Verify a container will never block clicks (runtime assertion in dev only) */
export function assertClickSafe(el: HTMLElement | null, label: string): void {
  if (!el || process.env.NODE_ENV !== "development") return;
  const style = window.getComputedStyle(el);
  if (style.pointerEvents !== "none") {
    console.warn(`[ClickSafeGuard] "${label}" has pointerEvents !== none — animation may block clicks`);
  }
}
