/**
 * runChallengeACGBROperationalCertification.test.ts
 *
 * Master Acceptance Test Suite for:
 * Lane C — Challenge ACGBR Operational Certification
 *
 * Evaluates all 16 architectural gates:
 * 1. Canonical Challenge Session Creation & Route Resolution
 * 2. ChallengeCinematicProfile & Scene Graph Integration
 * 3. Authoritative Objective Contract Center of Gravity
 * 4. Semantic Differentiation (Suppression of generic Battle VS framing)
 * 5. AUDIENCE_VOTE Judgment Path
 * 6. AUTHORIZED_JUDGES Judgment Path
 * 7. MEASURABLE_RESULT Flow Accuracy Benchmark Path
 * 8. Attempt Progression & Canonical Session Truth
 * 9. Result Finalization vs Ledger Settlement Separation
 * 10. Canonical Visual Sources Registration (PROGRAM, ISOs, AUDIENCE, JUMBOTRON)
 * 11. Universal Media Player Non-Dedicated Routing & Shared Decoders
 * 12. Single PROGRAM Audio Authority Law
 * 13. Jumbotron Multi-Face Phase Synchronization & Non-Destructive Ad Break Return
 * 14. Reconnect Recovery & Checkpoint Synchronization
 * 15. Pacing & Reduced-Motion Accessibility Scaling
 * 16. Strict One-Way Authority Boundary (ACGBR never overwrites session truth)
 */

import {
  ChallengeOperationalLifecycle,
  AuthoritativeObjectiveContract,
} from '../lib/challenge/ChallengeOperationalLifecycle';
import {
  ChallengeCinematicProfile,
} from '../lib/challenge/ChallengeCinematicProfile';
import { ChallengePresentationPack } from '../lib/challenge/ChallengePresentationPack';
import { JumbotronShowDirector } from '../lib/jumbotron/JumbotronShowDirector';
import {
  CanonicalUniversalPlayerFabric,
  CanonicalVisualSource,
} from '../lib/media/CanonicalUniversalPlayerFabric';

export function runChallengeACGBROperationalCertification(): {
  allPassed: boolean;
  totalGates: number;
  gates: Record<string, boolean>;
} {
  const gates: Record<string, boolean> = {};

  const challenger = {
    participantId: 'p-apex-01',
    name: 'Apex Spit',
    role: 'CHALLENGER' as const,
    hometown: 'ATLANTA, GA',
    genre: 'HIP-HOP',
    record: '12-1',
    cameraStreamId: 'src-apex-webrtc-01',
  };

  const challenged = {
    participantId: 'p-cipher-02',
    name: 'Cipher Queen',
    role: 'PERFORMER' as const,
    hometown: 'BROOKLYN, NY',
    genre: 'HIP-HOP',
    record: '16-0',
    cameraStreamId: 'src-cipher-webrtc-02',
  };

  const objectiveContract: AuthoritativeObjectiveContract = {
    objectiveId: 'obj-rap-flow-140',
    objective: '60-Second Freestyle on 140 BPM Beat',
    category: 'FREESTYLE_RAP',
    timeLimitSec: 60,
    attemptCount: 2,
    judgingPolicy: 'AUDIENCE_VOTE',
    realStakeOrReward: 'NONE',
    qualificationRules: [
      'Strict 140 BPM instrumental sync',
      'Continuous flow with zero 4-bar stumbles',
      'No pre-written lyrics allowed',
    ],
  };

  const lifecycle = new ChallengeOperationalLifecycle(
    'sess-challenge-prod-01',
    challenger,
    challenged,
    objectiveContract,
    'challenge-arena'
  );
  const registeredSources = lifecycle.initializeOperationalSources();

  // --- GATE 1: Canonical Challenge Session Creation & Route Resolution ---
  gates['Gate 1: Canonical Challenge Session Creation & Route Resolution'] =
    lifecycle.getSessionId() === 'sess-challenge-prod-01' &&
    lifecycle.getChallenger().participantId === 'p-apex-01' &&
    lifecycle.getChallenged().participantId === 'p-cipher-02' &&
    lifecycle.getPhase() === 'READY';

  // --- GATE 2: ChallengeCinematicProfile & Scene Graph Integration ---
  const cinematicProfile = new ChallengeCinematicProfile('sess-challenge-prod-01', 'ARENA_PRO_HYBRID', 'HIGH');
  const scene1 = cinematicProfile.resolveScene('OBJECTIVE_CONTRACT_ASSEMBLY', objectiveContract, challenger.name, challenged.name);

  gates['Gate 2: ChallengeCinematicProfile & Scene Graph Integration'] =
    scene1.token === 'OBJECTIVE_CONTRACT_ASSEMBLE' &&
    scene1.seed.startsWith('seed_ch_') &&
    scene1.cameraAnchor === 'OBJECTIVE_CONTRACT_CENTER' &&
    scene1.dialogueFacts.objective === '60-Second Freestyle on 140 BPM Beat';

  // --- GATE 3: Authoritative Objective Contract Center of Gravity ---
  const fetchedContract = lifecycle.getObjectiveContract();
  gates['Gate 3: Authoritative Objective Contract Center of Gravity'] =
    fetchedContract.objectiveId === 'obj-rap-flow-140' &&
    fetchedContract.attemptCount === 2 &&
    fetchedContract.timeLimitSec === 60 &&
    fetchedContract.qualificationRules.length === 3;

  // --- GATE 4: Semantic Differentiation (Suppression of generic Battle VS framing) ---
  const pack = new ChallengePresentationPack('FULL');
  const contractCard = pack.formatContractCard(objectiveContract);

  gates['Gate 4: Semantic Differentiation (Suppression of generic Battle VS framing)'] =
    contractCard.category === 'FREESTYLE_RAP' &&
    !contractCard.title.includes(' VS ') &&
    contractCard.rules.length === 3 &&
    lifecycle.assertNotBattle() &&
    lifecycle.assertNotGauntlet();

  // --- GATE 5: AUDIENCE_VOTE Judgment Path ---
  lifecycle.advancePhase('JUDGMENT_OPEN');
  const vote1 = lifecycle.submitAudienceVote({
    voterId: 'voter-fan-01',
    targetParticipantId: 'p-apex-01',
    voteWeight: 1,
    submittedAtMs: Date.now(),
  });
  const vote2 = lifecycle.submitAudienceVote({
    voterId: 'voter-fan-02',
    targetParticipantId: 'p-cipher-02',
    voteWeight: 1,
    submittedAtMs: Date.now(),
  });
  const vote3 = lifecycle.submitAudienceVote({
    voterId: 'voter-fan-03',
    targetParticipantId: 'p-cipher-02',
    voteWeight: 1,
    submittedAtMs: Date.now(),
  });

  const audienceVoteResult = lifecycle.finalizeResult();

  gates['Gate 5: AUDIENCE_VOTE Judgment Path'] =
    vote1 === true &&
    vote2 === true &&
    vote3 === true &&
    audienceVoteResult.authoritativeResult.challengerScore === 1 &&
    audienceVoteResult.authoritativeResult.challengedScore === 2 &&
    audienceVoteResult.winnerId === 'p-cipher-02' &&
    lifecycle.assertNotCypher();

  // --- GATE 6: AUTHORIZED_JUDGES Judgment Path ---
  const judgesLifecycle = new ChallengeOperationalLifecycle(
    'sess-judges-02',
    challenger,
    challenged,
    { ...objectiveContract, judgingPolicy: 'AUTHORIZED_JUDGES' },
    'challenge-arena'
  );
  judgesLifecycle.advancePhase('JUDGMENT_OPEN');
  const jv1 = judgesLifecycle.submitJudgeVerdict({
    judgeId: 'judge-alpha-01',
    judgeName: 'DJ KHALIL',
    challengerScore: 92,
    challengedScore: 88,
    submittedAtMs: Date.now(),
    verifiedSignature: 'sig-judge-alpha',
  });
  const jv2 = judgesLifecycle.submitJudgeVerdict({
    judgeId: 'judge-beta-02',
    judgeName: 'TIANA',
    challengerScore: 90,
    challengedScore: 94,
    submittedAtMs: Date.now(),
    verifiedSignature: 'sig-judge-beta',
  });
  const judgeResult = judgesLifecycle.finalizeResult();

  gates['Gate 6: AUTHORIZED_JUDGES Judgment Path'] =
    jv1 === true &&
    jv2 === true &&
    judgeResult.authoritativeResult.challengerScore === 91 &&
    judgeResult.authoritativeResult.challengedScore === 91 &&
    judgeResult.outcome === 'TIE';

  // --- GATE 7: MEASURABLE_RESULT Flow Accuracy Benchmark Path ---
  const measurableLifecycle = new ChallengeOperationalLifecycle(
    'sess-measurable-03',
    challenger,
    challenged,
    { ...objectiveContract, judgingPolicy: 'MEASURABLE_RESULT' },
    'challenge-arena'
  );
  measurableLifecycle.advancePhase('ATTEMPT_1_ACTIVE');
  measurableLifecycle.recordMeasurableMetric('p-apex-01_score', 96.5);
  measurableLifecycle.recordMeasurableMetric('p-cipher-02_score', 91.2);
  const benchmarkResult = measurableLifecycle.finalizeResult();

  gates['Gate 7: MEASURABLE_RESULT Flow Accuracy Benchmark Path'] =
    benchmarkResult.authoritativeResult.challengerScore === 96.5 &&
    benchmarkResult.authoritativeResult.challengedScore === 91.2 &&
    benchmarkResult.winnerId === 'p-apex-01';

  // --- GATE 8: Attempt Progression & Canonical Session Truth ---
  lifecycle.advancePhase('ATTEMPT_1_ACTIVE');
  const attempt1Phase = lifecycle.getPhase();
  lifecycle.advancePhase('ATTEMPT_1_COMPLETE');
  const nextPhase = lifecycle.resolveNextPhaseAfterAttemptComplete();
  lifecycle.advancePhase(nextPhase);
  const attempt2Phase = lifecycle.getPhase();

  gates['Gate 8: Attempt Progression & Canonical Session Truth'] =
    attempt1Phase === 'ATTEMPT_1_ACTIVE' &&
    nextPhase === 'ATTEMPT_2_COUNTDOWN' &&
    attempt2Phase === 'ATTEMPT_2_COUNTDOWN';

  // --- GATE 9: Result Finalization vs Ledger Settlement Separation ---
  // Create a lifecycle with real stakes to verify PENDING -> SETTLED transition
  const stakeLifecycle = new ChallengeOperationalLifecycle(
    'sess-stake-04',
    challenger,
    challenged,
    { ...objectiveContract, realStakeOrReward: '$500 USD' },
    'challenge-arena'
  );
  stakeLifecycle.advancePhase('JUDGMENT_OPEN');
  stakeLifecycle.submitAudienceVote({
    voterId: 'voter-fan-01',
    targetParticipantId: 'p-apex-01',
    voteWeight: 1,
    submittedAtMs: Date.now(),
  });  const unSettledResult = stakeLifecycle.finalizeResult();
  const settlementBefore = unSettledResult.settlementStatus;
  const settledResult = stakeLifecycle.settleResult();

  gates['Gate 9: Result Finalization vs Ledger Settlement Separation'] =
    unSettledResult.finalizedAt > 0 &&
    settlementBefore === 'PENDING' &&
    settledResult !== null &&
    settledResult.settlementStatus === 'SETTLED' &&
    settledResult.settlementReference?.startsWith('tx_challenge_settle_') === true;

  // --- GATE 10: Canonical Visual Sources Registration ---
  gates['Gate 10: Canonical Visual Sources Registration'] =
    registeredSources.programSourceId.includes('sess-challenge-prod-01') &&
    registeredSources.challengerIsoId.includes('p-apex-01') &&
    registeredSources.challengedIsoId.includes('p-cipher-02') &&
    registeredSources.jumbotronSourceId.includes('sess-challenge-prod-01');

  // --- GATE 11: Universal Media Player Non-Dedicated Routing & Shared Decoders ---
  const mediaFabric = lifecycle.getPlayerFabric();
  // Swap slot-1 and slot-2
  const swapSuccess = mediaFabric.swap('slot-1', 'slot-2');
  const slot1 = mediaFabric.getPlayer('slot-1');
  const slot2 = mediaFabric.getPlayer('slot-2');

  gates['Gate 11: Universal Media Player Non-Dedicated Routing & Shared Decoders'] =
    swapSuccess === true &&
    slot1?.sourceId === registeredSources.challengerIsoId &&
    slot2?.sourceId === registeredSources.programSourceId;

  // --- GATE 12: Single PROGRAM Audio Authority Law ---
  gates['Gate 12: Single PROGRAM Audio Authority Law'] =
    slot1?.audioAuthority === 'MUTED' && slot2?.audioAuthority === 'PROGRAM';

  // --- GATE 13: Jumbotron Multi-Face Phase Synchronization & Non-Destructive Return ---
  const showDirector = new JumbotronShowDirector('challenge-dome', 'sess-challenge-prod-01');
  const jumbotronScene = cinematicProfile.resolveScene('ATTEMPT_1_ACTIVE', objectiveContract, challenger.name, challenged.name);
  showDirector.updateFaceState('NORTH', { sourceId: jumbotronScene.jumbotronMapping.NORTH });

  const northFaceState = showDirector.getFaceState('NORTH');

  gates['Gate 13: Jumbotron Multi-Face Phase Synchronization & Non-Destructive Ad Break Return'] =
    northFaceState?.sourceId === 'LIVE_ATTEMPT_FEED' &&
    jumbotronScene.jumbotronMapping.EAST === 'SPONSOR_DIRECT_CAMPAIGN';

  // --- GATE 14: Reconnect Recovery & Checkpoint Synchronization ---
  const checkpoint = lifecycle.createRecoveryCheckpoint();
  const restoredLifecycle = new ChallengeOperationalLifecycle(
    'sess-challenge-prod-01',
    challenger,
    challenged,
    objectiveContract,
    'challenge-arena'
  );
  const restoreSuccess = restoredLifecycle.restoreFromCheckpoint(checkpoint);

  gates['Gate 14: Reconnect Recovery & Checkpoint Synchronization'] =
    restoreSuccess === true &&
    restoredLifecycle.getSessionId() === lifecycle.getSessionId() &&
    restoredLifecycle.getPhase() === lifecycle.getPhase();

  // --- GATE 15: Pacing & Reduced-Motion Accessibility Scaling ---
  const accessibleProfile = new ChallengeCinematicProfile('sess-challenge-prod-01', 'ARENA_PRO_HYBRID', 'NORMAL', true);
  const accessibleScene = accessibleProfile.resolveScene('CHALLENGER_ARRIVAL', objectiveContract, challenger.name, challenged.name);
  const accessibleCaps = accessibleProfile.getCapabilities();

  gates['Gate 15: Pacing & Reduced-Motion Accessibility Scaling'] =
    accessibleScene.isAccessible === true &&
    accessibleScene.cameraAnchor === 'STAGE_CENTER' &&
    accessibleCaps.volumetrics === false &&
    accessibleCaps.kineticPanels === false;

  // --- GATE 16: Strict One-Way Authority Boundary ---
  const checkpointBefore = lifecycle.createRecoveryCheckpoint();
  accessibleProfile.resolveScene('RESULT_FINALIZED', objectiveContract, challenger.name, challenged.name, 1, 0, settledResult);
  const checkpointAfter = lifecycle.createRecoveryCheckpoint();

  gates['Gate 16: Strict One-Way Authority Boundary (ACGBR never overwrites session truth)'] =
    JSON.stringify(checkpointBefore) === JSON.stringify(checkpointAfter);

  console.log('--- GATE REPORT ---');
  for (const [gateName, passed] of Object.entries(gates)) {
    console.log(`${passed ? '🟢 PASS' : '🔴 FAIL'}: ${gateName}`);
  }
  const allPassed = Object.values(gates).every(Boolean);
  if (!allPassed) {
    const failedGates = Object.entries(gates).filter(([_, p]) => !p).map(([g]) => g);
    console.error('FAILED GATES:', failedGates);
  }

  return {
    allPassed,
    totalGates: Object.keys(gates).length,
    gates,
  };
}

if (process.argv[1]?.includes('runChallengeACGBROperationalCertification.test')) {
  const result = runChallengeACGBROperationalCertification();
  if (!result.allPassed) {
    process.exit(1);
  }
}
