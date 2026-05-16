// MagazineContributorPayoutEngine
// Dynamic tier payout system.
// Base + revenue share + engagement bonus. Fraud-resistant.

export type ContentType = "short-article" | "feature-article" | "interview" | "cartoon" | "audio-story" | "visual-story" | "poll";

export interface ContributorPayoutInput {
  contributorId: string;
  contentType: ContentType;
  reads: number;
  completionRate: number;      // 0–1
  uniqueReaders: number;
  artistProfileClicks: number;
  followsGenerated: number;
  tipsGenerated: number;
  adRevenue: number;           // $ from ad slots attributed to this content
  trustScore: number;          // 0–100 from ContributorTrustGateEngine
}

export interface ContributorPayoutResult {
  contributorId: string;
  basePay: number;
  engagementBonus: number;
  revenueShare: number;
  totalPayout: number;
  cappedAt?: number;
  fraudFlagged: boolean;
}

// Base pay by content type
const BASE_PAY: Record<ContentType, number> = {
  "short-article":  5.00,
  "feature-article": 20.00,
  "interview":       25.00,
  "cartoon":         15.00,
  "audio-story":     12.00,
  "visual-story":    12.00,
  "poll":             3.00,
};

const REVENUE_SHARE_RATE = 0.30; // 30% of attributed ad revenue
const PAYOUT_CAP = 500.00;       // per content piece

// Engagement bonus tiers
function computeEngagementBonus(input: ContributorPayoutInput): number {
  let bonus = 0;
  if (input.uniqueReaders >= 5000) bonus += 15;
  else if (input.uniqueReaders >= 1000) bonus += 8;
  else if (input.uniqueReaders >= 200) bonus += 3;

  if (input.completionRate >= 0.8) bonus += 5;
  else if (input.completionRate >= 0.6) bonus += 2;

  if (input.artistProfileClicks >= 100) bonus += 5;
  if (input.followsGenerated >= 50) bonus += 5;
  if (input.tipsGenerated >= 10) bonus += 3;

  return bonus;
}

// Fraud detection: raw-click-only payout or trust score too low
function detectFraud(input: ContributorPayoutInput): boolean {
  if (input.trustScore < 20) return true;
  // Suspicious: very high reads but near-zero completion (bot traffic)
  if (input.reads > 10_000 && input.completionRate < 0.05) return true;
  return false;
}

export function calculatePayout(input: ContributorPayoutInput): ContributorPayoutResult {
  const fraudFlagged = detectFraud(input);
  if (fraudFlagged) {
    return {
      contributorId: input.contributorId,
      basePay: 0,
      engagementBonus: 0,
      revenueShare: 0,
      totalPayout: 0,
      fraudFlagged: true,
    };
  }

  const basePay = BASE_PAY[input.contentType] ?? 5;
  const engagementBonus = computeEngagementBonus(input);
  const revenueShare = input.adRevenue * REVENUE_SHARE_RATE;

  const raw = basePay + engagementBonus + revenueShare;
  const totalPayout = Math.min(raw, PAYOUT_CAP);

  return {
    contributorId: input.contributorId,
    basePay,
    engagementBonus,
    revenueShare,
    totalPayout,
    cappedAt: raw > PAYOUT_CAP ? PAYOUT_CAP : undefined,
    fraudFlagged: false,
  };
}

export function batchPayouts(inputs: ContributorPayoutInput[]): ContributorPayoutResult[] {
  return inputs.map(calculatePayout);
}
