/**
 * verifiedSessionIdentity.ts
 *
 * SECURITY (2026-09-23, Batch 2): closes the account-impersonation defect
 * found across getTmiAuth()/api/auth/session/api/auth/me — all three
 * independently resolved identity via
 * `prisma.user.findFirst({ OR: [{ id: sessionId }, { email: rawEmail }] })`
 * where `sessionId` (tmi_session_id) is an opaque token that never matches a
 * real User.id, so identity resolution reduced in practice to trusting the
 * plain, client-writable `tmi_user_email` cookie with zero cryptographic
 * verification. Any HTTP client (not just a browser — httpOnly only blocks
 * document.cookie, not a forged request) could set tmi_session_id/tmi_session
 * to any non-empty value plus tmi_user_email to a victim's address and be
 * treated as that victim, fully authenticated, tier included.
 *
 * SessionManager.validateSessionToken() cannot be the fix here: its session
 * store is a module-level in-memory Map, and this app deploys to Vercel
 * serverless (see apps/web/vercel.json cron config) where in-memory state
 * does not reliably survive across instances or cold starts — requiring it
 * in getTmiAuth() would spuriously log out real users whose request lands on
 * a different instance than the one that created their session.
 *
 * Fix: a stateless, HMAC-signed identity assertion issued at every real
 * login/registration point and verified here — no server-side session store
 * dependency, safe across serverless instances, and not forgeable without
 * the server secret. Reuses the existing NEXTAUTH_SECRET convention already
 * used by UserStore.ts/authOptions.ts/ticketCredentialAuthority.ts rather
 * than inventing a second secret.
 */

import { createHmac, timingSafeEqual } from 'crypto';

export const SESSION_IDENTITY_COOKIE = 'tmi_uid_sig';

export const SESSION_IDENTITY_COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60,
  path: '/',
};

/** Known local-only fallback — NEVER used when NODE_ENV=production. */
const DEV_ONLY_SESSION_IDENTITY_SECRET = 'tmi-session-identity-dev-only';

/**
 * Resolve HMAC secret. Production with neither SESSION_IDENTITY_SECRET nor
 * NEXTAUTH_SECRET returns null (fail closed) — a green binding test does not
 * certify production auth if ops omitted the secret.
 */
export function resolveSessionIdentitySecret(): string | null {
  const fromEnv =
    process.env.SESSION_IDENTITY_SECRET?.trim() ||
    process.env.NEXTAUTH_SECRET?.trim() ||
    '';
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV === 'production') return null;
  return DEV_ONLY_SESSION_IDENTITY_SECRET;
}

export function hasSessionIdentitySecretConfigured(): boolean {
  return Boolean(
    process.env.SESSION_IDENTITY_SECRET?.trim() || process.env.NEXTAUTH_SECRET?.trim(),
  );
}

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

/** Issue a signed identity assertion binding a cookie to a real, authenticated User.id. */
export function signUserIdentity(userId: string): string {
  const secret = resolveSessionIdentitySecret();
  if (!secret) {
    throw new Error(
      'SESSION_IDENTITY_SECRET or NEXTAUTH_SECRET is required to sign session identity in production',
    );
  }
  const payload = String(userId ?? '').trim();
  return `${payload}.${sign(payload, secret)}`;
}

/**
 * Verify a signed identity assertion. Returns the real User.id it was issued
 * for, or null if missing/malformed/tampered/no production secret. This is the
 * ONLY trustworthy source of identity from a cookie — never fall back to
 * matching by a raw client-supplied email/session-id when this fails.
 */
export function verifySignedUserIdentity(token: string | null | undefined): string | null {
  if (!token) return null;
  const secret = resolveSessionIdentitySecret();
  if (!secret) return null;

  const lastDot = token.lastIndexOf('.');
  if (lastDot <= 0 || lastDot === token.length - 1) return null;

  const payload = token.slice(0, lastDot);
  const signature = token.slice(lastDot + 1);
  const expected = sign(payload, secret);

  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || a.length === 0) return null;
  if (!timingSafeEqual(a, b)) return null;

  return payload;
}
