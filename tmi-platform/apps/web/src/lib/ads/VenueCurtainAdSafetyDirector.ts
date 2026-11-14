/**
 * VenueCurtainAdSafetyDirector — curtain / intermission commercial safety facade.
 * Reuses JumbotronCurtainIntermissionDirector + VenueCurtainDirector.resolveCommercialInventory.
 * Never mounts AdSense as default in-world texture (VenueAdDirector law).
 */

import { resolveCommercialInventory } from "@/lib/venue/VenueCurtainDirector";
import { VenueAdDirector } from "@/lib/ads/VenueAdDirector";

export type CurtainAdSafetyVerdict = {
  safeForAudience: boolean;
  usesAdSenseAsDefaultInWorld: false;
  inventoryClass: string;
  honestNoFill: boolean;
  reason: string;
};

export function evaluateCurtainAdSafety(zone = "curtain-ad-rail"): CurtainAdSafetyVerdict {
  const inventory = resolveCommercialInventory(zone);
  const director = new VenueAdDirector({
    roomId: "cert-room",
    venueId: "cert-venue",
  phase: "PERFORMANCE",
});
  const usesAdSenseAsDefaultInWorld = director.usesAdSenseAsDefaultInWorldPath();

  return {
    safeForAudience: usesAdSenseAsDefaultInWorld === false,
    usesAdSenseAsDefaultInWorld,
    inventoryClass: inventory.inventoryClass,
    honestNoFill: inventory.honestNoFill,
    reason: `Curtain inventory=${inventory.inventoryClass}; AdSense not default in-world path`,
  };
}

export const VenueCurtainAdSafetyDirector = {
  evaluateCurtainAdSafety,
  resolveCommercialInventory,
};
