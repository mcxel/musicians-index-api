export const SAVED_PERFORMANCE_POLICY = {
  /** Max saved performances per rolling 12-month window, same for all roles */
  ANNUAL_LIMIT: 10,
  /** Max archival duration in seconds (2 hours) */
  MAX_DURATION_SECONDS: 7_200,
  /** Initial retention window in days */
  RETENTION_DAYS: 90,
  /** Renewal extends expiry by this many days */
  RENEWAL_EXTENSION_DAYS: 90,
} as const;

/** Error codes returned to callers when server-side limits are hit */
export const SAVED_PERFORMANCE_ERROR_CODES = {
  ANNUAL_LIMIT_REACHED: "SAVED_PERFORMANCE_ANNUAL_LIMIT_REACHED",
  MAX_DURATION_REACHED: "SAVED_PERFORMANCE_MAX_DURATION_REACHED",
  NOT_FOUND: "SAVED_PERFORMANCE_NOT_FOUND",
  ALREADY_DELETED: "SAVED_PERFORMANCE_ALREADY_DELETED",
} as const;

/** Days before expiry at which warning notifications fire */
export const EXPIRY_WARNING_DAYS = [30, 7, 1] as const;
