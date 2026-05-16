import type { TmiOverlayHotspot } from "@/lib/overlays/tmiUniversalOverlayEngine";
import type { TmiSafeZone } from "@/lib/overlays/tmiOverlaySafeZoneEngine";

export type TmiMagazineOverlayPage = {
  pageId: string;
  hotspotIds: string[];
  safeZoneIds: string[];
};

export type TmiMagazineOverlayBundle = {
  magazineId: string;
  hotspots: TmiOverlayHotspot[];
  safeZones: TmiSafeZone[];
  pages: TmiMagazineOverlayPage[];
};

const MAGAZINE_OVERLAY_REGISTRY = new Map<string, TmiMagazineOverlayBundle>();

export function registerMagazineOverlayBundle(bundle: TmiMagazineOverlayBundle): void {
  MAGAZINE_OVERLAY_REGISTRY.set(bundle.magazineId, bundle);
}

export function getMagazineOverlayBundle(magazineId: string): TmiMagazineOverlayBundle | undefined {
  return MAGAZINE_OVERLAY_REGISTRY.get(magazineId);
}

export function getMagazineOverlayForPage(
  magazineId: string,
  pageId: string,
): { hotspots: TmiOverlayHotspot[]; safeZones: TmiSafeZone[] } {
  const bundle = MAGAZINE_OVERLAY_REGISTRY.get(magazineId);
  if (!bundle) return { hotspots: [], safeZones: [] };

  const page = bundle.pages.find((entry) => entry.pageId === pageId);
  if (!page) return { hotspots: [], safeZones: [] };

  return {
    hotspots: bundle.hotspots.filter((h) => page.hotspotIds.includes(h.id)),
    safeZones: bundle.safeZones.filter((z) => page.safeZoneIds.includes(z.id)),
  };
}
