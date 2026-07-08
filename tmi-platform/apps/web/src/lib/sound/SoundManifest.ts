/**
 * TMI Sound Manifest — single source of truth for every sound asset on the
 * platform. Files live under apps/web/public/sounds/<category>/. Add new
 * sounds here first, then drop the file in place — playSound() looks up
 * everything through this manifest rather than hardcoded paths scattered
 * through components (Rule 8: Registry First, applied to audio).
 */

export type SoundCategory =
  | 'crowd'
  | 'host'
  | 'battle'
  | 'gameshow'
  | 'concert'
  | 'ui'
  | 'venue';

export interface SoundManifestEntry {
  id: string;
  file: string;
  category: SoundCategory;
  /** Human-readable description of when this plays */
  trigger: string;
  volume: number;
  loop: boolean;
}

export const SOUND_MANIFEST: SoundManifestEntry[] = [
  // ── Crowd ──────────────────────────────────────────────────────────────────
  { id: 'crowd_clap_cheer',        file: '/sounds/crowd/crowd-clap-cheer.mp3',        category: 'crowd', trigger: 'general applause moment',          volume: 0.6,  loop: false },
  { id: 'crowd_cheer_auditorium',  file: '/sounds/crowd/crowd-cheer-auditorium.mp3',  category: 'crowd', trigger: 'performer_enters_stage (indoor)',   volume: 0.65, loop: false },
  { id: 'crowd_small_reactions',   file: '/sounds/crowd/crowd-small-reactions.mp3',   category: 'crowd', trigger: 'small venue ambient reaction',      volume: 0.4,  loop: false },
  { id: 'crowd_laughing',          file: '/sounds/crowd/crowd-laughing.mp3',          category: 'crowd', trigger: 'comedy room punchline',             volume: 0.6,  loop: false },
  { id: 'crowd_cheering_1',        file: '/sounds/crowd/crowd-cheering-1.mp3',        category: 'crowd', trigger: 'general cheer variant 1',           volume: 0.6,  loop: false },
  { id: 'crowd_cheers_2',          file: '/sounds/crowd/crowd-cheers-2.mp3',          category: 'crowd', trigger: 'general cheer variant 2',           volume: 0.6,  loop: false },
  { id: 'crowd_disappointment',    file: '/sounds/crowd/crowd-disappointment.mp3',    category: 'crowd', trigger: 'battle/game-show wrong answer or loss', volume: 0.55, loop: false },
  { id: 'crowd_cheering_stadium',  file: '/sounds/crowd/crowd-cheering-stadium.mp3',  category: 'crowd', trigger: 'performer_enters_stage (concert/arena)', volume: 0.7,  loop: false },
  { id: 'crowd_cheering_2',        file: '/sounds/crowd/crowd-cheering-2.mp3',        category: 'crowd', trigger: 'general cheer variant 3',           volume: 0.6,  loop: false },

  // ── Host / Announcer packs (raw clips — not yet a Voice Director, see notes) ──
  { id: 'host_male_banter_pack',     file: '/sounds/host/host-male-banter-pack.mp3',     category: 'host', trigger: 'male host line pack (banter style)',  volume: 0.7, loop: false },
  { id: 'host_male_eldude_pack',     file: '/sounds/host/host-male-eldude-pack.mp3',     category: 'host', trigger: 'male host line pack (el dude style)',  volume: 0.7, loop: false },
  { id: 'host_gameshow_mrhappy_pack',file: '/sounds/host/host-gameshow-mrhappy-pack.mp3',category: 'host', trigger: 'game show host line pack',             volume: 0.7, loop: false },
  { id: 'host_welcome_line',         file: '/sounds/host/host-welcome-line.mp3',         category: 'host', trigger: '"welcome to the show" stinger',         volume: 0.7, loop: false },
  { id: 'host_julius_voice_sample',  file: '/sounds/host/host-julius-voice-sample.mp3',  category: 'host', trigger: 'reference voice sample for Julius host character', volume: 0.7, loop: false },
  { id: 'host_robot_voice',          file: '/sounds/host/host-robot-voice.mp3',          category: 'host', trigger: 'robot announcer line',                 volume: 0.7, loop: false },
  { id: 'host_alien_voice',          file: '/sounds/host/host-alien-voice.mp3',          category: 'host', trigger: 'alien/novelty announcer line',         volume: 0.7, loop: false },

  // ── Battle ─────────────────────────────────────────────────────────────────
  { id: 'battle_321_fight',     file: '/sounds/battle/battle-321-fight.mp3',     category: 'battle', trigger: 'battle_round_start',     volume: 0.75, loop: false },
  { id: 'battle_air_horn',      file: '/sounds/battle/battle-air-horn.mp3',      category: 'battle', trigger: 'battle hype moment / big play', volume: 0.7,  loop: false },
  { id: 'battle_aggressive_hit',file: '/sounds/battle/battle-aggressive-hit.mp3',category: 'battle', trigger: 'battle_logo_hit / impact moment', volume: 0.65, loop: false },
  { id: 'battle_beat_drop',     file: '/sounds/battle/battle-beat-drop.mp3',     category: 'battle', trigger: 'cypher_beat_drop / battle_begins', volume: 0.7,  loop: false },

  // ── Game show ──────────────────────────────────────────────────────────────
  { id: 'gameshow_correct',          file: '/sounds/gameshow/gameshow-correct.mp3',          category: 'gameshow', trigger: 'correct_answer',     volume: 0.65, loop: false },
  { id: 'gameshow_incorrect',        file: '/sounds/gameshow/gameshow-incorrect.mp3',        category: 'gameshow', trigger: 'incorrect_answer',   volume: 0.65, loop: false },
  { id: 'gameshow_winner_alert',     file: '/sounds/gameshow/gameshow-winner-alert.mp3',     category: 'gameshow', trigger: 'round_winner',       volume: 0.7,  loop: false },
  { id: 'gameshow_winner_bell',      file: '/sounds/gameshow/gameshow-winner-bell.mp3',      category: 'gameshow', trigger: 'winner_announced',   volume: 0.6,  loop: false },
  { id: 'gameshow_buzzer',           file: '/sounds/gameshow/gameshow-buzzer.mp3',           category: 'gameshow', trigger: 'time_up / wrong_buzz', volume: 0.65, loop: false },
  { id: 'gameshow_you_lose',         file: '/sounds/gameshow/gameshow-you-lose.mp3',         category: 'gameshow', trigger: 'player_eliminated',  volume: 0.6,  loop: false },
  { id: 'gameshow_game_over',        file: '/sounds/gameshow/gameshow-game-over.mp3',        category: 'gameshow', trigger: 'game_over',          volume: 0.6,  loop: false },
  { id: 'gameshow_drum_roll',        file: '/sounds/gameshow/gameshow-drum-roll.mp3',        category: 'gameshow', trigger: 'suspense_before_reveal', volume: 0.6, loop: false },
  { id: 'gameshow_quiz_pack',        file: '/sounds/gameshow/gameshow-quiz-pack.mp3',        category: 'gameshow', trigger: 'quiz line pack',     volume: 0.65, loop: false },
  { id: 'gameshow_winning_coins',    file: '/sounds/gameshow/gameshow-winning-coins.mp3',    category: 'gameshow', trigger: 'points_awarded',     volume: 0.55, loop: false },
  { id: 'gameshow_achievement_bling',file: '/sounds/gameshow/gameshow-achievement-bling.mp3',category: 'gameshow', trigger: 'achievement_unlocked', volume: 0.55, loop: false },

  // ── Concert / broadcast intros ─────────────────────────────────────────────
  { id: 'concert_intro_trap',     file: '/sounds/concert/concert-intro-trap.mp3',     category: 'concert', trigger: 'hip-hop/trap concert opener',  volume: 0.65, loop: false },
  { id: 'concert_intro_tvshow',   file: '/sounds/concert/concert-intro-tvshow.mp3',   category: 'concert', trigger: 'broadcast/show opener',        volume: 0.65, loop: false },
  { id: 'concert_intro_studio',   file: '/sounds/concert/concert-intro-studio.mp3',   category: 'concert', trigger: 'studio ident opener',          volume: 0.6,  loop: false },
  { id: 'concert_show_opener',    file: '/sounds/concert/concert-show-opener.mp3',    category: 'concert', trigger: 'general show opener',          volume: 0.65, loop: false },
  { id: 'concert_guitar_ident',   file: '/sounds/concert/concert-guitar-ident.mp3',   category: 'concert', trigger: 'rock/live-band concert opener',volume: 0.6,  loop: false },
  { id: 'concert_dark_engine_logo',file:'/sounds/concert/concert-dark-engine-logo.mp3',category: 'concert', trigger: 'dramatic/dark genre opener',   volume: 0.6,  loop: false },
  { id: 'concert_uplift_theme',   file: '/sounds/concert/concert-uplift-theme.mp3',   category: 'concert', trigger: 'uplifting genre opener',       volume: 0.6,  loop: false },
  { id: 'concert_stinger',        file: '/sounds/concert/concert-stinger.mp3',        category: 'concert', trigger: 'pre-segment stinger',          volume: 0.55, loop: false },

  // ── UI ─────────────────────────────────────────────────────────────────────
  { id: 'ui_menu_pack',       file: '/sounds/ui/ui-menu-pack.mp3',       category: 'ui', trigger: 'menu open/close line pack', volume: 0.4, loop: false },
  { id: 'ui_camera_shutter',  file: '/sounds/ui/ui-camera-shutter.mp3',  category: 'ui', trigger: 'memory_wall_capture / screenshot', volume: 0.5, loop: false },
  { id: 'ui_whoosh_bubbles',  file: '/sounds/ui/ui-whoosh-bubbles.mp3',  category: 'ui', trigger: 'panel_transition',           volume: 0.4, loop: false },
  { id: 'ui_digital_bell',    file: '/sounds/ui/ui-digital-bell.mp3',    category: 'ui', trigger: 'notification / message_sent', volume: 0.45, loop: false },
  { id: 'ui_copper_bell',     file: '/sounds/ui/ui-copper-bell.mp3',     category: 'ui', trigger: 'soft confirmation',          volume: 0.4, loop: false },
  { id: 'ui_positive_bell',   file: '/sounds/ui/ui-positive-bell.mp3',   category: 'ui', trigger: 'upload_complete / success',  volume: 0.45, loop: false },

  // ── Venue ──────────────────────────────────────────────────────────────────
  { id: 'venue_curtains',       file: '/sounds/venue/venue-curtains.mp3',       category: 'venue', trigger: 'curtain_open / curtain_close', volume: 0.6, loop: false },
  { id: 'venue_siren_warning',  file: '/sounds/venue/venue-siren-warning.mp3',  category: 'venue', trigger: 'room closing / capacity warning', volume: 0.5, loop: false },
  { id: 'venue_truck_signal',   file: '/sounds/venue/venue-truck-signal.mp3',   category: 'venue', trigger: 'backstage/loading transition', volume: 0.4, loop: false },
];

export function getSoundById(id: string): SoundManifestEntry | undefined {
  return SOUND_MANIFEST.find((s) => s.id === id);
}

export function getSoundsByCategory(category: SoundCategory): SoundManifestEntry[] {
  return SOUND_MANIFEST.filter((s) => s.category === category);
}
