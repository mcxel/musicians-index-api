// ─── Types ────────────────────────────────────────────────────────────────────

export type RevenueParty =
  | "platform"
  | "artist"
  | "performer"
  | "venue"
  | "sponsor"
  | "big_ace"; // Marcel / TMI founder allocation

export type RevenueSplitConfig = {
  platform:   number;  // basis points (2500 = 25%)
  artist:     number;
  performer:  number;
  venue:      number;
  sponsor:    number;
  big_ace:    number;
};

export type RevenueSplitResult = {
  grossCents:   number;
  taxCents:     number;
  netCents:     number;  // gross - tax, this is what gets split
  splits: Record<RevenueParty, { bps: number; cents: number; display: string }>;
  totalSplitCents: number;
  unallocatedCents: number;
};

// ─── Split presets ────────────────────────────────────────────────────────────

export const SPLIT_PRESETS: Record<string, RevenueSplitConfig> = {
  subscription: {
    platform: 7500, artist: 0, performer: 0, venue: 0, sponsor: 0, big_ace: 2500,
  },
  tip: {
    platform: 1500, artist: 7500, performer: 0, venue: 0, sponsor: 0, big_ace: 1000,
  },
  ticket: {
    platform: 2000, artist: 3000, performer: 0, venue: 4000, sponsor: 0, big_ace: 1000,
  },
  beat: {
    platform: 2000, artist: 7000, performer: 0, venue: 0, sponsor: 0, big_ace: 1000,
  },
  nft: {
    platform: 2500, artist: 6500, performer: 0, venue: 0, sponsor: 0, big_ace: 1000,
  },
  ad: {
    platform: 3000, artist: 0, performer: 0, venue: 2000, sponsor: 0, big_ace: 5000,
  },
  booking: {
    platform: 1500, artist: 5000, performer: 0, venue: 2500, sponsor: 0, big_ace: 1000,
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function centsToDollarStr(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function calculateRevenueSplit(
  grossCents: number,
  taxCents: number,
  config: RevenueSplitConfig,
): RevenueSplitResult {
  const netCents = grossCents - taxCents;
  const parties: RevenueParty[] = ["platform", "artist", "performer", "venue", "sponsor", "big_ace"];

  const splits = {} as RevenueSplitResult["splits"];
  let totalSplitCents = 0;

  for (const party of parties) {
    const bps = config[party];
    const cents = Math.floor((netCents * bps) / 10_000);
    totalSplitCents += cents;
    splits[party] = { bps, cents, display: centsToDollarStr(cents) };
  }

  return {
    grossCents,
    taxCents,
    netCents,
    splits,
    totalSplitCents,
    unallocatedCents: netCents - totalSplitCents,
  };
}

export function calculateRevenueSplitByPreset(
  presetKey: string,
  grossCents: number,
  taxCents: number,
): RevenueSplitResult {
  const config = SPLIT_PRESETS[presetKey] ?? SPLIT_PRESETS.subscription;
  return calculateRevenueSplit(grossCents, taxCents, config);
}

export function getPartyPayout(
  presetKey: string,
  grossCents: number,
  taxCents: number,
  party: RevenueParty,
): number {
  return calculateRevenueSplitByPreset(presetKey, grossCents, taxCents).splits[party].cents;
}
