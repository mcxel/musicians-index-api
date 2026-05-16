import type { VideoResolution } from "./types";

const TARGETS: Record<VideoResolution, { min: number; max: number }> = {
  "720p": { min: 2.5, max: 4 },
  "1080p": { min: 4, max: 8 },
  "1440p": { min: 8, max: 16 },
  "4k": { min: 15, max: 35 },
};

export class BitrateAuthorityEngine {
  private readonly values = new Map<string, number>();

  record(streamId: string, bitrateMbps: number): number {
    this.values.set(streamId, bitrateMbps);
    return bitrateMbps;
  }

  get(streamId: string): number | null {
    return this.values.get(streamId) ?? null;
  }

  targetFor(resolution: VideoResolution): { min: number; max: number } {
    return TARGETS[resolution];
  }

  score(resolution: VideoResolution, bitrateMbps: number): number {
    const target = this.targetFor(resolution);
    if (bitrateMbps >= target.min && bitrateMbps <= target.max) return 100;
    if (bitrateMbps < target.min) {
      const deficitRatio = (target.min - bitrateMbps) / target.min;
      return Math.max(25, Math.round(100 - deficitRatio * 100));
    }

    // Over-bitrate is less harmful than under-bitrate, but still penalized.
    const excessRatio = (bitrateMbps - target.max) / target.max;
    return Math.max(60, Math.round(100 - excessRatio * 25));
  }
}

export const bitrateAuthorityEngine = new BitrateAuthorityEngine();
