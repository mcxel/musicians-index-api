import type { TmiOverlayCategory } from "@/lib/store/tmiOverlayMarketplaceEngine";

export type TmiOverlayInventoryItem = {
  userId: string;
  overlayId: string;
  category: TmiOverlayCategory;
  source: "purchase" | "reward" | "gift" | "win" | "trade";
  favorite: boolean;
  archived: boolean;
  acquiredAt: number;
};

const INVENTORY: TmiOverlayInventoryItem[] = [];

export function addOverlayToInventory(item: Omit<TmiOverlayInventoryItem, "acquiredAt">): TmiOverlayInventoryItem {
  const next: TmiOverlayInventoryItem = { ...item, acquiredAt: Date.now() };
  INVENTORY.push(next);
  return next;
}

export function listOverlayInventory(userId: string): TmiOverlayInventoryItem[] {
  return INVENTORY.filter((row) => row.userId === userId && !row.archived);
}
