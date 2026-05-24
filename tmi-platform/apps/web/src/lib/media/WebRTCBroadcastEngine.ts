/**
 * WebRTCBroadcastEngine — Manages peer connections for TMI broadcast.
 * Handles broadcaster and viewer roles for live streaming.
 * Signaling via POST /api/rtc/signal
 */

export type BroadcastRole = "BROADCASTER" | "VIEWER";

export type BroadcastStatus =
  | "IDLE"
  | "CONNECTING"
  | "CONNECTED"
  | "RECONNECTING"
  | "FAILED"
  | "CLOSED";

export interface BroadcastSession {
  roomId: string;
  peerId: string;
  role: BroadcastRole;
  status: BroadcastStatus;
  viewerCount: number;
  startedAtMs: number | null;
  errorMessage: string | null;
  reconnectCount: number;
}

export type BroadcastEvent =
  | "connected"
  | "disconnected"
  | "viewer_joined"
  | "viewer_left"
  | "ice_connected"
  | "reconnecting"
  | "error";

export type BroadcastEventHandler = (event: BroadcastEvent, session: BroadcastSession) => void;

// ── ICE servers (STUN only — add TURN for production) ────────────────────────

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

const SIGNAL_POLL_INTERVAL_MS = 1500;
const MAX_RECONNECT_ATTEMPTS = 3;
const SIMULATED_VIEWER_BASE = 12;

// ── Helpers ───────────────────────────────────────────────────────────────────

function makePeerId(): string {
  return `peer_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ── WebRTCBroadcastEngine ─────────────────────────────────────────────────────

export class WebRTCBroadcastEngine {
  private session: BroadcastSession | null = null;
  private peerConn: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private handlers: BroadcastEventHandler[] = [];
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private viewerSimTimer: ReturnType<typeof setInterval> | null = null;

  // ── Public API ────────────────────────────────────────────────────────────

  on(handler: BroadcastEventHandler): () => void {
    this.handlers.push(handler);
    return () => {
      this.handlers = this.handlers.filter((h) => h !== handler);
    };
  }

  getSession(): BroadcastSession | null {
    return this.session;
  }

  getStatus(): BroadcastStatus {
    return this.session?.status ?? "IDLE";
  }

  getViewerCount(): number {
    return this.session?.viewerCount ?? 0;
  }

  setLocalStream(stream: MediaStream): void {
    this.localStream = stream;
    if (this.peerConn) {
      stream.getTracks().forEach((track) => {
        this.peerConn!.addTrack(track, stream);
      });
    }
  }

  async createBroadcastSession(roomId: string): Promise<void> {
    const peerId = makePeerId();
    this.session = {
      roomId,
      peerId,
      role: "BROADCASTER",
      status: "CONNECTING",
      viewerCount: SIMULATED_VIEWER_BASE,
      startedAtMs: null,
      errorMessage: null,
      reconnectCount: 0,
    };

    try {
      this.peerConn = this._createPeerConnection(roomId, peerId);

      // Add local stream tracks if already set
      if (this.localStream) {
        this.localStream.getTracks().forEach((track) => {
          this.peerConn!.addTrack(track, this.localStream!);
        });
      }

      // Create offer
      const offer = await this.peerConn.createOffer({
        offerToReceiveAudio: false,
        offerToReceiveVideo: false,
      });
      await this.peerConn.setLocalDescription(offer);

      // Send offer to signal server
      await this._sendSignal(roomId, peerId, {
        type: "offer",
        sdp: offer.sdp ?? "",
        from: peerId,
        role: "BROADCASTER",
      });

      // Start polling for answer
      this._startPolling(roomId, peerId);

      // Simulate viewer count growth
      this._startViewerSimulation();

      this._updateSession({ status: "CONNECTED", startedAtMs: Date.now() });
      this._emit("connected");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this._updateSession({ status: "FAILED", errorMessage: msg });
      this._emit("error");
      throw err;
    }
  }

  async createViewerSession(roomId: string): Promise<void> {
    const peerId = makePeerId();
    this.session = {
      roomId,
      peerId,
      role: "VIEWER",
      status: "CONNECTING",
      viewerCount: 0,
      startedAtMs: null,
      errorMessage: null,
      reconnectCount: 0,
    };

    try {
      this.peerConn = this._createPeerConnection(roomId, peerId);

      // Poll for the broadcaster's offer
      this._startPolling(roomId, peerId);

      this._updateSession({ status: "CONNECTED", startedAtMs: Date.now() });
      this._emit("connected");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this._updateSession({ status: "FAILED", errorMessage: msg });
      this._emit("error");
      throw err;
    }
  }

  async reconnect(): Promise<void> {
    if (!this.session) return;
    const { roomId, role, reconnectCount } = this.session;

    if (reconnectCount >= MAX_RECONNECT_ATTEMPTS) {
      this._updateSession({ status: "FAILED", errorMessage: "Max reconnect attempts reached." });
      this._emit("error");
      return;
    }

    this._updateSession({ status: "RECONNECTING", reconnectCount: reconnectCount + 1 });
    this._emit("reconnecting");

    this._teardown(false);

    try {
      if (role === "BROADCASTER") {
        await this.createBroadcastSession(roomId);
      } else {
        await this.createViewerSession(roomId);
      }
    } catch {
      // error already emitted inside create methods
    }
  }

  close(): void {
    this._teardown(true);
    this._updateSession({ status: "CLOSED" });
    this._emit("disconnected");
    this.session = null;
  }

  // ── ICE candidate handling ────────────────────────────────────────────────

  async handleICECandidate(candidate: RTCIceCandidate): Promise<void> {
    if (!this.session || !this.peerConn) return;
    try {
      await this.peerConn.addIceCandidate(candidate);
    } catch {
      // benign — candidate may arrive before remote description
    }
  }

  async handleOffer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit | null> {
    if (!this.peerConn) return null;
    await this.peerConn.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this.peerConn.createAnswer();
    await this.peerConn.setLocalDescription(answer);
    return answer;
  }

  async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConn) return;
    await this.peerConn.setRemoteDescription(new RTCSessionDescription(answer));
  }

  // ── Private: peer connection ──────────────────────────────────────────────

  private _createPeerConnection(roomId: string, peerId: string): RTCPeerConnection {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    pc.onicecandidate = (evt) => {
      if (!evt.candidate || !this.session) return;
      void this._sendSignal(roomId, peerId, {
        type: "ice",
        candidate: evt.candidate.toJSON(),
        from: peerId,
      }).catch(() => {});
    };

    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      if (state === "connected") {
        this._emit("ice_connected");
      } else if (state === "failed" || state === "disconnected") {
        void this.reconnect();
      }
    };

    pc.ontrack = (_evt) => {
      // Viewers receive remote track here — caller can attach evt.streams[0] to video element
      this._emit("connected");
    };

    return pc;
  }

  // ── Private: signaling ────────────────────────────────────────────────────

  private async _sendSignal(
    roomId: string,
    peerId: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    await fetch("/api/rtc/signal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId, peerId, payload }),
    });
  }

  private async _pollSignal(roomId: string, peerId: string): Promise<unknown[]> {
    const res = await fetch(
      `/api/rtc/signal?roomId=${encodeURIComponent(roomId)}&peerId=${encodeURIComponent(peerId)}`,
    );
    if (!res.ok) return [];
    const data = await res.json() as { messages?: unknown[] };
    return data.messages ?? [];
  }

  private _startPolling(roomId: string, peerId: string): void {
    this.pollTimer = setInterval(() => {
      void this._handleIncomingSignals(roomId, peerId);
    }, SIGNAL_POLL_INTERVAL_MS);
  }

  private async _handleIncomingSignals(roomId: string, peerId: string): Promise<void> {
    try {
      const messages = await this._pollSignal(roomId, peerId);
      for (const msg of messages) {
        const m = msg as Record<string, unknown>;
        if (m.type === "answer" && this.session?.role === "BROADCASTER") {
          await this.handleAnswer(m as unknown as RTCSessionDescriptionInit);
        } else if (m.type === "offer" && this.session?.role === "VIEWER") {
          const answer = await this.handleOffer(m as unknown as RTCSessionDescriptionInit);
          if (answer) {
            await this._sendSignal(roomId, peerId, {
              type: "answer",
              sdp: answer.sdp ?? "",
              from: peerId,
              role: "VIEWER",
            });
          }
        } else if (m.type === "ice" && m.candidate) {
          const candidate = new RTCIceCandidate(
            m.candidate as RTCIceCandidateInit,
          );
          await this.handleICECandidate(candidate);
        }
      }
    } catch {
      // polling errors are non-fatal
    }
  }

  // ── Private: viewer simulation ────────────────────────────────────────────

  private _startViewerSimulation(): void {
    this.viewerSimTimer = setInterval(() => {
      if (!this.session) return;
      const delta = Math.floor(Math.random() * 5) - 1;
      const newCount = Math.max(1, (this.session.viewerCount ?? 0) + delta);
      this._updateSession({ viewerCount: newCount });
      if (delta > 0) this._emit("viewer_joined");
      if (delta < 0) this._emit("viewer_left");
    }, 8000);
  }

  // ── Private: teardown ─────────────────────────────────────────────────────

  private _teardown(stopStream: boolean): void {
    if (this.pollTimer) { clearInterval(this.pollTimer); this.pollTimer = null; }
    if (this.viewerSimTimer) { clearInterval(this.viewerSimTimer); this.viewerSimTimer = null; }
    if (this.peerConn) { this.peerConn.close(); this.peerConn = null; }
    if (stopStream && this.localStream) {
      this.localStream.getTracks().forEach((t) => t.stop());
      this.localStream = null;
    }
  }

  // ── Private: helpers ──────────────────────────────────────────────────────

  private _updateSession(patch: Partial<BroadcastSession>): void {
    if (this.session) {
      this.session = { ...this.session, ...patch };
    }
  }

  private _emit(event: BroadcastEvent): void {
    if (!this.session) return;
    this.handlers.forEach((h) => h(event, this.session!));
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

export const webRTCBroadcastEngine = new WebRTCBroadcastEngine();
