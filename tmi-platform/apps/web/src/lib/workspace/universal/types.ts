/**
 * Universal Workspace Window — shared types (Phase 1).
 *
 * CANONICAL OWNER: `lib/workspace/universal/*` + `components/workspace/universal/*`
 *
 * Legacy adapters (do not invent parallel window systems):
 * - FloatingWorkspacePanel / floatingWorkspaceStore → Pass 8 quick modules only
 * - PlaylistPanelOverlay → LEGACY overlay; Flight Deck opens playlist-studio instead
 * - UniversalDrawerRegistry "playlist" → under-monitor Command Center drawer until migrated
 * - WindowManagerRuntime → general panel layout; workspace geometry lives here
 */

export type WorkspaceWindowState =
  | "CLOSED"
  | "OPENING"
  | "DOCKED"
  | "FLOATING"
  | "RESIZING"
  | "MAXIMIZED"
  | "FULLSCREEN"
  | "PICTURE_IN_PICTURE"
  | "RETURNING"
  | "CLOSING";

export type WorkspaceDockSide = "left" | "right" | "top" | "bottom";

export type WorkspaceSnapZone = "left" | "right" | "top" | "none";

export interface WorkspaceGeometry {
  x: number;
  y: number;
  width: number;
  height: number;
  dockSide?: WorkspaceDockSide;
}

export interface WorkspaceContext {
  /** Active track id when opened from Now Playing / Share. */
  trackId?: string;
  trackTitle?: string;
  artistName?: string;
  playlistId?: string;
  playlistTitle?: string;
  /** Playlist Artifact id — Share Studio shares the package, not the chassis. */
  artifactId?: string;
  artworkUrl?: string;
  videoUrl?: string;
  sharePath?: string;
  linkUrl?: string;
}

export type UniversalWorkspaceId =
  | "playlist-studio"
  | "share-studio"
  /** Registry stubs — point at existing drawers until migrated. */
  | "memory-wall"
  | "inventory"
  | "messaging"
  | "yopho"
  | "lobby"
  | "analytics"
  | "booking"
  | "store"
  | "beat-lab"
  | "media-locker"
  | "sponsors"
  | "notifications"
  | "achievement-center"
  | "live-destinations"
  | "room-controls"
  | "submissions"
  | "scores"
  | "marketplace"
  | "prize-vault"
  | "championship-center"
  | "settings";

export interface UniversalWorkspaceDef {
  id: UniversalWorkspaceId;
  label: string;
  accent: string;
  defaultGeometry: WorkspaceGeometry;
  minWidth: number;
  minHeight: number;
  /** When true, Phase 1 mounts real content; stubs dispatch legacy drawer only. */
  phase1Content: boolean;
  /** Optional UniversalDrawerRegistry module id for stub adapters. */
  legacyDrawerId?: string;
}

export interface WorkspaceInstanceState {
  id: UniversalWorkspaceId;
  windowState: WorkspaceWindowState;
  geometry: WorkspaceGeometry;
  previousGeometry: WorkspaceGeometry | null;
  zIndex: number;
  context: WorkspaceContext;
  /** Once opened, content stays mounted (PersistentWorkspaceRuntime). */
  keepMounted: boolean;
}
