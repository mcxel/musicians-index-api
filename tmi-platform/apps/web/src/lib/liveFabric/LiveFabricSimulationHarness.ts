/**
 * LiveFabricSimulationHarness.ts — Headless multi-participant session simulation
 */

import { LiveSessionKernel } from "./LiveSessionKernel";
import { SessionMediaGraph } from "./SessionMediaGraph";
import { LiveFrameGraph } from "./LiveFrameGraph";
import { SurfaceComposer } from "./SurfaceComposer";
import { AdaptivePresentationDirector } from "./AdaptivePresentationDirector";
import { LiveAudioDirector } from "./LiveAudioDirector";
import { LiveRecoveryDirector } from "./LiveRecoveryDirector";
import { DeviceCapabilityDirector } from "./DeviceCapabilityDirector";
import { DistributionDirector } from "./DistributionDirector";
import { LiveCapabilityPolicy } from "./LiveCapabilityPolicy";
import { getExperiencePresentationContract } from "./ExperiencePresentationContract";
import type { CanonicalExperienceType } from "./contracts/ExperienceContracts";
import {
  DEFAULT_PUBLIC_SOURCE_RIGHTS,
  DEFAULT_PUBLIC_PRIVACY,
} from "./contracts/MediaSourceContracts";
import type { AccountCapabilityRole } from "./contracts/CapabilityContracts";

export interface SimParticipant {
  userId: string;
  role: AccountCapabilityRole;
  displayName: string;
}

export interface SimHarnessOptions {
  roomId: string;
  experienceType: CanonicalExperienceType;
  host: SimParticipant;
  guests?: SimParticipant[];
  deviceTier?: "LOW" | "MEDIUM" | "HIGH";
}

export interface SimHarnessSnapshot {
  sessionId: string;
  state: string;
  generation: number;
  revision: number;
  mediaClockMs: number;
  sourceCount: number;
  layout: string;
  incidents: number;
  programPrimary: string | null;
}

export class LiveFabricSimulationHarness {
  public readonly kernel: LiveSessionKernel;
  public readonly media: SessionMediaGraph;
  public readonly frames: LiveFrameGraph;
  public readonly composer: SurfaceComposer;
  public readonly director: AdaptivePresentationDirector;
  public readonly audio: LiveAudioDirector;
  public readonly recovery: LiveRecoveryDirector;
  public readonly device: DeviceCapabilityDirector;
  public readonly distribution: DistributionDirector;
  public readonly experienceType: CanonicalExperienceType;

  constructor(opts: SimHarnessOptions) {
    this.experienceType = opts.experienceType;
    const experience = getExperiencePresentationContract(opts.experienceType);

    this.kernel = new LiveSessionKernel({
      roomId: opts.roomId,
      hostUserId: opts.host.userId,
      hostRole: opts.host.role === "FAN" ? "fan" : opts.host.role === "ADMIN" ? "admin" : "performer",
      experienceType: opts.experienceType,
      hostSuccessionPolicy: experience.hostSuccessionPolicy,
      hostGracePeriodMs: experience.hostGracePeriodMs,
    });

    const sessionId = this.kernel.getSessionId();
    const gen = this.kernel.getGeneration();

    this.media = new SessionMediaGraph(sessionId, gen);
    this.frames = new LiveFrameGraph(sessionId, gen);
    this.composer = new SurfaceComposer(sessionId, this.frames, gen);
    this.director = new AdaptivePresentationDirector(
      sessionId,
      gen,
      this.composer,
      this.frames,
      experience
    );
    this.audio = new LiveAudioDirector(sessionId, gen);
    this.recovery = new LiveRecoveryDirector(sessionId, gen);
    this.device = new DeviceCapabilityDirector({ gpuTier: opts.deviceTier ?? "MEDIUM" });
    this.distribution = new DistributionDirector(sessionId, gen);

    for (const g of opts.guests ?? []) {
      this.kernel.addParticipant({
        userId: g.userId,
        role: g.role === "FAN" ? "fan" : "guest",
        displayName: g.displayName,
        joinedAtMs: Date.now(),
      });
    }
  }

  /** Drive IDLE → … → LIVE with host camera (rights-open). */
  public goLiveHappyPath(): SimHarnessSnapshot {
    this.kernel.transitionTo("PREFLIGHT");
    this.kernel.transitionTo("READY");
    this.kernel.transitionTo("CONNECTING");

    const cam = this.media.register({
      sourceId: "src-host-cam",
      ownerId: this.kernel.getSnapshot().hostUserId,
      ownerRole: "performer",
      mediaKind: "CAMERA",
      rightsPolicy: { ...DEFAULT_PUBLIC_SOURCE_RIGHTS },
      privacyPolicy: { ...DEFAULT_PUBLIC_PRIVACY },
      videoPolicy: { hasVideo: true, width: 1280, height: 720, fps: 30, bitrateKbps: 2500, aspectRatio: "16:9" },
      audioPolicy: { hasAudio: true, channels: 1, sampleRate: 48000, isMuted: false, gain: 1, priority: 10, echoCancellation: true, noiseSuppression: true },
    });
    this.media.updateHealth(cam.sourceId, "HEALTHY");
    this.media.assertPublishable(cam.sourceId);

    this.kernel.transitionTo("PUBLISHING");

    const plan = this.director.buildPlan({
      toLayout: getExperiencePresentationContract(this.experienceType).defaultLayout,
      frameAssignments: { PRIMARY: cam.sourceId, SELF: cam.sourceId },
      reason: "goLiveHappyPath",
      mediaClockMs: this.kernel.getClock().now(),
      reducedMotion: false,
      targetBus: "PREVIEW",
      takeAfterCommit: true,
    });
    const result = this.composer.executePlan(plan);
    if (!result.success) {
      throw new Error(`compose failed: ${result.error}`);
    }

    this.audio.ensureChannel("ch-host", "MIC", cam.sourceId);
    this.audio.commitFocus({
      transactionId: `af-${Date.now()}`,
      sessionId: this.kernel.getSessionId(),
      generation: this.kernel.getGeneration(),
      expectedRevision: this.audio.getRevision(),
      primaryOwnerSourceId: cam.sourceId,
      duckTargets: [],
      duckLevelDb: -12,
      programAudibleSourceIds: [cam.sourceId],
      monitorAudibleSourceIds: [cam.sourceId],
      issuedAtMs: Date.now(),
    });

    this.kernel.setPresentationHints({
      activeSources: [cam.sourceId],
      programFrames: { PRIMARY: cam.sourceId },
      currentLayout: this.composer.getLayout(),
      activeAudioFocus: cam.sourceId,
    });

    this.kernel.transitionTo("LIVE");
    return this.snapshot();
  }

  public snapshot(): SimHarnessSnapshot {
    const s = this.kernel.getSnapshot();
    return {
      sessionId: s.sessionId,
      state: s.state,
      generation: s.generation,
      revision: s.revision,
      mediaClockMs: s.mediaClockMs,
      sourceCount: this.media.list().length,
      layout: this.composer.getLayout(),
      incidents: this.recovery.listIncidents().length,
      programPrimary: this.frames.getAssignment("PROGRAM", "PRIMARY").sourceId,
    };
  }

  public assertCapability(role: AccountCapabilityRole, key: Parameters<typeof LiveCapabilityPolicy.assert>[1]): void {
    LiveCapabilityPolicy.assert(role, key);
  }
}
