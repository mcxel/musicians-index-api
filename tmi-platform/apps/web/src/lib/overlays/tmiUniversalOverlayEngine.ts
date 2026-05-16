import { enforceClickability, type ClickableTarget } from "@/lib/build/tmiClickabilityEnforcer";
import { getOverlayAnchor, type TmiOverlayAnchor } from "@/lib/overlays/tmiOverlayAnchorRegistry";
import { getOverlayShape, type TmiOverlayShapeId } from "@/lib/overlays/tmiOverlayShapeRegistry";
import { validateOverlayAgainstSafeZones, type TmiSafeZone } from "@/lib/overlays/tmiOverlaySafeZoneEngine";

export type TmiOverlayHotspot = {
  id: string;
  anchorId: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  shapeId: TmiOverlayShapeId;
  target: ClickableTarget;
};

export type TmiOverlaySurfaceState = {
  surfaceId: string;
  anchor?: TmiOverlayAnchor;
  hotspots: TmiOverlayHotspot[];
  safeZones: TmiSafeZone[];
};

export type TmiResolvedOverlayHotspot = {
  id: string;
  label: string;
  shapeId: TmiOverlayShapeId;
  cssClipPath?: string;
  frame: { x: number; y: number; width: number; height: number };
  clickability: ReturnType<typeof enforceClickability>;
  safeZoneOk: boolean;
  safeZoneViolations: string[];
};

export function resolveOverlaySurfaceState(
  surfaceId: string,
  anchorId: string,
  hotspots: TmiOverlayHotspot[],
  safeZones: TmiSafeZone[],
): TmiOverlaySurfaceState {
  return {
    surfaceId,
    anchor: getOverlayAnchor(anchorId),
    hotspots,
    safeZones,
  };
}

export function resolveOverlayHotspots(state: TmiOverlaySurfaceState): TmiResolvedOverlayHotspot[] {
  return state.hotspots.map((hotspot) => {
    const shape = getOverlayShape(hotspot.shapeId);
    const safe = validateOverlayAgainstSafeZones(
      { x: hotspot.x, y: hotspot.y, width: hotspot.width, height: hotspot.height },
      state.safeZones,
    );
    return {
      id: hotspot.id,
      label: hotspot.label,
      shapeId: hotspot.shapeId,
      cssClipPath: shape?.cssClipPath,
      frame: { x: hotspot.x, y: hotspot.y, width: hotspot.width, height: hotspot.height },
      clickability: enforceClickability(hotspot.target),
      safeZoneOk: safe.ok,
      safeZoneViolations: safe.violations,
    };
  });
}
