/**
 * EventPromotionUpsellEngine
 * Upsell packages shown right after event creation.
 * Connects ticketing to magazine/news/live placement promotion (separate from sponsor logic).
 */

export type EventUpsellPackageId = "boost-5" | "boost-15" | "boost-35" | "boost-99";

export type EventPromotionUpsellPackage = {
  packageId: EventUpsellPackageId;
  label: string;
  priceCents: number;
  priceDisplay: string;
  placements: Array<"magazine" | "news" | "article" | "live">;
  durationDays: number;
  priorityWeight: number;
};

export type EventPromotionUpsellSelection = {
  selectionId: string;
  eventId: string;
  hostId: string;
  packageId: EventUpsellPackageId;
  status: "selected" | "paid" | "cancelled";
  selectedAtMs: number;
};

const PACKAGES: EventPromotionUpsellPackage[] = [
  {
    packageId: "boost-5",
    label: "Starter Magazine Boost",
    priceCents: 500,
    priceDisplay: "$5",
    placements: ["article"],
    durationDays: 3,
    priorityWeight: 10,
  },
  {
    packageId: "boost-15",
    label: "Standard News + Magazine",
    priceCents: 1500,
    priceDisplay: "$15",
    placements: ["magazine", "news", "article"],
    durationDays: 7,
    priorityWeight: 30,
  },
  {
    packageId: "boost-35",
    label: "Featured Live Feed Boost",
    priceCents: 3500,
    priceDisplay: "$35",
    placements: ["magazine", "news", "article", "live"],
    durationDays: 10,
    priorityWeight: 60,
  },
  {
    packageId: "boost-99",
    label: "Headline Event Dominance",
    priceCents: 9900,
    priceDisplay: "$99",
    placements: ["magazine", "news", "article", "live"],
    durationDays: 21,
    priorityWeight: 95,
  },
];

const selections: EventPromotionUpsellSelection[] = [];
let selectionCounter = 0;

export function listEventPromotionUpsellPackages(): EventPromotionUpsellPackage[] {
  return [...PACKAGES];
}

export function getEventPromotionUpsellPackage(
  packageId: EventUpsellPackageId
): EventPromotionUpsellPackage {
  return PACKAGES.find((item) => item.packageId === packageId)!;
}

export function createEventPromotionUpsellSelection(input: {
  eventId: string;
  hostId: string;
  packageId: EventUpsellPackageId;
}): EventPromotionUpsellSelection {
  const selection: EventPromotionUpsellSelection = {
    selectionId: `event-upsell-${++selectionCounter}`,
    eventId: input.eventId,
    hostId: input.hostId,
    packageId: input.packageId,
    status: "selected",
    selectedAtMs: Date.now(),
  };
  selections.unshift(selection);
  return selection;
}

export function markEventPromotionUpsellPaid(selectionId: string): EventPromotionUpsellSelection {
  const selection = selections.find((item) => item.selectionId === selectionId);
  if (!selection) throw new Error(`Upsell selection ${selectionId} not found`);
  selection.status = "paid";
  return selection;
}

export function cancelEventPromotionUpsell(selectionId: string): EventPromotionUpsellSelection {
  const selection = selections.find((item) => item.selectionId === selectionId);
  if (!selection) throw new Error(`Upsell selection ${selectionId} not found`);
  selection.status = "cancelled";
  return selection;
}

export function listEventPromotionUpsells(eventId: string): EventPromotionUpsellSelection[] {
  return selections.filter((item) => item.eventId === eventId);
}
