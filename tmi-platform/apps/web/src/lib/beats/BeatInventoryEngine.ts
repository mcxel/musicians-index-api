import type { BeatLicenseType } from "@/lib/beats/BeatStoreCommerceEngine";

// ─── Types ────────────────────────────────────────────────────────────────────

export type BeatInventoryEntry = {
  beatId: string;
  license: BeatLicenseType;
  totalSlots: number;
  claimedSlots: number;
  availableSlots: number;
  priceCents: number;
  available: boolean;
};

export type BeatDropInventory = {
  beatId: string;
  tiers: BeatInventoryEntry[];
  hasAvailability: boolean;
  cheapestCents: number;
  cheapestLabel: string;
};

// ─── In-memory ownership registry (per session; DB-backed in prod) ─────────────

const _ownership = new Map<string, Set<string>>(); // beatId → Set<userId>

export function claimBeatSlot(beatId: string, userId: string, license: BeatLicenseType): boolean {
  const key = `${beatId}::${license}`;
  const owners = _ownership.get(key) ?? new Set<string>();
  if (license === "exclusive" && owners.size >= 1) return false; // exclusive: one owner
  owners.add(userId);
  _ownership.set(key, owners);
  return true;
}

export function userOwnsBeat(beatId: string, userId: string, license: BeatLicenseType): boolean {
  const key = `${beatId}::${license}`;
  return _ownership.get(key)?.has(userId) ?? false;
}

/**
 * Has this beat's exclusive slot been claimed? CompetitionMusicEngine must
 * consult this before offering a beat for battle/cypher use — an exclusive
 * marketplace sale should block competition use, never silently coexist
 * with it. Locked 2026-06-19 by Marcel Dickens after the beat/store
 * architecture audit found zero cross-checking between the marketplace and
 * competition beat registries.
 */
export function isBeatExclusivelySold(beatId: string): boolean {
  const key = `${beatId}::exclusive`;
  return (_ownership.get(key)?.size ?? 0) > 0;
}

// ─── Inventory snapshot ───────────────────────────────────────────────────────

const LICENSE_SLOTS: Record<BeatLicenseType, number> = {
  non_exclusive: 999, // virtually unlimited
  exclusive:     1,
  stems:         10,
  unlimited:     5,
};

function countClaimed(beatId: string, license: BeatLicenseType): number {
  const key = `${beatId}::${license}`;
  return _ownership.get(key)?.size ?? 0;
}

/**
 * Build a live inventory snapshot for a beat drop, showing tier availability
 * and purchase state based on the current registry.
 */
export function buildBeatDropInventory(
  beatId: string,
  prices: Partial<Record<BeatLicenseType, number>>,
): BeatDropInventory {
  const allLicenses: BeatLicenseType[] = ["non_exclusive", "stems", "unlimited", "exclusive"];
  const tiers: BeatInventoryEntry[] = allLicenses.map((license) => {
    const totalSlots = LICENSE_SLOTS[license];
    const claimedSlots = countClaimed(beatId, license);
    const availableSlots = Math.max(0, totalSlots - claimedSlots);
    const priceCents = prices[license] ?? 0;
    return {
      beatId,
      license,
      totalSlots,
      claimedSlots,
      availableSlots,
      priceCents,
      available: availableSlots > 0 && priceCents > 0,
    };
  });

  const available = tiers.filter((t) => t.available);
  const cheapestEntry = available.sort((a, b) => a.priceCents - b.priceCents)[0];
  const cheapestCents = cheapestEntry?.priceCents ?? 0;
  const cheapestLabel = cheapestCents > 0 ? `from $${(cheapestCents / 100).toFixed(2)}` : "Unavailable";

  return {
    beatId,
    tiers,
    hasAvailability: available.length > 0,
    cheapestCents,
    cheapestLabel,
  };
}
