import { listOverlayInventory } from "@/lib/store/tmiOverlayInventoryEngine";

type FavoriteRow = {
  userId: string;
  overlayId: string;
  createdAt: number;
};

const FAVORITES: FavoriteRow[] = [];

export function markFavorite(userId: string, overlayId: string) {
  const exists = FAVORITES.some((x) => x.userId === userId && x.overlayId === overlayId);
  if (exists) return { ok: true } as const;
  FAVORITES.push({ userId, overlayId, createdAt: Date.now() });
  return { ok: true } as const;
}

export function unmarkFavorite(userId: string, overlayId: string) {
  const i = FAVORITES.findIndex((x) => x.userId === userId && x.overlayId === overlayId);
  if (i === -1) return { ok: false, reason: "NOT_FOUND" } as const;
  FAVORITES.splice(i, 1);
  return { ok: true } as const;
}

export function listFavorites(userId: string) {
  return FAVORITES.filter((x) => x.userId === userId);
}

export function sortFavorites(userId: string, sort: "recent" | "alpha" = "recent") {
  const rows = listFavorites(userId).map((fav) => {
    const inv = listOverlayInventory(userId).find((x) => x.overlayId === fav.overlayId);
    return { ...fav, category: inv?.category ?? "overlaySkin" };
  });
  if (sort === "alpha") return rows.sort((a, b) => a.overlayId.localeCompare(b.overlayId));
  return rows.sort((a, b) => b.createdAt - a.createdAt);
}
