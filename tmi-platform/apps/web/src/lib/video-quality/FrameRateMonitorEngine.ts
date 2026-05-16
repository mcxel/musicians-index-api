export class FrameRateMonitorEngine {
  private readonly fps = new Map<string, number>();

  record(streamId: string, fps: number): number {
    this.fps.set(streamId, fps);
    return fps;
  }

  get(streamId: string): number | null {
    return this.fps.get(streamId) ?? null;
  }

  score(fps: number): number {
    if (fps >= 60) return 100;
    if (fps >= 30) return 85;
    if (fps >= 24) return 65;
    return 30;
  }
}

export const frameRateMonitorEngine = new FrameRateMonitorEngine();
