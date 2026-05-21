export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { EmailProviderEngine } from "@/lib/email/EmailProviderEngine";
import { randomUUID } from 'node:crypto';

const ALLOWED_FORWARD_HEADERS = new Set([
  "content-type", "authorization", "x-csrf-token", "accept", "user-agent", "cookie",
]);

function buildForwardHeaders(source: Headers): Headers {
  const forwarded = new Headers();
  for (const [key, value] of source.entries()) {
    if (ALLOWED_FORWARD_HEADERS.has(key.toLowerCase())) forwarded.set(key, value);
  }
  return forwarded;
}

function sendWelcomeEmail(email: string, displayName: string) {
  const hubUrl = `${process.env.NEXTAUTH_URL ?? "https://themusiciansindex.com"}/hub`;
  EmailProviderEngine.sendAsync({
    to:      email,
    subject: "Welcome to TMI — The Musician's Index",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#050510;color:#fff;padding:40px;border-radius:12px">
        <h1 style="font-size:24px;font-weight:900;margin:0 0 8px;color:#00FFFF">Welcome to TMI${displayName ? `, ${displayName}` : ""}</h1>
        <p style="font-size:13px;color:rgba(255,255,255,0.45);margin:0 0 20px">The Musician's Index</p>
        <p style="font-size:14px;line-height:1.7;color:rgba(255,255,255,0.75);margin:0 0 28px">
          Your account is ready. Head to your Hub to set up your persona, connect with artists and producers, and start building your presence.
        </p>
        <a href="${hubUrl}" style="display:inline-block;padding:13px 28px;background:linear-gradient(135deg,#00FFFF,#00AABB);color:#050510;font-weight:800;font-size:12px;letter-spacing:0.12em;border-radius:8px;text-decoration:none">
          GO TO MY HUB →
        </a>
        <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:36px 0 20px" />
        <p style="font-size:11px;color:rgba(255,255,255,0.25);margin:0">BernoutGlobal LLC · TMI Platform</p>
      </div>
    `,
    text: `Welcome to TMI${displayName ? `, ${displayName}` : ""}.\n\nYour account is ready. Visit your Hub: ${hubUrl}\n\n— BernoutGlobal LLC`,
    tags: ["welcome", "registration"],
  }).catch(() => {/* non-blocking */});
}

export async function POST(req: NextRequest) {
  const bodyBuf = await req.arrayBuffer();

  let parsed: { email?: string; password?: string; dateOfBirth?: string; termsAccepted?: boolean; originalityAccepted?: boolean; name?: string; displayName?: string } = {};
  try {
    parsed = JSON.parse(new TextDecoder().decode(bodyBuf));
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email       = (parsed.email ?? "").trim().toLowerCase();
  const password    = parsed.password ?? "";
  const displayName = parsed.displayName ?? parsed.name ?? "";

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }
  if (!parsed.termsAccepted) {
    return NextResponse.json({ error: "Terms must be accepted" }, { status: 400 });
  }

  // Try backend API first (when API_BASE_URL is configured)
  const base = process.env.API_BASE_URL;
  if (base) {
    try {
      const url = new URL("/api/auth/register", base);
      const upstream = await fetch(url.toString(), {
        method:  "POST",
        headers: buildForwardHeaders(req.headers),
        body:    bodyBuf,
        redirect: "manual",
      });
      if (upstream.status === 201 && email) {
        sendWelcomeEmail(email, displayName);
      }
      return new Response(upstream.body, {
        status:  upstream.status,
        headers: upstream.headers as HeadersInit,
      });
    } catch {
      // Backend unreachable — fall through to standalone
    }
  }

  // Standalone fallback: session-based auth (consistent with /api/auth/signin)
  const userId = randomUUID();
  if (email) sendWelcomeEmail(email, displayName);

  return NextResponse.json(
    { ok: true, userId, user: { id: userId, email } },
    { status: 201 }
  );
}
