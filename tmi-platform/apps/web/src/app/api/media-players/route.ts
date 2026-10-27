export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import prisma, { isPrismaTableMissingError } from "@/lib/prisma";
import {
  FREE_DEFAULT_CHASSIS_ID,
  MEDIA_PLAYER_CHASSIS_REGISTRY,
  MEDIA_PLAYER_STORE_SKUS,
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
import { resolveTierFromDb } from "@/lib/auth/resolveAuthoritativeTier";

async function resolveUserId(req: NextRequest): Promise<string | null> {
  try {
    const email = req.cookies.get("tmi_user_email")?.value;
    if (!email) return null;
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    }).catch(() => null);
    return user?.id ?? null;
  } catch {
    return null;
  }
}

/** Free starters + tier rewards + store SKUs — store UI groups by unlockMethod. */
function catalogPayload() {
  const freeIds: MediaPlayerChassisId[] = [
    FREE_DEFAULT_CHASSIS_ID,
    "tmi_classic",
    "tmi_dark",
    "tmi_neon",
  ];
  const tierIds = (
    Object.values(MEDIA_PLAYER_CHASSIS_REGISTRY) as Array<
      (typeof MEDIA_PLAYER_CHASSIS_REGISTRY)[MediaPlayerChassisId]
    >
  )
    .filter((c) => c.unlockMethod === "tier")
    .map((c) => c.id);
  const ids = Array.from(
    new Set<MediaPlayerChassisId>([...freeIds, ...tierIds, ...MEDIA_PLAYER_STORE_SKUS]),
  );

  return ids.map((id) => {
    const c = MEDIA_PLAYER_CHASSIS_REGISTRY[id];
    return {
      id: c.id,
      label: c.label,
      icon: c.icon,
      theme: c.theme,
      accent: c.accent,
      rarity: c.rarity,
      unlockMethod: c.unlockMethod,
      freeDefault: c.freeDefault,
      tierRequired: c.tierRequired ?? null,
      pricePoints: c.pricePoints ?? getChassisPricePoints(c.id),
      priceUsdCents: c.priceUsdCents ?? getChassisPriceUsdCents(c.id),
      storeSku: c.storeSku ?? null,
      storeListed: c.storeListed ?? MEDIA_PLAYER_STORE_SKUS.includes(c.id),
      animationPack: c.animationPack,
      visualizerStyle: c.visualizerStyle,
    };
  });
}

/** GET — ownership + equipped + store catalog. Provisions free Standard on first access. */
export async function GET(req: NextRequest) {
  const catalog = catalogPayload();
  const defaultFreeState = {
    authenticated: false,
    catalog,
    ownedChassisIds: ["standard", "tmi_classic", "tmi_dark", "tmi_neon"] as MediaPlayerChassisId[],
    equippedChassisId: "standard" as MediaPlayerChassisId,
    pointsBalance: 0,
  };

  try {
    const userId = await resolveUserId(req);
    if (!userId) {
      return NextResponse.json(defaultFreeState);
    }

    const state = await getMediaPlayerOwnership(userId);
    return NextResponse.json({
      authenticated: true,
      catalog,
      ...state,
    });
  } catch (err: unknown) {
    if (isPrismaTableMissingError(err, "media_player")) {
      console.warn(
        "[api/media-players] MEDIA_PLAYER_DEGRADED_MODE: MEDIA_PLAYER_SCHEMA_UNAVAILABLE in route GET. Returning 200 with starter chassis.",
      );
      return NextResponse.json({
        authenticated: true,
        catalog,
        ownedChassisIds: ["standard", "tmi_classic", "tmi_dark", "tmi_neon"] as MediaPlayerChassisId[],
        equippedChassisId: "standard" as MediaPlayerChassisId,
        pointsBalance: 0,
        degradedMode: true,
        degradedReason: "MEDIA_PLAYER_SCHEMA_UNAVAILABLE",
      });
    }
    console.error("[api/media-players] UNEXPECTED_SERVER_ERROR in GET /api/media-players:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
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
    // SECURITY (2026-09-23): previously trusted the client-writable `tmi_tier`
    // cookie directly, with zero server-side re-verification — a Free user
    // could forge `tmi_tier=DIAMOND` in devtools and equip a Diamond-exclusive
    // chassis. Tier is now resolved fresh from the DB via the same honesty-
    // gated resolver session routes use, so a stale/unverified paid tier row
    // still can't equip past what's actually verified.
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, tier: true },
    });
    const verifiedTier = resolveTierFromDb(dbUser?.email ?? "", dbUser?.tier);
    const result = await equipChassisDb(userId, chassisId, verifiedTier);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 403 });
    }
    return NextResponse.json({ ok: true, ...result.state });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
