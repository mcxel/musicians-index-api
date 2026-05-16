export type SponsorRoutes = {
  checkoutRoute: string;
  sponsorProfileRoute: string;
  campaignRoute: string;
  inventoryRoute: string;
};

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function buildSponsorRoutes(args: {
  sponsorId: string;
  sponsorName?: string;
  campaignId?: string;
  placementId?: string;
}): SponsorRoutes {
  const sponsorSlug = args.sponsorName ? slugify(args.sponsorName) : slugify(args.sponsorId);
  const campaignId = args.campaignId ?? `campaign-${slugify(args.sponsorId)}`;
  const placementId = args.placementId ?? "marketplace";

  return {
    checkoutRoute: `/sponsors/checkout?sponsor=${encodeURIComponent(args.sponsorId)}&placement=${encodeURIComponent(placementId)}`,
    sponsorProfileRoute: `/sponsors/profile/${sponsorSlug}`,
    campaignRoute: `/sponsors/campaigns/${campaignId}`,
    inventoryRoute: `/sponsors/inventory?placement=${encodeURIComponent(placementId)}`,
  };
}
