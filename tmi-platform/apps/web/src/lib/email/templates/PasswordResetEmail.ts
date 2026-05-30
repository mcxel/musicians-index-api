export function passwordResetHtml(name: string, resetUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Reset your TMI password</title></head>
<body style="margin:0;padding:0;background:#050510;font-family:'Inter',Arial,sans-serif;color:#fff;">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
      <tr><td style="padding:0 0 24px;">
        <div style="font-size:13px;font-weight:900;letter-spacing:0.3em;color:#00FFFF;">THE MUSICIAN'S INDEX</div>
      </td></tr>
      <tr><td style="background:rgba(255,0,80,0.04);border:1px solid rgba(255,0,80,0.15);border-radius:14px;padding:40px 36px;text-align:center;">
        <div style="font-size:44px;margin-bottom:16px;">🔑</div>
        <h1 style="margin:0 0 12px;font-size:22px;font-weight:900;">Password reset request</h1>
        <p style="margin:0 0 8px;color:rgba(255,255,255,0.55);font-size:14px;line-height:1.6;">
          Hi ${name}, we received a request to reset your TMI password.
        </p>
        <p style="margin:0 0 28px;color:rgba(255,255,255,0.55);font-size:14px;">
          This link is valid for <strong style="color:#FFD700;">1 hour</strong>.
        </p>
        <a href="${resetUrl}" style="display:inline-block;padding:14px 36px;background:#FF2DAA;color:#fff;font-weight:900;font-size:13px;letter-spacing:0.1em;text-decoration:none;border-radius:8px;text-transform:uppercase;">
          Reset My Password
        </a>
        <div style="margin:28px 0 0;padding:16px;background:rgba(255,200,0,0.06);border:1px solid rgba(255,200,0,0.15);border-radius:8px;">
          <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.45);">
            ⚠️ If you didn't request this, ignore this email. Your password has NOT been changed.
          </p>
        </div>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}
