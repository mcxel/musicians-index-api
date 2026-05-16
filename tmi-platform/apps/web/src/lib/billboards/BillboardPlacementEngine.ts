import { listBillboards, type BillboardRecord } from "@/lib/billboards/BillboardRegistry";

export type BillboardPlacementSurface =
  | "homepage-rotation"
  | "magazine-feature"
  | "artist-profile"
  | "venue-screen"
  | "global-hub"
  | "search-discovery";

export interface BillboardPlacement {
  billboardSlug: string;
  surface: BillboardPlacementSurface;
  weight: number;
}

function placementForCampaign(item: BillboardRecord): BillboardPlacementSurface[] {
  if (item.campaignType === "artist-feature") {
    return ["artist-profile", "homepage-rotation", "search-discovery"];
  }
  if (item.campaignType === "event-promo") {
    return ["venue-screen", "global-hub", "search-discovery"];
  }
  if (item.campaignType === "battle-promo") {
    return ["homepage-rotation", "magazine-feature", "search-discovery"];
  }
  return ["magazine-feature", "search-discovery"];
}

export class BillboardPlacementEngine {
  static listPlacements(): BillboardPlacement[] {
    return listBillboards().flatMap((item) => {
      const surfaces = placementForCampaign(item);
      return surfaces.map((surface, index) => ({
        billboardSlug: item.slug,
        surface,
        weight: Math.max(0.5, 1 - index * 0.15),
      }));
    });
  }

  static listPlacementsForArtist(artistSlug: string): BillboardPlacement[] {
    return this.listPlacements().filter((item) => item.billboardSlug.startsWith(`${artistSlug}-`));
  }
}

export default BillboardPlacementEngine;
