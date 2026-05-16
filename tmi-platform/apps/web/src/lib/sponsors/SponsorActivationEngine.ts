export type SponsorActivation = {
  activationId: string;
  campaignId: string;
  sponsorId: string;
  sponsorProfileId: string;
  placementId: string;
  campaignStartDateIso: string;
  campaignEndDateIso: string;
  targetGenre: string;
  targetAudience: string;
  status: "active" | "scheduled";
};

const activations: SponsorActivation[] = [];
let activationCounter = 0;

export function activatePlacementAfterPurchase(args: {
  campaignId: string;
  sponsorId: string;
  sponsorProfileId: string;
  placementId: string;
  campaignStartDateIso: string;
  campaignEndDateIso: string;
  targetGenre: string;
  targetAudience: string;
}): SponsorActivation {
  const activation: SponsorActivation = {
    activationId: `sponsor-act-${++activationCounter}`,
    campaignId: args.campaignId,
    sponsorId: args.sponsorId,
    sponsorProfileId: args.sponsorProfileId,
    placementId: args.placementId,
    campaignStartDateIso: args.campaignStartDateIso,
    campaignEndDateIso: args.campaignEndDateIso,
    targetGenre: args.targetGenre,
    targetAudience: args.targetAudience,
    status: new Date(args.campaignStartDateIso).getTime() <= Date.now() ? "active" : "scheduled",
  };

  activations.unshift(activation);
  return activation;
}

export function listSponsorActivations(): SponsorActivation[] {
  return [...activations];
}
