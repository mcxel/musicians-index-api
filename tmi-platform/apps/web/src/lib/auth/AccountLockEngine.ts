type FailedAttempt = {
  at: number;
  ip?: string;
  userAgent?: string;
};

type AccountLockRecord = {
  lockedUntil: number;
  reason: "too_many_attempts";
  createdAt: number;
};

const FAILED_WINDOW_MS = 10 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 8;
const LOCK_DURATION_MS = 15 * 60 * 1000;

const failedAttempts = new Map<string, FailedAttempt[]>();
const lockStore = new Map<string, AccountLockRecord>();

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isAccountLocked(emailRaw: string): { locked: boolean; until?: number } {
  const email = normalizeEmail(emailRaw);
  const lock = lockStore.get(email);
  if (!lock) return { locked: false };
  if (Date.now() >= lock.lockedUntil) {
    lockStore.delete(email);
    return { locked: false };
  }
  return { locked: true, until: lock.lockedUntil };
}

export function recordFailedLogin(params: {
  email: string;
  ip?: string;
  userAgent?: string;
}): { locked: boolean; until?: number } {
  const email = normalizeEmail(params.email);
  const now = Date.now();

  const attempts = (failedAttempts.get(email) ?? []).filter((a) => now - a.at <= FAILED_WINDOW_MS);
  attempts.unshift({ at: now, ip: params.ip, userAgent: params.userAgent });
  failedAttempts.set(email, attempts);

  if (attempts.length >= MAX_FAILED_ATTEMPTS) {
    const lock: AccountLockRecord = {
      createdAt: now,
      lockedUntil: now + LOCK_DURATION_MS,
      reason: "too_many_attempts",
    };
    lockStore.set(email, lock);
    return { locked: true, until: lock.lockedUntil };
  }

  return { locked: false };
}

export function clearFailedLogins(emailRaw: string): void {
  const email = normalizeEmail(emailRaw);
  failedAttempts.delete(email);
  lockStore.delete(email);
}
