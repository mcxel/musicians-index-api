/**
 * RouteHealthEngine
 * Live route health tracking: response times, error rates, availability.
 */

export type RouteHealthStatus = "healthy" | "degraded" | "down" | "unknown";

export interface RouteHealth {
  path: string;
  status: RouteHealthStatus;
  lastCheckedAt: number;
  lastStatusCode: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  errorRate: number; // 0–1
  uptime: number;    // 0–1
  checkCount: number;
  errorCount: number;
  samples: number[];
}

export interface RouteHealthSummary {
  total: number;
  healthy: number;
  degraded: number;
  down: number;
  unknown: number;
  avgLatencyMs: number;
  topSlowRoutes: RouteHealth[];
  recentErrors: { path: string; status: number; at: number }[];
}

const CRITICAL_ROUTES = [
  "/", "/login", "/signup", "/home/1", "/shows", "/shows/monthly-idol",
  "/shows/monday-night-stage", "/events", "/lobbies", "/admin", "/admin/route-health",
  "/magazine", "/live", "/battles", "/avatar", "/wallet",
];

const LATENCY_THRESHOLDS = { healthy: 800, degraded: 2000 };

export class RouteHealthEngine {
  private static _instance: RouteHealthEngine | null = null;

  private _routes: Map<string, RouteHealth> = new Map();
  private _errorLog: { path: string; status: number; at: number }[] = [];
  private _listeners: Set<(path: string, health: RouteHealth) => void> = new Set();

  static getInstance(): RouteHealthEngine {
    if (!RouteHealthEngine._instance) {
      RouteHealthEngine._instance = new RouteHealthEngine();
    }
    return RouteHealthEngine._instance;
  }

  // ── Record ─────────────────────────────────────────────────────────────────

  record(path: string, statusCode: number, latencyMs: number): RouteHealth {
    const existing = this._routes.get(path) ?? this._initRoute(path);

    existing.lastCheckedAt = Date.now();
    existing.lastStatusCode = statusCode;
    existing.checkCount++;
    existing.samples.push(latencyMs);
    if (existing.samples.length > 100) existing.samples.shift();

    const isError = statusCode >= 500;
    if (isError) {
      existing.errorCount++;
      this._errorLog.push({ path, status: statusCode, at: Date.now() });
      if (this._errorLog.length > 500) this._errorLog.shift();
    }

    existing.errorRate = existing.errorCount / existing.checkCount;
    existing.avgLatencyMs = Math.round(existing.samples.reduce((a, b) => a + b, 0) / existing.samples.length);

    const sorted = [...existing.samples].sort((a, b) => a - b);
    const p95idx = Math.floor(sorted.length * 0.95);
    existing.p95LatencyMs = sorted[p95idx] ?? existing.avgLatencyMs;

    const successRate = 1 - existing.errorRate;
    existing.uptime = successRate;

    existing.status =
      isError && existing.errorRate > 0.5 ? "down"
      : existing.avgLatencyMs > LATENCY_THRESHOLDS.degraded || existing.errorRate > 0.1 ? "degraded"
      : "healthy";

    this._emit(path, existing);
    return existing;
  }

  markDown(path: string): void {
    const health = this._routes.get(path) ?? this._initRoute(path);
    health.status = "down";
    health.lastCheckedAt = Date.now();
    this._emit(path, health);
  }

  // ── Access ────────────────────────────────────────────────────────────────

  getHealth(path: string): RouteHealth | null {
    return this._routes.get(path) ?? null;
  }

  getAllHealth(): RouteHealth[] {
    return [...this._routes.values()];
  }

  getCriticalRouteHealth(): RouteHealth[] {
    return CRITICAL_ROUTES.map((p) => this._routes.get(p) ?? this._initRoute(p));
  }

  getSummary(): RouteHealthSummary {
    const all = [...this._routes.values()];
    const healthy = all.filter((r) => r.status === "healthy").length;
    const degraded = all.filter((r) => r.status === "degraded").length;
    const down = all.filter((r) => r.status === "down").length;
    const avgLatencyMs = all.length > 0
      ? Math.round(all.reduce((s, r) => s + r.avgLatencyMs, 0) / all.length) : 0;
    const topSlow = [...all].sort((a, b) => b.p95LatencyMs - a.p95LatencyMs).slice(0, 5);
    return {
      total: all.length,
      healthy,
      degraded,
      down,
      unknown: all.filter((r) => r.status === "unknown").length,
      avgLatencyMs,
      topSlowRoutes: topSlow,
      recentErrors: this._errorLog.slice(-20),
    };
  }

  // ── Subscription ──────────────────────────────────────────────────────────

  onChange(cb: (path: string, health: RouteHealth) => void): () => void {
    this._listeners.add(cb);
    return () => this._listeners.delete(cb);
  }

  private _initRoute(path: string): RouteHealth {
    const h: RouteHealth = {
      path,
      status: "unknown",
      lastCheckedAt: 0,
      lastStatusCode: 0,
      avgLatencyMs: 0,
      p95LatencyMs: 0,
      errorRate: 0,
      uptime: 1,
      checkCount: 0,
      errorCount: 0,
      samples: [],
    };
    this._routes.set(path, h);
    return h;
  }

  private _emit(path: string, health: RouteHealth): void {
    for (const cb of this._listeners) cb(path, health);
  }
}

export const routeHealthEngine = RouteHealthEngine.getInstance();
