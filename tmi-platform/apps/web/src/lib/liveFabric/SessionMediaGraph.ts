/**
 * SessionMediaGraph.ts — Typed source registry + health SM + publish eligibility
 */

import {
  type MediaSourceKind,
  type MediaSourceRecord,
  type SourceHealthState,
  type SourceRightsPolicy,
  type SourcePrivacyPolicy,
  type SourceAudioPolicy,
  type SourceVideoPolicy,
  DEFAULT_FAIL_CLOSED_RIGHTS,
  DEFAULT_FAIL_CLOSED_PRIVACY,
  isSourcePublishEligible,
  MEDIA_SOURCE_CONTRACT_VERSION,
} from "./contracts/MediaSourceContracts";

const HEALTH_TRANSITIONS: Record<SourceHealthState, ReadonlySet<SourceHealthState>> = {
  CONNECTING: new Set(["HEALTHY", "DEGRADED", "FAILED", "ENDED"]),
  HEALTHY: new Set(["DEGRADED", "STALLED", "RECOVERING", "FAILED", "ENDED"]),
  DEGRADED: new Set(["HEALTHY", "STALLED", "RECOVERING", "FAILED", "ENDED"]),
  STALLED: new Set(["RECOVERING", "HEALTHY", "FAILED", "ENDED"]),
  RECOVERING: new Set(["HEALTHY", "DEGRADED", "FAILED", "ENDED"]),
  FAILED: new Set(["RECOVERING", "ENDED"]),
  ENDED: new Set(),
};

export interface RegisterSourceInput {
  sourceId: string;
  ownerId: string;
  ownerRole: string;
  mediaKind: MediaSourceKind;
  rightsPolicy?: SourceRightsPolicy;
  privacyPolicy?: SourcePrivacyPolicy;
  audioPolicy?: Partial<SourceAudioPolicy>;
  videoPolicy?: Partial<SourceVideoPolicy>;
}

export class SessionMediaGraph {
  private readonly sessionId: string;
  private generation: number;
  private readonly sources = new Map<string, MediaSourceRecord>();

  constructor(sessionId: string, generation = 1) {
    this.sessionId = sessionId;
    this.generation = generation;
  }

  public getContractVersion(): string {
    return MEDIA_SOURCE_CONTRACT_VERSION;
  }

  public setGeneration(generation: number): void {
    this.generation = generation;
  }

  public register(input: RegisterSourceInput): MediaSourceRecord {
    if (this.sources.has(input.sourceId)) {
      throw new Error(`Source already registered: ${input.sourceId}`);
    }
    const rights = input.rightsPolicy ?? { ...DEFAULT_FAIL_CLOSED_RIGHTS };
    const privacy = input.privacyPolicy ?? { ...DEFAULT_FAIL_CLOSED_PRIVACY };
    const now = Date.now();
    const record: MediaSourceRecord = {
      sourceId: input.sourceId,
      sessionId: this.sessionId,
      generation: this.generation,
      ownerId: input.ownerId,
      ownerRole: input.ownerRole,
      mediaKind: input.mediaKind,
      health: "CONNECTING",
      latencyMs: 0,
      droppedFrames: 0,
      audioPolicy: {
        hasAudio: false,
        channels: 2,
        sampleRate: 48000,
        isMuted: false,
        gain: 1,
        priority: 5,
        echoCancellation: true,
        noiseSuppression: true,
        ...input.audioPolicy,
      },
      videoPolicy: {
        hasVideo: false,
        width: 1280,
        height: 720,
        fps: 30,
        bitrateKbps: 2500,
        aspectRatio: "16:9",
        ...input.videoPolicy,
      },
      rightsPolicy: rights,
      privacyPolicy: privacy,
      availability: "AVAILABLE",
      registeredAtMs: now,
      lastHealthUpdateMs: now,
      publishEligible: isSourcePublishEligible(rights, privacy),
    };
    this.sources.set(input.sourceId, record);
    return { ...record };
  }

  public get(sourceId: string): MediaSourceRecord | null {
    const s = this.sources.get(sourceId);
    return s ? { ...s } : null;
  }

  public list(): MediaSourceRecord[] {
    return Array.from(this.sources.values()).map((s) => ({ ...s }));
  }

  public listPublishEligible(): MediaSourceRecord[] {
    return this.list().filter((s) => s.publishEligible && s.availability === "AVAILABLE");
  }

  public updateHealth(sourceId: string, health: SourceHealthState): MediaSourceRecord {
    const s = this.sources.get(sourceId);
    if (!s) throw new Error(`Unknown source: ${sourceId}`);
    if (s.health !== health) {
      const allowed = HEALTH_TRANSITIONS[s.health];
      if (!allowed.has(health)) {
        throw new Error(`Illegal health transition ${s.health} → ${health} for ${sourceId}`);
      }
      s.health = health;
      s.lastHealthUpdateMs = Date.now();
      if (health === "FAILED" || health === "ENDED") {
        s.availability = health === "ENDED" ? "REVOKED" : "DISCONNECTED";
      }
    }
    return { ...s };
  }

  public updateRights(
    sourceId: string,
    rights: SourceRightsPolicy,
    privacy?: SourcePrivacyPolicy
  ): MediaSourceRecord {
    const s = this.sources.get(sourceId);
    if (!s) throw new Error(`Unknown source: ${sourceId}`);
    s.rightsPolicy = rights;
    if (privacy) s.privacyPolicy = privacy;
    s.publishEligible = isSourcePublishEligible(s.rightsPolicy, s.privacyPolicy);
    if (!s.publishEligible) {
      s.availability = "REVOKED";
    }
    s.lastHealthUpdateMs = Date.now();
    return { ...s };
  }

  public revoke(sourceId: string, _reason: string): void {
    const s = this.sources.get(sourceId);
    if (!s) return;
    s.availability = "REVOKED";
    s.publishEligible = false;
    if (s.health !== "ENDED" && HEALTH_TRANSITIONS[s.health].has("ENDED")) {
      s.health = "ENDED";
    }
    s.lastHealthUpdateMs = Date.now();
  }

  public remove(sourceId: string): boolean {
    return this.sources.delete(sourceId);
  }

  public assertPublishable(sourceId: string): void {
    const s = this.sources.get(sourceId);
    if (!s) throw new Error(`Unknown source: ${sourceId}`);
    if (!s.publishEligible) {
      throw new Error(`DO_NOT_PUBLISH: source ${sourceId} fails rights/privacy gate`);
    }
  }
}
