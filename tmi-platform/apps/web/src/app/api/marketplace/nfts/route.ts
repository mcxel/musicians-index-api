import { NextResponse } from "next/server";

interface NFTAsset {
  id: string;
  tokenId: string;
  title: string;
  creatorId: string;
  creatorName: string;
  type: "beat" | "ticket" | "avatar" | "artwork";
  priceUSD: number;
  edition: string;
  totalSupply: number;
  minted: number;
  contractAddress: string;
  metadataUri: string;
  createdAt: string;
}

const SEED_NFTS: NFTAsset[] = [
  { id: "n001", tokenId: "TMI-001", title: "Crown Night Genesis Beat", creatorId: "kreach", creatorName: "Kreach", type: "beat", priceUSD: 199, edition: "1/1", totalSupply: 1, minted: 0, contractAddress: "0xTMI001", metadataUri: "/nfts/tmi-001.json", createdAt: "2026-05-01" },
  { id: "n002", tokenId: "TMI-002", title: "Season 1 Fan Badge", creatorId: "tmi", creatorName: "TMI Platform", type: "avatar", priceUSD: 49, edition: "1/500", totalSupply: 500, minted: 12, contractAddress: "0xTMI002", metadataUri: "/nfts/tmi-002.json", createdAt: "2026-05-05" },
  { id: "n003", tokenId: "TMI-003", title: "World Dance Party Ticket #001", creatorId: "tmi-venue", creatorName: "TMI Venue", type: "ticket", priceUSD: 25, edition: "1/100", totalSupply: 100, minted: 8, contractAddress: "0xTMI003", metadataUri: "/nfts/tmi-003.json", createdAt: "2026-05-08" },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const creatorId = searchParams.get("creatorId");

  let nfts = SEED_NFTS;
  if (type) nfts = nfts.filter(n => n.type === type);
  if (creatorId) nfts = nfts.filter(n => n.creatorId === creatorId);

  return NextResponse.json({ nfts, total: nfts.length });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { nftId: string; buyerId: string };
    if (!body.nftId || !body.buyerId) {
      return NextResponse.json({ error: "nftId and buyerId required" }, { status: 400 });
    }
    const nft = SEED_NFTS.find(n => n.id === body.nftId);
    if (!nft) return NextResponse.json({ error: "NFT not found" }, { status: 404 });
    if (nft.minted >= nft.totalSupply) return NextResponse.json({ error: "Sold out" }, { status: 409 });

    return NextResponse.json({
      success: true,
      transaction: {
        id: `tx_${Date.now()}`,
        nftId: nft.id,
        tokenId: nft.tokenId,
        title: nft.title,
        buyerId: body.buyerId,
        paidUSD: nft.priceUSD,
        editionNumber: nft.minted + 1,
        mintedAt: new Date().toISOString(),
      },
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
