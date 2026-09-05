/**
 * ChallengeCinematicProfile.ts
 *
 * TMI Autonomous Cinematic & Generative Broadcast Runtime (ACGBR)
 * Experience Cinematic Profile for Challenge Arena
 *
 * Laws:
 * 1. ONE-WAY AUTHORITY: ACGBR may read session truth, but NEVER writes back winner, score, stake, or settlement.
 * 2. OBJECTIVE CENTER OF GRAVITY: Visuals anchor to the objective contract, not generic Battle VS collision.
 * 3. DETERMINISTIC REPRODUCIBILITY: sceneSeed = hash(sessionId + sceneSequence + revision) guarantees sync.
 * 4. PRESENTATION CAPABILITY RESOLVER: Premium hardware enhances presentation without breaking baseline functionality.
 * 5. ACCESSIBILITY & DEVICE SCALING: FULL (cinematic), FAST, ACCESSIBLE (reduced motion), LOW_DEVICE.
 */

import {
  ChallengeLifecyclePhase,
  ChallengeJudgmentPolicy,
  AuthoritativeObjectiveContract,
  ChallengeResult,
} from './ChallengeOperationalLifecycle';
import type { DisplayHardwareType } from '../jumbotron/JumbotronHardwareChassisCatalog';

/** Local alias — catalog exports DisplayHardwareType (not JumbotronHardwareChassisType). */
export type JumbotronHardwareChassisType = DisplayHardwareType;
export type ChallengeSceneToken =
  | 'PRE_EVENT'
  | 'TEASER'
  | 'CHALLENGER_ARRIVAL'
  | 'CHALLENGED_ARRIVAL'
  | 'OBJECTIVE_CONTRACT_ASSEMBLE'
  | 'CHALLENGE_ACCEPTED'
  | 'RULES_STAKES_REVEAL'
  | 'JUDGMENT_METHOD_DISPLAY'
  | 'ATTEMPT_COUNTDOWN'
  | 'ACTIVE_ATTEMPT'
  | 'AUTHORIZED_JUDGMENT'
  | 'REAL_RESULT'
  | 'SETTLEMENT'
  | 'OUTRO';

export interface ChallengeDialogueFacts {
  challengerDisplayName: string;
  challengedDisplayName: string;
  objective: string;
  category: string;
  attemptNumber: number;
  timeRemainingSec: number;
  judgmentPolicy: ChallengeJudgmentPolicy;
  resultStatus?: string;
  winnerDisplayName?: string;
  stakeDisplay?: string;
  sponsorDisplayName?: string;
}

export interface AvailableWorldCapabilities {
  fourFaces: boolean;
  lowerRing: boolean;
  underbelly: boolean;
  kineticPanels: boolean;
  volumetrics: boolean;
  avatarAudience: boolean;
  reducedMotion: boolean;
  maxLOD: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface ChallengeCinematicScene {
  sceneId: string;
  sequence: number;
  token: ChallengeSceneToken;
  phase: ChallengeLifecyclePhase;
  seed: string;
  cameraAnchor: string;
  lightingProfile: {
    ambientColor: string;
    keyColor: string;
    accentColor: string;
    intensity: number;
  };
  jumbotronMapping: {
    NORTH: string;
    SOUTH: string;
    EAST: string;
    WEST: string;
  };
  dialogueFacts: ChallengeDialogueFacts;
  durationMs: number;
  isAccessible: boolean;
}

export class PresentationCapabilityResolver {
  public static resolve(
    chassisType: JumbotronHardwareChassisType,
    deviceTier: 'HIGH' | 'NORMAL' | 'MOBILE' | 'LOW_DEVICE',
    reducedMotion = false
  ): AvailableWorldCapabilities {
    const isArenaPro = chassisType === 'ARENA_PRO_HYBRID';
    const isBlimp = chassisType === 'BLIMP_DISPLAY';

    return {
      fourFaces: chassisType !== 'MEGA_WALL',
      lowerRing: isArenaPro,
      underbelly: isArenaPro || isBlimp,
      kineticPanels: deviceTier === 'HIGH' && !reducedMotion,
      volumetrics: deviceTier === 'HIGH' && !reducedMotion,
      avatarAudience: deviceTier !== 'LOW_DEVICE',
      reducedMotion,
      maxLOD: deviceTier === 'HIGH' ? 'HIGH' : deviceTier === 'LOW_DEVICE' ? 'LOW' : 'MEDIUM',
    };
  }
}

export class ChallengeCinematicProfile {
  public readonly sessionId: string;
  public readonly experienceType = 'CHALLENGE_ARENA';
  private sequenceCounter = 0;
  private revision = 1;
  private recentCameraAnchors: string[] = [];
  private capabilities: AvailableWorldCapabilities;

  constructor(
    sessionId: string,
    chassisType: JumbotronHardwareChassisType = 'ARENA_PRO_HYBRID',
    deviceTier: 'HIGH' | 'NORMAL' | 'MOBILE' | 'LOW_DEVICE' = 'NORMAL',
    reducedMotion = false
  ) {
    this.sessionId = sessionId;
    this.capabilities = PresentationCapabilityResolver.resolve(chassisType, deviceTier, reducedMotion);
  }

  /**
   * Generates deterministic seed for multi-viewer synchronization
   */
  public generateDeterministicSeed(seq: number): string {
    const raw = `${this.sessionId}:${seq}:${this.revision}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = (hash << 5) - hash + raw.charCodeAt(i);
      hash |= 0;
    }
    return `seed_ch_${Math.abs(hash).toString(16)}`;
  }

  /**
   * Resolves the cinematic scene for a given phase and contract truth
   */
  public resolveScene(
    phase: ChallengeLifecyclePhase,
    contract: AuthoritativeObjectiveContract,
    challengerName: string,
    challengedName: string,
    currentAttempt = 1,
    timeRemaining = 60,
    result?: ChallengeResult | null
  ): ChallengeCinematicScene {
    this.sequenceCounter++;
    const seq = this.sequenceCounter;
    const seed = this.generateDeterministicSeed(seq);

    // Map lifecycle phase to canonical ACGBR Scene Token
    let token: ChallengeSceneToken = 'ACTIVE_ATTEMPT';
    let cameraAnchor = 'STAGE_CENTER';
    let durationMs = 5000;

    switch (phase) {
      case 'READY':
        token = 'PRE_EVENT';
        cameraAnchor = 'ARENA_FLYOVER';
        durationMs = 4000;
        break;
      case 'CHALLENGER_ARRIVAL':
      case 'CHALLENGER_IDENTITY_LOCK':
        token = 'CHALLENGER_ARRIVAL';
        cameraAnchor = 'PERFORMER_ENTRY_A';
        durationMs = 5000;
        break;
      case 'CHALLENGED_ARRIVAL':
      case 'CHALLENGED_IDENTITY_LOCK':
        token = 'CHALLENGED_ARRIVAL';
        cameraAnchor = 'PERFORMER_ENTRY_B';
        durationMs = 5000;
        break;
      case 'OBJECTIVE_CONTRACT_ASSEMBLY':
        token = 'OBJECTIVE_CONTRACT_ASSEMBLE';
        cameraAnchor = 'OBJECTIVE_CONTRACT_CENTER';
        durationMs = 6000;
        break;
      case 'RULES_LOCK':
        token = 'RULES_STAKES_REVEAL';
        cameraAnchor = 'OBJECTIVE_CONTRACT_CENTER';
        durationMs = 4000;
        break;
      case 'JUDGMENT_POLICY_LOCK':
        token = 'JUDGMENT_METHOD_DISPLAY';
        cameraAnchor = 'JUMBOTRON_CLOSE';
        durationMs = 4000;
        break;
      case 'ATTEMPT_1_COUNTDOWN':
      case 'ATTEMPT_2_COUNTDOWN':
        token = 'ATTEMPT_COUNTDOWN';
        cameraAnchor = currentAttempt === 1 ? 'PERFORMER_ENTRY_A' : 'PERFORMER_ENTRY_B';
        durationMs = 3000;
        break;
      case 'ATTEMPT_1_ACTIVE':
      case 'ATTEMPT_2_ACTIVE':
        token = 'ACTIVE_ATTEMPT';
        cameraAnchor = 'STAGE_CENTER';
        durationMs = contract.timeLimitSec * 1000;
        break;
      case 'JUDGMENT_OPEN':
        token = 'AUTHORIZED_JUDGMENT';
        cameraAnchor = 'AUDIENCE_WIDE';
        durationMs = 8000;
        break;
      case 'RESULT_FINALIZED':
        token = 'REAL_RESULT';
        cameraAnchor = 'STAGE_CENTER';
        durationMs = 7000;
        break;
      case 'SETTLEMENT':
        token = 'SETTLEMENT';
        cameraAnchor = 'JUMBOTRON_CLOSE';
        durationMs = 5000;
        break;
      case 'COMPLETE':
      default:
        token = 'OUTRO';
        cameraAnchor = 'ARENA_FLYOVER';
        durationMs = 6000;
        break;
    }

    // Accessible camera lock
    if (this.capabilities.reducedMotion) {
      cameraAnchor = 'STAGE_CENTER';
    }

    // Track camera anchor memory to prevent repeat cuts
    this.recentCameraAnchors.push(cameraAnchor);
    if (this.recentCameraAnchors.length > 5) {
      this.recentCameraAnchors.shift();
    }

    // Dialogue facts envelope (read-only facts, no hallucinated additions)
    const dialogueFacts: ChallengeDialogueFacts = {
      challengerDisplayName: challengerName,
      challengedDisplayName: challengedName,
      objective: contract.objective,
      category: contract.category,
      attemptNumber: currentAttempt,
      timeRemainingSec: timeRemaining,
      judgmentPolicy: contract.judgingPolicy,
      resultStatus: result?.settlementStatus,
      winnerDisplayName: result?.winnerId
        ? result.authoritativeResult.summaryText.includes(challengerName)
          ? challengerName
          : result.authoritativeResult.summaryText.includes(challengedName)
            ? challengedName
            : undefined
        : undefined,
      stakeDisplay: contract.realStakeOrReward !== 'NONE' ? contract.realStakeOrReward : undefined,
    };

    // Jumbotron multi-face mapping
    const jumbotronMapping = {
      NORTH: phase === 'ATTEMPT_1_ACTIVE' || phase === 'ATTEMPT_2_ACTIVE' ? 'LIVE_ATTEMPT_FEED' : 'OBJECTIVE_TITLE',
      SOUTH: 'OBJECTIVE_CONTRACT_RULES',
      EAST: 'SPONSOR_DIRECT_CAMPAIGN',
      WEST: 'AUDIENCE_REACTION_TELEMETRY',
    };

    return {
      sceneId: `scene_${seq}_${token.toLowerCase()}`,
      sequence: seq,
      token,
      phase,
      seed,
      cameraAnchor,
      lightingProfile: {
        ambientColor: '#050510',
        keyColor: '#FFD700', // Gold objective centerpiece
        accentColor: '#00FFFF', // Cyber cyan
        intensity: this.capabilities.volumetrics ? 1.0 : 0.7,
      },
      jumbotronMapping,
      dialogueFacts,
      durationMs,
      isAccessible: this.capabilities.reducedMotion,
    };
  }

  public getCapabilities(): AvailableWorldCapabilities {
    return { ...this.capabilities };
  }
}
