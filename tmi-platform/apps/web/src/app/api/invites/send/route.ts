import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import EmailProviderEngine from "@/lib/email/EmailProviderEngine";
import { DiamondInviteEngine } from "@/lib/auth/DiamondInviteEngine";

const ALLOWED_ADMIN_EMAILS = [
  "berntmusic33@gmail.com",
];

function isAllowedAdmin(email: string): boolean {
  return ALLOWED_ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

export async function POST(req: NextRequest) {
  try {
    const sessionId = req.cookies.get("tmi_session_id")?.value;
    const sessionToken = req.cookies.get("tmi_session")?.value;
    const role = (req.cookies.get("tmi_role")?.value ?? "").trim().toUpperCase();
    const sessionEmail = (req.cookies.get("tmi_user_email")?.value ?? "").trim().toLowerCase();

    if (!sessionId || !sessionToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    if (!sessionEmail || !isAllowedAdmin(sessionEmail)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    const to = body.to;
    const name = body.name || "TMI VIP";
    const inviteCode = body.inviteCode || "VIP-ACCESS-2026";

    const senderDomain = "support@themusiciansindex.com";

    if (!to) {
      return NextResponse.json(
        { error: "recipient email is required" },
        { status: 400 }
      );
    }

    const baseUrl =
      process.env.NEXTAUTH_URL ?? "https://themusiciansindex.com";

    const inviteUrl = `${baseUrl}/signup?token=${inviteCode}`;

    // Register invite
    DiamondInviteEngine.registerInvite(inviteCode, to);

    const result = await EmailProviderEngine.sendAsync({
      to,
      subject: `${name}, your TMI access is ready`,
      html: `<p>${name}, you’re in.</p><a href="${inviteUrl}">${inviteUrl}</a>`,
      text: `${name}, you’re in: ${inviteUrl}`,
      replyTo: senderDomain,
    });

    // Dev-stub means no RESEND_API_KEY or SENDGRID_API_KEY is configured in Vercel env.
    // Return a clear error so the admin knows emails are NOT being delivered.
    if (result.devMode) {
      return NextResponse.json(
        {
          success: false,
          devMode: true,
          error: "Email not sent — no provider API key configured. Add RESEND_API_KEY to Vercel environment variables.",
          inviteUrl,
          provider: "dev-stub",
        },
        { status: 503 }
      );
    }

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error ?? "Email delivery failed", provider: result.provider },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      inviteUrl,
      provider: result.provider,
      externalId: result.externalId,
    });
  } catch (err) {
    console.error("[INVITE ERROR]", err);
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 }
    );
  }
}
