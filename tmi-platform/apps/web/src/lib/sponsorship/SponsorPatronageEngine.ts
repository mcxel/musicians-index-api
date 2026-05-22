// Sponsor-Performer Patronage Cycle
// $25/mo individual artist · $50/mo group · scales to Super Sponsor
// Prize split: 70% artist · 20% sponsor credit · 10% platform

export type SponsorTarget = "individual" | "group" | "venue" | "event";

export type SponsorTier = "micro" | "local" | "regional" | "major" | "super";

export type SponsorRecord = {
  sponsorId: string;
  businessName: string;
  location: string;
  artistId: string;
  targetType: SponsorTarget;
  tier: SponsorTier;
  monthlyAmountCents: number;
  activeSinceMs: number;
  nextBillingMs: number;
  impressions: number;
  clicks: number;
  associatedWins: number;       // times their artist won while they were sponsor
  status: "active" | "paused" | "cancelled" | "pending";
};

// Base monthly prices in cents (starts cheap to build trust)
// Individual: $25 base · Group: $50 base
export const SPONSOR_PRICES: Record<SponsorTarget, Record<SponsorTier, number>> = {
  individual: {
    micro:    2500,   // $25/mo  — entry level local store
    local:    5000,   // $50/mo
    regional: 10000,  // $100/mo
    major:    25000,  // $250/mo
    super:    50000,  // $500/mo
  },
  group: {
    micro:    5000,   // $50/mo  — entry for bands/groups
    local:    10000,  // $100/mo
    regional: 20000,  // $200/mo
    major:    50000,  // $500/mo
    super:    100000, // $1,000/mo
  },
  venue: {
    micro:    7500,   // $75/mo
    local:    15000,  // $150/mo
    regional: 30000,  // $300/mo
    major:    75000,  // $750/mo
    super:    150000, // $1,500/mo
  },
  event: {
    micro:    10000,  // $100/mo
    local:    20000,  // $200/mo
    regional: 40000,  // $400/mo
    major:    100000, // $1,000/mo
    super:    200000, // $2,000/mo
  },
};

// Max sponsors per artist subscription tier
export const ARTIST_SPONSOR_LIMITS: Record<string, number> = {
  free:     2,
  pro:      5,
  bronze:   10,
  silver:   15,
  gold:     20,
  platinum: 30,
  diamond:  50,
};

// Prize pool distribution on championship win
export const PRIZE_SPLIT = {
  artistPct:       0.70,  // 70% to the winning artist
  sponsorCreditPct: 0.20, // 20% as sponsor "Winner's Association" marketing credit
  platformFeePct:   0.10, // 10% platform fee
};

type ProofOfPromotionReport = {
  sponsorId: string;
  artistId: string;
  periodLabel: string;
  impressions: number;
  clicks: number;
  ctr: string;
  associatedWins: number;
  estimatedReach: number;
  nextTierSuggestion: SponsorTier | null;
};

export class SponsorPatronageEngine {
  private readonly sponsors: Map<string, SponsorRecord> = new Map();
  private idCounter = 1;

  addSponsor(
    businessName: string,
    location: string,
    artistId: string,
    targetType: SponsorTarget,
    tier: SponsorTier = "micro",
  ): SponsorRecord {
    const sponsorId = `sp-${this.idCounter++}`;
    const now = Date.now();
    const record: SponsorRecord = {
      sponsorId,
      businessName,
      location,
      artistId,
      targetType,
      tier,
      monthlyAmountCents: SPONSOR_PRICES[targetType][tier],
      activeSinceMs: now,
      nextBillingMs: now + 30 * 24 * 60 * 60 * 1000,
      impressions: 0,
      clicks: 0,
      associatedWins: 0,
      status: "active",
    };
    this.sponsors.set(sponsorId, record);
    return record;
  }

  recordImpression(sponsorId: string, clicks = 0): void {
    const s = this.sponsors.get(sponsorId);
    if (!s) return;
    s.impressions += 1;
    s.clicks += clicks;
  }

  recordWin(sponsorId: string): void {
    const s = this.sponsors.get(sponsorId);
    if (s) s.associatedWins += 1;
  }

  upgrade(sponsorId: string, newTier: SponsorTier): void {
    const s = this.sponsors.get(sponsorId);
    if (!s) return;
    s.tier = newTier;
    s.monthlyAmountCents = SPONSOR_PRICES[s.targetType][newTier];
  }

  getSponsorsForArtist(artistId: string): SponsorRecord[] {
    return Array.from(this.sponsors.values()).filter(
      (s) => s.artistId === artistId && s.status === "active",
    );
  }

  getActiveSponsorCount(artistId: string): number {
    return this.getSponsorsForArtist(artistId).length;
  }

  canAddSponsor(artistId: string, artistTier: string): boolean {
    const limit = ARTIST_SPONSOR_LIMITS[artistTier] ?? 2;
    return this.getActiveSponsorCount(artistId) < limit;
  }

  generateProofOfPromotion(sponsorId: string, periodLabel: string): ProofOfPromotionReport | null {
    const s = this.sponsors.get(sponsorId);
    if (!s) return null;
    const ctr = s.impressions > 0
      ? `${((s.clicks / s.impressions) * 100).toFixed(1)}%`
      : "0%";
    const tiers: SponsorTier[] = ["micro", "local", "regional", "major", "super"];
    const currentIdx = tiers.indexOf(s.tier);
    const nextTierSuggestion = currentIdx < tiers.length - 1 ? tiers[currentIdx + 1]! : null;
    return {
      sponsorId,
      artistId: s.artistId,
      periodLabel,
      impressions: s.impressions,
      clicks: s.clicks,
      ctr,
      associatedWins: s.associatedWins,
      estimatedReach: s.impressions * 3, // avg 3x reach multiplier
      nextTierSuggestion,
    };
  }

  splitPrize(totalCents: number): { artist: number; sponsorCredit: number; platform: number } {
    return {
      artist:        Math.floor(totalCents * PRIZE_SPLIT.artistPct),
      sponsorCredit: Math.floor(totalCents * PRIZE_SPLIT.sponsorCreditPct),
      platform:      Math.floor(totalCents * PRIZE_SPLIT.platformFeePct),
    };
  }

  formatPrice(targetType: SponsorTarget, tier: SponsorTier): string {
    const cents = SPONSOR_PRICES[targetType][tier];
    return `$${(cents / 100).toFixed(2)}/mo`;
  }
}

export const sponsorPatronageEngine = new SponsorPatronageEngine();
