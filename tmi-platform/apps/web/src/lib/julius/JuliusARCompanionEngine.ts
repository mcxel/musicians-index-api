// ─── Julius Interactive AR Companion & Animation Engine ──────────────────────
// Inspired by Astro Bot and PlayStation Playroom AR experience.
// Julius is a 360-degree interactive meerkat AR companion (Amiibo-style)
// that hangs around live streams, parties, and UI spaces.

export type JuliusInteractionMode = 'FULL_COMPANION' | 'AMBIENT' | 'MINIMAL';

export type JuliusAnimationState =
  | 'IDLE_PEEK'
  | 'DANCING'
  | 'AIR_GUITAR'
  | 'DRUMMING'
  | 'PIANO_BOUNCE'
  | 'MAGIC_PORTAL'
  | 'CONFETTI_BURST'
  | 'PARACHUTE_CROWN'
  | 'TREASURE_CHEST_CATCH'
  | 'SPOTLIGHT_HIGHLIGHT'
  | 'SLEEPY'
  | 'CELEBRATING_MILESTONE';

export type JuliusCostume =
  | 'DEFAULT_MEERKAT'
  | 'HALLOWEEN'
  | 'CHRISTMAS'
  | 'DISCO'
  | 'DJ_HEADPHONES'
  | 'SPACE_EXPLORER'
  | 'PIRATE'
  | 'AWARD_SHOW_TUX';

export interface JuliusState {
  id: string; // 'julius'
  name: string; // 'Julius'
  mode: JuliusInteractionMode;
  currentAnimation: JuliusAnimationState;
  costume: JuliusCostume;
  level: number;
  xp: number;
  unlockedCostumes: JuliusCostume[];
  isChatActive: boolean;
  isVisible: boolean;
  activeProp?: string; // e.g. 'guitar', 'magic_wand', 'confetti_cannon'
}

export interface ChatCommandResult {
  command: string;
  animation: JuliusAnimationState;
  prop?: string;
  message: string;
  arEffectUrl?: string;
}

const DEFAULT_JULIUS_STATE: JuliusState = {
  id: 'julius',
  name: 'Julius',
  mode: 'AMBIENT',
  currentAnimation: 'IDLE_PEEK',
  costume: 'DEFAULT_MEERKAT',
  level: 42,
  xp: 18500,
  unlockedCostumes: ['DEFAULT_MEERKAT', 'DISCO', 'DJ_HEADPHONES', 'AWARD_SHOW_TUX'],
  isChatActive: true,
  isVisible: true,
};

/**
 * Handle incoming stream chat commands for Julius
 */
export function handleJuliusChatCommand(commandStr: string, userName?: string): ChatCommandResult | null {
  const cleanCmd = commandStr.trim().toLowerCase();

  if (cleanCmd === '!julius dance') {
    return {
      command: cleanCmd,
      animation: 'DANCING',
      message: `🕺 ${userName || 'Someone'} triggered Julius's 360° Meerkat Dance Break!`,
    };
  }

  if (cleanCmd === '!julius magic') {
    return {
      command: cleanCmd,
      animation: 'MAGIC_PORTAL',
      prop: 'magic_wand',
      message: `✨ ${userName || 'Someone'} requested magic! Julius opened a cosmic AR portal!`,
    };
  }

  if (cleanCmd === '!julius spotlight') {
    return {
      command: cleanCmd,
      animation: 'SPOTLIGHT_HIGHLIGHT',
      message: `🔦 ${userName || 'Someone'} activated Julius's AR Spotlight!`,
    };
  }

  if (cleanCmd === '!julius confetti') {
    return {
      command: cleanCmd,
      animation: 'CONFETTI_BURST',
      prop: 'confetti_cannon',
      message: `🎉 ${userName || 'Someone'} launched Julius's Confetti Cannon!`,
    };
  }

  if (cleanCmd === '!julius guitar') {
    return {
      command: cleanCmd,
      animation: 'AIR_GUITAR',
      prop: 'neon_guitar',
      message: `🎸 ${userName || 'Someone'} handed Julius a neon guitar! Shredding solo active!`,
    };
  }

  if (cleanCmd === '!julius drummer' || cleanCmd === '!julius drums') {
    return {
      command: cleanCmd,
      animation: 'DRUMMING',
      prop: 'drum_sticks',
      message: `🥁 ${userName || 'Someone'} triggered Julius's Gospel Chop Drum Fill!`,
    };
  }

  return null;
}

/**
 * Contextual reaction based on live stream events
 */
export function getJuliusContextualReaction(eventType: 'FOLLOW' | 'SUBSCRIBE' | 'BATTLE_WIN' | 'TIP' | 'DIAMOND_TIER'): ChatCommandResult {
  switch (eventType) {
    case 'FOLLOW':
      return {
        command: 'FOLLOW_EVENT',
        animation: 'CONFETTI_BURST',
        prop: 'trumpet',
        message: '🎺 Julius sounds the celebratory trumpet for the new follower!',
      };
    case 'SUBSCRIBE':
      return {
        command: 'SUB_EVENT',
        animation: 'PARACHUTE_CROWN',
        prop: 'golden_crown',
        message: '👑 Julius parachutes down with a golden VIP crown!',
      };
    case 'BATTLE_WIN':
      return {
        command: 'BATTLE_WIN_EVENT',
        animation: 'CELEBRATING_MILESTONE',
        prop: 'championship_belt',
        message: '🏆 Julius drags out the Championship Belt for the victor!',
      };
    case 'TIP':
      return {
        command: 'TIP_EVENT',
        animation: 'TREASURE_CHEST_CATCH',
        prop: 'treasure_chest',
        message: '💰 Julius catches floating coin tips into the treasure chest!',
      };
    case 'DIAMOND_TIER':
      return {
        command: 'DIAMOND_EVENT',
        animation: 'MAGIC_PORTAL',
        prop: 'diamond_crystals',
        message: '💎 Julius floats crystal diamonds in celebration of Diamond Tier!',
      };
  }
}

/**
 * Personal greeting generator for returning users
 */
export function getJuliusPersonalGreeting(userName: string, trophiesCount: number = 0): string {
  if (trophiesCount > 0) {
    return `Welcome back, ${userName}! 🏆 You have earned ${trophiesCount} trophies! Julius is hyped!`;
  }
  return `Hey ${userName}! 🐾 Julius is ready to hang out in the room!`;
}

export function getJuliusState(): JuliusState {
  return DEFAULT_JULIUS_STATE;
}
