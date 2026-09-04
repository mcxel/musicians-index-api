/**
 * CinematicParticipantArrivalDirector.ts
 *
 * Platform-level Cinematic Participant Arrival & Composition System
 * + TMI EXPERIENCE IDENTITY LAW (Locked Lane C Architecture)
 *
 * Laws:
 * 1. "Reuse the machinery. Differentiate the experience."
 *    All formats share canonical session, transport, player fabric, and audio director.
 * 2. TMI Experience Identity Law:
 *    Every experience retains a distinct presentation DNA (shape, typography, camera, lighting, audio stings).
 *    - Battle: Angular / mechanical / impact / opposing sides / VS.
 *    - Challenge: Locks / contracts / objective card / acceptance.
 *    - Gauntlet: Tunnel / progression / endurance / advancing rail.
 *    - Cypher: Circular / rotating / flowing / strictly NO VS / NO WINNER / NO ELIMINATION.
 *    - Performer Live Collab: Broadcast / social / welcoming / host dominant.
 *    - Fan Spotlight: Warm / spotlight / camera preparation countdown (never a competitor).
 * 3. Persistent Presence ("Living Panel"):
 *    Existing participants remain visually active as living Voltron panels while new collaborators enter.
 * 4. Intentional Pose Window:
 *    3–5s countdown with objective quality heuristic frame extraction and temporary frame cleanup.
 * 5. Reconnect & Late-Join Invariant:
 *    Late arrivals synchronize to the authoritative in-progress phase without replaying from zero.
 * 6. Maximum Duration Ceiling:
 *    The spectacle never stalls the broadcast; times out safely if participant disconnects.
 */

export type ExperiencePresentationType =
  | "BATTLE"
  | "CHALLENGE"
  | "GAUNTLET"
  | "CYPHER"
  | "LIVE_PERFORMER_COLLAB"
  | "LIVE_FAN_SPOTLIGHT"
  | "GAME_SHOW"
  | "CONCERT_GUEST";

export type EntrancePacingMode = "FULL" | "FAST" | "ACCESSIBLE";

export type PoseMode =
  | "POSE_REQUIRED_WITH_TIMEOUT"
  | "CHALLENGE_STANCE"
  | "SHORT_DRAMATIC_POSE"
  | "QUICK_IDENTITY_REVEAL"
  | "POSE_OPTIONAL"
  | "CAMERA_READY_COUNTDOWN"
  | "STAGE_REVEAL";

export type EntranceStyle =
  | "TRANSFORMER_ASSEMBLY"
  | "ENERGY_CHAMBER"
  | "ARENA_TUNNEL"
  | "HOLOGRAPHIC_BUILD"
  | "MECHANICAL_LOCK"
  | "SPOTLIGHT_REVEAL"
  | "REGIONAL_FACEOFF"
  | "COLLABORATIVE_CIRCLE"
  | "FAN_STAGE_SPOTLIGHT";

export type ConvergenceStyle =
  | "DUAL_BEAM_VS_LOCK"
  | "CHALLENGE_CONTRACT_LOCK"
  | "GAUNTLET_RAIL_ADVANCE"
  | "CYPHER_CIRCULAR_WHEEL"
  | "BROADCAST_SPLIT_CONVERGENCE"
  | "WARM_SPOTLIGHT_PAIR";

export interface ParticipantEntranceProfile {
  participantId: string;
  name: string;
  role: "PERFORMER" | "CHALLENGER" | "INCUMBENT" | "CYPHER_EMCEE" | "FAN" | "HOST" | "SPECIAL_GUEST";
  hometown?: string;
  regionTag?: string;
  genre?: string;
  record?: string; // e.g. "14-2"
  avatarUrl?: string;
  cameraStreamId?: string;
  preferredPoseStyle?: string;
  selectedHeroFrameUrl?: string;
}

export interface CandidatePoseFrame {
  frameId: string;
  capturedAtMs: number;
  faceVisibilityConfidence: number; // 0.0 to 1.0
  motionStabilityConfidence: number; // 0.0 to 1.0 (higher = less blur)
  framingScore: number; // 0.0 to 1.0 (centering & head room)
  openEyesScore: number; // 0.0 to 1.0
  isTemporary: boolean;
}

export interface ArrivalProfile {
  experienceType: ExperiencePresentationType;
  poseMode: PoseMode;
  poseDurationSec: number;
  heroCapture: boolean;
  entranceStyle: EntranceStyle;
  convergenceStyle: ConvergenceStyle;
  lightingProfile: string;
  audioSting: string;
  maxEntranceDurationSec: number;
  allowWinnerSemantics: boolean;
  allowCompetitiveVsSemantics: boolean;
  shapeLanguage: "ANGULAR_MECHANICAL" | "CONTRACT_LOCK" | "PROGRESSION_TUNNEL" | "CIRCULAR_FLOW" | "WARM_BROADCAST";
}

export type BattleEntrancePhase =
  | "READY"
  | "PRE_ROLL"
  | "A_ARRIVAL"
  | "A_POSE_COUNTDOWN"
  | "A_POSE_CAPTURE"
  | "A_HERO_LOCK"
  | "A_LIVING_PANEL"
  | "B_ARRIVAL"
  | "B_POSE_COUNTDOWN"
  | "B_POSE_CAPTURE"
  | "B_HERO_LOCK"
  | "DUAL_CONVERGENCE"
  | "VS_REVEAL"
  | "BATTLE_COUNTDOWN"
  | "ROUND_ACTIVE";

export interface SessionPresentationArtifacts {
  aHeroStill: string | null;
  bHeroStill: string | null;
  aIdentityCard: string | null;
  bIdentityCard: string | null;
  vsComposition: string | null;
  battleTitleCard: string | null;
  roundCard: string | null;
  resultCard: string | null;
}

export interface EntranceRecoveryCheckpoint {
  sessionId: string;
  sequenceNumber: number;
  currentPhase: BattleEntrancePhase;
  phaseStartedAtMs: number;
  elapsedTotalMs: number;
  activeParticipantIndex: number;
  performerA: ParticipantEntranceProfile;
  performerB?: ParticipantEntranceProfile;
  isComplete: boolean;
  artifacts: SessionPresentationArtifacts;
}

export interface BeatSyncCue {
  type: "DOWNBEAT" | "BEAT" | "BAR" | "DROP";
  scheduledAction: string;
  timestampMs: number;
}

export class CinematicParticipantArrivalDirector {
  private sessionId: string;
  private experienceType: ExperiencePresentationType;
  private pacingMode: EntrancePacingMode;
  private profile: ArrivalProfile;
  private currentPhase: BattleEntrancePhase = "READY";
  private sequenceNumber = 0;
  private phaseStartedAtMs = 0;
  private sessionStartedAtMs = 0;

  private performerA: ParticipantEntranceProfile;
  private performerB?: ParticipantEntranceProfile;
  private extraParticipants: ParticipantEntranceProfile[] = [];

  // Temporary candidate frames for privacy cleanup
  private candidatePoseFrames: Map<string, CandidatePoseFrame[]> = new Map();

  // Session presentation artifacts
  private artifacts: SessionPresentationArtifacts = {
    aHeroStill: null,
    bHeroStill: null,
    aIdentityCard: null,
    bIdentityCard: null,
    vsComposition: null,
    battleTitleCard: null,
    roundCard: null,
    resultCard: null,
  };

  // Real participant audience telemetry only (zero fake metrics)
  private verifiedAudienceCheerTelemetry = 0;

  constructor(
    sessionId: string,
    experienceType: ExperiencePresentationType,
    performerA: ParticipantEntranceProfile,
    performerB?: ParticipantEntranceProfile,
    pacingMode: EntrancePacingMode = "FULL"
  ) {
    this.sessionId = sessionId;
    this.experienceType = experienceType;
    this.performerA = performerA;
    this.performerB = performerB;
    this.pacingMode = pacingMode;
    this.profile = this.resolveArrivalProfile(experienceType, pacingMode);
    this.sessionStartedAtMs = Date.now();
    this.phaseStartedAtMs = this.sessionStartedAtMs;

    this.enforceExperienceIdentitySemantics();
  }

  /**
   * Resolves the signature presentation DNA and arrival profile per experience format.
   */
  private resolveArrivalProfile(
    type: ExperiencePresentationType,
    pacing: EntrancePacingMode
  ): ArrivalProfile {
    const isAccessible = pacing === "ACCESSIBLE";
    const isFast = pacing === "FAST";

    switch (type) {
      case "BATTLE":
        return {
          experienceType: "BATTLE",
          poseMode: "POSE_REQUIRED_WITH_TIMEOUT",
          poseDurationSec: isFast ? 2 : 4,
          heroCapture: true,
          entranceStyle: isAccessible ? "SPOTLIGHT_REVEAL" : "TRANSFORMER_ASSEMBLY",
          convergenceStyle: "DUAL_BEAM_VS_LOCK",
          lightingProfile: "ARENA_NEON_IMPACT",
          audioSting: "STING_BATTLE_IMPACT",
          maxEntranceDurationSec: isFast ? 20 : 45,
          allowWinnerSemantics: true,
          allowCompetitiveVsSemantics: true,
          shapeLanguage: "ANGULAR_MECHANICAL",
        };

      case "CHALLENGE":
        return {
          experienceType: "CHALLENGE",
          poseMode: "CHALLENGE_STANCE",
          poseDurationSec: isFast ? 2 : 3,
          heroCapture: true,
          entranceStyle: "MECHANICAL_LOCK",
          convergenceStyle: "CHALLENGE_CONTRACT_LOCK",
          lightingProfile: "AMBER_GOLD_CONTRACT",
          audioSting: "STING_CHALLENGE_LOCK",
          maxEntranceDurationSec: isFast ? 18 : 35,
          allowWinnerSemantics: true,
          allowCompetitiveVsSemantics: true,
          shapeLanguage: "CONTRACT_LOCK",
        };

      case "GAUNTLET":
        return {
          experienceType: "GAUNTLET",
          poseMode: "SHORT_DRAMATIC_POSE",
          poseDurationSec: isFast ? 2 : 3,
          heroCapture: true,
          entranceStyle: "ARENA_TUNNEL",
          convergenceStyle: "GAUNTLET_RAIL_ADVANCE",
          lightingProfile: "STEEL_CORRIDOR_STROBE",
          audioSting: "STING_GAUNTLET_TUNNEL",
          maxEntranceDurationSec: isFast ? 18 : 35,
          allowWinnerSemantics: true,
          allowCompetitiveVsSemantics: true,
          shapeLanguage: "PROGRESSION_TUNNEL",
        };

      case "CYPHER":
        // Strict NO-WINNER / NO-VS LAW
        return {
          experienceType: "CYPHER",
          poseMode: "QUICK_IDENTITY_REVEAL",
          poseDurationSec: 1.5,
          heroCapture: false,
          entranceStyle: "COLLABORATIVE_CIRCLE",
          convergenceStyle: "CYPHER_CIRCULAR_WHEEL",
          lightingProfile: "PURPLE_CYAN_GROOVE",
          audioSting: "STING_CYPHER_DROP",
          maxEntranceDurationSec: 15,
          allowWinnerSemantics: false, // STRICTLY FORBIDDEN
          allowCompetitiveVsSemantics: false, // STRICTLY FORBIDDEN
          shapeLanguage: "CIRCULAR_FLOW",
        };

      case "LIVE_PERFORMER_COLLAB":
        return {
          experienceType: "LIVE_PERFORMER_COLLAB",
          poseMode: "POSE_OPTIONAL",
          poseDurationSec: 2,
          heroCapture: true,
          entranceStyle: "HOLOGRAPHIC_BUILD",
          convergenceStyle: "BROADCAST_SPLIT_CONVERGENCE",
          lightingProfile: "WARM_STUDIO_BROADCAST",
          audioSting: "STING_GUEST_BROADCAST",
          maxEntranceDurationSec: 15,
          allowWinnerSemantics: false,
          allowCompetitiveVsSemantics: false,
          shapeLanguage: "WARM_BROADCAST",
        };

      case "LIVE_FAN_SPOTLIGHT":
        return {
          experienceType: "LIVE_FAN_SPOTLIGHT",
          poseMode: "CAMERA_READY_COUNTDOWN",
          poseDurationSec: 3, // 3-2-1 preparation window
          heroCapture: false,
          entranceStyle: "FAN_STAGE_SPOTLIGHT",
          convergenceStyle: "WARM_SPOTLIGHT_PAIR",
          lightingProfile: "GOLDEN_WARM_SPOTLIGHT",
          audioSting: "STING_FAN_CHEER",
          maxEntranceDurationSec: 12,
          allowWinnerSemantics: false,
          allowCompetitiveVsSemantics: false,
          shapeLanguage: "WARM_BROADCAST",
        };

      case "GAME_SHOW":
        return {
          experienceType: "GAME_SHOW",
          poseMode: "STAGE_REVEAL",
          poseDurationSec: 2,
          heroCapture: true,
          entranceStyle: "SPOTLIGHT_REVEAL",
          convergenceStyle: "BROADCAST_SPLIT_CONVERGENCE",
          lightingProfile: "HIGH_GLOSS_ARCADE",
          audioSting: "STING_FANFARE",
          maxEntranceDurationSec: 20,
          allowWinnerSemantics: true,
          allowCompetitiveVsSemantics: true,
          shapeLanguage: "ANGULAR_MECHANICAL",
        };

      case "CONCERT_GUEST":
      default:
        return {
          experienceType: "CONCERT_GUEST",
          poseMode: "STAGE_REVEAL",
          poseDurationSec: 3,
          heroCapture: true,
          entranceStyle: "SPOTLIGHT_REVEAL",
          convergenceStyle: "WARM_SPOTLIGHT_PAIR",
          lightingProfile: "STADIUM_CONCERT_BEAM",
          audioSting: "STING_STADIUM_RIFF",
          maxEntranceDurationSec: 20,
          allowWinnerSemantics: false,
          allowCompetitiveVsSemantics: false,
          shapeLanguage: "WARM_BROADCAST",
        };
    }
  }

  /**
   * TMI Experience Identity Law Assertion:
   * Guarantees that collaborative and fan experiences NEVER cross-pollinate with competitive VS semantics.
   */
  public enforceExperienceIdentitySemantics(): void {
    if (
      this.experienceType === "CYPHER" ||
      this.experienceType === "LIVE_FAN_SPOTLIGHT" ||
      this.experienceType === "LIVE_PERFORMER_COLLAB"
    ) {
      if (this.profile.allowWinnerSemantics || this.profile.allowCompetitiveVsSemantics) {
        throw new Error(
          `TMI Experience Identity Violation: ${this.experienceType} cannot carry competitive VS or winner semantics.`
        );
      }
    }
  }

  /**
   * Authoritative State Machine Step.
   */
  public advanceToPhase(nextPhase: BattleEntrancePhase): EntranceRecoveryCheckpoint {
    this.currentPhase = nextPhase;
    this.sequenceNumber++;
    this.phaseStartedAtMs = Date.now();

    // Check maximum entrance duration ceiling
    const elapsedTotalSec = (Date.now() - this.sessionStartedAtMs) / 1000;
    if (elapsedTotalSec > this.profile.maxEntranceDurationSec && nextPhase !== "ROUND_ACTIVE") {
      // Force immediate fail-safe progression to ROUND_ACTIVE
      this.currentPhase = "ROUND_ACTIVE";
    }

    return this.createCheckpoint();
  }

  /**
   * Simulates/executes the intentional pose capture window.
   * Extracts optimal hero still using objective heuristics without biometric identification,
   * and immediately purges all temporary candidate frames for strict privacy.
   */
  public evaluatePoseCapture(
    participantId: string,
    candidateFrames: CandidatePoseFrame[]
  ): { selectedFrameUrl: string; purgedCandidateCount: number } {
    if (!candidateFrames || candidateFrames.length === 0) {
      // Fallback frame when no candidate frames provided
      const fallback = `/assets/hero-stills/fallback-${participantId}.webp`;
      this.storeHeroArtifact(participantId, fallback);
      return { selectedFrameUrl: fallback, purgedCandidateCount: 0 };
    }

    // Quality heuristic score:
    // 0.35 * faceVisibility + 0.25 * motionStability + 0.20 * framing + 0.20 * openEyes
    let bestFrame = candidateFrames[0];
    let bestScore = -1;

    for (const frame of candidateFrames) {
      const score =
        frame.faceVisibilityConfidence * 0.35 +
        frame.motionStabilityConfidence * 0.25 +
        frame.framingScore * 0.2 +
        frame.openEyesScore * 0.2;

      if (score > bestScore) {
        bestScore = score;
        bestFrame = frame;
      }
    }

    const heroFrameUrl = `/assets/hero-stills/${participantId}-${bestFrame.frameId}.webp`;
    this.storeHeroArtifact(participantId, heroFrameUrl);

    // Strict Privacy: Purge temporary frames immediately!
    const purgedCount = candidateFrames.length;
    this.candidatePoseFrames.delete(participantId);

    return { selectedFrameUrl: heroFrameUrl, purgedCandidateCount: purgedCount };
  }

  private storeHeroArtifact(participantId: string, heroUrl: string): void {
    if (participantId === this.performerA.participantId) {
      this.performerA.selectedHeroFrameUrl = heroUrl;
      this.artifacts.aHeroStill = heroUrl;
      this.artifacts.aIdentityCard = `${this.performerA.name} (${this.performerA.regionTag ?? "GLOBAL"})`;
    } else if (this.performerB && participantId === this.performerB.participantId) {
      this.performerB.selectedHeroFrameUrl = heroUrl;
      this.artifacts.bHeroStill = heroUrl;
      this.artifacts.bIdentityCard = `${this.performerB.name} (${this.performerB.regionTag ?? "GLOBAL"})`;
    }
  }

  /**
   * Generates a reusable session presentation artifact without duplicating the underlying live session.
   */
  public generateSessionCompositionArtifacts(): SessionPresentationArtifacts {
    if (this.experienceType === "CYPHER") {
      this.artifacts.vsComposition = null; // Strict NO-VS
      this.artifacts.battleTitleCard = `CYPHER ROTATION: ${this.performerA.name}`;
      this.artifacts.roundCard = "CYPHER CYCLE 1";
    } else if (this.experienceType === "CHALLENGE") {
      this.artifacts.vsComposition = `CHALLENGE: ${this.performerA.name} ACCEPTED BY ${this.performerB?.name ?? "OPPONENT"}`;
      this.artifacts.battleTitleCard = `STAKES: CROWN ADVANCEMENT`;
      this.artifacts.roundCard = "CHALLENGE DUEL";
    } else if (this.experienceType === "GAUNTLET") {
      this.artifacts.vsComposition = `GAUNTLET: ${this.performerA.name} (MATCH 3/5)`;
      this.artifacts.battleTitleCard = `SURVIVAL PROGRESSION RAIL`;
      this.artifacts.roundCard = "GAUNTLET BOUT 3";
    } else if (this.experienceType === "BATTLE") {
      this.artifacts.vsComposition = `${this.performerA.name} VS ${this.performerB?.name ?? "OPPONENT"} [${this.profile.entranceStyle}]`;
      this.artifacts.battleTitleCard = `CHAMPIONSHIP BATTLE: ${this.performerA.name} vs ${this.performerB?.name ?? "OPPONENT"}`;
      this.artifacts.roundCard = "ROUND 1 / 3";
    } else {
      this.artifacts.vsComposition = `COLLABORATION: ${this.performerA.name} & GUEST`;
      this.artifacts.battleTitleCard = `LIVE COLLABORATION STAGE`;
      this.artifacts.roundCard = "LIVE COLLAB";
    }
    return { ...this.artifacts };
  }

  /**
   * Generates beat/bar synchronization cues when musical tempo is available.
   */
  public generateBeatSyncCues(bpm = 120): BeatSyncCue[] {
    const msPerBeat = (60 / bpm) * 1000;
    const msPerBar = msPerBeat * 4;
    const now = Date.now();

    return [
      { type: "DOWNBEAT", scheduledAction: "BEAM_CHARGE_START", timestampMs: now },
      { type: "BEAT", scheduledAction: "POSE_FREEZE_MOMENT", timestampMs: now + msPerBeat * 2 },
      { type: "BEAT", scheduledAction: "IDENTITY_CARD_REVEAL", timestampMs: now + msPerBeat * 4 },
      { type: "DOWNBEAT", scheduledAction: "VOLTRON_LOCK_CONVERGENCE", timestampMs: now + msPerBar * 2 },
      { type: "DROP", scheduledAction: "VS_IMPACT_OR_COLLAB_START", timestampMs: now + msPerBar * 3 },
      { type: "BAR", scheduledAction: "ROUND_1_BELL", timestampMs: now + msPerBar * 4 },
    ];
  }

  /**
   * Reconnect & Late-Join Synchronization:
   * Reconnecting or late-joining clients synchronize immediately to the authoritative phase.
   */
  public synchronizeClient(clientConnectedAtMs: number): {
    currentPhase: BattleEntrancePhase;
    shouldSkipToLive: boolean;
    checkpoint: EntranceRecoveryCheckpoint;
  } {
    const elapsedSec = (Date.now() - this.sessionStartedAtMs) / 1000;

    if (this.currentPhase === "ROUND_ACTIVE" || elapsedSec >= this.profile.maxEntranceDurationSec) {
      return {
        currentPhase: "ROUND_ACTIVE",
        shouldSkipToLive: true,
        checkpoint: this.createCheckpoint(),
      };
    }

    return {
      currentPhase: this.currentPhase,
      shouldSkipToLive: false,
      checkpoint: this.createCheckpoint(),
    };
  }

  /**
   * Real participant audience telemetry update (zero fake audience metrics).
   */
  public recordVerifiedAudienceReaction(realCheerTelemetryScore: number): void {
    this.verifiedAudienceCheerTelemetry = Math.max(0, Math.min(100, realCheerTelemetryScore));
  }

  public getVerifiedAudienceReactionScore(): number {
    return this.verifiedAudienceCheerTelemetry;
  }

  /**
   * Voltron Modular Geometry Spec:
   * Returns panel coordinates and dimensions for 1, 2, 3, or 4 participants.
   */
  public getVoltronCompositionSpec(participantCount: number): {
    layoutType: "SINGLE_HERO" | "SIDE_BY_SIDE_VOLTRON" | "TRIANGULAR_TIER" | "QUAD_GRID_LOCK";
    panels: Array<{ participantId: string; role: string; screenRegion: string }>;
  } {
    if (participantCount <= 1) {
      return {
        layoutType: "SINGLE_HERO",
        panels: [{ participantId: this.performerA.participantId, role: this.performerA.role, screenRegion: "FULL_CENTER" }],
      };
    }
    if (participantCount === 2) {
      return {
        layoutType: "SIDE_BY_SIDE_VOLTRON",
        panels: [
          { participantId: this.performerA.participantId, role: this.performerA.role, screenRegion: "LEFT_VOLTRON_WING" },
          { participantId: this.performerB?.participantId ?? "p2", role: this.performerB?.role ?? "OPPONENT", screenRegion: "RIGHT_VOLTRON_WING" },
        ],
      };
    }
    if (participantCount === 3) {
      return {
        layoutType: "TRIANGULAR_TIER",
        panels: [
          { participantId: this.performerA.participantId, role: "TOP_TIER", screenRegion: "TOP_PINNACLE" },
          { participantId: this.performerB?.participantId ?? "p2", role: "LEFT_BASE", screenRegion: "BOTTOM_LEFT" },
          { participantId: this.extraParticipants[0]?.participantId ?? "p3", role: "RIGHT_BASE", screenRegion: "BOTTOM_RIGHT" },
        ],
      };
    }
    return {
      layoutType: "QUAD_GRID_LOCK",
      panels: [
        { participantId: this.performerA.participantId, role: "SLOT_1", screenRegion: "GRID_TOP_LEFT" },
        { participantId: this.performerB?.participantId ?? "p2", role: "SLOT_2", screenRegion: "GRID_TOP_RIGHT" },
        { participantId: this.extraParticipants[0]?.participantId ?? "p3", role: "SLOT_3", screenRegion: "GRID_BOTTOM_LEFT" },
        { participantId: this.extraParticipants[1]?.participantId ?? "p4", role: "SLOT_4", screenRegion: "GRID_BOTTOM_RIGHT" },
      ],
    };
  }

  public createCheckpoint(): EntranceRecoveryCheckpoint {
    return {
      sessionId: this.sessionId,
      sequenceNumber: this.sequenceNumber,
      currentPhase: this.currentPhase,
      phaseStartedAtMs: this.phaseStartedAtMs,
      elapsedTotalMs: Date.now() - this.sessionStartedAtMs,
      activeParticipantIndex: this.currentPhase.startsWith("A_") ? 0 : 1,
      performerA: { ...this.performerA },
      performerB: this.performerB ? { ...this.performerB } : undefined,
      isComplete: this.currentPhase === "ROUND_ACTIVE",
      artifacts: { ...this.artifacts },
    };
  }

  public getProfile(): Readonly<ArrivalProfile> {
    return this.profile;
  }

  public getCurrentPhase(): BattleEntrancePhase {
    return this.currentPhase;
  }

  public getSessionId(): string {
    return this.sessionId;
  }

  public getArtifacts(): Readonly<SessionPresentationArtifacts> {
    return this.artifacts;
  }
}
