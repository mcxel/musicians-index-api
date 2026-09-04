/**
 * runLaneCChallengeOperationalCertification.test.ts
 *
 * Phase 5.3 Lane C: Canonical Challenge Operational Certification Suite
 *
 * Enforces:
 * - Authoritative Challenge Session Lifecycle (19-phase progression)
 * - Objective Contract Center of Gravity
 * - Three Distinct Judgment Policies (AUDIENCE_VOTE, AUTHORIZED_JUDGES, MEASURABLE_RESULT)
 * - ChallengeResult abstraction (Outcome vs Settlement separation)
 * - Universal Media Player Fabric (Slots 1-16, single PROGRAM audio authority)
 * - Reality Law (Real stakes or NONE, no fake payouts)
 * - Reconnect & late-join state recovery
 * - Semantic Regression: Challenge ≠ Battle, Challenge ≠ Cypher, Challenge ≠ Gauntlet
 */

import {
  ChallengeOperationalLifecycle,
  AuthoritativeObjectiveContract,
  ChallengeJudgmentPolicy,
  ChallengeResult,
  ChallengeRecoveryCheckpoint,
} from '../lib/challenge/ChallengeOperationalLifecycle';
import { ChallengePresentationPack } from '../lib/challenge/ChallengePresentationPack';
import { ParticipantEntranceProfile } from '../lib/battle/CinematicParticipantArrivalDirector';
import { CanonicalUniversalPlayerFabric } from '../lib/media/CanonicalUniversalPlayerFabric';

export function runLaneCChallengeOperationalCertification(): {
  allPassed: boolean;
  totalGates: number;
  gates: Record<string, boolean>;
} {
  const gates: Record<string, boolean> = {};

  const challenger: ParticipantEntranceProfile = {
    participantId: 'artist-apex-spit',
    name: 'APEX SPIT',
    role: 'CHALLENGER',
    hometown: 'ATLANTA, GA',
    genre: 'BOOM BAP',
    record: '12-1',
  };

  const challenged: ParticipantEntranceProfile = {
    participantId: 'artist-cipher-queen',
    name: 'CIPHER QUEEN',
    role: 'PERFORMER',
    hometown: 'BROOKLYN, NY',
    genre: 'HARDCORE HIP-HOP',
    record: '16-0',
  };

  const contractAudience: AuthoritativeObjectiveContract = {
    objectiveId: 'obj-contract-freestyle-01',
    objective: '60-SECOND FREESTYLE ON 140 BPM BEAT',
    category: 'TECHNICAL FREESTYLE',
    timeLimitSec: 60,
    attemptCount: 2,
    judgingPolicy: 'AUDIENCE_VOTE',
    realStakeOrReward: 'NONE',
    qualificationRules: [
      'Strict 140 BPM instrumental sync',
      'Continuous flow with zero 4-bar stumbles',
    ],
  };

  // --- GATE 1: Exact Challenge Route & Authoritative Session Mount ---
  const fabric = new CanonicalUniversalPlayerFabric();
  const lifecycle = new ChallengeOperationalLifecycle(
    'sess-challenge-cert-01',
    challenger,
    challenged,
    contractAudience,
    'challenge-arena',
    fabric
  );
  gates['Gate 1: Authoritative Session Mount & READY Phase'] =
    lifecycle.getSessionId() === 'sess-challenge-cert-01' &&
    lifecycle.getPhase() === 'READY';

  // --- GATE 2: Challenger + Challenged Arrival Choreography ---
  lifecycle.advancePhase('CHALLENGER_ARRIVAL');
  lifecycle.advancePhase('CHALLENGER_IDENTITY_LOCK');
  lifecycle.advancePhase('CHALLENGED_ARRIVAL');
  const cpArrival = lifecycle.advancePhase('CHALLENGED_IDENTITY_LOCK');
  gates['Gate 2: Participant Arrival Choreography'] =
    cpArrival.phase === 'CHALLENGED_IDENTITY_LOCK' &&
    cpArrival.participantIds[0] === 'artist-apex-spit' &&
    cpArrival.participantIds[1] === 'artist-cipher-queen';

  // --- GATE 3: Objective Contract Reveal & Assembly ---
  const cpContract = lifecycle.advancePhase('OBJECTIVE_CONTRACT_ASSEMBLY');
  const contract = lifecycle.getObjectiveContract();
  gates['Gate 3: Objective Contract Center of Gravity'] =
    cpContract.phase === 'OBJECTIVE_CONTRACT_ASSEMBLY' &&
    cpContract.composition === 'OBJECTIVE_FOCUS' &&
    contract.objective === '60-SECOND FREESTYLE ON 140 BPM BEAT' &&
    contract.qualificationRules.length === 2 &&
    contract.realStakeOrReward === 'NONE';

  // --- GATE 4: Attempt Progression Lifecycle ---
  lifecycle.advancePhase('ATTEMPT_1_COUNTDOWN');
  lifecycle.advancePhase('ATTEMPT_1_ACTIVE');
  lifecycle.advancePhase('ATTEMPT_1_COMPLETE');
  lifecycle.advancePhase('ATTEMPT_2_COUNTDOWN');
  lifecycle.advancePhase('ATTEMPT_2_ACTIVE');
  const cpAttempt2 = lifecycle.advancePhase('ATTEMPT_2_COMPLETE');
  gates['Gate 4: Attempt Progression (Attempts 1 & 2)'] =
    cpAttempt2.phase === 'ATTEMPT_2_COMPLETE' &&
    cpAttempt2.composition === 'REACTION_PIP';

  // --- GATE 5: Authorized Judgment Decision Paths ---
  // Pathway A: Audience Vote
  lifecycle.advancePhase('JUDGMENT_OPEN');
  const vote1Success = lifecycle.submitAudienceVote({
    voterId: 'fan-01',
    targetParticipantId: challenger.participantId,
    voteWeight: 1,
    submittedAtMs: Date.now(),
  });
  const vote2Success = lifecycle.submitAudienceVote({
    voterId: 'fan-02',
    targetParticipantId: challenger.participantId,
    voteWeight: 1,
    submittedAtMs: Date.now(),
  });
  const vote3Success = lifecycle.submitAudienceVote({
    voterId: 'fan-03',
    targetParticipantId: challenged.participantId,
    voteWeight: 1,
    submittedAtMs: Date.now(),
  });

  // Pathway B: Verified Judges Panel (Testing on second lifecycle)
  const contractJudges: AuthoritativeObjectiveContract = {
    ...contractAudience,
    objectiveId: 'obj-judges-02',
    judgingPolicy: 'AUTHORIZED_JUDGES',
    realStakeOrReward: '$1,000 USD',
  };
  const judgesLifecycle = new ChallengeOperationalLifecycle(
    'sess-challenge-judges-02',
    challenger,
    challenged,
    contractJudges
  );
  judgesLifecycle.advancePhase('JUDGMENT_OPEN');
  const judgeAlphaValid = judgesLifecycle.submitJudgeVerdict({
    judgeId: 'judge-alpha-01',
    judgeName: 'DJ KHALIL',
    challengerScore: 92,
    challengedScore: 88,
    submittedAtMs: Date.now(),
    verifiedSignature: 'sig-judge-alpha',
  });
  const unauthorizedJudgeRejected = !judgesLifecycle.submitJudgeVerdict({
    judgeId: 'fake-judge-99',
    judgeName: 'IMPOSTER',
    challengerScore: 100,
    challengedScore: 0,
    submittedAtMs: Date.now(),
    verifiedSignature: 'invalid',
  });

  // Pathway C: Measurable Result (Testing on third lifecycle)
  const contractMeasurable: AuthoritativeObjectiveContract = {
    ...contractAudience,
    objectiveId: 'obj-measurable-03',
    judgingPolicy: 'MEASURABLE_RESULT',
  };
  const measurableLifecycle = new ChallengeOperationalLifecycle(
    'sess-challenge-measure-03',
    challenger,
    challenged,
    contractMeasurable
  );
  measurableLifecycle.recordMeasurableMetric(`${challenger.participantId}_score`, 95.5);
  measurableLifecycle.recordMeasurableMetric(`${challenged.participantId}_score`, 91.2);
  measurableLifecycle.advancePhase('JUDGMENT_OPEN');
  const measurableResult = measurableLifecycle.finalizeResult();

  gates['Gate 5: Authorized Judgment Decision Paths (Audience, Judges, Measurable)'] =
    vote1Success &&
    vote2Success &&
    vote3Success &&
    judgeAlphaValid &&
    unauthorizedJudgeRejected &&
    measurableResult.winnerId === challenger.participantId;

  // --- GATE 6: Authoritative ChallengeResult & Settlement Separation ---
  const finalResult = lifecycle.finalizeResult();
  gates['Gate 6: ChallengeResult & Outcome vs Settlement Separation'] =
    finalResult.outcome === 'WIN' &&
    finalResult.winnerId === challenger.participantId &&
    finalResult.authoritativeResult.challengerScore === 2 &&
    finalResult.authoritativeResult.challengedScore === 1 &&
    finalResult.settlementStatus === 'EXEMPT' && // Stake was NONE
    finalResult.settlementReference === undefined;

  // --- GATE 7: Reality Law & Real Stake Settlement Invariant ---
  const judgesFinalized = judgesLifecycle.finalizeResult();
  const judgesPendingOk = judgesFinalized.settlementStatus === 'PENDING';
  const judgesResult = judgesLifecycle.settleResult();
  gates['Gate 7: Reality Law & Real Stake Settlement Invariant'] =
    judgesPendingOk &&
    judgesResult?.settlementStatus === 'SETTLED' &&
    typeof judgesResult.settlementReference === 'string' &&
    judgesResult.settlementReference.startsWith('tx_challenge_settle_');

  // --- GATE 8: Universal Media Player Routing (Slots 1-16) ---
  const sources = lifecycle.initializeOperationalSources();
  const playerFabric = lifecycle.getPlayerFabric();
  const slot1Before = playerFabric.getPlayer('slot-1');
  const slot1SourceBefore = slot1Before?.sourceId ? playerFabric.getSource(slot1Before.sourceId) : undefined;

  // Swap / Move CHALLENGE_PROGRAM to Slot 4 without restarting decoder
  playerFabric.take('slot-4', sources.programSourceId, 'MAIN');
  const slot4After = playerFabric.getPlayer('slot-4');
  const slot4SourceAfter = slot4After?.sourceId ? playerFabric.getSource(slot4After.sourceId) : undefined;

  // Assign Challenger ISO to Slot 2
  playerFabric.take('slot-2', sources.challengerIsoId, 'CHALLENGER');
  const slot2Iso = playerFabric.getPlayer('slot-2');
  const slot2SourceIso = slot2Iso?.sourceId ? playerFabric.getSource(slot2Iso.sourceId) : undefined;

  gates['Gate 8: Universal Media Player Routing (Non-Dedicated Slots)'] =
    slot1SourceBefore?.sourceType === 'CHALLENGE_PROGRAM' &&
    slot4SourceAfter?.sourceType === 'CHALLENGE_PROGRAM' &&
    slot4SourceAfter?.decoderInstanceId === slot1SourceBefore?.decoderInstanceId &&
    slot2SourceIso?.sourceType === 'CHALLENGER_ISO';

  // --- GATE 9: Single PROGRAM Audio Authority Invariant ---
  playerFabric.rebalanceAudioAuthority();
  const slot1SourceAudio = slot1Before?.sourceId ? playerFabric.getSource(slot1Before.sourceId)?.audioAuthority : undefined;
  const slot2SourceAudio = slot2Iso?.sourceId ? playerFabric.getSource(slot2Iso.sourceId)?.audioAuthority : undefined;
  const jumbotronSourceAudio = playerFabric.getSource(sources.jumbotronSourceId)?.audioAuthority;
  gates['Gate 9: Single PROGRAM Audio Authority (Mirrors Muted)'] =
    slot1SourceAudio === 'PROGRAM' &&
    slot2SourceAudio === 'MUTED' &&
    jumbotronSourceAudio === 'MUTED';

  // --- GATE 10: Canonical Audio Waveform Derivation ---
  lifecycle.updateCanonicalAudioLevel(0.75);
  const pack = new ChallengePresentationPack('FULL');
  const waveform = pack.deriveWaveformBars(lifecycle.getCanonicalAudioLevel(), 16);
  gates['Gate 10: Waveform Visualizer Derived from Canonical Audio'] =
    lifecycle.getCanonicalAudioLevel() === 0.75 &&
    waveform.length === 16 &&
    waveform.every((bar) => bar > 0 && bar <= 1.0);

  // --- GATE 11: Reconnect & Late-Join State Synchronization ---
  const midCheckpoint: ChallengeRecoveryCheckpoint = {
    challengeSessionId: 'sess-challenge-reconnect-test',
    revision: 14,
    timestampMs: Date.now(),
    phase: 'ATTEMPT_2_ACTIVE',
    composition: 'ACTIVE_ATTEMPT',
    participantIds: [challenger.participantId, challenged.participantId],
    objectiveId: 'obj-contract-freestyle-01',
    judgmentPolicy: 'AUDIENCE_VOTE',
    hasResult: false,
  };
  const reconnectLifecycle = new ChallengeOperationalLifecycle(
    'sess-challenge-reconnect-test',
    challenger,
    challenged,
    contractAudience
  );
  const restoreSuccess = reconnectLifecycle.restoreFromCheckpoint(midCheckpoint);
  gates['Gate 11: Reconnect & Late-Join Invariant (No Replay from Zero)'] =
    restoreSuccess &&
    reconnectLifecycle.getPhase() === 'ATTEMPT_2_ACTIVE' &&
    reconnectLifecycle.getComposition() === 'ACTIVE_ATTEMPT';

  // --- GATE 12: Device & Accessibility Pacing Modes ---
  const camFull = pack.getCameraCue('ATTEMPT_1_ACTIVE', 'ACTIVE_ATTEMPT');
  pack.setPacingMode('ACCESSIBLE');
  const camAccessible = pack.getCameraCue('ATTEMPT_1_ACTIVE', 'ACTIVE_ATTEMPT');
  gates['Gate 12: Device & Accessibility Pacing Modes'] =
    camFull.target === 'CHALLENGER' &&
    camFull.transitionSec > 0 &&
    camAccessible.target === 'DUAL_STAGE' &&
    camAccessible.transitionSec === 0;

  // --- GATE 13: Semantic Regression Assertions (Identity Law) ---
  gates['Gate 13: Semantic Regression (Challenge ≠ Battle, Cypher, Gauntlet)'] =
    lifecycle.assertNotBattle() &&
    lifecycle.assertNotCypher() &&
    lifecycle.assertNotGauntlet();

  // --- GATE 14: Clean Teardown ---
  lifecycle.teardown();
  gates['Gate 14: Clean Teardown & COMPLETE Phase'] =
    lifecycle.isDestroyed() && lifecycle.getPhase() === 'COMPLETE';

  // --- GATE 15: Policy-driven attempt skip (attemptCount=1 → JUDGMENT_OPEN) ---
  const singleAttemptContract: AuthoritativeObjectiveContract = {
    ...contractAudience,
    objectiveId: 'obj-single-attempt',
    attemptCount: 1,
  };
  const skipLifecycle = new ChallengeOperationalLifecycle(
    'sess-challenge-skip-01',
    challenger,
    challenged,
    singleAttemptContract
  );
  skipLifecycle.advancePhase('ATTEMPT_1_COMPLETE');
  const skipNext = skipLifecycle.resolveNextPhaseAfterAttemptComplete();
  gates['Gate 15: Policy-driven Attempt Skip (1 attempt → JUDGMENT_OPEN)'] =
    skipNext === 'JUDGMENT_OPEN';

  // --- GATE 16: ACGBR one-way boundary (generation cannot write Challenge truth) ---
  let acgbrBoundaryOk = false;
  try {
    const { assertAcgbrCannotWriteChallengeTruth, ChallengeAcgbrBridge } =
      require('../lib/acgbr');
    assertAcgbrCannotWriteChallengeTruth(['winnerId']);
  } catch (e: any) {
    acgbrBoundaryOk = e?.code === 'ACGBR_ONE_WAY_BOUNDARY';
  }
  const { ChallengeAcgbrBridge, readChallengeSnapshot, assertChallengeDnaNotBattle, assertChallengeDnaNotCypher, assertChallengeDnaNotGauntlet, computeSceneSeed, planChallengeJumbotronFaces, assertFourDistinctFaceRoles, adaptChallengeResultForPresentation, resultFinalizedDoesNotImplyPayout } =
    require('../lib/acgbr') as typeof import('../lib/acgbr');

  const snapLifecycle = new ChallengeOperationalLifecycle(
    'sess-challenge-acgbr-01',
    challenger,
    challenged,
    contractAudience
  );
  snapLifecycle.advancePhase('ATTEMPT_1_ACTIVE');
  const snap = readChallengeSnapshot(snapLifecycle);
  let snapWriteBlocked = false;
  try {
    (snap as any).winnerId = 'hacked';
  } catch {
    snapWriteBlocked = true;
  }
  // frozen snapshot may silently fail in non-strict; also check Object.isFrozen
  const snapFrozen = Object.isFrozen(snap) && Object.isFrozen(snap.objective);

  const bridge = new ChallengeAcgbrBridge('sess-challenge-acgbr-01', 'FULL');
  const world = {
    jumbotronFourFaces: true,
    jumbotronRings: true,
    kineticPanels: true,
    volumetrics: false,
    avatarAudience: true,
    deviceTier: 'HIGH' as const,
    reducedMotion: false,
    premiumEnhancementsUnlocked: false,
  };
  const runtime = bridge.syncFromLifecycle(snapLifecycle, world);
  const seedA = computeSceneSeed('sess-challenge-acgbr-01', 1, 2);
  const seedB = computeSceneSeed('sess-challenge-acgbr-01', 1, 2);
  const facePlan = planChallengeJumbotronFaces('ATTEMPT_1_ACTIVE', {
    sessionId: 'sess-challenge-acgbr-01',
    objectiveLabel: contractAudience.objective,
    activeParticipantId: challenger.participantId,
  });

  const stakeLifecycle = new ChallengeOperationalLifecycle(
    'sess-challenge-acgbr-settle',
    challenger,
    challenged,
    { ...contractAudience, judgingPolicy: 'MEASURABLE_RESULT', realStakeOrReward: '$100 USD' }
  );
  stakeLifecycle.recordMeasurableMetric(`${challenger.participantId}_score`, 10);
  stakeLifecycle.recordMeasurableMetric(`${challenged.participantId}_score`, 5);
  stakeLifecycle.advancePhase('JUDGMENT_OPEN');
  const pending = stakeLifecycle.finalizeResult();
  const pendingView = adaptChallengeResultForPresentation(pending);
  const settled = stakeLifecycle.settleResult();
  const settledView = adaptChallengeResultForPresentation(settled);

  gates['Gate 16: ACGBR One-Way Boundary + Challenge DNA + Timeline Seed'] =
    acgbrBoundaryOk &&
    snapFrozen &&
    (snapWriteBlocked || snapFrozen) &&
    runtime.sceneSeed.length === 8 &&
    seedA === seedB &&
    assertFourDistinctFaceRoles(facePlan) &&
    facePlan.find((f) => f.face === 'NORTH')?.role === 'ACTIVE_ATTEMPT' &&
    assertChallengeDnaNotBattle() &&
    assertChallengeDnaNotCypher() &&
    assertChallengeDnaNotGauntlet() &&
    pending.settlementStatus === 'PENDING' &&
    pendingView !== null &&
    resultFinalizedDoesNotImplyPayout(pendingView) &&
    settled?.settlementStatus === 'SETTLED' &&
    settledView !== null &&
    settledView.settlementImpliesPayout === true &&
    runtime.activeTemplate.blocksLiveWhileGenerating === false;

  const allPassed = Object.values(gates).every(Boolean);

  console.log('══════════════════════════════════════════════════════════════');
  console.log('LANE C: CHALLENGE OPERATIONAL ACTIVATION CERTIFICATION');
  console.log('══════════════════════════════════════════════════════════════');
  for (const [gateName, passed] of Object.entries(gates)) {
    console.log(`  ${passed ? '🟢 PASS' : '🔴 FAIL'}: ${gateName}`);
  }
  console.log('──────────────────────────────────────────────────────────────');
  console.log(`Total Gates Evaluated: ${Object.keys(gates).length}`);
  console.log(`Final Verdict: ${allPassed ? '🟢 ALL GATES PASSED' : '🔴 CERTIFICATION FAILED'}`);
  console.log('══════════════════════════════════════════════════════════════\n');

  return {
    allPassed,
    totalGates: Object.keys(gates).length,
    gates,
  };
}

// Execute when run directly via tsx
if (process.argv[1]?.includes('runLaneCChallengeOperationalCertification.test')) {
  const result = runLaneCChallengeOperationalCertification();
  if (!result.allPassed) {
    process.exit(1);
  }
}
