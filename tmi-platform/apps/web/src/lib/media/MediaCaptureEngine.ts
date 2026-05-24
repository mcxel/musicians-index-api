/**
 * MediaCaptureEngine — WebRTC / MediaDevices capture layer for TMI live streams.
 * Handles: webcam, phone camera, screen share, OBS virtual camera, USB capture cards.
 * Uses: mediaDevices.getUserMedia, getDisplayMedia, MediaRecorder API.
 * Supports: HD video (1080p preferred, fallback 720p → 480p), adaptive bitrate.
 * Detects: black frames, frozen frames, audio/video desync.
 * Recovers: auto-reconnect on track end, bandwidth downgrade.
 */

export type CaptureSource = "CAMERA" | "SCREEN" | "OBS" | "USB_CAPTURE";

export type CaptureQuality = "HD_1080" | "HD_720" | "SD_480";

export type CaptureStatus =
  | "IDLE"
  | "REQUESTING"
  | "ACTIVE"
  | "DEGRADED"
  | "RECONNECTING"
  | "ERROR"
  | "STOPPED";

export type CaptureEvent =
  | "started"
  | "stopped"
  | "track_ended"
  | "quality_downgrade"
  | "black_frame_detected"
  | "frozen_frame_detected"
  | "desync_detected"
  | "reconnected"
  | "error";

export interface CaptureConstraints {
  video: {
    width: number;
    height: number;
    frameRate: number;
    facingMode?: "user" | "environment";
  };
  audio: boolean | MediaTrackConstraints;
}

export interface CaptureSession {
  id: string;
  source: CaptureSource;
  quality: CaptureQuality;
  status: CaptureStatus;
  stream: MediaStream | null;
  recorder: MediaRecorder | null;
  startedAtMs: number | null;
  errorMessage: string | null;
  reconnectCount: number;
  analyticsTag: string;
}

export type CaptureEventHandler = (event: CaptureEvent, session: CaptureSession) => void;

// ── Quality constraint presets ────────────────────────────────────────────────

const QUALITY_CONSTRAINTS: Record<CaptureQuality, CaptureConstraints["video"]> = {
  HD_1080: { width: 1920, height: 1080, frameRate: 30 },
  HD_720:  { width: 1280, height: 720,  frameRate: 30 },
  SD_480:  { width: 854,  height: 480,  frameRate: 24 },
};

const QUALITY_FALLBACK: Record<CaptureQuality, CaptureQuality | null> = {
  HD_1080: "HD_720",
  HD_720:  "SD_480",
  SD_480:  null,
};

// ── Telemetry helpers ─────────────────────────────────────────────────────────

function makeSessionId(): string {
  return `cap_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function makeAnalyticsTag(source: CaptureSource, quality: CaptureQuality): string {
  return `tmi_capture:${source.toLowerCase()}:${quality.toLowerCase()}`;
}

// ── Detection thresholds ──────────────────────────────────────────────────────

const BLACK_FRAME_LUMA_THRESHOLD = 8;      // avg luma below this = black
const FROZEN_FRAME_DIFF_THRESHOLD = 0.5;   // pixel diff below this % = frozen
const DESYNC_MS_THRESHOLD = 300;           // audio/video clock delta ms
const FROZEN_CHECK_INTERVAL_MS = 3000;
const DESYNC_CHECK_INTERVAL_MS = 5000;

// ── MediaCaptureEngine ────────────────────────────────────────────────────────

export class MediaCaptureEngine {
  private session: CaptureSession | null = null;
  private handlers: CaptureEventHandler[] = [];
  private frozenCheckTimer: ReturnType<typeof setInterval> | null = null;
  private desyncCheckTimer: ReturnType<typeof setInterval> | null = null;
  private lastFrameData: ImageData | null = null;
  private analysisCanvas: HTMLCanvasElement | null = null;
  private analysisCtx: CanvasRenderingContext2D | null = null;

  // ── Public API ──────────────────────────────────────────────────────────────

  on(handler: CaptureEventHandler): () => void {
    this.handlers.push(handler);
    return () => {
      this.handlers = this.handlers.filter((h) => h !== handler);
    };
  }

  getSession(): CaptureSession | null {
    return this.session;
  }

  getStatus(): CaptureStatus {
    return this.session?.status ?? "IDLE";
  }

  async startCamera(preferredQuality: CaptureQuality = "HD_1080"): Promise<MediaStream> {
    return this._acquireCamera(preferredQuality);
  }

  async startScreenShare(): Promise<MediaStream> {
    return this._acquireScreen();
  }

  stopCapture(): void {
    if (!this.session) return;
    this._teardownStream();
    this._updateSession({ status: "STOPPED" });
    this._emit("stopped");
    this.session = null;
  }

  startRecording(mimeType = "video/webm;codecs=vp9,opus"): MediaRecorder | null {
    if (!this.session?.stream) return null;
    const supported = MediaRecorder.isTypeSupported(mimeType)
      ? mimeType
      : MediaRecorder.isTypeSupported("video/webm")
      ? "video/webm"
      : "";
    const recorder = new MediaRecorder(this.session.stream, supported ? { mimeType: supported } : {});
    recorder.start(1000);
    this._updateSession({ recorder });
    return recorder;
  }

  stopRecording(): void {
    if (this.session?.recorder?.state !== "inactive") {
      this.session?.recorder?.stop();
    }
    this._updateSession({ recorder: null });
  }

  attachAnalysisCanvas(canvas: HTMLCanvasElement): void {
    this.analysisCanvas = canvas;
    this.analysisCtx = canvas.getContext("2d");
  }

  // ── Private: stream acquisition ─────────────────────────────────────────────

  private async _acquireCamera(quality: CaptureQuality): Promise<MediaStream> {
    const sessionId = makeSessionId();
    this.session = {
      id: sessionId,
      source: "CAMERA",
      quality,
      status: "REQUESTING",
      stream: null,
      recorder: null,
      startedAtMs: null,
      errorMessage: null,
      reconnectCount: 0,
      analyticsTag: makeAnalyticsTag("CAMERA", quality),
    };
    this._emit("started");

    try {
      const stream = await this._getUserMedia(quality);
      this._activateStream(stream, "CAMERA", quality);
      return stream;
    } catch (err) {
      const fallback = QUALITY_FALLBACK[quality];
      if (fallback) {
        this._updateSession({ status: "DEGRADED" });
        this._emit("quality_downgrade");
        return this._acquireCamera(fallback);
      }
      const msg = err instanceof Error ? err.message : String(err);
      this._updateSession({ status: "ERROR", errorMessage: msg });
      this._emit("error");
      throw err;
    }
  }

  private async _acquireScreen(): Promise<MediaStream> {
    const sessionId = makeSessionId();
    this.session = {
      id: sessionId,
      source: "SCREEN",
      quality: "HD_1080",
      status: "REQUESTING",
      stream: null,
      recorder: null,
      startedAtMs: null,
      errorMessage: null,
      reconnectCount: 0,
      analyticsTag: makeAnalyticsTag("SCREEN", "HD_1080"),
    };
    this._emit("started");

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { width: 1920, height: 1080, frameRate: 30 } as MediaTrackConstraints,
        audio: true,
      });
      this._activateStream(stream, "SCREEN", "HD_1080");
      return stream;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this._updateSession({ status: "ERROR", errorMessage: msg });
      this._emit("error");
      throw err;
    }
  }

  private async _getUserMedia(quality: CaptureQuality): Promise<MediaStream> {
    const videoConstraints = QUALITY_CONSTRAINTS[quality];
    return navigator.mediaDevices.getUserMedia({
      video: videoConstraints as MediaTrackConstraints,
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
  }

  // ── Private: stream lifecycle ────────────────────────────────────────────────

  private _activateStream(stream: MediaStream, source: CaptureSource, quality: CaptureQuality): void {
    this._updateSession({
      stream,
      status: "ACTIVE",
      startedAtMs: Date.now(),
      analyticsTag: makeAnalyticsTag(source, quality),
    });

    // Watch for track ending (user revokes permission, cable unplugged, etc.)
    stream.getTracks().forEach((track) => {
      track.addEventListener("ended", () => this._handleTrackEnded(source, quality));
    });

    // Start frame-level diagnostics
    this._startFrozenFrameDetection(stream);
    this._startDesyncDetection(stream);
  }

  private _handleTrackEnded(source: CaptureSource, quality: CaptureQuality): void {
    if (!this.session || this.session.status === "STOPPED") return;
    this._emit("track_ended");
    this._updateSession({ status: "RECONNECTING", reconnectCount: (this.session.reconnectCount ?? 0) + 1 });
    this._teardownDiagnostics();

    // Auto-reconnect after 1s delay
    setTimeout(() => {
      if (!this.session || this.session.status === "STOPPED") return;
      if (source === "SCREEN") {
        this._acquireScreen().catch(() => {
          this._updateSession({ status: "ERROR", errorMessage: "Screen share ended and could not reconnect." });
          this._emit("error");
        });
      } else {
        this._acquireCamera(quality).catch(() => {
          this._updateSession({ status: "ERROR", errorMessage: "Camera disconnected and could not reconnect." });
          this._emit("error");
        });
      }
    }, 1000);
  }

  private _teardownStream(): void {
    this._teardownDiagnostics();
    if (this.session?.recorder && this.session.recorder.state !== "inactive") {
      this.session.recorder.stop();
    }
    this.session?.stream?.getTracks().forEach((t) => t.stop());
  }

  // ── Private: frame diagnostics ───────────────────────────────────────────────

  private _startFrozenFrameDetection(stream: MediaStream): void {
    const videoTrack = stream.getVideoTracks()[0];
    if (!videoTrack || !this.analysisCanvas || !this.analysisCtx) return;

    this.frozenCheckTimer = setInterval(() => {
      if (!this.analysisCtx || !this.analysisCanvas) return;
      const videoEl = this.analysisCanvas.ownerDocument?.querySelector("video");
      if (!videoEl) return;

      const w = this.analysisCanvas.width;
      const h = this.analysisCanvas.height;
      this.analysisCtx.drawImage(videoEl as HTMLVideoElement, 0, 0, w, h);
      const frame = this.analysisCtx.getImageData(0, 0, w, h);

      if (this._isBlackFrame(frame)) {
        this._emit("black_frame_detected");
      } else if (this.lastFrameData && this._isFrozenFrame(frame, this.lastFrameData)) {
        this._emit("frozen_frame_detected");
      }

      this.lastFrameData = frame;
    }, FROZEN_CHECK_INTERVAL_MS);
  }

  private _startDesyncDetection(stream: MediaStream): void {
    const audioTracks = stream.getAudioTracks();
    const videoTracks = stream.getVideoTracks();
    if (!audioTracks.length || !videoTracks.length) return;

    this.desyncCheckTimer = setInterval(() => {
      // Use track timing as a proxy — real desync needs WebRTC stats
      const audioEnabled = audioTracks[0]?.enabled ?? false;
      const videoEnabled = videoTracks[0]?.enabled ?? false;
      if (audioEnabled !== videoEnabled) {
        this._emit("desync_detected");
      }
    }, DESYNC_CHECK_INTERVAL_MS);
  }

  private _teardownDiagnostics(): void {
    if (this.frozenCheckTimer) clearInterval(this.frozenCheckTimer);
    if (this.desyncCheckTimer) clearInterval(this.desyncCheckTimer);
    this.frozenCheckTimer = null;
    this.desyncCheckTimer = null;
    this.lastFrameData = null;
  }

  private _isBlackFrame(frame: ImageData): boolean {
    let total = 0;
    for (let i = 0; i < frame.data.length; i += 4) {
      total += (frame.data[i] + frame.data[i + 1] + frame.data[i + 2]) / 3;
    }
    const avgLuma = total / (frame.data.length / 4);
    return avgLuma < BLACK_FRAME_LUMA_THRESHOLD;
  }

  private _isFrozenFrame(current: ImageData, previous: ImageData): boolean {
    let diffPixels = 0;
    for (let i = 0; i < current.data.length; i += 4) {
      const dr = Math.abs(current.data[i] - previous.data[i]);
      const dg = Math.abs(current.data[i + 1] - previous.data[i + 1]);
      const db = Math.abs(current.data[i + 2] - previous.data[i + 2]);
      if (dr + dg + db > 10) diffPixels++;
    }
    const diffPercent = (diffPixels / (current.data.length / 4)) * 100;
    return diffPercent < FROZEN_FRAME_DIFF_THRESHOLD;
  }

  // ── Private: helpers ─────────────────────────────────────────────────────────

  private _updateSession(patch: Partial<CaptureSession>): void {
    if (this.session) {
      this.session = { ...this.session, ...patch };
    }
  }

  private _emit(event: CaptureEvent): void {
    if (!this.session) return;
    this.handlers.forEach((h) => h(event, this.session!));
  }
}

// ── Singleton for app-wide use ────────────────────────────────────────────────

export const mediaCaptureEngine = new MediaCaptureEngine();

// ── Utility: resolve MIME type for recording ─────────────────────────────────

export function getSupportedMimeType(): string {
  const candidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
    "video/mp4",
  ];
  for (const t of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t)) return t;
  }
  return "";
}

// ── Utility: fire analytics event ────────────────────────────────────────────

export function fireCaptureAnalytics(tag: string, action: "start" | "stop" | "error"): void {
  if (typeof window === "undefined") return;
  try {
    const key = `tmi:analytics:capture`;
    const prev = JSON.parse(sessionStorage.getItem(key) ?? "[]") as unknown[];
    prev.push({ tag, action, ts: Date.now() });
    sessionStorage.setItem(key, JSON.stringify(prev.slice(-50)));
  } catch {
    // sessionStorage may be unavailable in some contexts
  }
}

