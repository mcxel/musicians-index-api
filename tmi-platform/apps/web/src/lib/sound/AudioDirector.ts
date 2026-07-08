/**
 * TMI Audio Director — event-to-sound mapping table.
 *
 * Architecture:
 *   Runtime Event  →  dispatchSoundEvent('tmi:event_name')
 *   AudioDirectorProvider (layout)  →  listens to all tmi:* events
 *   playSound(soundId)  →  SoundManifest  →  Audio output
 *
 * Rules:
 *   - No component imports playSound() directly for platform-level events.
 *   - UI feedback that's tightly coupled to a single component (e.g. button hover)
 *     may still call playSound() directly.
 *   - Every runtime engine, live event, and commerce action uses dispatchSoundEvent().
 *   - To remap any sound, change one entry below — all callers update automatically.
 */

export const TMI_SOUND_MAP: Record<string, string> = {

  // ── Priority 1: Venue Runtime ─────────────────────────────────────────────
  'tmi:venue_open':              'concert_show_opener',
  'tmi:venue_curtain_open':      'venue_curtains',
  'tmi:venue_curtain_close':     'venue_curtains',
  'tmi:venue_countdown':         'gameshow_drum_roll',
  'tmi:venue_performer_enters':  'crowd_cheer_auditorium',
  'tmi:venue_applause':          'crowd_clap_cheer',
  'tmi:venue_encore':            'crowd_cheering_stadium',
  'tmi:venue_closing':           'concert_stinger',
  'tmi:venue_intermission':      'concert_uplift_theme',
  'tmi:venue_reconnect':         'ui_whoosh_bubbles',
  'tmi:venue_emergency_pause':   'venue_siren_warning',

  // ── Priority 2: Competition — Battle ─────────────────────────────────────
  'tmi:battle_challenger_enters': 'battle_aggressive_hit',
  'tmi:battle_vs_announce':       'battle_air_horn',
  'tmi:battle_round_start':       'battle_321_fight',
  'tmi:battle_judge_reveal':      'gameshow_drum_roll',
  'tmi:battle_winner':            'gameshow_winner_alert',
  'tmi:battle_tie':               'gameshow_buzzer',
  'tmi:battle_crowd_swell':       'crowd_cheering_stadium',

  // ── Priority 2: Competition — Cypher ─────────────────────────────────────
  'tmi:cypher_next_performer':    'battle_beat_drop',
  'tmi:cypher_beat_drop':         'battle_beat_drop',
  'tmi:cypher_rotation':          'ui_whoosh_bubbles',
  'tmi:cypher_crowd_hype':        'crowd_cheering_1',
  'tmi:cypher_finish':            'crowd_clap_cheer',

  // ── Priority 2: Competition — Challenge ──────────────────────────────────
  'tmi:challenge_accepted':       'ui_positive_bell',
  'tmi:challenge_countdown':      'gameshow_drum_roll',
  'tmi:challenge_submission_locked': 'ui_copper_bell',
  'tmi:challenge_voting_open':    'gameshow_drum_roll',
  'tmi:challenge_winner':         'gameshow_winner_alert',

  // ── Priority 2: Competition — Dirty Dozens ───────────────────────────────
  'tmi:dirtydozens_callout':      'battle_aggressive_hit',
  'tmi:dirtydozens_crowd_laugh':  'crowd_laughing',
  'tmi:dirtydozens_response':     'battle_air_horn',
  'tmi:dirtydozens_round_end':    'gameshow_buzzer',

  // ── Priority 2: Competition — Dance Battle ───────────────────────────────
  'tmi:dance_beat_change':        'battle_beat_drop',
  'tmi:dance_spotlight':          'concert_stinger',
  'tmi:dance_winner':             'crowd_clap_cheer',

  // ── Priority 2: Competition — Comedy Battle ──────────────────────────────
  'tmi:comedy_intro_sting':       'concert_stinger',
  'tmi:comedy_crowd_laugh':       'crowd_laughing',
  'tmi:comedy_applause':          'crowd_clap_cheer',
  'tmi:comedy_winner':            'gameshow_winner_alert',

  // ── Priority 3: Broadcast Director ──────────────────────────────────────
  'tmi:broadcast_camera_switch':  'ui_whoosh_bubbles',
  'tmi:broadcast_transition':     'ui_whoosh_bubbles',
  'tmi:broadcast_split_screen':   'concert_stinger',
  'tmi:broadcast_replay':         'concert_stinger',
  'tmi:broadcast_sponsor_break':  'concert_intro_tvshow',
  'tmi:broadcast_world_release':  'concert_uplift_theme',
  'tmi:broadcast_live_ticker':    'ui_digital_bell',

  // ── Priority 4: Universal Notifications ──────────────────────────────────
  'tmi:friend_online':            'ui_copper_bell',
  'tmi:booking_request':          'ui_digital_bell',
  'tmi:message_received':         'ui_digital_bell',
  'tmi:ticket_sold':              'gameshow_winning_coins',
  'tmi:tip_received':             'ui_positive_bell',
  'tmi:sponsor_accepted':         'gameshow_winner_alert',
  'tmi:merch_sold':               'gameshow_winning_coins',
  'tmi:album_challenge_created':  'battle_air_horn',
  'tmi:venue_invitation':         'ui_digital_bell',
  'tmi:audience_milestone':       'crowd_cheering_stadium',
  'tmi:memory_captured':          'ui_camera_shutter',

  // ── XP / Progression (complement to direct calls in GamificationHUD) ─────
  'tmi:xp_gained_rare':           'gameshow_achievement_bling',
  'tmi:xp_gained_md':             'ui_positive_bell',
  'tmi:xp_gained_sm':             'ui_copper_bell',
  'tmi:level_up':                 'gameshow_winner_alert',
  'tmi:badge_unlocked':           'gameshow_achievement_bling',

  // ── Show — Monthly Idol ───────────────────────────────────────────────────
  'tmi:idol_intro':               'concert_intro_tvshow',
  'tmi:idol_spotlight':           'concert_stinger',
  'tmi:idol_elimination':         'gameshow_you_lose',
  'tmi:idol_winner_fanfare':      'gameshow_winner_alert',

  // ── Show — Game Shows ─────────────────────────────────────────────────────
  'tmi:gameshow_correct':         'gameshow_correct',
  'tmi:gameshow_incorrect':       'gameshow_incorrect',
  'tmi:gameshow_countdown':       'gameshow_drum_roll',
  'tmi:gameshow_winner':          'gameshow_winner_bell',
  'tmi:gameshow_eliminated':      'gameshow_you_lose',
  'tmi:gameshow_jackpot':         'gameshow_winning_coins',
};

/**
 * dispatchSoundEvent — the only function runtime engines and components should
 * call to trigger a sound. Never call playSound() directly from platform events.
 *
 * @example
 * dispatchSoundEvent('tmi:battle_round_start');
 * dispatchSoundEvent('tmi:tip_received');
 */
export function dispatchSoundEvent(eventName: string): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(eventName));
}
