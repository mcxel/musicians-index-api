/**
 * DiscoveryBus — in-memory live discovery tile bus for Live Lobby Walls.
 * Poll/SSE adapters push real published rooms only (Rule 20 — no fake rooms).
 */

import type { LiveDiscoveryRecord } from "./LiveDiscoveryRecord";
import {
  filterDiscoverableRecords,
  type DiscoveryViewerContext,
} from "./discoveryVisibility";

type Listener = (records: LiveDiscoveryRecord[]) => void;

const store = new Map<string, LiveDiscoveryRecord>();
const listeners = new Set<Listener>();

function snapshot(): LiveDiscoveryRecord[] {
  return Array.from(store.values()).sort((a, b) => b.startedAt - a.startedAt);
}

function emit(): void {
  const all = snapshot();
  for (const l of listeners) {
    try {
      l(all);
    } catch {
      /* ignore listener errors */
    }
  }
}

export const DiscoveryBus = {
  getAll(): LiveDiscoveryRecord[] {
    return snapshot();
  },

  getVisible(ctx?: DiscoveryViewerContext): LiveDiscoveryRecord[] {
    return filterDiscoverableRecords(snapshot(), ctx);
  },

  getById(id: string): LiveDiscoveryRecord | undefined {
    return store.get(id);
  },

  upsert(record: LiveDiscoveryRecord): void {
    store.set(record.id, { ...record, updatedAt: Date.now() });
    emit();
  },

  /** Replace entire bus contents (used by poll sync). Never seeds mocks. */
  replaceAll(records: readonly LiveDiscoveryRecord[]): void {
    store.clear();
    for (const r of records) {
      if (!r?.id || !r.isLive) continue;
      store.set(r.id, r);
    }
    emit();
  },

  remove(id: string): void {
    if (!store.delete(id)) return;
    emit();
  },

  clear(): void {
    if (store.size === 0) return;
    store.clear();
    emit();
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    try {
      listener(snapshot());
    } catch {
      /* ignore */
    }
    return () => {
      listeners.delete(listener);
    };
  },
};

export type { DiscoveryViewerContext };
