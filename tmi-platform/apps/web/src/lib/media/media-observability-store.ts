import fs from 'node:fs';
import path from 'node:path';

export type MediaObservabilityEventKind =
  | 'image_upload_success'
  | 'song_upload_success'
  | 'video_upload_success'
  | 'upload_failed'
  | 'transcode_failed'
  | 'playlist_import_failed';

export interface MediaObservabilityEvent {
  id: string;
  kind: MediaObservabilityEventKind;
  ts: number;
  meta: Record<string, unknown>;
}

const MAX_EVENTS = 1000;
let counter = 0;
const events: MediaObservabilityEvent[] = [];

const STORE_DIR = path.join(process.cwd(), '.tmi-data');
const STORE_FILE = path.join(STORE_DIR, 'media-observability.json');
let hydrated = false;

function ensureStoreDir(): void {
  if (!fs.existsSync(STORE_DIR)) {
    fs.mkdirSync(STORE_DIR, { recursive: true });
  }
}

function hydrateFromDisk(): void {
  if (hydrated) return;
  hydrated = true;

  try {
    if (!fs.existsSync(STORE_FILE)) return;
    const raw = fs.readFileSync(STORE_FILE, 'utf8');
    if (!raw.trim()) return;

    const parsed = JSON.parse(raw) as {
      counter?: number;
      events?: MediaObservabilityEvent[];
    };

    if (Array.isArray(parsed.events)) {
      events.splice(0, events.length, ...parsed.events.slice(-MAX_EVENTS));
    }

    if (typeof parsed.counter === 'number' && Number.isFinite(parsed.counter)) {
      counter = parsed.counter;
    }
  } catch (error) {
    console.error('[media-observability-store] Failed to hydrate from disk:', error);
  }
}

function persistToDisk(): void {
  try {
    ensureStoreDir();
    fs.writeFileSync(STORE_FILE, JSON.stringify({ counter, events }, null, 2), 'utf8');
  } catch (error) {
    console.error('[media-observability-store] Failed to persist telemetry:', error);
  }
}

export function recordMediaObservabilityEvent(
  kind: MediaObservabilityEventKind,
  meta: Record<string, unknown> = {},
): void {
  hydrateFromDisk();

  const event: MediaObservabilityEvent = {
    id: `${Date.now()}-${++counter}`,
    kind,
    ts: Date.now(),
    meta,
  };

  events.push(event);
  if (events.length > MAX_EVENTS) {
    events.shift();
  }

  persistToDisk();
}

export function getMediaObservabilitySince(sinceTs: number): MediaObservabilityEvent[] {
  hydrateFromDisk();
  return events.filter((event) => event.ts >= sinceTs);
}

export function getMediaObservabilitySummary(sinceTs: number): {
  imagesUploaded: number;
  songsUploaded: number;
  videosUploaded: number;
  failedUploads: number;
  failedTranscodes: number;
  failedPlaylistImports: number;
} {
  const window = getMediaObservabilitySince(sinceTs);

  return {
    imagesUploaded: window.filter((event) => event.kind === 'image_upload_success').length,
    songsUploaded: window.filter((event) => event.kind === 'song_upload_success').length,
    videosUploaded: window.filter((event) => event.kind === 'video_upload_success').length,
    failedUploads: window.filter((event) => event.kind === 'upload_failed').length,
    failedTranscodes: window.filter((event) => event.kind === 'transcode_failed').length,
    failedPlaylistImports: window.filter((event) => event.kind === 'playlist_import_failed').length,
  };
}