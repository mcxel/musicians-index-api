/**
 * TMI Canister System — Window Manager
 *
 * Professional broadcast-style window management for floating panels.
 * Every panel (Memory Wall, Inventory, Chat, Music Player, etc.) is a "Canister"
 * that can be shown, hidden, pinned, docked, dragged, resized, minimized, or fullscreened.
 *
 * The live performance is always the priority.
 * Users decide how much UI they want to see.
 *
 * @see CLAUDE.md Rule 18 (Visual Identity Formula), Rule 21 (Venue Runtime Convergence)
 */

export type CanisterState =
  | 'hidden'      // Nothing visible, only a peek tab
  | 'peek'        // Small tab visible, slides open on click
  | 'docked'      // Standard position (left/right/bottom)
  | 'floating'    // User-dragged anywhere
  | 'minimized'   // Collapsed to small tab
  | 'expanded'    // Larger view
  | 'fullscreen'; // Takes entire screen (or large modal)

export type CanisterDock = 'left' | 'right' | 'top' | 'bottom' | 'center' | 'none';

export type LayoutMode =
  | 'broadcast'   // Everything visible, like OBS
  | 'cinema'      // Minimal UI, focus on stage
  | 'social'      // Chat enlarged, friends visible
  | 'creator'     // Extra controls, performance stats
  | 'minimal';    // Just stage, nothing else

export interface CanisterPosition {
  x: number;  // pixels from left
  y: number;  // pixels from top
  width: number;
  height: number;
  dock?: CanisterDock;
  zIndex?: number;
}

export interface CanisterConfig {
  id: string;
  title: string;
  icon: string;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  defaultState?: CanisterState;
  defaultDock?: CanisterDock;
  resizable?: boolean;
  draggable?: boolean;
  peekWidth?: number;
}

export interface CanisterInstance extends CanisterConfig {
  state: CanisterState;
  position: CanisterPosition;
  isPinned: boolean;
  isMinimized: boolean;
  lastDock?: CanisterDock;
}

export interface LayoutPreset {
  name: LayoutMode;
  description: string;
  canisters: Record<string, Partial<CanisterInstance>>;
  hiddenCanisters?: string[];
}

/**
 * Canister System — manages all floating panels
 */
export const CANISTER_SYSTEM = {
  // Predefined canisters
  canisters: {
    inventory: {
      id: 'inventory',
      title: 'INVENTORY',
      icon: '🎒',
      defaultState: 'docked' as const,
      defaultDock: 'right' as const,
      minWidth: 280,
      minHeight: 300,
      resizable: true,
      draggable: true,
      peekWidth: 60,
    },

    memoryWall: {
      id: 'memoryWall',
      title: 'MEMORY WALL',
      icon: '📸',
      defaultState: 'docked' as const,
      defaultDock: 'right' as const,
      minWidth: 280,
      minHeight: 300,
      resizable: true,
      draggable: true,
      peekWidth: 60,
    },

    chat: {
      id: 'chat',
      title: 'CHAT',
      icon: '💬',
      defaultState: 'docked' as const,
      defaultDock: 'right' as const,
      minWidth: 280,
      minHeight: 400,
      resizable: true,
      draggable: true,
      peekWidth: 60,
    },

    playlist: {
      id: 'playlist',
      title: 'PLAYLIST',
      icon: '🎵',
      defaultState: 'docked' as const,
      defaultDock: 'bottom' as const,
      minWidth: 400,
      minHeight: 120,
      resizable: true,
      draggable: true,
      peekWidth: 60,
    },

    musicPlayer: {
      id: 'musicPlayer',
      title: 'NOW PLAYING',
      icon: '🎧',
      defaultState: 'docked' as const,
      defaultDock: 'bottom' as const,
      minWidth: 400,
      minHeight: 80,
      resizable: false,
      draggable: true,
      peekWidth: 60,
    },

    friends: {
      id: 'friends',
      title: 'FRIENDS',
      icon: '👥',
      defaultState: 'docked' as const,
      defaultDock: 'left' as const,
      minWidth: 220,
      minHeight: 300,
      resizable: true,
      draggable: true,
      peekWidth: 60,
    },

    notifications: {
      id: 'notifications',
      title: 'NOTIFICATIONS',
      icon: '🔔',
      defaultState: 'peek' as const,
      defaultDock: 'top' as const,
      minWidth: 300,
      minHeight: 200,
      resizable: true,
      draggable: true,
      peekWidth: 60,
    },

    rewards: {
      id: 'rewards',
      title: 'REWARDS',
      icon: '⭐',
      defaultState: 'peek' as const,
      defaultDock: 'top' as const,
      minWidth: 300,
      minHeight: 150,
      resizable: true,
      draggable: true,
      peekWidth: 60,
    },

    store: {
      id: 'store',
      title: 'STORE',
      icon: '🛒',
      defaultState: 'peek' as const,
      defaultDock: 'right' as const,
      minWidth: 280,
      minHeight: 300,
      resizable: true,
      draggable: true,
      peekWidth: 60,
    },

    settings: {
      id: 'settings',
      title: 'SETTINGS',
      icon: '⚙️',
      defaultState: 'hidden' as const,
      defaultDock: 'center' as const,
      minWidth: 400,
      minHeight: 500,
      resizable: false,
      draggable: true,
      peekWidth: 60,
    },
  },

  // Layout Presets
  layoutPresets: {
    broadcast: {
      name: 'broadcast' as const,
      description: 'Everything visible. Perfect for moderators and producers (like OBS).',
      canisters: {
        inventory: { state: 'docked' as const, dock: 'right' as const, isPinned: true },
        memoryWall: { state: 'docked' as const, dock: 'right' as const, isPinned: true },
        chat: { state: 'docked' as const, dock: 'right' as const, isPinned: false },
        playlist: { state: 'docked' as const, dock: 'bottom' as const, isPinned: true },
        musicPlayer: { state: 'docked' as const, dock: 'bottom' as const, isPinned: true },
        friends: { state: 'docked' as const, dock: 'left' as const, isPinned: false },
      },
      hiddenCanisters: [],
    } as LayoutPreset,

    cinema: {
      name: 'cinema' as const,
      description: 'Minimal UI. Perfect for watching concerts or streaming to TV.',
      canisters: {
        chat: { state: 'hidden' as const },
        musicPlayer: { state: 'peek' as const },
        playlist: { state: 'hidden' as const },
        inventory: { state: 'hidden' as const },
        memoryWall: { state: 'hidden' as const },
        friends: { state: 'hidden' as const },
      },
      hiddenCanisters: ['inventory', 'memoryWall', 'playlist', 'friends'],
    } as LayoutPreset,

    social: {
      name: 'social' as const,
      description: 'Chat enlarged. Friends visible. Perfect for hanging out.',
      canisters: {
        chat: { state: 'expanded' as const, dock: 'right' as const, isPinned: true },
        friends: { state: 'docked' as const, dock: 'left' as const, isPinned: true },
        memoryWall: { state: 'peek' as const, dock: 'right' as const },
        playlist: { state: 'peek' as const, dock: 'bottom' as const },
        inventory: { state: 'hidden' as const },
      },
      hiddenCanisters: ['inventory'],
    } as LayoutPreset,

    creator: {
      name: 'creator' as const,
      description: 'Extra controls for performers. Camera, mic, stats, queue.',
      canisters: {
        playlist: { state: 'docked' as const, dock: 'bottom' as const, isPinned: true },
        musicPlayer: { state: 'docked' as const, dock: 'bottom' as const, isPinned: true },
        inventory: { state: 'expanded' as const, dock: 'right' as const, isPinned: true },
        chat: { state: 'peek' as const, dock: 'right' as const },
        memoryWall: { state: 'hidden' as const },
        friends: { state: 'peek' as const, dock: 'left' as const },
      },
      hiddenCanisters: ['memoryWall'],
    } as LayoutPreset,

    minimal: {
      name: 'minimal' as const,
      description: 'Just stage. Nothing else. Perfect for full-screen performance.',
      canisters: {
        inventory: { state: 'hidden' as const },
        memoryWall: { state: 'hidden' as const },
        chat: { state: 'hidden' as const },
        playlist: { state: 'hidden' as const },
        musicPlayer: { state: 'hidden' as const },
        friends: { state: 'hidden' as const },
        notifications: { state: 'hidden' as const },
        rewards: { state: 'hidden' as const },
      },
      hiddenCanisters: [
        'inventory',
        'memoryWall',
        'chat',
        'playlist',
        'musicPlayer',
        'friends',
        'notifications',
        'rewards',
      ],
    } as LayoutPreset,
  } as const,

  // Default positions (for docked state)
  dockPositions: {
    left: {
      x: 0,
      y: 64,
      width: 240,
      height: 'calc(100vh - 64px)',
    },
    right: {
      x: 'calc(100vw - 320px)',
      y: 64,
      width: 320,
      height: 'calc(100vh - 64px - 120px)',
    },
    top: {
      x: 0,
      y: 64,
      width: '100vw',
      height: 200,
    },
    bottom: {
      x: 0,
      y: 'calc(100vh - 120px)',
      width: '100vw',
      height: 120,
    },
  },
} as const;

/**
 * Get canister config by ID
 * @example getCanisterConfig('inventory')
 */
export function getCanisterConfig(
  canisterId: string,
): (typeof CANISTER_SYSTEM.canisters)[keyof typeof CANISTER_SYSTEM.canisters] | null {
  return CANISTER_SYSTEM.canisters[canisterId as keyof typeof CANISTER_SYSTEM.canisters] || null;
}

/**
 * Get layout preset by name
 * @example getLayoutPreset('cinema')
 */
export function getLayoutPreset(layoutMode: LayoutMode): LayoutPreset | null {
  return CANISTER_SYSTEM.layoutPresets[layoutMode] || null;
}

/**
 * Get dock position for a given dock location
 * @example getDockPosition('right')
 */
export function getDockPosition(dock: CanisterDock) {
  return CANISTER_SYSTEM.dockPositions[dock as keyof typeof CANISTER_SYSTEM.dockPositions] || null;
}

/**
 * Create a new canister instance from config
 * @example createCanisterInstance('inventory', 'docked', 'right')
 */
export function createCanisterInstance(
  canisterId: string,
  state: CanisterState = 'docked',
  dock: CanisterDock = 'right',
): CanisterInstance | null {
  const config = getCanisterConfig(canisterId);
  if (!config) return null;

  const dockPos = getDockPosition(dock);

  return {
    ...config,
    state,
    position: {
      x: typeof dockPos?.x === 'number' ? dockPos.x : 0,
      y: typeof dockPos?.y === 'number' ? dockPos.y : 0,
      width: typeof dockPos?.width === 'number' ? dockPos.width : config.minWidth || 280,
      height: typeof dockPos?.height === 'number' ? dockPos.height : config.minHeight || 300,
      dock,
    },
    isPinned: false,
    isMinimized: false,
  };
}
