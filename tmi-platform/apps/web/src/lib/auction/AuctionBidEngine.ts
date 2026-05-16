import { randomUUID } from 'crypto';

export interface AuctionBid {
  id: string;
  auctionId: string;
  bidderId: string;
  amountUSD: number;
  createdAt: string;
}

const BIDS = new Map<string, AuctionBid[]>();

export class AuctionBidEngine {
  static placeBid(auctionId: string, bidderId: string, amountUSD: number): AuctionBid {
    const bid: AuctionBid = {
      id: randomUUID(),
      auctionId,
      bidderId,
      amountUSD,
      createdAt: new Date().toISOString(),
    };

    if (!BIDS.has(auctionId)) BIDS.set(auctionId, []);
    BIDS.get(auctionId)!.push(bid);
    return bid;
  }

  static getHighestBid(auctionId: string): AuctionBid | null {
    const bids = BIDS.get(auctionId) || [];
    if (bids.length === 0) return null;
    return bids.slice().sort((a, b) => b.amountUSD - a.amountUSD)[0];
  }

  static getBids(auctionId: string): AuctionBid[] {
    return BIDS.get(auctionId) || [];
  }

  static getLosingBidders(auctionId: string): string[] {
    const highest = this.getHighestBid(auctionId);
    const bids = BIDS.get(auctionId) || [];
    if (!highest) return [];
    return Array.from(new Set(bids.filter((b) => b.bidderId !== highest.bidderId).map((b) => b.bidderId)));
  }
}

export default AuctionBidEngine;
