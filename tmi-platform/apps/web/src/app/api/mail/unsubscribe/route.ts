// api/mail/unsubscribe/route.ts — One-click unsubscribe (GET for email links, POST for UI)

import { NextRequest, NextResponse } from "next/server";
import { unsubscribeAll } from "@/lib/mail/MailPreferenceEngine";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) {
    return new NextResponse("Missing userId", { status: 400 });
  }

  unsubscribeAll(userId);

  return new NextResponse(
    `<!DOCTYPE html><html><head><title>Unsubscribed</title></head>
    <body style="background:#0a0a0f;color:#e0e0e0;font-family:Arial,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
      <div style="text-align:center;max-width:400px;">
        <h2 style="color:#00e5ff;">Unsubscribed</h2>
        <p>You've been removed from all marketing emails. You'll still receive account and payout notifications.</p>
        <a href="https://themusiciansindex.com/settings/notifications" style="color:#00e5ff;">Manage preferences</a>
      </div>
    </body></html>`,
    { headers: { "Content-Type": "text/html" } }
  );
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({})) as Record<string, unknown>;
  const userId = body.userId as string | undefined;
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }
  unsubscribeAll(userId);
  return NextResponse.json({ ok: true });
}
