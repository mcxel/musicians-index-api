export type WorkspaceId =
  | "inventory"
  | "messages"
  | "memory-wall"
  | "playlists"
  | "lobby-wall"
  | "camera"
  | "rewards"
  | "store"
  | "settings"
  | "tickets"
  | "marketplace"
  | "magazine"
  | "observatory"
  | "big-ace"
  | "mc"
  | "notes";

export type DrawerMode = "collapsed" | "peek" | "half" | "fullscreen";

export type WorkspaceRenderMode = "full-page" | "drawer" | "widget";

export type WorkspaceRole =
  | "guest"
  | "fan"
  | "performer"
  | "artist"
  | "producer"
  | "sponsor"
  | "advertiser"
  | "venue"
  | "promoter"
  | "writer"
  | "admin"
  | "staff"
  | "mc"
  | "big-ace";

export type WorkspaceCategory =
  | "personal"
  | "social"
  | "media"
  | "commerce"
  | "creator"
  | "admin"
  | "operations";

export interface WorkspaceDefinition {
  id: WorkspaceId;
  label: string;
  icon: string;
  category: WorkspaceCategory;
  description: string;
  requiresAuth?: boolean;
  requiredRoles?: WorkspaceRole[];
  supportedModes: WorkspaceRenderMode[];
  defaultDrawerMode?: DrawerMode;
  supportsFullscreen?: boolean;
  supportsMinimize?: boolean;
}

export interface WorkspaceState {
  activeWorkspace: WorkspaceId | null;
  drawerMode: DrawerMode;
  favorites: WorkspaceId[];
  recentWorkspaces: WorkspaceId[];
  pinnedWorkspaces: WorkspaceId[];
  isCommandPaletteOpen: boolean;
}

export interface WorkspaceActions {
  openWorkspace: (id: WorkspaceId, mode?: DrawerMode) => void;
  closeDrawer: () => void;
  setDrawerMode: (mode: DrawerMode) => void;
  toggleFavorite: (id: WorkspaceId) => void;
  pinWorkspace: (id: WorkspaceId) => void;
  unpinWorkspace: (id: WorkspaceId) => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
}
