import { NextResponse } from "next/server";
import EmailProviderEngine from "@/lib/email/EmailProviderEngine";
import { DiamondInviteEngine } from "@/lib/auth/DiamondInviteEngine";

const ALLOWED_ADMIN_EMAILS = [
  "berntmusic33@gmail.com",
];

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const to = body.to;
    const name = body.name || "TMI VIP";
    const inviteCode = body.inviteCode || "VIP-ACCESS-2026";
    const adminEmail = body.adminEmail;

    const senderDomain = "support@themusiciansindex.com";

    if (!to) {
      return NextResponse.json(
        { error: "recipient email is required" },
        { status: 400 }
      );
    }

    if (adminEmail && !ALLOWED_ADMIN_EMAILS.includes(adminEmail.toLowerCase())) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const baseUrl =
      process.env.NEXTAUTH_URL ?? "https://themusiciansindex.com";

    const inviteUrl = `${baseUrl}/auth?code=${inviteCode}`;

    // Register invite
    DiamondInviteEngine.registerInvite(inviteCode, to);

    const result = await EmailProviderEngine.sendAsync({
      to,
      subject: `${name}, your TMI access is ready`,
      html: `<p>${name}, you’re in.</p><a href="${inviteUrl}">${inviteUrl}</a>`,
      text: `${name}, you're in: ${inviteUrl}`,
      replyTo: senderDomain,
    });

    return NextResponse.json({
      success: true,
      inviteUrl,
      provider: result?.provider,
    });
  } catch (err) {
    console.error("[INVITE ERROR]", err);
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 }
    );
  }
}
