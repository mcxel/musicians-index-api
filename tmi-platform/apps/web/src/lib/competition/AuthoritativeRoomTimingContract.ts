/**
 * AuthoritativeRoomTimingContract.ts
 *
 * TMI Musical Pre-Roll, Round Clock & Showcase Timing Authority (Step 2B.1)
 *
 * Enforces the locked temporal sequence:
 *   PREPARE BEAT → PRE-ROLL → MUSICAL CUE → AUTHORITATIVE ROUND START → COMPETITIVE CLOCK STARTS
 *
 * Invariants:
 * 1. The competitive round clock MUST NOT consume time during musical pre-roll.
 * 2. Late-joining clients derive the exact track position from authoritative epochs, never starting at 0:00.
 * 3. Post-round showcase keeps beat playing for ~60s target without restarting the competition clock.
 * 4. Room/session clocks are unified across peers without introducing secondary clock drift.
 */

import { PocketDropResolution } from "../beats/BeatPocketDropAuthority";

export type TimingPhase = "PRE_ROLL" | "ROUND_LIVE" | "BEAT_SHOWCASE" | "COMPLETED";

export interface AuthoritativeRoomTimingContract {
  roomId: string;
  battleId?: string;
  beatId: string;
  cueOffsetMs: number;
  cueOffsetSeconds: number;
  preRollDurationMs: number;
  preRollDurationSeconds: number;
  playbackStartEpoch: number; // Audio element starts playback here (at cue or cue - preRoll)
  roundStartEpoch: number;    // Competitive round countdown begins here (playbackStartEpoch + preRollDurationMs)
  roundDurationSeconds: number;
  roundEndEpoch: number;      // roundStartEpoch + roundDurationSeconds * 1000
  showcaseDurationMs: number; // ~60-second target showcase window
  showcaseEndEpoch: number;   // roundEndEpoch + showcaseDurationMs
  isSafeLoopable: boolean;
  loopStartMs?: number;
  loopEndMs?: number;
}

export interface PlaybackPositionSnapshot {
  phase: TimingPhase;
  elapsedTotalSeconds: number;
  audioTrackCurrentTimeSeconds: number;
  roundRemainingSeconds: number;
  showcaseRemainingSeconds: number;
  isClockTicking: boolean;
}

export interface CreateTimingContractInput {
  roomId: string;
  battleId?: string;
  beatId: string;
  dropResolution: PocketDropResolution;
  bpm?: number | null;
  roundDurationSeconds?: number;
  showcaseDurationSeconds?: number; // target ~60s
  playbackStartEpoch?: number;
}

/**
 * Calculates pre-roll count-in duration.
 * If BPM is known, uses an exact 2-bar count-in; otherwise uses a standard 3,000ms pre-roll.
 */
export function calculatePreRollDurationMs(bpm?: number | null): number {
  if (typeof bpm === "number" && bpm >= 40 && bpm <= 300) {
    // 2 bars of 4 beats = 8 beats
    const beatDurationMs = (60 / bpm) * 1000;
    return Math.round(beatDurationMs * 8);
  }
  return 3000; // safe 3-second musical pre-roll count-in
}

/**
 * Creates an authoritative room timing contract binding beat cue, pre-roll, round countdown, and showcase.
 */
export function createAuthoritativeTimingContract(
  input: CreateTimingContractInput
): AuthoritativeRoomTimingContract {
  const {
    roomId,
    battleId,
    beatId,
    dropResolution,
    bpm,
    roundDurationSeconds = 60,
    showcaseDurationSeconds = 60, // locked ~60s target
    playbackStartEpoch = Date.now(),
  } = input;

  const preRollDurationMs = calculatePreRollDurationMs(bpm);
  const roundStartEpoch = playbackStartEpoch + preRollDurationMs;
  const roundEndEpoch = roundStartEpoch + roundDurationSeconds * 1000;
  const showcaseDurationMs = showcaseDurationSeconds * 1000;
  const showcaseEndEpoch = roundEndEpoch + showcaseDurationMs;

  return {
    roomId,
    battleId,
    beatId,
    cueOffsetMs: dropResolution.cueOffsetMs,
    cueOffsetSeconds: dropResolution.cueOffsetSeconds,
    preRollDurationMs,
    preRollDurationSeconds: Number((preRollDurationMs / 1000).toFixed(3)),
    playbackStartEpoch,
    roundStartEpoch,
    roundDurationSeconds,
    roundEndEpoch,
    showcaseDurationMs,
    showcaseEndEpoch,
    isSafeLoopable: dropResolution.isSafeLoopable,
    loopStartMs: dropResolution.loopStartMs,
    loopEndMs: dropResolution.loopEndMs,
  };
}

/**
 * Derives current musical position and clock states from the authoritative contract.
 * Late joiners call this to derive exact audio track position without drift or restarting.
 */
export function deriveAuthoritativePlaybackPosition(
  contract: AuthoritativeRoomTimingContract,
  nowEpoch = Date.now()
): PlaybackPositionSnapshot {
  const elapsedFromStartMs = Math.max(0, nowEpoch - contract.playbackStartEpoch);
  const elapsedTotalSeconds = Number((elapsedFromStartMs / 1000).toFixed(3));

  // Audio track currentTime begins at cueOffsetSeconds
  const audioTrackCurrentTimeSeconds = Number(
    (contract.cueOffsetSeconds + elapsedTotalSeconds).toFixed(3)
  );

  // 1. PRE-ROLL PHASE
  // Competitive clock has NOT started. Round time remaining remains full.
  if (nowEpoch < contract.roundStartEpoch) {
    return {
      phase: "PRE_ROLL",
      elapsedTotalSeconds,
      audioTrackCurrentTimeSeconds,
      roundRemainingSeconds: contract.roundDurationSeconds,
      showcaseRemainingSeconds: contract.showcaseDurationMs / 1000,
      isClockTicking: false, // Round clock does not tick during pre-roll
    };
  }

  // 2. ROUND LIVE PHASE
  // Competitive clock is actively ticking down from roundDurationSeconds to 0.
  if (nowEpoch < contract.roundEndEpoch) {
    const roundRemainingMs = Math.max(0, contract.roundEndEpoch - nowEpoch);
    return {
      phase: "ROUND_LIVE",
      elapsedTotalSeconds,
      audioTrackCurrentTimeSeconds,
      roundRemainingSeconds: Math.ceil(roundRemainingMs / 1000),
      showcaseRemainingSeconds: contract.showcaseDurationMs / 1000,
      isClockTicking: true,
    };
  }

  // 3. BEAT SHOWCASE PHASE (~60s target)
  // Round is finished. Beat continues playing. Winner celebrated. Next round prepares concurrently.
  if (nowEpoch < contract.showcaseEndEpoch) {
    const showcaseRemainingMs = Math.max(0, contract.showcaseEndEpoch - nowEpoch);
    return {
      phase: "BEAT_SHOWCASE",
      elapsedTotalSeconds,
      audioTrackCurrentTimeSeconds,
      roundRemainingSeconds: 0,
      showcaseRemainingSeconds: Math.ceil(showcaseRemainingMs / 1000),
      isClockTicking: false,
    };
  }

  // 4. COMPLETED PHASE
  return {
    phase: "COMPLETED",
    elapsedTotalSeconds,
    audioTrackCurrentTimeSeconds,
    roundRemainingSeconds: 0,
    showcaseRemainingSeconds: 0,
    isClockTicking: false,
  };
}
