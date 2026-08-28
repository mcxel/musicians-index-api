export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  createVoteInteraction,
  getVoteInteraction,
  listVoteInteractionsByExperience,
  type PolicyFamily,
  type VoteChangePolicy,
  type ResultPolicy,
  type VoteChoice,
} from "@/lib/voting/CanonicalVotingRuntime";

async function resolveUserId(req: NextRequest): Promise<string | null> {
  const email = req.cookies.get("tmi_user_email")?.value;
  if (!email) return null;
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  return user?.id ?? null;
}

/**
 * POST /api/votes
 * Create a vote interaction.
 * Body: {
 *   id, policyFamily, experienceId, roomId, roundId?,
 *   opensAt (UTC ms), closesAt (UTC ms),
 *   choices: [{ id, label }],
 *   resultPolicy, voteChangePolicy, allowWinnerVote
 * }
 * Only admins and system tokens can create vote interactions.
 */
export async function POST(req: NextRequest) {
  const userId = await resolveUserId(req);
  if (!userId) {
    return NextResponse.json({ ok: false, reason: "NOT_AUTHENTICATED" }, { status: 401 });
  }

  // Check admin or system role
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  const isAdmin = user?.role === "ADMIN" || userId.startsWith("system_");
  if (!isAdmin) {
    return NextResponse.json({ ok: false, reason: "FORBIDDEN" }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, reason: "INVALID_JSON" }, { status: 400 });
  }

  const {
    id,
    policyFamily,
    experienceId,
    roomId,
    roundId,
    opensAt,
    closesAt,
    choices,
    resultPolicy,
    voteChangePolicy,
    allowWinnerVote,
  } = body;

  if (
    typeof id !== "string" ||
    typeof policyFamily !== "string" ||
    typeof experienceId !== "string" ||
    typeof roomId !== "string" ||
    typeof opensAt !== "number" ||
    typeof closesAt !== "number" ||
    !Array.isArray(choices) ||
    typeof resultPolicy !== "string" ||
    typeof voteChangePolicy !== "string" ||
    typeof allowWinnerVote !== "boolean"
  ) {
    return NextResponse.json({ ok: false, reason: "MISSING_OR_INVALID_FIELDS" }, { status: 400 });
  }

  if (opensAt >= closesAt) {
    return NextResponse.json({ ok: false, reason: "INVALID_TIME_WINDOW" }, { status: 400 });
  }

  // Cypher guard — must NOT allow winner vote
  if (policyFamily === "COMPETITION_VOTE" && experienceId.startsWith("cypher_") && allowWinnerVote) {
    return NextResponse.json(
      { ok: false, reason: "CYPHERS_DO_NOT_ALLOW_WINNER_VOTE" },
      { status: 400 },
    );
  }

  const record = createVoteInteraction({
    id,
    policyFamily: policyFamily as PolicyFamily,
    experienceId,
    roomId,
    roundId: typeof roundId === "string" ? roundId : undefined,
    opensAt,
    closesAt,
    choices: choices as VoteChoice[],
    resultPolicy: resultPolicy as ResultPolicy,
    voteChangePolicy: voteChangePolicy as VoteChangePolicy,
    allowWinnerVote,
  });

  return NextResponse.json({ ok: true, record }, { status: 201 });
}

/**
 * GET /api/votes?experienceId=...
 * List all vote interactions for an experience (admin only).
 */
export async function GET(req: NextRequest) {
  const userId = await resolveUserId(req);
  if (!userId) {
    return NextResponse.json({ ok: false, reason: "NOT_AUTHENTICATED" }, { status: 401 });
  }

  const experienceId = req.nextUrl.searchParams.get("experienceId");
  if (!experienceId) {
    return NextResponse.json({ ok: false, reason: "MISSING_experienceId" }, { status: 400 });
  }

  const records = listVoteInteractionsByExperience(experienceId);
  return NextResponse.json({ ok: true, records });
}
