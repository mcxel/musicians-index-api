/**
 * MonetizationPreflightCrawler — route discovery + ad slot reservation + collision detection.
 * Output: READY FOR EXTERNAL REVIEW — never "GOOGLE APPROVED".
 */

import {
  AD_PLACEMENT_REGISTRY,
  slotCollidesWithProtectedRegion,
  type AdPlacementSlot,
} from "@/lib/commerce/AdPlacementRegistry";
import { resolveAdEntitlement } from "@/lib/commerce/AdEntitlementPolicy";

export type PreflightStatus = "READY_FOR_EXTERNAL_REVIEW" | "BLOCKED" | "WARNINGS";

export interface PreflightError {
  code: string;
  slotId?: string;
  route?: string;
  message: string;
}

export interface MonetizationPreflightReport {
  status: PreflightStatus;
  scannedRoutes: string[];
  slotsChecked: number;
  errors: PreflightError[];
  warnings: PreflightError[];
  generatedAt: string;
}

const CRAWLABLE_ROUTES = [
  "/",
  "/magazine",
  "/news",
  "/articles",
  "/about",
  "/privacy",
  "/terms",
  "/contact",
  "/home/1",
  "/home/2",
  "/home/3",
  "/home/4",
  "/home/5",
  "/hub/fan",
  "/hub/performer",
  "/sponsors/advertise",
];

const PROTECTED_REGIONS_BY_ROUTE: Record<string, string[]> = {
  "/hub/fan": ["primary-video", "hud-overlay", "quick-panel", "venue-tools-panel"],
  "/hub/performer": ["primary-video", "performance-rail", "go-live-controls", "venue-tools-panel"],
  "/live/rooms": ["primary-video", "hud-overlay"],
};

function checkSlotCollisions(slot: AdPlacementSlot, route: string): PreflightError[] {
  const errors: PreflightError[] = [];
  const routeRegions = PROTECTED_REGIONS_BY_ROUTE[route] ?? [];

  for (const region of slot.protectedRegions) {
    if (routeRegions.includes(region)) {
      errors.push({
        code: "AD-COLLISION-001",
        slotId: slot.slotId,
        route,
        message: `Slot ${slot.slotId} protected region "${region}" may collide on route ${route}`,
      });
    }
  }

  if (slot.minHeight < 50) {
    errors.push({
      code: "AD-SLOT-002",
      slotId: slot.slotId,
      message: `Slot ${slot.slotId} minHeight ${slot.minHeight}px below 50px minimum`,
    });
  }

  return errors;
}

export function runMonetizationPreflight(
  routes: string[] = CRAWLABLE_ROUTES,
): MonetizationPreflightReport {
  const errors: PreflightError[] = [];
  const warnings: PreflightError[] = [];

  for (const route of routes) {
    const entitlement = resolveAdEntitlement({ pathname: route });
    if (entitlement === "NO_MONETIZATION") continue;

    for (const slot of AD_PLACEMENT_REGISTRY) {
      const collisions = checkSlotCollisions(slot, route);
      for (const c of collisions) {
        if (c.code.startsWith("AD-COLLISION")) {
          warnings.push(c);
        } else {
          errors.push(c);
        }
      }

      if (entitlement === "ADS_BLOCKED" && slot.inventoryClass === "ADSENSE") {
        warnings.push({
          code: "AD-SLOT-003",
          slotId: slot.slotId,
          route,
          message: `AdSense slot ${slot.slotId} on blocked route ${route} — will not render`,
        });
      }
    }
  }

  for (const slot of AD_PLACEMENT_REGISTRY) {
    if (!slot.zoneKey) {
      errors.push({
        code: "AD-SLOT-001",
        slotId: slot.slotId,
        message: `Slot ${slot.slotId} missing zoneKey`,
      });
    }
    for (const region of ["primary-video", "hud-overlay"]) {
      if (slotCollidesWithProtectedRegion(slot.slotId, region)) {
        warnings.push({
          code: "AD-COLLISION-002",
          slotId: slot.slotId,
          message: `Slot ${slot.slotId} lists protected region "${region}" — verify geometry at runtime`,
        });
      }
    }
  }

  const status: PreflightStatus =
    errors.length > 0 ? "BLOCKED" : warnings.length > 0 ? "WARNINGS" : "READY_FOR_EXTERNAL_REVIEW";

  return {
    status,
    scannedRoutes: routes,
    slotsChecked: AD_PLACEMENT_REGISTRY.length,
    errors,
    warnings,
    generatedAt: new Date().toISOString(),
  };
}

if (typeof require !== "undefined" && require.main === module) {
  const report = runMonetizationPreflight();
  console.log(JSON.stringify(report, null, 2));
  process.exit(report.status === "BLOCKED" ? 1 : 0);
}
