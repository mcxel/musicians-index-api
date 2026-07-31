"use client";

import type { CSSProperties, ReactNode } from "react";
import {
  PRESENTATION_LAYER_STACK,
  getLayerZIndex,
  type PresentationLayerId,
} from "@/lib/presentation/LayerStack";

/**
 * Explicit z-order stack host for television overlays.
 * background → underlay → performer → overlays → transitions → critical alerts
 */
export default function LayerStackHost({
  children,
  style,
  baseZIndex = 0,
}: {
  children: ReactNode;
  style?: CSSProperties;
  baseZIndex?: number;
}) {
  return (
    <div
      data-presentation-layer-stack="true"
      style={{ position: "relative", width: "100%", height: "100%", ...style }}
    >
      {children}
      {/* Debug contract attribute for certification tools */}
      <span
        hidden
        data-layer-contract={PRESENTATION_LAYER_STACK.map((l) => `${l.id}:${getLayerZIndex(l.id, baseZIndex)}`).join(",")}
      />
    </div>
  );
}

export function LayerSlot({
  layer,
  children,
  baseZIndex = 0,
  style,
}: {
  layer: PresentationLayerId;
  children: ReactNode;
  baseZIndex?: number;
  style?: CSSProperties;
}) {
  return (
    <div
      data-presentation-layer={layer}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: getLayerZIndex(layer, baseZIndex),
        pointerEvents: "none",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
