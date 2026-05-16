export type TmiOverlaySurfaceType =
  | "homepage"
  | "magazine"
  | "video"
  | "profile"
  | "venue"
  | "sponsor"
  | "admin"
  | "game"
  | "hud";

export type TmiOverlayAnchor = {
  id: string;
  surfaceId: string;
  surfaceType: TmiOverlaySurfaceType;
  x: number;
  y: number;
  width: number;
  height: number;
  transformOriginX: number;
  transformOriginY: number;
};

const overlayAnchors = new Map<string, TmiOverlayAnchor>();

export function registerOverlayAnchor(anchor: TmiOverlayAnchor): void {
  overlayAnchors.set(anchor.id, anchor);
}

export function getOverlayAnchor(anchorId: string): TmiOverlayAnchor | undefined {
  return overlayAnchors.get(anchorId);
}

export function listOverlayAnchorsBySurface(surfaceId: string): TmiOverlayAnchor[] {
  return [...overlayAnchors.values()].filter((anchor) => anchor.surfaceId === surfaceId);
}
