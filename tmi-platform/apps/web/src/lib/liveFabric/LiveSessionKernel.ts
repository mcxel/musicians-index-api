/**
 * LiveSessionKernel.ts — Canonical session lifecycle + epoch/revision + idempotent commands
 *
 * Orchestrates lifecycle ONLY. Does NOT replace the platform live-session registry as backend truth.
 * Foundation isolation: no imports of legacy GO LIVE publication / dock / monitor modules.
 */

import { SessionClock } from "./SessionClock";
import {
  type LiveSessionState,
  type SessionHostRole,
  type SessionErrorRecord,
  type SessionCommand,
  type CommandExecutionResult,
  type ParticipantRecord,
  type ParticipantDisconnectReason,
  type HostSuccessionPolicy,
  type SessionSnapshot,
  type SessionReconcileResult,
  LIVE_SESSION_CONTRACT_VERSION,
} from "./contracts/LiveSessionContracts";

export type {
  LiveSessionState,
  SessionHostRole,
  SessionErrorRecord,
  SessionCommand,
  CommandExecutionResult,
  SessionSnapshot,
} from "./contracts/LiveSessionContracts";

export interface LiveSessionConfig {
  sessionId?: string;
  roomId: string;
  hostUserId: string;
  hostRole?: SessionHostRole;
  experienceType?: string;
  metadata?: Record<string, unknown>;
  hostSuccessionPolicy?: HostSuccessionPolicy;
  hostGracePeriodMs?: number;
  maxReconnectAttempts?: number;
}

export type StateChangeSubscriber = (
  from: LiveSessionState,
  to: LiveSessionState,
  snapshot: SessionSnapshot
) => void;

export class LiveSessionTransitionError extends Error {
  constructor(
    public readonly from: LiveSessionState,
    public readonly to: LiveSessionState,
    public readonly reason: string
  ) {
    super(`[LiveSessionKernel] Illegal transition ${from} → ${to}: ${reason}`);
    this.name = "LiveSessionTransitionError";
  }
}

/** Legal transitions only — components may not invent LIVE. */
export const VALID_TRANSITIONS: Record<LiveSessionState, ReadonlySet<LiveSessionState>> = {
  IDLE: new Set(["PREFLIGHT", "CONNECTING", "ERROR"]),
  PREFLIGHT: new Set(["READY", "IDLE", "ERROR"]),
  READY: new Set(["CONNECTING", "IDLE", "ERROR"]),
  CONNECTING: new Set(["PUBLISHING", "LIVE", "RECONNECTING", "ERROR", "ENDING"]),
  PUBLISHING: new Set(["LIVE", "RECONNECTING", "ERROR", "ENDING"]),
  LIVE: new Set(["RECONNECTING", "ENDING", "ERROR"]),
  RECONNECTING: new Set(["LIVE", "PUBLISHING", "CONNECTING", "ENDING", "ERROR"]),
  ENDING: new Set(["ENDED", "ERROR"]),
  ENDED: new Set(["IDLE", "PREFLIGHT"]),
  ERROR: new Set(["IDLE", "PREFLIGHT", "CONNECTING", "RECONNECTING", "ENDED"]),
};

interface InternalSession {
  sessionId: string;
  roomId: string;
  hostUserId: string;
  hostRole: SessionHostRole;
  experienceType: string;
  state: LiveSessionState;
  generation: number;
  revision: number;
  startedAtMs: number;
  liveAtMs: number | null;
  endedAtMs: number | null;
  lastHeartbeatMs: number;
  reconnectCount: number;
  lastError: SessionErrorRecord | null;
  metadata: Record<string, unknown>;
  participants: Map<string, ParticipantRecord>;
  hostSuccessionPolicy: HostSuccessionPolicy;
  hostGracePeriodMs: number;
  activeSources: string[];
  programFrames: Record<string, string | null>;
  previewFrames: Record<string, string | null>;
  currentLayout: string;
  activeAudioFocus: string | null;
}

export class LiveSessionKernel {
  private session: InternalSession;
  private readonly clock: SessionClock;
  private readonly subscribers = new Set<StateChangeSubscriber>();
  private readonly maxReconnectAttempts: number;
  /** commandId → result — idempotent replay returns prior result. */
  private readonly commandLog = new Map<string, CommandExecutionResult>();
  private readonly createdAtMs: number;

  constructor(config: LiveSessionConfig) {
    const now = Date.now();
    this.createdAtMs = now;
    this.clock = new SessionClock(now);
    this.maxReconnectAttempts = config.maxReconnectAttempts ?? 5;
    const id =
      config.sessionId ||
      `sess-${config.roomId}-${now}-${Math.random().toString(36).slice(2, 8)}`;

    this.session = {
      sessionId: id,
      roomId: config.roomId,
      hostUserId: config.hostUserId,
      hostRole: config.hostRole ?? "performer",
      experienceType: config.experienceType ?? "REGULAR_GO_LIVE",
      state: "IDLE",
      generation: 1,
      revision: 0,
      startedAtMs: now,
      liveAtMs: null,
      endedAtMs: null,
      lastHeartbeatMs: now,
      reconnectCount: 0,
      lastError: null,
      metadata: config.metadata ?? {},
      participants: new Map(),
      hostSuccessionPolicy: config.hostSuccessionPolicy ?? "END_SESSION",
      hostGracePeriodMs: config.hostGracePeriodMs ?? 30_000,
      activeSources: [],
      programFrames: {},
      previewFrames: {},
      currentLayout: "FLAT",
      activeAudioFocus: null,
    };

    this.session.participants.set(config.hostUserId, {
      userId: config.hostUserId,
      role: this.session.hostRole,
      displayName: config.hostUserId,
      joinedAtMs: now,
    });
  }

  public getClock(): SessionClock {
    return this.clock;
  }

  public getContractVersion(): string {
    return LIVE_SESSION_CONTRACT_VERSION;
  }

  public getSessionId(): string {
    return this.session.sessionId;
  }

  public getGeneration(): number {
    return this.session.generation;
  }

  public getRevision(): number {
    return this.session.revision;
  }

  public getState(): LiveSessionState {
    return this.session.state;
  }

  public isLive(): boolean {
    return this.session.state === "LIVE";
  }

  public getSnapshot(): SessionSnapshot {
    return {
      sessionId: this.session.sessionId,
      roomId: this.session.roomId,
      hostUserId: this.session.hostUserId,
      hostRole: this.session.hostRole,
      experienceType: this.session.experienceType,
      state: this.session.state,
      generation: this.session.generation,
      revision: this.session.revision,
      startedAtMs: this.session.startedAtMs,
      liveAtMs: this.session.liveAtMs,
      endedAtMs: this.session.endedAtMs,
      lastHeartbeatMs: this.session.lastHeartbeatMs,
      reconnectCount: this.session.reconnectCount,
      participants: Array.from(this.session.participants.values()).map((p) => ({ ...p })),
      activeSources: [...this.session.activeSources],
      programFrames: { ...this.session.programFrames },
      previewFrames: { ...this.session.previewFrames },
      currentLayout: this.session.currentLayout,
      activeAudioFocus: this.session.activeAudioFocus,
      lastError: this.session.lastError ? { ...this.session.lastError } : null,
      contractVersion: LIVE_SESSION_CONTRACT_VERSION,
      createdAtMs: this.createdAtMs,
      hostSuccessionPolicy: this.session.hostSuccessionPolicy,
      mediaClockMs: this.clock.now(),
    };
  }

  public subscribe(subscriber: StateChangeSubscriber): () => void {
    this.subscribers.add(subscriber);
    return () => this.subscribers.delete(subscriber);
  }

  public canTransitionTo(target: LiveSessionState): boolean {
    return VALID_TRANSITIONS[this.session.state]?.has(target) ?? false;
  }

  public transitionTo(target: LiveSessionState, reason = "Explicit transition"): void {
    const from = this.session.state;
    if (from === target) return;

    if (!this.canTransitionTo(target)) {
      throw new LiveSessionTransitionError(
        from,
        target,
        `${reason} — not permitted by lifecycle law`
      );
    }

    const now = Date.now();
    this.session.state = target;
    this.session.lastHeartbeatMs = now;
    this.bumpRevision();

    if (target === "LIVE" && this.session.liveAtMs == null) {
      this.session.liveAtMs = now;
      this.clock.markLiveStart();
    }
    if (target === "ENDED") {
      this.session.endedAtMs = now;
      this.clock.pause();
    }
    if (target === "RECONNECTING") {
      this.session.reconnectCount += 1;
      if (this.session.reconnectCount > this.maxReconnectAttempts) {
        this.recordError(
          "LIVE-RECONNECT-MAX",
          `Reconnection limit (${this.maxReconnectAttempts}) exceeded`,
          true
        );
        return;
      }
    }

    this.notify(from, target);
  }

  /**
   * Execute an idempotent command. Gen N commands never mutate generation N+1.
   * Duplicate commandId returns prior result without re-applying.
   */
  public executeCommand<T>(
    command: SessionCommand<T>,
    apply: (payload: T, kernel: LiveSessionKernel) => void
  ): CommandExecutionResult {
    const existing = this.commandLog.get(command.commandId);
    if (existing) {
      return { ...existing, idempotentSkip: true };
    }

    const executedAtMs = Date.now();

    if (command.sessionId !== this.session.sessionId) {
      const fail: CommandExecutionResult = {
        commandId: command.commandId,
        success: false,
        appliedRevision: this.session.revision,
        appliedGeneration: this.session.generation,
        executedAtMs,
        error: "SESSION_MISMATCH",
      };
      this.commandLog.set(command.commandId, fail);
      return fail;
    }

    if (command.generation !== this.session.generation) {
      const fail: CommandExecutionResult = {
        commandId: command.commandId,
        success: false,
        appliedRevision: this.session.revision,
        appliedGeneration: this.session.generation,
        executedAtMs,
        error: "GENERATION_MISMATCH",
        generationMismatch: true,
      };
      this.commandLog.set(command.commandId, fail);
      return fail;
    }

    if (command.expectedRevision !== this.session.revision) {
      const fail: CommandExecutionResult = {
        commandId: command.commandId,
        success: false,
        appliedRevision: this.session.revision,
        appliedGeneration: this.session.generation,
        executedAtMs,
        error: "REVISION_MISMATCH",
        revisionMismatch: true,
      };
      this.commandLog.set(command.commandId, fail);
      return fail;
    }

    try {
      apply(command.payload, this);
      this.bumpRevision();
      const ok: CommandExecutionResult = {
        commandId: command.commandId,
        success: true,
        appliedRevision: this.session.revision,
        appliedGeneration: this.session.generation,
        executedAtMs,
      };
      this.commandLog.set(command.commandId, ok);
      return ok;
    } catch (err) {
      const fail: CommandExecutionResult = {
        commandId: command.commandId,
        success: false,
        appliedRevision: this.session.revision,
        appliedGeneration: this.session.generation,
        executedAtMs,
        error: err instanceof Error ? err.message : String(err),
      };
      this.commandLog.set(command.commandId, fail);
      return fail;
    }
  }

  /** Bump generation — invalidates all prior-gen commands (epoch boundary). */
  public bumpGeneration(reason: string): number {
    this.session.generation += 1;
    this.session.revision = 0;
    this.session.metadata.lastGenerationBumpReason = reason;
    this.commandLog.clear();
    return this.session.generation;
  }

  public recordHeartbeat(): void {
    this.session.lastHeartbeatMs = Date.now();
  }

  public recordError(code: string, message: string, fatal = false): void {
    this.session.lastError = {
      code,
      message,
      timestampMs: Date.now(),
      fatal,
    };
    this.bumpRevision();
    if (fatal && this.session.state !== "ERROR" && this.session.state !== "ENDED") {
      const from = this.session.state;
      if (VALID_TRANSITIONS[from]?.has("ERROR") || from === "ENDING") {
        this.session.state = "ERROR";
        this.notify(from, "ERROR");
      } else {
        try {
          this.transitionTo("ERROR", message);
        } catch {
          this.session.state = "ERROR";
          this.notify(from, "ERROR");
        }
      }
    }
  }

  public addParticipant(participant: ParticipantRecord): void {
    this.session.participants.set(participant.userId, participant);
    this.bumpRevision();
  }

  public disconnectParticipant(
    userId: string,
    reason: ParticipantDisconnectReason,
    gracePeriodMs?: number
  ): void {
    const p = this.session.participants.get(userId);
    if (!p) return;
    const now = Date.now();
    const grace = gracePeriodMs ?? this.session.hostGracePeriodMs;
    p.disconnectState = {
      reason,
      disconnectedAtMs: now,
      gracePeriodExpiresAtMs: now + grace,
    };
    this.bumpRevision();

    if (userId === this.session.hostUserId) {
      this.handleHostDisconnect(reason);
    }
  }

  public setPresentationHints(hints: {
    activeSources?: string[];
    programFrames?: Record<string, string | null>;
    previewFrames?: Record<string, string | null>;
    currentLayout?: string;
    activeAudioFocus?: string | null;
  }): void {
    if (hints.activeSources) this.session.activeSources = [...hints.activeSources];
    if (hints.programFrames) this.session.programFrames = { ...hints.programFrames };
    if (hints.previewFrames) this.session.previewFrames = { ...hints.previewFrames };
    if (hints.currentLayout) this.session.currentLayout = hints.currentLayout;
    if (hints.activeAudioFocus !== undefined) {
      this.session.activeAudioFocus = hints.activeAudioFocus;
    }
  }

  /**
   * Reconcile remote snapshot. Newer generation wins; same gen requires remote revision >= local.
   * Gen N never mutates gen N+1 local state from stale remote.
   */
  public reconcile(remote: SessionSnapshot): SessionReconcileResult {
    const local = this.getSnapshot();
    if (remote.sessionId !== local.sessionId) {
      return this.reconcileResult(false, "SESSION_MISMATCH", local, remote);
    }
    if (remote.generation < local.generation) {
      return this.reconcileResult(false, "STALE_GENERATION", local, remote);
    }
    if (remote.generation === local.generation && remote.revision < local.revision) {
      return this.reconcileResult(false, "STALE_REVISION", local, remote);
    }
    if (remote.generation > local.generation) {
      this.applyRemoteSnapshot(remote);
      return this.reconcileResult(true, "NEWER_GENERATION", this.getSnapshot(), remote, true);
    }
    if (remote.revision > local.revision) {
      this.applyRemoteSnapshot(remote);
      return this.reconcileResult(true, "NEWER_REVISION", this.getSnapshot(), remote, true);
    }
    return this.reconcileResult(true, "ALREADY_IN_SYNC", local, remote, false);
  }

  private reconcileResult(
    accepted: boolean,
    reason: string,
    local: { generation: number; revision: number },
    remote: { generation: number; revision: number },
    applied?: boolean
  ): SessionReconcileResult {
    return {
      accepted,
      success: accepted,
      reason,
      localGeneration: local.generation,
      remoteGeneration: remote.generation,
      localRevision: local.revision,
      remoteRevision: remote.revision,
      applied,
    };
  }

  public resetForNewSession(): void {
    if (
      this.session.state !== "ENDED" &&
      this.session.state !== "ERROR" &&
      this.session.state !== "IDLE"
    ) {
      if (this.canTransitionTo("ENDING")) this.transitionTo("ENDING", "Reset");
      if (this.canTransitionTo("ENDED")) this.transitionTo("ENDED", "Reset complete");
      else {
        this.session.state = "ENDED";
      }
    }
    this.bumpGeneration("resetForNewSession");
    this.session.state = "IDLE";
    this.session.startedAtMs = Date.now();
    this.session.liveAtMs = null;
    this.session.endedAtMs = null;
    this.session.reconnectCount = 0;
    this.session.lastError = null;
    this.clock.reset();
    this.notify("ENDED", "IDLE");
  }

  private handleHostDisconnect(reason: ParticipantDisconnectReason): void {
    const policy = this.session.hostSuccessionPolicy;
    if (reason === "BANNED" || reason === "REMOVED") {
      if (this.canTransitionTo("ENDING")) this.transitionTo("ENDING", `Host ${reason}`);
      return;
    }
    if (policy === "END_SESSION") {
      if (this.canTransitionTo("ENDING")) this.transitionTo("ENDING", "Host left — END_SESSION");
      return;
    }
    if (policy === "GRACE_PERIOD" || policy === "TRANSFER_TO_COHOST") {
      if (this.session.state === "LIVE" && this.canTransitionTo("RECONNECTING")) {
        this.transitionTo("RECONNECTING", `Host ${reason} — ${policy}`);
      }
    }
    if (policy === "TRANSFER_TO_SYSTEM_HOST") {
      this.session.hostRole = "bot";
      this.session.metadata.systemHostActive = true;
      this.bumpRevision();
    }
  }

  private applyRemoteSnapshot(remote: SessionSnapshot): void {
    this.session.generation = remote.generation;
    this.session.revision = remote.revision;
    this.session.state = remote.state;
    this.session.hostUserId = remote.hostUserId;
    this.session.hostRole = remote.hostRole;
    this.session.experienceType = remote.experienceType;
    this.session.liveAtMs = remote.liveAtMs;
    this.session.endedAtMs = remote.endedAtMs;
    this.session.reconnectCount = remote.reconnectCount;
    this.session.lastError = remote.lastError;
    this.session.activeSources = [...remote.activeSources];
    this.session.programFrames = { ...remote.programFrames };
    this.session.previewFrames = { ...remote.previewFrames };
    this.session.currentLayout = remote.currentLayout;
    this.session.activeAudioFocus = remote.activeAudioFocus;
    this.session.hostSuccessionPolicy = remote.hostSuccessionPolicy;
    this.session.participants.clear();
    for (const p of remote.participants) {
      this.session.participants.set(p.userId, { ...p });
    }
  }

  private bumpRevision(): void {
    this.session.revision += 1;
  }

  private notify(from: LiveSessionState, to: LiveSessionState): void {
    const snap = this.getSnapshot();
    for (const sub of this.subscribers) {
      try {
        sub(from, to, snap);
      } catch (err) {
        console.error("[LiveSessionKernel] subscriber error", err);
      }
    }
  }
}
