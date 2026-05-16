/**
 * Prize Engine
 * Manages prize catalog, claims, and winner publication pipelines.
 */
import { emitSystemEvent } from '@/lib/systemEventBus';

export type PrizeType =
  | 'CASH'
  | 'MERCH'
  | 'NFT_TICKET'
  | 'SEASON_PASS'
  | 'STORE_CREDIT'
  | 'EXCLUSIVE_ACCESS'
  | 'PHYSICAL';

export interface Prize {
  id: string;
  name: string;
  type: PrizeType;
  value: number;
  description: string;
  imageUrl?: string;
  claimable: boolean;
  expiresAt?: number;
}

export interface PrizeClaim {
  prizeId: string;
  claimantId: string;
  claimantName: string;
  claimedAt: number;
  showId?: string;
}

export const PRIZE_CATALOG: Prize[] = [
  {
    id: 'prize-monthly-idol-trophy',
    name: 'Monthly Idol Trophy',
    type: 'EXCLUSIVE_ACCESS',
    value: 500,
    description: 'The coveted Monthly Idol crown — exclusive digital trophy for the month\'s champion.',
    claimable: true,
  },
  {
    id: 'prize-season-pass',
    name: 'TMI Season Pass',
    type: 'SEASON_PASS',
    value: 250,
    description: 'Full season access to all TMI shows and exclusive events.',
    claimable: true,
  },
  {
    id: 'prize-winner-nft',
    name: 'Winner Badge NFT',
    type: 'NFT_TICKET',
    value: 100,
    description: 'Non-transferable winner badge NFT minted on your profile.',
    claimable: true,
  },
  {
    id: 'prize-deal-cash',
    name: 'Deal Cash Prize',
    type: 'CASH',
    value: 1000,
    description: 'Cash prize for Deal or Feud 1000 champion.',
    claimable: true,
  },
  {
    id: 'prize-store-credit',
    name: 'TMI Store Credit',
    type: 'STORE_CREDIT',
    value: 75,
    description: '$75 store credit redeemable on TMI merch.',
    claimable: true,
  },
  {
    id: 'prize-exclusive-access-vip',
    name: 'VIP Backstage Access',
    type: 'EXCLUSIVE_ACCESS',
    value: 300,
    description: 'Exclusive backstage digital access pass for the next major show.',
    claimable: true,
  },
  {
    id: 'prize-merch-pack',
    name: 'TMI Merch Pack',
    type: 'MERCH',
    value: 120,
    description: 'Full TMI merchandise pack shipped to your door.',
    claimable: true,
  },
  {
    id: 'prize-physical-gold-record',
    name: 'Gold Record Award',
    type: 'PHYSICAL',
    value: 200,
    description: 'A custom framed gold record plaque with the winner\'s name.',
    claimable: true,
  },
  {
    id: 'prize-nft-ticket-vip',
    name: 'VIP NFT Ticket',
    type: 'NFT_TICKET',
    value: 150,
    description: 'NFT ticket granting VIP seating at any future TMI event.',
    claimable: true,
  },
  {
    id: 'prize-cypher-champion-ring',
    name: 'Cypher Champion Ring',
    type: 'PHYSICAL',
    value: 350,
    description: 'Physical championship ring for the Cypher Arena champion.',
    claimable: true,
  },
  {
    id: 'prize-name-that-tune-headphones',
    name: 'Pro Studio Headphones',
    type: 'PHYSICAL',
    value: 180,
    description: 'Professional studio headphones for the Name That Tune winner.',
    claimable: true,
  },
  {
    id: 'prize-crowd-choice-store-credit',
    name: 'Crowd Choice Credit',
    type: 'STORE_CREDIT',
    value: 50,
    description: 'Store credit awarded by crowd vote.',
    claimable: true,
  },
];

export class PrizeEngine {
  private catalog: Prize[];
  private claims: PrizeClaim[];

  constructor() {
    this.catalog = [...PRIZE_CATALOG];
    this.claims = [];
  }

  getPrizeById(id: string): Prize | undefined {
    return this.catalog.find((p) => p.id === id);
  }

  claimPrize(
    prizeId: string,
    claimantId: string,
    claimantName: string,
    showId?: string,
  ): PrizeClaim | null {
    const prize = this.catalog.find((p) => p.id === prizeId);
    if (!prize || !prize.claimable) return null;

    // Check if already claimed by this user
    const alreadyClaimed = this.claims.find(
      (c) => c.prizeId === prizeId && c.claimantId === claimantId,
    );
    if (alreadyClaimed) return alreadyClaimed;

    const claim: PrizeClaim = {
      prizeId,
      claimantId,
      claimantName,
      claimedAt: Date.now(),
      showId,
    };

    this.claims.push(claim);
    return claim;
  }

  getClaimsForUser(userId: string): PrizeClaim[] {
    return this.claims.filter((c) => c.claimantId === userId);
  }

  getClaimsForShow(showId: string): PrizeClaim[] {
    return this.claims.filter((c) => c.showId === showId);
  }

  publishWinnerToProfile(claim: PrizeClaim): void {
    emitSystemEvent({
      type: 'homepage.artifact.state',
      actor: claim.claimantId,
      message: `Winner ${claim.claimantName} published to profile for prize ${claim.prizeId}`,
      artistId: claim.claimantId,
      performerId: claim.claimantId,
    });
  }

  publishWinnerToBillboard(claim: PrizeClaim): void {
    emitSystemEvent({
      type: 'pipeline.billboard.open',
      actor: claim.claimantId,
      message: `Winner ${claim.claimantName} featured on TMI Billboard for prize ${claim.prizeId}`,
      artistId: claim.claimantId,
    });
  }

  publishWinnerToMagazine(claim: PrizeClaim): void {
    emitSystemEvent({
      type: 'homepage.artifact.click',
      actor: claim.claimantId,
      message: `Winner ${claim.claimantName} featured in TMI Magazine for prize ${claim.prizeId}`,
      artistId: claim.claimantId,
    });
  }
}
