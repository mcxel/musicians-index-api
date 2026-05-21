import { MODULE_CONFIG } from "@/config/module.config";

/**
 * Security controller for Danika's Law.
 * Enforces auth boundaries, validates origins, and rate-limits by userId.
 */

const MAX_REQUESTS_PER_MINUTE = 60;
const requestCounts = new Map<string, { count: number; resetAt: number }>();

export function checkOrigin(requestOrigin: string | null): boolean {
  if (!requestOrigin) return false;
  return MODULE_CONFIG.isolation.allowedOrigins.some(
    (allowed) =>
      requestOrigin === allowed ||
      requestOrigin.startsWith(allowed)
  );
}

export function enforceRateLimit(userId: string): {
  allowed: boolean;
  remaining: number;
} {
  const now = Date.now();
  const key = `rl:${userId}`;
  const entry = requestCounts.get(key);

  if (!entry || entry.resetAt < now) {
    requestCounts.set(key, {
      count: 1,
      resetAt: now + 60_000,
    });
    return { allowed: true, remaining: MAX_REQUESTS_PER_MINUTE - 1 };
  }

  entry.count += 1;
  const allowed = entry.count <= MAX_REQUESTS_PER_MINUTE;
  return {
    allowed,
    remaining: Math.max(0, MAX_REQUESTS_PER_MINUTE - entry.count),
  };
}

export function validateLawReferralSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  // HMAC-SHA256 validation — compare signatures in constant time
  if (!secret || !signature) return false;
  const { createHmac, timingSafeEqual } = require("crypto") as typeof import("crypto");
  const expected = createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  try {
    return timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expected, "hex")
    );
  } catch {
    return false;
  }
}

export function sanitizeQuestion(input: string): string {
  // Strip control characters and limit length
  return input
    .replace(/[\x00-\x1F\x7F]/g, " ")
    .trim()
    .slice(0, 2000);
}
