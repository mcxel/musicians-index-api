import { NextResponse } from "next/server";

interface Bid {
  id: string;
  auctionId: string;
  bidderId: string;
  bidderName: string;
  amountUSD: number;
  placedAt: string;
}

interface Auction {
  id: string;
  itemId: string;
  itemTitle: string;
  itemType: "nft" | "beat" | "ticket" | "experience";
  startingPriceUSD: number;
  currentBidUSD: number;
  leadingBidderId: string | null;
  bids: Bid[];
  endsAt: string;
  status: "active" | "closed" | "cancelled";
}

const auctions = new Map<string, Auction>([
  ["a001", {
    id: "a001",
    itemId: "n001",
    itemTitle: "Crown Night Genesis Beat",
    itemType: "nft",
    startingPriceUSD: 100,
    currentBidUSD: 100,
    leadingBidderId: null,
    bids: [],
    endsAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    status: "active",
  }],
  ["a002", {
    id: "a002",
    itemId: "exp001",
    itemTitle: "VIP Meet & Greet — Kreach",
    itemType: "experience",
    startingPriceUSD: 200,
    currentBidUSD: 250,
    leadingBidderId: "fan_123",
    bids: [
      { id: "bid1", auctionId: "a002", bidderId: "fan_123", bidderName: "Fan 123", amountUSD: 250, placedAt: new Date(Date.now() - 3600000).toISOString() },
    ],
    endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
  }],
]);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? "active";
  const all = [...auctions.values()].filter(a => !status || a.status === status);
  return NextResponse.json({ auctions: all.map(a => ({ ...a, bidCount: a.bids.length })) });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { auctionId: string; bidderId: string; bidderName: string; amountUSD: number };
    const { auctionId, bidderId, bidderName, amountUSD } = body;
    if (!auctionId || !bidderId || !amountUSD) {
      return NextResponse.json({ error: "auctionId, bidderId and amountUSD required" }, { status: 400 });
    }
    const auction = auctions.get(auctionId);
    if (!auction) return NextResponse.json({ error: "Auction not found" }, { status: 404 });
    if (auction.status !== "active") return NextResponse.json({ error: "Auction not active" }, { status: 409 });
    if (amountUSD <= auction.currentBidUSD) {
      return NextResponse.json({ error: `Bid must exceed current bid of $${auction.currentBidUSD}` }, { status: 422 });
    }

    const bid: Bid = { id: `bid_${Date.now()}`, auctionId, bidderId, bidderName: bidderName ?? bidderId, amountUSD, placedAt: new Date().toISOString() };
    auction.bids.push(bid);
    auction.currentBidUSD = amountUSD;
    auction.leadingBidderId = bidderId;
    auctions.set(auctionId, auction);

    return NextResponse.json({ success: true, bid, auctionCurrentBid: amountUSD });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
