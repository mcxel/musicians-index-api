/**
 * MediaSurfaceLayoutDirector — deterministic media-surface + screen-share layout resolver.
 *
 * Pure / testable outside React. Layout is presentation only — never creates a live
 * session, WebRTC peer, or audio element.
 *
 * Share Screen cyclic law:
 *   IDLE → SHARING_SOURCE_1 → … → SHARING_SOURCE_N → IDLE
 * based on actually available/authorized share sources in the session set.
 */

import { resolveMonitorLayoutPreset, type MonitorLayoutPreset } from "@/lib/monitors/MonitorLayoutDirector";

// ─── States ──────────────────────────────────────────────────────────────────

export type MediaSurfaceLayoutState =
  | "MEDIA_ONLY"
  | "SCREEN_SHARE_WITH_PARTICIPANTS"
  | "PARTICIPANTS_ONLY"
  | "STAGE_AND_AUDIENCE"
  | "FULLSCREEN_SHARE"
  | "FULLSCREEN_PARTICIPANT";

export type MediaSurfaceAssignment =
  | "prior_media"
  | "screen_share"
  | "participant_grid"
  | "participant_focus"
  | "stage"
  | "audience"
  | "empty";

export type FullscreenState = "none" | "share" | "participant";
export type DeviceTier = "phone" | "tablet" | "desktop";
export type MediaRoleContext = "fan" | "performer" | "viewer" | "admin";
export type TransitionMode = "instant" | "slide_fade" | "none";

export type ParticipantGridKind =
  | "single"
  | "equal_2"
  | "primary_plus_2"
  | "grid_2x2"
  | "grid_3x2"
  | "grid_4x2"
  | "overflow";

export interface ShareSourceDescriptor {
  id: string;
  label: string;
  /** False when track ended / disconnected — director skips these in the cycle. */
  alive: boolean;
}

export interface MediaSurfaceLayoutInput {
  screenShareActive: boolean;
  shareSourceIndex: number | null;
  availableShareSources: ShareSourceDescriptor[];
  participantCount: number;
  activeSpeakerId: string | null;
  audiencePanelEnabled: boolean;
  fullscreenState: FullscreenState;
  deviceTier: DeviceTier;
  roleContext: MediaRoleContext;
  prefersReducedMotion?: boolean;
  /** Prior top assignment before share — restored on stop. */
  priorTopSurface?: MediaSurfaceAssignment;
  priorBottomSurface?: MediaSurfaceAssignment;
}

export interface ParticipantPanelGeometry {
  id: string;
  column: number;
  row: number;
  colSpan: number;
  rowSpan: number;
  isPrimary: boolean;
  isFocus: boolean;
}

export interface ParticipantLayoutPlan {
  kind: ParticipantGridKind;
  visibleCount: number;
  hiddenCount: number;
  columns: number;
  rows: number;
  gap: number;
  gridTemplateColumns: string;
  gridTemplateRows: string;
  panels: ParticipantPanelGeometry[];
  /** Mobile stack hint from MonitorLayoutDirector. */
  isMobileStack: boolean;
  preset: MonitorLayoutPreset;
}

export interface MediaSurfaceLayoutOutput {
  state: MediaSurfaceLayoutState;
  topSurface: MediaSurfaceAssignment;
  bottomSurface: MediaSurfaceAssignment;
  participantLayout: ParticipantLayoutPlan;
  focusPanelId: string | null;
  transitionMode: TransitionMode;
  overflow: { hiddenCount: number; fallbackLabel: string | null };
  /** Cyclic share UI */
  shareActive: boolean;
  shareSourceIndex: number | null;
  availableShareCount: number;
  shareButtonLabel: string;
  /** Active share source id among alive sources, or null when idle. */
  activeShareSourceId: string | null;
  /** Same room/session — layout never requests a new session. */
  preservesLiveSession: true;
  /** Layout never claims a second audio owner. */
  preservesSingleAudioOwner: true;
}

export interface ShareCycleState {
  shareActive: boolean;
  shareSourceIndex: number | null;
  availableShareSources: ShareSourceDescriptor[];
}

export type ShareCycleAction =
  | { type: "ADVANCE" }
  | { type: "ADD_SOURCE"; source: ShareSourceDescriptor }
  | { type: "SOURCE_ENDED"; sourceId: string }
  | { type: "STOP_ALL" }
  | { type: "SET_INDEX"; index: number };

export interface ShareCycleResult {
  next: ShareCycleState;
  /** True when ADVANCE needs getDisplayMedia (idle → first source). */
  needsCapture: boolean;
  /** True when ADVANCE stopped sharing and prior media should restore. */
  restoredPrior: boolean;
  /** Source id that should appear on the top surface after this action. */
  activeSourceId: string | null;
}

const MAX_VISIBLE_PARTICIPANTS = 8;

// ─── Participant grid 1–8 ────────────────────────────────────────────────────

function panelId(i: number): string {
  return `p${i}`;
}

export function resolveParticipantGridKind(count: number): ParticipantGridKind {
  const c = Math.max(0, count);
  if (c <= 1) return "single";
  if (c === 2) return "equal_2";
  if (c === 3) return "primary_plus_2";
  if (c === 4) return "grid_2x2";
  if (c <= 6) return "grid_3x2";
  if (c <= 8) return "grid_4x2";
  return "overflow";
}

function buildPanelsForKind(
  kind: ParticipantGridKind,
  visibleCount: number,
  activeSpeakerId: string | null,
): ParticipantPanelGeometry[] {
  const panels: ParticipantPanelGeometry[] = [];
  const focusId = activeSpeakerId;

  if (kind === "single" || visibleCount <= 1) {
    panels.push({
      id: panelId(0),
      column: 0,
      row: 0,
      colSpan: 1,
      rowSpan: 1,
      isPrimary: true,
      isFocus: focusId === panelId(0) || focusId == null,
    });
    return panels;
  }

  if (kind === "equal_2") {
    for (let i = 0; i < 2; i++) {
      panels.push({
        id: panelId(i),
        column: i,
        row: 0,
        colSpan: 1,
        rowSpan: 1,
        isPrimary: i === 0,
        isFocus: focusId === panelId(i),
      });
    }
    return panels;
  }

  if (kind === "primary_plus_2") {
    // Primary left (spans 2 rows), two supporting stacked right
    panels.push({
      id: panelId(0),
      column: 0,
      row: 0,
      colSpan: 1,
      rowSpan: 2,
      isPrimary: true,
      isFocus: focusId === panelId(0) || (!focusId && true),
    });
    panels.push({
      id: panelId(1),
      column: 1,
      row: 0,
      colSpan: 1,
      rowSpan: 1,
      isPrimary: false,
      isFocus: focusId === panelId(1),
    });
    panels.push({
      id: panelId(2),
      column: 1,
      row: 1,
      colSpan: 1,
      rowSpan: 1,
      isPrimary: false,
      isFocus: focusId === panelId(2),
    });
    return panels;
  }

  const cols =
    kind === "grid_2x2" ? 2 : kind === "grid_3x2" ? 3 : 4;

  for (let i = 0; i < visibleCount; i++) {
    const column = i % cols;
    const row = Math.floor(i / cols);
    panels.push({
      id: panelId(i),
      column,
      row,
      colSpan: 1,
      rowSpan: 1,
      isPrimary: i === 0,
      isFocus: focusId === panelId(i),
    });
  }
  return panels;
}

export function resolveParticipantLayout(
  participantCount: number,
  deviceTier: DeviceTier,
  activeSpeakerId: string | null = null,
): ParticipantLayoutPlan {
  const total = Math.max(0, participantCount);
  const visibleCount = Math.min(MAX_VISIBLE_PARTICIPANTS, Math.max(1, total || 1));
  const hiddenCount = Math.max(0, total - MAX_VISIBLE_PARTICIPANTS);
  const kind = resolveParticipantGridKind(total === 0 ? 1 : total);

  const isPhone = deviceTier === "phone";
  const isTablet = deviceTier === "tablet";

  // primary_plus_2 uses a custom 2×2 template (primary spans rows)
  if (kind === "primary_plus_2" && !isPhone) {
    return {
      kind,
      visibleCount: 3,
      hiddenCount,
      columns: 2,
      rows: 2,
      gap: 8,
      gridTemplateColumns: "2fr 1fr",
      gridTemplateRows: "1fr 1fr",
      panels: buildPanelsForKind(kind, 3, activeSpeakerId),
      isMobileStack: false,
      preset: {
        columns: 2,
        rows: 2,
        gap: 8,
        aspectRatio: "16/9",
        gridTemplateColumns: "2fr 1fr",
        gridTemplateRows: "1fr 1fr",
        isMobileStack: false,
      },
    };
  }

  const layoutCount =
    kind === "single"
      ? 1
      : kind === "equal_2"
        ? 2
        : kind === "primary_plus_2"
          ? 3
          : kind === "grid_2x2"
            ? 4
            : kind === "grid_3x2"
              ? Math.min(6, visibleCount)
              : Math.min(8, visibleCount);

  const preset = resolveMonitorLayoutPreset(layoutCount, isPhone, isTablet);
  return {
    kind: isPhone && kind === "primary_plus_2" ? "equal_2" : kind,
    visibleCount: layoutCount,
    hiddenCount,
    columns: preset.columns,
    rows: preset.rows,
    gap: preset.gap,
    gridTemplateColumns: preset.gridTemplateColumns,
    gridTemplateRows: preset.gridTemplateRows,
    panels: buildPanelsForKind(
      isPhone && kind === "primary_plus_2" ? "equal_2" : kind,
      layoutCount,
      activeSpeakerId,
    ),
    isMobileStack: preset.isMobileStack,
    preset,
  };
}

// ─── Share cycle (pure) ──────────────────────────────────────────────────────

export function aliveShareSources(sources: ShareSourceDescriptor[]): ShareSourceDescriptor[] {
  return sources.filter((s) => s.alive);
}

export function resolveShareButtonLabel(state: ShareCycleState): string {
  const alive = aliveShareSources(state.availableShareSources);
  if (!state.shareActive || state.shareSourceIndex == null || alive.length === 0) {
    return "SHARE";
  }
  const idx = Math.max(0, Math.min(state.shareSourceIndex, alive.length - 1));
  if (alive.length === 1) return "SHARE 1/1";
  return `SHARE ${idx + 1}/${alive.length}`;
}

/**
 * Pure cyclic advance. When idle, signals needsCapture (caller runs getDisplayMedia).
 * When on last alive source, ADVANCE → IDLE and restoredPrior=true.
 * Dead sources are skipped.
 */
export function reduceShareCycle(state: ShareCycleState, action: ShareCycleAction): ShareCycleResult {
  const base: ShareCycleState = {
    shareActive: state.shareActive,
    shareSourceIndex: state.shareSourceIndex,
    availableShareSources: state.availableShareSources.map((s) => ({ ...s })),
  };

  if (action.type === "STOP_ALL") {
    return {
      next: {
        shareActive: false,
        shareSourceIndex: null,
        availableShareSources: base.availableShareSources.map((s) => ({ ...s, alive: false })),
      },
      needsCapture: false,
      restoredPrior: true,
      activeSourceId: null,
    };
  }

  if (action.type === "ADD_SOURCE") {
    const sources = [...base.availableShareSources, action.source];
    const alive = aliveShareSources(sources);
    const newIndex = alive.findIndex((s) => s.id === action.source.id);
    return {
      next: {
        shareActive: true,
        shareSourceIndex: newIndex >= 0 ? newIndex : alive.length - 1,
        availableShareSources: sources,
      },
      needsCapture: false,
      restoredPrior: false,
      activeSourceId: action.source.id,
    };
  }

  if (action.type === "SOURCE_ENDED") {
    const sources = base.availableShareSources.map((s) =>
      s.id === action.sourceId ? { ...s, alive: false } : s,
    );
    const alive = aliveShareSources(sources);
    if (alive.length === 0) {
      return {
        next: { shareActive: false, shareSourceIndex: null, availableShareSources: sources },
        needsCapture: false,
        restoredPrior: true,
        activeSourceId: null,
      };
    }
    // Stay on current if still alive; otherwise snap to next alive (wrap)
    const currentId =
      base.shareSourceIndex != null
        ? aliveShareSources(base.availableShareSources)[base.shareSourceIndex]?.id
        : null;
    let nextIndex = 0;
    if (currentId && currentId !== action.sourceId) {
      const found = alive.findIndex((s) => s.id === currentId);
      nextIndex = found >= 0 ? found : 0;
    } else {
      // Ended was active — advance to next remaining (same position in new list)
      nextIndex = Math.min(base.shareSourceIndex ?? 0, alive.length - 1);
    }
    return {
      next: {
        shareActive: true,
        shareSourceIndex: nextIndex,
        availableShareSources: sources,
      },
      needsCapture: false,
      restoredPrior: false,
      activeSourceId: alive[nextIndex]?.id ?? null,
    };
  }

  if (action.type === "SET_INDEX") {
    const alive = aliveShareSources(base.availableShareSources);
    if (alive.length === 0) {
      return {
        next: { shareActive: false, shareSourceIndex: null, availableShareSources: base.availableShareSources },
        needsCapture: false,
        restoredPrior: true,
        activeSourceId: null,
      };
    }
    const idx = Math.max(0, Math.min(action.index, alive.length - 1));
    return {
      next: {
        shareActive: true,
        shareSourceIndex: idx,
        availableShareSources: base.availableShareSources,
      },
      needsCapture: false,
      restoredPrior: false,
      activeSourceId: alive[idx]?.id ?? null,
    };
  }

  // ADVANCE
  const alive = aliveShareSources(base.availableShareSources);
  if (!base.shareActive || alive.length === 0 || base.shareSourceIndex == null) {
    return {
      next: base,
      needsCapture: true,
      restoredPrior: false,
      activeSourceId: null,
    };
  }

  const nextIndex = base.shareSourceIndex + 1;
  if (nextIndex >= alive.length) {
    return {
      next: {
        shareActive: false,
        shareSourceIndex: null,
        availableShareSources: base.availableShareSources.map((s) => ({ ...s, alive: false })),
      },
      needsCapture: false,
      restoredPrior: true,
      activeSourceId: null,
    };
  }

  return {
    next: {
      shareActive: true,
      shareSourceIndex: nextIndex,
      availableShareSources: base.availableShareSources,
    },
    needsCapture: false,
    restoredPrior: false,
    activeSourceId: alive[nextIndex]?.id ?? null,
  };
}

// ─── Main resolver ───────────────────────────────────────────────────────────

export function resolveMediaSurfaceLayout(input: MediaSurfaceLayoutInput): MediaSurfaceLayoutOutput {
  const alive = aliveShareSources(input.availableShareSources);
  const shareActive = Boolean(input.screenShareActive && alive.length > 0 && input.shareSourceIndex != null);
  const shareSourceIndex = shareActive ? input.shareSourceIndex : null;
  const activeShareSourceId =
    shareActive && shareSourceIndex != null ? alive[shareSourceIndex]?.id ?? null : null;

  const cycleState: ShareCycleState = {
    shareActive,
    shareSourceIndex,
    availableShareSources: input.availableShareSources,
  };
  const shareButtonLabel = resolveShareButtonLabel(cycleState);

  const participantLayout = resolveParticipantLayout(
    input.participantCount,
    input.deviceTier,
    input.activeSpeakerId,
  );

  const transitionMode: TransitionMode = input.prefersReducedMotion
    ? "instant"
    : "slide_fade";

  const priorTop = input.priorTopSurface ?? "prior_media";
  const priorBottom = input.priorBottomSurface ?? (input.audiencePanelEnabled ? "audience" : "prior_media");

  // Fullscreen overrides
  if (input.fullscreenState === "share" && shareActive) {
    return {
      state: "FULLSCREEN_SHARE",
      topSurface: "screen_share",
      bottomSurface: "empty",
      participantLayout,
      focusPanelId: null,
      transitionMode,
      overflow: {
        hiddenCount: participantLayout.hiddenCount,
        fallbackLabel: participantLayout.hiddenCount > 0 ? `+${participantLayout.hiddenCount} more` : null,
      },
      shareActive: true,
      shareSourceIndex,
      availableShareCount: alive.length,
      shareButtonLabel,
      activeShareSourceId,
      preservesLiveSession: true,
      preservesSingleAudioOwner: true,
    };
  }

  if (input.fullscreenState === "participant") {
    return {
      state: "FULLSCREEN_PARTICIPANT",
      topSurface: "participant_focus",
      bottomSurface: "empty",
      participantLayout,
      focusPanelId: input.activeSpeakerId ?? participantLayout.panels.find((p) => p.isPrimary)?.id ?? null,
      transitionMode,
      overflow: {
        hiddenCount: participantLayout.hiddenCount,
        fallbackLabel: participantLayout.hiddenCount > 0 ? `+${participantLayout.hiddenCount} more` : null,
      },
      shareActive,
      shareSourceIndex,
      availableShareCount: alive.length,
      shareButtonLabel,
      activeShareSourceId,
      preservesLiveSession: true,
      preservesSingleAudioOwner: true,
    };
  }

  if (shareActive) {
    // Rule: TOP = shared source, BOTTOM = participant grid
    // Rule 26: performer context never injects fan avatars into WebRTC panels —
    // director only assigns surfaces; consumers supply real camera tiles.
    return {
      state: "SCREEN_SHARE_WITH_PARTICIPANTS",
      topSurface: "screen_share",
      bottomSurface: "participant_grid",
      participantLayout,
      focusPanelId: input.activeSpeakerId,
      transitionMode,
      overflow: {
        hiddenCount: participantLayout.hiddenCount,
        fallbackLabel: participantLayout.hiddenCount > 0 ? `+${participantLayout.hiddenCount} more` : null,
      },
      shareActive: true,
      shareSourceIndex,
      availableShareCount: alive.length,
      shareButtonLabel,
      activeShareSourceId,
      preservesLiveSession: true,
      preservesSingleAudioOwner: true,
    };
  }

  if (input.participantCount > 0 && !input.audiencePanelEnabled) {
    return {
      state: "PARTICIPANTS_ONLY",
      topSurface: "participant_grid",
      bottomSurface: "empty",
      participantLayout,
      focusPanelId: input.activeSpeakerId,
      transitionMode,
      overflow: {
        hiddenCount: participantLayout.hiddenCount,
        fallbackLabel: participantLayout.hiddenCount > 0 ? `+${participantLayout.hiddenCount} more` : null,
      },
      shareActive: false,
      shareSourceIndex: null,
      availableShareCount: 0,
      shareButtonLabel: "SHARE",
      activeShareSourceId: null,
      preservesLiveSession: true,
      preservesSingleAudioOwner: true,
    };
  }

  if (input.audiencePanelEnabled) {
    return {
      state: "STAGE_AND_AUDIENCE",
      topSurface: priorTop === "screen_share" ? "stage" : priorTop === "prior_media" ? "stage" : priorTop,
      bottomSurface: "audience",
      participantLayout,
      focusPanelId: null,
      transitionMode,
      overflow: { hiddenCount: 0, fallbackLabel: null },
      shareActive: false,
      shareSourceIndex: null,
      availableShareCount: 0,
      shareButtonLabel: "SHARE",
      activeShareSourceId: null,
      preservesLiveSession: true,
      preservesSingleAudioOwner: true,
    };
  }

  return {
    state: "MEDIA_ONLY",
    topSurface: priorTop === "screen_share" ? "prior_media" : priorTop,
    bottomSurface: priorBottom === "participant_grid" ? "prior_media" : priorBottom,
    participantLayout,
    focusPanelId: null,
    transitionMode,
    overflow: { hiddenCount: 0, fallbackLabel: null },
    shareActive: false,
    shareSourceIndex: null,
    availableShareCount: 0,
    shareButtonLabel: "SHARE",
    activeShareSourceId: null,
    preservesLiveSession: true,
    preservesSingleAudioOwner: true,
  };
}

/** Snapshot of layout fields to restore after share stop. */
export interface PriorMediaPresentationSnapshot {
  topSurface: MediaSurfaceAssignment;
  bottomSurface: MediaSurfaceAssignment;
  fullscreenState: FullscreenState;
}

export function capturePriorMediaPresentation(
  layout: MediaSurfaceLayoutOutput,
  fullscreenState: FullscreenState,
): PriorMediaPresentationSnapshot {
  return {
    topSurface: layout.topSurface === "screen_share" ? "prior_media" : layout.topSurface,
    bottomSurface: layout.bottomSurface === "participant_grid" ? "prior_media" : layout.bottomSurface,
    fullscreenState: fullscreenState === "share" ? "none" : fullscreenState,
  };
}
