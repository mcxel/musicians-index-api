import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/TMIEmailSystem";
import { waitUntil } from "@vercel/functions";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";
import { issuePersistedEmailVerificationToken } from "@/lib/auth/EmailVerificationEngine";
import prisma from "@/lib/prisma";

// ── In-memory rate limiter (per userId) ───────────────────────────────────────
const lastSendMap = new Map<string, number>();
const RATE_LIMIT_MS = 60_000;

export async function POST(req: NextRequest): Promise<NextResponse> {
  const auth = await getTmiAuth();
  if (!auth) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = auth.user.id;
  const email = auth.user.email.trim().toLowerCase();
  const account = await prisma.user.findUnique({
    where: { id: userId },
    select: { emailVerified: true },
  });
  if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });
  if (account.emailVerified) {
    return NextResponse.json({ ok: true, message: "Email is already verified." });
  }

  const now = Date.now();
  const lastSent = lastSendMap.get(userId) ?? 0;

  if (now - lastSent < RATE_LIMIT_MS) {
    const waitSec = Math.ceil((RATE_LIMIT_MS - (now - lastSent)) / 1000);
    return NextResponse.json(
      { error: `Rate limited. Wait ${waitSec}s before resending.` },
      { status: 429 },
    );
  }

  lastSendMap.set(userId, now);
  try {
    const verification = await issuePersistedEmailVerificationToken(email);
    const verificationUrl = new URL(
      `/auth/verify-email/${encodeURIComponent(verification.token)}?email=${encodeURIComponent(email)}`,
      process.env.NEXTAUTH_URL ?? req.nextUrl.origin,
    ).toString();
    waitUntil(
      sendEmail({
        to: email,
        type: "verify_email",
        data: { token: verification.token, verificationUrl },
      }),
    );
    return NextResponse.json({ ok: true, message: "Verification email sent." });
  } catch {
    return NextResponse.json({ ok: false, error: "Verification email unavailable." }, { status: 503 });
  }
}
