export type TmiOverlaySeasonShelf = "active" | "retired" | "returning" | "event";

export type TmiSeasonalOverlayItem = {
  overlayId: string;
  seasonTag: string;
  shelf: TmiOverlaySeasonShelf;
};

const SEASONAL_ITEMS: TmiSeasonalOverlayItem[] = [
  { overlayId: "ovr-profile-neon-v1", seasonTag: "spring", shelf: "active" },
  { overlayId: "ovr-homepage-starburst-legend", seasonTag: "championship", shelf: "event" },
];

export function listSeasonalOverlaysByShelf(shelf: TmiOverlaySeasonShelf): TmiSeasonalOverlayItem[] {
  return SEASONAL_ITEMS.filter((row) => row.shelf === shelf);
}
