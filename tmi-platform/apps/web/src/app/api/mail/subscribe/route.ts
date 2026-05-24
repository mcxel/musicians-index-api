// api/mail/subscribe/route.ts — Subscribe user to mail categories

import { NextRequest, NextResponse } from "next/server";
import { resubscribe, updatePreferences } from "@/lib/mail/MailPreferenceEngine";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({})) as Record<string, unknown>;
  const userId = body.userId as string | undefined;
  const email = body.email as string | undefined;

  if (!userId || !email) {
    return NextResponse.json({ error: "userId and email required" }, { status: 400 });
  }

  // Subscribe to all non-system categories
  resubscribe(userId);
  const prefs = updatePreferences(userId, { email });

  return NextResponse.json({ ok: true, preferences: prefs });
}
