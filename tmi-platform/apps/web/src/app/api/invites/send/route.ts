import { NextResponse } from "next/server";
import EmailProviderEngine from "@/lib/email/EmailProviderEngine";
import { DiamondInviteEngine } from "@/lib/auth/DiamondInviteEngine";

const ALLOWED_ADMIN_EMAILS = [
  "berntmusic33@gmail.com",
  "leeanncoats.79@gmail.com",
  "nacoleelmer143@gmail.com",
];

function buildDiamondInviteHtml(name: string, inviteUrl: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#06040e;font-family:sans-serif;color:#fff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;margin:0 auto;padding:40px 24px;">
    <tr>
      <td style="text-align:center;padding-bottom:28px;">
        <span style="font-size:32px;letter-spacing:0.2em;font-weight:900;color:#00FFFF;text-shadow:0 0 20px rgba(0,255,255,0.6);">TMI</span>
        <br />
        <span style="font-size:10px;letter-spacing:0.3em;color:rgba(255,255,255,0.5);text-transform:uppercase;">The Musician's Index</span>
      </td>
    </tr>
    <tr>
      <td style="background:linear-gradient(135deg,#050316,#07041a);border:1px solid rgba(0,255,255,0.4);border-radius:14px;padding:32px 28px;">
        <p style="font-size:11px;letter-spacing:0.2em;color:#00FFFF;text-transform:uppercase;margin:0 0 12px;">Diamond Membership</p>
        <h1 style="font-size:26px;font-weight:900;color:#fff;margin:0 0 16px;line-height:1.2;">${name}, your Diamond access is ready.</h1>
        <p style="font-size:14px;color:rgba(255,255,255,0.72);margin:0 0 28px;line-height:1.6;">
          You've been granted a <strong style="color:#00FFFF;">Diamond membership</strong> to The Musician's Index —
          full platform access, all rooms, all shows, all privileges.
        </p>
        <div style="text-align:center;margin:0 0 28px;">
          <a href="${inviteUrl}" style="display:inline-block;background:linear-gradient(135deg,#00FFFF,#0088CC);color:#000;font-weight:900;font-size:14px;letter-spacing:0.08em;text-transform:uppercase;text-decoration:none;padding:14px 32px;border-radius:8px;box-shadow:0 0 20px rgba(0,255,255,0.4);">
            Activate My Diamond Access
          </a>
        </div>
        <p style="font-size:11px;color:rgba(255,255,255,0.35);text-align:center;margin:0;">
          Link expires in 7 days. If you didn't request this, ignore this email.
        </p>
      </td>
    </tr>
    <tr>
      <td style="text-align:center;padding-top:20px;">
        <p style="font-size:10px;color:rgba(255,255,255,0.28);letter-spacing:0.1em;">© 2026 BernoutGlobal LLC · TMI Platform</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildDiamondInviteText(name: string, inviteUrl: string): string {
  return [
    `Hi ${name},`,
    "",
    "You've been granted a Diamond membership to The Musician's Index.",
    "",
    "Activate your account here:",
    inviteUrl,
    "",
    "Link expires in 7 days.",
    "",
    "— TMI Platform",
  ].join("\n");
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      to?: string;
      name?: string;
      inviteCode?: string;
      adminEmail?: string;
    };

    const { to, name, inviteCode, adminEmail } = body;

    if (!to || !name) {
      return NextResponse.json({ error: "to and name are required" }, { status: 400 });
    }

    // Gate: only platform admins may trigger Diamond invites
    if (adminEmail && !ALLOWED_ADMIN_EMAILS.includes(adminEmail.toLowerCase())) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const code = inviteCode ?? `diamond-${Math.random().toString(36).slice(2, 10)}`;
    const inviteUrl = `${baseUrl}/invite/${code}`;

    // Register the token so the redemption page can validate it
    DiamondInviteEngine.registerInvite(code, to);

    const result = await EmailProviderEngine.sendAsync({
      to,
      subject: `${name}, your TMI Diamond access is ready`,
      html: buildDiamondInviteHtml(name, inviteUrl),
      text: buildDiamondInviteText(name, inviteUrl),
      tags: ["diamond-invite", "founder"],
      replyTo: "berntmusic33@gmail.com",
    });

    return NextResponse.json({
      success: result.success,
      provider: result.provider,
      externalId: result.externalId,
      devMode: result.devMode ?? false,
      inviteUrl,
      error: result.error,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
