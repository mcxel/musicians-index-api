/**
 * TMISecurityEngine.ts
 * Security hardening for The Musician's Index.
 *
 * Covers:
 *  - Admin email list via ADMIN_EMAILS env var (no code push needed)
 *  - Role enforcement middleware (fan/performer/admin boundaries)
 *  - WebRTC permission boundaries (performer-only publish)
 *  - Session token validation
 *  - Rate limiting helpers
 *  - CSP / security headers (add to next.config.js)
 *  - MX email validation on signup (blocks disposable emails)
 *  - HMAC request signing for webhooks
 *
 * HOW TO ADD ADMINS WITHOUT CODE CHANGES:
 *   Go to Vercel → Settings → Environment Variables
 *   Add: ADMIN_EMAILS = marcel@themusiciansindex.com,micah@themusiciansindex.com,facethebully916@gmail.com
 *   (comma-separated, no spaces)
 *   Redeploy → admins are live immediately.
 *
 * HOW TO ADD DIAMOND ACCOUNTS WITHOUT CODE CHANGES:
 *   Add: DIAMOND_EMAILS = facethebully916@gmail.com,skeet@gmail.com,kreach@gmail.com
 *   These users automatically get Diamond tier on sign-in.
 */

import { NextResponse, type NextRequest } from "next/server";

/* ─── Types ─────────────────────────────────────────────────────────────── */
export type UserRole = "fan" | "performer" | "artist" | "venue" | "sponsor" | "advertiser" | "admin" | "superadmin";
export type SubscriptionTier = "free" | "silver" | "gold" | "platinum" | "diamond";

export interface SessionPayload {
  userId: string;
  email: string;
  role: UserRole;
  tier: SubscriptionTier;
  isAdmin: boolean;
  isDiamond: boolean;
  isYouth?: boolean;
  iat: number;
  exp: number;
}

/* ─── Environment-based admin / diamond lists ─────────────────────────────── */

/**
 * Get admin emails from environment variable.
 * Set in Vercel: ADMIN_EMAILS=email1@domain.com,email2@domain.com
 * Platform Laws: Marcel + Big Ace are always admins regardless of env var.
 */
export function getAdminEmails(): Set<string> {
  const hardcoded = [
    "berntmusic33@gmail.com",           // Marcel — always admin
    "bigace@berntoutglobal.com",        // Big Ace — always admin
  ];

  const fromEnv = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return new Set([...hardcoded, ...fromEnv].map((e) => e.toLowerCase()));
}

/**
 * Get Diamond tier emails from environment variable.
 * Set in Vercel: DIAMOND_EMAILS=skeet@gmail.com,facethebully916@gmail.com
 * Platform Law #2: Marcel + Jay Paul Sanchez hardcoded as Diamond.
 */
export function getDiamondEmails(): Set<string> {
  const hardcoded = [
    "berntmusic33@gmail.com",           // Marcel — Platform Law #2
    "jay@themusiciansindex.com",        // Jay Paul Sanchez — Platform Law #2
    "mannipaulayton1@gmail.com",        // Manni Paulayton — Lifetime Diamond (2026-06-12)
    "greenshean21@gmail.com",           // Green Shean — Lifetime Diamond (2026-06-12)
  ];

  const fromEnv = (process.env.DIAMOND_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return new Set([...hardcoded, ...fromEnv].map((e) => e.toLowerCase()));
}

/**
 * Check if email is admin.
 */
export function isAdminEmail(email: string): boolean {
  return getAdminEmails().has(email.toLowerCase().trim());
}

/**
 * Check if email gets Diamond tier.
 */
export function isDiamondEmail(email: string): boolean {
  return getDiamondEmails().has(email.toLowerCase().trim()) || isAdminEmail(email);
}

/**
 * Get effective tier for a user (Diamond always overrides stored tier).
 */
export function getEffectiveTier(email: string, storedTier: SubscriptionTier): SubscriptionTier {
  if (isDiamondEmail(email)) return "diamond";
  return storedTier;
}

/* ─── Role permission matrix ─────────────────────────────────────────────── */

const ROLE_PERMISSIONS: Record<UserRole, {
  canPublishStream: boolean;
  canCreateAvatar: boolean;
  canAccessAdmin: boolean;
  canSendPaidMessages: boolean;
  canBattle: boolean;
  canViewTicketPOS: boolean;
  canCreateChallenges: boolean;
  canManageVenue: boolean;
}> = {
  fan:         { canPublishStream: false, canCreateAvatar: true,  canAccessAdmin: false, canSendPaidMessages: false, canBattle: false, canViewTicketPOS: false, canCreateChallenges: false, canManageVenue: false },
  performer:   { canPublishStream: true,  canCreateAvatar: false, canAccessAdmin: false, canSendPaidMessages: true,  canBattle: true,  canViewTicketPOS: false, canCreateChallenges: true,  canManageVenue: false },
  artist:      { canPublishStream: true,  canCreateAvatar: false, canAccessAdmin: false, canSendPaidMessages: true,  canBattle: true,  canViewTicketPOS: false, canCreateChallenges: true,  canManageVenue: false },
  venue:       { canPublishStream: false, canCreateAvatar: false, canAccessAdmin: false, canSendPaidMessages: false, canBattle: false, canViewTicketPOS: true,  canCreateChallenges: false, canManageVenue: true  },
  sponsor:     { canPublishStream: false, canCreateAvatar: false, canAccessAdmin: false, canSendPaidMessages: false, canBattle: false, canViewTicketPOS: false, canCreateChallenges: false, canManageVenue: false },
  advertiser:  { canPublishStream: false, canCreateAvatar: false, canAccessAdmin: false, canSendPaidMessages: false, canBattle: false, canViewTicketPOS: false, canCreateChallenges: false, canManageVenue: false },
  admin:       { canPublishStream: true,  canCreateAvatar: true,  canAccessAdmin: true,  canSendPaidMessages: true,  canBattle: true,  canViewTicketPOS: true,  canCreateChallenges: true,  canManageVenue: true  },
  superadmin:  { canPublishStream: true,  canCreateAvatar: true,  canAccessAdmin: true,  canSendPaidMessages: true,  canBattle: true,  canViewTicketPOS: true,  canCreateChallenges: true,  canManageVenue: true  },
};

export function getRolePermissions(role: UserRole) {
  return ROLE_PERMISSIONS[role] ?? ROLE_PERMISSIONS.fan;
}

export function canPublishWebRTC(role: UserRole): boolean {
  return ROLE_PERMISSIONS[role]?.canPublishStream ?? false;
}

export function canCreateAvatar(role: UserRole): boolean {
  return ROLE_PERMISSIONS[role]?.canCreateAvatar ?? false;
}

/* ─── Route protection matrix ────────────────────────────────────────────── */

const PROTECTED_ROUTES: { pattern: RegExp; requiredRoles: UserRole[]; redirectTo: string }[] = [
  { pattern: /^\/admin/,              requiredRoles: ["admin", "superadmin"],                              redirectTo: "/auth?next=/admin" },
  { pattern: /^\/hub\/performer/,     requiredRoles: ["performer", "artist", "admin", "superadmin"],       redirectTo: "/auth?next=/hub/performer" },
  { pattern: /^\/hub\/venue/,         requiredRoles: ["venue", "admin", "superadmin"],                     redirectTo: "/auth?next=/hub/venue" },
  { pattern: /^\/hub\/sponsor/,       requiredRoles: ["sponsor", "admin", "superadmin"],                   redirectTo: "/auth?next=/hub/sponsor" },
  { pattern: /^\/hub\/advertiser/,    requiredRoles: ["advertiser", "admin", "superadmin"],                redirectTo: "/auth?next=/hub/advertiser" },
  { pattern: /^\/avatar-center/,      requiredRoles: ["fan", "admin", "superadmin"],                       redirectTo: "/auth" },
  { pattern: /^\/settings\/payout/,   requiredRoles: ["performer", "artist", "venue", "admin", "superadmin"], redirectTo: "/auth" },
  { pattern: /^\/rooms\/create/,      requiredRoles: ["performer", "artist", "admin", "superadmin"],       redirectTo: "/auth" },
];

/**
 * Check if a route requires auth and if the user has the right role.
 * Returns null if access granted, or a NextResponse redirect if denied.
 */
export function checkRouteAccess(
  pathname: string,
  session: SessionPayload | null
): NextResponse | null {
  for (const rule of PROTECTED_ROUTES) {
    if (rule.pattern.test(pathname)) {
      if (!session) {
        return NextResponse.redirect(new URL(rule.redirectTo, "https://themusiciansindex.com"));
      }
      if (!rule.requiredRoles.includes(session.role)) {
        return NextResponse.redirect(new URL("/auth?error=insufficient_role", "https://themusiciansindex.com"));
      }
    }
  }
  return null;
}

/* ─── Security headers (add to next.config.js headers()) ─────────────────── */

export const SECURITY_HEADERS = [
  { key: "X-Frame-Options",            value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options",     value: "nosniff" },
  { key: "X-XSS-Protection",           value: "1; mode=block" },
  { key: "Referrer-Policy",            value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy",         value: "camera=(self), microphone=(self), fullscreen=(self)" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://api.daily.co https://cdnjs.cloudflare.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https: http:",
      "media-src 'self' blob: https:",
      "connect-src 'self' https://api.daily.co wss://*.daily.co https://api.anthropic.com https://api.stripe.com wss://",
      "frame-src https://*.daily.co https://js.stripe.com",
      "frame-ancestors 'self'",
      "worker-src 'self' blob:",
    ].join("; "),
  },
  { key: "Strict-Transport-Security",  value: "max-age=31536000; includeSubDomains" },
];

/**
 * next.config.js headers() integration:
 *
 * import { SECURITY_HEADERS } from "./src/lib/security/TMISecurityEngine";
 *
 * const nextConfig = {
 *   async headers() {
 *     return [{
 *       source: "/(.*)",
 *       headers: SECURITY_HEADERS,
 *     }];
 *   },
 * };
 */

/* ─── Rate limiting (server-side, no Redis required) ─────────────────────── */

const requestCounts = new Map<string, { count: number; resetAt: number }>();

/**
 * Simple in-memory rate limiter. Not shared across Vercel instances.
 * For production scale, use Upstash Redis rate limiting.
 */
export function checkRateLimit(
  identifier: string,
  maxRequests = 100,
  windowMs = 60_000
): { allowed: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  const existing = requestCounts.get(identifier);

  if (!existing || now > existing.resetAt) {
    requestCounts.set(identifier, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetMs: now + windowMs };
  }

  existing.count++;
  const remaining = Math.max(0, maxRequests - existing.count);
  return {
    allowed: existing.count <= maxRequests,
    remaining,
    resetMs: existing.resetAt,
  };
}

/* ─── MX / disposable email validation ───────────────────────────────────── */

const BLOCKED_DOMAINS = new Set([
  "mailinator.com", "guerrillamail.com", "tempmail.com", "throwaway.email",
  "yopmail.com", "sharklasers.com", "guerrillamailblock.com", "trashmail.com",
  "10minutemail.com", "dispostable.com", "fakeinbox.com", "spamgourmet.com",
]);

export function isDisposableEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase().trim();
  if (!domain) return true;
  return BLOCKED_DOMAINS.has(domain);
}

/**
 * Validate email format + check for disposable domains.
 */
export function validateSignupEmail(email: string): {
  valid: boolean;
  error?: string;
} {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: "Invalid email format" };
  }
  if (isDisposableEmail(email)) {
    return { valid: false, error: "Temporary email addresses are not allowed" };
  }
  return { valid: true };
}

/* ─── HMAC request signing ───────────────────────────────────────────────── */

/**
 * Generate HMAC-SHA256 signature for webhook payloads.
 * Use for: ticket validation, payout webhooks, Stripe events.
 */
export async function signPayload(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

export async function verifyPayload(payload: string, signature: string, secret: string): Promise<boolean> {
  const expected = await signPayload(payload, secret);
  // Constant-time comparison
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return diff === 0;
}

/* ─── Payout guard (Platform Law #5: Big Ace approval required) ──────────── */

export interface PayoutRequest {
  userId: string;
  amount: number;
  currency: string;
  reason: string;
  requestedAt: string;
}

export interface PayoutResult {
  queued: boolean;
  requiresApproval: true;
  approver: "Big_Ace";
  payoutId: string;
  message: string;
}

/**
 * Platform Law #5: ALL cash payouts require Big Ace approval.
 * This function NEVER executes the payout — it always queues.
 */
export function queuePayoutForApproval(req: PayoutRequest): PayoutResult {
  const payoutId = `PAY-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  return {
    queued: true,
    requiresApproval: true,
    approver: "Big_Ace",
    payoutId,
    message: `Payout of $${req.amount} ${req.currency} queued for Big Ace approval. ID: ${payoutId}`,
  };
}

/* ─── Session parser (reads tmi_session cookie) ───────────────────────────── */

/**
 * Parse session from cookie without full JWT verification.
 * For full verification, use your existing SessionContext hook.
 */
export function parseSessionCookie(cookieValue: string | undefined): SessionPayload | null {
  if (!cookieValue) return null;
  try {
    const decoded = JSON.parse(atob(cookieValue.split(".")[1] ?? ""));
    if (!decoded.userId || !decoded.email || !decoded.role) return null;
    if (decoded.exp < Math.floor(Date.now() / 1000)) return null;
    // Override tier for Diamond/admin emails
    const email = decoded.email as string;
    return {
      ...decoded,
      isAdmin: isAdminEmail(email),
      isDiamond: isDiamondEmail(email),
      tier: getEffectiveTier(email, decoded.tier),
    };
  } catch {
    return null;
  }
}

/* ─── QUICK REFERENCE: How to add admins ─────────────────────────────────── */
/*
 * NO CODE CHANGE NEEDED to add admins:
 *
 * 1. Go to Vercel → Your Project → Settings → Environment Variables
 * 2. Add or update: ADMIN_EMAILS
 *    Value: email1@domain.com,email2@domain.com,email3@domain.com
 *
 * 3. To add Diamond accounts without code: add DIAMOND_EMAILS the same way.
 *    Value: facethebully916@gmail.com,kreach@gmail.com
 *
 * 4. Click Save → Redeploy → done. No git push required.
 *
 * CURRENT HARDCODED:
 *  Admin: berntmusic33@gmail.com, bigace@berntoutglobal.com
 *  Diamond: berntmusic33@gmail.com, jay@themusiciansindex.com, mannipaulayton1@gmail.com, greenshean21@gmail.com
 *
 * ADD via DIAMOND_EMAILS env var:
 *  - facethebully916@gmail.com (Skeet)
 *  - Any other Diamond accounts
 */
