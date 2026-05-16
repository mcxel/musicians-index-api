import { getMagazineArticleBySlug } from "./MagazineArticleResolver";

export interface MagazineSponsorSlot {
  sponsorId: string;
  sponsorLabel: string;
  route: string;
  attached: boolean;
}

export function getMagazineSponsorSlot(slug: string): MagazineSponsorSlot {
  const article = getMagazineArticleBySlug(slug);
  const attached = Boolean(article?.sponsorAttached);

  return {
    sponsorId: attached ? `${slug}-sponsor` : "open-sponsor",
    sponsorLabel: attached ? "Attached Sponsor" : "Open Sponsor Slot",
    route: "/sponsors",
    attached,
  };
}
