/**
 * SponsorVisibilityWeightEngine
 * Creates sponsor priority ranking based on total spend and performance.
 * Higher spend = more placement priority.
 * Higher ROI = better placement.
 * Higher artist count = wider spread.
 */

export type VisibilityTier = "starter" | "boosted" | "featured" | "headline" | "title";

export interface SponsorVisibilityScore {
  sponsorId: string;
  visibilityWeight: number;
  sponsorPriorityScore: number;
  visibilityTier: VisibilityTier;
  placements: {
    homepageRailPriority: number;
    showOutroPriority: number;
    articleSponsorPriority: number;
    contestSponsorPriority: number;
    giveawayPriority: number;
  };
}

export interface SponsorVisibilityInputs {
  sponsorId: string;
  totalSpendCents: number;
  campaignPerformanceScore: number; // e.g., 0-100 (representing ROI/Performance)
  activeCampaignsCount: number;
  artistSponsorshipCount: number;
  merchantProductCount: number;
}

export class SponsorVisibilityWeightEngine {
  static calculateVisibility(inputs: SponsorVisibilityInputs): SponsorVisibilityScore {
    // Base weight from spend (1 point per $100 spent)
    const spendWeight = Math.floor(inputs.totalSpendCents / 10000);
    
    // Performance multiplier (up to 1.5x based on campaign success / ROI)
    const perfMultiplier = 1 + (inputs.campaignPerformanceScore / 200);
    
    // Activity spread bonuses
    const activeBonus = inputs.activeCampaignsCount * 10;
    const artistBonus = inputs.artistSponsorshipCount * 15;
    const productBonus = inputs.merchantProductCount * 5;
    
    const rawScore = (spendWeight + activeBonus + artistBonus + productBonus) * perfMultiplier;
    const sponsorPriorityScore = Math.round(rawScore);
    const visibilityWeight = sponsorPriorityScore;
    
    // Determine tier
    let tier: VisibilityTier = "starter";
    if (sponsorPriorityScore > 10000) tier = "title";
    else if (sponsorPriorityScore > 5000) tier = "headline";
    else if (sponsorPriorityScore > 1000) tier = "featured";
    else if (sponsorPriorityScore > 200) tier = "boosted";

    return {
      sponsorId: inputs.sponsorId,
      visibilityWeight,
      sponsorPriorityScore,
      visibilityTier: tier,
      placements: {
        // Higher artist count ensures a wider spread across articles
        articleSponsorPriority: Math.round(sponsorPriorityScore * 0.8 + (inputs.artistSponsorshipCount * 10)),
        // Spend significantly dictates homepage and contest presence
        homepageRailPriority: sponsorPriorityScore,
        contestSponsorPriority: Math.round(sponsorPriorityScore * 1.5),
        // Active campaigns feed into show outros and giveaways
        showOutroPriority: Math.round(sponsorPriorityScore * 1.2 + (inputs.activeCampaignsCount * 20)),
        giveawayPriority: Math.round(sponsorPriorityScore + (inputs.merchantProductCount * 15)),
      }
    };
  }
}