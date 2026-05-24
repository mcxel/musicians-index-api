"use client";

// Room atmosphere audio — layered gain control with dwell-based memory triggers.
// Separate from AudioShieldEngine (which handles broadcast multi-performer bus).

export type AmbientLayer = "MUSIC" | "VOICE" | "FX" | "MEMORY";

const DEFAULT_VOLUMES: Record<AmbientLayer, number> = {
  MUSIC:  0.5,
  VOICE:  0.85,
  FX:     0.4,
  MEMORY: 0.0,
};

export class AmbientAudioEngine {
  private ctx: AudioContext;
  private gains: Map<AmbientLayer, GainNode> = new Map();
  private memorySource: AudioBufferSourceNode | null = null;
  private dominantLayer: AmbientLayer = "MUSIC";

  constructor() {
    this.ctx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

    (["MUSIC", "VOICE", "FX", "MEMORY"] as AmbientLayer[]).forEach(layer => {
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(DEFAULT_VOLUMES[layer], this.ctx.currentTime);
      g.connect(this.ctx.destination);
      this.gains.set(layer, g);
    });
  }

  private resumeIfSuspended(): void {
    if (this.ctx.state === "suspended") {
      void this.ctx.resume();
    }
  }

  setLayerVolume(layer: AmbientLayer, volume: number, fadeMs = 200): void {
    this.resumeIfSuspended();
    const g = this.gains.get(layer);
    if (!g) return;
    g.gain.setTargetAtTime(
      Math.max(0, Math.min(1, volume)),
      this.ctx.currentTime,
      fadeMs / 1000,
    );
  }

  // Smooth exponential fade toward target
  duckTo(layer: AmbientLayer, targetVolume: number, timeConstant = 0.4): void {
    this.resumeIfSuspended();
    const g = this.gains.get(layer);
    if (!g) return;
    g.gain.setTargetAtTime(
      Math.max(0, Math.min(1, targetVolume)),
      this.ctx.currentTime,
      timeConstant,
    );
  }

  // Dwell trigger — preview (isDwell=false) vs full presence (isDwell=true)
  triggerMemoryAudio(isDwell: boolean): void {
    this.resumeIfSuspended();
    const memGain = isDwell ? 1.0 : 0.18;
    this.setLayerVolume("MEMORY", memGain, isDwell ? 300 : 100);

    // Duck music proportionally
    const musicTarget = isDwell ? 0.25 : 0.4;
    this.duckTo("MUSIC", musicTarget, 0.4);

    if (isDwell) this.dominantLayer = "MEMORY";
  }

  // Called when user leaves a memory card — restore ambient balance
  releaseMemoryAudio(delayMs = 700): void {
    setTimeout(() => {
      this.setLayerVolume("MEMORY", 0, 400);
      this.duckTo("MUSIC", DEFAULT_VOLUMES.MUSIC, 0.5);
      this.dominantLayer = "MUSIC";
    }, delayMs);
  }

  // Voice becomes dominant — everything else ducks
  prioritizeVoice(): void {
    this.resumeIfSuspended();
    this.dominantLayer = "VOICE";
    this.duckTo("MUSIC", 0.15, 0.3);
    this.duckTo("MEMORY", 0.0, 0.2);
    this.setLayerVolume("VOICE", DEFAULT_VOLUMES.VOICE, 150);
  }

  releaseVoice(): void {
    this.dominantLayer = "MUSIC";
    this.duckTo("MUSIC", DEFAULT_VOLUMES.MUSIC, 0.6);
  }

  getDominantLayer(): AmbientLayer { return this.dominantLayer; }

  destroy(): void {
    void this.ctx.close();
  }
}

let _engine: AmbientAudioEngine | null = null;

export function getAmbientAudioEngine(): AmbientAudioEngine | null {
  if (typeof window === "undefined") return null;
  if (!_engine) _engine = new AmbientAudioEngine();
  return _engine;
}

export function resetAmbientAudioEngine(): void {
  _engine?.destroy();
  _engine = null;
}
