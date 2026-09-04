export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resolveTierFromDb } from "@/lib/auth/resolveAuthoritativeTier";
import {
  authorizeProfileMediaPlayerPost,
  parseProfileMediaPlayerCommand,
} from "@/lib/auth/profileMediaPlayerSecurity";
import {
  executeProfileMediaPlayerCommand,
  resolveOwnerUserIdBySlug,
  resolveProfileMediaPlayerPresentation,
  toPublicMediaPlayerPayload,
} from "@/lib/profile/ProfileMediaPlayerService";

async function resolveSession(req: NextRequest) {
  const email = req.cookies.get("tmi_user_email")?.value;
  const sessionId = req.cookies.get("tmi_session_id")?.value;
  if (!email || !sessionId) return null;
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, role: true, tier: true },
  });
  return user ?? null;
}

/**
 * GET — public presentation-safe resolver.
 * Query: ?slug= | ?username= (public) — never accepts arbitrary performerId without lookup.
 */
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug") ?? req.nextUrl.searchParams.get("username");
  if (!slug?.trim()) {
    return NextResponse.json({ ok: false, error: "slug or username required." }, { status: 400 });
  }

  const ownerUserId = await resolveOwnerUserIdBySlug(slug);
  if (!ownerUserId) {
    return NextResponse.json({ ok: false, error: "Profile not found." }, { status: 404 });
  }

  try {
    const state = await resolveProfileMediaPlayerPresentation(ownerUserId);
    return NextResponse.json({
      ok: true,
      slug: slug.trim().toLowerCase(),
      ...toPublicMediaPlayerPayload(state),
    });
  } catch (err) {
    console.error("[api/profile/media-player GET]", err);
    return NextResponse.json({ ok: false, error: "Failed to resolve media player." }, { status: 500 });
  }
}

type PostBody = {
  command?: string;
  chassisId?: string | null;
  ownerUserId?: string;
  performerId?: string;
};

/**
 * POST — auth required; caller must own target (not arbitrary performerId).
 * Commands: EQUIP_ACTIVE | EQUIP_PROFILE | FOLLOW_ACTIVE
 */
export async function POST(req: NextRequest) {
  const session = await resolveSession(req);
  const body = (await req.json().catch(() => ({}))) as PostBody;
  const command = parseProfileMediaPlayerCommand(body.command);
  if (!command) {
    return NextResponse.json({ ok: false, error: "Invalid command." }, { status: 400 });
  }

  const auth = authorizeProfileMediaPlayerPost({
    sessionUserId: session?.id ?? null,
    sessionRole: session?.role ?? null,
    bodyOwnerUserId: body.ownerUserId ?? null,
    bodyPerformerId: body.performerId ?? null,
  });
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  const tier = session ? await resolveTierFromDb(session.id, session.tier) : "FREE";

  try {
    const result = await executeProfileMediaPlayerCommand({
      ownerUserId: auth.ownerUserId,
      command,
      chassisId: body.chassisId,
      tier,
    });
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 403 });
    }

    return NextResponse.json({
      ok: true,
      command,
      ownerUserId: auth.ownerUserId,
      activeChassisId: result.state.activeChassisId,
      profileChassisId: result.state.profileChassisId,
      ...toPublicMediaPlayerPayload(result.state),
    });
  } catch (err) {
    console.error("[api/profile/media-player POST]", err);
    return NextResponse.json({ ok: false, error: "Command failed." }, { status: 500 });
  }
}
