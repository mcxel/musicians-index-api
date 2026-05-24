// api/mail/preferences/route.ts — Get/update mail preferences for a user

import { NextRequest, NextResponse } from "next/server";
import { getPreferences, updatePreferences, MailCategory } from "@/lib/mail/MailPreferenceEngine";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }
  return NextResponse.json(getPreferences(userId));
}

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => ({})) as Record<string, unknown>;
  const userId = body.userId as string | undefined;
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const allowed: Array<MailCategory | "email"> = ["email", "engagement", "growth", "revenue"];
  const updates: Partial<Record<MailCategory | "email", boolean | string>> = {};

  for (const key of allowed) {
    if (key in body) {
      (updates as Record<string, unknown>)[key] = body[key];
    }
  }

  const prefs = updatePreferences(userId, updates as Parameters<typeof updatePreferences>[1]);
  return NextResponse.json({ ok: true, preferences: prefs });
}
