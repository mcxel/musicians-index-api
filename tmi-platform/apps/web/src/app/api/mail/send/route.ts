// api/mail/send/route.ts — Trigger a mail send for a specific event

import { NextRequest, NextResponse } from "next/server";
import { trigger, MailEvent } from "@/lib/mail/MailTriggerEngine";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.ADMIN_API_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({})) as Record<string, unknown>;
  const event = body.event as MailEvent | undefined;
  const userId = body.userId as string | undefined;
  const email = body.email as string | undefined;
  const vars = (body.vars ?? {}) as Record<string, unknown>;

  if (!event || !userId || !email) {
    return NextResponse.json({ error: "event, userId, email required" }, { status: 400 });
  }

  const result = await trigger(event, {
    userId,
    email,
    vars: vars as Parameters<typeof trigger>[1]["vars"],
    dedupKey: body.dedupKey as string | undefined,
  });

  return NextResponse.json(result);
}
