/**
 * EOS Venue Registry — bridges VenueAssetRegistry (Rule 8, no duplicate venue sources).
 */

import type { VenueDefinition, VenueLayout } from "@/core/eos/types";
import {
  getVenueAsset,
  type VenueType,
  getAllVenueTypes,
} from "@/lib/venues/VenueAssetRegistry";

const LAYOUT_BY_VENUE: Record<VenueType, VenueLayout> = {
  battle: "arena",
  challenge: "arena",
  cypher: "circle_pit",
  "deal-or-feud": "game_show",
  "fan-lobby": "lounge",
  lounge: "lounge",
  "monday-night-stage": "theater",
  "world-dance-party": "dance_floor",
  concert: "theater",
  "world-concert": "arena",
  "mini-concert": "theater",
  "release-party": "theater",
  "world-release": "theater",
  "mini-release": "theater",
  "listening-party": "lounge",
  "slow-jams": "lounge",
};

function buildVenueDefinition(venueType: VenueType): VenueDefinition {
  const asset = getVenueAsset(venueType);
  const assetIds = [
    asset.ambientVideoUrl,
    asset.audienceViewVideoUrl,
    asset.performerViewVideoUrl,
    asset.bannerUrl,
    asset.panelArtUrl,
  ].filter(Boolean) as string[];

  return {
    id: venueType,
    venueType,
    displayName: asset.label,
    layout: LAYOUT_BY_VENUE[venueType],
    assetIds,
  };
}

export const VENUE_REGISTRY: Record<string, VenueDefinition> = Object.fromEntries(
  getAllVenueTypes().map((type) => [type, buildVenueDefinition(type)])
);

export function getVenueById(id: string): VenueDefinition | undefined {
  return VENUE_REGISTRY[id];
}

export function getAllVenues(): VenueDefinition[] {
  return Object.values(VENUE_REGISTRY);
}
