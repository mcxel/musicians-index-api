/**
 * BeatPurchaseInterestEngine — post-feature purchase interest → buy or auction.
 * Rule 19: Marketplace path only (not Submission / Competition vaults).
 * Fee settlement uses RevenueSplitEngine "beat" preset via beatFulfillment.
 */

import { isBeatExclusivelySold } from "@/lib/beats/BeatInventoryEngine";
import { SPLIT_PRESETS } from "@/lib/commerce/RevenueSplitEngine";

export type BeatInterestRecord = {
  userId: string;
  displayName?: string;
  at: number;
};

export type BeatAuctionState = {
  auctionId: string;
  beatId: string;
  beatTitle: string;
  broadcastTag: string;
  reserveCents: number;
  bids: { userId: string; amountCents: number; at: number }[];
  status: "open" | "settled" | "cancelled";
  winnerUserId?: string;
  winningBidCents?: number;
  openedAt: number;
  closesAt: number;
};

export type BeatFeatureInterest = {
  beatId: string;
  beatTitle: string;
  broadcastTag: string;
  producerId?: string | null;
  listPriceCents: number;
  featuredAt: number;
  roomId?: string;
  lane?: string;
  interests: BeatInterestRecord[];
  mode: "idle" | "direct" | "auction";
  auctionId?: string;
};

const features = new Map<string, BeatFeatureInterest>();
const auctions = new Map<string, BeatAuctionState>();
const AUCTION_WINDOW_MS = 15 * 60_000;

/** Client-safe label — same preset BeatStoreCommerceEngine uses. */
export function getBeatFeeLabel(): string {
  const cfg = SPLIT_PRESETS.beat;
  return `RevenueSplitEngine SPLIT_PRESETS.beat — platform ${cfg.platform / 100}% · producer ${cfg.artist / 100}% · big_ace ${cfg.big_ace / 100}%`;
}

export function markBeatFeatured(input: {
  beatId: string;
  beatTitle: string;
  broadcastTag: string;
  producerId?: string | null;
  listPriceCents: number;
  roomId?: string;
  lane?: string;
}): BeatFeatureInterest {
  const existing = features.get(input.beatId);
  if (existing) {
    existing.featuredAt = Date.now();
    existing.beatTitle = input.beatTitle;
    existing.broadcastTag = input.broadcastTag;
    existing.listPriceCents = input.listPriceCents || existing.listPriceCents;
    if (input.roomId) existing.roomId = input.roomId;
    if (input.lane) existing.lane = input.lane;
    return existing;
  }
  const row: BeatFeatureInterest = {
    beatId: input.beatId,
    beatTitle: input.beatTitle,
    broadcastTag: input.broadcastTag,
    producerId: input.producerId,
    listPriceCents: Math.max(99, input.listPriceCents || 2999),
    featuredAt: Date.now(),
    roomId: input.roomId,
    lane: input.lane,
    interests: [],
    mode: "idle",
  };
  features.set(input.beatId, row);
  return row;
}

export function getFeaturedBeat(beatId: string): BeatFeatureInterest | undefined {
  return features.get(beatId);
}

export function listRecentFeatured(limit = 12): BeatFeatureInterest[] {
  return Array.from(features.values())
    .sort((a, b) => b.featuredAt - a.featuredAt)
    .slice(0, limit);
}

export function expressPurchaseInterest(input: {
  beatId: string;
  userId: string;
  displayName?: string;
}): {
  ok: boolean;
  error?: string;
  mode?: "direct" | "auction";
  interestCount?: number;
  auction?: BeatAuctionState;
  listPriceCents?: number;
  exclusiveBlocked?: boolean;
} {
  if (!input.userId || input.userId === "anonymous" || input.userId === "guest") {
    return { ok: false, error: "Log in to express purchase interest." };
  }
  if (isBeatExclusivelySold(input.beatId)) {
    return { ok: false, error: "This beat was sold exclusively.", exclusiveBlocked: true };
  }

  const feature = features.get(input.beatId);
  if (!feature) {
    return { ok: false, error: "Beat has not been featured yet." };
  }

  if (!feature.interests.some((i) => i.userId === input.userId)) {
    feature.interests.push({
      userId: input.userId,
      displayName: input.displayName,
      at: Date.now(),
    });
  }

  const count = feature.interests.length;

  if (count === 1) {
    feature.mode = "direct";
    return {
      ok: true,
      mode: "direct",
      interestCount: 1,
      listPriceCents: feature.listPriceCents,
    };
  }

  // 2+ interested → auction
  let auction = feature.auctionId ? auctions.get(feature.auctionId) : undefined;
  if (!auction || auction.status !== "open") {
    const auctionId = `beat-auc-${input.beatId.slice(0, 8)}-${Date.now().toString(36)}`;
    auction = {
      auctionId,
      beatId: feature.beatId,
      beatTitle: feature.beatTitle,
      broadcastTag: feature.broadcastTag,
      reserveCents: feature.listPriceCents,
      bids: [],
      status: "open",
      openedAt: Date.now(),
      closesAt: Date.now() + AUCTION_WINDOW_MS,
    };
    auctions.set(auctionId, auction);
    feature.auctionId = auctionId;
  }
  feature.mode = "auction";

  return {
    ok: true,
    mode: "auction",
    interestCount: count,
    auction,
    listPriceCents: feature.listPriceCents,
  };
}

export function placeBeatAuctionBid(input: {
  auctionId: string;
  userId: string;
  amountCents: number;
}): { ok: boolean; error?: string; auction?: BeatAuctionState } {
  const auction = auctions.get(input.auctionId);
  if (!auction) return { ok: false, error: "Auction not found." };
  if (auction.status !== "open") return { ok: false, error: "Auction is closed." };
  if (Date.now() > auction.closesAt) {
    auction.status = "settled";
    return { ok: false, error: "Auction window ended." };
  }
  if (isBeatExclusivelySold(auction.beatId)) {
    auction.status = "cancelled";
    return { ok: false, error: "Beat already sold exclusively." };
  }

  const high = auction.bids.reduce((m, b) => Math.max(m, b.amountCents), auction.reserveCents);
  if (input.amountCents <= high) {
    return { ok: false, error: `Bid must exceed $${(high / 100).toFixed(2)}.` };
  }

  auction.bids.push({
    userId: input.userId,
    amountCents: input.amountCents,
    at: Date.now(),
  });
  return { ok: true, auction };
}

export function settleBeatAuction(auctionId: string): {
  ok: boolean;
  error?: string;
  auction?: BeatAuctionState;
  checkoutCents?: number;
  winnerUserId?: string;
} {
  const auction = auctions.get(auctionId);
  if (!auction) return { ok: false, error: "Auction not found." };
  if (auction.status === "cancelled") return { ok: false, error: "Auction cancelled." };

  if (auction.bids.length === 0) {
    auction.status = "cancelled";
    return { ok: false, error: "No bids placed.", auction };
  }

  const top = [...auction.bids].sort((a, b) => b.amountCents - a.amountCents)[0];
  auction.status = "settled";
  auction.winnerUserId = top.userId;
  auction.winningBidCents = top.amountCents;

  return {
    ok: true,
    auction,
    checkoutCents: top.amountCents,
    winnerUserId: top.userId,
  };
}

export function getAuction(auctionId: string): BeatAuctionState | undefined {
  return auctions.get(auctionId);
}

export function getOpenAuctionForBeat(beatId: string): BeatAuctionState | undefined {
  const f = features.get(beatId);
  if (!f?.auctionId) return undefined;
  const a = auctions.get(f.auctionId);
  return a?.status === "open" ? a : undefined;
}
