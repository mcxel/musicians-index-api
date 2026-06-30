/**
 * TMI Design System — Feature Tokens
 *
 * Unified tokens for each feature (Playlist, Memory Wall, Go Live, etc.)
 * Combines colors + typography + motion + glow into one schema per feature.
 *
 * Usage: Every button, tab, panel, and UI element for a feature uses its assigned tokens.
 * @see CLAUDE.md Rule 7 (Visual Design Language), Rule 14 (No Empty Surface)
 */

import { TMI_COLORS, getFeatureColor } from './colors';
import { TMI_TYPOGRAPHY, applyFeatureButtonStyle } from './typography';
import { TMI_MOTION } from './motion';
import { TMI_GLOW, generateTextGlow, applyNeoBorder } from './glow';

export interface FeatureToken {
  id: string;
  name: string;
  icon: string;
  color: {
    primary: string;
    glow: string;
    hover: string;
    inactive: string;
    rgb: string;
  };
  typography: {
    buttonFontWeight: number;
    buttonFontSize: string;
    letterSpacing: string;
  };
  motion: {
    buttonHoverDuration: number;
    buttonActiveDuration: number;
  };
  glow: {
    textGlowSubtle: string;
    textGlowNormal: string;
    textGlowIntense: string;
    neoBorderStyle: React.CSSProperties;
  };
  usage: {
    contexts: string[];
    maxUsagePercentage: number;
  };
}

/**
 * Feature Tokens — One per major platform feature
 * Structure: Feature ID → Color + Font + Motion + Glow
 */
export const FEATURE_TOKENS: Record<string, FeatureToken> = {
  playlist: {
    id: 'playlist',
    name: 'PLAYLIST',
    icon: '🎵',
    color: TMI_COLORS.features.playlist,
    typography: {
      buttonFontWeight: 700,
      buttonFontSize: '1rem',
      letterSpacing: '0.05em',
    },
    motion: {
      buttonHoverDuration: TMI_MOTION.durations.quick,
      buttonActiveDuration: TMI_MOTION.durations.normal,
    },
    glow: {
      textGlowSubtle: generateTextGlow('#00ffff', 'subtle'),
      textGlowNormal: generateTextGlow('#00ffff', 'normal'),
      textGlowIntense: generateTextGlow('#00ffff', 'intense'),
      neoBorderStyle: applyNeoBorder('#00ffff', 'normal'),
    },
    usage: {
      contexts: ['Workspace Drawer tab', 'Feature button', 'Navigation bar', 'Smart panel header'],
      maxUsagePercentage: 100,
    },
  },

  memoryWall: {
    id: 'memoryWall',
    name: 'MEMORY WALL',
    icon: '📸',
    color: TMI_COLORS.features.memoryWall,
    typography: {
      buttonFontWeight: 700,
      buttonFontSize: '1rem',
      letterSpacing: '0.05em',
    },
    motion: {
      buttonHoverDuration: TMI_MOTION.durations.quick,
      buttonActiveDuration: TMI_MOTION.durations.normal,
    },
    glow: {
      textGlowSubtle: generateTextGlow('#ff00ff', 'subtle'),
      textGlowNormal: generateTextGlow('#ff00ff', 'normal'),
      textGlowIntense: generateTextGlow('#ff00ff', 'intense'),
      neoBorderStyle: applyNeoBorder('#ff00ff', 'normal'),
    },
    usage: {
      contexts: ['Workspace Drawer tab', 'Feature button', 'Upload trigger', 'Gallery header'],
      maxUsagePercentage: 100,
    },
  },

  goLive: {
    id: 'goLive',
    name: 'GO LIVE',
    icon: '🎤',
    color: TMI_COLORS.features.goLive,
    typography: {
      buttonFontWeight: 900,
      buttonFontSize: '1.1rem',
      letterSpacing: '0.08em',
    },
    motion: {
      buttonHoverDuration: TMI_MOTION.durations.quick,
      buttonActiveDuration: TMI_MOTION.durations.normal,
    },
    glow: {
      textGlowSubtle: generateTextGlow('#ff0000', 'subtle'),
      textGlowNormal: generateTextGlow('#ff0000', 'normal'),
      textGlowIntense: generateTextGlow('#ff0000', 'intense'),
      neoBorderStyle: applyNeoBorder('#ff0000', 'intense'),
    },
    usage: {
      contexts: ['Primary CTA button', 'Workspace Drawer tab', 'Live indicator', 'Broadcast start'],
      maxUsagePercentage: 100,
    },
  },

  streamAndWin: {
    id: 'streamAndWin',
    name: 'STREAM & WIN',
    icon: '📻',
    color: TMI_COLORS.features.streamAndWin,
    typography: {
      buttonFontWeight: 700,
      buttonFontSize: '1rem',
      letterSpacing: '0.05em',
    },
    motion: {
      buttonHoverDuration: TMI_MOTION.durations.quick,
      buttonActiveDuration: TMI_MOTION.durations.normal,
    },
    glow: {
      textGlowSubtle: generateTextGlow('#9b59ff', 'subtle'),
      textGlowNormal: generateTextGlow('#9b59ff', 'normal'),
      textGlowIntense: generateTextGlow('#9b59ff', 'intense'),
      neoBorderStyle: applyNeoBorder('#9b59ff', 'normal'),
    },
    usage: {
      contexts: ['Workspace Drawer tab', 'Radio room', 'Listening lobby', 'Event countdown'],
      maxUsagePercentage: 100,
    },
  },

  battles: {
    id: 'battles',
    name: 'BATTLES',
    icon: '🏆',
    color: TMI_COLORS.features.battles,
    typography: {
      buttonFontWeight: 700,
      buttonFontSize: '1rem',
      letterSpacing: '0.05em',
    },
    motion: {
      buttonHoverDuration: TMI_MOTION.durations.quick,
      buttonActiveDuration: TMI_MOTION.durations.normal,
    },
    glow: {
      textGlowSubtle: generateTextGlow('#ffd700', 'subtle'),
      textGlowNormal: generateTextGlow('#ffd700', 'normal'),
      textGlowIntense: generateTextGlow('#ffd700', 'intense'),
      neoBorderStyle: applyNeoBorder('#ffd700', 'normal'),
    },
    usage: {
      contexts: ['Workspace Drawer tab', 'Tournament button', 'Countdown card', 'Championship banner'],
      maxUsagePercentage: 100,
    },
  },

  cyphers: {
    id: 'cyphers',
    name: 'CYPHERS',
    icon: '🎭',
    color: TMI_COLORS.features.cyphers,
    typography: {
      buttonFontWeight: 700,
      buttonFontSize: '1rem',
      letterSpacing: '0.05em',
    },
    motion: {
      buttonHoverDuration: TMI_MOTION.durations.quick,
      buttonActiveDuration: TMI_MOTION.durations.normal,
    },
    glow: {
      textGlowSubtle: generateTextGlow('#00ff00', 'subtle'),
      textGlowNormal: generateTextGlow('#00ff00', 'normal'),
      textGlowIntense: generateTextGlow('#00ff00', 'intense'),
      neoBorderStyle: applyNeoBorder('#00ff00', 'normal'),
    },
    usage: {
      contexts: ['Workspace Drawer tab', 'Cypher room', 'Voting button', 'Round indicator'],
      maxUsagePercentage: 100,
    },
  },

  challenges: {
    id: 'challenges',
    name: 'CHALLENGES',
    icon: '💪',
    color: TMI_COLORS.features.challenges,
    typography: {
      buttonFontWeight: 700,
      buttonFontSize: '1rem',
      letterSpacing: '0.05em',
    },
    motion: {
      buttonHoverDuration: TMI_MOTION.durations.quick,
      buttonActiveDuration: TMI_MOTION.durations.normal,
    },
    glow: {
      textGlowSubtle: generateTextGlow('#ff8800', 'subtle'),
      textGlowNormal: generateTextGlow('#ff8800', 'normal'),
      textGlowIntense: generateTextGlow('#ff8800', 'intense'),
      neoBorderStyle: applyNeoBorder('#ff8800', 'normal'),
    },
    usage: {
      contexts: ['Workspace Drawer tab', 'Challenge prompt', 'Accept button', 'Leaderboard'],
      maxUsagePercentage: 100,
    },
  },

  dance: {
    id: 'dance',
    name: 'DANCE',
    icon: '💃',
    color: TMI_COLORS.features.dance,
    typography: {
      buttonFontWeight: 700,
      buttonFontSize: '1rem',
      letterSpacing: '0.05em',
    },
    motion: {
      buttonHoverDuration: TMI_MOTION.durations.quick,
      buttonActiveDuration: TMI_MOTION.durations.normal,
    },
    glow: {
      textGlowSubtle: generateTextGlow('#ff1493', 'subtle'),
      textGlowNormal: generateTextGlow('#ff1493', 'normal'),
      textGlowIntense: generateTextGlow('#ff1493', 'intense'),
      neoBorderStyle: applyNeoBorder('#ff1493', 'normal'),
    },
    usage: {
      contexts: ['Workspace Drawer tab', 'Dance-Off room', 'BPM indicator', 'Floor toggle'],
      maxUsagePercentage: 100,
    },
  },

  messages: {
    id: 'messages',
    name: 'MESSAGES',
    icon: '💬',
    color: TMI_COLORS.features.messages,
    typography: {
      buttonFontWeight: 700,
      buttonFontSize: '1rem',
      letterSpacing: '0.05em',
    },
    motion: {
      buttonHoverDuration: TMI_MOTION.durations.quick,
      buttonActiveDuration: TMI_MOTION.durations.normal,
    },
    glow: {
      textGlowSubtle: generateTextGlow('#00dddd', 'subtle'),
      textGlowNormal: generateTextGlow('#00dddd', 'normal'),
      textGlowIntense: generateTextGlow('#00dddd', 'intense'),
      neoBorderStyle: applyNeoBorder('#00dddd', 'normal'),
    },
    usage: {
      contexts: ['Workspace Drawer tab', 'Message notification', 'Chat header', 'New message indicator'],
      maxUsagePercentage: 100,
    },
  },

  booking: {
    id: 'booking',
    name: 'BOOKING',
    icon: '📅',
    color: TMI_COLORS.features.booking,
    typography: {
      buttonFontWeight: 700,
      buttonFontSize: '1rem',
      letterSpacing: '0.05em',
    },
    motion: {
      buttonHoverDuration: TMI_MOTION.durations.quick,
      buttonActiveDuration: TMI_MOTION.durations.normal,
    },
    glow: {
      textGlowSubtle: generateTextGlow('#4169e1', 'subtle'),
      textGlowNormal: generateTextGlow('#4169e1', 'normal'),
      textGlowIntense: generateTextGlow('#4169e1', 'intense'),
      neoBorderStyle: applyNeoBorder('#4169e1', 'normal'),
    },
    usage: {
      contexts: ['Workspace Drawer tab', 'Book performer button', 'Calendar view', 'Event schedule'],
      maxUsagePercentage: 100,
    },
  },

  store: {
    id: 'store',
    name: 'STORE',
    icon: '🛒',
    color: TMI_COLORS.features.store,
    typography: {
      buttonFontWeight: 700,
      buttonFontSize: '1rem',
      letterSpacing: '0.05em',
    },
    motion: {
      buttonHoverDuration: TMI_MOTION.durations.quick,
      buttonActiveDuration: TMI_MOTION.durations.normal,
    },
    glow: {
      textGlowSubtle: generateTextGlow('#00ff88', 'subtle'),
      textGlowNormal: generateTextGlow('#00ff88', 'normal'),
      textGlowIntense: generateTextGlow('#00ff88', 'intense'),
      neoBorderStyle: applyNeoBorder('#00ff88', 'normal'),
    },
    usage: {
      contexts: ['Workspace Drawer tab', 'Merch button', 'Purchase CTA', 'Inventory header'],
      maxUsagePercentage: 100,
    },
  },

  revenue: {
    id: 'revenue',
    name: 'REVENUE',
    icon: '💰',
    color: TMI_COLORS.features.revenue,
    typography: {
      buttonFontWeight: 700,
      buttonFontSize: '1rem',
      letterSpacing: '0.05em',
    },
    motion: {
      buttonHoverDuration: TMI_MOTION.durations.quick,
      buttonActiveDuration: TMI_MOTION.durations.normal,
    },
    glow: {
      textGlowSubtle: generateTextGlow('#ffd700', 'subtle'),
      textGlowNormal: generateTextGlow('#ffd700', 'normal'),
      textGlowIntense: generateTextGlow('#ffd700', 'intense'),
      neoBorderStyle: applyNeoBorder('#ffd700', 'normal'),
    },
    usage: {
      contexts: ['Workspace Drawer tab', 'Earnings display', 'Payout button', 'Revenue chart'],
      maxUsagePercentage: 100,
    },
  },

  sponsors: {
    id: 'sponsors',
    name: 'SPONSORS',
    icon: '⭐',
    color: TMI_COLORS.features.sponsors,
    typography: {
      buttonFontWeight: 700,
      buttonFontSize: '1rem',
      letterSpacing: '0.05em',
    },
    motion: {
      buttonHoverDuration: TMI_MOTION.durations.quick,
      buttonActiveDuration: TMI_MOTION.durations.normal,
    },
    glow: {
      textGlowSubtle: generateTextGlow('#c0c0c0', 'subtle'),
      textGlowNormal: generateTextGlow('#c0c0c0', 'normal'),
      textGlowIntense: generateTextGlow('#c0c0c0', 'intense'),
      neoBorderStyle: applyNeoBorder('#c0c0c0', 'normal'),
    },
    usage: {
      contexts: ['Sponsor badge', 'Featured sponsor', 'Partnership indicator', 'Premium tier marker'],
      maxUsagePercentage: 100,
    },
  },
} as const;

/**
 * Get feature token by ID
 * @example getFeatureToken('playlist')
 */
export function getFeatureToken(featureId: string): FeatureToken | null {
  return FEATURE_TOKENS[featureId as keyof typeof FEATURE_TOKENS] || null;
}

/**
 * Get all feature tokens (for sidebar/menu generation)
 */
export function getAllFeatureTokens(): FeatureToken[] {
  return Object.values(FEATURE_TOKENS);
}

/**
 * Check if a feature is at maximum usage percentage
 * @example isFeatureAtCapacity('playlist')
 */
export function isFeatureAtCapacity(featureId: string, usagePercentage: number): boolean {
  const token = getFeatureToken(featureId);
  return token ? usagePercentage >= token.usage.maxUsagePercentage : false;
}
