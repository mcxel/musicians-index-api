export type TmiRevenueInput = {
  grossCoins: number;
  sponsorBoostCoins?: number;
  eventBonusCoins?: number;
  seasonBonusCoins?: number;
  taxRate?: number;
  promoRate?: number;
  refundReserveRate?: number;
};

export type TmiRevenueBreakdown = {
  gross: number;
  creatorShare: number;
  platformShare: number;
  sponsorShare: number;
  taxReserve: number;
  promoReserve: number;
  refundReserve: number;
  eventBonus: number;
  seasonBonus: number;
  netCreatorPayout: number;
  simulated: true;
};

export function calculateSaleRevenue(input: TmiRevenueInput): TmiRevenueBreakdown {
  const gross = Math.max(0, input.grossCoins);
  const sponsorShare = Math.max(0, input.sponsorBoostCoins ?? 0);
  const eventBonus = Math.max(0, input.eventBonusCoins ?? 0);
  const seasonBonus = Math.max(0, input.seasonBonusCoins ?? 0);
  const taxReserve = gross * (input.taxRate ?? 0.08);
  const promoReserve = gross * (input.promoRate ?? 0.05);
  const refundReserve = gross * (input.refundReserveRate ?? 0.04);

  const basePool = Math.max(0, gross - taxReserve - promoReserve - refundReserve);
  const creatorShare = basePool * 0.6;
  const platformShare = basePool * 0.4;
  const netCreatorPayout = creatorShare + eventBonus + seasonBonus;

  return {
    gross,
    creatorShare,
    platformShare,
    sponsorShare,
    taxReserve,
    promoReserve,
    refundReserve,
    eventBonus,
    seasonBonus,
    netCreatorPayout,
    simulated: true,
  };
}

export function calculateCreatorShare(input: TmiRevenueInput) {
  return calculateSaleRevenue(input).creatorShare;
}

export function calculatePlatformShare(input: TmiRevenueInput) {
  return calculateSaleRevenue(input).platformShare;
}

export function calculateSponsorShare(input: TmiRevenueInput) {
  return calculateSaleRevenue(input).sponsorShare;
}
