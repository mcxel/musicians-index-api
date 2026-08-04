export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  listStoreMediaPlayers,
  MEDIA_PLAYER_CHASSIS_REGISTRY,
  type MediaPlayerChassisId,
} from "@/lib/artifacts/PlaylistArtifactEngine";
import {
  equipChassisDb,
  getChassisPricePoints,
  getChassisPriceUsdCents,
  getMediaPlayerOwnership,
  purchaseChassisWithPointsDb,
  unequipChassisDb,
} from "@/lib/artifacts/MediaPlayerOwnershipService";

async function resolveUserId(req: NextRequest): Promise<string | null> {
  const email = req.cookies.get("tmi_user_email")?.value;
  if (!email) return null;
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  return user?.id ?? null;
}

function catalogPayload() {
  return listStoreMediaPlayers().map((c) => ({
    id: c.id,
    label: c.label,
    icon: c.icon,
    theme: c.theme,
    accent: c.accent,
    rarity: c.rarity,
    pricePoints: getChassisPricePoints(c.id),
    priceUsdCents: getChassisPriceUsdCents(c.id),
    storeSku: c.storeSku ?? null,
    animationPack: c.animationPack,
  }));
}

/** GET — ownership + equipped + store catalog. Provisions free Standard on first access. */
export async function GET(req: NextRequest) {
  const catalog = catalogPayload();
  const userId = await resolveUserId(req);
  if (!userId) {
    return NextResponse.json({
      authenticated: false,
      catalog,
      ownedChassisIds: ["standard", "tmi_classic", "tmi_dark", "tmi_neon"],
      equippedChassisId: "standard",
      pointsBalance: 0,
    });
  }

  const state = await getMediaPlayerOwnership(userId);
  return NextResponse.json({
    authenticated: true,
    catalog,
    ...state,
  });
}

type Body = {
  action?: "purchase_points" | "equip" | "unequip" | "provision";
  chassisId?: string;
};

/** POST — points purchase, equip, unequip, provision. Stripe uses /api/stripe/checkout. */
export async function POST(req: NextRequest) {
  const userId = await resolveUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const body = (await req.json()) as Body;
  const action = body.action ?? "provision";

  if (action === "provision") {
    const state = await getMediaPlayerOwnership(userId);
    return NextResponse.json({ ok: true, ...state });
  }

  if (action === "unequip") {
    const state = await unequipChassisDb(userId);
    return NextResponse.json({ ok: true, ...state });
  }

  const chassisId = body.chassisId as MediaPlayerChassisId | undefined;
  if (!chassisId || !(chassisId in MEDIA_PLAYER_CHASSIS_REGISTRY)) {
    return NextResponse.json({ error: "Unknown chassis" }, { status: 400 });
  }

  if (action === "purchase_points") {
    const result = await purchaseChassisWithPointsDb(userId, chassisId);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error, balance: result.balance },
        { status: 402 },
      );
    }
    return NextResponse.json({
      ok: true,
      spent: result.spent,
      ...result.state,
    });
  }

  if (action === "equip") {
    const cookieTier = (req.cookies.get("tmi_tier")?.value ?? "FREE").toUpperCase() as
      | "FREE"
      | "PRO"
      | "RUBY"
      | "SILVER"
      | "GOLD"
      | "PLATINUM"
      | "DIAMOND";
    const result = await equipChassisDb(userId, chassisId, cookieTier);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 403 });
    }
    return NextResponse.json({ ok: true, ...result.state });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
