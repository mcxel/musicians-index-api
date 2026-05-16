import { addOverlayToInventory, listOverlayInventory } from "@/lib/store/tmiOverlayInventoryEngine";
import type { TmiOverlayCategory } from "@/lib/store/tmiOverlayMarketplaceEngine";

export function tradeOverlay(fromUserId: string, toUserId: string, overlayId: string, category: TmiOverlayCategory) {
  const owned = listOverlayInventory(fromUserId).some((row) => row.overlayId === overlayId);
  if (!owned) return { ok: false, reason: "SOURCE_NOT_OWNER" } as const;

  addOverlayToInventory({
    userId: toUserId,
    overlayId,
    category,
    source: "trade",
    favorite: false,
    archived: false,
  });

  return { ok: true, tradedAt: Date.now() } as const;
}
