/**
 * TMIAudioSafetyMixer.ts
 * Audio safety and mixing engine for The Musician's Index live lobbies.
 *
 * Drop at: apps/web/src/lib/audio/TMIAudioSafetyMixer.ts
 *
 * Solves:
 *  - Audio clashing when multiple performers are live
 *  - Fan mic noise drowning out performers
 *  - Feedback loops from audience speakers
 *
 * Features:
 *  - Role-based gain levels (host > performer > audience)
 *  - Active speaker detection via AnalyserNode (RMS)
 *  - Auto-ducking: when one person talks, others lower automatically
 *  - Band Mix mode: balanced, all performers at equal volume
 *  - Solo Focus mode: one dominant speaker at 100%, everyone else ducked
 *  - Limiter: hard cap on output to protect ears / hardware
 *  - Per-track GainNode pool
 *
 * Usage:
 *   const mixer = new TMIAudioSafetyMixer();
 *   await mixer.addTrack("user-001", stream, "host");
 *   mixer.setMode("band_mix");
 *   mixer.setSoloFocus("user-001");
 *   mixer.removeTrack("user-001");
 *   mixer.destroy();
 */

/* ─── Types ─────────────────────────────────────────────────────────────── */
export type AudioRole = "host" | "performer" | "audience" | "spectator";
export type MixMode = "band_mix" | "solo_focus" | "venue_broadcast" | "silent";

export interface AudioTrackInfo {
  userId: string;
  role: AudioRole;
  stream: MediaStream;
  gainNode: GainNode;
  analyserNode: AnalyserNode;
  source: MediaStreamAudioSourceNode;
  analyserData: Uint8Array<ArrayBuffer>;
  currentVolume: number;  // 0–1
  isSpeaking: boolean;
  lastSpeakAt: number;
  muteOverride: boolean;
}

export interface MixerEventMap {
  "speaker:change":   string | null;   // userId of active speaker, null if silent
  "speaking:start":   string;          // userId started speaking
  "speaking:stop":    string;          // userId stopped speaking
  "volume:update":    Record<string, number>; // userId → volume level 0–1
  "mode:change":      MixMode;
}

type MixerListener<K extends keyof MixerEventMap> = (payload: MixerEventMap[K]) => void;

/* ─── Role gain presets ───────────────────────────────────────────────────── */
const ROLE_GAINS: Record<AudioRole, number> = {
  host:       1.0,
  performer:  0.85,
  audience:   0.35,
  spectator:  0.0,   // fully muted — spectators never broadcast
};

/* ─── Speaking detection thresholds ─────────────────────────────────────── */
const SPEAKING_THRESHOLD = 0.035;   // RMS threshold to count as speaking
const SPEAKING_HOLD_MS   = 600;     // keep "speaking" flag for 600ms after silence

/* ─── Auto-duck amounts ──────────────────────────────────────────────────── */
const DUCK_LEVEL      = 0.2;   // everyone else drops to 20% when someone is speaking
const DUCK_SPEED_MS   = 120;   // how fast to duck (CSS-like transition)
const RECOVER_SPEED_MS= 300;   // how fast to recover after speaker stops

/* ─── TMIAudioSafetyMixer ─────────────────────────────────────────────────── */
export class TMIAudioSafetyMixer {
  private ctx: AudioContext;
  private masterGain: GainNode;
  private limiterNode: DynamicsCompressorNode;
  private destination: AudioDestinationNode;
  private tracks = new Map<string, AudioTrackInfo>();
  private mode: MixMode = "band_mix";
  private soloUserId: string | null = null;
  private activeSpeakerId: string | null = null;
  private analyserRAF: number | null = null;
  private listeners = new Map<keyof MixerEventMap, Set<MixerListener<any>>>();
  private gainTargets = new Map<string, number>();   // userId → target gain

  constructor() {
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.9;

    // Hard limiter to protect ears
    this.limiterNode = this.ctx.createDynamicsCompressor();
    this.limiterNode.threshold.value = -3;
    this.limiterNode.knee.value = 0;
    this.limiterNode.ratio.value = 20;
    this.limiterNode.attack.value = 0.001;
    this.limiterNode.release.value = 0.05;

    this.destination = this.ctx.destination;
    this.masterGain.connect(this.limiterNode);
    this.limiterNode.connect(this.destination);

    this.startAnalysisLoop();
  }

  /* ─── Event bus ── */
  on<K extends keyof MixerEventMap>(event: K, fn: MixerListener<K>): this {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(fn as MixerListener<any>);
    return this;
  }

  off<K extends keyof MixerEventMap>(event: K, fn: MixerListener<K>): this {
    this.listeners.get(event)?.delete(fn as MixerListener<any>);
    return this;
  }

  private emit<K extends keyof MixerEventMap>(event: K, payload: MixerEventMap[K]): void {
    this.listeners.get(event)?.forEach((fn) => fn(payload));
  }

  /* ─── Track management ── */

  /** Add a MediaStream track to the mixer */
  async addTrack(userId: string, stream: MediaStream, role: AudioRole): Promise<void> {
    if (this.tracks.has(userId)) this.removeTrack(userId);

    const source   = this.ctx.createMediaStreamSource(stream);
    const gainNode = this.ctx.createGain();
    const analyser = this.ctx.createAnalyser();

    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.7;

    source.connect(analyser);
    analyser.connect(gainNode);
    gainNode.connect(this.masterGain);

    gainNode.gain.value = role === "spectator" ? 0 : ROLE_GAINS[role];

    const analyserData = new Uint8Array(analyser.frequencyBinCount);

    const info: AudioTrackInfo = {
      userId, role, stream,
      gainNode, analyserNode: analyser, source,
      analyserData,
      currentVolume: gainNode.gain.value,
      isSpeaking: false,
      lastSpeakAt: 0,
      muteOverride: false,
    };

    this.tracks.set(userId, info);
    this.gainTargets.set(userId, gainNode.gain.value);
    this.recalculateMix();
  }

  /** Remove a track */
  removeTrack(userId: string): void {
    const info = this.tracks.get(userId);
    if (!info) return;
    try {
      info.gainNode.disconnect();
      info.analyserNode.disconnect();
      info.source.disconnect();
    } catch {}
    this.tracks.delete(userId);
    this.gainTargets.delete(userId);
    if (this.soloUserId === userId) this.soloUserId = null;
    if (this.activeSpeakerId === userId) {
      this.activeSpeakerId = null;
      this.emit("speaker:change", null);
    }
    this.recalculateMix();
  }

  /** Mute/unmute a specific track */
  setMute(userId: string, muted: boolean): void {
    const info = this.tracks.get(userId);
    if (!info) return;
    info.muteOverride = muted;
    this.applyGain(userId, muted ? 0 : this.gainTargets.get(userId) ?? 0);
  }

  /* ─── Mode control ── */

  setMode(mode: MixMode): void {
    this.mode = mode;
    this.recalculateMix();
    this.emit("mode:change", mode);
  }

  getMode(): MixMode {
    return this.mode;
  }

  /** Solo focus: one dominant speaker, everyone else ducked */
  setSoloFocus(userId: string | null): void {
    this.soloUserId = userId;
    if (this.mode !== "solo_focus" && userId) this.setMode("solo_focus");
    if (!userId) this.setMode("band_mix");
    this.recalculateMix();
  }

  /** Master volume (0–1) */
  setMasterVolume(volume: number): void {
    this.masterGain.gain.setTargetAtTime(
      Math.max(0, Math.min(1, volume)),
      this.ctx.currentTime,
      0.05
    );
  }

  /* ─── Analysis loop ── */

  private startAnalysisLoop(): void {
    const tick = () => {
      this.runAnalysis();
      this.analyserRAF = requestAnimationFrame(tick);
    };
    this.analyserRAF = requestAnimationFrame(tick);
  }

  private runAnalysis(): void {
    const now = Date.now();
    const volumeMap: Record<string, number> = {};
    let loudestUserId: string | null = null;
    let loudestRMS = 0;

    for (const [userId, info] of this.tracks) {
      if (info.muteOverride || info.role === "spectator") {
        volumeMap[userId] = 0;
        continue;
      }

      info.analyserNode.getByteTimeDomainData(info.analyserData);

      // RMS calculation
      let sumSq = 0;
      for (const s of info.analyserData) {
        const norm = (s - 128) / 128;
        sumSq += norm * norm;
      }
      const rms = Math.sqrt(sumSq / info.analyserData.length);
      info.currentVolume = rms;
      volumeMap[userId] = rms;

      if (rms > SPEAKING_THRESHOLD) {
        if (!info.isSpeaking) {
          info.isSpeaking = true;
          this.emit("speaking:start", userId);
        }
        info.lastSpeakAt = now;
        if (rms > loudestRMS) {
          loudestRMS = rms;
          loudestUserId = userId;
        }
      } else if (info.isSpeaking && now - info.lastSpeakAt > SPEAKING_HOLD_MS) {
        info.isSpeaking = false;
        this.emit("speaking:stop", userId);
      }
    }

    // Update active speaker
    if (loudestUserId !== this.activeSpeakerId) {
      this.activeSpeakerId = loudestUserId;
      this.emit("speaker:change", loudestUserId);
      this.applyAutoDucking(loudestUserId);
    }

    this.emit("volume:update", volumeMap);
  }

  /* ─── Mixing logic ─────────────────────────────────────────────────────── */

  private recalculateMix(): void {
    switch (this.mode) {
      case "band_mix":       this.applyBandMix();       break;
      case "solo_focus":     this.applySoloFocus();     break;
      case "venue_broadcast":this.applyVenueBroadcast(); break;
      case "silent":         this.applySilent();        break;
    }
  }

  private applyBandMix(): void {
    for (const [userId, info] of this.tracks) {
      if (info.muteOverride) continue;
      const target = ROLE_GAINS[info.role];
      this.gainTargets.set(userId, target);
      this.applyGain(userId, target);
    }
  }

  private applySoloFocus(): void {
    for (const [userId, info] of this.tracks) {
      if (info.muteOverride) { this.applyGain(userId, 0); continue; }
      const target = userId === this.soloUserId ? 1.0 : DUCK_LEVEL;
      this.gainTargets.set(userId, target);
      this.applyGain(userId, target);
    }
  }

  private applyVenueBroadcast(): void {
    // Host only gets full audio; everyone else is very low
    for (const [userId, info] of this.tracks) {
      if (info.muteOverride) { this.applyGain(userId, 0); continue; }
      const target = info.role === "host" ? 1.0 : 0.1;
      this.gainTargets.set(userId, target);
      this.applyGain(userId, target);
    }
  }

  private applySilent(): void {
    for (const [userId] of this.tracks) {
      this.gainTargets.set(userId, 0);
      this.applyGain(userId, 0);
    }
  }

  private applyAutoDucking(speakerId: string | null): void {
    if (this.mode === "band_mix") {
      for (const [userId, info] of this.tracks) {
        if (info.muteOverride) continue;
        if (!speakerId) {
          // No active speaker — restore to role defaults
          this.applyGain(userId, ROLE_GAINS[info.role], RECOVER_SPEED_MS);
        } else if (userId === speakerId) {
          this.applyGain(userId, ROLE_GAINS[info.role], DUCK_SPEED_MS);
        } else {
          // Duck everyone else to DUCK_LEVEL (but not below their role minimum)
          const duckTarget = Math.min(DUCK_LEVEL, ROLE_GAINS[info.role]);
          this.applyGain(userId, duckTarget, DUCK_SPEED_MS);
        }
      }
    }
  }

  private applyGain(userId: string, target: number, rampMs = 80): void {
    const info = this.tracks.get(userId);
    if (!info) return;
    const t = this.ctx.currentTime + rampMs / 1000;
    info.gainNode.gain.linearRampToValueAtTime(
      Math.max(0, Math.min(1, target)),
      t
    );
  }

  /* ─── Queries ── */

  getActiveSpeaker(): string | null { return this.activeSpeakerId; }
  getTrackVolume(userId: string): number {
    return this.tracks.get(userId)?.currentVolume ?? 0;
  }
  isSpeaking(userId: string): boolean {
    return this.tracks.get(userId)?.isSpeaking ?? false;
  }

  getVolumeMap(): Record<string, number> {
    const result: Record<string, number> = {};
    for (const [id, info] of this.tracks) {
      result[id] = info.currentVolume;
    }
    return result;
  }

  /* ─── Teardown ── */
  destroy(): void {
    if (this.analyserRAF) cancelAnimationFrame(this.analyserRAF);
    for (const [userId] of this.tracks) this.removeTrack(userId);
    this.masterGain.disconnect();
    this.limiterNode.disconnect();
    this.ctx.close().catch(() => {});
    this.listeners.clear();
  }
}

/* ─── React hook ──────────────────────────────────────────────────────────── */
import { useEffect, useRef, useState } from "react";

export function useAudioSafetyMixer() {
  const mixerRef = useRef<TMIAudioSafetyMixer | null>(null);
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);
  const [mode, setModeState] = useState<MixMode>("band_mix");
  const [volumeMap, setVolumeMap] = useState<Record<string, number>>({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mixer = new TMIAudioSafetyMixer();
    mixerRef.current = mixer;

    mixer.on("speaker:change", setActiveSpeaker);
    mixer.on("mode:change",    setModeState);
    mixer.on("volume:update",  setVolumeMap);

    return () => mixer.destroy();
  }, []);

  const addTrack = (userId: string, stream: MediaStream, role: AudioRole) =>
    mixerRef.current?.addTrack(userId, stream, role);

  const removeTrack = (userId: string) =>
    mixerRef.current?.removeTrack(userId);

  const setMode = (mode: MixMode) =>
    mixerRef.current?.setMode(mode);

  const setSolo = (userId: string | null) =>
    mixerRef.current?.setSoloFocus(userId);

  const setMute = (userId: string, muted: boolean) =>
    mixerRef.current?.setMute(userId, muted);

  const setMasterVolume = (v: number) =>
    mixerRef.current?.setMasterVolume(v);

  return {
    activeSpeaker,
    mode,
    volumeMap,
    addTrack,
    removeTrack,
    setMode,
    setSolo,
    setMute,
    setMasterVolume,
  };
}
