import type { ChatRoomId } from '@/lib/chat/RoomChatEngine';

export interface RuntimeRecoveryReport {
  roomId: ChatRoomId;
  stalledLoops: string[];
  deadObservers: string[];
  disconnectedStreams: string[];
  orphanListeners: string[];
  recoveredAtMs: number;
  actions: string[];
  healthy: boolean;
}

const LOOP_STALL_MS = 15_000;
const OBSERVER_DEAD_MS = 20_000;
const LISTENER_ORPHAN_MS = 25_000;
const STREAM_DEAD_MS = 20_000;

const loopHeartbeat = new Map<string, number>();
const observerHeartbeat = new Map<string, number>();
const listenerHeartbeat = new Map<string, number>();
const streamHeartbeat = new Map<string, number>();
const roomReports = new Map<ChatRoomId, RuntimeRecoveryReport>();

function key(roomId: ChatRoomId, id: string): string {
  return `${roomId}::${id}`;
}

function now(): number {
  return Date.now();
}

function collectStaleKeys(source: Map<string, number>, maxAgeMs: number, roomId: ChatRoomId): string[] {
  const ts = now();
  const prefix = `${roomId}::`;
  const stale: string[] = [];
  for (const [k, last] of source.entries()) {
    if (!k.startsWith(prefix)) {
      continue;
    }
    if (ts - last > maxAgeMs) {
      stale.push(k.slice(prefix.length));
    }
  }
  return stale.sort();
}

function touch(source: Map<string, number>, roomId: ChatRoomId, id: string): void {
  source.set(key(roomId, id), now());
}

export function markRuntimeLoopHeartbeat(roomId: ChatRoomId, loopId: string): void {
  touch(loopHeartbeat, roomId, loopId);
}

export function markRuntimeObserverHeartbeat(roomId: ChatRoomId, observerId: string): void {
  touch(observerHeartbeat, roomId, observerId);
}

export function markRuntimeStreamHeartbeat(roomId: ChatRoomId, streamId: string): void {
  touch(streamHeartbeat, roomId, streamId);
}

export function markRuntimeListenerHeartbeat(roomId: ChatRoomId, listenerId: string): void {
  touch(listenerHeartbeat, roomId, listenerId);
}

export function detectRuntimeHealth(roomId: ChatRoomId): RuntimeRecoveryReport {
  const stalledLoops = collectStaleKeys(loopHeartbeat, LOOP_STALL_MS, roomId);
  const deadObservers = collectStaleKeys(observerHeartbeat, OBSERVER_DEAD_MS, roomId);
  const disconnectedStreams = collectStaleKeys(streamHeartbeat, STREAM_DEAD_MS, roomId);
  const orphanListeners = collectStaleKeys(listenerHeartbeat, LISTENER_ORPHAN_MS, roomId);

  const healthy =
    stalledLoops.length === 0 &&
    deadObservers.length === 0 &&
    disconnectedStreams.length === 0 &&
    orphanListeners.length === 0;

  const report: RuntimeRecoveryReport = {
    roomId,
    stalledLoops,
    deadObservers,
    disconnectedStreams,
    orphanListeners,
    recoveredAtMs: now(),
    actions: [],
    healthy,
  };

  roomReports.set(roomId, report);
  return report;
}

export function recoverRuntimeRoom(roomId: ChatRoomId): RuntimeRecoveryReport {
  const detected = detectRuntimeHealth(roomId);
  const actions: string[] = [];

  for (const id of detected.stalledLoops) {
    markRuntimeLoopHeartbeat(roomId, id);
    actions.push(`restart-loop:${id}`);
  }

  for (const id of detected.deadObservers) {
    markRuntimeObserverHeartbeat(roomId, id);
    actions.push(`reconnect-observer:${id}`);
  }

  for (const id of detected.disconnectedStreams) {
    markRuntimeStreamHeartbeat(roomId, id);
    actions.push(`reconnect-stream:${id}`);
  }

  for (const id of detected.orphanListeners) {
    listenerHeartbeat.delete(key(roomId, id));
    actions.push(`clear-orphan-listener:${id}`);
  }

  const report: RuntimeRecoveryReport = {
    ...detected,
    recoveredAtMs: now(),
    actions,
    healthy:
      detected.stalledLoops.length === 0 &&
      detected.deadObservers.length === 0 &&
      detected.disconnectedStreams.length === 0 &&
      detected.orphanListeners.length === 0,
  };

  roomReports.set(roomId, report);
  return report;
}

export function getRuntimeRecoveryReport(roomId: ChatRoomId): RuntimeRecoveryReport {
  return roomReports.get(roomId) ?? detectRuntimeHealth(roomId);
}

export function listRuntimeRecoveryReports(): RuntimeRecoveryReport[] {
  return [...roomReports.values()].sort((a, b) => b.recoveredAtMs - a.recoveredAtMs);
}
