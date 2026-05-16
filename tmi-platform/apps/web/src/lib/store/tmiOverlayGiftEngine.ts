import { addOverlayToInventory } from "@/lib/store/tmiOverlayInventoryEngine";
import type { TmiOverlayCategory } from "@/lib/store/tmiOverlayMarketplaceEngine";

export function giftOverlay(fromUserId: string, toUserId: string, overlayId: string, category: TmiOverlayCategory) {
  if (!fromUserId || !toUserId || !overlayId) {
    return { ok: false, reason: "INVALID_GIFT_REQUEST" } as const;
  }

  addOverlayToInventory({
    userId: toUserId,
    overlayId,
    category,
    source: "gift",
    favorite: false,
    archived: false,
  });

  return { ok: true } as const;
}
