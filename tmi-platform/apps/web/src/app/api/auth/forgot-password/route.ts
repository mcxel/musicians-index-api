export const dynamic = 'force-dynamic';
import { requestPasswordReset } from "@/lib/auth/PasswordResetRequestEngine";
import { sendEmail } from "@/lib/email/TMIEmailSystem";

export async function POST(req: Request) {
  let email = "";
  let ip = "";
  try {
    const body = (await req.json()) as { email?: string; ip?: string };
    email = body.email ?? "";
    ip    = body.ip    ?? req.headers.get("x-forwarded-for") ?? "unknown";
  } catch {
    return Response.json({ ok: false, reason: "invalid_request" }, { status: 400 });
  }

  const result = requestPasswordReset({ email, ip, userAgent: req.headers.get("user-agent") ?? undefined });

  if (!result.ok) {
    // Always return 200 to avoid email enumeration — client shows generic message
    return Response.json({ ok: false, reason: result.reason }, { status: 200 });
  }

  const baseUrl   = process.env.NEXTAUTH_URL ?? "https://themusiciansindex.com";
  const resetLink = `${baseUrl}/auth/reset-password/${result.token}?email=${encodeURIComponent(email.trim().toLowerCase())}`;

  await sendEmail({
    to:   email,
    type: "password_reset",
    data: { token: result.token ?? "", link: resetLink },
  });

  return Response.json({ ok: true });
}
