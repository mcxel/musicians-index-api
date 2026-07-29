/**
 * EOS Phase 7 — Memory Ledger (append-only event stream)
 *
 * Records platform events as immutable facts.
 * Consumers subscribe via `MemoryLedger.subscribe()`.
 *
 * Rule 20: never inject fake entries. caller must supply a real actorId
 * from an authenticated session — no fabricated userId / viewer counts.
 */

import type { LedgerEntry, MemoryEventKind } from "./memoryRegistry";

type LedgerSubscriber = (entry: LedgerEntry) => void;

class MemoryLedgerClass {
  private readonly _entries: LedgerEntry[] = [];
  private readonly _subscribers = new Set<LedgerSubscriber>();

  /** Append a fully-formed entry. Notifies all subscribers synchronously. */
  append(entry: LedgerEntry): void {
    this._entries.push(entry);
    for (const sub of this._subscribers) {
      sub(entry);
    }
  }

  /**
   * Convenience builder — auto-fills id and timestamp.
   * Returns the appended entry so callers can chain / inspect.
   */
  record(
    kind: MemoryEventKind,
    actorId: string,
    context?: Pick<LedgerEntry, "roomId" | "experienceId" | "payload">,
  ): LedgerEntry {
    const entry: LedgerEntry = {
      id: typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      kind,
      actorId,
      occurredAtMs: Date.now(),
      ...context,
    };
    this.append(entry);
    return entry;
  }

  /**
   * Subscribe to all new entries appended after this call.
   * Returns an unsubscribe function — call it on component unmount.
   */
  subscribe(handler: LedgerSubscriber): () => void {
    this._subscribers.add(handler);
    return () => this._subscribers.delete(handler);
  }

  /** Read-only snapshot of all recorded entries, oldest first. */
  getAll(): readonly LedgerEntry[] {
    return this._entries;
  }

  /** All entries for a specific actor, oldest first. */
  getByActor(actorId: string): readonly LedgerEntry[] {
    return this._entries.filter((e) => e.actorId === actorId);
  }

  /** All entries for a specific room, oldest first. */
  getByRoom(roomId: string): readonly LedgerEntry[] {
    return this._entries.filter((e) => e.roomId === roomId);
  }

  /** All entries for a specific experience, oldest first. */
  getByExperience(experienceId: string): readonly LedgerEntry[] {
    return this._entries.filter((e) => e.experienceId === experienceId);
  }

  /** Total count — useful for badges / counters without exposing entries. */
  get size(): number {
    return this._entries.length;
  }
}

/** Platform-wide singleton — import and call directly, no React context needed. */
export const MemoryLedger = new MemoryLedgerClass();
