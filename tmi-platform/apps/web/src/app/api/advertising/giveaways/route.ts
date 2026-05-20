import { NextResponse } from "next/server";

interface Giveaway {
  id: string;
  advertiserId: string;
  advertiserName: string;
  title: string;
  description: string;
  prizeValue: number;
  prizeCurrency: "USD" | "XP" | "DIAMOND";
  targetRoom?: string;
  triggeredAt?: string;
  claimedBy?: string[];
  maxClaims: number;
  status: "pending" | "active" | "claimed" | "expired";
  expiresAt: string;
}

const giveaways = new Map<string, Giveaway>([
  ["g001", {
    id: "g001",
    advertiserId: "adv_a",
    advertiserName: "BeatGear Co",
    title: "Free Premium Beat License",
    description: "BeatGear Co is gifting a free premium beat license to one lucky viewer.",
    prizeValue: 49.99,
    prizeCurrency: "USD",
    targetRoom: "world-dance-party",
    claimedBy: [],
    maxClaims: 1,
    status: "active",
    expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
  }],
]);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const room = searchParams.get("room");
  const status = searchParams.get("status") ?? "active";
  let all = [...giveaways.values()];
  if (status) all = all.filter(g => g.status === status);
  if (room) all = all.filter(g => !g.targetRoom || g.targetRoom === room);
  return NextResponse.json({ giveaways: all });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      action?: "create" | "claim";
      giveawayId?: string;
      claimerId?: string;
      advertiserId?: string;
      advertiserName?: string;
      title?: string;
      description?: string;
      prizeValue?: number;
      prizeCurrency?: "USD" | "XP" | "DIAMOND";
      targetRoom?: string;
      maxClaims?: number;
      expiresInHours?: number;
    };

    // Claim action
    if (body.action === "claim" || body.giveawayId) {
      const { giveawayId, claimerId } = body;
      if (!giveawayId || !claimerId) {
        return NextResponse.json({ error: "giveawayId and claimerId required" }, { status: 400 });
      }
      const giveaway = giveaways.get(giveawayId);
      if (!giveaway) return NextResponse.json({ error: "Giveaway not found" }, { status: 404 });
      if (giveaway.status !== "active") return NextResponse.json({ error: "Giveaway not active" }, { status: 409 });
      if ((giveaway.claimedBy?.length ?? 0) >= giveaway.maxClaims) return NextResponse.json({ error: "All claims taken" }, { status: 409 });
      if (giveaway.claimedBy?.includes(claimerId)) return NextResponse.json({ error: "Already claimed" }, { status: 409 });

      giveaway.claimedBy = [...(giveaway.claimedBy ?? []), claimerId];
      if (giveaway.claimedBy.length >= giveaway.maxClaims) giveaway.status = "claimed";
      giveaways.set(giveawayId, giveaway);
      return NextResponse.json({ success: true, claimed: true, prize: { value: giveaway.prizeValue, currency: giveaway.prizeCurrency } });
    }

    // Create action
    const { advertiserId, advertiserName, title, description, prizeValue, prizeCurrency, targetRoom, maxClaims, expiresInHours } = body;
    if (!advertiserId || !title || !prizeValue) {
      return NextResponse.json({ error: "advertiserId, title, and prizeValue required" }, { status: 400 });
    }
    const giveaway: Giveaway = {
      id: `g_${Date.now()}`,
      advertiserId,
      advertiserName: advertiserName ?? advertiserId,
      title,
      description: description ?? "",
      prizeValue,
      prizeCurrency: prizeCurrency ?? "USD",
      targetRoom: targetRoom ?? undefined,
      claimedBy: [],
      maxClaims: maxClaims ?? 1,
      status: "active",
      expiresAt: new Date(Date.now() + (expiresInHours ?? 24) * 60 * 60 * 1000).toISOString(),
    };
    giveaways.set(giveaway.id, giveaway);
    return NextResponse.json({ success: true, giveaway }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
