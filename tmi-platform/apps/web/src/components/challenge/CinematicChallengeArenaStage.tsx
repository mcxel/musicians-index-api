'use client';

/**
 * CinematicChallengeArenaStage.tsx
 *
 * Canonical Lane C Cinematic Challenge Arena Stage
 *
 * Laws:
 * 1. Center of Gravity: The OBJECTIVE CONTRACT suspended between competitors (NOT generic Battle VS).
 * 2. Real Fields Only: Objective, category, time limit, attempts, real stake (or explicitly NONE), rules.
 * 3. Distinct Judgment Paths: AUDIENCE_VOTE vs AUTHORIZED_JUDGES vs MEASURABLE_RESULT.
 * 4. Universal Media Player Fabric: Non-dedicated slots, single PROGRAM audio authority, shared decoders.
 * 5. Accessibility & Device Modes: FULL (cinematic), FAST, ACCESSIBLE (reduced motion).
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  ChallengeOperationalLifecycle,
  ChallengeLifecyclePhase,
  ChallengeBroadcastComposition,
  ChallengeJudgmentPolicy,
  AuthoritativeObjectiveContract,
  ChallengeResult,
} from '@/lib/challenge/ChallengeOperationalLifecycle';
import { ChallengePresentationPack } from '@/lib/challenge/ChallengePresentationPack';
import { ParticipantEntranceProfile } from '@/lib/battle/CinematicParticipantArrivalDirector';
import { PerformerSponsorCabinetOverlay } from '@/components/performer/PerformerSponsorCabinetOverlay';
import {
  ChallengeCinematicProfile,
  ChallengeCinematicScene,
} from '@/lib/challenge/ChallengeCinematicProfile';
import { JumbotronImpulseSeenPrompt } from '@/components/jumbotron/JumbotronImpulseSeenPrompt';

export interface CinematicChallengeArenaStageProps {
  challengeSessionId?: string;
  initialPolicy?: ChallengeJudgmentPolicy;
  objectiveText?: string;
  stakeText?: string;
}

export default function CinematicChallengeArenaStage({
  challengeSessionId = 'sess-challenge-prod-01',
  initialPolicy = 'AUDIENCE_VOTE',
  objectiveText = '60-SECOND FREESTYLE ON 140 BPM BEAT',
  stakeText = 'NONE',
}: CinematicChallengeArenaStageProps) {
  const [phase, setPhase] = useState<ChallengeLifecyclePhase>('READY');
  const [composition, setComposition] = useState<ChallengeBroadcastComposition>('DUAL');
  const [pacingMode, setPacingMode] = useState<'FULL' | 'FAST' | 'ACCESSIBLE'>('FULL');
  const [policy, setPolicy] = useState<ChallengeJudgmentPolicy>(initialPolicy);

  // Audio level state (derived from canonical analysis signal)
  const [audioLevel, setAudioLevel] = useState(0.45);

  // Media Player Routing
  const [activeSlot, setActiveSlot] = useState<number>(1);
  const [selectedSourceType, setSelectedSourceType] = useState<string>('CHALLENGE_PROGRAM');

  // Voting & scoring state
  const [audienceVotes, setAudienceVotes] = useState<{ challenger: number; challenged: number }>({
    challenger: 142,
    challenged: 128,
  });
  const [judgeScores, setJudgeScores] = useState<Record<string, { challenger: number; challenged: number }>>({
    'judge-alpha-01': { challenger: 88, challenged: 82 },
    'judge-beta-02': { challenger: 91, challenged: 85 },
  });
  const [measurableTelemetry, setMeasurableTelemetry] = useState<{ challenger: number; challenged: number }>({
    challenger: 94.2,
    challenged: 89.5,
  });

  const [finalResult, setFinalResult] = useState<ChallengeResult | null>(null);
  const [attemptSeconds, setAttemptSeconds] = useState(60);

  // Participant profiles
  const challenger: ParticipantEntranceProfile = useMemo(
    () => ({
      participantId: 'artist-apex-spit',
      name: 'APEX SPIT',
      role: 'CHALLENGER',
      hometown: 'ATLANTA, GA',
      genre: 'BOOM BAP',
      record: '12-1',
    }),
    []
  );

  const challenged: ParticipantEntranceProfile = useMemo(
    () => ({
      participantId: 'artist-cipher-queen',
      name: 'CIPHER QUEEN',
      role: 'PERFORMER',
      hometown: 'BROOKLYN, NY',
      genre: 'HARDCORE HIP-HOP',
      record: '16-0',
    }),
    []
  );

  const objectiveContract: AuthoritativeObjectiveContract = useMemo(
    () => ({
      objectiveId: 'obj-contract-140bpm',
      objective: objectiveText,
      category: 'TECHNICAL FREESTYLE',
      timeLimitSec: 60,
      attemptCount: 2,
      judgingPolicy: policy,
      realStakeOrReward: stakeText,
      qualificationRules: [
        'Strict 140 BPM instrumental sync',
        'Continuous flow with zero 4-bar stumbles',
        'No pre-written lyrics allowed',
      ],
    }),
    [objectiveText, policy, stakeText]
  );

  // Lifecycle orchestrator
  const lifecycle = useMemo(() => {
    const lc = new ChallengeOperationalLifecycle(
      challengeSessionId,
      challenger,
      challenged,
      objectiveContract,
      'challenge-arena'
    );
    lc.initializeOperationalSources();
    return lc;
  }, [challengeSessionId, challenger, challenged, objectiveContract]);

  const pack = useMemo(() => new ChallengePresentationPack(pacingMode), [pacingMode]);

  const cinematicProfile = useMemo(
    () => new ChallengeCinematicProfile(challengeSessionId, 'ARENA_PRO_HYBRID', 'NORMAL', pacingMode === 'ACCESSIBLE'),
    [challengeSessionId, pacingMode]
  );

  const activeScene: ChallengeCinematicScene = useMemo(
    () =>
      cinematicProfile.resolveScene(
        phase,
        objectiveContract,
        challenger.name,
        challenged.name,
        phase.includes('2') ? 2 : 1,
        attemptSeconds,
        finalResult
      ),
    [cinematicProfile, phase, objectiveContract, challenger.name, challenged.name, attemptSeconds, finalResult]
  );

  // Handle phase advance
  const handleAdvancePhase = (target: ChallengeLifecyclePhase) => {
    const cp = lifecycle.advancePhase(target);
    setPhase(cp.phase);
    setComposition(cp.composition);

    if (target === 'ATTEMPT_1_COUNTDOWN' || target === 'ATTEMPT_2_COUNTDOWN') {
      setAttemptSeconds(3);
    } else if (target === 'ATTEMPT_1_ACTIVE' || target === 'ATTEMPT_2_ACTIVE') {
      setAttemptSeconds(objectiveContract.timeLimitSec);
    }

    if (target === 'RESULT_FINALIZED') {
      const res = lifecycle.finalizeResult();
      setFinalResult(res);
    }
  };

  // Waveform bars derived from canonical audio
  const waveformBars = pack.deriveWaveformBars(audioLevel, 20);
  const contractCard = pack.formatContractCard(objectiveContract);
  const lighting = pack.getLightingCue(phase);

  return (
    <div
      data-testid="challenge-arena-stage"
      style={{
        minHeight: '85vh',
        background: `radial-gradient(circle at 50% 20%, ${lighting.contractBacklight} 0%, ${lighting.ambientColor} 70%)`,
        color: '#fff',
        borderRadius: 16,
        border: '1px solid rgba(255, 215, 0, 0.25)',
        padding: '20px 16px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
      }}
    >
      {/* Top Telemetry Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          borderBottom: '1px solid rgba(255, 215, 0, 0.2)',
          paddingBottom: 14,
          marginBottom: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: '0.25em',
              background: '#FFD700',
              color: '#000',
              padding: '4px 8px',
              borderRadius: 4,
            }}
          >
            CHALLENGE ARENA
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
            SESSION: <span style={{ color: '#00FFFF' }}>{challengeSessionId}</span>
          </div>
          <div
            style={{
              fontSize: 11,
              color: '#FFD700',
              border: '1px solid rgba(255,215,0,0.4)',
              padding: '2px 8px',
              borderRadius: 12,
            }}
          >
            PHASE: {phase}
          </div>
          <div
            data-testid="acgbr-scene-badge"
            style={{
              fontSize: 10,
              color: '#00FFFF',
              border: '1px solid rgba(0,255,255,0.4)',
              padding: '2px 8px',
              borderRadius: 12,
              letterSpacing: '0.05em',
            }}
          >
            ACGBR: {activeScene.token} · {activeScene.seed}
          </div>
        </div>

        {/* Jumbotron "You Want to Be Seen?" Impulse Prompt & Pacing Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <JumbotronImpulseSeenPrompt
            roomId={challengeSessionId}
            venueId="venue-challenge-arena-01"
            performerId={challenger.participantId}
            participantId="usr-fan-live-01"
            participantName="Spotlight Fan"
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em' }}>
              DEVICE MODE:
            </span>
          {(['FULL', 'FAST', 'ACCESSIBLE'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setPacingMode(mode)}
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: '4px 8px',
                borderRadius: 4,
                border: 'none',
                cursor: 'pointer',
                background: pacingMode === mode ? '#00FFFF' : 'rgba(255,255,255,0.1)',
                color: pacingMode === mode ? '#000' : '#fff',
              }}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>
    </div>

      {/* Main Challenge Visual Arena */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: composition === 'CHALLENGER_DOMINANT' ? '2fr 1fr 1fr' : composition === 'CHALLENGED_DOMINANT' ? '1fr 1fr 2fr' : '1fr 1.4fr 1fr',
          gap: 16,
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        {/* LEFT: Challenger Live Video Panel */}
        <div
          data-testid="challenger-panel"
          style={{
            background: 'linear-gradient(180deg, rgba(0,255,255,0.12), rgba(0,0,0,0.8))',
            border: phase.includes('1') ? '2px solid #00FFFF' : '1px solid rgba(0,255,255,0.3)',
            borderRadius: 12,
            padding: 14,
            position: 'relative',
            boxShadow: phase.includes('1') ? '0 0 25px rgba(0,255,255,0.4)' : 'none',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 10, color: '#00FFFF', fontWeight: 800, letterSpacing: '0.15em' }}>
              CHALLENGER
            </span>
            <span style={{ fontSize: 9, background: 'rgba(0,255,255,0.2)', color: '#00FFFF', padding: '2px 6px', borderRadius: 4 }}>
              LIVE WEBRTC
            </span>
          </div>

          <div
            style={{
              height: 140,
              background: '#040d1a',
              borderRadius: 8,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
              overflow: 'hidden',
              border: '1px solid rgba(0,255,255,0.2)',
            }}
          >
            <div style={{ fontSize: 40 }}>🎤</div>
            <div style={{ fontSize: 14, fontWeight: 900, color: '#fff', marginTop: 6 }}>
              {challenger.name}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>
              {challenger.genre} · {challenger.record}
            </div>

            {phase === 'ATTEMPT_1_ACTIVE' && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 6,
                  left: 6,
                  right: 6,
                  background: 'rgba(0,255,255,0.9)',
                  color: '#000',
                  fontSize: 10,
                  fontWeight: 900,
                  textAlign: 'center',
                  padding: '3px 0',
                  borderRadius: 4,
                }}
              >
                ACTIVE ATTEMPT 1 IN PROGRESS
              </div>
            )}
          </div>
        </div>

        {/* CENTER: SUSPENDED OBJECTIVE CONTRACT (The Center of Gravity) */}
        <div
          data-testid="objective-contract-card"
          style={{
            background: 'linear-gradient(180deg, rgba(255,215,0,0.15), rgba(15,10,0,0.9))',
            border: '2px solid #FFD700',
            borderRadius: 14,
            padding: 16,
            textAlign: 'center',
            position: 'relative',
            boxShadow: '0 0 35px rgba(255,215,0,0.35)',
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: '0.2em',
              color: '#FFD700',
              marginBottom: 4,
            }}
          >
            OBJECTIVE CONTRACT
          </div>

          <div style={{ fontSize: 15, fontWeight: 900, color: '#fff', marginBottom: 6, lineHeight: 1.3 }}>
            {contractCard.title}
          </div>

          <div
            style={{
              display: 'inline-block',
              fontSize: 10,
              fontWeight: 800,
              color: '#000',
              background: '#00FFFF',
              padding: '3px 10px',
              borderRadius: 12,
              marginBottom: 10,
            }}
          >
            {contractCard.policyBadge}
          </div>

          {/* Canonical Audio Analysis Waveform */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-end',
              gap: 3,
              height: 38,
              background: 'rgba(0,0,0,0.5)',
              borderRadius: 6,
              padding: '4px 8px',
              marginBottom: 12,
            }}
          >
            {waveformBars.map((height, idx) => (
              <div
                key={idx}
                style={{
                  width: 6,
                  height: `${height * 100}%`,
                  background: phase.includes('ACTIVE') ? '#00FFFF' : '#FFD700',
                  borderRadius: 2,
                  transition: 'height 0.1s ease',
                }}
              />
            ))}
          </div>

          {/* Rules & Stakes */}
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: '#FFD700',
              background: 'rgba(255,215,0,0.1)',
              padding: '4px 8px',
              borderRadius: 6,
              marginBottom: 8,
            }}
          >
            {contractCard.stake}
          </div>

          <div style={{ textAlign: 'left', fontSize: 10, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
            {contractCard.rules.map((rule, idx) => (
              <div key={idx}>✓ {rule}</div>
            ))}
          </div>
        </div>

        {/* RIGHT: Challenged Live Video Panel */}
        <div
          data-testid="challenged-panel"
          style={{
            background: 'linear-gradient(180deg, rgba(255,45,170,0.12), rgba(0,0,0,0.8))',
            border: phase.includes('2') ? '2px solid #FF2DAA' : '1px solid rgba(255,45,170,0.3)',
            borderRadius: 12,
            padding: 14,
            position: 'relative',
            boxShadow: phase.includes('2') ? '0 0 25px rgba(255,45,170,0.4)' : 'none',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 10, color: '#FF2DAA', fontWeight: 800, letterSpacing: '0.15em' }}>
              CHALLENGED
            </span>
            <span style={{ fontSize: 9, background: 'rgba(255,45,170,0.2)', color: '#FF2DAA', padding: '2px 6px', borderRadius: 4 }}>
              LIVE WEBRTC
            </span>
          </div>

          <div
            style={{
              height: 140,
              background: '#150310',
              borderRadius: 8,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
              overflow: 'hidden',
              border: '1px solid rgba(255,45,170,0.2)',
            }}
          >
            <div style={{ fontSize: 40 }}>👑</div>
            <div style={{ fontSize: 14, fontWeight: 900, color: '#fff', marginTop: 6 }}>
              {challenged.name}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>
              {challenged.genre} · {challenged.record}
            </div>

            {phase === 'ATTEMPT_2_ACTIVE' && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 6,
                  left: 6,
                  right: 6,
                  background: 'rgba(255,45,170,0.9)',
                  color: '#000',
                  fontSize: 10,
                  fontWeight: 900,
                  textAlign: 'center',
                  padding: '3px 0',
                  borderRadius: 4,
                }}
              >
                ACTIVE ATTEMPT 2 IN PROGRESS
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Judgment Policy Specific Section */}
      <div
        data-testid="judgment-container"
        style={{
          background: 'rgba(0,0,0,0.6)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 12,
          padding: 16,
          marginBottom: 20,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#FFD700', letterSpacing: '0.1em' }}>
            AUTHORITATIVE DECISION PATH: {policy}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['AUDIENCE_VOTE', 'AUTHORIZED_JUDGES', 'MEASURABLE_RESULT'] as const).map((pol) => (
              <button
                key={pol}
                onClick={() => setPolicy(pol)}
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  padding: '3px 6px',
                  borderRadius: 4,
                  border: 'none',
                  cursor: 'pointer',
                  background: policy === pol ? '#FFD700' : 'rgba(255,255,255,0.1)',
                  color: policy === pol ? '#000' : '#fff',
                }}
              >
                {pol.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* PATH 1: AUDIENCE VOTE */}
        {policy === 'AUDIENCE_VOTE' && (
          <div data-testid="audience-vote-panel" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button
              onClick={() => {
                setAudienceVotes((prev) => ({ ...prev, challenger: prev.challenger + 1 }));
                lifecycle.submitAudienceVote({
                  voterId: `fan-${Date.now()}`,
                  targetParticipantId: challenger.participantId,
                  voteWeight: 1,
                  submittedAtMs: Date.now(),
                });
              }}
              style={{
                flex: 1,
                padding: '10px 12px',
                background: 'rgba(0,255,255,0.2)',
                border: '1px solid #00FFFF',
                borderRadius: 8,
                color: '#00FFFF',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              VOTE {challenger.name} ({audienceVotes.challenger})
            </button>
            <div style={{ fontSize: 12, fontWeight: 900, color: 'rgba(255,255,255,0.4)' }}>VS</div>
            <button
              onClick={() => {
                setAudienceVotes((prev) => ({ ...prev, challenged: prev.challenged + 1 }));
                lifecycle.submitAudienceVote({
                  voterId: `fan-${Date.now()}`,
                  targetParticipantId: challenged.participantId,
                  voteWeight: 1,
                  submittedAtMs: Date.now(),
                });
              }}
              style={{
                flex: 1,
                padding: '10px 12px',
                background: 'rgba(255,45,170,0.2)',
                border: '1px solid #FF2DAA',
                borderRadius: 8,
                color: '#FF2DAA',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              VOTE {challenged.name} ({audienceVotes.challenged})
            </button>
          </div>
        )}

        {/* PATH 2: AUTHORIZED JUDGES */}
        {policy === 'AUTHORIZED_JUDGES' && (
          <div data-testid="judges-panel" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: 10, borderRadius: 8 }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>
                JUDGE 1 (ALPHA)
              </div>
              <div style={{ fontSize: 12, fontWeight: 700 }}>
                {challenger.name}: {judgeScores['judge-alpha-01'].challenger} pts · {challenged.name}: {judgeScores['judge-alpha-01'].challenged} pts
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: 10, borderRadius: 8 }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>
                JUDGE 2 (BETA)
              </div>
              <div style={{ fontSize: 12, fontWeight: 700 }}>
                {challenger.name}: {judgeScores['judge-beta-02'].challenger} pts · {challenged.name}: {judgeScores['judge-beta-02'].challenged} pts
              </div>
            </div>
          </div>
        )}

        {/* PATH 3: MEASURABLE RESULT */}
        {policy === 'MEASURABLE_RESULT' && (
          <div data-testid="measurable-panel" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: 'rgba(0,255,255,0.05)', padding: 10, borderRadius: 8, border: '1px solid rgba(0,255,255,0.3)' }}>
              <div style={{ fontSize: 10, color: '#00FFFF' }}>FLOW ACCURACY BENCHMARK</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>
                {measurableTelemetry.challenger}%
              </div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>AUTHORITATIVE METRIC</div>
            </div>
            <div style={{ background: 'rgba(255,45,170,0.05)', padding: 10, borderRadius: 8, border: '1px solid rgba(255,45,170,0.3)' }}>
              <div style={{ fontSize: 10, color: '#FF2DAA' }}>FLOW ACCURACY BENCHMARK</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>
                {measurableTelemetry.challenged}%
              </div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>AUTHORITATIVE METRIC</div>
            </div>
          </div>
        )}
      </div>

      {/* Authoritative Result Banner (when finalized) */}
      {finalResult && (
        <div
          data-testid="challenge-result-banner"
          style={{
            background: 'linear-gradient(90deg, rgba(255,215,0,0.2), rgba(0,255,255,0.2))',
            border: '2px solid #FFD700',
            borderRadius: 12,
            padding: 16,
            marginBottom: 20,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 900, color: '#FFD700', letterSpacing: '0.15em' }}>
            🏆 {finalResult.presentationPayload.headline}
          </div>
          <div style={{ fontSize: 13, color: '#fff', marginTop: 4, fontWeight: 700 }}>
            {finalResult.authoritativeResult.summaryText}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8, fontSize: 11 }}>
            <span style={{ color: '#00FFFF' }}>XP AWARDED: +{finalResult.presentationPayload.xpAwarded}</span>
            <span style={{ color: '#FFD700' }}>SETTLEMENT: {finalResult.settlementStatus}</span>
            {finalResult.settlementReference && (
              <span style={{ color: 'rgba(255,255,255,0.6)' }}>TX: {finalResult.settlementReference}</span>
            )}
          </div>
        </div>
      )}

      {/* Universal Media Player Slot Controller (Universal Player Freedom Law) */}
      <div
        data-testid="universal-player-controller"
        style={{
          background: 'rgba(5,5,16,0.9)',
          border: '1px solid rgba(0,255,255,0.2)',
          borderRadius: 10,
          padding: 12,
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 10, color: '#00FFFF', fontWeight: 800, letterSpacing: '0.1em' }}>
            UNIVERSAL MEDIA FABRIC (SLOTS 1–16)
          </span>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>
            NON-DEDICATED · SHARED DECODER · SINGLE PROGRAM AUDIO
          </span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {[
            { label: 'SLOT 1 (MAIN)', slot: 1 },
            { label: 'SLOT 2 (ISO A)', slot: 2 },
            { label: 'SLOT 3 (ISO B)', slot: 3 },
            { label: 'SLOT 4 (JUMBOTRON)', slot: 4 },
          ].map((item) => (
            <button
              key={item.slot}
              onClick={() => {
                setActiveSlot(item.slot);
                const source =
                  item.slot === 1
                    ? 'CHALLENGE_PROGRAM'
                    : item.slot === 2
                    ? 'CHALLENGER_ISO'
                    : item.slot === 3
                    ? 'CHALLENGED_ISO'
                    : 'JUMBOTRON_FEED';
                setSelectedSourceType(source);
                lifecycle.getPlayerFabric().take(`slot-${item.slot}`, `src-${source}`, 'MAIN');
                lifecycle.getPlayerFabric().rebalanceAudioAuthority();
              }}
              style={{
                fontSize: 10,
                padding: '6px 12px',
                borderRadius: 6,
                border: activeSlot === item.slot ? '1px solid #00FFFF' : '1px solid rgba(255,255,255,0.2)',
                background: activeSlot === item.slot ? 'rgba(0,255,255,0.25)' : 'rgba(0,0,0,0.5)',
                color: activeSlot === item.slot ? '#00FFFF' : 'rgba(255,255,255,0.7)',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {item.label}: {item.slot === 1 ? 'PROGRAM (AUDIO)' : 'MUTED'}
            </button>
          ))}
        </div>
      </div>

      {/* Pre-Routed Performer Sponsor Overlay Cabinet */}
      <div style={{ marginBottom: 20 }}>
        <PerformerSponsorCabinetOverlay
          performerId={challenger.participantId}
          liveSessionId={challengeSessionId}
        />
      </div>

      {/* Operational Phase Progression Stepper */}
      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.1)',
          paddingTop: 12,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 6,
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginRight: 6 }}>
          LIFECYCLE STEP:
        </span>
        {(
          [
            'READY',
            'CHALLENGER_ARRIVAL',
            'CHALLENGED_ARRIVAL',
            'OBJECTIVE_CONTRACT_ASSEMBLY',
            'ATTEMPT_1_ACTIVE',
            'ATTEMPT_2_ACTIVE',
            'JUDGMENT_OPEN',
            'RESULT_FINALIZED',
            'COMPLETE',
          ] as ChallengeLifecyclePhase[]
        ).map((p) => (
          <button
            key={p}
            onClick={() => handleAdvancePhase(p)}
            style={{
              fontSize: 9,
              padding: '4px 8px',
              borderRadius: 4,
              border: 'none',
              cursor: 'pointer',
              background: phase === p ? '#FFD700' : 'rgba(255,255,255,0.08)',
              color: phase === p ? '#000' : 'rgba(255,255,255,0.7)',
              fontWeight: 700,
            }}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
