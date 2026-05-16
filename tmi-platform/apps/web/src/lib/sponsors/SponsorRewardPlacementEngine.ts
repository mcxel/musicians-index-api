// SponsorRewardPlacementEngine
// Sponsors who fund battle/cypher/contest prizes earn proportional ad placement priority.
// Higher prize value = higher ad tier.
// Revenue loop: Sponsor gives value → platform gives visibility.

export type SponsorTier = "bronze" | "silver" | "gold" | "premium" | "billboard";

export type SponsorPrizeDonation = {
  donationId: string;
  sponsorId: string;
  sponsorName: string;
  eventType: "battle" | "cypher" | "contest" | "fan_giveaway" | "livestream";
  eventId: string;
  prizeValueUsd: number;    // cash value of donated prize
  donationMethod: "cash" | "product" | "service" | "gift_card";
  status: "pending" | "confirmed" | "distributed";
  createdAt: number;
};

export type PlacementSlot = {
  slotId: string;
  slotType: "homepage_banner" | "hero_billboard" | "featured_slot" | "sidebar" | "cypher_chip" | "battle_badge" | "newsletter" | "store_overlay";
  tier: SponsorTier;
  durationDays: number;
  impressionsEstimate: number;
  positionLabel: string;
  isAvailable: boolean;
};

export type SponsorCampaignEarned = {
  sponsorId: string;
  sponsorName: string;
  tier: SponsorTier;
  slotsEarned: PlacementSlot[];
  totalPrizeValueUsd: number;
  campaignStartMs: number;
  campaignEndMs: number;
  impressionsDelivered: number;
  clicksDelivered: number;
};

// ── Tier thresholds ───────────────────────────────────────────────────────────
// Bronze:   $1–$499  → 1 sidebar slot (7 days)
// Silver:   $500–$1999 → 1 featured slot (14 days)
// Gold:     $2000–$4999 → 1 featured + 1 cypher chip (21 days)
// Premium:  $5000–$9999 → hero billboard (30 days)
// Billboard: $10000+ → homepage hero + editorial feature (60 days)

const TIER_RULES: Array<{ minUsd: number; maxUsd: number; tier: SponsorTier; slotTypes: PlacementSlot["slotType"][]; days: number }> = [
  { minUsd: 1,      maxUsd: 499,   tier: "bronze",    slotTypes: ["sidebar"],                               days: 7 },
  { minUsd: 500,    maxUsd: 1999,  tier: "silver",    slotTypes: ["featured_slot"],                         days: 14 },
  { minUsd: 2000,   maxUsd: 4999,  tier: "gold",      slotTypes: ["featured_slot", "cypher_chip"],          days: 21 },
  { minUsd: 5000,   maxUsd: 9999,  tier: "premium",   slotTypes: ["hero_billboard", "battle_badge"],        days: 30 },
  { minUsd: 10000,  maxUsd: Infinity, tier: "billboard", slotTypes: ["hero_billboard", "homepage_banner", "newsletter"], days: 60 },
];

const IMPRESSIONS_BY_SLOT: Record<PlacementSlot["slotType"], number> = {
  homepage_banner: 85000,
  hero_billboard:  120000,
  featured_slot:   42000,
  sidebar:         18000,
  cypher_chip:     28000,
  battle_badge:    22000,
  newsletter:      15000,
  store_overlay:   9000,
};

// In-memory stores
const _donations: SponsorPrizeDonation[] = [];
const _campaigns: Record<string, SponsorCampaignEarned> = {};
let _counter = 0;

// ── Helpers ───────────────────────────────────────────────────────────────────

function resolveTier(totalUsd: number): typeof TIER_RULES[0] | null {
  return TIER_RULES.find((r) => totalUsd >= r.minUsd && totalUsd <= r.maxUsd) ?? null;
}

function buildSlots(rule: typeof TIER_RULES[0]): PlacementSlot[] {
  return rule.slotTypes.map((slotType, i) => ({
    slotId: `slot-${++_counter}-${slotType}`,
    slotType,
    tier: rule.tier,
    durationDays: rule.days,
    impressionsEstimate: IMPRESSIONS_BY_SLOT[slotType] ?? 10000,
    positionLabel: slotType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    isAvailable: i === 0, // first slot immediately available; others staged
  }));
}

// ── Core API ──────────────────────────────────────────────────────────────────

export function registerPrizeDonation(
  sponsorId: string,
  sponsorName: string,
  eventType: SponsorPrizeDonation["eventType"],
  eventId: string,
  prizeValueUsd: number,
  donationMethod: SponsorPrizeDonation["donationMethod"] = "cash",
): SponsorPrizeDonation {
  const donation: SponsorPrizeDonation = {
    donationId: `don-${++_counter}`,
    sponsorId, sponsorName, eventType, eventId, prizeValueUsd, donationMethod,
    status: "pending",
    createdAt: Date.now(),
  };
  _donations.push(donation);
  return donation;
}

export function confirmDonation(donationId: string): SponsorCampaignEarned | null {
  const donation = _donations.find((d) => d.donationId === donationId);
  if (!donation || donation.status !== "pending") return null;
  donation.status = "confirmed";

  // Calculate total for this sponsor
  const totalUsd = _donations
    .filter((d) => d.sponsorId === donation.sponsorId && d.status === "confirmed")
    .reduce((s, d) => s + d.prizeValueUsd, 0);

  const rule = resolveTier(totalUsd);
  if (!rule) return null;

  const slots = buildSlots(rule);
  const now = Date.now();
  const campaign: SponsorCampaignEarned = {
    sponsorId: donation.sponsorId,
    sponsorName: donation.sponsorName,
    tier: rule.tier,
    slotsEarned: slots,
    totalPrizeValueUsd: totalUsd,
    campaignStartMs: now,
    campaignEndMs: now + rule.days * 24 * 60 * 60 * 1000,
    impressionsDelivered: 0,
    clicksDelivered: 0,
  };

  _campaigns[donation.sponsorId] = campaign;
  return campaign;
}

export function getCampaign(sponsorId: string): SponsorCampaignEarned | undefined {
  return _campaigns[sponsorId];
}

export function getAllCampaigns(): SponsorCampaignEarned[] {
  return Object.values(_campaigns);
}

export function getActiveCampaigns(): SponsorCampaignEarned[] {
  const now = Date.now();
  return getAllCampaigns().filter((c) => c.campaignEndMs > now);
}

export function recordImpression(sponsorId: string): void {
  const c = _campaigns[sponsorId];
  if (c) c.impressionsDelivered += 1;
}

export function recordClick(sponsorId: string): void {
  const c = _campaigns[sponsorId];
  if (c) c.clicksDelivered += 1;
}

export function getTierLabel(tier: SponsorTier): string {
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}

export function getPrizeCreditText(sponsorId: string): string {
  const c = _campaigns[sponsorId];
  if (!c) return "";
  return `${c.sponsorName} earned ${c.slotsEarned.length} slot${c.slotsEarned.length > 1 ? "s" : ""} by funding $${c.totalPrizeValueUsd.toLocaleString()} in rewards.`;
}

// ── Placement inventory (all possible slots for the marketplace) ──────────────

export type PlacementInventoryItem = {
  slotType: PlacementSlot["slotType"];
  label: string;
  impressions: number;
  weeklyPrice: number;  // USD
  available: number;
  icon: string;
};

export const PLACEMENT_INVENTORY: PlacementInventoryItem[] = [
  { slotType: "homepage_banner",  label: "Homepage Banner",   impressions: 85000,  weeklyPrice: 1200, available: 2, icon: "🏠" },
  { slotType: "hero_billboard",   label: "Hero Billboard",    impressions: 120000, weeklyPrice: 2500, available: 1, icon: "📺" },
  { slotType: "featured_slot",    label: "Featured Slot",     impressions: 42000,  weeklyPrice: 600,  available: 4, icon: "⭐" },
  { slotType: "sidebar",          label: "Sidebar Ad",        impressions: 18000,  weeklyPrice: 200,  available: 6, icon: "📌" },
  { slotType: "cypher_chip",      label: "Cypher Chip",       impressions: 28000,  weeklyPrice: 350,  available: 8, icon: "⬤" },
  { slotType: "battle_badge",     label: "Battle Badge",      impressions: 22000,  weeklyPrice: 280,  available: 8, icon: "⚔️" },
  { slotType: "newsletter",       label: "Newsletter Feature", impressions: 15000, weeklyPrice: 400,  available: 3, icon: "📧" },
  { slotType: "store_overlay",    label: "Store Overlay",     impressions: 9000,   weeklyPrice: 150,  available: 5, icon: "🛍️" },
];
