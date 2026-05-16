export type TmiSafeZoneType =
  | "caption"
  | "face"
  | "control"
  | "stage-center"
  | "headline"
  | "scoreboard"
  | "action-strip";

export type TmiSafeZone = {
  id: string;
  surfaceId: string;
  type: TmiSafeZoneType;
  x: number;
  y: number;
  width: number;
  height: number;
  strict: boolean;
};

export function intersectsSafeZone(
  hotspot: { x: number; y: number; width: number; height: number },
  zone: TmiSafeZone,
): boolean {
  return !(
    hotspot.x + hotspot.width < zone.x ||
    hotspot.x > zone.x + zone.width ||
    hotspot.y + hotspot.height < zone.y ||
    hotspot.y > zone.y + zone.height
  );
}

export function validateOverlayAgainstSafeZones(
  hotspot: { x: number; y: number; width: number; height: number },
  zones: TmiSafeZone[],
): { ok: boolean; violations: string[] } {
  const violations = zones
    .filter((zone) => zone.strict && intersectsSafeZone(hotspot, zone))
    .map((zone) => zone.id);
  return { ok: violations.length === 0, violations };
}
