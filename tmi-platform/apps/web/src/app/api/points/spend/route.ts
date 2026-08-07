export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { spendFanCredits, getFanCreditsBalance } from "@/lib/points/pointsFulfillment";
import {
  chassisIdFromSpendOfferId,
  listPointsSpendOffers,
  participationCost,
  yophoSceneIdFromOfferId,
  yophoSkinIdFromOfferId,
  type ParticipationCostKey,
} from "@/lib/points/PointsSpendCatalog";
import { purchaseChassisWithPointsDb } from "@/lib/artifacts/MediaPlayerOwnershipService";
import { battleChallengeEconomyEngine } from "@/lib/competition/BattleChallengeEconomyEngine";
import {
  hasYophoUnlock,
  isKnownYophoScene,
  isKnownYophoSkin,
} from "@/lib/yopho/yophoPointsUnlock";

/**
 * POST /api/points/spend
 * Body:
 *  { kind: "participation", costKey: "battle_standard"|"cypher_entry"|..., referenceId?: string }
 *  { kind: "offer", offerId: string }
 *  { kind: "playlist_skin", chassisId: string }
 *
 * Never accepts judged-outcome vote purchases.
 */
export async function POST(req: NextRequest) {
  let body: {
    kind?: string;
    costKey?: string;
    offerId?: string;
    chassisId?: string;
    referenceId?: string;
  } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const fanEmail = req.cookies.get("tmi_user_email")?.value ?? "";
  const buyer = fanEmail
    ? await prisma.user.findFirst({ where: { email: fanEmail.toLowerCase() }, select: { id: true, role: true } })
    : null;
  if (!buyer) {
    return NextResponse.json({ error: "Sign in required", code: "AUTH_REQUIRED" }, { status: 401 });
  }

  const kind = (body.kind ?? "").toLowerCase();

  if (kind === "participation") {
    const costKey = (body.costKey ?? "ready_up") as ParticipationCostKey;
    const cost = participationCost(costKey);
    if (cost <= 0) {
      return NextResponse.json({ ok: true, spent: 0, balance: await getFanCreditsBalance(buyer.id), note: "free_entry" });
    }
    const ref = body.referenceId ?? `participation_${costKey}_${buyer.id}_${Date.now()}`;
    const result = await spendFanCredits({
      userId: buyer.id,
      points: cost,
      category: "DEBIT_PARTICIPATION",
      referenceId: ref,
      note: `Participation: ${costKey} (−${cost} pts)`,
    });
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error, balance: result.balance, required: cost, buyPointsHref: "/store/points" },
        { status: 402 },
      );
    }
    // Keep in-memory challenge ledger in sync for legacy callers.
    battleChallengeEconomyEngine.awardPoints(buyer.id, 0);
    battleChallengeEconomyEngine.seedUser(buyer.id, result.balance);
    return NextResponse.json({ ok: true, spent: result.spent, balance: result.balance, costKey });
  }

  if (kind === "playlist_skin") {
    const chassisId = body.chassisId ?? chassisIdFromSpendOfferId(body.offerId ?? "") ?? "";
    if (!chassisId) {
      return NextResponse.json({ error: "chassisId required" }, { status: 400 });
    }
    const purchased = await purchaseChassisWithPointsDb(buyer.id, chassisId as never);
    if (!purchased.ok) {
      return NextResponse.json(
        { error: purchased.error, balance: purchased.balance, buyPointsHref: "/store/points" },
        { status: 402 },
      );
    }
    return NextResponse.json({
      ok: true,
      spent: purchased.spent,
      balance: purchased.state.pointsBalance,
      chassisId,
    });
  }

  if (kind === "offer") {
    const offers = listPointsSpendOffers("ALL");
    const offer = offers.find((o) => o.id === body.offerId);
    if (!offer) {
      return NextResponse.json(
        { error: "Offer not found", code: "EMPTY_CATALOG_ITEM", buyPointsHref: "/store/points" },
        { status: 404 },
      );
    }

    // Fan-only cosmetics: block performers from avatar ownership offers (Rule 26).
    const role = (buyer.role ?? "").toUpperCase();
    const isPerformer = ["PERFORMER", "ARTIST", "BAND"].includes(role);
    if (isPerformer && offer.role === "FAN") {
      return NextResponse.json(
        { error: "Fan-only cosmetic (Rule 26 — no avatar ownership for performers)", code: "ROLE_GATE" },
        { status: 403 },
      );
    }
    if (!isPerformer && offer.role === "PERFORMER" && offer.category === "venue_upgrade") {
      return NextResponse.json(
        { error: "Performer venue upgrades — switch to performer store", code: "ROLE_GATE", href: "/store/venue-skins" },
        { status: 403 },
      );
    }

    if (offer.category === "playlist_skin") {
      const chassisId = chassisIdFromSpendOfferId(offer.id);
      if (!chassisId) {
        return NextResponse.json({ error: "Chassis catalog item missing", code: "EMPTY_CATALOG_ITEM" }, { status: 404 });
      }
      const purchased = await purchaseChassisWithPointsDb(buyer.id, chassisId);
      if (!purchased.ok) {
        return NextResponse.json(
          { error: purchased.error, balance: purchased.balance, buyPointsHref: "/store/points" },
          { status: 402 },
        );
      }
      return NextResponse.json({ ok: true, spent: purchased.spent, balance: purchased.state.pointsBalance, offerId: offer.id });
    }

    if (offer.category === "yopho") {
      const skinId = yophoSkinIdFromOfferId(offer.id);
      const sceneId = yophoSceneIdFromOfferId(offer.id);
      if (skinId && !isKnownYophoSkin(skinId)) {
        return NextResponse.json({ error: "YoPho skin missing from catalog", code: "EMPTY_CATALOG_ITEM" }, { status: 404 });
      }
      if (sceneId && !isKnownYophoScene(sceneId)) {
        return NextResponse.json({ error: "YoPho scene missing from catalog", code: "EMPTY_CATALOG_ITEM" }, { status: 404 });
      }
      if (!skinId && !sceneId) {
        return NextResponse.json({ error: "YoPho catalog item missing", code: "EMPTY_CATALOG_ITEM" }, { status: 404 });
      }
      const unlockKey = skinId ? `yopho_skin_${skinId}` : `yopho_scene_${sceneId}`;
      const already = await hasYophoUnlock(buyer.id, skinId ? "skin" : "scene", (skinId ?? sceneId)!);
      if (already) {
        return NextResponse.json({
          ok: true,
          spent: 0,
          balance: await getFanCreditsBalance(buyer.id),
          offerId: offer.id,
          yophoSkinId: skinId,
          yophoSceneId: sceneId,
          reused: true,
        });
      }
      const result = await spendFanCredits({
        userId: buyer.id,
        points: offer.pointsCost,
        category: "DEBIT_YOPHO",
        referenceId: unlockKey,
        note: `${offer.label} (−${offer.pointsCost} pts)`,
      });
      if (!result.ok) {
        return NextResponse.json(
          { error: result.error, balance: result.balance, required: offer.pointsCost, buyPointsHref: "/store/points" },
          { status: 402 },
        );
      }
      return NextResponse.json({
        ok: true,
        spent: result.spent,
        balance: result.balance,
        offerId: offer.id,
        href: offer.href,
        engine: offer.engine,
        yophoSkinId: skinId,
        yophoSceneId: sceneId,
      });
    }

    const ref = body.referenceId ?? `offer_${offer.id}_${buyer.id}_${Date.now()}`;
    const result = await spendFanCredits({
      userId: buyer.id,
      points: offer.pointsCost,
      category: `DEBIT_${offer.category.toUpperCase()}`,
      referenceId: ref,
      note: `${offer.label} (−${offer.pointsCost} pts)`,
    });
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error, balance: result.balance, required: offer.pointsCost, buyPointsHref: "/store/points" },
        { status: 402 },
      );
    }
    return NextResponse.json({
      ok: true,
      spent: result.spent,
      balance: result.balance,
      offerId: offer.id,
      href: offer.href,
      engine: offer.engine,
    });
  }

  return NextResponse.json({ error: "kind must be participation | playlist_skin | offer" }, { status: 400 });
}

export async function GET(req: NextRequest) {
  const roleParam = (req.nextUrl.searchParams.get("role") ?? "ALL").toUpperCase();
  const role =
    roleParam === "FAN" || roleParam === "PERFORMER" ? (roleParam as "FAN" | "PERFORMER") : "ALL";
  const offers = listPointsSpendOffers(role);
  return NextResponse.json({
    offers,
    categories: [
      "participation",
      "cosmetics",
      "venue_upgrade",
      "playlist_skin",
      "yopho",
      "booster",
      "scene",
      "background",
      "menu",
    ],
    antiPayToWin: "Points buy access/entry/cosmetics/exposure only — never judged outcomes or chart rank.",
  });
}
