// lib/webrtc/MediaCaptureEngine.ts
// Central hardware access layer for camera, microphone, and screen capture.
// All Go Live flows should use this engine — never call getUserMedia directly —
// so permission conflicts, track leaks, and device switching are handled in one place.

export type VideoQuality = 'sd' | 'hd' | '4k';
export type CaptureMode = 'camera' | 'screen' | 'camera+screen';

export interface CaptureConstraints {
  mode?: CaptureMode;
  quality?: VideoQuality;
  audio?: boolean;
  facingMode?: 'user' | 'environment';
}

export interface CaptureState {
  stream: MediaStream | null;
  videoTrack: MediaVideoTrack | null;
  audioTrack: MediaAudioTrack | null;
  mode: CaptureMode;
  active: boolean;
  error: string | null;
}

type MediaVideoTrack = MediaStreamTrack & { kind: 'video' };
type MediaAudioTrack = MediaStreamTrack & { kind: 'audio' };

const VIDEO_CONSTRAINTS: Record<VideoQuality, MediaTrackConstraints> = {
  sd: { width: { ideal: 640 },  height: { ideal: 480 },  frameRate: { ideal: 30 } },
  hd: { width: { ideal: 1280 }, height: { ideal: 720 },  frameRate: { ideal: 30 } },
  '4k': { width: { ideal: 3840, max: 3840 }, height: { ideal: 2160, max: 2160 }, frameRate: { ideal: 60, max: 60 } },
};

const AUDIO_CONSTRAINTS: MediaTrackConstraints = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
  sampleRate: 48000,
  channelCount: 2,
};

export class MediaCaptureEngine {
  private stream: MediaStream | null = null;
  private screenStream: MediaStream | null = null;
  private _listeners: Array<(state: CaptureState) => void> = [];

  // ── Public API ────────────────────────────────────────────────────────────

  async start(opts: CaptureConstraints = {}): Promise<MediaStream> {
    const {
      mode = 'camera',
      quality = 'hd',
      audio = true,
      facingMode = 'user',
    } = opts;

    // Kill any existing stream before requesting new hardware
    this.stop();

    try {
      if (mode === 'camera' || mode === 'camera+screen') {
        this.stream = await navigator.mediaDevices.getUserMedia({
          video: { ...VIDEO_CONSTRAINTS[quality], facingMode },
          audio: audio ? AUDIO_CONSTRAINTS : false,
        });
      }

      if (mode === 'screen' || mode === 'camera+screen') {
        this.screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: audio && mode === 'screen',
        });

        if (mode === 'camera+screen') {
          // Merge camera audio with screen video
          const merged = new MediaStream();
          this.screenStream.getVideoTracks().forEach((t) => merged.addTrack(t));
          this.stream?.getAudioTracks().forEach((t) => merged.addTrack(t));
          this.stream = merged;
        } else {
          this.stream = this.screenStream;
        }
      }

      if (!this.stream) throw new Error('No stream acquired');

      // Auto-stop when user revokes browser permission
      this.stream.getTracks().forEach((track) => {
        track.addEventListener('ended', () => this.stop());
      });

      this._emit();
      return this.stream;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Hardware access denied';
      this._emit(msg);
      throw new Error(msg);
    }
  }

  stop() {
    this.stream?.getTracks().forEach((t) => t.stop());
    this.screenStream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    this.screenStream = null;
    this._emit();
  }

  /** Switch camera facing mode while live — keeps audio track intact */
  async flipCamera(quality: VideoQuality = 'hd') {
    if (!this.stream) return;
    const audioTrack = this.stream.getAudioTracks()[0] ?? null;
    const currentFacing = (this.stream.getVideoTracks()[0]?.getSettings().facingMode as 'user' | 'environment') ?? 'user';
    const nextFacing = currentFacing === 'user' ? 'environment' : 'user';

    const newVideo = await navigator.mediaDevices.getUserMedia({
      video: { ...VIDEO_CONSTRAINTS[quality], facingMode: nextFacing },
      audio: false,
    });

    // Swap video track only
    const [oldVideo] = this.stream.getVideoTracks();
    if (oldVideo) { oldVideo.stop(); this.stream.removeTrack(oldVideo); }
    const [nextVideo] = newVideo.getVideoTracks();
    if (nextVideo) this.stream.addTrack(nextVideo);

    this._emit();
  }

  /** Mute / unmute audio without killing the stream */
  setAudioEnabled(enabled: boolean) {
    this.stream?.getAudioTracks().forEach((t) => { t.enabled = enabled; });
  }

  /** Mute / unmute video without killing the stream */
  setVideoEnabled(enabled: boolean) {
    this.stream?.getVideoTracks().forEach((t) => { t.enabled = enabled; });
  }

  /** Attach the stream to a <video> element */
  attachTo(el: HTMLVideoElement) {
    el.srcObject = this.stream;
    el.muted = true; // prevents echo on self-preview
    el.playsInline = true;
    void el.play().catch(() => undefined);
  }

  getStream(): MediaStream | null {
    return this.stream;
  }

  getState(): CaptureState {
    const videoTrack = (this.stream?.getVideoTracks()[0] ?? null) as MediaVideoTrack | null;
    const audioTrack = (this.stream?.getAudioTracks()[0] ?? null) as MediaAudioTrack | null;
    return {
      stream: this.stream,
      videoTrack,
      audioTrack,
      mode: this.screenStream ? 'screen' : 'camera',
      active: !!(this.stream && this.stream.active),
      error: null,
    };
  }

  /** Subscribe to state changes (stream start/stop/flip) */
  onChange(cb: (state: CaptureState) => void): () => void {
    this._listeners.push(cb);
    return () => { this._listeners = this._listeners.filter((l) => l !== cb); };
  }

  private _emit(error?: string) {
    const state = this.getState();
    if (error) state.error = error;
    this._listeners.forEach((cb) => cb(state));
  }

  // ── Static: enumerate available devices ──────────────────────────────────

  static async listCameras(): Promise<MediaDeviceInfo[]> {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((d) => d.kind === 'videoinput');
  }

  static async listMicrophones(): Promise<MediaDeviceInfo[]> {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((d) => d.kind === 'audioinput');
  }

  static isSupported(): boolean {
    return typeof navigator !== 'undefined' &&
      'mediaDevices' in navigator &&
      typeof navigator.mediaDevices.getUserMedia === 'function';
  }
}

// ── Singleton for use across the app ─────────────────────────────────────────
// Import this instance anywhere Go Live controls are rendered.
// Never create multiple instances — one engine owns the hardware.

export const mediaCaptureEngine = new MediaCaptureEngine();
