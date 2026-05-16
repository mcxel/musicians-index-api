/**
 * StatsMonitorEngine
 * Live stats aggregation for admin dashboards — revenue, viewers, activity, health signals.
 */

export type StatSnapshot = {
  key: string;
  label: string;
  value: number;
  unit: string;
  delta: number;
  deltaLabel: string;
  trend: "up" | "down" | "neutral";
  recordedAtMs: number;
};

export type TimeSeries = {
  key: string;
  points: Array<{ timestampMs: number; value: number }>;
  windowMs: number;
};

export class StatsMonitorEngine {
  private readonly snapshots: Map<string, StatSnapshot> = new Map();
  private readonly series: Map<string, TimeSeries> = new Map();
  private readonly WINDOW_MS = 60 * 60 * 1000; // 1 hour rolling window

  record(key: string, label: string, value: number, unit: string = ""): void {
    const prev = this.snapshots.get(key);
    const prevValue = prev?.value ?? value;
    const delta = value - prevValue;

    const snapshot: StatSnapshot = {
      key,
      label,
      value,
      unit,
      delta,
      deltaLabel: this.formatDelta(delta, unit),
      trend: delta > 0 ? "up" : delta < 0 ? "down" : "neutral",
      recordedAtMs: Date.now(),
    };

    this.snapshots.set(key, snapshot);

    // Push to time series
    let ts = this.series.get(key);
    if (!ts) {
      ts = { key, points: [], windowMs: this.WINDOW_MS };
      this.series.set(key, ts);
    }

    const now = Date.now();
    ts.points.push({ timestampMs: now, value });
    // Prune old points outside rolling window
    ts.points = ts.points.filter((p) => now - p.timestampMs <= this.WINDOW_MS);
  }

  private formatDelta(delta: number, unit: string): string {
    if (delta === 0) return "—";
    const prefix = delta > 0 ? "+" : "";
    if (unit === "$") return `${prefix}$${Math.abs(delta).toFixed(2)}`;
    return `${prefix}${delta.toFixed(0)}${unit ? " " + unit : ""}`;
  }

  get(key: string): StatSnapshot | null {
    return this.snapshots.get(key) ?? null;
  }

  getAll(): StatSnapshot[] {
    return [...this.snapshots.values()];
  }

  getSeries(key: string): TimeSeries | null {
    return this.series.get(key) ?? null;
  }

  getTopByValue(n: number = 5): StatSnapshot[] {
    return this.getAll()
      .sort((a, b) => b.value - a.value)
      .slice(0, n);
  }

  getCriticalStats(): StatSnapshot[] {
    return this.getAll().filter((s) => s.trend === "down" && Math.abs(s.delta) > s.value * 0.2);
  }

  /** Convenience: bulk record a dict of { key: value } */
  recordBatch(data: Record<string, { label: string; value: number; unit?: string }>): void {
    for (const [key, { label, value, unit }] of Object.entries(data)) {
      this.record(key, label, value, unit ?? "");
    }
  }
}

export const statsMonitorEngine = new StatsMonitorEngine();
