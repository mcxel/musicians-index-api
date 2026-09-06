export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";

type PrivacySettings = {
  profileVisibility?: string;
  publicPageEnabled?: boolean;
  showLocation?: boolean;
  showOnlineStatus?: boolean;
  allowDirectMessages?: string;
  showInSearch?: boolean;
  allowCollabs?: boolean;
};

/**
 * Map near-term account-level privacy (Rule 33 direction, current schema):
 * UserSettings.profileVisibility stores public | private | hidden.
 * publicPageEnabled is derived: hidden => false; otherwise true unless
 * explicitly toggled off (which writes hidden when visibility is public).
 *
 * PRIVATE != camera off / end live — this API only stores profile discovery
 * preferences, never live/session controls.
 */
function encodeVisibility(input: PrivacySettings): string {
  const vis = (input.profileVisibility ?? "public").toLowerCase();
  if (vis === "private") return "private";
  if (input.publicPageEnabled === false) return "hidden";
  if (vis === "hidden") return "hidden";
  return "public";
}

function decodePrivacy(stored: string | null | undefined) {
  const v = (stored ?? "public").toLowerCase();
  if (v === "private") {
    return { profileVisibility: "private", publicPageEnabled: true as boolean };
  }
  if (v === "hidden") {
    return { profileVisibility: "public", publicPageEnabled: false as boolean };
  }
  return { profileVisibility: "public", publicPageEnabled: true as boolean };
}

/**
 * GET /api/settings/privacy
 * Server-authoritative account privacy preferences (defaults PUBLIC).
 */
export async function GET() {
  const auth = await getTmiAuth();
  if (!auth) {
    return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }

  try {
    const settings = await prisma.userSettings.findUnique({
      where: { userId: auth.user.id },
      select: {
        profileVisibility: true,
        showOnlineStatus: true,
        allowMessages: true,
      },
    });

    const decoded = decodePrivacy(settings?.profileVisibility);
    return NextResponse.json({
      ok: true,
      privacy: {
        profileVisibility: decoded.profileVisibility,
        publicPageEnabled: decoded.publicPageEnabled,
        showOnlineStatus: settings?.showOnlineStatus ?? true,
        allowDirectMessages: settings?.allowMessages ?? "followers",
        showLocation: false,
        showInSearch: decoded.profileVisibility === "public" && decoded.publicPageEnabled,
        allowCollabs: true,
        // Honest schema-era note for UI (never claim dual Fan/Performer privacy).
        scope: "ACCOUNT",
        note: "Account-level privacy. Separate Fan/Performer privacy arrives with Rule 31 profile tables.",
        privateDoesNotAffectLive: true,
      },
    });
  } catch (err) {
    console.error("[settings/privacy GET] DB error:", err);
    return NextResponse.json({
      ok: true,
      privacy: {
        profileVisibility: "public",
        publicPageEnabled: true,
        showOnlineStatus: true,
        allowDirectMessages: "followers",
        showLocation: false,
        showInSearch: true,
        allowCollabs: true,
        scope: "ACCOUNT",
        privateDoesNotAffectLive: true,
      },
    });
  }
}

/**
 * POST /api/settings/privacy
 * Saves privacy settings to Prisma UserSettings.
 */
export async function POST(req: NextRequest) {
  const auth = await getTmiAuth();
  const email = req.cookies.get("tmi_user_email")?.value;
  const sessionId = req.cookies.get("tmi_session_id")?.value;

  if (!auth && (!sessionId || !email)) {
    return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }

  let body: { privacy?: PrivacySettings } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const privacy = body.privacy ?? {};

  try {
    const user =
      auth?.user?.id
        ? { id: auth.user.id }
        : await prisma.user.findUnique({ where: { email: email! }, select: { id: true } });
    if (!user) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });

    const profileVisibility = encodeVisibility(privacy);

    await prisma.userSettings.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        profileVisibility,
        showOnlineStatus: privacy.showOnlineStatus ?? true,
        allowMessages: privacy.allowDirectMessages ?? "followers",
      },
      update: {
        profileVisibility,
        ...(privacy.showOnlineStatus !== undefined && { showOnlineStatus: privacy.showOnlineStatus }),
        ...(privacy.allowDirectMessages !== undefined && { allowMessages: privacy.allowDirectMessages }),
      },
    });

    return NextResponse.json({ ok: true, profileVisibility });
  } catch (err) {
    console.error("[settings/privacy] DB error:", err);
    return NextResponse.json({ ok: false, error: "Unable to save privacy settings" }, { status: 500 });
  }
}
