export const dynamic = 'force-dynamic';
import { requestPasswordReset } from "@/lib/auth/PasswordResetRequestEngine";
import { sendEmail } from "@/lib/email/TMIEmailSystem";
import { checkRateLimit, validateSignupEmail } from "@/lib/security/TMISecurityEngine";

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

  const cleanEmail = email.trim().toLowerCase();
  const cleanIp = ip.split(",")[0]?.trim() ?? "unknown";

  const rateLimit = checkRateLimit(`auth:forgot-password:${cleanIp}`, 8, 60_000);
  if (!rateLimit.allowed) {
    return Response.json({ ok: true });
  }

  const emailValidation = validateSignupEmail(cleanEmail);
  if (!emailValidation.valid) {
    // Keep response generic to avoid account/email enumeration
    return Response.json({ ok: true });
  }

  const result = requestPasswordReset({ email: cleanEmail, ip: cleanIp, userAgent: req.headers.get("user-agent") ?? undefined });

  if (!result.ok) {
    // Always return 200 to avoid email enumeration — client shows generic message
    return Response.json({ ok: false, reason: result.reason }, { status: 200 });
  }

  const baseUrl   = process.env.NEXTAUTH_URL ?? "https://themusiciansindex.com";
  const resetLink = `${baseUrl}/auth/reset-password/${result.token}?email=${encodeURIComponent(cleanEmail)}`;

  try {
    await sendEmail({
      to:   cleanEmail,
      type: "password_reset",
      data: { token: result.token ?? "", link: resetLink },
    });
  } catch {
    // Keep client response generic and successful to avoid enumeration signals
  }

  return Response.json({ ok: true });
}
