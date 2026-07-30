/**
 * MagazineDiscoveryBus — DiscoveryBus-pattern channel for Home 2 Magazine Network.
 *
 * Isolated from LiveDiscoveryRecord / Live Lobby walls (Home 1/3/5).
 * Publishers push UnifiedMediaRecord entries; MagazineRotationScheduler reads them.
 */

import type { UnifiedMediaRecord } from "@/lib/magazine/UnifiedMediaRecord";

type Listener = (records: UnifiedMediaRecord[]) => void;

const store = new Map<string, UnifiedMediaRecord>();
const listeners = new Set<Listener>();

function snapshot(): UnifiedMediaRecord[] {
  return Array.from(store.values());
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

export const MagazineDiscoveryBus = {
  getAll(): UnifiedMediaRecord[] {
    return snapshot();
  },

  getById(id: string): UnifiedMediaRecord | undefined {
    return store.get(id);
  },

  upsert(record: UnifiedMediaRecord): void {
    if (!record?.id) return;
    store.set(record.id, record);
    emit();
  },

  /** Replace entire magazine network queue. Never seeds mocks. */
  replaceAll(records: readonly UnifiedMediaRecord[]): void {
    store.clear();
    for (const r of records) {
      if (!r?.id || !r.route || r.route === "#") continue;
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
