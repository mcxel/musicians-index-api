'use client';

import React, { useRef } from 'react';

/**
 * IntermissionDirectorEngine — Rule 7 + Rule 2 + Rule 3 Enforcer
 *
 * During INTERMISSION state in GameShowRuntime, this engine manages:
 * 1. Sponsor/commercial content rotation
 * 2. Audience activities (polls, trivia, booths, messaging, reactions)
 * 3. Audience XP earning during break
 * 4. HARD LOCK: Performer resume authority (nothing blocks a resume)
 * 5. Audience never leaves venue (Rule 1)
 *
 * State machine:
 * IDLE → PREPARING → SPONSOR_ACTIVE → AUDIENCE_ACTIVITY → READY_RESUME → ENDING
 *
 * Performer can Resume at any point in the flow. Resume immediately exits this engine.
 */

export type IntermissionPhase =
  | 'IDLE'
  | 'PREPARING_BREAK'
  | 'SPONSOR_ACTIVE'
  | 'AUDIENCE_ACTIVITY'
  | 'READY_RESUME'
  | 'ENDING';

export interface IntermissionState {
  phase: IntermissionPhase;
  elapsedMs: number;
  remainingMs: number;
  activeSponsor?: {
    name: string;
    booth?: string;
    cta: string;
    accentColor: string;
  };
  audienceXpEarned: number;
  trivaPlaying: number;
  pollVotes: number;
  boothVisits: number;
  performerCanResume: boolean; // Always true during intermission (Rule 2)
  audienceEnergyLevel: number; // 0-100
}

interface IntermissionConfig {
  totalDurationMs?: number;
  sponsorDurationMs?: number;
  activityDurationMs?: number;
  eventId: string;
  performerName: string;
  performerAccentColor: string;
}

/**
 * Hook to manage intermission state and audience activities
 */
export function useIntermissionDirector(
  isIntermissionActive: boolean,
  config: IntermissionConfig,
) {
  const [phase, setPhase] = React.useState<IntermissionPhase>('IDLE');
  const [elapsedMs, setElapsedMs] = React.useState(0);
  const [remainingMs, setRemainingMs] = React.useState(config.totalDurationMs ?? 30000);
  const [activeSponsor, setActiveSponsor] = React.useState<IntermissionState['activeSponsor']>(undefined);
  const [audienceXpEarned, setAudienceXpEarned] = React.useState(0);
  const [trivaPlaying, setTrivaPlaying] = React.useState(0);
  const [pollVotes, setPollVotes] = React.useState(0);
  const [boothVisits, setBoothVisits] = React.useState(0);
  const [energyLevel, setEnergyLevel] = React.useState(50);

  const phaseStartRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout>();

  // Phase timing config
  const phaseDurations: Record<IntermissionPhase, number> = {
    IDLE: 0,
    PREPARING_BREAK: 2000,
    SPONSOR_ACTIVE: config.sponsorDurationMs ?? 12000,
    AUDIENCE_ACTIVITY: config.activityDurationMs ?? 14000,
    READY_RESUME: 2000,
    ENDING: 0,
  };

  // Sponsor rotation (seeded for this event)
  const sponsors = [
    { name: 'BeatBox Studio', cta: 'TRY FREE', booth: 'booth-1', accentColor: '#AA2DFF' },
    { name: 'SoundGear Pro', cta: 'SHOP NOW', booth: 'booth-2', accentColor: '#00FFFF' },
    { name: 'ViralMix Labs', cta: 'LEARN MORE', booth: 'booth-3', accentColor: '#FFD700' },
  ];

  const currentSponsorIdx = Math.floor(elapsedMs / 4000) % sponsors.length;

  // Phase transition logic
  const advancePhase = React.useCallback(() => {
    const phaseOrder: IntermissionPhase[] = [
      'PREPARING_BREAK',
      'SPONSOR_ACTIVE',
      'AUDIENCE_ACTIVITY',
      'READY_RESUME',
      'ENDING',
    ];

    if (phase === 'ENDING' || phase === 'IDLE') return;

    const idx = phaseOrder.indexOf(phase);
    if (idx < phaseOrder.length - 1) {
      setPhase(phaseOrder[idx + 1]!);
      phaseStartRef.current = Date.now();
    }
  }, [phase]);

  // Main timer loop
  React.useEffect(() => {
    if (!isIntermissionActive) {
      setPhase('IDLE');
      setElapsedMs(0);
      setRemainingMs(config.totalDurationMs ?? 30000);
      return;
    }

    if (phase === 'IDLE') {
      setPhase('PREPARING_BREAK');
      phaseStartRef.current = Date.now();
      return;
    }

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const phaseDuration = phaseDurations[phase];
      const phaseElapsed = now - phaseStartRef.current;
      const totalElapsed = elapsedMs + phaseElapsed;
      const totalDuration = config.totalDurationMs ?? 30000;

      setElapsedMs(Math.min(totalElapsed, totalDuration));
      setRemainingMs(Math.max(0, totalDuration - totalElapsed));

      // Check phase transition
      if (phaseElapsed >= phaseDuration && phase !== 'ENDING') {
        advancePhase();
      }

      // Auto-end intermission when time expires
      if (totalElapsed >= totalDuration && phase !== 'ENDING') {
        setPhase('ENDING');
      }
    }, 100);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isIntermissionActive, phase, elapsedMs, config, advancePhase, phaseDurations]);

  // Simulate audience activity
  React.useEffect(() => {
    if (phase === 'AUDIENCE_ACTIVITY') {
      const activityInterval = setInterval(() => {
        // Randomly award XP for trivia answers, poll votes, booth visits
        const activity = Math.random();
        if (activity < 0.3) {
          setTrivaPlaying(t => t + 1);
          setAudienceXpEarned(x => x + 3);
          setEnergyLevel(e => Math.min(100, e + 8));
        } else if (activity < 0.6) {
          setPollVotes(v => v + 1);
          setAudienceXpEarned(x => x + 2);
          setEnergyLevel(e => Math.min(100, e + 5));
        } else {
          setBoothVisits(b => b + 1);
          setAudienceXpEarned(x => x + 3);
          setEnergyLevel(e => Math.min(100, e + 6));
        }
      }, 2000);

      return () => clearInterval(activityInterval);
    }
  }, [phase]);

  // Sponsor update
  React.useEffect(() => {
    if (phase === 'SPONSOR_ACTIVE') {
      setActiveSponsor(sponsors[currentSponsorIdx]);
    }
  }, [phase, currentSponsorIdx]);

  const state: IntermissionState = {
    phase,
    elapsedMs,
    remainingMs,
    activeSponsor,
    audienceXpEarned,
    trivaPlaying,
    pollVotes,
    boothVisits,
    performerCanResume: true, // HARD LOCK: Rule 2 — performer always can resume
    audienceEnergyLevel: energyLevel,
  };

  return state;
}

/**
 * D1-B: Performer Resume Authority
 * Hard lock — nothing can block a performer resume.
 */
export function createPerformerResumeCommand(
  onResume: () => void,
): { canResume: boolean; resume: () => void } {
  return {
    canResume: true,
    resume: () => {
      // Immediately execute resume callback
      // No sponsor can intercept
      // No poll can block
      // No countdown can prevent
      onResume();
    },
  };
}

/**
 * D1-C: Audience Continuity Rule
 * Audience can do activities during intermission but never leave.
 */
export const AUDIENCE_INTERMISSION_ACTIVITIES = {
  TRIVIA: { xp: 3, name: 'Trivia Answer', canDo: true },
  POLL: { xp: 2, name: 'Poll Vote', canDo: true },
  BOOTH: { xp: 3, name: 'Sponsor Booth Visit', canDo: true },
  MESSAGE: { xp: 1, name: 'Message Friend', canDo: true },
  REACTION: { xp: 1, name: 'Reaction Sent', canDo: true },
  PROP: { xp: 2, name: 'Equip Cosmetic/Prop', canDo: true },
  PROFILE: { xp: 1, name: 'View Profile', canDo: true },
  NEVER_LEAVE: { xp: 0, name: 'Stay in Venue', canDo: true }, // Rule 1
} as const;

/**
 * Convert intermission activities to XP actions
 */
export function getIntermissionXpActions(): Array<{
  action: string;
  xpAmount: number;
  category: 'engagement' | 'exploration' | 'social';
}> {
  return [
    { action: 'trivia-answer', xpAmount: 3, category: 'engagement' },
    { action: 'poll-vote', xpAmount: 2, category: 'engagement' },
    { action: 'booth-visit', xpAmount: 3, category: 'exploration' },
    { action: 'message-sent', xpAmount: 1, category: 'social' },
    { action: 'reaction-sent', xpAmount: 1, category: 'engagement' },
    { action: 'cosmetic-equipped', xpAmount: 2, category: 'exploration' },
    { action: 'profile-viewed', xpAmount: 1, category: 'social' },
    { action: 'full-intermission-watched', xpAmount: 5, category: 'engagement' },
  ];
}
