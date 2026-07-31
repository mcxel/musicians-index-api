/**
 * PresentationDirector — Core Spatial Presentation Orchestration Engine.
 * Operates above scenes, rooms, and competitions to manage:
 *  - OverlayManager (0 hardcoded pixel offsets; 100% spatial anchor binding)
 *  - AnchorEngine (Performer, Host, Audience, Floor, Billboard, Head sockets)
 *  - MonitorLayoutEngine (50/50 dual stack, 2x2 quad, 4x2 octo, non-destructive swap)
 *  - CameraDirector (Follow, Orbit, Focus, Cinematic Fly-in)
 *  - AnimationTimeline (Phase sequencing for Battles, Ciphers, Lounges)
 *  - CelebrationDirector (Winner reveal, confetti, sparks, gold lighting)
 *
 * Television Show Packages (Battle Pack v1 grammar, MonitorAnchorZones,
 * LayerStack, semantic events) resolve through ShowPackageDirector — this
 * class remains the spatial overlay/camera authority those packages drive.
 */

export type SpatialAnchorId =
  | "performer-primary"
  | "performer-secondary"
  | "host-anchor"
  | "judge-anchor"
  | "audience-row-1"
  | "avatar-head-top"
  | "avatar-shoulder-left"
  | "avatar-shoulder-right"
  | "lounge-center-screen"
  | "stage-billboard-left"
  | "battle-score-top"
  | "winner-focus-center"
  | "floor-projection-center";

export type OverlayType =
  | "NEON_PERFORMER_FRAME"
  | "BATTLE_VERSUS_BADGE"
  | "SCOREBOARD_HUD"
  | "WINNER_CROWN_BANNER"
  | "SPONSOR_LOWER_THIRD"
  | "PLAYLIST_VISUALIZER_OVERLAY"
  | "SPEAKER_AUDIO_WAVEFORM";

export interface SpatialAnchorDefinition {
  id: SpatialAnchorId;
  label: string;
  category: "WORLD" | "AVATAR" | "PERFORMER" | "SCREEN_SPACE";
  offset: { x: number; y: number; z: number };
  billboard: boolean; // Always face camera
}

export interface PresentationOverlay {
  id: string;
  type: OverlayType;
  targetAnchorId: SpatialAnchorId;
  visible: boolean;
  opacity: number;
  scale: number;
  data?: Record<string, unknown>;
}

export interface CameraDirectorCommand {
  mode: "FOLLOW" | "ORBIT" | "FIXED" | "CINEMATIC_FLY_IN";
  targetAnchorId: SpatialAnchorId;
  fov?: number;
  transitionDurationMs?: number;
}

export interface CelebrationEvent {
  eventId: string;
  type: "WINNER_DECLARED" | "BEAT_DROPPED" | "MILESTONE_UNLOCKED";
  winnerName?: string;
  confettiEnabled: boolean;
  sparksEnabled: boolean;
  goldLightingEnabled: boolean;
  durationMs: number;
}

// ── Master Spatial Anchor Registry ───────────────────────────────────────────

export const MASTER_SPATIAL_ANCHORS: Record<SpatialAnchorId, SpatialAnchorDefinition> = {
  "performer-primary": {
    id: "performer-primary",
    label: "Primary Performer Anchor",
    category: "PERFORMER",
    offset: { x: 0, y: 0, z: 0 },
    billboard: true,
  },
  "performer-secondary": {
    id: "performer-secondary",
    label: "Secondary Performer Anchor",
    category: "PERFORMER",
    offset: { x: 3, y: 0, z: 0 },
    billboard: true,
  },
  "host-anchor": {
    id: "host-anchor",
    label: "Room Host Anchor",
    category: "WORLD",
    offset: { x: -4, y: 0, z: 1 },
    billboard: true,
  },
  "judge-anchor": {
    id: "judge-anchor",
    label: "Judge Desk Anchor",
    category: "WORLD",
    offset: { x: 0, y: 0, z: 5 },
    billboard: true,
  },
  "audience-row-1": {
    id: "audience-row-1",
    label: "Front Row Audience Cluster",
    category: "WORLD",
    offset: { x: 0, y: 0, z: 8 },
    billboard: false,
  },
  "avatar-head-top": {
    id: "avatar-head-top",
    label: "Avatar Head Video Socket",
    category: "AVATAR",
    offset: { x: 0, y: 0.8, z: 0 },
    billboard: true,
  },
  "avatar-shoulder-left": {
    id: "avatar-shoulder-left",
    label: "Left Shoulder Badge Anchor",
    category: "AVATAR",
    offset: { x: -0.4, y: 0.4, z: 0 },
    billboard: true,
  },
  "avatar-shoulder-right": {
    id: "avatar-shoulder-right",
    label: "Right Shoulder Badge Anchor",
    category: "AVATAR",
    offset: { x: 0.4, y: 0.4, z: 0 },
    billboard: true,
  },
  "lounge-center-screen": {
    id: "lounge-center-screen",
    label: "Lounge Spatial Main Display",
    category: "WORLD",
    offset: { x: 0, y: 3, z: -5 },
    billboard: false,
  },
  "stage-billboard-left": {
    id: "stage-billboard-left",
    label: "Stage Left Sponsor Billboard",
    category: "WORLD",
    offset: { x: -8, y: 4, z: -2 },
    billboard: false,
  },
  "battle-score-top": {
    id: "battle-score-top",
    label: "HUD Scoreboard Anchor",
    category: "SCREEN_SPACE",
    offset: { x: 0, y: 0.9, z: 0 },
    billboard: true,
  },
  "winner-focus-center": {
    id: "winner-focus-center",
    label: "Winner Celebration Centerpiece",
    category: "WORLD",
    offset: { x: 0, y: 1.5, z: 0 },
    billboard: true,
  },
  "floor-projection-center": {
    id: "floor-projection-center",
    label: "Stage Floor Projection Ring",
    category: "WORLD",
    offset: { x: 0, y: 0, z: 0 },
    billboard: false,
  },
};

// ── Presentation Director Engine Class ───────────────────────────────────────

class PresentationDirectorEngine {
  private activeOverlays: Map<string, PresentationOverlay> = new Map();
  private currentCameraCommand: CameraDirectorCommand = {
    mode: "FIXED",
    targetAnchorId: "performer-primary",
  };

  /** OverlayManager — Attach overlay to spatial anchor */
  public mountOverlay(overlay: PresentationOverlay) {
    this.activeOverlays.set(overlay.id, overlay);
  }

  public unmountOverlay(id: string) {
    this.activeOverlays.delete(id);
  }

  public getActiveOverlays(): PresentationOverlay[] {
    return Array.from(this.activeOverlays.values());
  }

  /** CameraDirector — Issue camera transition command */
  public setCameraTarget(command: CameraDirectorCommand) {
    this.currentCameraCommand = command;
  }

  public getCameraState(): CameraDirectorCommand {
    return this.currentCameraCommand;
  }

  /** CelebrationDirector — Trigger victory sequence */
  public triggerCelebration(winnerName: string): CelebrationEvent {
    const celebration: CelebrationEvent = {
      eventId: `celeb-${Date.now()}`,
      type: "WINNER_DECLARED",
      winnerName,
      confettiEnabled: true,
      sparksEnabled: true,
      goldLightingEnabled: true,
      durationMs: 8000,
    };

    // Auto-mount winner crown overlay on winner centerpiece anchor
    this.mountOverlay({
      id: celebration.eventId,
      type: "WINNER_CROWN_BANNER",
      targetAnchorId: "winner-focus-center",
      visible: true,
      opacity: 1,
      scale: 1.2,
      data: { winnerName },
    });

    // Move camera focus to winner
    this.setCameraTarget({
      mode: "CINEMATIC_FLY_IN",
      targetAnchorId: "winner-focus-center",
      transitionDurationMs: 2000,
    });

    return celebration;
  }
}

export const PresentationDirector = new PresentationDirectorEngine();
export default PresentationDirector;
