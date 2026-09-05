/**
 * VenueHUDSafeZoneDirector
 * Manages HUD safe zones so context panels avoid covering the live performance.
 *
 * Reference geometry (1280×720 canonical):
 *   TOP_SAFE_ZONE:    x 52–1228,  y  34–100
 *   LEFT_SAFE_ZONE:   x  61–118,  y 118–611
 *   RIGHT_SAFE_ZONE:  x 1165–1220, y 185–630
 *   BOTTOM_SAFE_ZONE: x  60–1230,  y 635–705
 *   CENTER:           x 120–1164,  y 101–634  ← protect this
 *
 * Safe zones are expressed as CSS position tokens so any component
 * can request the least obstructive placement.
 *
 * Certification: L1 IMPLEMENTED
 */

export type SafeZone =
  | "TOP_LEFT"
  | "TOP_RIGHT"
  | "BOTTOM_LEFT"
  | "BOTTOM_RIGHT"
  | "LEFT_CENTER"
  | "RIGHT_CENTER";

export interface OccupiedZone {
  zone: SafeZone;
  panelId: string;
}

export interface ZonePlacement {
  zone: SafeZone;
  cssPosition: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
    zIndex: number;
  };
}

// ─── Zone priority order — bottom corners preferred (above dock) ──────────────
const ZONE_PRIORITY: SafeZone[] = [
  "BOTTOM_LEFT",
  "BOTTOM_RIGHT",
  "TOP_LEFT",
  "TOP_RIGHT",
  "LEFT_CENTER",
  "RIGHT_CENTER",
];

const ZONE_CSS: Record<SafeZone, ZonePlacement["cssPosition"]> = {
  TOP_LEFT:     { top: "calc(4.7% + 60px)", left: "4.1%",    zIndex: 85 },
  TOP_RIGHT:    { top: "calc(4.7% + 60px)", right: "4.1%",   zIndex: 85 },
  BOTTOM_LEFT:  { bottom: "calc(9.7% + 16px)", left: "4.1%", zIndex: 85 },
  BOTTOM_RIGHT: { bottom: "calc(9.7% + 16px)", right: "4.1%",zIndex: 85 },
  LEFT_CENTER:  { top: "50%",  left: "calc(4.1% + 60px)",    zIndex: 85 },
  RIGHT_CENTER: { top: "50%",  right: "calc(4.1% + 60px)",   zIndex: 85 },
};

export class VenueHUDSafeZoneDirector {
  private occupied: Map<SafeZone, string> = new Map();

  /**
   * Request a placement for a panel.
   * Returns the least obstructive available safe zone.
   */
  requestPlacement(panelId: string, preferred?: SafeZone): ZonePlacement {
    // If preferred zone is free, use it
    if (preferred && !this.occupied.has(preferred)) {
      this.occupied.set(preferred, panelId);
      return { zone: preferred, cssPosition: ZONE_CSS[preferred] };
    }
    // Find first free zone in priority order
    for (const zone of ZONE_PRIORITY) {
      if (!this.occupied.has(zone)) {
        this.occupied.set(zone, panelId);
        return { zone, cssPosition: ZONE_CSS[zone] };
      }
    }
    // All occupied — fallback to BOTTOM_LEFT (overlap is inevitable)
    return { zone: "BOTTOM_LEFT", cssPosition: { ...ZONE_CSS.BOTTOM_LEFT, zIndex: 86 } };
  }

  /** Release a zone when the panel closes. */
  release(panelId: string): void {
    for (const [zone, id] of this.occupied.entries()) {
      if (id === panelId) {
        this.occupied.delete(zone);
        return;
      }
    }
  }

  isOccupied(zone: SafeZone): boolean {
    return this.occupied.has(zone);
  }

  clearAll(): void {
    this.occupied.clear();
  }
}

/** Singleton director for the active venue session. */
export const venueHUDSafeZoneDirector = new VenueHUDSafeZoneDirector();
