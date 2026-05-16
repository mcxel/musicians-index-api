import { getDefaultRoyaltySplit } from "@/lib/tickets/ticketCore";

export function TicketRoyaltyEngine(faceValue: number) {
  const split = getDefaultRoyaltySplit();
  const creatorRoyalty = (faceValue * split.creatorRoyaltyPct) / 100;
  const sponsorShare = (faceValue * split.sponsorSplitPct) / 100;
  const venueCut = (faceValue * split.venueCutPct) / 100;
  const platformCut = (faceValue * split.platformPct) / 100;

  return {
    split,
    creatorRoyalty,
    sponsorShare,
    venueCut,
    platformCut,
    total: creatorRoyalty + sponsorShare + venueCut + platformCut,
  };
}
