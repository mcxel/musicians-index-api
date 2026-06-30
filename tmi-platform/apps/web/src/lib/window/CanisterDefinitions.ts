/**
 * TMI Canister Definitions
 *
 * Complete registry of all floating panels with priorities, dimensions, and lifecycle.
 * Every canister inherits from UniversalWindowRuntime.
 *
 * Priorities:
 * - Critical: Cannot accidentally disappear (Stage, Live Controls, Exit)
 * - Primary: Frequently used (Chat, Playlist, Inventory, Memory Wall)
 * - Secondary: Occasional (Rewards, Store, Notifications)
 * - Utility: Rare (Settings, Accessibility, Diagnostics)
 *
 * Lifecycle:
 * Registered → Initialized → Loaded → Visible → Focused → [Pinned|Floating|Docked] → Hidden → Destroyed
 *
 * @see CLAUDE.md Rule 18 (Visual Identity Formula), Rule 21 (Venue Runtime Convergence)
 */

import { WindowDefinition, WindowPriority } from './UniversalWindowRuntime';

export interface CanisterDef extends WindowDefinition {
  canFloat: boolean;
  canResize: boolean;
  canMinimize: boolean;
  canClose: boolean;
  defaultDock?: string;
  peekWidth?: number;
}

/**
 * CRITICAL CANISTERS
 * Cannot accidentally disappear. Always available.
 */

export const CANISTER_STAGE: CanisterDef = {
  id: 'stage',
  title: 'STAGE',
  icon: '🎭',
  priority: 'critical',
  defaultVisible: true,
  state: 'visible',
  position: { x: 0, y: 0, zIndex: 10 },
  dimensions: { width: 800, height: 600, minWidth: 400, minHeight: 300 },
  isPinned: true,
  isMinimized: false,
  canFloat: false,
  canResize: true,
  canMinimize: false,
  canClose: false,
};

export const CANISTER_LIVE_CONTROLS: CanisterDef = {
  id: 'liveControls',
  title: 'LIVE CONTROLS',
  icon: '🎤',
  priority: 'critical',
  defaultVisible: true,
  state: 'visible',
  position: { x: 0, y: 0, dock: 'bottom', zIndex: 100 },
  dimensions: { width: 400, height: 80, minHeight: 60 },
  isPinned: true,
  isMinimized: false,
  canFloat: false,
  canResize: false,
  canMinimize: false,
  canClose: false,
};

export const CANISTER_EXIT: CanisterDef = {
  id: 'exit',
  title: 'EXIT',
  icon: '✕',
  priority: 'critical',
  defaultVisible: true,
  state: 'visible',
  position: { x: 0, y: 0, zIndex: 400 },
  dimensions: { width: 60, height: 60 },
  isPinned: true,
  isMinimized: false,
  canFloat: false,
  canResize: false,
  canMinimize: false,
  canClose: false,
};

/**
 * PRIMARY CANISTERS
 * Frequently used, important to layout.
 */

export const CANISTER_CHAT: CanisterDef = {
  id: 'chat',
  title: 'CHAT',
  icon: '💬',
  priority: 'primary',
  defaultVisible: true,
  defaultDock: 'right',
  state: 'visible',
  position: { x: 0, y: 0, dock: 'right', zIndex: 100 },
  dimensions: { width: 320, height: 600, minWidth: 280, minHeight: 300 },
  isPinned: false,
  isMinimized: false,
  canFloat: true,
  canResize: true,
  canMinimize: true,
  canClose: true,
  peekWidth: 60,
};

export const CANISTER_PLAYLIST: CanisterDef = {
  id: 'playlist',
  title: 'PLAYLIST',
  icon: '🎵',
  priority: 'primary',
  defaultVisible: true,
  defaultDock: 'bottom',
  state: 'visible',
  position: { x: 0, y: 0, dock: 'bottom', zIndex: 100 },
  dimensions: { width: 800, height: 150, minWidth: 400, minHeight: 100 },
  isPinned: false,
  isMinimized: false,
  canFloat: true,
  canResize: true,
  canMinimize: true,
  canClose: true,
  peekWidth: 60,
};

export const CANISTER_INVENTORY: CanisterDef = {
  id: 'inventory',
  title: 'INVENTORY',
  icon: '🎒',
  priority: 'primary',
  defaultVisible: true,
  defaultDock: 'right',
  state: 'visible',
  position: { x: 0, y: 0, dock: 'right', zIndex: 100 },
  dimensions: { width: 300, height: 500, minWidth: 280, minHeight: 300 },
  isPinned: false,
  isMinimized: false,
  canFloat: true,
  canResize: true,
  canMinimize: true,
  canClose: true,
  peekWidth: 60,
};

export const CANISTER_MEMORY_WALL: CanisterDef = {
  id: 'memoryWall',
  title: 'MEMORY WALL',
  icon: '📸',
  priority: 'primary',
  defaultVisible: false,
  defaultDock: 'right',
  state: 'hidden',
  position: { x: 0, y: 0, dock: 'right', zIndex: 100 },
  dimensions: { width: 300, height: 400, minWidth: 280, minHeight: 300 },
  isPinned: false,
  isMinimized: false,
  canFloat: true,
  canResize: true,
  canMinimize: true,
  canClose: true,
  peekWidth: 60,
};

export const CANISTER_MUSIC_PLAYER: CanisterDef = {
  id: 'musicPlayer',
  title: 'NOW PLAYING',
  icon: '🎧',
  priority: 'primary',
  defaultVisible: true,
  defaultDock: 'bottom',
  state: 'visible',
  position: { x: 0, y: 0, dock: 'bottom', zIndex: 100 },
  dimensions: { width: 400, height: 100, minWidth: 400, minHeight: 80 },
  isPinned: false,
  isMinimized: false,
  canFloat: true,
  canResize: false,
  canMinimize: true,
  canClose: true,
  peekWidth: 60,
};

/**
 * SECONDARY CANISTERS
 * Occasional use, can be hidden.
 */

export const CANISTER_AUDIENCE: CanisterDef = {
  id: 'audience',
  title: 'AUDIENCE',
  icon: '👥',
  priority: 'secondary',
  defaultVisible: false,
  defaultDock: 'left',
  state: 'hidden',
  position: { x: 0, y: 0, dock: 'left', zIndex: 100 },
  dimensions: { width: 240, height: 400, minWidth: 220, minHeight: 300 },
  isPinned: false,
  isMinimized: false,
  canFloat: true,
  canResize: true,
  canMinimize: true,
  canClose: true,
  peekWidth: 60,
};

export const CANISTER_QUEUE: CanisterDef = {
  id: 'queue',
  title: 'QUEUE',
  icon: '📋',
  priority: 'secondary',
  defaultVisible: false,
  defaultDock: 'right',
  state: 'hidden',
  position: { x: 0, y: 0, dock: 'right', zIndex: 100 },
  dimensions: { width: 300, height: 400, minWidth: 280, minHeight: 300 },
  isPinned: false,
  isMinimized: false,
  canFloat: true,
  canResize: true,
  canMinimize: true,
  canClose: true,
  peekWidth: 60,
};

export const CANISTER_REWARDS: CanisterDef = {
  id: 'rewards',
  title: 'REWARDS',
  icon: '⭐',
  priority: 'secondary',
  defaultVisible: false,
  defaultDock: 'top',
  state: 'hidden',
  position: { x: 0, y: 0, dock: 'top', zIndex: 100 },
  dimensions: { width: 300, height: 150, minWidth: 280, minHeight: 120 },
  isPinned: false,
  isMinimized: false,
  canFloat: true,
  canResize: true,
  canMinimize: true,
  canClose: true,
  peekWidth: 60,
};

export const CANISTER_STORE: CanisterDef = {
  id: 'store',
  title: 'STORE',
  icon: '🛒',
  priority: 'secondary',
  defaultVisible: false,
  defaultDock: 'right',
  state: 'hidden',
  position: { x: 0, y: 0, dock: 'right', zIndex: 100 },
  dimensions: { width: 300, height: 400, minWidth: 280, minHeight: 300 },
  isPinned: false,
  isMinimized: false,
  canFloat: true,
  canResize: true,
  canMinimize: true,
  canClose: true,
  peekWidth: 60,
};

export const CANISTER_NOTIFICATIONS: CanisterDef = {
  id: 'notifications',
  title: 'NOTIFICATIONS',
  icon: '🔔',
  priority: 'secondary',
  defaultVisible: false,
  defaultDock: 'top',
  state: 'hidden',
  position: { x: 0, y: 0, dock: 'top', zIndex: 100 },
  dimensions: { width: 300, height: 200, minWidth: 280, minHeight: 150 },
  isPinned: false,
  isMinimized: false,
  canFloat: true,
  canResize: true,
  canMinimize: true,
  canClose: true,
  peekWidth: 60,
};

/**
 * UTILITY CANISTERS
 * Rarely used, usually hidden.
 */

export const CANISTER_SETTINGS: CanisterDef = {
  id: 'settings',
  title: 'SETTINGS',
  icon: '⚙️',
  priority: 'utility',
  defaultVisible: false,
  state: 'hidden',
  position: { x: 0, y: 0, dock: 'center', zIndex: 300 },
  dimensions: { width: 400, height: 600, minWidth: 400, minHeight: 500 },
  isPinned: false,
  isMinimized: false,
  canFloat: false,
  canResize: false,
  canMinimize: false,
  canClose: true,
};

export const CANISTER_STATISTICS: CanisterDef = {
  id: 'statistics',
  title: 'STATISTICS',
  icon: '📊',
  priority: 'utility',
  defaultVisible: false,
  state: 'hidden',
  position: { x: 0, y: 0, dock: 'right', zIndex: 100 },
  dimensions: { width: 300, height: 400, minWidth: 280, minHeight: 300 },
  isPinned: false,
  isMinimized: false,
  canFloat: true,
  canResize: true,
  canMinimize: true,
  canClose: true,
  peekWidth: 60,
};

export const CANISTER_MODERATION: CanisterDef = {
  id: 'moderation',
  title: 'MODERATION',
  icon: '🛡️',
  priority: 'utility',
  defaultVisible: false,
  state: 'hidden',
  position: { x: 0, y: 0, dock: 'left', zIndex: 100 },
  dimensions: { width: 300, height: 500, minWidth: 280, minHeight: 400 },
  isPinned: false,
  isMinimized: false,
  canFloat: true,
  canResize: true,
  canMinimize: true,
  canClose: true,
  peekWidth: 60,
};

/**
 * Registry of all canisters
 */
export const ALL_CANISTERS: CanisterDef[] = [
  // Critical
  CANISTER_STAGE,
  CANISTER_LIVE_CONTROLS,
  CANISTER_EXIT,

  // Primary
  CANISTER_CHAT,
  CANISTER_PLAYLIST,
  CANISTER_INVENTORY,
  CANISTER_MEMORY_WALL,
  CANISTER_MUSIC_PLAYER,

  // Secondary
  CANISTER_AUDIENCE,
  CANISTER_QUEUE,
  CANISTER_REWARDS,
  CANISTER_STORE,
  CANISTER_NOTIFICATIONS,

  // Utility
  CANISTER_SETTINGS,
  CANISTER_STATISTICS,
  CANISTER_MODERATION,
];

/**
 * Get canister definition by ID
 */
export function getCanisterDefinition(canisterId: string): CanisterDef | undefined {
  return ALL_CANISTERS.find((c) => c.id === canisterId);
}

/**
 * Get canisters by priority
 */
export function getCanistersByPriority(priority: WindowPriority): CanisterDef[] {
  return ALL_CANISTERS.filter((c) => c.priority === priority);
}
