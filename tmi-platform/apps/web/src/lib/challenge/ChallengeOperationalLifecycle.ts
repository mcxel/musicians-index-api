/**
 * ChallengeOperationalLifecycle.ts
 *
 * Phase 5.3 Lane C: Canonical Challenge Operational Lifecycle Orchestrator
 *
 * Laws:
 * 1. ONE Authoritative Challenge Session owns truth (participants, objective, rules, attempts, judging, result, settlement).
 * 2. Center of gravity is the OBJECTIVE CONTRACT, not generic Battle VS confrontation.
 * 3. Challenge ≠ Battle (not opposing corner collision), Challenge ≠ Cypher (not winnerless rotation), Challenge ≠ Gauntlet (not progression rail).
 * 4. Distinct Judgment Policies: AUDIENCE_VOTE vs AUTHORIZED_JUDGES vs MEASURABLE_RESULT.
 * 5. Universal Media Player: non-dedicated slots, shared decoders, single PROGRAM audio authority.
 * 6. Reality Law: Real stakes only (or explicitly "NONE"), no fake scores/judges/settlements.
 */

import {
  ParticipantEntranceProfile,
  CinematicParticipantArrivalDirector,
  ExperiencePresentationType,
} from '../battle/CinematicParticipantArrivalDirector';
import {
  CanonicalUniversalPlayerFabric,
  CanonicalVisualSource,
} from '../media/CanonicalUniversalPlayerFabric';
import { AutomatedJumbotronDirector } from '../jumbotron/AutomatedJumbotronDirector';

export type ChallengeLifecyclePhase =
  | 'READY'
  | 'CHALLENGER_ARRIVAL'
  | 'CHALLENGER_IDENTITY_LOCK'
  | 'CHALLENGED_ARRIVAL'
  | 'CHALLENGED_IDENTITY_LOCK'
  | 'OBJECTIVE_CONTRACT_ASSEMBLY'
  | 'RULES_LOCK'
  | 'JUDGMENT_POLICY_LOCK'
  | 'ATTEMPT_1_COUNTDOWN'
  | 'ATTEMPT_1_ACTIVE'
  | 'ATTEMPT_1_COMPLETE'
  | 'ATTEMPT_2_COUNTDOWN'
  | 'ATTEMPT_2_ACTIVE'
  | 'ATTEMPT_2_COMPLETE'
  | 'JUDGMENT_OPEN'
  | 'RESULT_FINALIZED'
  | 'SETTLEMENT'
  | 'RESULT_PRESENTATION'
  | 'COMPLETE';

export type ChallengeJudgmentPolicy =
  | 'AUDIENCE_VOTE'
  | 'AUTHORIZED_JUDGES'
  | 'MEASURABLE_RESULT';

export type ChallengeBroadcastComposition =
  | 'DUAL'
  | 'CHALLENGER_DOMINANT'
  | 'CHALLENGED_DOMINANT'
  | 'ACTIVE_ATTEMPT'
  | 'REACTION_PIP'
  | 'OBJECTIVE_FOCUS'
  | 'TIMER_FOCUS'
  | 'JUDGMENT_FOCUS'
  | 'RESULT';

export interface AuthoritativeObjectiveContract {
  objectiveId: string;
  objective: string;
  category: string;
  timeLimitSec: number;
  attemptCount: number;
  judgingPolicy: ChallengeJudgmentPolicy;
  realStakeOrReward: string; // e.g. "$500 USD" or explicitly "NONE"
  qualificationRules: string[];
}

export type ChallengeOutcome =
  | 'WIN'
  | 'LOSS'
  | 'TIE'
  | 'COMPLETED'
  | 'VOID'
  | 'DISQUALIFIED';

export type ChallengeSettlementStatus =
  | 'PENDING'
  | 'SETTLED'
  | 'FAILED'
  | 'EXEMPT';

export interface ChallengeResult {
  challengeSessionId: string;
  outcome: ChallengeOutcome;
  winnerId: string | null;
  judgmentPolicy: ChallengeJudgmentPolicy;
  authoritativeResult: {
    challengerScore: number;
    challengedScore: number;
    metrics?: Record<string, any>;
    summaryText: string;
  };
  evidenceReference?: string;
  finalizedAt: number;
  settlementStatus: ChallengeSettlementStatus;
  settlementReference?: string;
  presentationPayload: {
    headline: string;
    badge: string;
    trophyType?: string;
    xpAwarded: number;
  };
}

export interface JudgeVerdictSubmission {
  judgeId: string;
  judgeName: string;
  challengerScore: number; // 0 to 100
  challengedScore: number; // 0 to 100
  feedbackNotes?: string;
  submittedAtMs: number;
  verifiedSignature: string;
}

export interface AudienceChallengeVote {
  voterId: string;
  targetParticipantId: string;
  voteWeight: number;
  submittedAtMs: number;
}

export interface ChallengeRecoveryCheckpoint {
  challengeSessionId: string;
  revision: number;
  timestampMs: number;
  phase: ChallengeLifecyclePhase;
  composition: ChallengeBroadcastComposition;
  participantIds: [string, string];
  objectiveId: string;
  judgmentPolicy: ChallengeJudgmentPolicy;
  hasResult: boolean;
}

export class ChallengeOperationalLifecycle {
  private challengeSessionId: string;
  private venueId: string;
  private phase: ChallengeLifecyclePhase = 'READY';
  private composition: ChallengeBroadcastComposition = 'DUAL';
  private revision = 1;

  private challenger: ParticipantEntranceProfile;
  private challenged: ParticipantEntranceProfile;
  private objectiveContract: AuthoritativeObjectiveContract;

  private arrivalDirector: CinematicParticipantArrivalDirector;
  private playerFabric: CanonicalUniversalPlayerFabric;
  private jumbotronDirector?: AutomatedJumbotronDirector;

  // Active state telemetry
  private attemptActiveParticipantId: string | null = null;
  private attemptTimerRemainingSec = 0;
  private canonicalAudioLevel = 0.0; // 0.0 - 1.0 single audio analysis signal

  // Judgment collection
  private audienceVotes: AudienceChallengeVote[] = [];
  private authorizedJudgeIds: string[] = ['judge-alpha-01', 'judge-beta-02', 'judge-gamma-03'];
  private judgeVerdicts: Record<string, JudgeVerdictSubmission> = {};
  private measurableMetrics: Record<string, number> = {};

  // Final result & settlement
  private finalResult: ChallengeResult | null = null;
  private isTornDown = false;

  constructor(
    challengeSessionId: string,
    challenger: ParticipantEntranceProfile,
    challenged: ParticipantEntranceProfile,
    objectiveContract: AuthoritativeObjectiveContract,
    venueId = 'challenge-arena',
    playerFabric?: CanonicalUniversalPlayerFabric,
    jumbotronDirector?: AutomatedJumbotronDirector
  ) {
    this.challengeSessionId = challengeSessionId;
    this.challenger = challenger;
    this.challenged = challenged;
    this.objectiveContract = objectiveContract;
    this.venueId = venueId;

    this.arrivalDirector = new CinematicParticipantArrivalDirector(
      challengeSessionId,
      'CHALLENGE',
      challenger,
      challenged,
      'FULL'
    );

    this.playerFabric = playerFabric ?? new CanonicalUniversalPlayerFabric();
    this.jumbotronDirector = jumbotronDirector;
  }

  // --- SOURCE REGISTRATION (Universal Media Fabric) ---

  public initializeOperationalSources(): {
    programSourceId: string;
    challengerIsoId: string;
    challengedIsoId: string;
    audienceSourceId: string;
    jumbotronSourceId: string;
  } {
    const programSourceId = `src-challenge-prog-${this.challengeSessionId}`;
    const challengerIsoId = `src-challenger-iso-${this.challenger.participantId}`;
    const challengedIsoId = `src-challenged-iso-${this.challenged.participantId}`;
    const audienceSourceId = `src-audience-${this.challengeSessionId}`;
    const jumbotronSourceId = `src-jumbotron-${this.challengeSessionId}`;

    const decoderSharedId = `dec-challenge-${this.challengeSessionId}`;

    // 1. CHALLENGE_PROGRAM (The single authoritative PROGRAM audio bus)
    const programSource: CanonicalVisualSource = {
      sourceId: programSourceId,
      sessionId: this.challengeSessionId,
      sourceType: 'CHALLENGE_PROGRAM',
      title: `CHALLENGE: ${this.objectiveContract.objective}`,
      decoderInstanceId: decoderSharedId,
      audioAuthority: 'PROGRAM',
      streamUrl: `webrtc://tmi.live/challenge/${this.challengeSessionId}/program`,
      livePositionMs: 0,
    };

    // 2. CHALLENGER_ISO (Muted mirror)
    const challengerIso: CanonicalVisualSource = {
      sourceId: challengerIsoId,
      sessionId: this.challengeSessionId,
      sourceType: 'CHALLENGER_ISO',
      title: `CHALLENGER ISO: ${this.challenger.name}`,
      decoderInstanceId: `${decoderSharedId}-challenger`,
      audioAuthority: 'MUTED',
      streamUrl: `webrtc://tmi.live/challenge/${this.challengeSessionId}/iso/${this.challenger.participantId}`,
      livePositionMs: 0,
    };

    // 3. CHALLENGED_ISO (Muted mirror)
    const challengedIso: CanonicalVisualSource = {
      sourceId: challengedIsoId,
      sessionId: this.challengeSessionId,
      sourceType: 'CHALLENGED_ISO',
      title: `CHALLENGED ISO: ${this.challenged.name}`,
      decoderInstanceId: `${decoderSharedId}-challenged`,
      audioAuthority: 'MUTED',
      streamUrl: `webrtc://tmi.live/challenge/${this.challengeSessionId}/iso/${this.challenged.participantId}`,
      livePositionMs: 0,
    };

    // 4. AUDIENCE_VIEW (Muted mirror)
    const audienceSource: CanonicalVisualSource = {
      sourceId: audienceSourceId,
      sessionId: this.challengeSessionId,
      sourceType: 'AUDIENCE_CAMERA',
      title: `ARENA AUDIENCE (${this.venueId})`,
      decoderInstanceId: `dec-aud-${this.venueId}`,
      audioAuthority: 'MUTED',
      is3DRendered: true,
      livePositionMs: 0,
    };

    // 5. JUMBOTRON_FEED (Muted mirror)
    const jumbotronSource: CanonicalVisualSource = {
      sourceId: jumbotronSourceId,
      sessionId: this.challengeSessionId,
      sourceType: 'JUMBOTRON_FEED',
      title: `JUMBOTRON: ${this.objectiveContract.objective}`,
      decoderInstanceId: decoderSharedId,
      audioAuthority: 'MUTED',
      livePositionMs: 0,
    };

    this.playerFabric.registerSource(programSource);
    this.playerFabric.registerSource(challengerIso);
    this.playerFabric.registerSource(challengedIso);
    this.playerFabric.registerSource(audienceSource);
    this.playerFabric.registerSource(jumbotronSource);

    // Initial assignment: Slot 1 receives CHALLENGE_PROGRAM with authoritative audio
    this.playerFabric.take('slot-1', programSourceId, 'MAIN');
    this.playerFabric.take('slot-2', challengerIsoId, 'CHALLENGER');
    this.playerFabric.take('slot-3', challengedIsoId, 'CHALLENGED');
    this.playerFabric.mirrorJumbotronFeedToPlayer(jumbotronSource, 'slot-4');
    this.playerFabric.rebalanceAudioAuthority();

    return {
      programSourceId,
      challengerIsoId,
      challengedIsoId,
      audienceSourceId,
      jumbotronSourceId,
    };
  }

  // --- LIFECYCLE ADVANCEMENT ---

  public advancePhase(targetPhase: ChallengeLifecyclePhase): ChallengeRecoveryCheckpoint {
    this.phase = targetPhase;
    this.revision++;

    // Adjust broadcast composition according to phase
    switch (targetPhase) {
      case 'READY':
      case 'CHALLENGER_ARRIVAL':
        this.composition = 'CHALLENGER_DOMINANT';
        break;
      case 'CHALLENGED_ARRIVAL':
        this.composition = 'CHALLENGED_DOMINANT';
        break;
      case 'OBJECTIVE_CONTRACT_ASSEMBLY':
      case 'RULES_LOCK':
      case 'JUDGMENT_POLICY_LOCK':
        this.composition = 'OBJECTIVE_FOCUS';
        break;
      case 'ATTEMPT_1_COUNTDOWN':
        this.composition = 'TIMER_FOCUS';
        this.attemptActiveParticipantId = this.challenger.participantId;
        this.attemptTimerRemainingSec = 3;
        break;
      case 'ATTEMPT_1_ACTIVE':
        this.composition = 'ACTIVE_ATTEMPT';
        this.attemptActiveParticipantId = this.challenger.participantId;
        this.attemptTimerRemainingSec = this.objectiveContract.timeLimitSec;
        break;
      case 'ATTEMPT_1_COMPLETE':
        this.composition = 'REACTION_PIP';
        this.attemptActiveParticipantId = null;
        break;
      case 'ATTEMPT_2_COUNTDOWN':
        this.composition = 'TIMER_FOCUS';
        this.attemptActiveParticipantId = this.challenged.participantId;
        this.attemptTimerRemainingSec = 3;
        break;
      case 'ATTEMPT_2_ACTIVE':
        this.composition = 'ACTIVE_ATTEMPT';
        this.attemptActiveParticipantId = this.challenged.participantId;
        this.attemptTimerRemainingSec = this.objectiveContract.timeLimitSec;
        break;
      case 'ATTEMPT_2_COMPLETE':
        this.composition = 'REACTION_PIP';
        this.attemptActiveParticipantId = null;
        break;
      case 'JUDGMENT_OPEN':
        this.composition = 'JUDGMENT_FOCUS';
        break;
      case 'RESULT_FINALIZED':
      case 'SETTLEMENT':
      case 'RESULT_PRESENTATION':
      case 'COMPLETE':
        this.composition = 'RESULT';
        break;
      default:
        this.composition = 'DUAL';
    }

    return this.createRecoveryCheckpoint();
  }

  // --- AUDIO LEVEL UPDATE (Derived from canonical signal) ---

  public updateCanonicalAudioLevel(level: number) {
    this.canonicalAudioLevel = Math.max(0.0, Math.min(1.0, level));
  }

  public getCanonicalAudioLevel(): number {
    return this.canonicalAudioLevel;
  }

  // --- JUDGMENT PATHWAYS ---

  /** Pathway 1: AUDIENCE_VOTE */
  public submitAudienceVote(vote: AudienceChallengeVote): boolean {
    if (this.phase !== 'JUDGMENT_OPEN') return false;
    if (this.objectiveContract.judgingPolicy !== 'AUDIENCE_VOTE') return false;

    // Check valid target
    if (
      vote.targetParticipantId !== this.challenger.participantId &&
      vote.targetParticipantId !== this.challenged.participantId
    ) {
      return false;
    }

    // Deduplicate voter
    const existingIdx = this.audienceVotes.findIndex((v) => v.voterId === vote.voterId);
    if (existingIdx >= 0) {
      this.audienceVotes[existingIdx] = vote;
    } else {
      this.audienceVotes.push(vote);
    }
    return true;
  }

  /** Pathway 2: AUTHORIZED_JUDGES */
  public submitJudgeVerdict(submission: JudgeVerdictSubmission): boolean {
    if (this.phase !== 'JUDGMENT_OPEN') return false;
    if (this.objectiveContract.judgingPolicy !== 'AUTHORIZED_JUDGES') return false;
    if (!this.authorizedJudgeIds.includes(submission.judgeId)) return false;

    this.judgeVerdicts[submission.judgeId] = submission;
    return true;
  }

  /** Pathway 3: MEASURABLE_RESULT */
  public recordMeasurableMetric(metricKey: string, value: number) {
    this.measurableMetrics[metricKey] = value;
  }

  // --- RESULT FINALIZATION & SETTLEMENT ---

  public finalizeResult(): ChallengeResult {
    let outcome: ChallengeOutcome = 'COMPLETED';
    let winnerId: string | null = null;
    let challengerScore = 0;
    let challengedScore = 0;
    let summaryText = '';

    if (this.objectiveContract.judgingPolicy === 'AUDIENCE_VOTE') {
      const challengerVotes = this.audienceVotes
        .filter((v) => v.targetParticipantId === this.challenger.participantId)
        .reduce((sum, v) => sum + v.voteWeight, 0);
      const challengedVotes = this.audienceVotes
        .filter((v) => v.targetParticipantId === this.challenged.participantId)
        .reduce((sum, v) => sum + v.voteWeight, 0);

      challengerScore = challengerVotes;
      challengedScore = challengedVotes;

      if (challengerVotes > challengedVotes) {
        winnerId = this.challenger.participantId;
        outcome = 'WIN';
        summaryText = `Challenger ${this.challenger.name} won audience vote ${challengerVotes} to ${challengedVotes}.`;
      } else if (challengedVotes > challengerVotes) {
        winnerId = this.challenged.participantId;
        outcome = 'WIN';
        summaryText = `Challenged ${this.challenged.name} won audience vote ${challengedVotes} to ${challengerVotes}.`;
      } else {
        outcome = 'TIE';
        summaryText = `Audience vote ended in a draw (${challengerVotes} to ${challengedVotes}).`;
      }
    } else if (this.objectiveContract.judgingPolicy === 'AUTHORIZED_JUDGES') {
      const submissions = Object.values(this.judgeVerdicts);
      if (submissions.length > 0) {
        const avgChallenger =
          submissions.reduce((acc, s) => acc + s.challengerScore, 0) / submissions.length;
        const avgChallenged =
          submissions.reduce((acc, s) => acc + s.challengedScore, 0) / submissions.length;

        challengerScore = Math.round(avgChallenger);
        challengedScore = Math.round(avgChallenged);

        if (challengerScore > challengedScore) {
          winnerId = this.challenger.participantId;
          outcome = 'WIN';
          summaryText = `Judges panel awarded victory to ${this.challenger.name} (${challengerScore} vs ${challengedScore}).`;
        } else if (challengedScore > challengerScore) {
          winnerId = this.challenged.participantId;
          outcome = 'WIN';
          summaryText = `Judges panel awarded victory to ${this.challenged.name} (${challengedScore} vs ${challengerScore}).`;
        } else {
          outcome = 'TIE';
          summaryText = `Judges panel scored an exact tie (${challengerScore} vs ${challengedScore}).`;
        }
      } else {
        outcome = 'COMPLETED';
        summaryText = 'No judge verdicts submitted.';
      }
    } else {
      // MEASURABLE_RESULT
      const challengerMetric = this.measurableMetrics[`${this.challenger.participantId}_score`] ?? 0;
      const challengedMetric = this.measurableMetrics[`${this.challenged.participantId}_score`] ?? 0;

      challengerScore = challengerMetric;
      challengedScore = challengedMetric;

      if (challengerMetric > challengedMetric) {
        winnerId = this.challenger.participantId;
        outcome = 'WIN';
        summaryText = `Objective criteria achieved by ${this.challenger.name} (${challengerMetric} vs ${challengedMetric}).`;
      } else if (challengedMetric > challengerMetric) {
        winnerId = this.challenged.participantId;
        outcome = 'WIN';
        summaryText = `Objective criteria achieved by ${this.challenged.name} (${challengedMetric} vs ${challengerMetric}).`;
      } else {
        outcome = 'COMPLETED';
        summaryText = `Objective attempt concluded (${challengerMetric} vs ${challengedMetric}).`;
      }
    }

    // Settlement is SEPARATE from result finalize — never imply payout on finalize alone.
    const hasRealStake =
      this.objectiveContract.realStakeOrReward !== 'NONE' &&
      Boolean(this.objectiveContract.realStakeOrReward);

    const settlementStatus: ChallengeSettlementStatus = hasRealStake
      ? 'PENDING'
      : 'EXEMPT';

    this.finalResult = {
      challengeSessionId: this.challengeSessionId,
      outcome,
      winnerId,
      judgmentPolicy: this.objectiveContract.judgingPolicy,
      authoritativeResult: {
        challengerScore,
        challengedScore,
        metrics: { ...this.measurableMetrics },
        summaryText,
      },
      evidenceReference: `ev_challenge_${this.challengeSessionId}`,
      finalizedAt: Date.now(),
      settlementStatus,
      settlementReference: undefined,
      presentationPayload: {
        headline: outcome === 'WIN' ? 'CHALLENGE CONQUERED' : 'CHALLENGE CONCLUDED',
        badge: outcome === 'WIN' ? 'CHALLENGE_WINNER' : 'CHALLENGE_FINISHED',
        trophyType: outcome === 'WIN' ? 'GOLD_SHIELD' : undefined,
        xpAwarded: outcome === 'WIN' ? 250 : 100,
      },
    };

    this.advancePhase('RESULT_FINALIZED');
    return this.finalResult;
  }

  /**
   * Explicit settlement step — distinct from RESULT_FINALIZED.
   * Real stake → SETTLED + settlementReference. NONE → EXEMPT.
   */
  public settleResult(): ChallengeResult | null {
    if (!this.finalResult) return null;

    const hasRealStake =
      this.objectiveContract.realStakeOrReward !== 'NONE' &&
      Boolean(this.objectiveContract.realStakeOrReward);

    if (!hasRealStake) {
      this.finalResult = {
        ...this.finalResult,
        settlementStatus: 'EXEMPT',
        settlementReference: undefined,
      };
    } else {
      this.finalResult = {
        ...this.finalResult,
        settlementStatus: 'SETTLED',
        settlementReference: `tx_challenge_settle_${this.challengeSessionId}_${Date.now()}`,
      };
    }

    this.advancePhase('SETTLEMENT');
    return this.finalResult;
  }

  /**
   * Policy-driven skip: after ATTEMPT_1_COMPLETE → ATTEMPT_2_COUNTDOWN or JUDGMENT_OPEN.
   */
  public resolveNextPhaseAfterAttemptComplete(): ChallengeLifecyclePhase {
    if (this.phase === 'ATTEMPT_1_COMPLETE') {
      return this.objectiveContract.attemptCount >= 2
        ? 'ATTEMPT_2_COUNTDOWN'
        : 'JUDGMENT_OPEN';
    }
    if (this.phase === 'ATTEMPT_2_COMPLETE') {
      return 'JUDGMENT_OPEN';
    }
    return this.phase;
  }

  public getAttemptActiveParticipantId(): string | null {
    return this.attemptActiveParticipantId;
  }

  public getAttemptTimerRemainingSec(): number {
    return this.attemptTimerRemainingSec;
  }

  public getRevision(): number {
    return this.revision;
  }

  // --- RECONNECT & STATE RESTORATION ---

  public restoreFromCheckpoint(checkpoint: ChallengeRecoveryCheckpoint): boolean {
    if (checkpoint.challengeSessionId !== this.challengeSessionId) return false;
    this.phase = checkpoint.phase;
    this.composition = checkpoint.composition;
    this.revision = Math.max(this.revision, checkpoint.revision + 1);
    return true;
  }

  public createRecoveryCheckpoint(): ChallengeRecoveryCheckpoint {
    return {
      challengeSessionId: this.challengeSessionId,
      revision: this.revision,
      timestampMs: Date.now(),
      phase: this.phase,
      composition: this.composition,
      participantIds: [this.challenger.participantId, this.challenged.participantId],
      objectiveId: this.objectiveContract.objectiveId,
      judgmentPolicy: this.objectiveContract.judgingPolicy,
      hasResult: this.finalResult !== null,
    };
  }

  // --- SEMANTIC DIFFERENTIATION ASSERTIONS ---

  /** Hard Law: Challenge is NOT Battle (center is the contract, not opposing corner VS) */
  public assertNotBattle(): boolean {
    return (
      this.objectiveContract.objective.length > 0 &&
      this.composition !== ('VS_COLLISION' as any) &&
      this.phase !== ('ROUND_1' as any)
    );
  }

  /** Hard Law: Challenge is NOT Cypher (Challenge has result/outcome, Cypher is winnerless) */
  public assertNotCypher(): boolean {
    return (
      this.objectiveContract.judgingPolicy !== undefined &&
      this.finalResult?.outcome !== undefined
    );
  }

  /** Hard Law: Challenge is NOT Gauntlet (Gauntlet has corridor progression rail) */
  public assertNotGauntlet(): boolean {
    return !('progressionRail' in this);
  }

  // --- GETTERS & CLEAN TEARDOWN ---

  public getSessionId(): string {
    return this.challengeSessionId;
  }

  public getPhase(): ChallengeLifecyclePhase {
    return this.phase;
  }

  public getComposition(): ChallengeBroadcastComposition {
    return this.composition;
  }

  public getObjectiveContract(): AuthoritativeObjectiveContract {
    return this.objectiveContract;
  }

  public getChallenger(): ParticipantEntranceProfile {
    return this.challenger;
  }

  public getChallenged(): ParticipantEntranceProfile {
    return this.challenged;
  }

  public getResult(): ChallengeResult | null {
    return this.finalResult;
  }

  public getPlayerFabric(): CanonicalUniversalPlayerFabric {
    return this.playerFabric;
  }

  public teardown(): void {
    this.isTornDown = true;
    this.advancePhase('COMPLETE');
  }

  public isDestroyed(): boolean {
    return this.isTornDown;
  }
}
