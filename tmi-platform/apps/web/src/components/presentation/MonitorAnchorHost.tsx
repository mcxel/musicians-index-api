"use client";

import type { CSSProperties, ReactNode } from "react";
import {
  monitorAnchorZoneToCss,
  type MonitorAnchorZoneId,
} from "@/lib/presentation/MonitorAnchorZones";
import { getLayerZIndex, type PresentationLayerId } from "@/lib/presentation/LayerStack";

/**
 * Positions children inside a named monitor anchor zone (relative %, not pixels).
 */
export default function MonitorAnchorHost({
  zone,
  layer = "OVERLAYS",
  children,
  style,
}: {
  zone: MonitorAnchorZoneId;
  layer?: PresentationLayerId;
  children: ReactNode;
  style?: CSSProperties;
}) {
  const zoneCss = monitorAnchorZoneToCss(zone);
  return (
    <div
      data-monitor-anchor={zone}
      data-presentation-layer={layer}
      style={{
        ...zoneCss,
        zIndex: getLayerZIndex(layer),
        ...style,
      }}
    >
      {children}
    </div>
  );
}
