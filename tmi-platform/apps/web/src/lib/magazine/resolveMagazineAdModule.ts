/**
 * Magazine ad modules → Canonical Inventory (Rule 12).
 * Inventory hooks only — never a second ad system, never alters ranks.
 */
import { getAdSlotForZone, type AdSlotDescriptor } from "@/lib/commerce/SponsorRegistry";
import {
  MAGAZINE_AD_MODULE_SLOTS,
  type MagazineAdModuleSlot,
  magazineAdZoneForModule,
} from "@/lib/magazine/MagazineIssueContract";

export function resolveMagazineAdModule(slot: MagazineAdModuleSlot): AdSlotDescriptor {
  return getAdSlotForZone(magazineAdZoneForModule(slot));
}

export function listMagazineAdModuleZones(): string[] {
  return Object.values(MAGAZINE_AD_MODULE_SLOTS);
}
