export const dynamic = 'force-dynamic';
import { requestPasswordReset } from "@/lib/auth/PasswordResetRequestEngine";
import { buildPasswordResetMail } from "@/lib/auth/PasswordResetMailEngine";
import { EmailProviderEngine } from "@/lib/email/EmailProviderEngine";

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

  const baseUrl  = process.env.NEXTAUTH_URL ?? "";
  const resetLink = `${baseUrl}/auth/reset-password/${result.token}?email=${encodeURIComponent(email.trim().toLowerCase())}`;

  const { subject, body: bodyText } = buildPasswordResetMail({
    toEmail:    email,
    resetLink,
    expiresAt:  result.expiresAt ?? Date.now() + 20 * 60 * 1000,
    ip,
    supportUrl: `${baseUrl}/support/account-recovery`,
  });

  await EmailProviderEngine.sendAsync({
    to:      email,
    subject,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#050510;color:#fff;padding:40px;border-radius:12px">
        <h2 style="font-size:22px;font-weight:900;margin:0 0 16px;color:#00FFFF">Reset Your Password</h2>
        <p style="font-size:14px;line-height:1.7;color:rgba(255,255,255,0.75);margin:0 0 8px">
          You requested a password reset for your TMI account.
        </p>
        <p style="font-size:13px;color:rgba(255,255,255,0.45);margin:0 0 28px">
          This link expires in 20 minutes and can only be used once.
        </p>
        <a href="${resetLink}" style="display:inline-block;padding:13px 28px;background:linear-gradient(135deg,#FF2DAA,#AA2DFF);color:#fff;font-weight:800;font-size:12px;letter-spacing:0.12em;border-radius:8px;text-decoration:none">
          RESET PASSWORD →
        </a>
        <p style="font-size:11px;color:rgba(255,255,255,0.3);margin:32px 0 0">
          If you did not request this reset, ignore this email. Your account remains secure.
          ${ip && ip !== "unknown" ? `<br>Request IP: ${ip}` : ""}
        </p>
        <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:20px 0" />
        <p style="font-size:11px;color:rgba(255,255,255,0.2);margin:0">BernoutGlobal LLC · TMI Platform</p>
      </div>
    `,
    text:    bodyText,
    tags:    ["password-reset"],
  });

  return Response.json({ ok: true });
}
