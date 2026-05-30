export function verifyEmailHtml(name: string, verifyUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Verify your TMI email</title></head>
<body style="margin:0;padding:0;background:#050510;font-family:'Inter',Arial,sans-serif;color:#fff;">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
      <tr><td style="padding:0 0 24px;">
        <div style="font-size:13px;font-weight:900;letter-spacing:0.3em;color:#00FFFF;">THE MUSICIAN'S INDEX</div>
      </td></tr>
      <tr><td style="background:rgba(255,255,255,0.02);border:1px solid rgba(0,255,255,0.1);border-radius:14px;padding:40px 36px;text-align:center;">
        <div style="font-size:44px;margin-bottom:16px;">✉️</div>
        <h1 style="margin:0 0 12px;font-size:22px;font-weight:900;">Verify your email, ${name}</h1>
        <p style="margin:0 0 28px;color:rgba(255,255,255,0.55);font-size:14px;line-height:1.6;">
          Click the button below to confirm your email address and activate your TMI account.<br>
          This link expires in <strong style="color:#FFD700;">24 hours</strong>.
        </p>
        <a href="${verifyUrl}" style="display:inline-block;padding:14px 36px;background:#00FFFF;color:#050510;font-weight:900;font-size:13px;letter-spacing:0.1em;text-decoration:none;border-radius:8px;text-transform:uppercase;">
          Verify Email Address
        </a>
        <p style="margin:24px 0 0;font-size:11px;color:rgba(255,255,255,0.25);">
          Or copy this link: <span style="word-break:break-all;">${verifyUrl}</span>
        </p>
      </td></tr>
      <tr><td style="padding:24px 0 0;text-align:center;">
        <div style="font-size:11px;color:rgba(255,255,255,0.2);">
          If you didn't create a TMI account, you can safely ignore this email.
        </div>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}
