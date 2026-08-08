import type { CSSProperties } from "react";

/** HUD / digital panel chrome aligned with Profiles/digital-panel-1.jpg (cyan glass, chamfer). */
export function digitalQuickPanelFrameStyle(accent: string): CSSProperties {
  return {
    background:
      "linear-gradient(165deg, rgba(4,18,36,0.97) 0%, rgba(2,8,22,0.98) 45%, rgba(8,4,28,0.96) 100%)",
    border: `1px solid ${accent}`,
    boxShadow: `0 0 0 1px ${accent}33, 0 0 28px ${accent}22, 0 18px 48px rgba(0,0,0,0.75), inset 0 0 40px rgba(0,255,255,0.04)`,
    clipPath:
      "polygon(14px 0, calc(100% - 14px) 0, 100% 14px, 100% calc(100% - 14px), calc(100% - 14px) 100%, 14px 100%, 0 calc(100% - 14px), 0 14px)",
    backdropFilter: "blur(10px)",
  };
}

export type ViewportAnchor = {
  /** Viewport X of click / trigger center */
  x: number;
  /** Viewport Y of click / trigger center (eye level) */
  y: number;
  /** Optional trigger rect for horizontal alignment */
  rect?: DOMRect;
};

/** Place a fixed panel near the user's click, clamped inside the viewport. */
export function clampQuickPanelPosition(
  anchor: ViewportAnchor,
  panelWidth: number,
  panelHeight: number,
): { top: number; left: number } {
  if (typeof window === "undefined") {
    return { top: 12, left: 12 };
  }
  const pad = 12;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const rect = anchor.rect;
  let left = rect ? rect.right + 8 : anchor.x - panelWidth / 2;
  if (left + panelWidth > vw - pad) {
    left = rect ? rect.left - panelWidth - 8 : anchor.x - panelWidth / 2;
  }
  left = Math.min(Math.max(pad, left), vw - panelWidth - pad);
  const top = Math.min(
    Math.max(pad, anchor.y - panelHeight / 2),
    vh - panelHeight - pad,
  );
  return { top, left };
}
