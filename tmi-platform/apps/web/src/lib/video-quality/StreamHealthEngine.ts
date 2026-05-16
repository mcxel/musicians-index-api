import type { StreamHealthSample } from "./types";

interface StreamHealthState {
  packetLossPct: number;
  reconnectCount: number;
  dropCount: number;
  freezeCount: number;
  blurEvents: number;
  blackFrameEvents: number;
  freezeFrameEvents: number;
  audioClipEvents: number;
  desyncEvents: number;
}

export class StreamHealthEngine {
  private readonly states = new Map<string, StreamHealthState>();

  record(streamId: string, sample: StreamHealthSample): StreamHealthState {
    const prev = this.states.get(streamId) ?? {
      packetLossPct: 0,
      reconnectCount: 0,
      dropCount: 0,
      freezeCount: 0,
      blurEvents: 0,
      blackFrameEvents: 0,
      freezeFrameEvents: 0,
      audioClipEvents: 0,
      desyncEvents: 0,
    };

    const next: StreamHealthState = {
      packetLossPct: sample.packetLossPct,
      reconnectCount: sample.reconnectCount,
      dropCount: sample.dropCount,
      freezeCount: sample.freezeCount,
      blurEvents: prev.blurEvents + (sample.blurDetected ? 1 : 0),
      blackFrameEvents: prev.blackFrameEvents + (sample.blackFrameDetected ? 1 : 0),
      freezeFrameEvents: prev.freezeFrameEvents + (sample.freezeFrameDetected ? 1 : 0),
      audioClipEvents: prev.audioClipEvents + (sample.audioClippingDetected ? 1 : 0),
      desyncEvents: prev.desyncEvents + (sample.avDesyncDetected ? 1 : 0),
    };

    this.states.set(streamId, next);
    return next;
  }

  get(streamId: string): StreamHealthState | null {
    return this.states.get(streamId) ?? null;
  }

  packetLossScore(packetLossPct: number): number {
    if (packetLossPct < 2) return 100;
    if (packetLossPct < 5) return 70;
    if (packetLossPct < 8) return 45;
    return 20;
  }

  stabilityScore(reconnectCount: number, dropCount: number, freezeCount: number): number {
    const penalty = reconnectCount * 8 + dropCount * 6 + freezeCount * 5;
    return Math.max(15, 100 - penalty);
  }
}

export const streamHealthEngine = new StreamHealthEngine();
