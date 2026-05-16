"use client";

import { useMemo } from "react";
import TmiOverlayHotspot from "@/components/overlays/TmiOverlayHotspot";
import {
  resolveOverlayHotspots,
  resolveOverlaySurfaceState,
  type TmiOverlayHotspot as OverlayHotspotType,
} from "@/lib/overlays/tmiUniversalOverlayEngine";
import type { TmiSafeZone } from "@/lib/overlays/tmiOverlaySafeZoneEngine";

export default function TmiUniversalOverlayLayer({
  surfaceId,
  anchorId,
  hotspots,
  safeZones,
  onSystemAction,
}: {
  surfaceId: string;
  anchorId: string;
  hotspots: OverlayHotspotType[];
  safeZones: TmiSafeZone[];
  onSystemAction?: (actionId: string) => void;
}) {
  const resolved = useMemo(() => {
    const state = resolveOverlaySurfaceState(surfaceId, anchorId, hotspots, safeZones);
    return resolveOverlayHotspots(state);
  }, [surfaceId, anchorId, hotspots, safeZones]);

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      {resolved.map((hotspot) => (
        <div key={hotspot.id} className="pointer-events-auto">
          <TmiOverlayHotspot hotspot={hotspot} onSystemAction={onSystemAction} />
        </div>
      ))}
    </div>
  );
}
