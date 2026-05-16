/**
 * VenuePromotionEngine
 * Venue-owned event promotion system — separate from sponsor checkout logic.
 * Venues pay to boost shows: cheap tier entry, fill-the-room campaigns, genre/region targeting.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type VenueBoostTier = "starter" | "standard" | "featured" | "headline";

export type VenuePromotionStatus = "draft" | "active" | "paused" | "completed" | "expired";

export type VenueTargetRegion =
  | "local"        // within venue city
  | "regional"     // state/province
  | "national"
  | "global";

export type VenueTargetGenre =
  | "hip-hop"
  | "trap"
  | "afrobeats"
  | "r-and-b"
  | "pop"
  | "gospel"
  | "latin"
  | "dancehall"
  | "electronic"
  | "all";

export type VenuePromotionCampaign = {
  campaignId: string;
  venueId: string;
  eventId: string;
  eventTitle: string;
  boostTier: VenueBoostTier;
  status: VenuePromotionStatus;
  budgetCents: number;
  budgetDisplay: string;
  spentCents: number;
  durationDays: number;
  startDateIso: string;
  endDateIso: string;
  targetRegion: VenueTargetRegion;
  targetGenre: VenueTargetGenre;
  targetArticleCategory?: string;
  impressions: number;
  clicks: number;
  ticketClickThroughs: number;
  createdAtMs: number;
};

// ─── Boost tier pricing ───────────────────────────────────────────────────────

export type BoostTierSpec = {
  tier: VenueBoostTier;
  label: string;
  dailyBudgetCents: number;
  dailyBudgetDisplay: string;
  placements: string[];
  description: string;
};

export const VENUE_BOOST_TIERS: BoostTierSpec[] = [
  {
    tier: "starter",
    label: "Starter Boost",
    dailyBudgetCents: 500,           // $5/day
    dailyBudgetDisplay: "$5/day",
    placements: ["article-side-ad", "event-strip"],
    description: "Low-cost visibility. Article sidebar + event strip.",
  },
  {
    tier: "standard",
    label: "Standard Boost",
    dailyBudgetCents: 1500,          // $15/day
    dailyBudgetDisplay: "$15/day",
    placements: ["article-side-ad", "event-strip", "magazine-event-card"],
    description: "Magazine event card + article placement.",
  },
  {
    tier: "featured",
    label: "Featured Boost",
    dailyBudgetCents: 3500,          // $35/day
    dailyBudgetDisplay: "$35/day",
    placements: ["article-side-ad", "event-strip", "magazine-event-card", "homepage-live-promo"],
    description: "Homepage live promo + magazine + article. Fill the room.",
  },
  {
    tier: "headline",
    label: "Headline Event",
    dailyBudgetCents: 9900,          // $99/day
    dailyBudgetDisplay: "$99/day",
    placements: ["article-side-ad", "event-strip", "magazine-event-card", "homepage-live-promo", "live-room-banner"],
    description: "Full platform headline coverage. Live room banner included.",
  },
];

// ─── In-memory store ──────────────────────────────────────────────────────────

const campaigns: VenuePromotionCampaign[] = [];
let campaignCounter = 0;

function centsToDisplay(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function addDays(dateIso: string, days: number): string {
  const d = new Date(dateIso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function createVenuePromotion(input: {
  venueId: string;
  eventId: string;
  eventTitle: string;
  boostTier: VenueBoostTier;
  durationDays: number;
  targetRegion: VenueTargetRegion;
  targetGenre: VenueTargetGenre;
  targetArticleCategory?: string;
  startDateIso?: string;
}): VenuePromotionCampaign {
  const spec = VENUE_BOOST_TIERS.find((t) => t.tier === input.boostTier)!;
  const budgetCents = spec.dailyBudgetCents * input.durationDays;
  const startIso = input.startDateIso ?? new Date().toISOString().slice(0, 10);

  const campaign: VenuePromotionCampaign = {
    campaignId: `venue-promo-${++campaignCounter}-${input.eventId}`,
    venueId: input.venueId,
    eventId: input.eventId,
    eventTitle: input.eventTitle,
    boostTier: input.boostTier,
    status: "active",
    budgetCents,
    budgetDisplay: centsToDisplay(budgetCents),
    spentCents: 0,
    durationDays: input.durationDays,
    startDateIso: startIso,
    endDateIso: addDays(startIso, input.durationDays),
    targetRegion: input.targetRegion,
    targetGenre: input.targetGenre,
    targetArticleCategory: input.targetArticleCategory,
    impressions: 0,
    clicks: 0,
    ticketClickThroughs: 0,
    createdAtMs: Date.now(),
  };

  campaigns.unshift(campaign);
  return campaign;
}

export function getVenueCampaign(campaignId: string): VenuePromotionCampaign | null {
  return campaigns.find((c) => c.campaignId === campaignId) ?? null;
}

export function listVenueCampaigns(venueId: string, onlyActive = false): VenuePromotionCampaign[] {
  return campaigns.filter(
    (c) => c.venueId === venueId && (!onlyActive || c.status === "active")
  );
}

export function listEventCampaigns(eventId: string): VenuePromotionCampaign[] {
  return campaigns.filter((c) => c.eventId === eventId && c.status === "active");
}

export function listActiveCampaignsByPlacement(placement: string): VenuePromotionCampaign[] {
  return campaigns.filter((c) => {
    if (c.status !== "active") return false;
    const spec = VENUE_BOOST_TIERS.find((t) => t.tier === c.boostTier);
    return spec?.placements.includes(placement) ?? false;
  });
}

export function recordCampaignImpression(campaignId: string): void {
  const c = campaigns.find((x) => x.campaignId === campaignId);
  if (c) c.impressions += 1;
}

export function recordCampaignClick(campaignId: string, isTicketClick = false): void {
  const c = campaigns.find((x) => x.campaignId === campaignId);
  if (!c) return;
  c.clicks += 1;
  if (isTicketClick) c.ticketClickThroughs += 1;
  const spec = VENUE_BOOST_TIERS.find((t) => t.tier === c.boostTier);
  if (spec) c.spentCents = Math.min(c.spentCents + Math.round(spec.dailyBudgetCents / 100), c.budgetCents);
  if (c.spentCents >= c.budgetCents) c.status = "completed";
}

export function pauseVenueCampaign(campaignId: string): VenuePromotionCampaign {
  const c = campaigns.find((x) => x.campaignId === campaignId);
  if (!c) throw new Error(`Campaign ${campaignId} not found`);
  c.status = "paused";
  return c;
}

export function expireStaleCampaigns(): number {
  const today = new Date().toISOString().slice(0, 10);
  let count = 0;
  campaigns.forEach((c) => {
    if (c.status === "active" && c.endDateIso < today) {
      c.status = "expired";
      count++;
    }
  });
  return count;
}

export function getBoostTierSpec(tier: VenueBoostTier): BoostTierSpec {
  return VENUE_BOOST_TIERS.find((t) => t.tier === tier)!;
}
