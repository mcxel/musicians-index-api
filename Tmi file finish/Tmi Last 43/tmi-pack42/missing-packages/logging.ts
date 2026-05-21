// packages/logging/src/logger.service.ts
// Structured logging for all platform services.

export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

export interface LogEntry {
  level: LogLevel;
  service: string;        // which service/module
  message: string;
  timestamp: string;
  requestId?: string;
  userId?: string;
  entityType?: string;
  entityId?: string;
  duration?: number;      // ms for performance logs
  error?: { message: string; stack?: string; code?: string };
  meta?: Record<string, unknown>;
}

// ── LOGGER ────────────────────────────────────────────
export class Logger {
  constructor(private service: string) {}

  private log(level: LogLevel, message: string, meta?: Partial<LogEntry>): void {
    const entry: LogEntry = {
      level,
      service: this.service,
      message,
      timestamp: new Date().toISOString(),
      ...meta,
    };
    // In production: send to Sentry (errors), Datadog/CloudWatch (all)
    // In development: pretty print to console
    if (level === "error" || level === "fatal") {
      console.error(JSON.stringify(entry));
    } else {
      console.log(JSON.stringify(entry));
    }
  }

  debug(msg: string, meta?: Partial<LogEntry>) { this.log("debug", msg, meta); }
  info(msg: string, meta?: Partial<LogEntry>)  { this.log("info",  msg, meta); }
  warn(msg: string, meta?: Partial<LogEntry>)  { this.log("warn",  msg, meta); }
  error(msg: string, meta?: Partial<LogEntry>) { this.log("error", msg, meta); }
  fatal(msg: string, meta?: Partial<LogEntry>) { this.log("fatal", msg, meta); }

  // Performance logging
  perf(action: string, durationMs: number, meta?: Partial<LogEntry>) {
    this.info(`PERF:${action}`, { ...meta, duration: durationMs });
    if (durationMs > 1000) this.warn(`SLOW:${action} took ${durationMs}ms`);
  }

  // Platform law violations (always logged)
  lawViolation(law: number, attempted: string, blockedBy: string) {
    this.error(`PLATFORM_LAW_${law}_VIOLATION`, {
      meta: { attempted, blockedBy, law },
    });
  }
}

// ── AUDIT LOGGER (admin actions only) ────────────────
export function logAdminAction(
  adminId: string,
  action: string,
  entityType: string,
  entityId: string,
  before?: unknown,
  after?: unknown
): void {
  const logger = new Logger("admin-audit");
  logger.info(`ADMIN_ACTION:${action}`, {
    userId: adminId,
    entityType,
    entityId,
    meta: { before, after },
  });
}
