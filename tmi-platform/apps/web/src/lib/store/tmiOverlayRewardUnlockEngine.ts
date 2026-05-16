import { addOverlayToInventory } from "@/lib/store/tmiOverlayInventoryEngine";
import type { TmiOverlayCategory } from "@/lib/store/tmiOverlayMarketplaceEngine";

export function unlockRewardOverlay(
  userId: string,
  overlayId: string,
  category: TmiOverlayCategory,
  reason: "achievement" | "event-win" | "season-pass"
) {
  addOverlayToInventory({
    userId,
    overlayId,
    category,
    source: reason === "event-win" ? "win" : "reward",
    favorite: false,
    archived: false,
  });

  return {
    ok: true,
    reason,
    unlockedAt: Date.now(),
  } as const;
}
