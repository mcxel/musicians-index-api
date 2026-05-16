export type TmiRoyaltyInput = {
  amountCoins: number;
  rate?: number;
};

export type TmiRoyaltyLedgerEntry = {
  creatorId: string;
  overlayId: string;
  source: "resale" | "gift" | "trade" | "event";
  gross: number;
  royalty: number;
  createdAt: number;
};

const LEDGER: TmiRoyaltyLedgerEntry[] = [];

function calc(input: TmiRoyaltyInput, defaultRate: number) {
  const gross = Math.max(0, input.amountCoins);
  const royalty = gross * (input.rate ?? defaultRate);
  return { gross, royalty };
}

export function calculateResaleRoyalty(input: TmiRoyaltyInput) {
  return calc(input, 0.08);
}

export function calculateGiftRoyalty(input: TmiRoyaltyInput) {
  return calc(input, 0.02);
}

export function calculateTradeRoyalty(input: TmiRoyaltyInput) {
  return calc(input, 0.05);
}

export function calculateEventRoyalty(input: TmiRoyaltyInput) {
  return calc(input, 0.1);
}

export function recordRoyalty(
  creatorId: string,
  overlayId: string,
  source: "resale" | "gift" | "trade" | "event",
  amountCoins: number
) {
  const result =
    source === "resale"
      ? calculateResaleRoyalty({ amountCoins })
      : source === "gift"
      ? calculateGiftRoyalty({ amountCoins })
      : source === "trade"
      ? calculateTradeRoyalty({ amountCoins })
      : calculateEventRoyalty({ amountCoins });

  const row: TmiRoyaltyLedgerEntry = {
    creatorId,
    overlayId,
    source,
    gross: result.gross,
    royalty: result.royalty,
    createdAt: Date.now(),
  };
  LEDGER.push(row);
  return row;
}

export function listCreatorRoyaltyLedger(creatorId: string) {
  return LEDGER.filter((x) => x.creatorId === creatorId);
}

export function payoutReadinessState(creatorId: string) {
  const rows = listCreatorRoyaltyLedger(creatorId);
  const balance = rows.reduce((acc, row) => acc + row.royalty, 0);
  return {
    creatorId,
    simulated: true as const,
    ledgerCount: rows.length,
    balance,
    ready: balance >= 500,
    reason: balance >= 500 ? "THRESHOLD_REACHED" : "INSUFFICIENT_BALANCE",
  };
}
