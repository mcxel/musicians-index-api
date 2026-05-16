import { randomUUID } from 'crypto';

export type AuctionItemType =
  | 'beats'
  | 'nfts'
  | 'tickets'
  | 'merch'
  | 'props'
  | 'sponsor-placements'
  | 'vip-seats'
  | 'venue-packages'
  | 'trophy-replicas'
  | 'backstage-passes';

export type AuctionStatus = 'draft' | 'active' | 'closed' | 'settled' | 'cancelled';

export interface AuctionListing {
  id: string;
  sellerId: string;
  title: string;
  itemType: AuctionItemType;
  reservePriceUSD: number;
  startPriceUSD: number;
  status: AuctionStatus;
  startsAt: string;
  endsAt: string;
  createdAt: string;
}

const LISTINGS = new Map<string, AuctionListing>();

export class AuctionListingEngine {
  static createListing(input: {
    sellerId: string;
    title: string;
    itemType: AuctionItemType;
    reservePriceUSD: number;
    startPriceUSD: number;
    durationMinutes: number;
  }): AuctionListing {
    const now = new Date();
    const listing: AuctionListing = {
      id: randomUUID(),
      sellerId: input.sellerId,
      title: input.title,
      itemType: input.itemType,
      reservePriceUSD: input.reservePriceUSD,
      startPriceUSD: input.startPriceUSD,
      status: 'active',
      startsAt: now.toISOString(),
      endsAt: new Date(now.getTime() + input.durationMinutes * 60 * 1000).toISOString(),
      createdAt: now.toISOString(),
    };
    LISTINGS.set(listing.id, listing);
    return listing;
  }

  static getListing(listingId: string): AuctionListing | null {
    return LISTINGS.get(listingId) || null;
  }

  static listActive(limit: number = 100): AuctionListing[] {
    return Array.from(LISTINGS.values())
      .filter((l) => l.status === 'active')
      .slice(0, limit);
  }

  static closeListing(listingId: string): AuctionListing | null {
    const listing = LISTINGS.get(listingId);
    if (!listing) return null;
    listing.status = 'closed';
    return listing;
  }

  static markSettled(listingId: string): AuctionListing | null {
    const listing = LISTINGS.get(listingId);
    if (!listing) return null;
    listing.status = 'settled';
    return listing;
  }
}

export default AuctionListingEngine;
