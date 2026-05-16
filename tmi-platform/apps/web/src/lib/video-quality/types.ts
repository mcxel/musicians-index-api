export type VideoResolution = "720p" | "1080p" | "1440p" | "4k";

export type RoomVideoContext =
  | "billboard"
  | "battle"
  | "cypher"
  | "concert"
  | "interview"
  | "live-room";

export type QualityBadge = "HD LIVE" | "1080P LIVE" | "1440P LIVE" | "4K LIVE";

export interface StreamHealthSample {
  packetLossPct: number;
  latencyMs: number;
  reconnectCount: number;
  dropCount: number;
  freezeCount: number;
  blurDetected?: boolean;
  blackFrameDetected?: boolean;
  freezeFrameDetected?: boolean;
  audioClippingDetected?: boolean;
  avDesyncDetected?: boolean;
}

export interface VideoMetricsInput extends StreamHealthSample {
  deliveredResolution: VideoResolution;
  bitrateMbps: number;
  fps: number;
}

export interface VideoQualityBreakdown {
  resolutionScore: number;
  bitrateScore: number;
  fpsScore: number;
  packetLossScore: number;
  latencyScore: number;
  stabilityScore: number;
}

export interface VideoQualitySnapshot {
  streamId: string;
  context: RoomVideoContext;
  deliveredResolution: VideoResolution;
  bitrateMbps: number;
  fps: number;
  packetLossPct: number;
  latencyMs: number;
  qualityScore: number;
  badge: QualityBadge;
  qualityTier: "acceptable" | "standard" | "premium" | "showcase";
  breakdown: VideoQualityBreakdown;
  monitorFlags: {
    blurEvents: number;
    blackFrameEvents: number;
    freezeFrameEvents: number;
    audioClipEvents: number;
    desyncEvents: number;
  };
}
