export class LatencyMonitorEngine {
  private readonly latency = new Map<string, number>();

  record(streamId: string, latencyMs: number): number {
    this.latency.set(streamId, latencyMs);
    return latencyMs;
  }

  get(streamId: string): number | null {
    return this.latency.get(streamId) ?? null;
  }

  score(latencyMs: number): number {
    if (latencyMs <= 150) return 100;
    if (latencyMs <= 300) {
      const ratio = (latencyMs - 150) / 150;
      return Math.round(100 - ratio * 30);
    }
    if (latencyMs <= 500) {
      const ratio = (latencyMs - 300) / 200;
      return Math.round(70 - ratio * 40);
    }
    return 20;
  }
}

export const latencyMonitorEngine = new LatencyMonitorEngine();
