export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  submitVote,
  getVoteResults,
  type SubmitVoteResult,
} from "@/lib/voting/CanonicalVotingRuntime";

async function resolveUserId(req: NextRequest): Promise<string | null> {
  const email = req.cookies.get("tmi_user_email")?.value;
  if (!email) return null;
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  return user?.id ?? null;
}

type Params = { params: Promise<{ id: string }> };

/**
 * POST /api/votes/[id]/submit
 * Submit a vote for a canonical vote interaction.
 * Body: { choiceId, idempotencyKey }
 */
export async function POST(req: NextRequest, { params }: Params) {
  const { id: voteId } = await params;
  const userId = await resolveUserId(req);
  if (!userId) {
    return NextResponse.json({ ok: false, reason: "NOT_AUTHENTICATED" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, reason: "INVALID_JSON" }, { status: 400 });
  }

  const { choiceId, idempotencyKey } = body;
  if (typeof choiceId !== "string" || typeof idempotencyKey !== "string") {
    return NextResponse.json({ ok: false, reason: "MISSING_FIELDS" }, { status: 400 });
  }

  const result: SubmitVoteResult = submitVote(voteId, userId, choiceId, idempotencyKey);

  if (!result.ok) {
    const status =
      result.reason === "VOTE_WINDOW_CLOSED" || result.reason === "VOTE_NOT_YET_OPEN"
        ? 409
        : result.reason === "ALREADY_VOTED_LOCKED"
        ? 429
        : 400;
    return NextResponse.json({ ok: false, reason: result.reason }, { status });
  }

  // Return current results (respects resultPolicy disclosure)
  const results = getVoteResults(voteId, userId);
  return NextResponse.json({ ok: true, choiceId: result.choiceId, results });
}

/**
 * GET /api/votes/[id]/submit (reused route — returns results)
 */
export async function GET(req: NextRequest, { params }: Params) {
  const { id: voteId } = await params;
  const userId = await resolveUserId(req);
  if (!userId) {
    return NextResponse.json({ ok: false, reason: "NOT_AUTHENTICATED" }, { status: 401 });
  }

  const results = getVoteResults(voteId, userId);
  if (!results.ok) {
    return NextResponse.json({ ok: false, reason: results.reason }, { status: 404 });
  }
  return NextResponse.json({ ok: true, results });
}
