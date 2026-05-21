/**
 * contest.permissions.ts
 * Repo: apps/api/src/modules/contest/contest.permissions.ts
 * Action: CREATE | Wave: W5
 * Source: Split from Drop 2 ContestEntities.ts
 * Usage: import { hasContestPermission, type ContestRole } from './contest.permissions';
 */

export type ContestRole = 'admin' | 'host' | 'artist' | 'sponsor' | 'fan' | 'public';

export const CONTEST_PERMISSIONS: Record<string, ContestRole[]> = {
  // Public
  'contest:view': ['public', 'fan', 'artist', 'sponsor', 'host', 'admin'],
  'contest:view_rules': ['public', 'fan', 'artist', 'sponsor', 'host', 'admin'],
  'contest:view_leaderboard': ['public', 'fan', 'artist', 'sponsor', 'host', 'admin'],
  'contest:view_season': ['public', 'fan', 'artist', 'sponsor', 'host', 'admin'],
  'contest:view_sponsor_leaderboard': ['public', 'fan', 'artist', 'sponsor', 'host', 'admin'],

  // Fan
  'contest:vote': ['fan', 'artist', 'sponsor', 'host', 'admin'],

  // Artist
  'contest:enter': ['artist', 'admin'],
  'contest:invite_sponsor': ['artist', 'admin'],
  'contest:view_own_entry': ['artist', 'admin'],

  // Sponsor
  'contest:sponsor_artist': ['sponsor', 'admin'],
  'contest:view_sponsor_analytics': ['sponsor', 'admin'],

  // Host
  'contest:trigger_host_cue': ['host', 'admin'],
  'contest:trigger_prize_reveal': ['host', 'admin'],
  'contest:trigger_winner_announce': ['host', 'admin'],

  // Admin only
  'contest:approve_sponsor': ['admin'],
  'contest:approve_entry': ['admin'],
  'contest:disqualify_entry': ['admin'],
  'contest:create_season': ['admin'],
  'contest:edit_season': ['admin'],
  'contest:view_audit': ['admin'],
  'contest:view_queues': ['admin'],
  'contest:manage_prizes': ['admin'],
  'contest:update_reveal_config': ['admin'],
  'contest:reset_reveal_weights': ['admin'],
  'contest:season_lock': ['admin'],
};

export function hasContestPermission(action: string, role: ContestRole): boolean {
  return CONTEST_PERMISSIONS[action]?.includes(role) ?? false;
}
