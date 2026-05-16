import type { VideoResolution } from "./types";

export class ResolutionAuthorityEngine {
  private readonly delivered = new Map<string, VideoResolution>();

  record(streamId: string, deliveredResolution: VideoResolution): VideoResolution {
    this.delivered.set(streamId, deliveredResolution);
    return deliveredResolution;
  }

  getDelivered(streamId: string): VideoResolution | null {
    return this.delivered.get(streamId) ?? null;
  }

  score(resolution: VideoResolution): number {
    switch (resolution) {
      case "720p":
        return 65;
      case "1080p":
        return 82;
      case "1440p":
        return 92;
      case "4k":
        return 100;
      default:
        return 50;
    }
  }
}

export const resolutionAuthorityEngine = new ResolutionAuthorityEngine();
