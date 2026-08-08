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

/** Fan/Performer hub blueprint: panels flank dual monitors at eye level (Profiles/tmi fan and performer blue print Ui with drawers.png). */
export type HubPanelFlank = "left" | "right" | "near-click";

const HUB_LEFT_FLANK_KEYS = new Set([
  "inventory",
  "lobby",
  "playlist",
  "yopho",
  "media_locker",
  "beat_lab",
  "bio_magazine",
  "quick_queue",
]);

const HUB_RIGHT_FLANK_KEYS = new Set([
  "memory",
  "memory_wall",
  "messages",
  "alerts",
  "friends",
  "live_wall",
]);

export function hubPanelFlankForKey(panelKey: string): HubPanelFlank {
  const k = panelKey.toLowerCase();
  if (HUB_LEFT_FLANK_KEYS.has(k)) return "left";
  if (HUB_RIGHT_FLANK_KEYS.has(k)) return "right";
  return "near-click";
}

export function readHubMonitorStageRect(): DOMRect | null {
  if (typeof document === "undefined") return null;
  const el = document.querySelector("[data-hub-monitor-stage]");
  if (!(el instanceof HTMLElement)) return null;
  return el.getBoundingClientRect();
}

export function hubBlueprintPanelPosition(
  stageRect: DOMRect,
  flank: HubPanelFlank,
  panelWidth: number,
  panelHeight: number,
  clickAnchor?: ViewportAnchor,
): { top: number; left: number } {
  if (typeof window === "undefined") {
    return { top: 12, left: 12 };
  }
  const pad = 12;
  const vh = window.innerHeight;
  const vw = window.innerWidth;
  const top = Math.min(
    Math.max(pad, stageRect.top + stageRect.height / 2 - panelHeight / 2),
    vh - panelHeight - pad,
  );
  if (flank === "left") {
    const left = Math.min(
      Math.max(pad, stageRect.left + 10),
      stageRect.right - panelWidth - 16,
    );
    return { top, left };
  }
  if (flank === "right") {
    const left = Math.max(
      pad,
      Math.min(stageRect.right - panelWidth - 10, vw - panelWidth - pad),
    );
    return { top, left };
  }
  return clampQuickPanelPosition(
    clickAnchor ?? {
      x: stageRect.left + stageRect.width / 2,
      y: stageRect.top + stageRect.height / 2,
    },
    panelWidth,
    panelHeight,
  );
}

/** Blueprint placement when monitor stage is in DOM; otherwise fall back to click anchor. */
export function resolveHubQuickPanelPosition(
  panelKey: string,
  panelWidth: number,
  panelHeight: number,
  clickAnchor: ViewportAnchor,
): { top: number; left: number } {
  const stage = readHubMonitorStageRect();
  const flank = hubPanelFlankForKey(panelKey);
  if (stage && flank !== "near-click") {
    return hubBlueprintPanelPosition(stage, flank, panelWidth, panelHeight, clickAnchor);
  }
  if (stage && flank === "near-click") {
    return hubBlueprintPanelPosition(stage, "near-click", panelWidth, panelHeight, clickAnchor);
  }
  return clampQuickPanelPosition(clickAnchor, panelWidth, panelHeight);
}
