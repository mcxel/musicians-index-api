/**
 * MonetizationHealthRegistry — slot health tracking (ON / NO_FILL / blocked).
 */

import type { AdInventoryClass } from "@/lib/commerce/AdPlacementRegistry";

export type MonetizationSlotHealth = "ON" | "NO_FILL" | "BLOCKED" | "SPONSOR" | "HOUSE";

export interface MonetizationHealthEntry {
  slotId: string;
  health: MonetizationSlotHealth;
  inventoryClass?: AdInventoryClass;
  lastFillAt?: string;
  blockedReason?: string;
}

const _slotHealth = new Map<string, MonetizationHealthEntry>();

export function reportSlotHealth(
  slotId: string,
  health: MonetizationSlotHealth,
  meta?: { inventoryClass?: AdInventoryClass; blockedReason?: string },
): void {
  _slotHealth.set(slotId, {
    slotId,
    health,
    inventoryClass: meta?.inventoryClass,
    blockedReason: meta?.blockedReason,
    lastFillAt: health === "ON" || health === "SPONSOR" ? new Date().toISOString() : undefined,
  });
}

export function getSlotHealth(slotId: string): MonetizationHealthEntry | undefined {
  return _slotHealth.get(slotId);
}

export function getMonetizationHealthSnapshot(): MonetizationHealthEntry[] {
  return Array.from(_slotHealth.values());
}

export function deriveHealthFromFill(
  slotId: string,
  hasFill: boolean,
  inventoryClass: AdInventoryClass,
  blocked?: boolean,
  blockedReason?: string,
): void {
  if (blocked) {
    reportSlotHealth(slotId, "BLOCKED", { inventoryClass, blockedReason });
    return;
  }
  if (!hasFill) {
    reportSlotHealth(slotId, "NO_FILL", { inventoryClass });
    return;
  }
  if (inventoryClass === "DIRECT_SPONSOR") {
    reportSlotHealth(slotId, "SPONSOR", { inventoryClass });
    return;
  }
  if (inventoryClass === "HOUSE_PROMO") {
    reportSlotHealth(slotId, "HOUSE", { inventoryClass });
    return;
  }
  reportSlotHealth(slotId, "ON", { inventoryClass });
}
