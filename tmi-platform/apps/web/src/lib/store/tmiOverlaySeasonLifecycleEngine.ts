import { listSeasonalOverlaysByShelf, type TmiOverlaySeasonShelf } from "@/lib/store/tmiOverlaySeasonalEngine";

export type TmiOverlaySeasonLifecycleState = {
  overlayId: string;
  shelf: TmiOverlaySeasonShelf;
  activationAt?: number;
  expiresAt?: number;
  returnAt?: number;
  rarityMutation?: "none" | "upgraded" | "event-variant";
  votesToReturn?: number;
  adminPinned?: boolean;
  seasonId?: string;
  retiredReason?: string;
  mutationLevel?: number;
  refundEligibleUntil?: number;
  refundStatus?: "none" | "requested" | "completed";
};

const LIFECYCLE: TmiOverlaySeasonLifecycleState[] = [];

export function seedSeasonLifecycleFromShelves() {
  const shelves: TmiOverlaySeasonShelf[] = ["active", "retired", "returning", "event"];
  for (const shelf of shelves) {
    const rows = listSeasonalOverlaysByShelf(shelf);
    for (const row of rows) {
      if (LIFECYCLE.some((x) => x.overlayId === row.overlayId)) continue;
      LIFECYCLE.push({
        overlayId: row.overlayId,
        shelf,
        activationAt: Date.now(),
        rarityMutation: shelf === "event" ? "event-variant" : "none",
        votesToReturn: 0,
        adminPinned: false,
        seasonId: row.seasonTag,
        retiredReason: shelf === "retired" ? "SEASON_ENDED" : undefined,
        mutationLevel: 1,
        refundEligibleUntil: Date.now() + 1000 * 60 * 60 * 24 * 7,
        refundStatus: "none",
      });
    }
  }
  return LIFECYCLE;
}

export function adminForceReturn(overlayId: string) {
  const target = LIFECYCLE.find((x) => x.overlayId === overlayId);
  if (!target) return { ok: false, reason: "NOT_FOUND" } as const;
  target.shelf = "returning";
  target.returnAt = Date.now();
  return { ok: true } as const;
}

export function listSeasonLifecycle() {
  return LIFECYCLE;
}
