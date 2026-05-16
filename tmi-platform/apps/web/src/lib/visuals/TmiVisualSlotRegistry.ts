/**
 * TmiVisualSlotRegistry
 * Tracks active visual slots, priorities, and assigned badges across the platform.
 */

export type VisualSlot = {
  slotId: string;
  owner: string;
  route: string;
  images: string[];
  priority: number;
  badge: "LIVE" | "HOT" | "NEW" | "TRENDING" | "FEATURED" | "SPONSORED";
};

const slotRegistry: Map<string, VisualSlot> = new Map();

const PLACEHOLDER_PATTERNS = [/placeholder/i, /stub/i, /temp/i, /dummy/i, /stock/i, /example\.com/i];

export function registerVisualSlot(slot: VisualSlot) {
  slotRegistry.set(slot.slotId, slot);
}

export function upsertVisualSlot(slot: VisualSlot): VisualSlot {
  slotRegistry.set(slot.slotId, slot);
  return slot;
}

export function getVisualSlot(slotId: string): VisualSlot | undefined {
  return slotRegistry.get(slotId);
}

export function listVisualSlots(): VisualSlot[] {
  return [...slotRegistry.values()];
}

export function isPlaceholderVisualRef(ref: string): boolean {
  return PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(ref));
}