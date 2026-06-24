'use client';

import React from 'react';

/**
 * GameShowRuntime — Event Room State Machine
 *
 * Manages event persistence across segments (Rule 7).
 * Users stay in the theater through results → intermission → host → next round.
 * Late joiners see the current state context instead of being kicked to home.
 *
 * States:
 * - WAITING: Lobby open, join enabled
 * - INTRO: Host intro, contestants loaded, countdown
 * - ROUND_ACTIVE: Game/battle/concert actively happening
 * - RESULTS: Winner(s) shown, recap video if available
 * - CURTAIN_CLOSED: Transition moment, theme change
 * - INTERMISSION: Sponsor/commercial/break, audience XP activities
 * - HOST_SEGMENT: Host talk, commentary, teases next round
 * - NEXT_ROUND: Setup for next game, "starting in N seconds"
 * - ENDING: Event conclusion, "thanks for attending"
 *
 * Each state is persistent — no page reloads, no forced exits.
 */

export type GameShowState =
  | 'WAITING'
  | 'INTRO'
  | 'ROUND_ACTIVE'
  | 'RESULTS'
  | 'CURTAIN_CLOSED'
  | 'INTERMISSION'
  | 'HOST_SEGMENT'
  | 'NEXT_ROUND'
  | 'ENDING';

export interface GameShowRuntime {
  state: GameShowState;
  currentRound: number;
  maxRounds: number;
  timeToNextState: number; // ms
  lateJoinMessage?: string;
  canJoinNextRound: boolean;
  canChat: boolean;
  canReact: boolean;
  canTip: boolean;
  canVote?: boolean;
  sponsorBoothActive?: boolean;
  countdownLabel?: string;
  resultsSummary?: string;
}

interface GameShowTransition {
  from: GameShowState;
  to: GameShowState;
  durationMs: number;
  label: string;
}

const STATE_TRANSITIONS: GameShowTransition[] = [
  { from: 'WAITING', to: 'INTRO', durationMs: 30000, label: 'Intro' },
  { from: 'INTRO', to: 'ROUND_ACTIVE', durationMs: 60000, label: 'Round starts' },
  { from: 'ROUND_ACTIVE', to: 'RESULTS', durationMs: 90000, label: 'Results shown' },
  { from: 'RESULTS', to: 'CURTAIN_CLOSED', durationMs: 5000, label: 'Curtain close' },
  { from: 'CURTAIN_CLOSED', to: 'INTERMISSION', durationMs: 2000, label: 'Intermission' },
  { from: 'INTERMISSION', to: 'HOST_SEGMENT', durationMs: 30000, label: 'Host talk' },
  { from: 'HOST_SEGMENT', to: 'NEXT_ROUND', durationMs: 10000, label: 'Next round setup' },
  { from: 'NEXT_ROUND', to: 'ROUND_ACTIVE', durationMs: 5000, label: 'Round starts' },
];

export function useGameShowRuntime(eventId: string) {
  const [state, setState] = React.useState<GameShowState>('WAITING');
  const [round, setRound] = React.useState(1);
  const [maxRounds, setMaxRounds] = React.useState(3);
  const [timeToNextState, setTimeToNextState] = React.useState(30000);
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  const transition = React.useCallback(async () => {
    const currentTransition = STATE_TRANSITIONS.find(t => t.from === state);
    if (!currentTransition) return;

    // Check if we need to advance the round
    if (currentTransition.to === 'ROUND_ACTIVE' && state === 'NEXT_ROUND') {
      setRound(r => r + 1);
    }

    // Check if event should end
    if (round >= maxRounds && currentTransition.to === 'NEXT_ROUND') {
      setState('ENDING');
      return;
    }

    setState(currentTransition.to);
    setTimeToNextState(currentTransition.durationMs);

    // Auto-advance to next state
    timeoutRef.current = setTimeout(() => {
      void transition();
    }, currentTransition.durationMs);
  }, [state, round, maxRounds]);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Start the initial transition
  React.useEffect(() => {
    void transition();
  }, []);

  const runtime: GameShowRuntime = {
    state,
    currentRound: round,
    maxRounds,
    timeToNextState,
    lateJoinMessage: getLateJoinMessage(state, round),
    canJoinNextRound: state === 'NEXT_ROUND' || state === 'WAITING' || state === 'HOST_SEGMENT',
    canChat: true,
    canReact: true,
    canTip: state !== 'WAITING',
    canVote: state === 'RESULTS',
    sponsorBoothActive: state === 'INTERMISSION',
    countdownLabel: getCountdownLabel(state, timeToNextState),
    resultsSummary: getResultsSummary(state, round),
  };

  return runtime;
}

function getLateJoinMessage(state: GameShowState, round: number): string {
  switch (state) {
    case 'WAITING':
      return 'Event lobby is open. Join now!';
    case 'INTRO':
      return `Round ${round} intro in progress. Standby.`;
    case 'ROUND_ACTIVE':
      return `Round ${round} is live. Keep watching!`;
    case 'RESULTS':
      return `Results for Round ${round}. Vote or watch recap.`;
    case 'CURTAIN_CLOSED':
      return 'Transition moment. Stay seated.';
    case 'INTERMISSION':
      return 'Intermission break. Check sponsor booth or play trivia while you wait.';
    case 'HOST_SEGMENT':
      return 'Host commentary. Next round coming soon.';
    case 'NEXT_ROUND':
      return `Ready to join Round ${round + 1}? [ JOIN NEXT ]`;
    case 'ENDING':
      return 'Event concluded. Thanks for attending!';
    default:
      return '';
  }
}

function getCountdownLabel(state: GameShowState, timeToNextStateMs: number): string {
  const secs = Math.ceil(timeToNextStateMs / 1000);
  const mins = Math.floor(secs / 60);
  const s = secs % 60;
  const timeStr = `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

  switch (state) {
    case 'WAITING':
      return `Event starts in ${timeStr}`;
    case 'INTRO':
      return `Round starts in ${timeStr}`;
    case 'ROUND_ACTIVE':
      return `Round ends in ${timeStr}`;
    case 'RESULTS':
      return `Intermission in ${timeStr}`;
    case 'CURTAIN_CLOSED':
      return 'Curtain closing…';
    case 'INTERMISSION':
      return `Host segment in ${timeStr}`;
    case 'HOST_SEGMENT':
      return `Next round in ${timeStr}`;
    case 'NEXT_ROUND':
      return `Round starts in ${timeStr}`;
    case 'ENDING':
      return 'Event ended';
    default:
      return '';
  }
}

function getResultsSummary(state: GameShowState, round: number): string | undefined {
  if (state === 'RESULTS') {
    return `Round ${round} winner announced`;
  }
  return undefined;
}
