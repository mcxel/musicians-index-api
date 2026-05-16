/**
 * CrossDeviceSyncEngine
 * Lightweight state sync between connected device surfaces.
 * Website holds canonical state. Surfaces receive diffs and send intents.
 */

import type { DeviceClass } from "./DeviceCapabilityRegistry";

// ─── Sync Payload ─────────────────────────────────────────────────────────────

export type SyncNamespace =
  | "playback"
  | "queue"
  | "chat"
  | "reaction"
  | "nav"
  | "notifications"
  | "avatar"
  | "wallet"
  | "session";

export interface SyncPayload {
  namespace: SyncNamespace;
  key: string;
  value: unknown;
  /** Logical clock — lamport timestamp */
  seq: number;
  /** Unix ms — wall clock for TTL decisions */
  timestamp: number;
  /** Device that produced this value */
  originDeviceId: string;
}

export interface SyncDiff {
  payloads: SyncPayload[];
  /** Server seq at time of diff — device uses this to request missing ranges */
  serverSeq: number;
}

// ─── Conflict Resolution ──────────────────────────────────────────────────────

export type ConflictStrategy = "last-write-wins" | "server-wins" | "highest-seq";

// ─── Sync Record ──────────────────────────────────────────────────────────────

interface SyncRecord {
  value: unknown;
  seq: number;
  timestamp: number;
  originDeviceId: string;
}

type NamespaceStore = Map<string, SyncRecord>;

// ─── Device Sync State ────────────────────────────────────────────────────────

export interface DeviceSyncState {
  deviceId: string;
  deviceClass: DeviceClass;
  /** Last seq the device acknowledged */
  lastAckedSeq: number;
  /** Whether the device is currently reachable */
  online: boolean;
  lastSeenAt: number;
}

// ─── Sync Intent (device → website) ──────────────────────────────────────────

export interface SyncIntent {
  deviceId: string;
  namespace: SyncNamespace;
  key: string;
  value: unknown;
  localSeq: number;
  timestamp: number;
}

// ─── Engine ───────────────────────────────────────────────────────────────────

export class CrossDeviceSyncEngine {
  private static _instance: CrossDeviceSyncEngine | null = null;

  private _store: Map<SyncNamespace, NamespaceStore> = new Map();
  private _devices: Map<string, DeviceSyncState> = new Map();
  private _serverSeq: number = 0;
  private _listeners: Set<(diff: SyncDiff) => void> = new Set();
  private _strategy: ConflictStrategy = "last-write-wins";

  static getInstance(): CrossDeviceSyncEngine {
    if (!CrossDeviceSyncEngine._instance) {
      CrossDeviceSyncEngine._instance = new CrossDeviceSyncEngine();
    }
    return CrossDeviceSyncEngine._instance;
  }

  // ── Device registration ────────────────────────────────────────────────────

  registerDevice(deviceId: string, deviceClass: DeviceClass): void {
    this._devices.set(deviceId, {
      deviceId,
      deviceClass,
      lastAckedSeq: 0,
      online: true,
      lastSeenAt: Date.now(),
    });
  }

  setDeviceOnline(deviceId: string, online: boolean): void {
    const state = this._devices.get(deviceId);
    if (state) {
      state.online = online;
      state.lastSeenAt = Date.now();
    }
  }

  ackSeq(deviceId: string, seq: number): void {
    const state = this._devices.get(deviceId);
    if (state && seq > state.lastAckedSeq) {
      state.lastAckedSeq = seq;
      state.lastSeenAt = Date.now();
    }
  }

  getDeviceStates(): DeviceSyncState[] {
    return [...this._devices.values()];
  }

  // ── Write (website canonical write) ───────────────────────────────────────

  write(
    namespace: SyncNamespace,
    key: string,
    value: unknown,
    originDeviceId: string,
  ): SyncPayload {
    const seq = ++this._serverSeq;
    const timestamp = Date.now();
    const record: SyncRecord = { value, seq, timestamp, originDeviceId };

    if (!this._store.has(namespace)) this._store.set(namespace, new Map());
    const ns = this._store.get(namespace)!;

    const existing = ns.get(key);
    if (existing && !this._shouldWrite(existing, record)) {
      // Conflict: reject or demote per strategy
      return {
        namespace,
        key,
        value: existing.value,
        seq: existing.seq,
        timestamp: existing.timestamp,
        originDeviceId: existing.originDeviceId,
      };
    }

    ns.set(key, record);

    const payload: SyncPayload = { namespace, key, value, seq, timestamp, originDeviceId };
    this._broadcast({ payloads: [payload], serverSeq: seq });
    return payload;
  }

  // ── Intent processing (device → website → canonical) ─────────────────────

  applyIntent(intent: SyncIntent): SyncPayload {
    return this.write(intent.namespace, intent.key, intent.value, intent.deviceId);
  }

  // ── Read ──────────────────────────────────────────────────────────────────

  read(namespace: SyncNamespace, key: string): unknown {
    return this._store.get(namespace)?.get(key)?.value ?? undefined;
  }

  readNamespace(namespace: SyncNamespace): Record<string, unknown> {
    const ns = this._store.get(namespace);
    if (!ns) return {};
    const result: Record<string, unknown> = {};
    for (const [k, rec] of ns.entries()) result[k] = rec.value;
    return result;
  }

  // ── Diff generation for a device ─────────────────────────────────────────

  getDiffSince(deviceId: string, sinceSeq: number): SyncDiff {
    const payloads: SyncPayload[] = [];
    for (const [namespace, ns] of this._store.entries()) {
      for (const [key, rec] of ns.entries()) {
        if (rec.seq > sinceSeq) {
          payloads.push({
            namespace: namespace as SyncNamespace,
            key,
            value: rec.value,
            seq: rec.seq,
            timestamp: rec.timestamp,
            originDeviceId: rec.originDeviceId,
          });
        }
      }
    }
    void deviceId;
    return { payloads, serverSeq: this._serverSeq };
  }

  getFullSnapshot(): SyncDiff {
    const payloads: SyncPayload[] = [];
    for (const [namespace, ns] of this._store.entries()) {
      for (const [key, rec] of ns.entries()) {
        payloads.push({
          namespace: namespace as SyncNamespace,
          key,
          value: rec.value,
          seq: rec.seq,
          timestamp: rec.timestamp,
          originDeviceId: rec.originDeviceId,
        });
      }
    }
    return { payloads, serverSeq: this._serverSeq };
  }

  // ── Conflict strategy ──────────────────────────────────────────────────────

  setConflictStrategy(strategy: ConflictStrategy): void {
    this._strategy = strategy;
  }

  private _shouldWrite(existing: SyncRecord, incoming: SyncRecord): boolean {
    switch (this._strategy) {
      case "server-wins":
        return false;
      case "highest-seq":
        return incoming.seq > existing.seq;
      case "last-write-wins":
      default:
        return incoming.timestamp >= existing.timestamp;
    }
  }

  // ── Subscription ──────────────────────────────────────────────────────────

  onSync(cb: (diff: SyncDiff) => void): () => void {
    this._listeners.add(cb);
    return () => this._listeners.delete(cb);
  }

  private _broadcast(diff: SyncDiff): void {
    for (const cb of this._listeners) cb(diff);
  }

  // ── Namespace helpers ─────────────────────────────────────────────────────

  clearNamespace(namespace: SyncNamespace): void {
    this._store.delete(namespace);
  }

  getServerSeq(): number {
    return this._serverSeq;
  }
}

export const crossDeviceSyncEngine = CrossDeviceSyncEngine.getInstance();
