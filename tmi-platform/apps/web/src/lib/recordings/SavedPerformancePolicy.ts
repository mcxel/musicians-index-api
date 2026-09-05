/**
 * SavedPerformancePolicy
 * Server-side constants for the Saved Performance retention system.
 * All limits are enforced by SavedPerformanceService — never by the client.
 */

/** Maximum saves per user per rolling 12-month window */
export const ANNUAL_LIMIT = 10;

/** Maximum recording duration (seconds) = 2 hours */
export const MAX_DURATION_SECONDS = 7200;

/** Default retention window (days) from createdAt */
export const RETENTION_DAYS = 90;

/** Renewal extends expiresAt by this many days (from the renewal date) */
export const RENEWAL_EXTENSION_DAYS = 90;

/** Warning thresholds: fire expiration warnings when this many days remain */
export const WARNING_THRESHOLDS_DAYS = [30, 7, 1] as const;

/** Error codes returned by the service */
export const ERROR_CODES = {
  ANNUAL_LIMIT_REACHED: "SAVED_PERFORMANCE_ANNUAL_LIMIT_REACHED",
  NOT_FOUND: "SAVED_PERFORMANCE_NOT_FOUND",
  NOT_OWNER: "SAVED_PERFORMANCE_NOT_OWNER",
  ALREADY_DELETED: "SAVED_PERFORMANCE_ALREADY_DELETED",
} as const;

/** Compute the expiry date from a creation date */
export function computeExpiresAt(from: Date = new Date()): Date {
  const d = new Date(from);
  d.setDate(d.getDate() + RETENTION_DAYS);
  return d;
}

/** Compute renewal expiry date (from today) */
export function computeRenewalExpiresAt(): Date {
  return computeExpiresAt(new Date());
}

/** Return days remaining until expiry (0 if past) */
export function daysUntilExpiry(expiresAt: Date): number {
  const ms = expiresAt.getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86_400_000));
}

/** Return whether this recording should be flagged as EXPIRING_SOON */
export function isExpiringSoon(expiresAt: Date): boolean {
  return daysUntilExpiry(expiresAt) <= 30;
}

/** Cap duration to MAX_DURATION_SECONDS — used before creating a record */
export function capDuration(durationSeconds: number): number {
  return Math.min(durationSeconds, MAX_DURATION_SECONDS);
}

/** Compute the 12-month rolling window start */
export function rollingWindowStart(): Date {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 1);
  return d;
}
