/**
 * TMIMediaEngine.ts
 * Core WebRTC + Media Capture engine for The Musician's Index.
 *
 * Responsibilities:
 *  - Local camera/mic capture (getUserMedia) with constraints
 *  - Screen capture (getDisplayMedia)
 *  - MediaRecorder-based local recording (WebM/MP4)
 *  - RTCPeerConnection lifecycle management (offer/answer/ICE)
 *  - Multi-track management (add/replace/remove)
 *  - Audio analysis (AnalyserNode for VU meter / lip-sync)
 *  - Stream health monitoring & auto-reconnect
 *  - Bandwidth / bitrate adaptive control
 */

/* ─── Types ─────────────────────────────────────────────────────────────── */
export type StreamKind = "camera" | "screen" | "audio-only";
export type RecordingState = "idle" | "recording" | "paused" | "stopped";
export type PeerRole = "offerer" | "answerer";

export interface MediaConstraints {
  video?: boolean | MediaTrackConstraints;
  audio?: boolean | MediaTrackConstraints;
}

export interface PeerSignal {
  type: "offer" | "answer" | "candidate";
  sdp?: string;
  candidate?: RTCIceCandidateInit;
  from: string;
  to: string;
  roomId: string;
}

export interface AudioAnalysis {
  volume: number;       // 0–1 normalised RMS
  peak: number;         // peak sample
  isSpeaking: boolean;
}

export interface EngineEventMap {
  "stream:local":    MediaStream;
  "stream:remote":   MediaStream;
  "stream:stopped":  void;
  "recording:chunk": Blob;
  "recording:done":  Blob;
  "audio:analysis":  AudioAnalysis;
  "peer:connected":  string;        // peerId
  "peer:disconnected": string;
  "error":           Error;
  "reconnect":       number;        // attempt count
}

type EngineListener<K extends keyof EngineEventMap> = (
  payload: EngineEventMap[K]
) => void;

/* ─── ICE Server defaults (public STUN + TURN fallback placeholder) ────── */
const DEFAULT_ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  /* Add your TURN servers here for production:
   * { urls: "turn:your-turn.example.com:3478",
   *   username: "user", credential: "pass" }
   */
];

/* ─── TMIMediaEngine ─────────────────────────────────────────────────────── */
export class TMIMediaEngine {
  private localStream: MediaStream | null = null;
  private screenStream: MediaStream | null = null;
  private peers = new Map<string, RTCPeerConnection>();
  private remoteStreams = new Map<string, MediaStream>();
  private recorder: MediaRecorder | null = null;
  private recordingChunks: Blob[] = [];
  private recordingState: RecordingState = "idle";
  private audioContext: AudioContext | null = null;
  private analyserNode: AnalyserNode | null = null;
  private analyserData: Uint8Array<ArrayBuffer> | null = null;
  private analyserRAF: number | null = null;
  private iceServers: RTCIceServer[];
  private listeners = new Map<keyof EngineEventMap, Set<EngineListener<any>>>();

  constructor(iceServers: RTCIceServer[] = DEFAULT_ICE_SERVERS) {
    this.iceServers = iceServers;
  }

  /* ─── Event bus ── */
  on<K extends keyof EngineEventMap>(event: K, fn: EngineListener<K>): this {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(fn as EngineListener<any>);
    return this;
  }

  off<K extends keyof EngineEventMap>(event: K, fn: EngineListener<K>): this {
    this.listeners.get(event)?.delete(fn as EngineListener<any>);
    return this;
  }

  private emit<K extends keyof EngineEventMap>(
    event: K,
    payload: EngineEventMap[K]
  ): void {
    this.listeners.get(event)?.forEach((fn) => fn(payload));
  }

  /* ─── Local media ── */

  /** Capture camera + mic with optional constraints */
  async startLocalStream(
    constraints: MediaConstraints = {
      video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
      audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 48000 },
    }
  ): Promise<MediaStream> {
    try {
      this.stopLocalStream();
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.localStream = stream;
      this.startAudioAnalysis(stream);
      this.emit("stream:local", stream);
      return stream;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      this.emit("error", e);
      throw e;
    }
  }

  /** Capture audio only (for radio / music show mode) */
  async startAudioOnlyStream(): Promise<MediaStream> {
    return this.startLocalStream({
      video: false,
      audio: { echoCancellation: false, noiseSuppression: false, sampleRate: 48000 },
    });
  }

  /** Screen share (with optional system audio) */
  async startScreenCapture(withAudio = false): Promise<MediaStream> {
    try {
      const stream = await (navigator.mediaDevices as any).getDisplayMedia({
        video: { frameRate: { ideal: 30 }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: withAudio,
      });
      this.screenStream = stream;
      this.emit("stream:local", stream);
      return stream;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      this.emit("error", e);
      throw e;
    }
  }

  /** Stop local camera/mic */
  stopLocalStream(): void {
    this.localStream?.getTracks().forEach((t) => t.stop());
    this.localStream = null;
    this.stopAudioAnalysis();
    this.emit("stream:stopped", undefined as void);
  }

  /** Stop screen capture */
  stopScreenCapture(): void {
    this.screenStream?.getTracks().forEach((t) => t.stop());
    this.screenStream = null;
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  /* ─── MediaRecorder ── */

  /** Start recording the local stream */
  startRecording(mimeType = "video/webm;codecs=vp9,opus"): void {
    if (!this.localStream) throw new Error("No local stream to record");
    if (this.recordingState === "recording") return;

    this.recordingChunks = [];
    const options = MediaRecorder.isTypeSupported(mimeType)
      ? { mimeType }
      : {};

    this.recorder = new MediaRecorder(this.localStream, options);
    this.recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        this.recordingChunks.push(e.data);
        this.emit("recording:chunk", e.data);
      }
    };
    this.recorder.onstop = () => {
      const mime = this.recorder?.mimeType ?? "video/webm";
      const blob = new Blob(this.recordingChunks, { type: mime });
      this.emit("recording:done", blob);
      this.recordingState = "stopped";
    };
    this.recorder.start(1000); // emit chunks every 1s
    this.recordingState = "recording";
  }

  pauseRecording(): void {
    if (this.recorder?.state === "recording") {
      this.recorder.pause();
      this.recordingState = "paused";
    }
  }

  resumeRecording(): void {
    if (this.recorder?.state === "paused") {
      this.recorder.resume();
      this.recordingState = "recording";
    }
  }

  stopRecording(): void {
    if (this.recorder && this.recorder.state !== "inactive") {
      this.recorder.stop();
    }
  }

  getRecordingState(): RecordingState {
    return this.recordingState;
  }

  /* ─── Audio analysis (VU meter / lip-sync) ── */

  private startAudioAnalysis(stream: MediaStream): void {
    try {
      this.audioContext = new AudioContext();
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 512;
      this.analyserNode.smoothingTimeConstant = 0.8;
      source.connect(this.analyserNode);
      this.analyserData = new Uint8Array(this.analyserNode.frequencyBinCount);
      this.tickAnalysis();
    } catch {
      // AudioContext unavailable (server-side or restricted)
    }
  }

  private tickAnalysis(): void {
    if (!this.analyserNode || !this.analyserData) return;
    this.analyserNode.getByteTimeDomainData(this.analyserData);

    let sumSquares = 0;
    let peak = 0;
    for (const sample of this.analyserData) {
      const norm = (sample - 128) / 128;
      sumSquares += norm * norm;
      if (Math.abs(norm) > peak) peak = Math.abs(norm);
    }
    const rms = Math.sqrt(sumSquares / this.analyserData.length);
    const volume = Math.min(1, rms * 4); // scale to 0–1
    this.emit("audio:analysis", { volume, peak, isSpeaking: volume > 0.05 });
    this.analyserRAF = requestAnimationFrame(() => this.tickAnalysis());
  }

  private stopAudioAnalysis(): void {
    if (this.analyserRAF) cancelAnimationFrame(this.analyserRAF);
    this.audioContext?.close().catch(() => {});
    this.audioContext = null;
    this.analyserNode = null;
    this.analyserData = null;
  }

  /* ─── RTCPeerConnection management ── */

  /** Create (or return existing) peer connection for a peer ID */
  createPeer(peerId: string): RTCPeerConnection {
    if (this.peers.has(peerId)) return this.peers.get(peerId)!;

    const pc = new RTCPeerConnection({ iceServers: this.iceServers });

    // Add local tracks
    this.localStream?.getTracks().forEach((t) => pc.addTrack(t, this.localStream!));

    // Collect remote stream
    const remoteStream = new MediaStream();
    this.remoteStreams.set(peerId, remoteStream);
    pc.ontrack = (e) => {
      e.streams[0]?.getTracks().forEach((t) => remoteStream.addTrack(t));
      this.emit("stream:remote", remoteStream);
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") {
        this.emit("peer:connected", peerId);
      } else if (["disconnected", "failed", "closed"].includes(pc.connectionState)) {
        this.emit("peer:disconnected", peerId);
      }
    };

    this.peers.set(peerId, pc);
    return pc;
  }

  /** Generate SDP offer for a peer */
  async createOffer(peerId: string): Promise<RTCSessionDescriptionInit> {
    const pc = this.createPeer(peerId);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    return offer;
  }

  /** Handle incoming SDP answer */
  async handleAnswer(peerId: string, answer: RTCSessionDescriptionInit): Promise<void> {
    const pc = this.peers.get(peerId);
    if (!pc) throw new Error(`No peer found for id: ${peerId}`);
    await pc.setRemoteDescription(new RTCSessionDescription(answer));
  }

  /** Handle incoming SDP offer (answerer role) */
  async handleOffer(
    peerId: string,
    offer: RTCSessionDescriptionInit
  ): Promise<RTCSessionDescriptionInit> {
    const pc = this.createPeer(peerId);
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    return answer;
  }

  /** Handle incoming ICE candidate */
  async handleIceCandidate(peerId: string, candidate: RTCIceCandidateInit): Promise<void> {
    const pc = this.peers.get(peerId);
    if (!pc) return;
    try {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch {
      // Candidate may arrive before remote description is set; queue externally if needed
    }
  }

  /** Set ICE candidate handler for outbound signalling */
  onIceCandidate(
    peerId: string,
    handler: (candidate: RTCIceCandidateInit) => void
  ): void {
    const pc = this.peers.get(peerId);
    if (!pc) return;
    pc.onicecandidate = (e) => {
      if (e.candidate) handler(e.candidate.toJSON());
    };
  }

  /** Close a single peer connection */
  closePeer(peerId: string): void {
    this.peers.get(peerId)?.close();
    this.peers.delete(peerId);
    this.remoteStreams.delete(peerId);
  }

  /** Swap the video track on all active peer connections (e.g. camera → screen) */
  async replaceVideoTrack(newTrack: MediaStreamTrack): Promise<void> {
    for (const [, pc] of this.peers) {
      const sender = pc.getSenders().find((s) => s.track?.kind === "video");
      if (sender) await sender.replaceTrack(newTrack);
    }
  }

  /* ─── Teardown ── */
  destroy(): void {
    this.stopRecording();
    this.stopLocalStream();
    this.stopScreenCapture();
    this.peers.forEach((pc) => pc.close());
    this.peers.clear();
    this.remoteStreams.clear();
    this.listeners.clear();
  }
}

/* ─── Singleton factory ─────────────────────────────────────────────────── */
let _instance: TMIMediaEngine | null = null;

export function getMediaEngine(): TMIMediaEngine {
  if (!_instance) _instance = new TMIMediaEngine();
  return _instance;
}

export function destroyMediaEngine(): void {
  _instance?.destroy();
  _instance = null;
}
