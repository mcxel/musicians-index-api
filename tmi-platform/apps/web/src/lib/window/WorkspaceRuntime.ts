/**
 * TMI Workspace Runtime
 *
 * Manages layout presets and custom user workspaces.
 * Users save layouts like professional creative software: "My Studio", "My Concert", "My Battle".
 *
 * Responsibilities:
 * - Create/edit/delete workspaces
 * - Switch between workspaces
 * - Manage preset templates
 * - Save/restore workspace state
 *
 * @see CLAUDE.md Rule 18 (Visual Identity Formula), Rule 21 (Venue Runtime Convergence)
 */

import { UniversalWindowRuntime, WindowDefinition } from './UniversalWindowRuntime';

export type WorkspaceTemplate =
  | 'broadcast'   // Everything visible (like OBS)
  | 'cinema'      // Minimal UI, focus on stage
  | 'social'      // Chat + friends prominent
  | 'creator'     // Extra controls for performers
  | 'minimal';    // Just stage

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  template: WorkspaceTemplate;
  isCustom: boolean;
  createdAt: Date;
  lastUsed: Date;
  windowState: Record<string, Partial<WindowDefinition>>;
}

/**
 * Workspace Manager — manages user workspaces
 */
export class WorkspaceManager {
  private workspaces = new Map<string, Workspace>();
  private activeWorkspace: string | null = null;
  private runtime: UniversalWindowRuntime;

  constructor(runtime: UniversalWindowRuntime) {
    this.runtime = runtime;
    this.initializePresets();
  }

  private initializePresets(): void {
    // Broadcast Mode — everything visible
    this.workspaces.set('broadcast', {
      id: 'broadcast',
      name: 'Broadcast',
      description: 'Everything visible. Like OBS. Perfect for moderators.',
      template: 'broadcast',
      isCustom: false,
      createdAt: new Date(),
      lastUsed: new Date(),
      windowState: {
        inventory: { state: 'docked' },
        memoryWall: { state: 'docked' },
        chat: { state: 'docked' },
        playlist: { state: 'docked' },
        musicPlayer: { state: 'docked' },
        friends: { state: 'docked' },
      },
    });

    // Cinema Mode — minimal UI
    this.workspaces.set('cinema', {
      id: 'cinema',
      name: 'Cinema',
      description: 'Minimal UI. Perfect for watching concerts.',
      template: 'cinema',
      isCustom: false,
      createdAt: new Date(),
      lastUsed: new Date(),
      windowState: {
        inventory: { state: 'hidden' },
        memoryWall: { state: 'hidden' },
        chat: { state: 'hidden' },
        playlist: { state: 'hidden' },
        musicPlayer: { state: 'visible' },
        friends: { state: 'hidden' },
      },
    });

    // Social Mode — chat + friends prominent
    this.workspaces.set('social', {
      id: 'social',
      name: 'Social',
      description: 'Chat enlarged. Friends visible. Perfect for hanging out.',
      template: 'social',
      isCustom: false,
      createdAt: new Date(),
      lastUsed: new Date(),
      windowState: {
        inventory: { state: 'hidden' },
        memoryWall: { state: 'visible' },
        chat: { state: 'focused' },
        playlist: { state: 'visible' },
        musicPlayer: { state: 'hidden' },
        friends: { state: 'docked' },
      },
    });

    // Creator Mode — extra controls
    this.workspaces.set('creator', {
      id: 'creator',
      name: 'Creator',
      description: 'Extra controls. Camera, mic, stats, queue. For performers.',
      template: 'creator',
      isCustom: false,
      createdAt: new Date(),
      lastUsed: new Date(),
      windowState: {
        inventory: { state: 'focused' },
        memoryWall: { state: 'hidden' },
        chat: { state: 'visible' },
        playlist: { state: 'docked' },
        musicPlayer: { state: 'docked' },
        friends: { state: 'visible' },
      },
    });

    // Minimal Mode — just stage
    this.workspaces.set('minimal', {
      id: 'minimal',
      name: 'Minimal',
      description: 'Just stage. Nothing else. Perfect for full-screen performance.',
      template: 'minimal',
      isCustom: false,
      createdAt: new Date(),
      lastUsed: new Date(),
      windowState: {
        inventory: { state: 'hidden' },
        memoryWall: { state: 'hidden' },
        chat: { state: 'hidden' },
        playlist: { state: 'hidden' },
        musicPlayer: { state: 'hidden' },
        friends: { state: 'hidden' },
      },
    });
  }

  /**
   * Get all workspaces
   */
  getAll(): Workspace[] {
    return Array.from(this.workspaces.values());
  }

  /**
   * Get preset workspaces only
   */
  getPresets(): Workspace[] {
    return this.getAll().filter((w) => !w.isCustom);
  }

  /**
   * Get custom workspaces only
   */
  getCustom(): Workspace[] {
    return this.getAll().filter((w) => w.isCustom);
  }

  /**
   * Get workspace by ID
   */
  get(workspaceId: string): Workspace | undefined {
    return this.workspaces.get(workspaceId);
  }

  /**
   * Get active workspace
   */
  getActive(): Workspace | undefined {
    return this.activeWorkspace ? this.workspaces.get(this.activeWorkspace) : undefined;
  }

  /**
   * Create custom workspace
   */
  create(name: string, description?: string): Workspace {
    const id = `custom_${Date.now()}`;
    const workspace: Workspace = {
      id,
      name,
      description,
      template: 'broadcast',
      isCustom: true,
      createdAt: new Date(),
      lastUsed: new Date(),
      windowState: {},
    };

    this.workspaces.set(id, workspace);
    return workspace;
  }

  /**
   * Activate workspace (apply its layout)
   */
  async activate(workspaceId: string): Promise<void> {
    const workspace = this.get(workspaceId);
    if (!workspace) return;

    this.activeWorkspace = workspaceId;
    workspace.lastUsed = new Date();

    // Apply window state from workspace
    for (const [windowId, state] of Object.entries(workspace.windowState)) {
      const window = this.runtime.getRegistry().get(windowId);
      if (window && state.state) {
        window.state = state.state;

        if (state.state === 'visible' || state.state === 'docked') {
          await this.runtime.getAnimationManager().animateOpen(windowId);
        } else if (state.state === 'hidden') {
          await this.runtime.getAnimationManager().animateClose(windowId);
        }
      }
    }

    // Ensure critical windows stay visible
    this.runtime.ensureCriticalWindowsVisible();
  }

  /**
   * Save current layout to workspace
   */
  saveLayout(workspaceId: string): void {
    const workspace = this.get(workspaceId);
    if (!workspace) return;

    const windows = this.runtime.getRegistry().getAll();
    workspace.windowState = {};

    windows.forEach((window) => {
      workspace.windowState[window.id] = {
        state: window.state,
        position: window.position,
        dimensions: window.dimensions,
        isPinned: window.isPinned,
        isMinimized: window.isMinimized,
      };
    });

    // Persist to storage
    this.runtime.getPersistenceManager().saveLayout(workspaceId, windows);
  }

  /**
   * Delete custom workspace
   */
  delete(workspaceId: string): void {
    const workspace = this.get(workspaceId);
    if (workspace && workspace.isCustom) {
      this.workspaces.delete(workspaceId);
      this.runtime.getPersistenceManager().deleteLayout(workspaceId);

      if (this.activeWorkspace === workspaceId) {
        this.activeWorkspace = null;
      }
    }
  }

  /**
   * Rename workspace
   */
  rename(workspaceId: string, newName: string): void {
    const workspace = this.get(workspaceId);
    if (workspace) {
      workspace.name = newName;
    }
  }

  /**
   * Get most recently used workspace
   */
  getMostRecentlyUsed(): Workspace | undefined {
    return this.getCustom().sort((a, b) => b.lastUsed.getTime() - a.lastUsed.getTime())[0];
  }
}

/**
 * Workspace Runtime — orchestrates workspace management
 */
export class WorkspaceRuntime {
  private manager: WorkspaceManager;
  private runtime: UniversalWindowRuntime;

  constructor(runtime: UniversalWindowRuntime) {
    this.runtime = runtime;
    this.manager = new WorkspaceManager(runtime);
  }

  getManager(): WorkspaceManager {
    return this.manager;
  }

  /**
   * Load user's previous workspace on app startup
   */
  async initializeFromPersistence(): Promise<void> {
    const persistence = this.runtime.getPersistenceManager();
    const layoutNames = persistence.getLayoutNames();

    if (layoutNames.length > 0) {
      // Load most recently used
      const recentWorkspace = this.manager.getMostRecentlyUsed();
      if (recentWorkspace) {
        await this.manager.activate(recentWorkspace.id);
      }
    } else {
      // Load default (broadcast)
      await this.manager.activate('broadcast');
    }
  }

  /**
   * Switch to preset template quickly
   */
  async quickSwitch(template: WorkspaceTemplate): Promise<void> {
    const workspace = this.manager.get(template);
    if (workspace) {
      await this.manager.activate(workspace.id);
    }
  }
}
