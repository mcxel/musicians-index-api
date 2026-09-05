/**
 * LiveAudioDirector.ts — Program vs monitor; ducking; primary owner; visible ≠ audible
 */

import type {
  AudioChannelState,
  AudioGraphSnapshot,
  AudioFocusTransaction,
  AudioFocusResult,
  AudioChannelKind,
} from "./contracts/AudioContracts";

export class LiveAudioDirector {
  private revision = 0;
  private readonly channels = new Map<string, AudioChannelState>();
  private primaryOwnerSourceId: string | null = null;
  private masterProgramGain = 1;
  private masterMonitorGain = 1;
  private readonly commandLog = new Map<string, AudioFocusResult>();

  constructor(
    private readonly sessionId: string,
    private generation = 1
  ) {}

  public setGeneration(generation: number): void {
    this.generation = generation;
    this.revision = 0;
    this.commandLog.clear();
  }

  public getRevision(): number {
    return this.revision;
  }

  public ensureChannel(
    channelId: string,
    kind: AudioChannelKind,
    sourceId: string | null
  ): AudioChannelState {
    let ch = this.channels.get(channelId);
    if (!ch) {
      ch = {
        channelId,
        kind,
        sourceId,
        gain: 1,
        muted: false,
        solo: false,
        priority: 5,
        duckingLevelDb: 0,
        isDucked: false,
        isAudibleInProgram: false,
        isAudibleInMonitor: true,
        pan: 0,
      };
      this.channels.set(channelId, ch);
    } else {
      ch.sourceId = sourceId;
    }
    return { ...ch };
  }

  /** Cert-suite alias for ensureChannel(kind, kind, sourceId). */
  public registerChannel(
    channelId: string,
    kind: AudioChannelKind,
    sourceId: string | null,
    gain = 1
  ): AudioChannelState {
    const ch = this.ensureChannel(channelId, kind, sourceId);
    const live = this.channels.get(channelId)!;
    live.gain = gain;
    live.priority = kind === "MIC" || kind === "GUEST_AUDIO" ? 10 : 5;
    return { ...live };
  }

  public snapshot(): AudioGraphSnapshot {
    return this.getSnapshot();
  }

  /** Duck lower-priority channels when a high-priority audible channel is active. */
  public recalculateDucking(): void {
    const list = Array.from(this.channels.values());
    const primary = list
      .filter((c) => !c.muted && (c.isAudibleInProgram || c.isAudibleInMonitor))
      .sort((a, b) => b.priority - a.priority)[0];
    for (const ch of list) {
      if (primary && ch.channelId !== primary.channelId && ch.priority < primary.priority) {
        ch.isDucked = true;
        ch.duckingLevelDb = -12;
      } else {
        ch.isDucked = false;
        ch.duckingLevelDb = 0;
      }
    }
    this.revision += 1;
  }

  public isChannelDucked(channelId: string): boolean {
    return this.channels.get(channelId)?.isDucked ?? false;
  }

  /**
   * Audio focus transaction — independent of frame visibility.
   * A source may be visible on PROGRAM and still inaudible.
   */
  public commitFocus(tx: AudioFocusTransaction): AudioFocusResult {
    const existing = this.commandLog.get(tx.transactionId);
    if (existing) return { ...existing };

    if (tx.sessionId !== this.sessionId) {
      const fail = this.fail(tx, "SESSION_MISMATCH");
      return fail;
    }
    if (tx.generation !== this.generation) {
      return this.fail(tx, "GENERATION_MISMATCH");
    }
    if (tx.expectedRevision !== this.revision) {
      return this.fail(tx, "REVISION_MISMATCH");
    }

    this.primaryOwnerSourceId = tx.primaryOwnerSourceId;

    for (const ch of this.channels.values()) {
      ch.isDucked = false;
      ch.duckingLevelDb = 0;
      ch.isAudibleInProgram = false;
      const sid = ch.sourceId;
      if (sid && tx.programAudibleSourceIds.includes(sid)) {
        ch.isAudibleInProgram = !ch.muted;
      }
      ch.isAudibleInMonitor = Boolean(sid && tx.monitorAudibleSourceIds.includes(sid));
      if (sid && tx.duckTargets.includes(sid) && sid !== tx.primaryOwnerSourceId) {
        ch.isDucked = true;
        ch.duckingLevelDb = tx.duckLevelDb;
      }
    }

    this.revision += 1;
    const ok: AudioFocusResult = {
      transactionId: tx.transactionId,
      success: true,
      appliedRevision: this.revision,
    };
    this.commandLog.set(tx.transactionId, ok);
    return ok;
  }

  public getSnapshot(): AudioGraphSnapshot {
    const channels: Record<string, AudioChannelState> = {};
    for (const [k, v] of this.channels) channels[k] = { ...v };
    return {
      sessionId: this.sessionId,
      generation: this.generation,
      revision: this.revision,
      channels,
      masterProgramGain: this.masterProgramGain,
      masterMonitorGain: this.masterMonitorGain,
      primaryAudioAuthoritySourceId: this.primaryOwnerSourceId,
      activeDuckingSources: Object.values(channels)
        .filter((c) => c.isDucked && c.sourceId)
        .map((c) => c.sourceId as string),
      lastUpdateMs: Date.now(),
    };
  }

  /** Visible frame source does not imply audible. */
  public isAudibleOnProgram(sourceId: string): boolean {
    for (const ch of this.channels.values()) {
      if (ch.sourceId === sourceId) return ch.isAudibleInProgram && !ch.muted;
    }
    return false;
  }

  private fail(tx: AudioFocusTransaction, error: string): AudioFocusResult {
    const fail: AudioFocusResult = {
      transactionId: tx.transactionId,
      success: false,
      appliedRevision: this.revision,
      error,
    };
    this.commandLog.set(tx.transactionId, fail);
    return fail;
  }
}
