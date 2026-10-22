export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { destroySession } from "@/lib/auth/SessionManager";
import { SESSION_IDENTITY_COOKIE } from "@/lib/auth/verifiedSessionIdentity";
import prisma from "@/lib/prisma";

const COOKIE_CLEAR = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 0,
  path: "/",
};

const SESSION_COOKIES = [
  "tmi_session_id",
  "tmi_session",
  "tmi_user_id",
  "tmi_user_email",
  "tmi_tier",
  "tmi_role",
  "tmi_display_name",
  "tmi_hub_shell",
  SESSION_IDENTITY_COOKIE,
];

/**
 * POST /api/auth/deactivate
 * Records UserSettings.deletionRequestedAt for the signed-in account, then clears session cookies.
 * Does not delete rows, remove a public profile, or cancel a Stripe subscription.
 */
export async function POST(req: NextRequest) {
  const sessionCookie = req.cookies.get("tmi_session_id")?.value;
  const userEmail = req.cookies.get("tmi_user_email")?.value;

  if (!sessionCookie || !userEmail) {
    return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
    }
    const now = new Date();
    await prisma.userSettings.upsert({
      where: { userId: user.id },
      create: { userId: user.id, deletionRequestedAt: now },
      update: { deletionRequestedAt: now },
    });
    const sessionToken = req.cookies.get("tmi_session")?.value;
    if (sessionToken) {
      destroySession(sessionCookie, sessionToken);
    }
  } catch (err) {
    console.error("[auth/deactivate] closure request failed:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  const res = NextResponse.json({ ok: true, closureRequested: true });
  for (const name of SESSION_COOKIES) {
    res.cookies.set(name, "", COOKIE_CLEAR);
  }
  return res;
}
