import type { BeatLicenseType } from "@/lib/beats/BeatStoreCommerceEngine";
// ─── Types ───

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

// ─── In-memory ownership registry (fast local cache) ───

const _ownership = new Map<string, Set<string>>(); // beatId -> Set<userId>

export function claimBeatSlot(beatId: string, userId: string, license: BeatLicenseType): boolean {
  const key = `${beatId}::${license}`;
  const owners = _ownership.get(key) ?? new Set<string>();
  if (license === "exclusive" && owners.size >= 1) return false; // exclusive: one owner
  owners.add(userId);
  _ownership.set(key, owners);
  return true;
}

export function releaseBeatSlot(beatId: string, userId: string, license: BeatLicenseType): boolean {
  const key = `${beatId}::${license}`;
  const owners = _ownership.get(key);
  if (!owners) return false;
  const deleted = owners.delete(userId);
  if (owners.size === 0) _ownership.delete(key);
  return deleted;
}

export function userOwnsBeat(beatId: string, userId: string, license: BeatLicenseType): boolean {
  const key = `${beatId}::${license}`;
  return _ownership.get(key)?.has(userId) ?? false;
}

/**
 * Synchronous fast check for exclusive sale.
 */
export function isBeatExclusivelySold(beatId: string): boolean {
  const key = `${beatId}::exclusive`;
  return (_ownership.get(key)?.size ?? 0) > 0;
}

/**
 * Durable DB-backed check for exclusive sale (Batch 1 Convergence).
 * Survives serverless API restarts, process recycles, and multi-tenant nodes.
 * Consults prisma.beat and prisma.beatLicense directly and hydrates the in-memory cache.
 */
async function getPrisma() {
  const mod = await import("@/lib/prisma");
  return mod.prisma || mod.default;
}

export async function isBeatExclusivelySoldDurable(beatId: string): Promise<boolean> {
  // 1. Fast cache check
  if (isBeatExclusivelySold(beatId)) return true;

  try {
    const p = await getPrisma();
    const beat = await p.beat.findUnique({
      where: { id: beatId },
      select: {
        status: true,
        tags: true,
        licenses: {
          where: { type: { in: ["exclusive", "EXCLUSIVE"] } },
          select: { id: true, buyerId: true },
          take: 1,
        },
      },
    });

    if (!beat) return false;

    const isExclusiveStatus =
      beat.status === "SOLD_EXCLUSIVE" ||
      beat.status === "EXCLUSIVE_LOCKED" ||
      beat.status === "sold_exclusive";

    const hasExclusiveTag =
      Array.isArray(beat.tags) && beat.tags.includes("exclusively-sold");

    const hasExclusiveLicense = beat.licenses.length > 0;

    if (isExclusiveStatus || hasExclusiveTag || hasExclusiveLicense) {
      const buyerId = beat.licenses[0]?.buyerId ?? "durable-db-exclusive";
      claimBeatSlot(beatId, buyerId, "exclusive");
      return true;
    }
  } catch (err) {
    console.warn("[BeatInventoryEngine] DB exclusive check fallback:", err);
  }

  return false;
}

/**
 * Atomically marks a beat as sold exclusively in the database and updates inventory cache.
 */
export async function recordExclusiveBeatSaleDurable(params: {
  beatId: string;
  buyerUserId: string;
  stripeSessionId?: string;
  priceCents?: number;
}): Promise<boolean> {
  const { beatId, buyerUserId, stripeSessionId, priceCents = 0 } = params;

  try {
    const p = await getPrisma();
    await p.$transaction([
      p.beat.update({
        where: { id: beatId },
        data: {
          status: "SOLD_EXCLUSIVE",
          tags: {
            push: "exclusively-sold",
          },
        },
      }),
      p.beatLicense.create({
        data: {
          beatId,
          buyerId: buyerUserId,
          type: "exclusive",
          price: priceCents,
          stripeId: stripeSessionId || "direct-license",
        },
      }),
      p.beatProvenanceEvent.create({
        data: {
          beatId,
          eventType: "BEAT_SOLD_EXCLUSIVE",
          actorId: buyerUserId,
          contextJson: JSON.stringify({
            stripeSessionId,
            priceCents,
            soldAt: new Date().toISOString(),
          }),
        },
      }),
    ]);

    claimBeatSlot(beatId, buyerUserId, "exclusive");
    return true;
  } catch (err) {
    console.error("[BeatInventoryEngine] Failed to record exclusive beat sale in DB:", err);
    return false;
  }
}

// ─── Inventory snapshot ───

const LICENSE_SLOTS: Record<BeatLicenseType, number> = {
  non_exclusive: 999, // virtually unlimited
  exclusive: 1,
  stems: 10,
  unlimited: 5,
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
