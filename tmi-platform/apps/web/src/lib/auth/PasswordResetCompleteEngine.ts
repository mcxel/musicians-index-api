import { consumePasswordResetToken, validatePasswordResetToken } from "./PasswordResetTokenEngine";

type PasswordResetAuditRecord = {
  email: string;
  ip?: string;
  userAgent?: string;
  completedAt: number;
  status: "success" | "failure";
  reason?: "invalid_token" | "expired_token" | "used_token" | "weak_password" | "password_mismatch";
};

const passwordDigestStore = new Map<string, string>();
const authSessionVersion = new Map<string, number>();
const resetAuditLog: PasswordResetAuditRecord[] = [];

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function strongPassword(password: string): boolean {
  if (password.length < 10) return false;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  return hasUpper && hasLower && hasDigit && hasSymbol;
}

function writeAudit(entry: PasswordResetAuditRecord): void {
  resetAuditLog.unshift(entry);
}

export function completePasswordReset(params: {
  email: string;
  token: string;
  newPassword: string;
  confirmPassword: string;
  ip?: string;
  userAgent?: string;
}): { ok: boolean; reason?: PasswordResetAuditRecord["reason"] } {
  const email = normalizeEmail(params.email);

  const tokenState = validatePasswordResetToken({ email, token: params.token });
  if (!tokenState.valid) {
    const reason =
      tokenState.reason === "expired"
        ? "expired_token"
        : tokenState.reason === "used"
        ? "used_token"
        : "invalid_token";
    writeAudit({
      email,
      ip: params.ip,
      userAgent: params.userAgent,
      completedAt: Date.now(),
      status: "failure",
      reason,
    });
    return { ok: false, reason };
  }

  if (params.newPassword !== params.confirmPassword) {
    writeAudit({
      email,
      ip: params.ip,
      userAgent: params.userAgent,
      completedAt: Date.now(),
      status: "failure",
      reason: "password_mismatch",
    });
    return { ok: false, reason: "password_mismatch" };
  }

  if (!strongPassword(params.newPassword)) {
    writeAudit({
      email,
      ip: params.ip,
      userAgent: params.userAgent,
      completedAt: Date.now(),
      status: "failure",
      reason: "weak_password",
    });
    return { ok: false, reason: "weak_password" };
  }

  const consumed = consumePasswordResetToken({ email, token: params.token });
  if (!consumed) {
    writeAudit({
      email,
      ip: params.ip,
      userAgent: params.userAgent,
      completedAt: Date.now(),
      status: "failure",
      reason: "used_token",
    });
    return { ok: false, reason: "used_token" };
  }

  passwordDigestStore.set(email, `pw::${params.newPassword.length}::${Date.now()}`);
  authSessionVersion.set(email, (authSessionVersion.get(email) ?? 0) + 1);

  writeAudit({
    email,
    ip: params.ip,
    userAgent: params.userAgent,
    completedAt: Date.now(),
    status: "success",
  });

  return { ok: true };
}

export function getPasswordResetAudit(limit = 200): PasswordResetAuditRecord[] {
  return resetAuditLog.slice(0, limit);
}

export function getSessionVersion(email: string): number {
  return authSessionVersion.get(normalizeEmail(email)) ?? 0;
}
