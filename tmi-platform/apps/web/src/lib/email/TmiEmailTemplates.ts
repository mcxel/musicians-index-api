/**
 * TmiEmailTemplates
 *
 * HTML email templates for TMI transactional emails.
 * All templates use TMI dark-space styling:
 *   - Background: #0A0A0F (dark space)
 *   - Primary accent: #00FFFF (cyan)
 *   - Secondary accent: #FF2DAA (fuchsia)
 *   - Highlight: #FFD700 (gold)
 *   - Text: #E0E0E0
 */

const LOGO_HTML = `<span style="font-size:24px;font-weight:900;letter-spacing:2px;color:#00FFFF;">TMI</span><span style="font-size:14px;color:#888;margin-left:6px;">The Musician's Index</span>`;

function baseLayout(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#0A0A0F;font-family:'Segoe UI',Arial,sans-serif;color:#E0E0E0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0F;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#111118;border-radius:12px;border:1px solid #222240;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:28px 36px 20px;border-bottom:1px solid #1a1a30;background:linear-gradient(135deg,#0D0D1A 0%,#111118 100%);">
              ${LOGO_HTML}
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px;">
              ${bodyHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 36px;border-top:1px solid #1a1a30;background:#0D0D1A;">
              <p style="margin:0;font-size:12px;color:#555;text-align:center;">
                &copy; ${new Date().getFullYear()} BerntoutGlobal LLC &mdash; The Musician's Index<br/>
                <a href="https://themusiciansindex.com" style="color:#00FFFF;text-decoration:none;">themusiciansindex.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function ctaButton(href: string, label: string, color = '#00FFFF'): string {
  return `<a href="${href}" style="display:inline-block;padding:14px 32px;background:${color};color:#000;font-weight:700;font-size:15px;text-decoration:none;border-radius:6px;letter-spacing:0.5px;">${label}</a>`;
}

export function welcomeEmail(name: string, role: string): string {
  const body = `
    <h1 style="margin:0 0 8px;font-size:28px;color:#00FFFF;">Welcome to TMI, ${name}!</h1>
    <p style="margin:0 0 16px;font-size:15px;color:#AAA;text-transform:uppercase;letter-spacing:1px;">Role: ${role}</p>
    <p style="margin:0 0 24px;font-size:16px;line-height:1.7;">
      Your account is live on <strong style="color:#FFD700;">The Musician's Index</strong> — the world's premier platform for musical talent, discovery, and competition.
    </p>
    <p style="margin:0 0 32px;font-size:16px;line-height:1.7;">
      Explore live battles, magazine features, revenue tools, and the full TMI ecosystem.
    </p>
    ${ctaButton('https://themusiciansindex.com/dashboard', 'Go to Your Dashboard')}
    <p style="margin:32px 0 0;font-size:13px;color:#555;">Questions? Reply to this email or visit <a href="https://themusiciansindex.com/support" style="color:#FF2DAA;">support</a>.</p>
  `;
  return baseLayout('Welcome to TMI', body);
}

export function battleInviteEmail(name: string, opponent: string, battleId: string): string {
  const battleUrl = `https://themusiciansindex.com/battles/${battleId}`;
  const body = `
    <h1 style="margin:0 0 16px;font-size:28px;color:#FF2DAA;">Battle Invitation</h1>
    <p style="margin:0 0 24px;font-size:16px;line-height:1.7;">
      Hey <strong style="color:#FFD700;">${name}</strong>, you've been challenged to a battle on TMI!
    </p>
    <div style="background:#1a0a1a;border:1px solid #FF2DAA;border-radius:8px;padding:20px;margin:0 0 32px;">
      <p style="margin:0 0 8px;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;">Your Opponent</p>
      <p style="margin:0;font-size:22px;font-weight:700;color:#FF2DAA;">${opponent}</p>
    </div>
    <p style="margin:0 0 32px;font-size:16px;line-height:1.7;">
      Accept the challenge and let the crowd decide who wins. Every vote counts.
    </p>
    ${ctaButton(battleUrl, 'Accept the Challenge', '#FF2DAA')}
    <p style="margin:32px 0 0;font-size:13px;color:#555;">Battle ID: <code style="color:#888;">${battleId}</code></p>
  `;
  return baseLayout('TMI Battle Invitation', body);
}

export function revenueAlertEmail(name: string, amount: number): string {
  const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  const body = `
    <h1 style="margin:0 0 16px;font-size:28px;color:#FFD700;">Revenue Alert</h1>
    <p style="margin:0 0 24px;font-size:16px;line-height:1.7;">
      Hi <strong style="color:#00FFFF;">${name}</strong>, you just received a payment on TMI!
    </p>
    <div style="background:#0a1a0a;border:1px solid #FFD700;border-radius:8px;padding:24px;margin:0 0 32px;text-align:center;">
      <p style="margin:0 0 8px;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;">Amount Received</p>
      <p style="margin:0;font-size:42px;font-weight:900;color:#FFD700;">${formatted}</p>
    </div>
    <p style="margin:0 0 32px;font-size:16px;line-height:1.7;">
      Your earnings are accumulating. Check your revenue dashboard for full breakdown.
    </p>
    ${ctaButton('https://themusiciansindex.com/dashboard/revenue', 'View Revenue Dashboard', '#FFD700')}
  `;
  return baseLayout('TMI Revenue Alert', body);
}

export function bookingConfirmEmail(name: string, venueName: string, date: string): string {
  const body = `
    <h1 style="margin:0 0 16px;font-size:28px;color:#00FFFF;">Booking Confirmed</h1>
    <p style="margin:0 0 24px;font-size:16px;line-height:1.7;">
      Hi <strong style="color:#FFD700;">${name}</strong>, your booking is confirmed!
    </p>
    <div style="background:#0a0a1a;border:1px solid #00FFFF;border-radius:8px;padding:20px;margin:0 0 32px;">
      <table cellpadding="0" cellspacing="0" style="width:100%;">
        <tr>
          <td style="padding:8px 0;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;">Venue</td>
          <td style="padding:8px 0;font-size:16px;font-weight:700;color:#E0E0E0;text-align:right;">${venueName}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;">Date</td>
          <td style="padding:8px 0;font-size:16px;font-weight:700;color:#E0E0E0;text-align:right;">${date}</td>
        </tr>
      </table>
    </div>
    ${ctaButton('https://themusiciansindex.com/dashboard/bookings', 'View Booking Details')}
    <p style="margin:32px 0 0;font-size:13px;color:#555;">Need to reschedule? Reply to this email or contact <a href="https://themusiciansindex.com/support" style="color:#FF2DAA;">support</a>.</p>
  `;
  return baseLayout('TMI Booking Confirmed', body);
}

export function passwordResetEmail(name: string, resetLink: string): string {
  const body = `
    <h1 style="margin:0 0 16px;font-size:28px;color:#FFD700;">Reset Your Password</h1>
    <p style="margin:0 0 24px;font-size:16px;line-height:1.7;">
      Hi <strong style="color:#00FFFF;">${name}</strong>, we received a request to reset your TMI password.
    </p>
    <p style="margin:0 0 32px;font-size:16px;line-height:1.7;">
      Click the button below to set a new password. This link expires in <strong>1 hour</strong>.
    </p>
    ${ctaButton(resetLink, 'Reset My Password', '#FF2DAA')}
    <p style="margin:32px 0 8px;font-size:13px;color:#555;">
      If you did not request a password reset, you can safely ignore this email — your password will not change.
    </p>
    <p style="margin:0;font-size:12px;color:#444;">
      Or copy this link: <span style="color:#888;word-break:break-all;">${resetLink}</span>
    </p>
  `;
  return baseLayout('TMI Password Reset', body);
}

export function subscriptionEmail(name: string, tier: string): string {
  const tierColor = tier.toLowerCase().includes('diamond') ? '#00FFFF'
    : tier.toLowerCase().includes('gold') ? '#FFD700'
    : tier.toLowerCase().includes('platinum') ? '#E5E4E2'
    : '#FF2DAA';
  const body = `
    <h1 style="margin:0 0 16px;font-size:28px;color:${tierColor};">Subscription Activated</h1>
    <p style="margin:0 0 24px;font-size:16px;line-height:1.7;">
      Hi <strong style="color:#00FFFF;">${name}</strong>, your TMI subscription is now active!
    </p>
    <div style="background:#0a0a1a;border:1px solid ${tierColor};border-radius:8px;padding:24px;margin:0 0 32px;text-align:center;">
      <p style="margin:0 0 8px;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;">Your Tier</p>
      <p style="margin:0;font-size:32px;font-weight:900;color:${tierColor};text-transform:uppercase;letter-spacing:3px;">${tier}</p>
    </div>
    <p style="margin:0 0 32px;font-size:16px;line-height:1.7;">
      All ${tier} features are unlocked. Enjoy the full TMI experience.
    </p>
    ${ctaButton('https://themusiciansindex.com/dashboard', 'Explore Your Benefits', tierColor)}
  `;
  return baseLayout(`TMI ${tier} Subscription`, body);
}

export function notificationEmail(name: string, message: string, link: string): string {
  const body = `
    <h1 style="margin:0 0 16px;font-size:28px;color:#00FFFF;">New Notification</h1>
    <p style="margin:0 0 24px;font-size:16px;line-height:1.7;">
      Hi <strong style="color:#FFD700;">${name}</strong>,
    </p>
    <div style="background:#111130;border-left:4px solid #00FFFF;padding:16px 20px;margin:0 0 32px;border-radius:0 6px 6px 0;">
      <p style="margin:0;font-size:16px;line-height:1.7;color:#E0E0E0;">${message}</p>
    </div>
    ${ctaButton(link, 'View on TMI')}
  `;
  return baseLayout('TMI Notification', body);
}
