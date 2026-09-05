export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";
import {
  canJoinDatingExperience,
  datingAccessPayload,
  DATING_EXPERIENCE_MANIFEST,
  type DatingExperienceRef,
} from "@/lib/trustSafety/DatingExperiencePolicy";
import {
  evaluateDatingExperienceForUserId,
  evaluateDatingJoinForUserId,
  unknownDatingSubject,
} from "@/lib/trustSafety/datingExperienceGuard";

/**
 * GET  /api/trustSafety/dating-access
 * POST /api/trustSafety/dating-access  { id?, slug?, roomId?, type?, experienceClass?, ... }
 *
 * Session actor. Fail closed when unauthenticated or age is unverified.
 * Product safety gate only — not a legal-compliance claim.
 */
function refFromRequest(req: NextRequest, body: DatingExperienceRef): DatingExperienceRef {
  const q = req.nextUrl.searchParams;
  return {
    id: body.id ?? q.get("id"),
    slug: body.slug ?? q.get("slug"),
    roomId: body.roomId ?? q.get("roomId"),
    name: body.name ?? q.get("name"),
    title: body.title ?? q.get("title"),
    type: body.type ?? q.get("type"),
    roomType: body.roomType ?? q.get("roomType"),
    category: body.category ?? q.get("category"),
    experienceClass: body.experienceClass ?? q.get("experienceClass"),
    minimumAge:
      typeof body.minimumAge === "number"
        ? body.minimumAge
        : q.get("minimumAge")
          ? Number(q.get("minimumAge"))
          : undefined,
    ageVerificationRequired:
      typeof body.ageVerificationRequired === "boolean"
        ? body.ageVerificationRequired
        : q.get("ageVerificationRequired") === "true"
          ? true
          : q.get("ageVerificationRequired") === "false"
            ? false
            : undefined,
    mode: body.mode ?? q.get("mode"),
  };
}

function hasRoomHint(ref: DatingExperienceRef): boolean {
  return Boolean(
    ref.id ||
      ref.slug ||
      ref.roomId ||
      ref.type ||
      ref.roomType ||
      ref.category ||
      ref.experienceClass ||
      ref.name ||
      ref.title ||
      ref.mode,
  );
}

async function decide(userId: string | null, ref: DatingExperienceRef) {
  if (!userId) {
    const decision = canJoinDatingExperience(
      unknownDatingSubject(""),
      hasRoomHint(ref) ? ref : DATING_EXPERIENCE_MANIFEST,
    );
    return NextResponse.json(
      { ...datingAccessPayload(decision), error: "Unauthorized" },
      { status: 401 },
    );
  }

  const decision = hasRoomHint(ref)
    ? await evaluateDatingJoinForUserId(userId, ref)
    : await evaluateDatingExperienceForUserId(userId);
  const status = decision.allowed ? 200 : decision.code === "NOT_DATING" ? 200 : 403;
  return NextResponse.json(
    {
      ...datingAccessPayload(decision),
      ageKnown: decision.ageKnown,
      ageAssurance: decision.ageAssurance,
      accountSafetyState: decision.accountSafetyState,
    },
    { status },
  );
}

export async function GET(req: NextRequest) {
  const auth = await getTmiAuth();
  return decide(auth?.user?.id ?? null, refFromRequest(req, {}));
}

export async function POST(req: NextRequest) {
  const auth = await getTmiAuth();
  let body: DatingExperienceRef = {};
  try {
    body = (await req.json()) as DatingExperienceRef;
  } catch {
    body = {};
  }
  return decide(auth?.user?.id ?? null, refFromRequest(req, body));
}
