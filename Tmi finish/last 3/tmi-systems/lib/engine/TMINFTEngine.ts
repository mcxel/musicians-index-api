/**
 * TMINFTEngine.ts
 * NFT production, minting, purchasing, and auction engine for The Musician's Index.
 *
 * Covers:
 *  - NFT metadata schema (TMI-standard, ERC-721 compatible)
 *  - Mint request workflow (queued → approval → minted)
 *  - Fixed-price listing
 *  - English auction with bid tracking and countdown
 *  - Ticket NFT binding (links TMITicketingEngine)
 *  - Beat/instrumental NFT with audio fingerprint
 *  - Revenue split logic (artist / platform / holder)
 *  - Transfer history ledger
 */

/* ─── Types ─────────────────────────────────────────────────────────────── */
export type NFTAssetType =
  | "track"           // full song
  | "beat"            // instrumental / beat
  | "ticket"          // event ticket NFT
  | "art"             // cover art / visual
  | "collectible"     // limited edition badge/skin
  | "season_pass"     // platform season pass
  | "achievement";    // earned achievement token

export type NFTStatus =
  | "draft"
  | "pending_approval"
  | "minted"
  | "listed_fixed"
  | "listed_auction"
  | "sold"
  | "transferred"
  | "burned";

export type BidStatus = "active" | "outbid" | "won" | "refunded";

export interface NFTMetadata {
  // Core identity
  tokenId: string;
  contractAddress?: string;          // set after on-chain mint
  chainId?: number;                  // 1=Ethereum, 137=Polygon, etc.

  // TMI schema
  assetType: NFTAssetType;
  title: string;
  description: string;
  artistId: string;
  artistName: string;
  createdAt: string;                 // ISO-8601
  edition: number;                   // e.g. 3 of 100
  totalEditions: number;

  // Media
  mediaUrl: string;                  // IPFS or CDN URL
  previewUrl?: string;               // 30s preview for tracks
  imageUrl: string;                  // cover/thumbnail
  audioFingerprint?: string;         // SHA-256 of audio file
  durationSec?: number;              // for audio assets

  // Ticket binding
  linkedTicketId?: string;           // TMITicketingEngine ticketId
  eventId?: string;

  // Revenue split (percentages, must sum to 100)
  revenueSplit: {
    artist: number;
    platform: number;
    holder: number;                  // for secondary sales
  };

  // Traits (ERC-721 attributes)
  attributes: { trait_type: string; value: string | number }[];

  // Status
  status: NFTStatus;
  mintedAt?: string;
  ownerId?: string;
  ownerName?: string;
  transferHistory: NFTTransfer[];
}

export interface NFTTransfer {
  from: string;
  to: string;
  price?: number;
  currency?: string;
  txHash?: string;
  timestamp: string;
}

export interface NFTListing {
  tokenId: string;
  listingType: "fixed" | "auction";
  priceUsd?: number;               // for fixed price
  auctionConfig?: AuctionConfig;
  listedAt: string;
  listedBy: string;
  expiresAt?: string;
}

export interface AuctionConfig {
  startingBidUsd: number;
  reservePriceUsd?: number;
  incrementUsd: number;
  endsAt: string;                   // ISO-8601
  bids: Bid[];
  highestBid?: number;
  highestBidder?: string;
  settled: boolean;
}

export interface Bid {
  id: string;
  bidderId: string;
  bidderName: string;
  amountUsd: number;
  placedAt: string;
  status: BidStatus;
}

export interface MintRequest {
  id: string;
  requesterId: string;
  assetType: NFTAssetType;
  metadata: Omit<NFTMetadata, "tokenId" | "status" | "transferHistory" | "mintedAt">;
  status: "queued" | "approved" | "rejected" | "minted";
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

/* ─── Revenue split defaults ─────────────────────────────────────────────── */
export const DEFAULT_REVENUE_SPLITS: Record<NFTAssetType, NFTMetadata["revenueSplit"]> = {
  track:       { artist: 85, platform: 10, holder: 5 },
  beat:        { artist: 80, platform: 15, holder: 5 },
  ticket:      { artist: 70, platform: 20, holder: 10 },
  art:         { artist: 90, platform: 8,  holder: 2 },
  collectible: { artist: 60, platform: 30, holder: 10 },
  season_pass: { artist: 0,  platform: 80, holder: 20 },
  achievement: { artist: 0,  platform: 100, holder: 0 },
};

/* ─── TMINFTEngine ───────────────────────────────────────────────────────── */
export class TMINFTEngine {
  private tokens = new Map<string, NFTMetadata>();
  private listings = new Map<string, NFTListing>();
  private mintRequests = new Map<string, MintRequest>();

  /* ─── Mint workflow ── */

  /** Submit a mint request (goes to approval queue) */
  submitMintRequest(
    requesterId: string,
    metadata: Omit<NFTMetadata, "tokenId" | "status" | "transferHistory" | "mintedAt">
  ): MintRequest {
    const req: MintRequest = {
      id: `MINTREQ-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      requesterId,
      assetType: metadata.assetType,
      metadata,
      status: "queued",
      submittedAt: new Date().toISOString(),
    };
    this.mintRequests.set(req.id, req);
    return req;
  }

  /** Approve and execute a mint (admin / bot action) */
  approveMint(requestId: string, reviewerId: string): NFTMetadata | null {
    const req = this.mintRequests.get(requestId);
    if (!req || req.status !== "queued") return null;

    const tokenId = `TMI-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const now = new Date().toISOString();

    const nft: NFTMetadata = {
      ...req.metadata,
      tokenId,
      status: "minted",
      mintedAt: now,
      transferHistory: [
        { from: "0x0", to: req.requesterId, timestamp: now },
      ],
    };

    this.tokens.set(tokenId, nft);

    req.status = "minted";
    req.reviewedAt = now;
    req.reviewedBy = reviewerId;

    return nft;
  }

  /** Reject a mint request */
  rejectMint(requestId: string, reviewerId: string, reason: string): void {
    const req = this.mintRequests.get(requestId);
    if (req) {
      req.status = "rejected";
      req.reviewedAt = new Date().toISOString();
      req.reviewedBy = reviewerId;
      req.rejectionReason = reason;
    }
  }

  /* ─── Listings ── */

  /** List an NFT at a fixed price */
  listFixed(tokenId: string, sellerId: string, priceUsd: number, expiryHours = 72): NFTListing | null {
    const nft = this.tokens.get(tokenId);
    if (!nft || nft.ownerId !== sellerId) return null;
    const listing: NFTListing = {
      tokenId,
      listingType: "fixed",
      priceUsd,
      listedAt: new Date().toISOString(),
      listedBy: sellerId,
      expiresAt: new Date(Date.now() + expiryHours * 3600 * 1000).toISOString(),
    };
    nft.status = "listed_fixed";
    this.listings.set(tokenId, listing);
    return listing;
  }

  /** List an NFT for auction */
  listAuction(
    tokenId: string,
    sellerId: string,
    config: Omit<AuctionConfig, "bids" | "highestBid" | "highestBidder" | "settled">
  ): NFTListing | null {
    const nft = this.tokens.get(tokenId);
    if (!nft || nft.ownerId !== sellerId) return null;
    const listing: NFTListing = {
      tokenId,
      listingType: "auction",
      listedAt: new Date().toISOString(),
      listedBy: sellerId,
      auctionConfig: {
        ...config,
        bids: [],
        settled: false,
      },
    };
    nft.status = "listed_auction";
    this.listings.set(tokenId, listing);
    return listing;
  }

  /** Place a bid on an active auction */
  placeBid(
    tokenId: string,
    bidderId: string,
    bidderName: string,
    amountUsd: number
  ): { success: boolean; bid?: Bid; error?: string } {
    const listing = this.listings.get(tokenId);
    if (!listing || listing.listingType !== "auction" || !listing.auctionConfig) {
      return { success: false, error: "No active auction for this token" };
    }

    const cfg = listing.auctionConfig;
    if (new Date(cfg.endsAt).getTime() < Date.now()) {
      return { success: false, error: "Auction has ended" };
    }

    const minBid = (cfg.highestBid ?? cfg.startingBidUsd - cfg.incrementUsd) + cfg.incrementUsd;
    if (amountUsd < minBid) {
      return { success: false, error: `Minimum bid is $${minBid.toFixed(2)}` };
    }

    // Outbid previous highest
    if (cfg.highestBidder) {
      const prev = cfg.bids.find((b) => b.bidderId === cfg.highestBidder && b.status === "active");
      if (prev) prev.status = "outbid";
    }

    const bid: Bid = {
      id: `BID-${Date.now()}`,
      bidderId,
      bidderName,
      amountUsd,
      placedAt: new Date().toISOString(),
      status: "active",
    };
    cfg.bids.push(bid);
    cfg.highestBid = amountUsd;
    cfg.highestBidder = bidderId;

    return { success: true, bid };
  }

  /** Settle an auction (called after endsAt) */
  settleAuction(tokenId: string): { winner?: string; amount?: number; error?: string } {
    const listing = this.listings.get(tokenId);
    const nft = this.tokens.get(tokenId);
    if (!listing || !nft || listing.listingType !== "auction" || !listing.auctionConfig) {
      return { error: "No auction found" };
    }

    const cfg = listing.auctionConfig;
    if (cfg.settled) return { error: "Already settled" };

    cfg.settled = true;

    if (!cfg.highestBidder || !cfg.highestBid) {
      nft.status = "minted"; // unsold — return to minted state
      this.listings.delete(tokenId);
      return { error: "No bids placed" };
    }

    if (cfg.reservePriceUsd && cfg.highestBid < cfg.reservePriceUsd) {
      nft.status = "minted";
      this.listings.delete(tokenId);
      return { error: "Reserve price not met" };
    }

    // Transfer
    this.transfer(tokenId, listing.listedBy, cfg.highestBidder, cfg.highestBid, "USD");
    cfg.bids.forEach((b) => {
      if (b.status === "active") b.status = "won";
    });
    this.listings.delete(tokenId);

    return { winner: cfg.highestBidder, amount: cfg.highestBid };
  }

  /** Execute a fixed-price purchase */
  purchase(tokenId: string, buyerId: string, buyerName: string): { success: boolean; error?: string } {
    const listing = this.listings.get(tokenId);
    const nft = this.tokens.get(tokenId);
    if (!listing || !nft || listing.listingType !== "fixed" || !listing.priceUsd) {
      return { success: false, error: "Not available for fixed purchase" };
    }

    if (listing.expiresAt && new Date(listing.expiresAt).getTime() < Date.now()) {
      return { success: false, error: "Listing has expired" };
    }

    this.transfer(tokenId, listing.listedBy, buyerId, listing.priceUsd, "USD");
    nft.ownerName = buyerName;
    this.listings.delete(tokenId);
    return { success: true };
  }

  /** Internal transfer */
  private transfer(tokenId: string, from: string, to: string, price: number, currency: string): void {
    const nft = this.tokens.get(tokenId);
    if (!nft) return;
    nft.ownerId = to;
    nft.status = "transferred";
    nft.transferHistory.push({
      from,
      to,
      price,
      currency,
      txHash: `0x${Math.random().toString(16).slice(2, 66)}`, // simulated
      timestamp: new Date().toISOString(),
    });
  }

  /* ─── Revenue calc ── */

  /** Calculate revenue distribution for a sale */
  calcRevenue(nft: NFTMetadata, saleAmountUsd: number): {
    artist: number;
    platform: number;
    holder: number;
  } {
    const split = nft.revenueSplit;
    return {
      artist:   parseFloat(((split.artist   / 100) * saleAmountUsd).toFixed(2)),
      platform: parseFloat(((split.platform / 100) * saleAmountUsd).toFixed(2)),
      holder:   parseFloat(((split.holder   / 100) * saleAmountUsd).toFixed(2)),
    };
  }

  /* ─── Queries ── */
  getToken(tokenId: string): NFTMetadata | undefined {
    return this.tokens.get(tokenId);
  }

  getTokensByOwner(ownerId: string): NFTMetadata[] {
    return Array.from(this.tokens.values()).filter((t) => t.ownerId === ownerId);
  }

  getTokensByArtist(artistId: string): NFTMetadata[] {
    return Array.from(this.tokens.values()).filter((t) => t.artistId === artistId);
  }

  getActiveListing(tokenId: string): NFTListing | undefined {
    return this.listings.get(tokenId);
  }

  getAllListings(): NFTListing[] {
    return Array.from(this.listings.values());
  }

  getPendingMintRequests(): MintRequest[] {
    return Array.from(this.mintRequests.values()).filter((r) => r.status === "queued");
  }
}

/* ─── Singleton ──────────────────────────────────────────────────────────── */
let _engine: TMINFTEngine | null = null;
export function getNFTEngine(): TMINFTEngine {
  if (!_engine) _engine = new TMINFTEngine();
  return _engine;
}
