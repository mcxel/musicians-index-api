export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";
import { evaluatePrivateInteractForUserIds } from "@/lib/trustSafety/resolveYouthSocialSubject";
import {
  isPrivateInteractContext,
  type PrivateInteractContext,
} from "@/lib/trustSafety/YouthSocialGuard";

/**
 * POST /api/trustSafety/one-to-one  { targetUserId, context? }
 * GET  /api/trustSafety/one-to-one?targetUserId=&context=
 *
 * Session actor vs target. Fail closed when unauthenticated or age is missing.
 * context: DM | CALL | PRIVATE_VIDEO | BREAKOUT_INVITE | PRIVATE_MONITOR_ROUTE | SCREEN_SHARE
 */
function parseContext(raw: string | null | undefined): PrivateInteractContext {
  const value = (raw ?? "DM").trim().toUpperCase();
  return isPrivateInteractContext(value) ? value : "DM";
}

async function decide(actorUserId: string, targetUserId: string, context: PrivateInteractContext) {
  const decision = await evaluatePrivateInteractForUserIds(actorUserId, targetUserId, context);
  const status = decision.allowed ? 200 : 403;
  return NextResponse.json(
    {
      allowed: decision.allowed,
      blocked: decision.blocked,
      reason: decision.reason,
      code: decision.code,
      context: decision.context,
      actorBand: decision.actorBand,
      targetBand: decision.targetBand,
      actorAssurance: decision.actorAssurance,
      targetAssurance: decision.targetAssurance,
      error: decision.allowed ? undefined : decision.reason,
    },
    { status },
  );
}

export async function GET(req: NextRequest) {
  const auth = await getTmiAuth();
  if (!auth?.user?.id) {
    return NextResponse.json(
      {
        allowed: false,
        blocked: true,
        reason: "blocked: age unknown — private contact denied until age is on the account",
        code: "UNKNOWN_AGE",
        error: "Unauthorized",
      },
      { status: 401 },
    );
  }
  const targetUserId = req.nextUrl.searchParams.get("targetUserId") ?? "";
  if (!targetUserId.trim()) {
    return NextResponse.json(
      {
        allowed: false,
        blocked: true,
        reason: "blocked: private interaction requires two real account identities",
        code: "NO_TARGET",
        error: "targetUserId required",
      },
      { status: 400 },
    );
  }
  return decide(auth.user.id, targetUserId, parseContext(req.nextUrl.searchParams.get("context")));
}

export async function POST(req: NextRequest) {
  const auth = await getTmiAuth();
  if (!auth?.user?.id) {
    return NextResponse.json(
      {
        allowed: false,
        blocked: true,
        reason: "blocked: age unknown — private contact denied until age is on the account",
        code: "UNKNOWN_AGE",
        error: "Unauthorized",
      },
      { status: 401 },
    );
  }

  let body: { targetUserId?: string; context?: string } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    body = {};
  }
  const targetUserId = (body.targetUserId ?? "").trim();
  if (!targetUserId) {
    return NextResponse.json(
      {
        allowed: false,
        blocked: true,
        reason: "blocked: private interaction requires two real account identities",
        code: "NO_TARGET",
        error: "targetUserId required",
      },
      { status: 400 },
    );
  }
  return decide(auth.user.id, targetUserId, parseContext(body.context));
}
