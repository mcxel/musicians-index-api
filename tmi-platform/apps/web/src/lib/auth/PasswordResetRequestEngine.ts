import { issuePasswordResetToken, purgeExpiredPasswordResetTokens } from "./PasswordResetTokenEngine";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REQUEST_WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;

type ResetRequestAudit = {
  email: string;
  ip?: string;
  userAgent?: string;
  requestedAt: number;
  status: "accepted" | "rejected";
  reason?: "invalid_email" | "rate_limited";
};

const requestHistory = new Map<string, number[]>();
const requestAuditLog: ResetRequestAudit[] = [];

export type PasswordResetRequestResult = {
  ok: boolean;
  reason?: "invalid_email" | "rate_limited";
  token?: string;
  expiresAt?: number;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

function isRateLimited(email: string): boolean {
  const now = Date.now();
  const entries = (requestHistory.get(email) ?? []).filter((ts) => now - ts <= REQUEST_WINDOW_MS);
  requestHistory.set(email, entries);
  return entries.length >= MAX_REQUESTS_PER_WINDOW;
}

function pushRateEntry(email: string): void {
  const entries = requestHistory.get(email) ?? [];
  entries.unshift(Date.now());
  requestHistory.set(email, entries.slice(0, MAX_REQUESTS_PER_WINDOW + 5));
}

export function requestPasswordReset(params: {
  email: string;
  ip?: string;
  userAgent?: string;
}): PasswordResetRequestResult {
  const email = normalizeEmail(params.email);

  if (!validateEmail(email)) {
    requestAuditLog.unshift({
      email,
      ip: params.ip,
      userAgent: params.userAgent,
      requestedAt: Date.now(),
      status: "rejected",
      reason: "invalid_email",
    });
    return { ok: false, reason: "invalid_email" };
  }

  if (isRateLimited(email)) {
    requestAuditLog.unshift({
      email,
      ip: params.ip,
      userAgent: params.userAgent,
      requestedAt: Date.now(),
      status: "rejected",
      reason: "rate_limited",
    });
    return { ok: false, reason: "rate_limited" };
  }

  purgeExpiredPasswordResetTokens(email);
  pushRateEntry(email);

  const { token, record } = issuePasswordResetToken({
    email,
    ip: params.ip,
    userAgent: params.userAgent,
  });

  requestAuditLog.unshift({
    email,
    ip: params.ip,
    userAgent: params.userAgent,
    requestedAt: Date.now(),
    status: "accepted",
  });

  return {
    ok: true,
    token,
    expiresAt: record.expiresAt,
  };
}

export function getPasswordResetRequestAudit(limit = 100): ResetRequestAudit[] {
  return requestAuditLog.slice(0, limit);
}
