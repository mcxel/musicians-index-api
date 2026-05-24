// api/admin/mail/send-broadcast/route.ts — Send broadcast email to all (or filtered) users

import { NextRequest, NextResponse } from "next/server";
import { sendMail } from "@/lib/mail/TMIMailEngine";
import { getAllPreferences, canReceive, MailCategory } from "@/lib/mail/MailPreferenceEngine";
import { checkRateLimit, recordSent } from "@/lib/mail/MailRateLimiter";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.ADMIN_API_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({})) as Record<string, unknown>;
  const subject = body.subject as string | undefined;
  const html = body.html as string | undefined;
  const text = body.text as string | undefined;
  const category = (body.category as MailCategory | undefined) ?? "growth";
  const targetUserIds = body.targetUserIds as string[] | undefined; // optional filter

  if (!subject || !html) {
    return NextResponse.json({ error: "subject and html required" }, { status: 400 });
  }

  const allPrefs = getAllPreferences();
  const targets = targetUserIds
    ? allPrefs.filter(p => targetUserIds.includes(p.userId))
    : allPrefs;

  let sent = 0;
  let skipped = 0;

  for (const pref of targets) {
    if (!canReceive(pref.userId, category)) { skipped++; continue; }
    const rateCheck = checkRateLimit(pref.userId, category);
    if (!rateCheck.allowed) { skipped++; continue; }

    const result = await sendMail({ to: pref.email, subject, html, text });
    if (result.success) {
      recordSent(pref.userId, category);
      sent++;
    } else {
      skipped++;
    }
  }

  return NextResponse.json({
    ok: true,
    sent,
    skipped,
    total: targets.length,
    category,
  });
}
