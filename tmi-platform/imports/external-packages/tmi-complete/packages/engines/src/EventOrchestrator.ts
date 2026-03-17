/**
 * EventOrchestrator.ts
 * Purpose: Complete event lifecycle — deadlines, queues, live runtime, winners, prizes.
 * Placement: packages/engines/src/EventOrchestrator.ts
 *            Import via @tmi/engines/EventOrchestrator
 * Depends on: Nothing (pure functions)
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type EventType =
  | 'GLOBAL_CYPHER_SUNDAY'
  | 'WORLD_DANCE_PARTY'
  | 'BEAT_AUCTION_OPEN'
  | 'GLOBAL_KARAOKE_NIGHT'
  | 'GLOBAL_COMEDY_NIGHT'
  | 'DANCE_BATTLE_SUNDAY'
  | 'BEAT_BATTLE_SUNDAY'
  | 'OPEN_SHINE_CYPHER'
  | 'SOUND_SQUARES'
  | 'OFF_THE_CUFF'
  | 'IDOLX_MONTHLY'
  | 'DEAL_VS_FEUD_1000'
  | 'DIRTY_DOZENS'
  | 'LIVE_ANYTIME'
  | 'WORLD_PREMIERE'
  | 'BATTLE_OF_THE_BANDS'
  | 'WORLD_DANCE_CHAMPIONSHIP'
  | 'LAUGH_CHAMPIONSHIP';

export type EventStatus =
  | 'SCHEDULED'       // on calendar
  | 'SUBMISSION_OPEN' // accepting performer submissions
  | 'SUBMISSION_CLOSED'
  | 'QUEUE_LOCKED'    // performer order finalized
  | 'WARMUP'          // 30 min before go-live
  | 'LIVE'
  | 'INTERMISSION'
  | 'VOTING_ACTIVE'
  | 'VOTING_CLOSED'
  | 'JUDGING'
  | 'RESULTS_PENDING'
  | 'COMPLETED'
  | 'CANCELLED';

export type ParticipantStatus =
  | 'SUBMITTED'
  | 'APPROVED'
  | 'WAITLISTED'
  | 'REJECTED'
  | 'PERFORMING'
  | 'WAITING'
  | 'ELIMINATED'
  | 'WINNER'
  | 'RUNNER_UP'
  | 'NO_SHOW';

export interface EventParticipant {
  userId: string;
  groupId?: string;
  queuePosition: number;
  status: ParticipantStatus;
  score: number;
  votes: number;
  judgeScore?: number;
  performedAt?: Date;
  prizeClaimId?: string;
}

export interface LiveEvent {
  id: string;
  type: EventType;
  title: string;
  status: EventStatus;
  scheduledAt: Date;         // UTC
  goLiveAt?: Date;
  endedAt?: Date;
  durationMinutes: number;
  submissionDeadline: Date;
  maxParticipants: number;
  participants: EventParticipant[];
  currentPerformerIndex: number;
  beatId?: string;           // for beat battles/cyphers
  roomId: string;
  sponsorContractIds: string[];
  prizeIds: string[];
  viewerCount: number;
  replayUrl?: string;
  adminOverrideBy?: string;
}

// ─── Weekly Schedule Definition ──────────────────────────────────────────────

export interface WeeklySlot {
  eventType: EventType;
  emoji: string;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;  // 0=Sun
  utcHour: number;
  utcMinute: number;
  durationMinutes: number;
  submissionWindowOpensDaysBefore: number;
  color: string;
  venueType: 'ARENA' | 'STUDIO' | 'DANCE_FLOOR' | 'COMEDY_CLUB' | 'MARKETPLACE' | 'OUTDOOR';
}

export const WEEKLY_SCHEDULE: WeeklySlot[] = [
  // Sunday — Battle Day
  { eventType: 'DANCE_BATTLE_SUNDAY',  emoji: '💃', dayOfWeek: 0, utcHour: 15, utcMinute: 0, durationMinutes: 90,  submissionWindowOpensDaysBefore: 5, color: '#22E7FF', venueType: 'DANCE_FLOOR' },
  { eventType: 'BEAT_BATTLE_SUNDAY',   emoji: '🎹', dayOfWeek: 0, utcHour: 17, utcMinute: 0, durationMinutes: 90,  submissionWindowOpensDaysBefore: 5, color: '#FF2DAA', venueType: 'STUDIO' },
  { eventType: 'OPEN_SHINE_CYPHER',    emoji: '🎤', dayOfWeek: 0, utcHour: 19, utcMinute: 0, durationMinutes: 60,  submissionWindowOpensDaysBefore: 3, color: '#00FFA8', venueType: 'ARENA' },
  { eventType: 'GLOBAL_CYPHER_SUNDAY', emoji: '🌍', dayOfWeek: 0, utcHour: 21, utcMinute: 0, durationMinutes: 120, submissionWindowOpensDaysBefore: 5, color: '#FFD700', venueType: 'ARENA' },
  // Monday — Rest (LIVE_ANYTIME only)
  // Tuesday — Beat Market
  { eventType: 'BEAT_AUCTION_OPEN',    emoji: '💰', dayOfWeek: 2, utcHour: 18, utcMinute: 0, durationMinutes: 1440, submissionWindowOpensDaysBefore: 7, color: '#FFD700', venueType: 'MARKETPLACE' },
  // Wednesday — Karaoke
  { eventType: 'GLOBAL_KARAOKE_NIGHT', emoji: '🎙️', dayOfWeek: 3, utcHour: 19, utcMinute: 0, durationMinutes: 120, submissionWindowOpensDaysBefore: 2, color: '#22E7FF', venueType: 'STUDIO' },
  // Thursday — Prep
  // Friday — Comedy
  { eventType: 'GLOBAL_COMEDY_NIGHT',  emoji: '😂', dayOfWeek: 5, utcHour: 20, utcMinute: 0, durationMinutes: 120, submissionWindowOpensDaysBefore: 5, color: '#FFD700', venueType: 'COMEDY_CLUB' },
  // Saturday — Games
  { eventType: 'SOUND_SQUARES',        emoji: '🎮', dayOfWeek: 6, utcHour: 17, utcMinute: 0, durationMinutes: 90,  submissionWindowOpensDaysBefore: 2, color: '#6B39FF', venueType: 'STUDIO' },
  { eventType: 'OFF_THE_CUFF',         emoji: '⚡', dayOfWeek: 6, utcHour: 20, utcMinute: 0, durationMinutes: 90,  submissionWindowOpensDaysBefore: 1, color: '#FF2DAA', venueType: 'COMEDY_CLUB' },
  { eventType: 'WORLD_DANCE_PARTY',    emoji: '🌐', dayOfWeek: 6, utcHour: 22, utcMinute: 0, durationMinutes: 180, submissionWindowOpensDaysBefore: 0, color: '#22E7FF', venueType: 'DANCE_FLOOR' },
];

// ─── Pure Functions ───────────────────────────────────────────────────────────

/** Get next occurrence of a weekly event */
export function getNextOccurrence(slot: WeeklySlot, reference: Date = new Date()): Date {
  const d = new Date(reference);
  d.setUTCHours(slot.utcHour, slot.utcMinute, 0, 0);
  const dayDiff = (slot.dayOfWeek - d.getUTCDay() + 7) % 7;
  d.setUTCDate(d.getUTCDate() + (dayDiff === 0 && reference > d ? 7 : dayDiff));
  return d;
}

/** Get milliseconds until event starts */
export function msUntil(eventDate: Date): number {
  return Math.max(0, eventDate.getTime() - Date.now());
}

/** Format countdown to human-readable string */
export function formatCountdown(ms: number): string {
  if (ms <= 0) return 'LIVE';
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

/** Get event status based on time */
export function getLiveStatus(
  scheduledAt: Date,
  durationMinutes: number,
): 'UPCOMING' | 'STARTING_SOON' | 'LIVE' | 'ENDED' {
  const now = Date.now();
  const start = scheduledAt.getTime();
  const end = start + durationMinutes * 60_000;
  if (now > end) return 'ENDED';
  if (now >= start) return 'LIVE';
  if (start - now <= 15 * 60_000) return 'STARTING_SOON';
  return 'UPCOMING';
}

/** Sort participants by score (for leaderboard) */
export function rankParticipants(participants: EventParticipant[]): EventParticipant[] {
  return [...participants].sort((a, b) => {
    const scoreA = a.score + (a.judgeScore ?? 0);
    const scoreB = b.score + (b.judgeScore ?? 0);
    return scoreB - scoreA;
  });
}

/** Determine winners from ranked participants */
export function determineWinners(
  participants: EventParticipant[],
  prizeCount: number = 3,
): { winner: EventParticipant; place: number }[] {
  const ranked = rankParticipants(participants.filter(p => p.status !== 'ELIMINATED' && p.status !== 'NO_SHOW'));
  return ranked.slice(0, prizeCount).map((p, idx) => ({ winner: p, place: idx + 1 }));
}

/** Check if submission window is open */
export function isSubmissionOpen(event: LiveEvent): boolean {
  const now = new Date();
  return event.status === 'SUBMISSION_OPEN' &&
    now < event.submissionDeadline &&
    event.participants.length < event.maxParticipants;
}

/** Build performer queue from approved participants */
export function buildPerformerQueue(participants: EventParticipant[]): EventParticipant[] {
  return participants
    .filter(p => p.status === 'APPROVED')
    .sort((a, b) => a.queuePosition - b.queuePosition);
}

/** Advance to next performer */
export function advancePerformer(event: LiveEvent): LiveEvent {
  const nextIndex = event.currentPerformerIndex + 1;
  const queue = buildPerformerQueue(event.participants);

  if (nextIndex >= queue.length) {
    return { ...event, status: 'VOTING_ACTIVE', currentPerformerIndex: nextIndex };
  }

  return { ...event, currentPerformerIndex: nextIndex };
}

/** Get sorted weekly schedule by next occurrence */
export function getSortedWeeklySchedule(reference: Date = new Date()): Array<{
  slot: WeeklySlot;
  nextOccurrence: Date;
  msUntil: number;
  status: 'UPCOMING' | 'STARTING_SOON' | 'LIVE' | 'ENDED';
}> {
  return WEEKLY_SCHEDULE
    .map(slot => {
      const next = getNextOccurrence(slot, reference);
      const ms = msUntil(next);
      return {
        slot,
        nextOccurrence: next,
        msUntil: ms,
        status: getLiveStatus(next, slot.durationMinutes),
      };
    })
    .sort((a, b) => a.msUntil - b.msUntil);
}
