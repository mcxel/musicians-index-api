export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";
import prisma from "@/lib/prisma";
import { eventOrchestrator } from "@/lib/competition/EventOrchestrator";
import { battleFormatRulesEngine, type BattleFormatType } from "@/lib/competition/BattleFormatRulesEngine";
import { canCreateBattle, canCreateMoreSessions } from "@/lib/subscriptions/BattleCreationGate";
import type { SubscriptionTier } from "@/lib/subscriptions/SubscriptionPricingEngine";

// Rule 21 amendment (2026-07-24): a Mini Battle clones the same real
// EventOrchestrator/LobbyEvent pipeline World events use (Rule 21's "one
// runtime, many modes"), just tagged isMini + creatorUserId instead of being
// bot-created. No separate "Mini Battle engine" exists or should exist.

function normalizeTier(raw: string): SubscriptionTier {
  const upper = raw.toUpperCase();
  if (upper === "RUBY") return "RUBY";
  return raw.toLowerCase() as SubscriptionTier;
}

/**
 * GET /api/battles/mini — real, active Mini Battles for the /battles wall.
 */
export async function GET() {
  const rows = await prisma.lobbyEvent.findMany({
    where: { isMini: true, status: { not: "completed" } },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  const battles = rows.map((r) => ({
    roomId: r.roomId,
    title: r.title,
    format: r.format,
    genreName: r.genreName,
    status: r.status,
    creatorUserId: r.creatorUserId,
    viewerCount: r.viewerCount,
    updatedAt: r.updatedAt,
  }));

  return NextResponse.json({ success: true, battles });
}

/**
 * POST /api/battles/mini — create-and-land: qualified user instantly opens
 * a real Mini Battle room, clones the World Battle pipeline (EventOrchestrator
 * -> Prisma LobbyEvent), no bot host/PA (showId doesn't resolve in
 * HostShowAssignmentEngine, which is correct for a user-run Mini event).
 */
export async function POST(req: Request) {
  const auth = await getTmiAuth();
  if (!auth) {
    return NextResponse.json({ error: "authentication_required" }, { status: 401 });
  }

  const tier = normalizeTier(auth.user.tier || "free");
  const creationGate = canCreateBattle(tier);
  if (!creationGate.allowed) {
    return NextResponse.json(
      { error: "tier_gate", ...creationGate },
      { status: 403 }
    );
  }

  const activeSessions = await prisma.lobbyEvent.count({
    where: { creatorUserId: auth.user.id, isMini: true, status: { not: "completed" } },
  });
  const sessionGate = canCreateMoreSessions(tier, activeSessions);
  if (!sessionGate.allowed) {
    return NextResponse.json({ error: "session_limit", ...sessionGate }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const format = (typeof body?.format === "string" ? body.format : "open-performer-challenge") as BattleFormatType;
  const rule = battleFormatRulesEngine.getRule(format);
  if (!rule) {
    return NextResponse.json({ error: "invalid_format", format }, { status: 400 });
  }

  const genreId = typeof body?.genreId === "string" ? body.genreId : undefined;
  const genreName = typeof body?.genreName === "string" ? body.genreName : undefined;
  const title = typeof body?.title === "string" && body.title.trim()
    ? body.title.trim()
    : `${auth.user.name}'s Mini ${rule.label}`;

  const roomId = `mini-battle-${randomUUID()}`;

  const compiled = await eventOrchestrator.compileEvent(
    roomId,
    "mini-battle", // no HostShowAssignmentEngine entry by design - Mini events are user-run, not bot-hosted
    format,
    0,
    { genreId, genreName, title },
    { creatorUserId: auth.user.id, isMini: true }
  );

  if (!compiled) {
    return NextResponse.json({ error: "compile_failed" }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    roomId: compiled.roomId,
    title: compiled.title,
    format: compiled.format,
    // Routes through the real LobbyEntryFlow (Rule 15) rather than the
    // canonical room directly - /live/rooms/[id] gates direct entry behind
    // an authorized-referrer allowlist by design, and the creator still
    // needs a real seat assignment like any other entrant.
    joinUrl: `/live/lobby?room=${encodeURIComponent(compiled.roomId)}`,
  });
}
