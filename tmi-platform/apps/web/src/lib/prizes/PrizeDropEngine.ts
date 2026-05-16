// Prize Drop Engine — catalog-based
// Supports: cash, merch, sponsor_product, nft, ticket, xp_bonus
// Complements lib/live/PrizeDropEngine.ts (event-driven drops)
// This engine owns the static prize catalog and claim routing

export type PrizeType = "cash" | "merch" | "sponsor_product" | "nft" | "ticket" | "xp_bonus";

export type PrizeDrop = {
  id: string;
  type: PrizeType;
  label: string;
  value: string;        // human-readable: "$12,500", "+500 XP", "Season 1 Kit"
  numericValue: number; // for sorting / total pool math
  sponsorId?: string;   // if type === "sponsor_product"
  contestId?: string;   // scoped to a specific contest/battle
  claimHref: string;
  isActive: boolean;
};

const PRIZE_CATALOG: PrizeDrop[] = [
  // Cash prizes
  {
    id: "crown-champion-cash",
    type: "cash",
    label: "Cypher Champion",
    value: "$12,500",
    numericValue: 12500,
    claimHref: "/rewards",
    contestId: "crown-duel-night",
    isActive: true,
  },
  {
    id: "weekly-runner-up-cash",
    type: "cash",
    label: "Weekly Runner-Up",
    value: "$5,000",
    numericValue: 5000,
    claimHref: "/rewards",
    contestId: "crown-duel-night",
    isActive: true,
  },
  {
    id: "fan-vote-winner-cash",
    type: "cash",
    label: "Fan Vote Winner",
    value: "$2,000",
    numericValue: 2000,
    claimHref: "/rewards",
    isActive: true,
  },
  {
    id: "weekly-contest-grand",
    type: "cash",
    label: "Weekly Champion Prize",
    value: "$10,000",
    numericValue: 10000,
    claimHref: "/rewards",
    contestId: "weekly-champion-contest",
    isActive: true,
  },

  // Merch prizes
  {
    id: "champion-merch-s1",
    type: "merch",
    label: "Champion Merch Drop",
    value: "TMI Season 1 Kit",
    numericValue: 150,
    claimHref: "/shop",
    contestId: "weekly-champion-contest",
    isActive: true,
  },

  // Sponsor product prizes
  {
    id: "soundwave-beat-bundle",
    type: "sponsor_product",
    label: "Beat-Making Bundle",
    value: "$850 Value",
    numericValue: 850,
    sponsorId: "soundwave-audio",
    claimHref: "/shop",
    isActive: true,
  },
  {
    id: "beatvault-starter-pack",
    type: "sponsor_product",
    label: "Artist Starter Pack",
    value: "$420 Value",
    numericValue: 420,
    sponsorId: "beatvault-pro",
    claimHref: "/shop",
    isActive: true,
  },

  // NFT prizes
  {
    id: "season1-winner-nft",
    type: "nft",
    label: "Season 1 Crown NFT",
    value: "Limited Edition",
    numericValue: 500,
    claimHref: "/rewards",
    contestId: "crown-duel-night",
    isActive: true,
  },

  // Ticket prizes
  {
    id: "vip-monday-stage-ticket",
    type: "ticket",
    label: "VIP Stage Ticket",
    value: "Monday Night Stage",
    numericValue: 200,
    claimHref: "/events/monday-night-stage",
    isActive: true,
  },

  // XP bonus prizes
  {
    id: "battle-winner-xp",
    type: "xp_bonus",
    label: "Battle XP Bonus",
    value: "+500 XP",
    numericValue: 500,
    claimHref: "/rewards",
    isActive: true,
  },
  {
    id: "fan-vote-xp",
    type: "xp_bonus",
    label: "Fan Vote XP",
    value: "+100 XP",
    numericValue: 100,
    claimHref: "/rewards",
    isActive: true,
  },
];

export function getAllPrizes(): PrizeDrop[] {
  return PRIZE_CATALOG.filter((p) => p.isActive);
}

export function getPrizesByType(type: PrizeType): PrizeDrop[] {
  return PRIZE_CATALOG.filter((p) => p.isActive && p.type === type);
}

export function getPrizesForContest(contestId: string): PrizeDrop[] {
  return PRIZE_CATALOG.filter((p) => p.isActive && p.contestId === contestId);
}

export function getSponsorPrizes(sponsorId?: string): PrizeDrop[] {
  return PRIZE_CATALOG.filter(
    (p) => p.isActive && p.type === "sponsor_product" && (sponsorId ? p.sponsorId === sponsorId : true),
  );
}

export function getTopCashPrizes(limit = 3): PrizeDrop[] {
  return getPrizesByType("cash")
    .sort((a, b) => b.numericValue - a.numericValue)
    .slice(0, limit);
}

export function getPrizeById(id: string): PrizeDrop | undefined {
  return PRIZE_CATALOG.find((p) => p.id === id);
}

export function computeTotalPrizePool(contestId?: string): number {
  const prizes = contestId ? getPrizesForContest(contestId) : getAllPrizes();
  return prizes
    .filter((p) => p.type === "cash")
    .reduce((sum, p) => sum + p.numericValue, 0);
}

export function formatPrizePool(contestId?: string): string {
  const total = computeTotalPrizePool(contestId);
  if (total >= 1000) return `$${(total / 1000).toFixed(1)}K`;
  return `$${total}`;
}
