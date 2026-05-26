import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/security/TMISecurityEngine';

// This would be your actual email sending library, e.g., Nodemailer, Resend, etc.
// For this example, we'll mock the send function.
const mockEmailSender = {
  send: async (options: { to: string; from: string; subject: string; html: string }) => {
    console.log('--- MOCK EMAIL SENT ---');
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log('-----------------------');
    return { success: true };
  },
};

function escapeHtml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(req: NextRequest) {
  const internalApiKey = process.env.INTERNAL_EMAIL_API_KEY;
  const requestApiKey = req.headers.get('x-tmi-email-key');

  // Hardened Gate: If an internal API key is configured, it MUST be provided and match.
  if (internalApiKey && requestApiKey !== internalApiKey) {
    return NextResponse.json({ error: 'Unauthorized: Invalid or missing email API key.' }, { status: 401 });
  }

  const clientIp = req.headers.get('x-forwarded-for') ?? req.ip ?? '127.0.0.1';
  const { allowed } = checkRateLimit(`email:send:${clientIp}`, 15, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: 'Email rate limit exceeded.' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { to, subject, htmlContent, from = 'TMI Platform <noreply@themusiciansindex.com>' } = body;

    if (!to || !subject || !htmlContent) {
      return NextResponse.json({ error: 'Missing required fields: to, subject, and htmlContent.' }, { status: 400 });
    }

    // Although the content is HTML, we escape the subject to prevent header injection.
    const safeSubject = escapeHtml(subject);

    // The htmlContent is assumed to be safe if generated internally.
    // If it contains user-generated content, it should be sanitized BEFORE reaching this API.
    await mockEmailSender.send({
      to,
      from,
      subject: safeSubject,
      html: htmlContent,
    });

    return NextResponse.json({ success: true, message: 'Email sent successfully.' });

  } catch (error) {
    console.error('[TMI_EMAIL_ERROR]', error);
    return NextResponse.json({ error: 'Failed to send email.' }, { status: 500 });
  }
}