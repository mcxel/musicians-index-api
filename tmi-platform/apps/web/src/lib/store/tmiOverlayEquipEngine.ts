import type { TmiOverlayCategory } from "@/lib/store/tmiOverlayMarketplaceEngine";
import { listOverlayInventory } from "@/lib/store/tmiOverlayInventoryEngine";

export type TmiOverlaySurface =
  | "artist-profile"
  | "performer-profile"
  | "fan-dashboard"
  | "venue-stage"
  | "billboard-wall"
  | "magazine-shell"
  | "game-panel";

export type TmiEquippedOverlay = {
  userId: string;
  overlayId: string;
  category: TmiOverlayCategory;
  surface: TmiOverlaySurface;
  equippedAt: number;
};

const EQUIPPED: TmiEquippedOverlay[] = [];

export function equipOverlay(
  userId: string,
  overlayId: string,
  category: TmiOverlayCategory,
  surface: TmiOverlaySurface
) {
  const owned = listOverlayInventory(userId).some((row) => row.overlayId === overlayId);
  if (!owned) return { ok: false, reason: "NOT_OWNED" } as const;

  const filtered = EQUIPPED.filter((row) => !(row.userId === userId && row.surface === surface));
  EQUIPPED.length = 0;
  EQUIPPED.push(...filtered, { userId, overlayId, category, surface, equippedAt: Date.now() });

  return { ok: true } as const;
}

export function listEquippedOverlays(userId: string): TmiEquippedOverlay[] {
  return EQUIPPED.filter((row) => row.userId === userId);
}
