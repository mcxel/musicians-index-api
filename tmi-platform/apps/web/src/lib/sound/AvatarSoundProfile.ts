/**
 * AvatarSoundProfile.ts
 * Maps avatar event types to sound manifest IDs.
 *
 * Each profile defines which sound plays for which interaction.
 * If an event has no entry, playAvatarSound() is a no-op — never throws.
 *
 * Host character profiles (bigace, dj_record_ralph, etc.) reuse existing
 * manifest sounds so they work immediately without new audio files.
 * Generic avatar profiles (default, fan) reference /sounds/avatar/ entries
 * that fail gracefully until real files are added.
 */

export type AvatarSoundEvent =
  // Movement
  | 'movement.sit'
  | 'movement.stand'
  | 'movement.walk'
  | 'movement.run'
  // Clothing
  | 'clothing.fabric'
  | 'clothing.leather'
  | 'clothing.jewelry'
  // Emotes
  | 'emote.wave'
  | 'emote.clap'
  | 'emote.cheer'
  | 'emote.laugh'
  | 'emote.dance'
  // Gestures
  | 'gesture.point'
  | 'gesture.thumbsup'
  // UI / dressing room
  | 'ui.equip'
  | 'ui.outfit_on'
  | 'ui.level_up'
  // Host character events
  | 'host.entrance'
  | 'host.announce'
  | 'host.react'
  | 'host.winner_call';

export interface AvatarSoundProfile {
  profileId: string;
  displayName: string;
  /** Map of event → sound manifest ID. Missing entries = silent. */
  sounds: Partial<Record<AvatarSoundEvent, string>>;
}

export const AVATAR_SOUND_PROFILES: AvatarSoundProfile[] = [
  // ── Default fan/performer avatar ─────────────────────────────────────────
  {
    profileId: 'default',
    displayName: 'Default',
    sounds: {
      'movement.sit':      'avatar_movement_sit',
      'movement.stand':    'avatar_movement_stand',
      'movement.walk':     'avatar_movement_walk',
      'movement.run':      'avatar_movement_run',
      'clothing.fabric':   'avatar_clothing_fabric',
      'clothing.leather':  'avatar_clothing_leather',
      'clothing.jewelry':  'avatar_clothing_jewelry',
      'emote.wave':        'avatar_emote_wave',
      'emote.clap':        'crowd_clap_cheer',        // real file — immediate
      'emote.cheer':       'crowd_small_reactions',   // real file — immediate
      'emote.laugh':       'crowd_laughing',           // real file — immediate
      'emote.dance':       'avatar_emote_dance',
      'gesture.point':     'avatar_gesture_point',
      'ui.equip':          'avatar_ui_equip',
      'ui.outfit_on':      'avatar_ui_outfit_on',
      'ui.level_up':       'gameshow_achievement_bling', // real file — immediate
    },
  },

  // ── Big Ace (Julius) ─────────────────────────────────────────────────────
  {
    profileId: 'bigace',
    displayName: 'Big Ace',
    sounds: {
      'host.entrance':     'host_julius_voice_sample',
      'host.announce':     'host_male_eldude_pack',
      'host.react':        'host_male_banter_pack',
      'host.winner_call':  'gameshow_winner_alert',
      'emote.cheer':       'crowd_cheer_auditorium',
      'emote.laugh':       'crowd_laughing',
      'ui.equip':          'ui_positive_bell',
      'ui.level_up':       'gameshow_winner_alert',
    },
  },

  // ── DJ Record Ralph ───────────────────────────────────────────────────────
  {
    profileId: 'dj_record_ralph',
    displayName: 'DJ Record Ralph',
    sounds: {
      'host.entrance':     'battle_beat_drop',
      'host.announce':     'host_male_banter_pack',
      'host.react':        'battle_air_horn',
      'host.winner_call':  'battle_air_horn',
      'emote.cheer':       'crowd_cheering_stadium',
      'emote.dance':       'battle_beat_drop',
      'ui.equip':          'ui_digital_bell',
      'ui.level_up':       'battle_air_horn',
    },
  },

  // ── MC Michael Charlie ────────────────────────────────────────────────────
  {
    profileId: 'mc_michael_charlie',
    displayName: 'MC Michael Charlie',
    sounds: {
      'host.entrance':     'host_welcome_line',
      'host.announce':     'host_male_banter_pack',
      'host.react':        'crowd_cheer_auditorium',
      'host.winner_call':  'gameshow_winner_bell',
      'emote.cheer':       'crowd_cheering_1',
      'emote.clap':        'crowd_clap_cheer',
      'ui.equip':          'ui_positive_bell',
      'ui.level_up':       'gameshow_winner_bell',
    },
  },

  // ── Bobby Stanley ─────────────────────────────────────────────────────────
  {
    profileId: 'bobby_stanley',
    displayName: 'Bobby Stanley',
    sounds: {
      'host.entrance':     'host_gameshow_mrhappy_pack',
      'host.announce':     'gameshow_quiz_pack',
      'host.react':        'gameshow_winner_alert',
      'host.winner_call':  'gameshow_winning_coins',
      'emote.cheer':       'crowd_cheering_2',
      'emote.laugh':       'crowd_laughing',
      'ui.equip':          'gameshow_correct',
      'ui.level_up':       'gameshow_winning_coins',
    },
  },
];

export function getAvatarSoundProfile(profileId: string): AvatarSoundProfile {
  return (
    AVATAR_SOUND_PROFILES.find((p) => p.profileId === profileId) ??
    AVATAR_SOUND_PROFILES[0]!
  );
}

/** Returns the manifest sound ID for a given profile + event, or undefined if not mapped. */
export function getSoundIdForEvent(
  profileId: string,
  event: AvatarSoundEvent,
): string | undefined {
  return getAvatarSoundProfile(profileId).sounds[event];
}
