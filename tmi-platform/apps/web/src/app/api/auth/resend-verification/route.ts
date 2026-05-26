import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/TMIEmailSystem";

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

  lastSendMap.set(userId, now);

  if (email) {
    void sendEmail({ to: email, type: "verify_email", data: { token: sessionToken } });
  }

  return NextResponse.json({ ok: true, message: "Verification email sent." });
}
