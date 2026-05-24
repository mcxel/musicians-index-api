export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { verifyUnsubToken, unsubscribe, resubscribe, type EmailCategory } from '@/lib/email/unsubscribeStore';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function page(title: string, heading: string, body: string, accentColor = '#00FFFF'): NextResponse {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} — TMI</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #050510; color: #fff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
    .card { background: #0a0a1a; border: 1px solid #1a1a2e; border-top: 2px solid ${accentColor}; border-radius: 12px; padding: 48px 40px; max-width: 480px; width: 100%; text-align: center; }
    .logo { font-size: 11px; letter-spacing: 4px; color: ${accentColor}; text-transform: uppercase; margin-bottom: 24px; }
    h1 { font-size: 28px; font-weight: 900; color: #fff; margin-bottom: 16px; }
    p { color: #888; font-size: 15px; line-height: 1.6; margin-bottom: 12px; }
    .email-display { color: ${accentColor}; font-size: 14px; margin: 8px 0 20px; }
    .btn { display: inline-block; margin-top: 20px; padding: 10px 24px; border: 1px solid ${accentColor}; border-radius: 20px; color: ${accentColor}; text-decoration: none; font-size: 13px; letter-spacing: 1px; font-weight: 700; }
    .btn-resub { border-color: #FF2DAA; color: #FF2DAA; margin-left: 12px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">The Musicians Index</div>
    <h1>${heading}</h1>
    ${body}
    <a href="https://themusiciansindex.com" class="btn">BACK TO TMI</a>
  </div>
</body>
</html>`;
  return new NextResponse(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

// GET /api/email/unsubscribe?token=...&email=...&category=marketing
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const token = searchParams.get('token') ?? '';
  const email = searchParams.get('email') ?? '';
  const rawCat = searchParams.get('category') ?? 'marketing';
  const category = (['marketing', 'newsletter', 'transactional', 'all'].includes(rawCat)
    ? rawCat
    : 'marketing') as EmailCategory;

  if (!email || !token) {
    return page('Invalid Link', 'Invalid Link', '<p>This unsubscribe link is missing required parameters. Please use the link from your email.</p>', '#FF2DAA');
  }

  if (!verifyUnsubToken(token, email)) {
    return page('Invalid Token', 'Link Expired or Invalid', '<p>This unsubscribe link is no longer valid. Please use the latest unsubscribe link from a recent email.</p>', '#FF2DAA');
  }

  unsubscribe(email, category);

  const safeEmail = escapeHtml(email);
  const categoryLabel = category === 'all' ? 'all TMI emails' : `${category} emails`;
  return page(
    'Unsubscribed',
    "You're Unsubscribed",
    `<p class="email-display">${safeEmail}</p>
     <p>You have been removed from ${categoryLabel}. Transactional emails (tickets, security, billing) will still be sent as required.</p>`,
    '#00FFFF',
  );
}

// POST /api/email/unsubscribe — programmatic opt-out/opt-in (internal use)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { email?: string; category?: string; action?: string; token?: string };
    const { email, action = 'unsubscribe', token } = body;
    const rawCat = body.category ?? 'marketing';
    const category = (['marketing', 'newsletter', 'transactional', 'all'].includes(rawCat)
      ? rawCat
      : 'marketing') as EmailCategory;

    if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });

    if (action === 'resubscribe') {
      if (!token || !verifyUnsubToken(token, email)) {
        return NextResponse.json({ error: 'invalid token' }, { status: 403 });
      }
      resubscribe(email, category);
      return NextResponse.json({ ok: true, action: 'resubscribed', category });
    }

    unsubscribe(email, category);
    return NextResponse.json({ ok: true, action: 'unsubscribed', category });
  } catch {
    return NextResponse.json({ error: 'bad request' }, { status: 400 });
  }
}
