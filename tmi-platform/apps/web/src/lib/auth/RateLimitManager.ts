/**
 * RateLimitManager.ts
 *
 * API rate limiting, throttling, and abuse pattern detection.
 * Implements token bucket algorithm with per-IP and per-endpoint limits.
 */

interface RateLimitBucket {
  tokens: number;
  lastRefill: number;
  requests: Array<{ timestamp: number; path: string; method: string }>;
  blocked: boolean;
  blockedUntil?: number;
}

interface AbusePattern {
  ip: string;
  timestamp: number;
  pattern: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, any>;
}

const RATE_LIMIT_BUCKETS = new Map<string, RateLimitBucket>();
const ABUSE_LOG = new Map<string, AbusePattern[]>();
const PERMANENTLY_BLOCKED_IPS = new Set<string>();

// Rate limit configuration (requests per second per IP)
const RATE_LIMITS = {
  global: { tokensPerSecond: 100, burstSize: 200 },
  '/api/auth': { tokensPerSecond: 5, burstSize: 10 },
  '/api/admin': { tokensPerSecond: 10, burstSize: 20 },
  '/api/payments': { tokensPerSecond: 5, burstSize: 10 },
  '/api/recovery': { tokensPerSecond: 3, burstSize: 6 },
  '/api/learning': { tokensPerSecond: 20, burstSize: 50 },
};

// Abuse detection thresholds
const ABUSE_THRESHOLDS = {
  failedAuthAttempts: 10, // 10 failed auth attempts
  failedAuthWindow: 5 * 60 * 1000, // within 5 minutes
  rateLimitExceeds: 5, // 5 rate limit exceeds
  rateLimitWindow: 10 * 60 * 1000, // within 10 minutes
  suspiciousPathCount: 20, // 20 requests to suspicious paths
  suspiciousPathWindow: 60 * 1000, // within 1 minute
};

const SUSPICIOUS_PATHS = [
  '/admin/config',
  '/admin/secrets',
  '/api/admin/bypass',
  '/api/admin/debug',
  '/.env',
  '/config.php',
  '/wp-admin',
  '/api/internal',
];

/**
 * Get rate limit config for endpoint.
 */
function getRateLimitConfig(pathname: string): { tokensPerSecond: number; burstSize: number } {
  for (const [path, config] of Object.entries(RATE_LIMITS)) {
    if (path !== 'global' && pathname.startsWith(path)) {
      return config;
    }
  }
  return RATE_LIMITS.global;
}

/**
 * Check rate limit for request.
 * Returns { blocked: boolean, retryAfterSeconds: number }
 */
export function checkRateLimit(
  clientIp: string,
  pathname: string,
  method: string
): { blocked: boolean; retryAfterSeconds: number; isReplayAttempt?: boolean } {
  // Check permanent block list
  if (PERMANENTLY_BLOCKED_IPS.has(clientIp)) {
    return { blocked: true, retryAfterSeconds: 3600 };
  }

  const now = Date.now();
  const bucketKey = `ratelimit:${clientIp}`;
  const config = getRateLimitConfig(pathname);

  let bucket = RATE_LIMIT_BUCKETS.get(bucketKey);
  if (!bucket) {
    bucket = {
      tokens: config.burstSize,
      lastRefill: now,
      requests: [],
      blocked: false,
    };
    RATE_LIMIT_BUCKETS.set(bucketKey, bucket);
  }

  // Refill tokens based on time elapsed
  const timeSinceLastRefill = (now - bucket.lastRefill) / 1000;
  bucket.tokens = Math.min(config.burstSize, bucket.tokens + timeSinceLastRefill * config.tokensPerSecond);
  bucket.lastRefill = now;

  // Log request
  bucket.requests.push({ timestamp: now, path: pathname, method });
  bucket.requests = bucket.requests.filter((r) => now - r.timestamp < 60 * 1000); // Keep last 60 seconds

  // Check if rate limit exceeded
  if (bucket.tokens < 1) {
    bucket.blocked = true;
    bucket.blockedUntil = now + 10 * 1000; // Block for 10 seconds
    return { blocked: true, retryAfterSeconds: 10 };
  }

  // Unblock if block period expired
  if (bucket.blocked && bucket.blockedUntil && now > bucket.blockedUntil) {
    bucket.blocked = false;
  }

  // Consume one token
  bucket.tokens -= 1;

  if (bucket.blocked) {
    return { blocked: true, retryAfterSeconds: Math.ceil((bucket.blockedUntil! - now) / 1000) };
  }

  return { blocked: false, retryAfterSeconds: 0 };
}

/**
 * Track and detect abuse patterns.
 */
export function trackAbusePattern(
  clientIp: string,
  pathname: string,
  method: string,
  context: Record<string, any>
): void {
  const now = Date.now();
  const log = ABUSE_LOG.get(clientIp) || [];

  // Check for failed auth attempts
  if (pathname === '/api/auth/signin' && context.blocked) {
    const recentFailures = log.filter(
      (p) => p.pattern === 'failed-auth' && now - p.timestamp < ABUSE_THRESHOLDS.failedAuthWindow
    );

    if (recentFailures.length >= ABUSE_THRESHOLDS.failedAuthAttempts) {
      logAbuse(clientIp, 'brute-force-auth', 'critical', {
        attemptCount: recentFailures.length + 1,
        window: ABUSE_THRESHOLDS.failedAuthWindow,
      });

      // Temporarily block IP
      PERMANENTLY_BLOCKED_IPS.add(clientIp);
      setTimeout(() => PERMANENTLY_BLOCKED_IPS.delete(clientIp), 15 * 60 * 1000); // 15 minute block
      return;
    }

    logAbuse(clientIp, 'failed-auth', 'medium', { path: pathname });
  }

  // Check for rate limit abuse
  if (context.blocked) {
    const recentExceeds = log.filter(
      (p) => p.pattern === 'rate-limit-exceed' && now - p.timestamp < ABUSE_THRESHOLDS.rateLimitWindow
    );

    if (recentExceeds.length >= ABUSE_THRESHOLDS.rateLimitExceeds) {
      logAbuse(clientIp, 'rate-limit-abuse', 'high', {
        exceeds: recentExceeds.length + 1,
        window: ABUSE_THRESHOLDS.rateLimitWindow,
      });

      // Temporarily block IP
      PERMANENTLY_BLOCKED_IPS.add(clientIp);
      setTimeout(() => PERMANENTLY_BLOCKED_IPS.delete(clientIp), 30 * 60 * 1000); // 30 minute block
      return;
    }

    logAbuse(clientIp, 'rate-limit-exceed', 'low', { path: pathname });
  }

  // Check for suspicious path requests
  if (SUSPICIOUS_PATHS.some((p) => pathname.includes(p))) {
    const recentSuspicious = log.filter(
      (p) => p.pattern === 'suspicious-path' && now - p.timestamp < ABUSE_THRESHOLDS.suspiciousPathWindow
    );

    if (recentSuspicious.length >= ABUSE_THRESHOLDS.suspiciousPathCount) {
      logAbuse(clientIp, 'path-scan-attack', 'high', {
        scanCount: recentSuspicious.length + 1,
        paths: [pathname],
      });

      PERMANENTLY_BLOCKED_IPS.add(clientIp);
      setTimeout(() => {
        PERMANENTLY_BLOCKED_IPS.delete(clientIp);
      }, 60 * 60 * 1000); // 1 hour block
      return;
    }

    logAbuse(clientIp, 'suspicious-path', 'medium', { path: pathname });
  }

  // Check for replay attempts
  if (context.isReplayAttempt) {
    logAbuse(clientIp, 'replay-attempt', 'high', { path: pathname });

    PERMANENTLY_BLOCKED_IPS.add(clientIp);
    setTimeout(() => PERMANENTLY_BLOCKED_IPS.delete(clientIp), 30 * 60 * 1000); // 30 minute block
  }

  ABUSE_LOG.set(clientIp, log);
}

/**
 * Log abuse event.
 */
function logAbuse(
  ip: string,
  pattern: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  details: Record<string, any>
): void {
  const event: AbusePattern = {
    ip,
    timestamp: Date.now(),
    pattern,
    severity,
    details,
  };

  const log = ABUSE_LOG.get(ip) || [];
  log.push(event);
  ABUSE_LOG.set(ip, log.slice(-100)); // Keep last 100 events per IP

  // Log to console (should also write to security log in production)
  console.warn(`[ABUSE] IP=${ip} Pattern=${pattern} Severity=${severity}`, details);
}

/**
 * Check if IP is blocked.
 */
export function isIPBlocked(clientIp: string): boolean {
  return PERMANENTLY_BLOCKED_IPS.has(clientIp);
}

/**
 * Get abuse stats for monitoring.
 */
export function getAbuseStats(): {
  blockedIPs: number;
  trackedIPs: number;
  criticalEvents: number;
} {
  let criticalCount = 0;
  for (const events of ABUSE_LOG.values()) {
    criticalCount += events.filter((e) => e.severity === 'critical').length;
  }

  return {
    blockedIPs: PERMANENTLY_BLOCKED_IPS.size,
    trackedIPs: ABUSE_LOG.size,
    criticalEvents: criticalCount,
  };
}

/**
 * Get abuse log for specific IP.
 */
export function getAbuseLog(clientIp: string): AbusePattern[] {
  return ABUSE_LOG.get(clientIp) || [];
}

/**
 * Cleanup old rate limit buckets (call periodically).
 */
export function cleanupExpiredBuckets(): void {
  const now = Date.now();
  let cleanedCount = 0;

  for (const [key, bucket] of RATE_LIMIT_BUCKETS.entries()) {
    // Clean buckets with no activity in last 30 minutes
    if (bucket.requests.length > 0) {
      const lastActivity = bucket.requests[bucket.requests.length - 1].timestamp;
      if (now - lastActivity > 30 * 60 * 1000) {
        RATE_LIMIT_BUCKETS.delete(key);
        cleanedCount++;
      }
    }
  }

  // Clean abuse logs older than 1 hour
  for (const [ip, events] of ABUSE_LOG.entries()) {
    const recentEvents = events.filter((e) => now - e.timestamp < 60 * 60 * 1000);
    if (recentEvents.length === 0) {
      ABUSE_LOG.delete(ip);
    } else {
      ABUSE_LOG.set(ip, recentEvents);
    }
  }

  if (cleanedCount > 0) {
    console.log(`[RateLimit] Cleaned up ${cleanedCount} expired buckets`);
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupExpiredBuckets, 5 * 60 * 1000);
