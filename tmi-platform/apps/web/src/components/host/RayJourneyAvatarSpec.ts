/**
 * RayJourneyAvatarSpec.ts
 * TMI Grand Platform Contest — Ray Journey Character Design Tokens
 * BerntoutGlobal XXL
 *
 * Repo path: apps/web/src/components/host/RayJourneyAvatarSpec.ts
 *
 * This is the single source of truth for Ray Journey's visual identity,
 * motion set, script categories, and emotion system.
 * All components rendering Ray Journey should import from this file.
 */

// ─── Character Identity ───────────────────────────────────────────────────────

export const RAY_JOURNEY_IDENTITY = {
  name: 'Ray Journey',
  title: 'Grand Platform Contest Host',
  description: 'White male, early 30s, charismatic, energetic futuristic show host',
  voiceStyle: 'Upbeat, clear, slightly dramatic — think modern game show energy',
  personalityTraits: ['charismatic', 'enthusiastic', 'warm', 'professional', 'crowd-aware'],
} as const;

// ─── Visual Design Tokens ─────────────────────────────────────────────────────

export const RAY_JOURNEY_COLORS = {
  skin: '#f0c8a0',
  hair: '#8B6914',
  suitBase: '#1a1f2e',
  suitAccent: '#252d42',
  // Tie and accent change with emotion
  emotions: {
    neutral: '#00e5ff',     // cyan
    excited: '#ff6b1a',     // orange
    announcing: '#ffd700',  // gold
    revealing: '#ff00ff',   // magenta
    crowd: '#00ff88',       // green
    sponsor: '#ffd700',     // gold
  },
} as const;

export const RAY_JOURNEY_SIZES = {
  sm: 80,
  md: 120,
  lg: 180,
  stage: 260,
} as const;

// ─── Emotion System ───────────────────────────────────────────────────────────

export type RayEmotion = keyof typeof RAY_JOURNEY_COLORS.emotions;

export const RAY_EMOTION_MAP: Record<string, RayEmotion> = {
  contestant_intro: 'announcing',
  sponsor_shoutout: 'sponsor',
  prize_reveal: 'revealing',
  round_transition: 'excited',
  winner_announce: 'excited',
  crowd_hype: 'crowd',
  co_host_handoff: 'neutral',
  neutral: 'neutral',
};

// ─── Motion Set ───────────────────────────────────────────────────────────────

export const RAY_MOTION_CLASSES = {
  idle: 'ray-idle',           // subtle breathing animation
  speaking: 'ray-speaking',   // mouth + glow pulse
  walkOn: 'ray-walk-on',      // slide in from right
  walkOff: 'ray-walk-off',    // slide out to left
  react: 'ray-react',         // jump/bounce reaction
  bow: 'ray-bow',             // bow after reveal
} as const;

export const RAY_ANIMATION_DURATIONS = {
  walkOn: 800,
  walkOff: 600,
  speakPulse: 2000,
  idleBreathe: 4000,
  reactBounce: 400,
} as const;

// ─── Script Pack Types ─────────────────────────────────────────────────────────

export type RayScriptType =
  | 'contestant_intro'
  | 'sponsor_shoutout'
  | 'prize_reveal'
  | 'round_transition'
  | 'winner_announce'
  | 'crowd_hype'
  | 'co_host_handoff'
  | 'season_open'
  | 'season_close';

export const RAY_SCRIPT_TEMPLATES: Record<RayScriptType, string[]> = {
  season_open: [
    'Welcome to the BIGGEST show on The Musician\'s Index — the BerntoutGlobal Grand Platform Contest! I\'m your host, Ray Journey. Let\'s get this season STARTED!',
    'Season {{seasonNumber}} of the Grand Platform Contest is officially LIVE! I\'m Ray Journey, and we have an incredible lineup for you tonight. Let\'s GO!',
  ],
  contestant_intro: [
    'Ladies and gentlemen — give it up for {{artistName}}! This {{category}} is here from {{hometown}} and they are READY. This performance is brought to you by {{sponsorName}}!',
    'Please welcome to the Grand Stage… {{artistName}}! Let\'s see what you\'ve got!',
    'Next up, representing the {{category}} category — {{artistName}}! MAKE SOME NOISE!',
  ],
  sponsor_shoutout: [
    'Tonight\'s Grand Platform Contest is presented by {{titleSponsor}} — thank you for making this show possible!',
    'Massive shoutout to {{sponsorName}} — one of our incredible contest sponsors! We couldn\'t do this without you!',
    'This performance was brought to you by {{sponsorName}}. Check them out on the platform!',
  ],
  prize_reveal: [
    'And now… the moment you have ALL been waiting for. Let\'s reveal tonight\'s grand prize!',
    'The winner doesn\'t just get glory — they get THIS. Let\'s reveal what\'s on the line!',
  ],
  round_transition: [
    'That was INCREDIBLE! We\'re moving into {{roundName}} — stay locked in, things are only getting better!',
    '{{roundName}} starts NOW! The competition just got real. Here. We. Go.',
  ],
  winner_announce: [
    'The votes are in. The crowd has spoken. And the winner of the BerntoutGlobal Grand Platform Contest — {{category}} category — is… {{artistName}}! CONGRATULATIONS!',
    'After an incredible season… your Grand Platform Contest champion is {{artistName}}! Take a bow!',
  ],
  crowd_hype: [
    'I need EVERYONE to make some noise right now! Show our artists what you came here for!',
    'Is this the best crowd we\'ve ever had?! I think YES! Let me HEAR YOU!',
    'The energy in here is UNREAL tonight. Let\'s keep it going!',
  ],
  co_host_handoff: [
    'Now I\'m going to hand things over to my co-host — take it away!',
    'Let\'s hear from the panel — I\'ll be right back with the results!',
  ],
  season_close: [
    'That\'s a wrap on Season {{seasonNumber}} of the BerntoutGlobal Grand Platform Contest! Thank you to every single artist, sponsor, and fan. See you next season. I\'m Ray Journey — good night!',
  ],
};

// ─── Stage Placement ──────────────────────────────────────────────────────────

export const RAY_STAGE_POSITIONS = {
  center: { x: '50%', y: '60%' },
  leftWing: { x: '15%', y: '65%' },
  rightWing: { x: '85%', y: '65%' },
  foreground: { x: '50%', y: '75%' },
  background: { x: '50%', y: '40%' },
} as const;

// ─── Sound Cue References ─────────────────────────────────────────────────────
// Wire these to your audio engine / Tone.js integration

export const RAY_SOUND_CUES = {
  walkOnFanfare: 'audio/host/ray-walk-on-fanfare.mp3',
  prizeRevealDrum: 'audio/host/prize-reveal-drum.mp3',
  winnerStinger: 'audio/host/winner-stinger.mp3',
  crowdApplause: 'audio/host/crowd-applause.mp3',
  sponsorChime: 'audio/host/sponsor-chime.mp3',
  roundTransition: 'audio/host/round-transition.mp3',
} as const;
