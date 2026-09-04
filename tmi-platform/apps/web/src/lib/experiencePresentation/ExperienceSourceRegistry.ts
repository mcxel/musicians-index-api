/**
 * ExperienceSourceRegistry — SOURCE ≠ DECODER ≠ TARGET.
 * One session → many sources → many targets without new session id.
 */

export type ExperienceSourceKind =
  | "PROGRAM"
  | "ISO"
  | "AUDIENCE"
  | "JUMBOTRON"
  | "VIEWPOINT";

export type ExperienceDisplayTarget =
  | "UNIVERSAL_PLAYER_PRIMARY"
  | "UNIVERSAL_PLAYER_SECONDARY"
  | "CAST"
  | "JUMBOTRON_DISCOVERY"
  | "JUMBOTRON_IN_VENUE"
  | "RECORDING_PROGRAM"
  | "RECORDING_ISO"
  | "OBSERVATORY";

export interface ExperienceSourceRecord {
  sourceId: string;
  kind: ExperienceSourceKind;
  label: string;
  /** Decoder id is separate — never conflated with source or target */
  decoderId: string | null;
  boundTargets: ExperienceDisplayTarget[];
}

export class ExperienceSourceRegistry {
  readonly sessionId: string;
  private sources = new Map<string, ExperienceSourceRecord>();

  constructor(sessionId: string) {
    if (!sessionId) throw new Error("sessionId required");
    this.sessionId = sessionId;
  }

  registerSource(record: Omit<ExperienceSourceRecord, "boundTargets"> & { boundTargets?: ExperienceDisplayTarget[] }): ExperienceSourceRecord {
    const full: ExperienceSourceRecord = {
      ...record,
      boundTargets: record.boundTargets ?? [],
    };
    this.sources.set(full.sourceId, full);
    return full;
  }

  /**
   * Bind a source to a display target without minting a new session.
   */
  bindTarget(sourceId: string, target: ExperienceDisplayTarget): ExperienceSourceRecord {
    const src = this.sources.get(sourceId);
    if (!src) throw new Error(`Unknown source: ${sourceId}`);
    if (!src.boundTargets.includes(target)) {
      src.boundTargets = [...src.boundTargets, target];
    }
    return src;
  }

  /** Assign decoder separately from source ownership and target display */
  attachDecoder(sourceId: string, decoderId: string): void {
    const src = this.sources.get(sourceId);
    if (!src) throw new Error(`Unknown source: ${sourceId}`);
    src.decoderId = decoderId;
  }

  listSources(): ExperienceSourceRecord[] {
    return [...this.sources.values()];
  }

  getSessionId(): string {
    return this.sessionId;
  }

  /** Invariant helper: adding targets must not change session id */
  assertSameSession(expectedSessionId: string): void {
    if (this.sessionId !== expectedSessionId) {
      throw new Error("Session id mutated — Presence Continuity / Freedom law violated");
    }
  }
}
