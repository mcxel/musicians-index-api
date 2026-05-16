import { addOverlayToInventory, listOverlayInventory } from "@/lib/store/tmiOverlayInventoryEngine";
import { getOverlayMarketplaceItem } from "@/lib/store/tmiOverlayMarketplaceEngine";

export function purchaseOverlay(userId: string, overlayId: string) {
  const item = getOverlayMarketplaceItem(overlayId);
  if (!item) return { ok: false, reason: "NOT_FOUND" } as const;
  if (item.state === "locked") return { ok: false, reason: item.lockReason ?? "LOCKED" } as const;

  const existing = listOverlayInventory(userId).find((row) => row.overlayId === overlayId);
  if (existing) return { ok: true, alreadyOwned: true } as const;

  addOverlayToInventory({
    userId,
    overlayId,
    category: item.category,
    source: "purchase",
    favorite: false,
    archived: false,
  });

  return { ok: true, alreadyOwned: false } as const;
}
