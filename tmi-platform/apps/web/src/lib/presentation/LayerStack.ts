/**
 * Overlay / Underlay LayerStack — explicit z-order contract for television production.
 *
 * background → underlay → performer → overlays → transitions → critical alerts
 */

export type PresentationLayerId =
  | "BACKGROUND"
  | "UNDERLAY"
  | "PERFORMER"
  | "OVERLAYS"
  | "TRANSITIONS"
  | "CRITICAL_ALERTS";

export interface PresentationLayerDefinition {
  id: PresentationLayerId;
  label: string;
  /** Stable relative z-index band (hosts may offset by a base) */
  zIndex: number;
  order: number;
}

export const PRESENTATION_LAYER_STACK: readonly PresentationLayerDefinition[] = [
  { id: "BACKGROUND", label: "Background / venue plate", zIndex: 0, order: 0 },
  { id: "UNDERLAY", label: "Underlay / battle frames", zIndex: 100, order: 1 },
  { id: "PERFORMER", label: "Performer video / frames", zIndex: 200, order: 2 },
  { id: "OVERLAYS", label: "HUD overlays / lower thirds", zIndex: 300, order: 3 },
  { id: "TRANSITIONS", label: "Transitions / VS / wipe", zIndex: 400, order: 4 },
  { id: "CRITICAL_ALERTS", label: "Critical alerts / safety", zIndex: 500, order: 5 },
] as const;

const BY_ID: Record<PresentationLayerId, PresentationLayerDefinition> =
  PRESENTATION_LAYER_STACK.reduce(
    (acc, layer) => {
      acc[layer.id] = layer;
      return acc;
    },
    {} as Record<PresentationLayerId, PresentationLayerDefinition>
  );

export function getPresentationLayer(id: PresentationLayerId): PresentationLayerDefinition {
  return BY_ID[id];
}

export function getLayerZIndex(id: PresentationLayerId, base = 0): number {
  return base + BY_ID[id].zIndex;
}

export function comparePresentationLayers(a: PresentationLayerId, b: PresentationLayerId): number {
  return BY_ID[a].order - BY_ID[b].order;
}
