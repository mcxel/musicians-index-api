/**
 * MerchantPrizeSubmissionEngine
 * Merchants submit prizes to contests, games, and prize pool rotations.
 * Prize types: gift cards, products, discount codes, contest prizes, game prize rotation.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type PrizeType =
  | "gift-card"
  | "product"
  | "discount-code"
  | "contest-prize"
  | "game-prize";

export type PrizeStatus = "pending-review" | "approved" | "rejected" | "active" | "claimed" | "expired";

export type PrizePoolTarget =
  | "yearly-contest"
  | "battle"
  | "cypher"
  | "game-rotation"
  | "artist-contest"
  | "fan-giveaway";

export type MerchantPrize = {
  prizeId: string;
  merchantId: string;
  merchantName: string;
  prizeType: PrizeType;
  poolTarget: PrizePoolTarget;
  title: string;
  description: string;
  valueCents: number;
  valueDisplay: string;
  code?: string;                     // for discount codes / gift cards
  productId?: string;                // for product prizes
  artistId?: string;                 // if attached to a specific artist
  contestId?: string;                // if attached to a specific contest
  status: PrizeStatus;
  winnerId?: string;
  claimedAtMs?: number;
  expiresAtMs: number;
  submittedAtMs: number;
};

// ─── In-memory store ──────────────────────────────────────────────────────────

const prizes: MerchantPrize[] = [];
let prizeCounter = 0;

function centsToDisplay(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function submitMerchantPrize(input: {
  merchantId: string;
  merchantName: string;
  prizeType: PrizeType;
  poolTarget: PrizePoolTarget;
  title: string;
  description: string;
  valueCents: number;
  code?: string;
  productId?: string;
  artistId?: string;
  contestId?: string;
  expirationDays?: number;
}): MerchantPrize {
  const now = Date.now();
  const expiresAtMs = now + (input.expirationDays ?? 90) * 24 * 60 * 60 * 1000;

  const prize: MerchantPrize = {
    prizeId: `prize-${++prizeCounter}-${input.merchantId}`,
    merchantId: input.merchantId,
    merchantName: input.merchantName,
    prizeType: input.prizeType,
    poolTarget: input.poolTarget,
    title: input.title,
    description: input.description,
    valueCents: input.valueCents,
    valueDisplay: centsToDisplay(input.valueCents),
    code: input.code,
    productId: input.productId,
    artistId: input.artistId,
    contestId: input.contestId,
    status: "pending-review",
    expiresAtMs,
    submittedAtMs: now,
  };

  prizes.unshift(prize);
  return prize;
}

export function approvePrize(prizeId: string): MerchantPrize {
  const prize = prizes.find((p) => p.prizeId === prizeId);
  if (!prize) throw new Error(`Prize ${prizeId} not found`);
  prize.status = "approved";
  return prize;
}

export function activatePrize(prizeId: string): MerchantPrize {
  const prize = prizes.find((p) => p.prizeId === prizeId);
  if (!prize) throw new Error(`Prize ${prizeId} not found`);
  prize.status = "active";
  return prize;
}

export function claimPrize(prizeId: string, winnerId: string): MerchantPrize {
  const prize = prizes.find((p) => p.prizeId === prizeId);
  if (!prize) throw new Error(`Prize ${prizeId} not found`);
  if (prize.status !== "active") throw new Error(`Prize ${prizeId} is not active`);
  prize.status = "claimed";
  prize.winnerId = winnerId;
  prize.claimedAtMs = Date.now();
  return prize;
}

export function rejectPrize(prizeId: string): MerchantPrize {
  const prize = prizes.find((p) => p.prizeId === prizeId);
  if (!prize) throw new Error(`Prize ${prizeId} not found`);
  prize.status = "rejected";
  return prize;
}

export function listPrizesByPool(poolTarget: PrizePoolTarget, onlyActive = false): MerchantPrize[] {
  return prizes.filter(
    (p) => p.poolTarget === poolTarget && (!onlyActive || p.status === "active")
  );
}

export function listMerchantPrizes(merchantId: string): MerchantPrize[] {
  return prizes.filter((p) => p.merchantId === merchantId);
}

export function listContestPrizes(contestId: string): MerchantPrize[] {
  return prizes.filter((p) => p.contestId === contestId && p.status === "active");
}

export function listGamePrizeRotation(): MerchantPrize[] {
  return prizes.filter(
    (p) => p.poolTarget === "game-rotation" && p.status === "active" && p.expiresAtMs > Date.now()
  );
}

export function expireStalePrizes(): number {
  const now = Date.now();
  let count = 0;
  prizes.forEach((p) => {
    if ((p.status === "active" || p.status === "approved") && p.expiresAtMs < now) {
      p.status = "expired";
      count++;
    }
  });
  return count;
}
