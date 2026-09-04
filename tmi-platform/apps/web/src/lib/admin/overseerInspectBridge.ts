/**
 * INSPECT workflow — telemetry opens in Intelligence Deck; monitor keeps playing.
 */

export type OverseerInspectPayload = {
  monitorId: string;
  sourceId: string;
  roomId?: string;
  label: string;
  type: string;
  viewerCount?: number;
};

export const OVERSEER_INSPECT_EVENT = "tmi:overseer-inspect";

export function dispatchOverseerInspect(payload: OverseerInspectPayload): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OVERSEER_INSPECT_EVENT, { detail: payload }));
}

export function scrollToIntelligenceDeck(): void {
  if (typeof window === "undefined") return;
  document.getElementById("intelligence-deck")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function scrollToControlDesk(): void {
  if (typeof window === "undefined") return;
  document.getElementById("living-os-control-desk")?.scrollIntoView({ behavior: "smooth", block: "start" });
}
