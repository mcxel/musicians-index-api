import { type NextRequest, NextResponse } from "next/server";
import { NFTMintEngine, type NFTType } from "@/lib/nft/NFTMintEngine";

const VALID_TYPES: Set<NFTType> = new Set([
  "TICKET", "AVATAR_SKIN", "VENUE_PASS", "WINNER_BADGE", "SEASON_PASS", "COLLECTIBLE",
]);

const engine = new NFTMintEngine();

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const name = (formData.get("name") as string | null)?.trim() ?? "";
    const type = (formData.get("type") as string | null)?.toUpperCase() ?? "COLLECTIBLE";
    const royaltyPct = Number(formData.get("royaltyPct") ?? 5);
    const description = (formData.get("description") as string | null) ?? "";

    if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });
    if (!VALID_TYPES.has(type as NFTType)) {
      return NextResponse.json({ error: "invalid type" }, { status: 400 });
    }

    // Derive userId from session cookie if present — fall back to anonymous
    const sessionCookie = req.cookies.get("tmi_session")?.value ?? "";
    const ownerId = sessionCookie ? `user_${sessionCookie.slice(0, 12)}` : "anonymous";

    const nft = engine.mint({
      type: type as NFTType,
      name,
      ownerId,
      metadata: { description, royaltyPct, platform: "TMI", season: "S2" },
      transferable: true,
    });

    return NextResponse.json({ ok: true, id: nft.id, nftId: nft.id, name: nft.name, type: nft.type, mintedAt: nft.mintedAt });
  } catch (err) {
    console.error("[nft/mint]", err);
    return NextResponse.json({ error: "Mint failed" }, { status: 500 });
  }
}
