import { NextResponse } from "next/server";

const MX_BLACKLIST_DOMAINS = new Set([
  "mailinator.com", "guerrillamail.com", "throwaway.email", "sharklasers.com",
  "guerrillamailblock.com", "grr.la", "guerrillamail.info", "guerrillamail.biz",
  "guerrillamail.de", "guerrillamail.net", "guerrillamail.org", "spam4.me",
  "trashmail.com", "trashmail.me", "trashmail.net", "trashmail.at",
  "yopmail.com", "dispostable.com", "fakeinbox.com", "mailnull.com",
  "spamgourmet.com", "maildrop.cc", "tempmail.com", "temp-mail.org",
  "discard.email", "getairmail.com", "mailcatch.com", "spambox.us",
  "spamherelots.com", "mt2009.com", "spamoff.de", "mailexpire.com",
  "objectmail.com", "ownmail.net", "pecinan.net", "spamcon.org",
]);

const ROLE_EMAIL_PATTERNS: Record<string, RegExp[]> = {
  admin: [/^admin@/, /^support@/, /^noreply@/, /^no-reply@/, /^system@/],
  bot: [/^bot[._-]/, /^automated[._-]/, /^noreply@/, /^donotreply@/],
};

function extractDomain(email: string): string | null {
  const match = email.toLowerCase().match(/@([^@]+)$/);
  return match?.[1] ?? null;
}

function isDisposable(domain: string): boolean {
  return MX_BLACKLIST_DOMAINS.has(domain);
}

function hasValidFormat(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function detectSuspiciousPattern(email: string): string | null {
  const lower = email.toLowerCase();
  for (const [label, patterns] of Object.entries(ROLE_EMAIL_PATTERNS)) {
    if (patterns.some(p => p.test(lower))) return label;
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email: string; role?: string };
    const { email } = body;

    if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

    const trimmed = email.trim().toLowerCase();
    const domain = extractDomain(trimmed);

    if (!hasValidFormat(trimmed)) {
      return NextResponse.json({
        valid: false,
        reason: "INVALID_FORMAT",
        message: "Email address format is invalid.",
      }, { status: 422 });
    }

    if (!domain) {
      return NextResponse.json({
        valid: false,
        reason: "NO_DOMAIN",
        message: "Could not extract domain from email.",
      }, { status: 422 });
    }

    if (isDisposable(domain)) {
      return NextResponse.json({
        valid: false,
        reason: "DISPOSABLE_DOMAIN",
        domain,
        message: `Temporary/disposable email addresses are not allowed. Please use a real email.`,
      }, { status: 422 });
    }

    const suspiciousRole = detectSuspiciousPattern(trimmed);
    if (suspiciousRole) {
      return NextResponse.json({
        valid: false,
        reason: "SYSTEM_PATTERN",
        pattern: suspiciousRole,
        message: "Email matches a system/bot address pattern.",
      }, { status: 422 });
    }

    return NextResponse.json({
      valid: true,
      email: trimmed,
      domain,
      message: "Email passed security validation.",
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
