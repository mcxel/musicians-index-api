import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

export type AdminLiveEventType =
  | 'join'
  | 'payment'
  | 'engagement'
  | 'alert'
  | 'viral'
  | 'arena_moderation'
  | 'submission_received'
  | 'submission_approved';

export type AdminLiveEvent = {
  id: string;
  timestamp: number;
  type: AdminLiveEventType;
  message: string;
  meta?: Record<string, string | number | boolean | null>;
};

const LIVE_EVENT_LIMIT = 200;
const liveEvents: AdminLiveEvent[] = [];
const STORE_FILE = path.join(os.tmpdir(), 'tmi-admin-live-events.json');

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function readStore(): AdminLiveEvent[] {
  try {
    if (!fs.existsSync(STORE_FILE)) return [];
    const raw = fs.readFileSync(STORE_FILE, 'utf8');
    const parsed = JSON.parse(raw) as AdminLiveEvent[];
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, LIVE_EVENT_LIMIT);
  } catch {
    return [];
  }
}

function writeStore(events: AdminLiveEvent[]) {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(events.slice(0, LIVE_EVENT_LIMIT)), 'utf8');
  } catch {
    // best effort persistence only
  }
}

export function emitAdminLiveEvent(event: Omit<AdminLiveEvent, 'id' | 'timestamp'>): AdminLiveEvent {
  const stored = readStore();
  const normalized: AdminLiveEvent = {
    id: makeId(),
    timestamp: Date.now(),
    ...event,
  };
  const merged = [normalized, ...stored].slice(0, LIVE_EVENT_LIMIT);
  liveEvents.length = 0;
  liveEvents.push(...merged);
  writeStore(merged);
  return normalized;
}

export function getAdminLiveEvents(limit = 30): AdminLiveEvent[] {
  const safeLimit = Math.max(1, Math.min(limit, 100));
  const stored = readStore();
  if (stored.length > 0) {
    liveEvents.length = 0;
    liveEvents.push(...stored);
  }
  return liveEvents.slice(0, safeLimit);
}
