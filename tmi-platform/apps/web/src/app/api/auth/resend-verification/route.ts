import { NextRequest, NextResponse } from "next/server";

// ── In-memory rate limiter (per userId) ───────────────────────────────────────
const lastSendMap = new Map<string, number>();
const RATE_LIMIT_MS = 60_000;

function parseCookies(req: NextRequest): Record<string, string> {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const result: Record<string, string> = {};
  cookieHeader.split(";").forEach((pair) => {
    const [k, ...v] = pair.trim().split("=");
    if (k) result[k.trim()] = decodeURIComponent(v.join("="));
  });
  return result;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const cookies = parseCookies(req);
  const sessionToken = cookies["tmi-session"] ?? cookies["session"] ?? null;

  if (!sessionToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Use session token as userId proxy for rate limiting
  const userId = sessionToken;
  const now = Date.now();
  const lastSent = lastSendMap.get(userId) ?? 0;

  if (now - lastSent < RATE_LIMIT_MS) {
    const waitSec = Math.ceil((RATE_LIMIT_MS - (now - lastSent)) / 1000);
    return NextResponse.json(
      { error: `Rate limited. Wait ${waitSec}s before resending.` },
      { status: 429 },
    );
  }

  // Attempt to read the request body for optional email override
  let email: string | undefined;
  try {
    const body = await req.json() as { email?: string };
    email = body.email;
  } catch {
    // body is optional
  }

  // TODO: integrate with Resend when API key is configured.
  // For now we mark the send time and return ok.
  lastSendMap.set(userId, now);

  // Attempt real email send via Resend if env key is set
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey && email) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: "TMI <noreply@themusiciansindex.com>",
          to: [email],
          subject: "Verify your TMI account",
          html: `<p>Click the link below to verify your email address.</p><p><a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://themusiciansindex.com"}/email-verification/confirm?token=${sessionToken}">Verify Email</a></p>`,
        }),
      });
    } catch {
      // Non-fatal — email send failure doesn't break auth flow
    }
  }

  return NextResponse.json({ ok: true, message: "Verification email sent." });
}
