/**
 * OfflineReconnectQueue
 * Queues actions while a device surface is offline and replays them on reconnect.
 * Priority-ordered. Idempotency keys prevent double-execution.
 */

import type { SyncNamespace } from "./CrossDeviceSyncEngine";

// ─── Queue Entry ──────────────────────────────────────────────────────────────

export type QueuedActionType =
  | "sync-write"
  | "reaction"
  | "chat-message"
  | "vote"
  | "like"
  | "follow"
  | "heartbeat"
  | "nav-intent"
  | "purchase-intent";

export type ActionPriority = "critical" | "high" | "normal" | "low";

export interface QueuedAction {
  id: string;
  type: QueuedActionType;
  /** Higher = sooner replay */
  priority: ActionPriority;
  payload: unknown;
  /** Idempotency key — duplicate submissions are dropped */
  idempotencyKey: string;
  enqueuedAt: number;
  /** Unix ms — drop if past this when reconnected */
  expiresAt: number;
  /** Number of retry attempts made */
  attempts: number;
  /** Max retries before permanently dropping */
  maxRetries: number;
  /** Namespace for sync-write actions */
  syncNamespace?: SyncNamespace;
}

export type ReplayResult =
  | { id: string; status: "success" }
  | { id: string; status: "expired"; reason: string }
  | { id: string; status: "failed"; reason: string }
  | { id: string; status: "skipped-duplicate" };

// ─── Connection State ─────────────────────────────────────────────────────────

export type ConnectionState = "online" | "offline" | "reconnecting";

// ─── Queue ────────────────────────────────────────────────────────────────────

const PRIORITY_ORDER: Record<ActionPriority, number> = {
  critical: 0,
  high: 1,
  normal: 2,
  low: 3,
};

const DEFAULT_TTL: Record<QueuedActionType, number> = {
  "sync-write":      30 * 60 * 1000,  // 30 min
  "reaction":         5 * 60 * 1000,  // 5 min — reactions are time-sensitive
  "chat-message":    15 * 60 * 1000,
  "vote":            30 * 60 * 1000,
  "like":            60 * 60 * 1000,
  "follow":          24 * 60 * 60 * 1000,
  "heartbeat":        2 * 60 * 1000,  // heartbeats expire fast
  "nav-intent":       1 * 60 * 1000,
  "purchase-intent": 60 * 60 * 1000,
};

export class OfflineReconnectQueue {
  private static _instance: OfflineReconnectQueue | null = null;

  private _queue: QueuedAction[] = [];
  private _usedIdempotencyKeys: Set<string> = new Set();
  private _connectionState: ConnectionState = "online";
  private _stateListeners: Set<(state: ConnectionState) => void> = new Set();
  private _replayListeners: Set<(action: QueuedAction) => Promise<boolean>> = new Set();
  private _deviceId: string = "unknown";

  static getInstance(): OfflineReconnectQueue {
    if (!OfflineReconnectQueue._instance) {
      OfflineReconnectQueue._instance = new OfflineReconnectQueue();
    }
    return OfflineReconnectQueue._instance;
  }

  // ── Configuration ──────────────────────────────────────────────────────────

  setDeviceId(deviceId: string): void {
    this._deviceId = deviceId;
  }

  // ── Connection state ───────────────────────────────────────────────────────

  setConnectionState(state: ConnectionState): void {
    const prev = this._connectionState;
    this._connectionState = state;
    for (const cb of this._stateListeners) cb(state);
    if (prev !== "online" && state === "online") {
      // Reconnected — trigger replay
      void this._replayAll();
    }
  }

  getConnectionState(): ConnectionState {
    return this._connectionState;
  }

  isOnline(): boolean {
    return this._connectionState === "online";
  }

  onConnectionStateChange(cb: (state: ConnectionState) => void): () => void {
    this._stateListeners.add(cb);
    return () => this._stateListeners.delete(cb);
  }

  // ── Browser network event wiring ────────────────────────────────────────

  attachBrowserNetworkListeners(): () => void {
    if (typeof window === "undefined") return () => {};

    const onOnline = () => this.setConnectionState("online");
    const onOffline = () => this.setConnectionState("offline");

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    // Sync initial state
    if (!navigator.onLine) this.setConnectionState("offline");

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }

  // ── Enqueue ────────────────────────────────────────────────────────────────

  enqueue(
    type: QueuedActionType,
    payload: unknown,
    options: {
      priority?: ActionPriority;
      idempotencyKey?: string;
      ttlMs?: number;
      maxRetries?: number;
      syncNamespace?: SyncNamespace;
    } = {},
  ): QueuedAction | null {
    const ikey = options.idempotencyKey ?? this._makeIkey(type, payload);

    if (this._usedIdempotencyKeys.has(ikey)) return null;

    const action: QueuedAction = {
      id: this._randomId(),
      type,
      priority: options.priority ?? "normal",
      payload,
      idempotencyKey: ikey,
      enqueuedAt: Date.now(),
      expiresAt: Date.now() + (options.ttlMs ?? DEFAULT_TTL[type]),
      attempts: 0,
      maxRetries: options.maxRetries ?? 3,
      syncNamespace: options.syncNamespace,
    };

    this._queue.push(action);
    this._sortQueue();
    return action;
  }

  /** Enqueue and immediately replay if online */
  async enqueueOrExecute(
    type: QueuedActionType,
    payload: unknown,
    options: Parameters<OfflineReconnectQueue["enqueue"]>[2] = {},
  ): Promise<"executed" | "queued" | "dropped"> {
    if (this._connectionState === "online") {
      const success = await this._executeOne({
        id: this._randomId(),
        type,
        priority: options.priority ?? "normal",
        payload,
        idempotencyKey: options.idempotencyKey ?? this._makeIkey(type, payload),
        enqueuedAt: Date.now(),
        expiresAt: Date.now() + (options.ttlMs ?? DEFAULT_TTL[type]),
        attempts: 0,
        maxRetries: options.maxRetries ?? 3,
        syncNamespace: options.syncNamespace,
      });
      return success ? "executed" : "queued";
    }
    const queued = this.enqueue(type, payload, options);
    return queued ? "queued" : "dropped";
  }

  // ── Queue inspection ───────────────────────────────────────────────────────

  getQueue(): QueuedAction[] {
    return [...this._queue];
  }

  getQueueSize(): number {
    return this._queue.length;
  }

  getPendingByType(type: QueuedActionType): QueuedAction[] {
    return this._queue.filter((a) => a.type === type);
  }

  clearExpired(): number {
    const before = this._queue.length;
    const now = Date.now();
    this._queue = this._queue.filter((a) => now <= a.expiresAt);
    return before - this._queue.length;
  }

  clearAll(): void {
    this._queue = [];
  }

  // ── Replay ─────────────────────────────────────────────────────────────────

  onReplay(cb: (action: QueuedAction) => Promise<boolean>): () => void {
    this._replayListeners.add(cb);
    return () => this._replayListeners.delete(cb);
  }

  async replayNow(): Promise<ReplayResult[]> {
    return this._replayAll();
  }

  private async _replayAll(): Promise<ReplayResult[]> {
    const results: ReplayResult[] = [];
    const now = Date.now();
    const toReplay = [...this._queue];
    this._queue = [];

    for (const action of toReplay) {
      if (now > action.expiresAt) {
        results.push({ id: action.id, status: "expired", reason: "ttl exceeded" });
        continue;
      }
      if (this._usedIdempotencyKeys.has(action.idempotencyKey)) {
        results.push({ id: action.id, status: "skipped-duplicate" });
        continue;
      }

      const success = await this._executeOne(action);
      if (success) {
        this._usedIdempotencyKeys.add(action.idempotencyKey);
        results.push({ id: action.id, status: "success" });
      } else {
        action.attempts++;
        if (action.attempts < action.maxRetries) {
          this._queue.push(action);
          results.push({ id: action.id, status: "failed", reason: `retry ${action.attempts}/${action.maxRetries}` });
        } else {
          results.push({ id: action.id, status: "failed", reason: "max retries exceeded" });
        }
      }
    }

    this._sortQueue();
    return results;
  }

  private async _executeOne(action: QueuedAction): Promise<boolean> {
    if (this._replayListeners.size === 0) return false;
    const results = await Promise.all(
      [...this._replayListeners].map((cb) => cb(action).catch(() => false)),
    );
    return results.some(Boolean);
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private _sortQueue(): void {
    this._queue.sort((a, b) => {
      const pd = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      if (pd !== 0) return pd;
      return a.enqueuedAt - b.enqueuedAt;
    });
  }

  private _makeIkey(type: string, payload: unknown): string {
    try {
      return `${this._deviceId}:${type}:${JSON.stringify(payload)}`;
    } catch {
      return `${this._deviceId}:${type}:${Date.now()}`;
    }
  }

  private _randomId(): string {
    return Math.random().toString(36).slice(2, 10);
  }

  // ── Stats ──────────────────────────────────────────────────────────────────

  getStats(): {
    queueSize: number;
    connectionState: ConnectionState;
    deviceId: string;
    byPriority: Record<ActionPriority, number>;
    byType: Partial<Record<QueuedActionType, number>>;
  } {
    const byPriority: Record<ActionPriority, number> = { critical: 0, high: 0, normal: 0, low: 0 };
    const byType: Partial<Record<QueuedActionType, number>> = {};
    for (const a of this._queue) {
      byPriority[a.priority]++;
      byType[a.type] = (byType[a.type] ?? 0) + 1;
    }
    return {
      queueSize: this._queue.length,
      connectionState: this._connectionState,
      deviceId: this._deviceId,
      byPriority,
      byType,
    };
  }
}

export const offlineReconnectQueue = OfflineReconnectQueue.getInstance();
