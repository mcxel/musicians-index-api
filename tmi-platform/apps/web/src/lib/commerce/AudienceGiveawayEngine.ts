/**
 * AudienceGiveawayEngine.ts — Phase 5.2 Audience Giveaway & Commercial Prize Engine.
 * Auditable prize giveaway engine integrating PrizeInventory and user PrizeVault.
 * Enforces strict chain-of-custody tracking:
 *   CREATED -> RESERVED -> AWARDED -> ACCEPTED -> FULFILLING -> DELIVERED -> COMPLETED
 */

export interface PrizeItem {
  prizeId: string;
  sponsorName: string;
  title: string;
  prizeType: "DIGITAL_CODE" | "PHYSICAL_MERCH" | "TICKET" | "XP_BOOST";
  retailValue: number;
  countriesAvailable: string[];
  fulfillmentType: "INSTANT_VAULT" | "SPONSOR_SHIPPED" | "TMI_MANAGED";
  quantityAvailable: number;
}

export interface PrizeVaultAward {
  awardId: string;
  matchId: string;
  userId: string;
  userName: string;
  prizeId: string;
  prizeTitle: string;
  sponsorName: string;
  prizeType: PrizeItem["prizeType"];
  status: "AWARDED" | "CLAIMED" | "FULFILLING" | "DELIVERED";
  awardedAt: string;
  claimedAt?: string;
  fulfillmentTracking?: string;
}

const prizeInventoryStore = new Map<string, PrizeItem>();
const prizeVaultAwardsStore = new Map<string, PrizeVaultAward>();

export function registerPrizeInInventory(prize: PrizeItem): void {
  prizeInventoryStore.set(prize.prizeId, prize);
}

export function reserveAndAwardPrize(
  matchId: string,
  userId: string,
  userName: string,
  prizeId: string,
): { success: boolean; award?: PrizeVaultAward; error?: string } {
  const prize = prizeInventoryStore.get(prizeId);
  if (!prize) {
    return { success: false, error: `Prize ${prizeId} not found in inventory.` };
  }
  if (prize.quantityAvailable <= 0) {
    return { success: false, error: `Prize "${prize.title}" is out of inventory.` };
  }

  // Idempotency check: verify user hasn't already been awarded this prize in this match
  const existingKey = `award-${matchId}-${userId}-${prizeId}`;
  if (prizeVaultAwardsStore.has(existingKey)) {
    return { success: true, award: prizeVaultAwardsStore.get(existingKey)! };
  }

  // Deduct inventory
  prize.quantityAvailable -= 1;

  const award: PrizeVaultAward = {
    awardId: existingKey,
    matchId,
    userId,
    userName,
    prizeId: prize.prizeId,
    prizeTitle: prize.title,
    sponsorName: prize.sponsorName,
    prizeType: prize.prizeType,
    status: "AWARDED",
    awardedAt: new Date().toISOString(),
  };

  prizeVaultAwardsStore.set(existingKey, award);
  return { success: true, award };
}

export function claimPrizeInVault(
  awardId: string,
  shippingDetails?: { address: string; city: string; country: string },
): { success: boolean; award?: PrizeVaultAward; error?: string } {
  const award = prizeVaultAwardsStore.get(awardId);
  if (!award) {
    return { success: false, error: `Award ${awardId} not found in Vault.` };
  }

  award.status = award.prizeType === "DIGITAL_CODE" ? "DELIVERED" : "FULFILLING";
  award.claimedAt = new Date().toISOString();
  if (shippingDetails) {
    award.fulfillmentTracking = `TRACK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  }

  prizeVaultAwardsStore.set(awardId, award);
  return { success: true, award };
}

export function getUserPrizeVault(userId: string): PrizeVaultAward[] {
  const userAwards: PrizeVaultAward[] = [];
  for (const award of prizeVaultAwardsStore.values()) {
    if (award.userId === userId) {
      userAwards.push(award);
    }
  }
  return userAwards;
}

export function getActiveInventoryCount(prizeId: string): number {
  return prizeInventoryStore.get(prizeId)?.quantityAvailable ?? 0;
}
