/**
 * CharacterRegistry — the single source of truth for every AI host character.
 *
 * Links together: voice profile, animation config, personality, wardrobe,
 * environment, and emotion behavior per host.
 *
 * Per Rule 8 (Registry First): every system that references a host character
 * reads from here — BOGVoiceRuntime, HostAvatarPortrait, HostEntityRuntime,
 * BroadcastDirectorEngine, future 3D rigs.
 *
 * Per Rule 18 (scope honesty): no 3D mesh / face-scan / phoneme lip-sync exists
 * yet. Animation fields name the *intended* behavior; current rendering is via
 * HostAvatarPortrait's framer-motion state variants. When the 3D runtime exists,
 * it reads the same fields from this registry — no migration needed.
 *
 * Usage:
 *   import { getCharacter, getEmotionForContext } from '@/lib/hosts/CharacterRegistry';
 *   const character = getCharacter('big-ace');
 *   const emotion = getEmotionForContext(character, 'winner-announce');
 */

import type { BOGHostID } from '@/lib/bog/BOGVoiceRuntime';
import type { VoicePersonality, SpeechContext } from '@/lib/hosts/HostVoicePersonalityEngine';
import type { HostEntityState } from '@/lib/live/HostEntityRuntime';

// ── Emotion ───────────────────────────────────────────────────────────────────

export type EmotionState =
  | 'neutral'
  | 'excited'
  | 'calm'
  | 'intense'
  | 'warm'
  | 'comedic'
  | 'dramatic'
  | 'celebratory'
  | 'serious'
  | 'smooth';

export interface EmotionBehavior {
  emotion: EmotionState;
  /** Which HostEntityState to push to HostAvatarPortrait */
  avatarState: HostEntityState;
  /** Extra ms added on top of the speech-duration estimate */
  durationBonus?: number;
}

// ── Animation ──────────────────────────────────────────────────────────────────
// These name the *intended* animation behaviors. Current implementation:
// HostAvatarPortrait maps HostEntityState → framer-motion variant.
// Future 3D runtime: AnimationController reads these keys from this same registry.

export interface CharacterAnimationSet {
  idle: string;
  talking: string;
  celebrating: string;
  reacting: string;
  entering: string;
  /** The move that makes this character visually unique (signature style) */
  signature: string;
}

// ── Wardrobe ──────────────────────────────────────────────────────────────────

export interface CharacterWardrobe {
  /** Portrait image path under /public/hosts/ */
  portraitPath: string;
  /** Primary neon accent for this character's UI elements and glow */
  accentColor: string;
  secondaryColor: string;
  styleDescription: string;
}

// ── Environment ───────────────────────────────────────────────────────────────

export type SceneType =
  | 'executive_office'
  | 'arena_stage'
  | 'dj_booth'
  | 'game_show_set'
  | 'courtroom'
  | 'idol_stage'
  | 'comedy_club';

export interface CharacterEnvironment {
  sceneType: SceneType;
  /** Ambient sound from SoundManifest to auto-play in this character's scene */
  ambientSoundId?: string;
}

// ── Full character definition ──────────────────────────────────────────────────

export interface HostCharacter {
  id: BOGHostID;
  displayName: string;
  title: string;
  personality: VoicePersonality;
  voiceModelId: string;
  animation: CharacterAnimationSet;
  wardrobe: CharacterWardrobe;
  environment: CharacterEnvironment;
  /** Per-context emotion overrides. Falls back to defaultEmotion when unset. */
  emotionMap: Partial<Record<SpeechContext, EmotionBehavior>>;
  defaultEmotion: EmotionBehavior;
  /** Pre-warm candidates — spoken at show open, primed in audio cache */
  catchphrases: string[];
}

// ── Registry ───────────────────────────────────────────────────────────────────

export const CHARACTER_REGISTRY: Record<BOGHostID, HostCharacter> = {

  'big-ace': {
    id: 'big-ace',
    displayName: 'Big Ace',
    title: 'Platform Authority',
    personality: 'mentor',
    voiceModelId: 'voice_big_ace_calm_authority',
    animation: {
      idle: 'executive_breathe',
      talking: 'measured_gesture',
      celebrating: 'approving_nod',
      reacting: 'thoughtful_pause',
      entering: 'commanding_walk',
      signature: 'steepled_fingers',
    },
    wardrobe: {
      portraitPath: '/hosts/big-ace.png',
      accentColor: '#ffd700',
      secondaryColor: '#00ccff',
      styleDescription: 'Sharp executive suit, gold accessories, calm unshakeable presence',
    },
    environment: {
      sceneType: 'executive_office',
      ambientSoundId: 'ambient_executive_room',
    },
    emotionMap: {
      'winner-announce':      { emotion: 'warm',        avatarState: 'celebrating',  durationBonus: 1000 },
      'contestant-enter':     { emotion: 'calm',        avatarState: 'gesturing' },
      'crowd-hype':           { emotion: 'calm',        avatarState: 'talking' },
      'show-open':            { emotion: 'warm',        avatarState: 'entering' },
      'show-close':           { emotion: 'warm',        avatarState: 'celebrating' },
      'score-reveal':         { emotion: 'intense',     avatarState: 'talking' },
      'elimination':          { emotion: 'serious',     avatarState: 'gesturing' },
      'tie-breaker':          { emotion: 'intense',     avatarState: 'talking' },
      'vote-open':            { emotion: 'calm',        avatarState: 'gesturing' },
      'vote-close':           { emotion: 'serious',     avatarState: 'talking' },
      'countdown':            { emotion: 'intense',     avatarState: 'gesturing' },
    },
    defaultEmotion: { emotion: 'calm', avatarState: 'talking' },
    catchphrases: [
      'Welcome to the platform.',
      'The numbers don\'t lie.',
      'This is what excellence looks like.',
    ],
  },

  'mc-michael-charlie': {
    id: 'mc-michael-charlie',
    displayName: 'MC Michael Charlie',
    title: 'Hype Announcer',
    personality: 'hype',
    voiceModelId: 'voice_mc_charlie_announcer',
    animation: {
      idle: 'mic_tap',
      talking: 'point_and_lean',
      celebrating: 'jump_and_fist',
      reacting: 'crowd_pump',
      entering: 'arena_stride',
      signature: 'mic_drop_pose',
    },
    wardrobe: {
      portraitPath: '/hosts/mc-michael-charlie.png',
      accentColor: '#ff00ff',
      secondaryColor: '#00ffff',
      styleDescription: 'Fresh streetwear, gold chain, mic in hand, pure arena energy',
    },
    environment: {
      sceneType: 'arena_stage',
      ambientSoundId: 'crowd_cheer_auditorium',
    },
    emotionMap: {
      'winner-announce':      { emotion: 'celebratory', avatarState: 'celebrating',  durationBonus: 2000 },
      'contestant-enter':     { emotion: 'excited',     avatarState: 'gesturing',    durationBonus: 500 },
      'crowd-hype':           { emotion: 'excited',     avatarState: 'celebrating' },
      'show-open':            { emotion: 'excited',     avatarState: 'entering',     durationBonus: 1000 },
      'countdown':            { emotion: 'intense',     avatarState: 'pointing' },
      'tie-breaker':          { emotion: 'dramatic',    avatarState: 'gesturing' },
      'elimination':          { emotion: 'dramatic',    avatarState: 'reacting',     durationBonus: 500 },
      'score-reveal':         { emotion: 'intense',     avatarState: 'talking' },
      'vote-open':            { emotion: 'excited',     avatarState: 'gesturing' },
      'vote-close':           { emotion: 'intense',     avatarState: 'pointing' },
    },
    defaultEmotion: { emotion: 'excited', avatarState: 'talking' },
    catchphrases: [
      'WELCOME TO THE CHAMPIONSHIP!',
      'The crowd is ELECTRIC tonight!',
      'AND THE WINNER IS—',
    ],
  },

  'dj-record-ralph': {
    id: 'dj-record-ralph',
    displayName: 'DJ Record Ralph',
    title: 'Music Personality',
    personality: 'smooth',
    voiceModelId: 'voice_dj_ralph_club',
    animation: {
      idle: 'headnod_beat',
      talking: 'wave_to_crowd',
      celebrating: 'scratch_record',
      reacting: 'point_to_speakers',
      entering: 'dj_booth_slide',
      signature: 'record_spin_move',
    },
    wardrobe: {
      portraitPath: '/hosts/dj-record-ralph.png',
      accentColor: '#aa2dff',
      secondaryColor: '#ffd700',
      styleDescription: 'Headphones around neck, fresh kicks, stylish producer aesthetic',
    },
    environment: {
      sceneType: 'dj_booth',
      ambientSoundId: 'ambient_club_low',
    },
    emotionMap: {
      'show-open':            { emotion: 'smooth',      avatarState: 'entering' },
      'crowd-hype':           { emotion: 'excited',     avatarState: 'celebrating' },
      'winner-announce':      { emotion: 'smooth',      avatarState: 'celebrating',  durationBonus: 800 },
      'radio-song-intro':     { emotion: 'smooth',      avatarState: 'gesturing' },
      'radio-drop-tease':     { emotion: 'excited',     avatarState: 'gesturing' },
      'radio-reaction-comment':{ emotion: 'smooth',     avatarState: 'talking' },
      'radio-stay-locked':    { emotion: 'smooth',      avatarState: 'talking' },
      'radio-game-start':     { emotion: 'excited',     avatarState: 'entering' },
      'contestant-enter':     { emotion: 'smooth',      avatarState: 'gesturing' },
    },
    defaultEmotion: { emotion: 'smooth', avatarState: 'talking' },
    catchphrases: [
      'The vibes don\'t lie.',
      'Let the music speak.',
      'That\'s how we do it on TMI.',
    ],
  },

  'bobby-stanley': {
    id: 'bobby-stanley',
    displayName: 'Bobby Stanley',
    title: 'Game Show Host',
    personality: 'funny',
    voiceModelId: 'voice_bobby_stanley_gameshow',
    animation: {
      idle: 'casual_lean',
      talking: 'shrug_and_smile',
      celebrating: 'raise_the_roof',
      reacting: 'raised_eyebrow',
      entering: 'game_show_stride',
      signature: 'wink_and_point',
    },
    wardrobe: {
      portraitPath: '/hosts/bobby-stanley.png',
      accentColor: '#ff6b35',
      secondaryColor: '#00ffff',
      styleDescription: 'Sharp blazer over casual shirt, relaxed game show confidence',
    },
    environment: {
      sceneType: 'game_show_set',
      ambientSoundId: 'gameshow_audience_ambient',
    },
    emotionMap: {
      'contestant-enter':     { emotion: 'comedic',     avatarState: 'reacting' },
      'winner-announce':      { emotion: 'celebratory', avatarState: 'celebrating',  durationBonus: 1500 },
      'crowd-hype':           { emotion: 'comedic',     avatarState: 'laughing' },
      'tie-breaker':          { emotion: 'comedic',     avatarState: 'reacting',     durationBonus: 500 },
      'elimination':          { emotion: 'comedic',     avatarState: 'gesturing' },
      'vote-open':            { emotion: 'comedic',     avatarState: 'gesturing' },
      'countdown':            { emotion: 'excited',     avatarState: 'pointing' },
      'commercial-tease':     { emotion: 'comedic',     avatarState: 'talking' },
      'show-open':            { emotion: 'warm',        avatarState: 'entering' },
    },
    defaultEmotion: { emotion: 'warm', avatarState: 'talking' },
    catchphrases: [
      'Alright, here we go!',
      'Nobody saw THAT coming!',
      'Let\'s keep it moving, folks.',
    ],
  },

  'judge-jack-obrien': {
    id: 'judge-jack-obrien',
    displayName: "Jack O'Brien",
    title: 'Lead Judge',
    personality: 'serious',
    voiceModelId: 'voice_jack_obrien_judge',
    animation: {
      idle: 'crossed_arms',
      talking: 'deliberate_nod',
      celebrating: 'slow_applause',
      reacting: 'chin_stroke',
      entering: 'measured_approach',
      signature: 'pen_tap',
    },
    wardrobe: {
      portraitPath: '/hosts/judge-jack-obrien.png',
      accentColor: '#cccccc',
      secondaryColor: '#00ffff',
      styleDescription: 'Formal attire, minimal accessories, authoritative posture',
    },
    environment: {
      sceneType: 'courtroom',
    },
    emotionMap: {
      'score-reveal':         { emotion: 'intense',     avatarState: 'talking' },
      'winner-announce':      { emotion: 'calm',        avatarState: 'celebrating',  durationBonus: 500 },
      'elimination':          { emotion: 'serious',     avatarState: 'gesturing' },
      'tie-breaker':          { emotion: 'serious',     avatarState: 'talking' },
      'contestant-enter':     { emotion: 'neutral',     avatarState: 'reacting' },
    },
    defaultEmotion: { emotion: 'serious', avatarState: 'talking' },
    catchphrases: [
      'The scores are final.',
      'This is my assessment.',
      'Based on the evidence before us.',
    ],
  },

  'judge-hector-lavinius': {
    id: 'judge-hector-lavinius',
    displayName: 'Hector Lavinius',
    title: 'Distinguished Judge',
    personality: 'dramatic',
    voiceModelId: 'voice_hector_lavinius_judge',
    animation: {
      idle: 'distinguished_posture',
      talking: 'expressive_hands',
      celebrating: 'standing_applause',
      reacting: 'emphatic_nod',
      entering: 'dignified_walk',
      signature: 'glasses_adjustment',
    },
    wardrobe: {
      portraitPath: '/hosts/judge-hector-lavinius.png',
      accentColor: '#8b0000',
      secondaryColor: '#ffd700',
      styleDescription: 'Elegant formal wear, distinguished presence, expressive hands',
    },
    environment: {
      sceneType: 'courtroom',
    },
    emotionMap: {
      'winner-announce':      { emotion: 'dramatic',    avatarState: 'celebrating',  durationBonus: 1500 },
      'score-reveal':         { emotion: 'dramatic',    avatarState: 'gesturing',    durationBonus: 800 },
      'elimination':          { emotion: 'dramatic',    avatarState: 'reacting',     durationBonus: 1000 },
      'tie-breaker':          { emotion: 'dramatic',    avatarState: 'gesturing',    durationBonus: 500 },
      'contestant-enter':     { emotion: 'neutral',     avatarState: 'reacting' },
    },
    defaultEmotion: { emotion: 'dramatic', avatarState: 'talking' },
    catchphrases: [
      'Extraordinary.',
      'In all my years...',
      'A performance for the ages.',
    ],
  },

  'monthly-idol-host-1': {
    id: 'monthly-idol-host-1',
    displayName: 'Tiana',
    title: 'Monthly Idol Host',
    personality: 'funny',
    voiceModelId: 'voice_idol_tiana',
    animation: {
      idle: 'stage_presence',
      talking: 'audience_connect',
      celebrating: 'victory_dance',
      reacting: 'dramatic_gasp',
      entering: 'red_carpet_walk',
      signature: 'fan_the_crowd',
    },
    wardrobe: {
      portraitPath: '/hosts/idol-tiana.png',
      accentColor: '#ff44cc',
      secondaryColor: '#ffd700',
      styleDescription: 'Glamorous stage wear, sparkle accents, commanding idol presence',
    },
    environment: {
      sceneType: 'idol_stage',
      ambientSoundId: 'crowd_cheering_stadium',
    },
    emotionMap: {
      'winner-announce':      { emotion: 'celebratory', avatarState: 'celebrating',  durationBonus: 2000 },
      'crowd-hype':           { emotion: 'excited',     avatarState: 'celebrating',  durationBonus: 800 },
      'show-open':            { emotion: 'warm',        avatarState: 'entering',     durationBonus: 500 },
      'contestant-enter':     { emotion: 'warm',        avatarState: 'gesturing' },
      'elimination':          { emotion: 'dramatic',    avatarState: 'reacting',     durationBonus: 1000 },
      'countdown':            { emotion: 'excited',     avatarState: 'pointing' },
    },
    defaultEmotion: { emotion: 'warm', avatarState: 'talking' },
    catchphrases: [
      'Welcome to the stage!',
      'You all have no idea what\'s coming.',
      'TMI, let\'s go!',
    ],
  },

  'monthly-idol-host-2': {
    id: 'monthly-idol-host-2',
    displayName: 'Marcus',
    title: 'Monthly Idol Co-Host',
    personality: 'sarcastic',
    voiceModelId: 'voice_idol_marcus',
    animation: {
      idle: 'arms_crossed_cool',
      talking: 'deadpan_delivery',
      celebrating: 'reluctant_clap',
      reacting: 'side_eye',
      entering: 'smooth_entrance',
      signature: 'slow_burn_look',
    },
    wardrobe: {
      portraitPath: '/hosts/idol-marcus.png',
      accentColor: '#00ccff',
      secondaryColor: '#aa2dff',
      styleDescription: 'Contemporary sharp style, effortlessly cool, slightly amused expression',
    },
    environment: {
      sceneType: 'idol_stage',
    },
    emotionMap: {
      'tie-breaker':          { emotion: 'comedic',     avatarState: 'reacting' },
      'crowd-hype':           { emotion: 'calm',        avatarState: 'gesturing' },
      'winner-announce':      { emotion: 'warm',        avatarState: 'celebrating',  durationBonus: 500 },
      'elimination':          { emotion: 'comedic',     avatarState: 'reacting' },
      'score-reveal':         { emotion: 'neutral',     avatarState: 'talking' },
      'commercial-tease':     { emotion: 'comedic',     avatarState: 'talking' },
    },
    defaultEmotion: { emotion: 'neutral', avatarState: 'talking' },
    catchphrases: [
      'Sure, why not.',
      'I\'ve seen worse.',
      'Actually... that was good.',
    ],
  },

  'monthly-idol-host-3': {
    id: 'monthly-idol-host-3',
    displayName: 'Jules',
    title: 'Monthly Idol Announcer',
    personality: 'hype',
    voiceModelId: 'voice_idol_jules',
    animation: {
      idle: 'energetic_bounce',
      talking: 'rapid_gesture',
      celebrating: 'full_celebration',
      reacting: 'jump_reaction',
      entering: 'high_energy_entry',
      signature: 'crowd_wave',
    },
    wardrobe: {
      portraitPath: '/hosts/idol-jules.png',
      accentColor: '#00ffff',
      secondaryColor: '#ff00ff',
      styleDescription: 'Vibrant colors, high-energy look, always in motion',
    },
    environment: {
      sceneType: 'idol_stage',
      ambientSoundId: 'crowd_clap_cheer',
    },
    emotionMap: {
      'winner-announce':      { emotion: 'celebratory', avatarState: 'celebrating',  durationBonus: 2500 },
      'crowd-hype':           { emotion: 'excited',     avatarState: 'celebrating',  durationBonus: 1000 },
      'contestant-enter':     { emotion: 'excited',     avatarState: 'gesturing',    durationBonus: 500 },
      'show-open':            { emotion: 'excited',     avatarState: 'entering',     durationBonus: 1500 },
      'countdown':            { emotion: 'intense',     avatarState: 'pointing' },
      'elimination':          { emotion: 'dramatic',    avatarState: 'reacting',     durationBonus: 1000 },
      'vote-open':            { emotion: 'excited',     avatarState: 'gesturing' },
    },
    defaultEmotion: { emotion: 'excited', avatarState: 'talking' },
    catchphrases: [
      'OH MY— DID YOU SEE THAT?!',
      'THE CROWD IS GOING WILD!',
      'BEST NIGHT ON TMI!',
    ],
  },
};

// ── Public API ─────────────────────────────────────────────────────────────────

export function getCharacter(id: BOGHostID): HostCharacter {
  return CHARACTER_REGISTRY[id];
}

export function getEmotionForContext(
  character: HostCharacter,
  context: SpeechContext,
): EmotionBehavior {
  return character.emotionMap[context] ?? character.defaultEmotion;
}
