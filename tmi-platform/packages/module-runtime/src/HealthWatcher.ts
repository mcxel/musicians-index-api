import type { ModuleId, HealthMetrics } from "./types.js";

export type WatcherAlert = {
  moduleId: ModuleId;
  level: "INFO" | "WARN" | "CRITICAL";
  metric: keyof HealthMetrics;
  value: number;
  threshold: number;
  timestamp: number;
};

export type AlertHandler = (alert: WatcherAlert) => void;

export interface WatcherThresholds {
  cpuPercentWarn: number;
  cpuPercentCritical: number;
  memoryMbWarn: number;
  memoryMbCritical: number;
  queueDepthWarn: number;
  queueDepthCritical: number;
  errorRateWarn: number;
  p95ResponseMsWarn: number;
  p95ResponseMsCritical: number;
}

const DEFAULT_THRESHOLDS: WatcherThresholds = {
  cpuPercentWarn: 70,
  cpuPercentCritical: 90,
  memoryMbWarn: 384,
  memoryMbCritical: 512,
  queueDepthWarn: 500,
  queueDepthCritical: 900,
  errorRateWarn: 5,
  p95ResponseMsWarn: 700,
  p95ResponseMsCritical: 2000,
};

export class HealthWatcher {
  private moduleId: ModuleId;
  private thresholds: WatcherThresholds;
  private alertHandlers: AlertHandler[] = [];
  private timer: ReturnType<typeof setInterval> | null = null;
  private metrics: HealthMetrics = {
    cpuPercent: 0,
    memoryMb: 0,
    queueDepth: 0,
    activeConnections: 0,
    errorRatePerMin: 0,
    p95ResponseMs: 0,
    score: 100,
  };
  private getQueueDepth: () => number;

  constructor(
    moduleId: ModuleId,
    thresholds: Partial<WatcherThresholds> = {},
    getQueueDepth: () => number = () => 0
  ) {
    this.moduleId = moduleId;
    this.thresholds = { ...DEFAULT_THRESHOLDS, ...thresholds };
    this.getQueueDepth = getQueueDepth;
  }

  onAlert(handler: AlertHandler): () => void {
    this.alertHandlers.push(handler);
    return () => {
      this.alertHandlers = this.alertHandlers.filter((h) => h !== handler);
    };
  }

  start(intervalMs = 10_000): void {
    if (this.timer) return;
    this.timer = setInterval(() => this.collect(), intervalMs);
    console.log(`[${this.moduleId}/health] Watcher started`);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  getMetrics(): Readonly<HealthMetrics> {
    return { ...this.metrics };
  }

  private collect(): void {
    const mem = process.memoryUsage();
    this.metrics.memoryMb = Math.round(mem.rss / 1024 / 1024);
    this.metrics.queueDepth = this.getQueueDepth();
    // CPU and response time are instrumented externally; defaults kept if not set
    this.metrics.score = this.computeScore();
    this.checkThresholds();
  }

  private computeScore(): number {
    const t = this.thresholds;
    const m = this.metrics;
    let deductions = 0;
    if (m.memoryMb > t.memoryMbCritical) deductions += 40;
    else if (m.memoryMb > t.memoryMbWarn) deductions += 15;
    if (m.queueDepth > t.queueDepthCritical) deductions += 30;
    else if (m.queueDepth > t.queueDepthWarn) deductions += 10;
    if (m.p95ResponseMs > t.p95ResponseMsCritical) deductions += 20;
    else if (m.p95ResponseMs > t.p95ResponseMsWarn) deductions += 8;
    if (m.errorRatePerMin > t.errorRateWarn) deductions += 10;
    return Math.max(0, 100 - deductions);
  }

  private checkThresholds(): void {
    const t = this.thresholds;
    const m = this.metrics;

    this.maybeAlert("memoryMb", m.memoryMb, t.memoryMbWarn, t.memoryMbCritical);
    this.maybeAlert("queueDepth", m.queueDepth, t.queueDepthWarn, t.queueDepthCritical);
    this.maybeAlert("p95ResponseMs", m.p95ResponseMs, t.p95ResponseMsWarn, t.p95ResponseMsCritical);
    this.maybeAlert("cpuPercent", m.cpuPercent, t.cpuPercentWarn, t.cpuPercentCritical);
  }

  private maybeAlert(
    metric: keyof HealthMetrics,
    value: number,
    warn: number,
    critical: number
  ): void {
    if (value < warn) return;
    const level = value >= critical ? "CRITICAL" : "WARN";
    const threshold = level === "CRITICAL" ? critical : warn;
    const alert: WatcherAlert = {
      moduleId: this.moduleId,
      level,
      metric,
      value,
      threshold,
      timestamp: Date.now(),
    };
    this.alertHandlers.forEach((h) => h(alert));
    if (level === "CRITICAL") {
      console.error(
        `[${this.moduleId}/health] CRITICAL — ${metric}: ${value} >= ${threshold}`
      );
    } else {
      console.warn(
        `[${this.moduleId}/health] WARN — ${metric}: ${value} >= ${threshold}`
      );
    }
  }
}
