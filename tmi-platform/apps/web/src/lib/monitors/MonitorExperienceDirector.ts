/**
 * MonitorExperienceDirector.ts — Role-Aware Multi-Monitor Experience Orchestration
 *
 * Canon:
 * - SOURCE COUNT ≠ FRAME SHAPE
 * - ONE FEED / EXPERIENCE → ONE PLAYER SURFACE → ONE MONITOR SLOT
 * - FEED IDENTITY ≠ FEED POSITION (placement is movable without restarting stream/session)
 * - SINGLE AUDIO AUTHORITY (one mixer, no overlapping double audio)
 *
 * Rules:
 * - FAN:
 *    Monitor 1: Performer / Live primary feed (16:9, PRIMARY)
 *    Monitor 2: Fan self / Presence / Avatar lobby (16:9, SECONDARY)
 *    Monitor 3: Audience / Venue world view (16:9, TERTIARY)
 * - PERFORMER:
 *    Monitor 1: Performer self / Live camera (16:9, PRIMARY)
 *    Monitor 2: Audience / Venue view (16:9, SECONDARY)
 *    Monitor 3: Authorized secondary (Band / Guest / Host / Backstage / Aux) (16:9, TERTIARY)
 */

import type {
  MonitorPlacement,
  PerformanceLayoutPreset,
  PlayerSurfaceAssignment,
  SurfaceSourceType,
} from "@/lib/liveFabric/contracts/PresentationContracts";

export interface MonitorExperienceInput {
  role: "FAN" | "PERFORMER" | "ADMIN";
  profileId: string;
  userId?: string;
  sessionId: string;
  roomId: string;
  experienceType: string;
  deviceTier: "phone" | "tablet" | "desktop";
  availableSources: Array<{
    sourceId: string;
    sourceType: SurfaceSourceType;
    label?: string;
    streamUrl?: string;
    isAuthorized?: boolean;
  }>;
  initialFocusedMonitorIndex?: number;
  userPresetPreference?: PerformanceLayoutPreset;
  userPlacementPreference?: Record<string, MonitorPlacement>;
}

export interface MonitorExperienceState {
  role: "FAN" | "PERFORMER" | "ADMIN";
  profileId: string;
  sessionId: string;
  roomId: string;
  experienceType: string;
  deviceTier: "phone" | "tablet" | "desktop";
  activePreset: PerformanceLayoutPreset;
  activeFocusMonitorId: string;
  primaryAudioMonitorId: string;
  assignments: PlayerSurfaceAssignment[];
  preferenceKey: string;
}

export interface AdaptiveLayoutObservation {
  role: string;
  experienceType: string;
  deviceTier: string;
  preferredPlacement: Record<string, MonitorPlacement>;
  preferredFocusIndex: number;
  sampleCount: number;
  lastUpdated: number;
}

// In-memory persistent preferences cache (per session/client runtime)
const preferenceStorage = new Map<string, PerformanceLayoutPreset>();
const placementStorage = new Map<string, Record<string, MonitorPlacement>>();
const adaptiveObservations = new Map<string, AdaptiveLayoutObservation>();

function createAssignment(
  slotIndex: number,
  source: {
    sourceId: string;
    sourceType: SurfaceSourceType;
    label?: string;
    streamUrl?: string;
    isAuthorized?: boolean;
  },
  details: Pick<PlayerSurfaceAssignment, "monitorId" | "placement" | "aspectRatio"> & {
    isPrimaryAudio: boolean;
    isFocused: boolean;
  },
): PlayerSurfaceAssignment {
  return {
    slotIndex,
    label: source.label ?? source.sourceType,
    sourceId: source.sourceId,
    sourceType: source.sourceType,
    streamUrl: source.streamUrl,
    isAuthorized: source.isAuthorized ?? true,
    canReorder: true,
    canSwap: true,
    ...details,
  };
}

function buildPreferenceKey(role: string, experienceType: string, deviceTier: string): string {
  return `${role.toLowerCase()}:${experienceType.toLowerCase()}:${deviceTier.toLowerCase()}`;
}

export class MonitorExperienceDirector {
  private state: MonitorExperienceState;
  private fullscreenMonitorId: string | null = null;
  private fullscreenPlacements = new Map<string, MonitorPlacement>();

  constructor(input: MonitorExperienceInput) {
    this.state = this.orchestrate(input);
  }

  /**
   * Orchestrate role-aware monitor assignments adhering strictly to canonical laws.
   */
  public orchestrate(input: MonitorExperienceInput): MonitorExperienceState {
    const {
      role,
      profileId,
      sessionId,
      roomId,
      experienceType,
      deviceTier,
      availableSources,
      initialFocusedMonitorIndex = 0,
      userPresetPreference,
      userPlacementPreference,
    } = input;

    const prefKey = buildPreferenceKey(role, experienceType, deviceTier);
    const savedPreset = preferenceStorage.get(prefKey);
    const savedPlacements = placementStorage.get(prefKey);

    // Determine default layout preset based on device and user choice
    const activePreset: PerformanceLayoutPreset =
      userPresetPreference ?? savedPreset ?? (deviceTier === "phone" ? "FOCUS_PRIMARY" : "DUAL_SIDE_BY_SIDE");

    const assignments: PlayerSurfaceAssignment[] = [];

    if (role === "FAN") {
      // Monitor 1: Performer Live Feed (Primary 16:9)
      const performerSource = availableSources.find(
        (s) => s.sourceType === "PERFORMER_FEED" && (s.isAuthorized ?? true),
      ) ?? {
        sourceId: `performer-${roomId}`,
        sourceType: "PERFORMER_FEED" as SurfaceSourceType,
        isAuthorized: false,
      };

      assignments.push(createAssignment(0, performerSource, {
        monitorId: "monitor-1",
        aspectRatio: "16:9",
        placement: "FOCUS",
        isPrimaryAudio: true,
        isFocused: true,
      }));

      // Monitor 2: Fan self / presence / avatar
      const selfSource = availableSources.find(
        (s) => s.sourceType === "FAN_PRESENCE" && (s.isAuthorized ?? true),
      ) ?? {
        sourceId: `presence-${profileId}`,
        sourceType: "FAN_PRESENCE" as SurfaceSourceType,
        isAuthorized: false,
      };

      assignments.push(createAssignment(1, selfSource, {
        monitorId: "monitor-2",
        aspectRatio: "16:9",
        placement: deviceTier === "phone" ? "BOTTOM" : "RIGHT",
        isPrimaryAudio: false,
        isFocused: false,
      }));

      // Monitor 3: Audience / venue world view
      const audienceSource = availableSources.find(
        (s) => s.sourceType === "AUDIENCE_VIEW" && (s.isAuthorized ?? true),
      );

      assignments.push(createAssignment(2, audienceSource ?? {
        sourceId: `audience-${roomId}`,
        sourceType: "AUX",
        label: "Audience view unavailable",
        isAuthorized: false,
      }, {
        monitorId: "monitor-3",
        aspectRatio: "16:9",
        placement: "BOTTOM",
        isPrimaryAudio: false,
        isFocused: false,
      }));
    } else {
      // PERFORMER
      // Monitor 1: Performer self / live camera
      const selfCam = availableSources.find(
        (s) => s.sourceType === "SELF_CAMERA" && (s.isAuthorized ?? true),
      ) ?? {
        sourceId: `cam-${profileId}`,
        sourceType: "SELF_CAMERA" as SurfaceSourceType,
        isAuthorized: false,
      };

      assignments.push(createAssignment(0, selfCam, {
        monitorId: "monitor-1",
        aspectRatio: "16:9",
        placement: "FOCUS",
        isPrimaryAudio: true,
        isFocused: true,
      }));

      // Monitor 2: Audience / venue view
      const audienceSource = availableSources.find(
        (s) => s.sourceType === "AUDIENCE_VIEW" && (s.isAuthorized ?? true),
      ) ?? {
        sourceId: `audience-${roomId}`,
        sourceType: "AUDIENCE_VIEW" as SurfaceSourceType,
        isAuthorized: false,
      };

      assignments.push(createAssignment(1, audienceSource, {
        monitorId: "monitor-2",
        aspectRatio: "16:9",
        placement: deviceTier === "phone" ? "BOTTOM" : "RIGHT",
        isPrimaryAudio: false,
        isFocused: false,
      }));

      // Monitor 3: Authorized secondary source (Band / Guest / Host / Backstage / Aux)
      const secondarySource = availableSources.find(
        (s) =>
          (s.sourceType === "BAND_MEMBER" ||
            s.sourceType === "HOST" ||
            s.sourceType === "BACKSTAGE" ||
            s.sourceType === "AUX") &&
          (s.isAuthorized ?? true),
      );

      assignments.push(createAssignment(2, secondarySource ?? {
        sourceId: `aux-${roomId}`,
        sourceType: "AUX",
        label: "Secondary source unavailable",
        isAuthorized: false,
      }, {
        monitorId: "monitor-3",
        aspectRatio: "16:9",
        placement: "BOTTOM",
        isPrimaryAudio: false,
        isFocused: false,
      }));
    }

    // Apply saved placement preferences if present
    if (userPlacementPreference || savedPlacements) {
      const activePlacements = userPlacementPreference ?? savedPlacements!;
      for (const assignment of assignments) {
        if (activePlacements[assignment.monitorId]) {
          assignment.placement = activePlacements[assignment.monitorId];
        }
      }
    }

    // Apply initial focus
    const focusedIdx = Math.min(Math.max(0, initialFocusedMonitorIndex), assignments.length - 1);
    const activeFocusMonitorId = assignments[focusedIdx].monitorId;

    for (let i = 0; i < assignments.length; i++) {
      if (i === focusedIdx) {
        assignments[i].isFocused = true;
      } else {
        assignments[i].isFocused = false;
      }
    }

    return {
      role,
      profileId,
      sessionId,
      roomId,
      experienceType,
      deviceTier,
      activePreset,
      activeFocusMonitorId,
      primaryAudioMonitorId: assignments[0].monitorId,
      assignments,
      preferenceKey: prefKey,
    };
  }

  public getState(): MonitorExperienceState {
    return this.state;
  }

  /**
   * User-Controlled Placement Switching.
   * Law: FEED IDENTITY ≠ FEED POSITION.
   * Moving a monitor to "BOTTOM", "RIGHT", "PIP", "STACKED", or "HIDDEN"
   * changes visual placement ONLY; it never restarts WebRTC, resets room,
   * alters sourceId, or breaks audio unless policy explicitly dictates.
   */
  public switchPlacement(monitorId: string, newPlacement: MonitorPlacement): MonitorExperienceState {
    const target = this.state.assignments.find((a) => a.monitorId === monitorId);
    if (!target) return this.state;

    target.placement = newPlacement;

    this.persistPlacementPreference();
    return { ...this.state };
  }

  /**
   * Focus a specific monitor as the primary active surface.
   * Does NOT recreate stream, destroy session, or renegotiate WebRTC.
   * Updates audio focus authority canonically.
   */
  public focusMonitor(monitorId: string): MonitorExperienceState {
    const target = this.state.assignments.find((a) => a.monitorId === monitorId);
    if (!target) return this.state;

    for (const a of this.state.assignments) {
      if (a.monitorId === monitorId) {
        a.isFocused = true;
        a.isPrimaryAudio = true;
      } else {
        a.isFocused = false;
        a.isPrimaryAudio = false;
      }
    }

    this.state.activeFocusMonitorId = monitorId;

    // Single Audio Authority: Focused monitor receives active primary audio policy
    // Secondary monitors duck or mute to prevent uncontrolled overlap
    for (const a of this.state.assignments) {
      if (a.monitorId === monitorId) {
        a.isPrimaryAudio = true;
        this.state.primaryAudioMonitorId = monitorId;
      } else {
        a.isPrimaryAudio = false;
      }
    }

    this.recordObservation(monitorId);
    return { ...this.state };
  }

  /**
   * Swap two monitor placements without modifying source sessions.
   */
  public swapMonitors(monitorIdA: string, monitorIdB: string): MonitorExperienceState {
    const a = this.state.assignments.find((x) => x.monitorId === monitorIdA);
    const b = this.state.assignments.find((x) => x.monitorId === monitorIdB);
    if (!a || !b) return this.state;

    const tempPlacement = a.placement;
    const tempAudio = a.isPrimaryAudio;
    const tempFocus = a.isFocused;

    a.placement = b.placement;
    a.isPrimaryAudio = b.isPrimaryAudio;
    a.isFocused = b.isFocused;

    b.placement = tempPlacement;
    b.isPrimaryAudio = tempAudio;
    b.isFocused = tempFocus;

    if (a.isFocused) {
      this.state.activeFocusMonitorId = a.monitorId;
    } else if (b.isFocused) {
      this.state.activeFocusMonitorId = b.monitorId;
    }

    this.persistPlacementPreference();
    return { ...this.state };
  }

  /**
  * Set a layout preset from the canonical presentation contract.
   */
  public applyPreset(preset: PerformanceLayoutPreset): MonitorExperienceState {
    this.state.activePreset = preset;
    switch (preset) {
      case "FOCUS_PRIMARY":
        if (this.state.assignments[0]) {
          this.state.assignments[0].placement = "FOCUS";
        }
        if (this.state.assignments[1]) {
          this.state.assignments[1].placement = "BOTTOM";
        }
        if (this.state.assignments[2]) {
          this.state.assignments[2].placement = "DOCKED";
        }
        break;

      case "STACKED":
        this.state.assignments.forEach((assignment, index) => {
          assignment.placement = index === 0 ? "TOP" : "BOTTOM";
        });
        break;

      case "DUAL_SIDE_BY_SIDE":
        if (this.state.assignments[0]) {
          this.state.assignments[0].placement = "LEFT";
        }
        if (this.state.assignments[1]) {
          this.state.assignments[1].placement = "RIGHT";
        }
        break;

      case "GRID":
        this.state.assignments.forEach((assignment, index) => {
          assignment.placement = index === 0 ? "FOCUS" : index === 1 ? "RIGHT" : "BOTTOM";
        });
        break;

      case "PIP_CORNER":
        if (this.state.assignments[0]) {
          this.state.assignments[0].placement = "FOCUS";
        }
        if (this.state.assignments[1]) {
          this.state.assignments[1].placement = "PIP";
        }
        break;

      default:
        break;
    }

    preferenceStorage.set(this.state.preferenceKey, preset);
    this.persistPlacementPreference();
    return { ...this.state };
  }

  /**
   * Toggle fullscreen on a single selected monitor surface.
   * Law: Fullscreen MUST promote the selected player surface, never the entire grid/wrapper.
   */
  public toggleFullscreen(monitorId: string): MonitorExperienceState {
    const target = this.state.assignments.find((a) => a.monitorId === monitorId);
    if (!target) return this.state;

    if (this.fullscreenMonitorId === monitorId) {
      for (const assignment of this.state.assignments) {
        assignment.placement = this.fullscreenPlacements.get(assignment.monitorId) ?? assignment.placement;
      }
      this.fullscreenPlacements.clear();
      this.fullscreenMonitorId = null;
    } else {
      this.fullscreenPlacements.clear();
      for (const assignment of this.state.assignments) {
        this.fullscreenPlacements.set(assignment.monitorId, assignment.placement);
        assignment.placement = assignment.monitorId === monitorId ? "FOCUS" : "HIDDEN";
      }
      this.fullscreenMonitorId = monitorId;
    }

    return { ...this.state };
  }

  private persistPlacementPreference(): void {
    const placements: Record<string, MonitorPlacement> = {};
    for (const a of this.state.assignments) {
      placements[a.monitorId] = a.placement;
    }
    placementStorage.set(this.state.preferenceKey, placements);
  }

  private recordObservation(focusedMonitorId: string): void {
    const idx = this.state.assignments.findIndex((a) => a.monitorId === focusedMonitorId);
    const existing = adaptiveObservations.get(this.state.preferenceKey);
    const placements: Record<string, MonitorPlacement> = {};
    for (const a of this.state.assignments) {
      placements[a.monitorId] = a.placement;
    }

    if (existing) {
      existing.sampleCount += 1;
      existing.preferredPlacement = placements;
      existing.preferredFocusIndex = idx >= 0 ? idx : 0;
      existing.lastUpdated = Date.now();
    } else {
      adaptiveObservations.set(this.state.preferenceKey, {
        role: this.state.role,
        experienceType: this.state.experienceType,
        deviceTier: this.state.deviceTier,
        preferredPlacement: placements,
        preferredFocusIndex: idx >= 0 ? idx : 0,
        sampleCount: 1,
        lastUpdated: Date.now(),
      });
    }
  }
}
