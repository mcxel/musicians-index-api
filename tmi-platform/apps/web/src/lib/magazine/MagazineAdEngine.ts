import { getMagazineArticleBySlug } from "./MagazineArticleResolver";

export interface MagazineAdSlot {
  slotId: string;
  label: string;
  ctaRoute: string;
  sponsorName: string;
}

export function getMagazineAdSlots(slug: string): MagazineAdSlot[] {
  const article = getMagazineArticleBySlug(slug);
  if (!article || !article.monetized) return [];

  return [
    {
      slotId: `${slug}-top-ad`,
      label: "Top Banner",
      ctaRoute: "/ads/create",
      sponsorName: article.sponsorAttached ? "Featured Partner" : "Open Inventory",
    },
    {
      slotId: `${slug}-mid-ad`,
      label: "Mid Article",
      ctaRoute: "/ads/inventory",
      sponsorName: "TMI Ad Network",
    },
  ];
}
