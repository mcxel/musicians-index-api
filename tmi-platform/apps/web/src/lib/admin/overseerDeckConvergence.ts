/**
 * Overseer Deck Convergence — routing helpers + desktop layout law (P0).
 * Monitor state lives in overseerMonitorState.ts (canonical).
 */

import type { DeskPanelId } from "@/lib/admin/ObservatoryDeskState";
import type { OverseerCenterViewId } from "@/components/admin/overseer/OverseerCommandViews";
import {
  assignMonitorSource,
  createEmptyMonitorState,
  swapMonitorSources,
  type OverseerMonitorId,
  type OverseerMonitorState,
} from "@/lib/admin/overseerMonitorState";

export type { OverseerMonitorId, OverseerMonitorState };
export {
  assignMonitorSource,
  createEmptyMonitorState,
  swapMonitorSources,
  OVERSEER_MONITOR_IDS,
} from "@/lib/admin/overseerMonitorState";

export const OVERSEER_DESK_PANEL_EVENT = "tmi:overseer-desk-focus";

/** Desktop monitor stage — cinematic 16:9, not mobile max-height inheritance. */
export function desktopMonitorStageStyle(isDesktop: boolean): {
  minHeight?: string;
  maxHeight?: string;
} {
  if (!isDesktop) {
    return {};
  }
  return {
    minHeight: "min(56vw, calc(100vh - 420px))",
    maxHeight: "none",
  };
}

export function controlRailChangesIntelligenceDeckOnly(_action: string): boolean {
  return true;
}

export function monitorAIndependentFromMonitorB(
  state: OverseerMonitorState,
  slotA: OverseerMonitorId,
  sourceA: string | null,
  slotB: OverseerMonitorId,
  sourceB: string | null,
): OverseerMonitorState {
  let next = assignMonitorSource(state, slotA, sourceA);
  next = assignMonitorSource(next, slotB, sourceB);
  return next;
}

export function commandViewToDeskPanel(view: OverseerCenterViewId): DeskPanelId {
  switch (view) {
    case "observatory":
    case "venue-health":
      return "rooms";
    case "runtime-check":
    case "certification":
      return "system-health";
    case "global-pulse":
      return "overview";
    case "dynamics":
      return "analytics";
    case "approve-queue":
      return "submissions";
    case "media":
    default:
      return "overview";
  }
}

export type SideCardActionId = "bot-roster" | "unified-inbox" | "sentinel-wall";

export function sideCardToDeskPanel(cardId: SideCardActionId): DeskPanelId {
  switch (cardId) {
    case "bot-roster":
      return "bots";
    case "unified-inbox":
      return "submissions";
    case "sentinel-wall":
      return "alerts";
    default:
      return "overview";
  }
}

export function dispatchDeskPanelFocus(panel: DeskPanelId): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(OVERSEER_DESK_PANEL_EVENT, { detail: { panelId: panel } }),
  );
}

export function scrollToIntelligenceDeck(section: "control-desk" | "intelligence" = "control-desk"): void {
  if (typeof document === "undefined") return;
  const id = section === "control-desk" ? "living-os-control-desk" : "intelligence-deck";
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function focusIntelligenceWorkspace(panel: DeskPanelId): void {
  dispatchDeskPanelFocus(panel);
  scrollToIntelligenceDeck("control-desk");
}

export function desktopMonitorNotSquished(
  isDesktop: boolean,
  stageMinHeight: string | undefined,
  stageMaxHeight: string | undefined,
): boolean {
  if (!isDesktop) return false;
  if (stageMaxHeight && stageMaxHeight !== "none" && stageMaxHeight.includes("px")) {
    const cap = parseInt(stageMaxHeight, 10);
    if (!Number.isNaN(cap) && cap < 280) return false;
  }
  return Boolean(stageMinHeight && stageMinHeight.includes("vw"));
}

export function monitorSourcePickerEligible(sourceId: string, liveOnlyIds: string[]): boolean {
  return liveOnlyIds.includes(sourceId);
}
