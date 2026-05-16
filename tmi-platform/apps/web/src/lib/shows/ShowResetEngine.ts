/**
 * Show Reset Engine
 * Orchestrates PRE_RESET -> POST_RESET transitions for show continuity.
 */

export type ShowResetState = 'PRE_RESET' | 'POST_RESET';

export interface ShowResetSnapshot {
  showId: string;
  state: ShowResetState;
  atMs: number;
  reason: string;
}

export class ShowResetEngine {
  private snapshotsByShow = new Map<string, ShowResetSnapshot[]>();

  markPreReset(showId: string, reason = 'show-reset'): ShowResetSnapshot {
    const snapshot: ShowResetSnapshot = {
      showId,
      state: 'PRE_RESET',
      atMs: Date.now(),
      reason,
    };
    this.pushSnapshot(snapshot);
    return snapshot;
  }

  markPostReset(showId: string, reason = 'show-reset-complete'): ShowResetSnapshot {
    const snapshot: ShowResetSnapshot = {
      showId,
      state: 'POST_RESET',
      atMs: Date.now(),
      reason,
    };
    this.pushSnapshot(snapshot);
    return snapshot;
  }

  getLastSnapshot(showId: string): ShowResetSnapshot | null {
    const snapshots = this.snapshotsByShow.get(showId) ?? [];
    return snapshots.length > 0 ? snapshots[snapshots.length - 1] : null;
  }

  private pushSnapshot(snapshot: ShowResetSnapshot): void {
    const existing = this.snapshotsByShow.get(snapshot.showId) ?? [];
    existing.push(snapshot);
    this.snapshotsByShow.set(snapshot.showId, existing);
  }
}

export const showResetEngine = new ShowResetEngine();
