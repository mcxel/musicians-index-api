export type SponsorPricingModel = "cpm" | "flat";

export type SponsorPlacementInventory = {
  placementId: string;
  placementLabel: string;
  pricingModel: SponsorPricingModel;
  cpmCents?: number;
  flatPriceCents?: number;
  quantityTotal: number;
  quantityReserved: number;
  reservationWindowMinutes: number;
  reservationExpiresAtMs?: number;
};

export type SponsorPlacementInventoryStatus = {
  placementId: string;
  placementLabel: string;
  pricingModel: SponsorPricingModel;
  priceCents: number;
  availableQuantity: number;
  soldOut: boolean;
  reservationWindowMinutes: number;
  reservationExpiresAtMs?: number;
};

const inventory: SponsorPlacementInventory[] = [
  {
    placementId: "homepage-banner",
    placementLabel: "Homepage Banner",
    pricingModel: "cpm",
    cpmCents: 1200,
    quantityTotal: 3,
    quantityReserved: 2,
    reservationWindowMinutes: 45,
  },
  {
    placementId: "video-pre-roll",
    placementLabel: "Video Pre-Roll",
    pricingModel: "flat",
    flatPriceCents: 220000,
    quantityTotal: 4,
    quantityReserved: 1,
    reservationWindowMinutes: 30,
  },
  {
    placementId: "artist-profile-ad",
    placementLabel: "Artist Profile Ad",
    pricingModel: "cpm",
    cpmCents: 900,
    quantityTotal: 12,
    quantityReserved: 5,
    reservationWindowMinutes: 60,
  },
  {
    placementId: "live-room-overlay",
    placementLabel: "Live Room Overlay",
    pricingModel: "flat",
    flatPriceCents: 180000,
    quantityTotal: 6,
    quantityReserved: 3,
    reservationWindowMinutes: 30,
  },
];

function resolvePriceCents(entry: SponsorPlacementInventory): number {
  if (entry.pricingModel === "cpm") return entry.cpmCents ?? 0;
  return entry.flatPriceCents ?? 0;
}

export function listSponsorPlacementInventory(): SponsorPlacementInventoryStatus[] {
  return inventory.map((entry) => {
    const availableQuantity = Math.max(0, entry.quantityTotal - entry.quantityReserved);
    return {
      placementId: entry.placementId,
      placementLabel: entry.placementLabel,
      pricingModel: entry.pricingModel,
      priceCents: resolvePriceCents(entry),
      availableQuantity,
      soldOut: availableQuantity === 0,
      reservationWindowMinutes: entry.reservationWindowMinutes,
      reservationExpiresAtMs: entry.reservationExpiresAtMs,
    };
  });
}

export function reservePlacementInventory(placementId: string, quantity: number): SponsorPlacementInventoryStatus {
  const entry = inventory.find((item) => item.placementId === placementId);
  if (!entry) {
    throw new Error("Placement inventory not found");
  }

  const availableQuantity = Math.max(0, entry.quantityTotal - entry.quantityReserved);
  if (quantity <= 0 || quantity > availableQuantity) {
    throw new Error("Insufficient inventory for reservation");
  }

  entry.quantityReserved += quantity;
  entry.reservationExpiresAtMs = Date.now() + entry.reservationWindowMinutes * 60 * 1000;

  const nextAvailable = Math.max(0, entry.quantityTotal - entry.quantityReserved);
  return {
    placementId: entry.placementId,
    placementLabel: entry.placementLabel,
    pricingModel: entry.pricingModel,
    priceCents: resolvePriceCents(entry),
    availableQuantity: nextAvailable,
    soldOut: nextAvailable === 0,
    reservationWindowMinutes: entry.reservationWindowMinutes,
    reservationExpiresAtMs: entry.reservationExpiresAtMs,
  };
}
