import type { PageId } from "./VisualOwnershipMap";

export interface PageZones {
  heroZone: boolean;
  secondaryZone: boolean;
  ambientZone: boolean;
  promoZone: boolean;
}

export function resolvePageZones(pageId: PageId): PageZones {
  switch (pageId) {
    case "cover":
    case "home1":
      return { heroZone: true, secondaryZone: false, ambientZone: true, promoZone: false };
    case "home1-2":
      return { heroZone: true, secondaryZone: true, ambientZone: true, promoZone: true };
    case "home2":
      return { heroZone: true, secondaryZone: true, ambientZone: false, promoZone: true };
    case "home3":
      return { heroZone: true, secondaryZone: true, ambientZone: true, promoZone: true };
    case "home4":
      return { heroZone: true, secondaryZone: true, ambientZone: false, promoZone: true };
    case "home5":
      return { heroZone: true, secondaryZone: true, ambientZone: true, promoZone: true };
    case "games":
      return { heroZone: true, secondaryZone: true, ambientZone: true, promoZone: false };
    default:
      return { heroZone: true, secondaryZone: true, ambientZone: true, promoZone: true };
  }
}