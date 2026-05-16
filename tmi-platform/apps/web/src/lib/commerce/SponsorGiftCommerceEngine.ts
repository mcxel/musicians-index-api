// ─── Types ────────────────────────────────────────────────────────────────────

export type SponsorGiftType =
  | "cash_prize"
  | "merch"
  | "experience"
  | "subscription_credit"
  | "nft_drop"
  | "beat_credit";

export type SponsorGift = {
  id: string;
  sponsorId: string;
  sponsorName: string;
  giftType: SponsorGiftType;
  title: string;
  description: string;
  valueCents: number;
  valueDisplay: string;
  isTaxable: boolean;
  totalSupply: number;
  claimedCount: number;
  expiresAtMs?: number;
};

export type GiftClaim = {
  claimId: string;
  giftId: string;
  winnerId: string;
  winnerProof: string;       // userId + timestamp hash
  claimedAtMs: number;
  taxable: boolean;
  valueCents: number;
};

// ─── Registry ─────────────────────────────────────────────────────────────────

const giftRegistry = new Map<string, SponsorGift>();
const claimLedger: GiftClaim[] = [];
let _giftCounter = 0;
let _claimCounter = 0;

function centsToDollarStr(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function registerSponsorGift(
  sponsorId: string,
  sponsorName: string,
  giftType: SponsorGiftType,
  title: string,
  description: string,
  valueCents: number,
  totalSupply: number,
  options?: { isTaxable?: boolean; expiresAtMs?: number },
): SponsorGift {
  const gift: SponsorGift = {
    id: `gift-${++_giftCounter}`,
    sponsorId,
    sponsorName,
    giftType,
    title,
    description,
    valueCents,
    valueDisplay: centsToDollarStr(valueCents),
    isTaxable: options?.isTaxable ?? giftType === "cash_prize",
    totalSupply,
    claimedCount: 0,
    expiresAtMs: options?.expiresAtMs,
  };
  giftRegistry.set(gift.id, gift);
  return gift;
}

export function claimSponsorGift(
  giftId: string,
  winnerId: string,
): GiftClaim | { error: string } {
  const gift = giftRegistry.get(giftId);
  if (!gift) return { error: "Gift not found" };
  if (gift.claimedCount >= gift.totalSupply) return { error: "Gift supply exhausted" };
  if (gift.expiresAtMs && Date.now() > gift.expiresAtMs) return { error: "Gift expired" };

  gift.claimedCount++;
  const winnerProof = `${winnerId}-${giftId}-${Date.now()}`;

  const claim: GiftClaim = {
    claimId: `claim-${++_claimCounter}`,
    giftId,
    winnerId,
    winnerProof,
    claimedAtMs: Date.now(),
    taxable: gift.isTaxable,
    valueCents: gift.valueCents,
  };

  claimLedger.push(claim);
  return claim;
}

export function getSponsorGift(giftId: string): SponsorGift | undefined {
  return giftRegistry.get(giftId);
}

export function getActiveSponsorGifts(): SponsorGift[] {
  const now = Date.now();
  return Array.from(giftRegistry.values()).filter(
    g => g.claimedCount < g.totalSupply && (!g.expiresAtMs || g.expiresAtMs > now),
  );
}

export function getClaimsForWinner(winnerId: string): GiftClaim[] {
  return claimLedger.filter(c => c.winnerId === winnerId);
}

export function getClaimsForSponsor(sponsorId: string): GiftClaim[] {
  return claimLedger.filter(c => {
    const gift = giftRegistry.get(c.giftId);
    return gift?.sponsorId === sponsorId;
  });
}

export function getTaxableValueForWinner(winnerId: string): { taxableCents: number; nonTaxableCents: number } {
  const claims = getClaimsForWinner(winnerId);
  return claims.reduce((acc, c) => ({
    taxableCents:    acc.taxableCents    + (c.taxable ? c.valueCents : 0),
    nonTaxableCents: acc.nonTaxableCents + (c.taxable ? 0 : c.valueCents),
  }), { taxableCents: 0, nonTaxableCents: 0 });
}
