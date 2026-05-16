export interface AuctionFraudSignal {
  auctionId: string;
  bidderId: string;
  score: number;
  reasons: string[];
}

const SIGNALS = new Map<string, AuctionFraudSignal[]>();

export class AuctionFraudGuardEngine {
  static evaluate(input: {
    auctionId: string;
    bidderId: string;
    bidCountInMinute: number;
    repeatedIncrementPattern: boolean;
    sharedIpBidderCount: number;
  }): AuctionFraudSignal {
    let score = 0;
    const reasons: string[] = [];

    if (input.bidCountInMinute > 10) {
      score += 40;
      reasons.push('rapid-bidding');
    }
    if (input.repeatedIncrementPattern) {
      score += 25;
      reasons.push('patterned-bids');
    }
    if (input.sharedIpBidderCount > 3) {
      score += 35;
      reasons.push('shared-ip-cluster');
    }

    const signal: AuctionFraudSignal = {
      auctionId: input.auctionId,
      bidderId: input.bidderId,
      score: Math.min(score, 100),
      reasons,
    };

    if (!SIGNALS.has(input.auctionId)) SIGNALS.set(input.auctionId, []);
    SIGNALS.get(input.auctionId)!.push(signal);
    return signal;
  }

  static shouldBlock(signal: AuctionFraudSignal): boolean {
    return signal.score >= 70;
  }

  static getSignals(auctionId: string): AuctionFraudSignal[] {
    return SIGNALS.get(auctionId) || [];
  }
}

export default AuctionFraudGuardEngine;
