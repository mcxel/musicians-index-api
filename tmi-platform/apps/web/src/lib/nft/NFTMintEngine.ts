/**
 * NFT Mint Engine
 * Minting, transfer, and venue redemption for TMI NFTs.
 */
import { Analytics } from "@/lib/analytics/PersonaAnalyticsEngine";

export type NFTType =
  | 'TICKET'
  | 'AVATAR_SKIN'
  | 'VENUE_PASS'
  | 'WINNER_BADGE'
  | 'SEASON_PASS'
  | 'COLLECTIBLE';

export interface TMINft {
  id: string;
  type: NFTType;
  name: string;
  ownerId: string;
  mintedAt: number;
  metadata: Record<string, string | number>;
  transferable: boolean;
  venueRedeemable: boolean;
  imageUrl?: string;
}

export interface MintRequest {
  type: NFTType;
  name: string;
  ownerId: string;
  metadata: Record<string, string | number>;
  transferable?: boolean;
  venueRedeemable?: boolean;
}

function generateNftId(): string {
  return `nft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export class NFTMintEngine {
  private nfts: Map<string, TMINft>;

  constructor() {
    this.nfts = new Map();
  }

  mint(request: MintRequest): TMINft {
    const nft: TMINft = {
      id: generateNftId(),
      type: request.type,
      name: request.name,
      ownerId: request.ownerId,
      mintedAt: Date.now(),
      metadata: { ...request.metadata },
      transferable: request.transferable ?? true,
      venueRedeemable: request.venueRedeemable ?? false,
    };

    this.nfts.set(nft.id, nft);
    Analytics.storefrontView({ userId: nft.ownerId, assetId: nft.id, assetType: `nft-mint-${nft.type.toLowerCase()}` });
    return { ...nft };
  }

  transfer(nftId: string, fromOwnerId: string, toOwnerId: string): boolean {
    const nft = this.nfts.get(nftId);
    if (!nft) return false;
    if (!nft.transferable) return false;
    if (nft.ownerId !== fromOwnerId) return false;

    nft.ownerId = toOwnerId;
    return true;
  }

  redeemAtVenue(nftId: string, venueId: string): boolean {
    const nft = this.nfts.get(nftId);
    if (!nft) return false;
    if (!nft.venueRedeemable) return false;

    nft.metadata['redeemedAt'] = Date.now();
    nft.metadata['redeemedVenueId'] = venueId;
    nft.venueRedeemable = false; // single-use redemption
    return true;
  }

  getNFTById(id: string): TMINft | undefined {
    const nft = this.nfts.get(id);
    return nft ? { ...nft } : undefined;
  }

  getNFTsForOwner(ownerId: string): TMINft[] {
    const result: TMINft[] = [];
    for (const nft of this.nfts.values()) {
      if (nft.ownerId === ownerId) result.push({ ...nft });
    }
    return result;
  }

  getTicketNFTs(ownerId: string): TMINft[] {
    return this.getNFTsForOwner(ownerId).filter((n) => n.type === 'TICKET');
  }

  generateTicketNFT(
    holderId: string,
    venueName: string,
    showName: string,
    seatId: string,
    date: string,
  ): TMINft {
    return this.mint({
      type: 'TICKET',
      name: `${showName} — ${date}`,
      ownerId: holderId,
      metadata: {
        venueName,
        showName,
        seatId,
        date,
        ticketTier: 'GENERAL',
      },
      transferable: false,
      venueRedeemable: true,
    });
  }
}
