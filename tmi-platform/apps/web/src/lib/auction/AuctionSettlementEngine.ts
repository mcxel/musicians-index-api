import { randomUUID } from 'crypto';

export interface AuctionSettlement {
  id: string;
  auctionId: string;
  winnerId: string;
  amountUSD: number;
  receiptId: string;
  settledAt: string;
}

const SETTLEMENTS = new Map<string, AuctionSettlement>();

export class AuctionSettlementEngine {
  static settle(auctionId: string, winnerId: string, amountUSD: number): AuctionSettlement {
    const settlement: AuctionSettlement = {
      id: randomUUID(),
      auctionId,
      winnerId,
      amountUSD,
      receiptId: `AUC-${auctionId.slice(0, 6).toUpperCase()}-${Date.now()}`,
      settledAt: new Date().toISOString(),
    };

    SETTLEMENTS.set(auctionId, settlement);
    return settlement;
  }

  static getSettlement(auctionId: string): AuctionSettlement | null {
    return SETTLEMENTS.get(auctionId) || null;
  }
}

export default AuctionSettlementEngine;
