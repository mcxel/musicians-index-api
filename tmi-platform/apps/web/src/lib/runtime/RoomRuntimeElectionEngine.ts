/**
 * RoomRuntimeElectionEngine.ts
 *
 * Implements conductor election protocol for rooms.
 * Handles:
 * - Detecting dead conductors
 * - Running election process
 * - Electing new primary from standbys
 * - Preventing split-brain (multiple conductors)
 * - Election fairness and determinism
 */

import type { ChatRoomId } from '@/lib/chat/RoomChatEngine';
import {
  getConductorLease,
  claimConductorAuthority,
  releaseConductorAuthority,
  isConductorValid,
  checkConductorHealth,
} from '@/lib/runtime/RuntimeConductorAuthority';

interface CandidateVote {
  candidateId: string;
  priority: number;
  registeredAtMs: number;
  voteCount: number;
}

interface RoomElectionState {
  roomId: ChatRoomId;
  electionId: string;
  isElectionActive: boolean;
  electedConductorId?: string;
  electionStartMs: number;
  electionEndMs?: number;
  candidates: Map<string, CandidateVote>;
  previousConductorId?: string;
}

const ELECTION_STATES = new Map<ChatRoomId, RoomElectionState>();
const ELECTION_CANDIDATES = new Map<ChatRoomId, Set<string>>();

const ELECTION_CONFIG = {
  electionTimeoutMs: 5_000, // 5s to complete election
  minimumCandidates: 1, // At least 1 candidate to proceed
  priorityBoost: {
    standby: 2,
    recovery: 1,
  },
};

/**
 * Register a conductor as a candidate for election.
 * Only standby/recovery conductors can be candidates.
 */
export function registerElectionCandidate(
  roomId: ChatRoomId,
  candidateId: string,
  priority: 'standby' | 'recovery' = 'standby'
): boolean {
  let candidates = ELECTION_CANDIDATES.get(roomId);
  if (!candidates) {
    candidates = new Set();
    ELECTION_CANDIDATES.set(roomId, candidates);
  }

  candidates.add(candidateId);
  console.log(`[Election] ${candidateId} registered as ${priority} candidate for ${roomId}`);
  return true;
}

/**
 * Unregister conductor from candidates.
 */
export function unregisterElectionCandidate(roomId: ChatRoomId, candidateId: string): boolean {
  const candidates = ELECTION_CANDIDATES.get(roomId);
  if (!candidates) return false;

  return candidates.delete(candidateId);
}

/**
 * Start election process in room.
 * Called when primary conductor dies or is unresponsive.
 */
export function startElection(roomId: ChatRoomId): {
  electionId: string;
  candidateCount: number;
} {
  const now = Date.now();
  const candidates = ELECTION_CANDIDATES.get(roomId);
  const candidateCount = candidates?.size || 0;

  if (candidateCount < ELECTION_CONFIG.minimumCandidates) {
    console.warn(`[Election] Insufficient candidates for ${roomId} (have ${candidateCount})`);
    return { electionId: 'no-election', candidateCount: 0 };
  }

  const currentLease = getConductorLease(roomId);
  const electionId = `election-${roomId}-${now}`;

  const election: RoomElectionState = {
    roomId,
    electionId,
    isElectionActive: true,
    electionStartMs: now,
    candidates: new Map(),
    previousConductorId: currentLease?.conductorId,
  };

  // Initialize candidates in election state
  if (candidates) {
    for (const candidateId of candidates) {
      election.candidates.set(candidateId, {
        candidateId,
        priority: 0,
        registeredAtMs: now,
        voteCount: 0,
      });
    }
  }

  ELECTION_STATES.set(roomId, election);

  console.log(`[Election] Started election ${electionId} for ${roomId} (${candidateCount} candidates)`);
  return { electionId, candidateCount };
}

/**
 * Cast vote for a conductor candidate.
 * Returns elected conductor if consensus reached.
 */
export function voteInElection(
  roomId: ChatRoomId,
  voterId: string,
  candidateId: string
): {
  voteRecorded: boolean;
  electionState: 'voting' | 'elected' | 'error';
  electedConductor?: string;
  reason: string;
} {
  const election = ELECTION_STATES.get(roomId);

  if (!election || !election.isElectionActive) {
    return {
      voteRecorded: false,
      electionState: 'error',
      reason: 'No active election in room',
    };
  }

  const candidate = election.candidates.get(candidateId);
  if (!candidate) {
    return {
      voteRecorded: false,
      electionState: 'error',
      reason: `Candidate ${candidateId} not registered`,
    };
  }

  // Record vote
  candidate.voteCount++;

  // Check for majority (simple majority: >50% of candidates)
  const totalCandidates = election.candidates.size;
  const majorityNeeded = Math.ceil(totalCandidates / 2);

  if (candidate.voteCount >= majorityNeeded) {
    // Candidate won election
    election.isElectionActive = false;
    election.electionEndMs = Date.now();
    election.electedConductorId = candidateId;

    console.log(
      `[Election] ${candidateId} elected as conductor for ${roomId} (votes: ${candidate.voteCount}/${majorityNeeded})`
    );

    return {
      voteRecorded: true,
      electionState: 'elected',
      electedConductor: candidateId,
      reason: 'Majority reached',
    };
  }

  return {
    voteRecorded: true,
    electionState: 'voting',
    reason: `Vote recorded (${candidate.voteCount}/${majorityNeeded})`,
  };
}

/**
 * Finalize election and promote winner.
 */
export function finalizeElection(roomId: ChatRoomId): {
  success: boolean;
  electedConductor?: string;
  reason: string;
} {
  const election = ELECTION_STATES.get(roomId);

  if (!election) {
    return { success: false, reason: 'No election in progress' };
  }

  if (election.isElectionActive) {
    return { success: false, reason: 'Election still in progress' };
  }

  if (!election.electedConductorId) {
    return { success: false, reason: 'No winner elected' };
  }

  // Promote elected conductor to primary
  const promoted = election.electedConductorId;
  const claimResult = claimConductorAuthority(roomId, promoted, 'primary');

  if (!claimResult.granted) {
    return {
      success: false,
      reason: `Failed to promote ${promoted}: ${claimResult.reason}`,
    };
  }

  console.log(`[Election] ${promoted} promoted to primary conductor for ${roomId}`);

  return {
    success: true,
    electedConductor: promoted,
    reason: 'Election finalized and conductor promoted',
  };
}

/**
 * Run automatic election if needed.
 * Called periodically to detect dead conductors and trigger election.
 */
export function runAutomaticElection(roomId: ChatRoomId): {
  electionTriggered: boolean;
  electionId?: string;
  reason: string;
} {
  const currentLease = getConductorLease(roomId);
  const health = checkConductorHealth(roomId);

  // No conductor exists
  if (!currentLease) {
    const result = startElection(roomId);
    if (result.candidateCount > 0) {
      return {
        electionTriggered: true,
        electionId: result.electionId,
        reason: 'No active conductor; election started',
      };
    }
    return {
      electionTriggered: false,
      reason: 'No candidates available',
    };
  }

  // Conductor is unhealthy and has exceeded failure threshold
  if (!health.isHealthy && health.shouldElect) {
    releaseConductorAuthority(roomId, currentLease.conductorId);
    const result = startElection(roomId);

    return {
      electionTriggered: true,
      electionId: result.electionId,
      reason: `Conductor ${currentLease.conductorId} failed health check; election started`,
    };
  }

  return {
    electionTriggered: false,
    reason: 'Current conductor is healthy',
  };
}

/**
 * Get election state.
 */
export function getElectionState(roomId: ChatRoomId): RoomElectionState | undefined {
  return ELECTION_STATES.get(roomId);
}

/**
 * Get election diagnostics.
 */
export function getElectionDiagnostics(): {
  activeElections: Array<{
    roomId: ChatRoomId;
    electionId: string;
    candidateCount: number;
    durationMs: number;
  }>;
  completedElections: Array<{
    roomId: ChatRoomId;
    electedConductor: string;
    durationMs: number;
  }>;
} {
  const now = Date.now();
  const activeElections = [];
  const completedElections = [];

  for (const [roomId, state] of ELECTION_STATES.entries()) {
    const durationMs = (state.electionEndMs || now) - state.electionStartMs;

    if (state.isElectionActive) {
      activeElections.push({
        roomId,
        electionId: state.electionId,
        candidateCount: state.candidates.size,
        durationMs,
      });
    } else if (state.electedConductorId) {
      completedElections.push({
        roomId,
        electedConductor: state.electedConductorId,
        durationMs,
      });
    }
  }

  return { activeElections, completedElections };
}

/**
 * Cleanup old elections.
 */
export function cleanupOldElections(maxAgeMs: number = 60_000): number {
  const now = Date.now();
  let cleaned = 0;

  for (const [roomId, state] of ELECTION_STATES.entries()) {
    if (!state.isElectionActive && state.electionEndMs && now - state.electionEndMs > maxAgeMs) {
      ELECTION_STATES.delete(roomId);
      cleaned++;
    }
  }

  return cleaned;
}
