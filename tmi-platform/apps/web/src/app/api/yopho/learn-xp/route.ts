export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  YOPHO_LEARNING_TRACK_TARGET_XP,
  getXpValue,
  type XpActionKey,
} from "@/lib/xp/XpActionRegistry";
import { DAILY_XP_CAP } from "@/lib/progression/ProgressionEngine";
import { isYoPhoLearningAction } from "@/lib/yopho/YoPhoLearningTrack";

/**
 * POST /api/yopho/learn-xp
 *
 * Once-per-action durable XP for the Free YoPho 500-point learning track.
 * Same ParticipationLedger + UserStats path as magazine read-xp (Rule 9).
 * No cash. Unauthenticated → honest granted: 0.
 */
export async function POST(req: NextRequest) {
  const sessionId = req.cookies.get("tmi_session_id")?.value ?? "";
  const rawEmail = req.cookies.get("tmi_user_email")?.value ?? "";
  if (!sessionId && !rawEmail) {
    return NextResponse.json({ ok: true, granted: 0, reason: "unauthenticated" });
  }

  let body: { actionKey?: string } = {};
  try {
    body = (await req.json()) as { actionKey?: string };
  } catch {
    /* default */
  }
  const actionKey = (body.actionKey ?? "").trim();
  if (!isYoPhoLearningAction(actionKey)) {
    return NextResponse.json({ ok: false, error: "invalid_action" }, { status: 400 });
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        ...(sessionId ? [{ id: sessionId }] : []),
        ...(rawEmail ? [{ email: rawEmail }] : []),
      ],
    },
    select: { id: true },
  });
  if (!user) {
    return NextResponse.json({ ok: true, granted: 0, reason: "unauthenticated" });
  }
  const userId = user.id;
  const xpKey = actionKey as XpActionKey;

  const existing = await prisma.participationLedger.findFirst({
    where: { userId, actionType: xpKey },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json({
      ok: true,
      granted: 0,
      reason: "already_earned",
      targetXp: YOPHO_LEARNING_TRACK_TARGET_XP,
    });
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const todaysGrants = await prisma.participationLedger.findMany({
    where: { userId, timestamp: { gte: startOfDay } },
    select: { points: true },
  });
  const earnedToday = todaysGrants.reduce((sum, g) => sum + g.points, 0);
  const room = Math.max(0, DAILY_XP_CAP - earnedToday);
  if (room <= 0) {
    return NextResponse.json({
      ok: true,
      granted: 0,
      reason: "daily_cap_reached",
      earnedToday,
      dailyCap: DAILY_XP_CAP,
    });
  }

  const faceValue = getXpValue(xpKey);
  const granted = Math.min(faceValue, room);
  const capped = granted < faceValue;

  const stats = await prisma.$transaction(async (tx) => {
    await tx.participationLedger.create({
      data: {
        userId,
        actionType: xpKey,
        points: granted,
        metadata: { track: "yopho_free_learning", targetXp: YOPHO_LEARNING_TRACK_TARGET_XP },
      },
    });
    return tx.userStats.upsert({
      where: { userId },
      update: { xp: { increment: granted } },
      create: { userId, xp: granted },
    });
  });

  return NextResponse.json({
    ok: true,
    granted,
    capped,
    actionKey: xpKey,
    total: stats.xp,
    targetXp: YOPHO_LEARNING_TRACK_TARGET_XP,
  });
}
