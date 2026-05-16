import { bitrateAuthorityEngine } from "./BitrateAuthorityEngine";
import { frameRateMonitorEngine } from "./FrameRateMonitorEngine";
import { latencyMonitorEngine } from "./LatencyMonitorEngine";
import { resolutionAuthorityEngine } from "./ResolutionAuthorityEngine";
import { streamHealthEngine } from "./StreamHealthEngine";
import type {
  QualityBadge,
  RoomVideoContext,
  VideoMetricsInput,
  VideoQualityBreakdown,
  VideoQualitySnapshot,
  VideoResolution,
} from "./types";

interface StreamState {
  streamId: string;
  context: RoomVideoContext;
  deliveredResolution: VideoResolution;
  bitrateMbps: number;
  fps: number;
  packetLossPct: number;
  latencyMs: number;
}

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) hash = (hash << 5) - hash + input.charCodeAt(i);
  return Math.abs(hash);
}

export class VideoQualityEngine {
  private readonly streams = new Map<string, StreamState>();

  record(streamId: string, context: RoomVideoContext, metrics: VideoMetricsInput): VideoQualitySnapshot {
    const deliveredResolution = resolutionAuthorityEngine.record(streamId, metrics.deliveredResolution);
    const bitrateMbps = bitrateAuthorityEngine.record(streamId, metrics.bitrateMbps);
    const fps = frameRateMonitorEngine.record(streamId, metrics.fps);
    const latencyMs = latencyMonitorEngine.record(streamId, metrics.latencyMs);

    streamHealthEngine.record(streamId, metrics);

    this.streams.set(streamId, {
      streamId,
      context,
      deliveredResolution,
      bitrateMbps,
      fps,
      packetLossPct: metrics.packetLossPct,
      latencyMs,
    });

    return this.getSnapshot(streamId) as VideoQualitySnapshot;
  }

  getSnapshot(streamId: string): VideoQualitySnapshot | null {
    const stream = this.streams.get(streamId);
    if (!stream) return null;

    const health = streamHealthEngine.get(streamId);
    if (!health) return null;

    const breakdown: VideoQualityBreakdown = {
      resolutionScore: resolutionAuthorityEngine.score(stream.deliveredResolution),
      bitrateScore: bitrateAuthorityEngine.score(stream.deliveredResolution, stream.bitrateMbps),
      fpsScore: frameRateMonitorEngine.score(stream.fps),
      packetLossScore: streamHealthEngine.packetLossScore(stream.packetLossPct),
      latencyScore: latencyMonitorEngine.score(stream.latencyMs),
      stabilityScore: streamHealthEngine.stabilityScore(health.reconnectCount, health.dropCount, health.freezeCount),
    };

    const qualityScore = Math.round(
      breakdown.resolutionScore * 0.2 +
      breakdown.bitrateScore * 0.2 +
      breakdown.fpsScore * 0.15 +
      breakdown.packetLossScore * 0.15 +
      breakdown.latencyScore * 0.15 +
      breakdown.stabilityScore * 0.15,
    );

    const badge = this.toBadge(stream.deliveredResolution, qualityScore);

    const qualityTier = qualityScore >= 92
      ? "showcase"
      : qualityScore >= 82
      ? "premium"
      : qualityScore >= 68
      ? "standard"
      : "acceptable";

    return {
      streamId: stream.streamId,
      context: stream.context,
      deliveredResolution: stream.deliveredResolution,
      bitrateMbps: stream.bitrateMbps,
      fps: stream.fps,
      packetLossPct: stream.packetLossPct,
      latencyMs: stream.latencyMs,
      qualityScore,
      badge,
      qualityTier,
      breakdown,
      monitorFlags: {
        blurEvents: health.blurEvents,
        blackFrameEvents: health.blackFrameEvents,
        freezeFrameEvents: health.freezeFrameEvents,
        audioClipEvents: health.audioClipEvents,
        desyncEvents: health.desyncEvents,
      },
    };
  }

  ensureDemoStream(streamId: string, context: RoomVideoContext): VideoQualitySnapshot {
    const existing = this.getSnapshot(streamId);
    if (existing) return existing;

    const seed = hashString(`${context}:${streamId}`);

    const resolutionOptions: VideoResolution[] = ["720p", "1080p", "1080p", "1440p", "4k"];
    const deliveredResolution = resolutionOptions[seed % resolutionOptions.length];
    const bitrateTarget = bitrateAuthorityEngine.targetFor(deliveredResolution);

    const bitrateMbps = Number((bitrateTarget.min + ((seed % 7) / 10) * (bitrateTarget.max - bitrateTarget.min)).toFixed(1));
    const fps = deliveredResolution === "4k" ? 60 : deliveredResolution === "1440p" ? 48 : deliveredResolution === "1080p" ? 30 : 30;

    const packetLossPct = Number((((seed % 20) / 10) * 0.8).toFixed(2));
    const latencyMs = 90 + (seed % 130);

    const reconnectCount = seed % 2;
    const dropCount = seed % 3 === 0 ? 1 : 0;
    const freezeCount = seed % 5 === 0 ? 1 : 0;

    const sample: VideoMetricsInput = {
      deliveredResolution,
      bitrateMbps,
      fps,
      packetLossPct,
      latencyMs,
      reconnectCount,
      dropCount,
      freezeCount,
      blurDetected: false,
      blackFrameDetected: false,
      freezeFrameDetected: freezeCount > 0,
      audioClippingDetected: false,
      avDesyncDetected: false,
    };

    return this.record(streamId, context, sample);
  }

  private toBadge(resolution: VideoResolution, qualityScore: number): QualityBadge {
    if (resolution === "4k" && qualityScore >= 82) return "4K LIVE";
    if (resolution === "1440p" && qualityScore >= 74) return "1440P LIVE";
    if (resolution === "1080p" && qualityScore >= 66) return "1080P LIVE";
    return "HD LIVE";
  }
}

export const videoQualityEngine = new VideoQualityEngine();
