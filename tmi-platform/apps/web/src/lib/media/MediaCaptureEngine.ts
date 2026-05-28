export type CaptureStatus = 'IDLE' | 'REQUESTING' | 'ACTIVE' | 'DEGRADED' | 'RECONNECTING' | 'ERROR' | 'STOPPED';
export type CaptureSource = 'CAMERA' | 'SCREEN';
export type CaptureEvent =
  | 'started' | 'stopped' | 'error'
  | 'black_frame_detected' | 'frozen_frame_detected'
  | 'desync_detected' | 'quality_downgrade' | 'reconnected';

export interface CaptureSession {
  status: CaptureStatus;
  source: CaptureSource;
  stream: MediaStream | null;
  errorMessage: string | null;
  analyticsTag: string;
}

export type CapturePreset = 'HD_1080' | 'HD_720' | 'SD_480';

const PRESET_CONSTRAINTS: Record<CapturePreset, MediaTrackConstraints> = {
  HD_1080: { width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 60 } },
  HD_720:  { width: { ideal: 1280 }, height: { ideal: 720  }, frameRate: { ideal: 30 } },
  SD_480:  { width: { ideal: 854  }, height: { ideal: 480  }, frameRate: { ideal: 30 } },
};

export function fireCaptureAnalytics(tag: string, action: string): void {
  if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).gtag) {
    (window as unknown as Record<string, (...args: unknown[]) => void>).gtag('event', 'media_capture', { tag, action });
  }
}

type EventListener = (event: CaptureEvent, session: CaptureSession) => void;

export class MediaCaptureEngine {
  private session: CaptureSession = {
    status: 'IDLE',
    source: 'CAMERA',
    stream: null,
    errorMessage: null,
    analyticsTag: 'capture',
  };
  private listeners: EventListener[] = [];

  on(listener: EventListener): () => void {
    this.listeners.push(listener);
    return () => { this.listeners = this.listeners.filter((l) => l !== listener); };
  }

  private emit(event: CaptureEvent) {
    for (const l of this.listeners) l(event, { ...this.session });
  }

  getSession(): CaptureSession {
    return { ...this.session };
  }

  async startCamera(preset: CapturePreset = 'HD_1080'): Promise<MediaStream> {
    this.session.status = 'REQUESTING';
    this.session.source = 'CAMERA';
    this.session.analyticsTag = `camera:${preset.toLowerCase()}`;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { ...PRESET_CONSTRAINTS[preset], facingMode: 'user' },
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, sampleRate: 48000 },
      });
      this.session.stream = stream;
      this.session.status = 'ACTIVE';
      this.session.errorMessage = null;
      this.emit('started');
      return stream;
    } catch (err) {
      this.session.status = 'ERROR';
      this.session.errorMessage = err instanceof Error ? err.message : 'Camera access denied';
      this.emit('error');
      throw err;
    }
  }

  async startScreenShare(): Promise<MediaStream> {
    this.session.status = 'REQUESTING';
    this.session.source = 'SCREEN';
    this.session.analyticsTag = 'screen';
    try {
      const stream = await (navigator.mediaDevices as MediaDevices & {
        getDisplayMedia(c?: DisplayMediaStreamOptions): Promise<MediaStream>;
      }).getDisplayMedia({ video: true, audio: true });
      this.session.stream = stream;
      this.session.status = 'ACTIVE';
      this.session.errorMessage = null;
      this.emit('started');
      return stream;
    } catch (err) {
      this.session.status = 'ERROR';
      this.session.source = 'CAMERA';
      this.session.errorMessage = err instanceof Error ? err.message : 'Screen share denied';
      this.emit('error');
      throw err;
    }
  }

  stopCapture(): void {
    if (this.session.stream) {
      this.session.stream.getTracks().forEach((t) => t.stop());
      this.session.stream = null;
    }
    this.session.status = 'STOPPED';
    this.session.errorMessage = null;
    this.emit('stopped');
  }

  async switchDevice(deviceId: string, type: 'videoinput' | 'audioinput'): Promise<void> {
    if (this.session.stream) {
      const kind = type === 'videoinput' ? 'video' : 'audio';
      this.session.stream.getTracks().filter((t) => t.kind === kind).forEach((t) => t.stop());
    }
    const newStream = await navigator.mediaDevices.getUserMedia({
      [type === 'videoinput' ? 'video' : 'audio']: { deviceId: { exact: deviceId } },
    });
    if (this.session.stream) {
      newStream.getTracks().forEach((t) => this.session.stream!.addTrack(t));
    }
  }

  attachToPeerConnection(pc: RTCPeerConnection): void {
    if (!this.session.stream) throw new Error('No active stream to attach');
    this.session.stream.getTracks().forEach((t) => pc.addTrack(t, this.session.stream!));
  }

  killStream(): void {
    this.stopCapture();
  }
}
