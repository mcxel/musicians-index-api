"use client";

import LivingPlayerControlBed from "@/components/monitors/LivingPlayerControlBed";
import {
  resolveMixCommand,
  resolveRoomCommand,
  resolveSourceCommand,
  resolveStationCommand,
} from "@/lib/monitors/livingPlayerCommandBindings";
import type { LivingPlayerCommand, LivingPlayerStationFamily } from "@/lib/monitors/livingPlayerControlContract";
import { resolveLivingPlayerCapabilities, type LivingViewCount } from "@/lib/monitors/livingPlayerControlContract";

/**
 * Canonical dual-monitor stack.
 * Two independent monitors. Each addressable window is its own square.
 * The bezel is a thin surround. It does not force the windows into a 16:9 interior.
 * Operational words stay on LivingPlayerControlBed, not on the glass.
 *
 * Shared by Observatory (gold) + Fan/Performer Command Center (chrome).
 */

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import {
  useCanonicalMediaPlayerRuntime,
  type FrameId,
  type LayoutMode as RuntimeLayoutMode,
} from "@/lib/media/canonicalMediaPlayerRuntime";
import { useLivePrivacyState } from "@/lib/live/livePrivacyState";
import { useAdaptiveVoltronStore } from "@/lib/monitors/AdaptiveVoltronPresentationDirector";
import { describeMonitor2Occupancy, useMobileGpsMonitorLayoutStore } from "@/lib/commandCenter/mobileGpsMonitorLayoutStore";
import { useWorkspacePresentationStore } from "@/lib/workspace/universal/WorkspacePresentationRuntime";
import MonitorBezelFeedPicker from "@/components/monitors/MonitorBezelFeedPicker";

// Ambient standby loop for panes/cells with no assigned source — same
// convention as MediaMatrixEngine/LiveFeedRouter/CommandCenterMediaStack,
// so an empty monitor reads as "on-air standby," not a dead panel.
const ROSE_FALLBACK_URL =
  process.env.NEXT_PUBLIC_DEFAULT_MONITOR_VIDEO?.trim() ||
  process.env.NEXT_PUBLIC_OBSERVATORY_ROSE_VIDEO_URL?.trim() ||
  "";

function StandbyFill() {
  return (
    <div
      data-admin-empty-source="1"
      data-monitor-face="empty"
      style={{
        position: "absolute",
        inset: 0,
        background: "#030308",
      }}
    />
  );
}

export type DualMonitorBezelVariant = "gold" | "chrome";

/** Per-monitor max 8 internal views. Dual A+B = up to 16 total. Never 16 inside one monitor. */
export type MonitorSplitMode = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

const SPLIT_LABELS: Record<MonitorSplitMode, string> = { 1: "1", 2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7", 8: "8" };

export interface CanonicalMonitorPane {
  id: string;
  label?: string;
  /** Content when split = 1 (full frame) */
  children: ReactNode;
  /** Up to 8 content panes shown when split > 1. Falls back to StandbyFill if not provided. */
  cells?: ReactNode[];
  /** Override default split mode for this monitor */
  defaultSplit?: MonitorSplitMode;
}

export interface CanonicalDualMonitorStackProps {
  monitors: CanonicalMonitorPane[];
  variant?: DualMonitorBezelVariant;
  /** Series plate under the bezel top edge */
  seriesLabel?: string;
  style?: CSSProperties;
  /** Optional toolbar above the stack (grid mode, etc.) */
  toolbar?: ReactNode;
  /** Show per-monitor split controls. Defaults true. */
  showSplitControls?: boolean;
  /** External override — parent can drive both splits (MERGE ALL / EXPAND ALL). */
  controlledSplits?: [MonitorSplitMode, MonitorSplitMode];
  onSplitsChange?: (splits: [MonitorSplitMode, MonitorSplitMode]) => void;
  /** Restrict which split modes are offered. Defaults to all modes for the variant. */
  availableModes?: MonitorSplitMode[];
  /** Minimum monitors to render; defaults to dual stack behavior. */
  minMonitorCount?: 1 | 2;
  /**
   * When true, wires this stack to canonicalMediaPlayerRuntime:
   *  - Assigns SELF_CAMERA → frame "a" and AUDIENCE_VIEW → frame "b" on mount
   *  - Renders a [1] [2] [⇄] [⛶] layout-control bar above the monitors
   *  - Applies CSS-collapse (park) to each monitor when its runtime frame is parked
   *  - Calls reset() on unmount
   */
  enableMediaRuntime?: boolean;
  /**
   * Per-monitor FEED picker on the bezel (allowed bezel control).
   * Defaults true when enableMediaRuntime is on.
   */
  showFeedPicker?: boolean;
  /** Role for mandatory Living OS control bed (defaults FAN). */
  livingOsRole?: string;
  /** Opens the shared contextual Living OS desk for the originating monitor. */
  onOpenLivingOs?: (context: { playerId: string; role: string }) => void;
  /** 0 = under the first media player, 1 = under the second. */
  underMonitorIndex?: 0 | 1 | null;
  underMonitorSlot?: ReactNode;
  /** Visually yield Monitor 2 to the drawer. The monitor stays mounted. */
  yieldSecondaryMonitor?: boolean;
  /** Restore Monitor 2 by dismissing the drawer currently occupying its slot. */
  onRestoreMonitor2?: () => void;
}

// ─── Monitor cell grid ────────────────────────────────────────────────────────

import useViewportMode from "@/hooks/useViewportMode";
import { canonicalMonitorFromBezelIndex } from "@/lib/monitors/canonicalMonitorIdentity";
import { resolveMonitorLayoutPreset } from "@/lib/monitors/MonitorLayoutDirector";

function MonitorCellGrid({
  split,
  children,
  cells,
  animKey,
  monitorIndex = 0,
  targetIndex = 0,
  onSelectTarget,
  accent = "#00FFFF",
}: {
  split: MonitorSplitMode;
  children: ReactNode;
  cells?: ReactNode[];
  animKey?: number;
  monitorIndex?: number;
  targetIndex?: number;
  onSelectTarget?: (index: number) => void;
  accent?: string;
}) {
  const { isPhone, isTablet } = useViewportMode();
  const preset = resolveMonitorLayoutPreset(split, isPhone, isTablet);

  // Continuous mounting: cell 0 stays mounted across all split transitions (1..8..1)
  const filled: ReactNode[] = [];
  for (let i = 0; i < split; i++) {
    if (i === 0) {
      filled.push(cells?.[0] ?? children);
    } else {
      filled.push(cells?.[i] ?? <StandbyFill key={`empty-${i}`} />);
    }
  }

  return (
    <div
      data-adaptive-cell-grid={split}
      data-anim-sequence={animKey}
      style={{
        display: "grid",
        gridTemplateColumns: preset.gridTemplateColumns,
        gridTemplateRows: preset.gridTemplateRows,
        gap: preset.gap,
        background: "transparent",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {filled.map((cell, i) => {
        const isTarget = targetIndex === i;
        return (
          <div
            key={i}
            data-monitor-cell-wrapper={`${monitorIndex}-${i}`}
            data-square-monitor="1"
            data-target-active={isTarget ? "true" : "false"}
            onClick={() => onSelectTarget?.(i)}
            style={{
              position: "relative",
              overflow: "hidden",
              background: "#030308",
              aspectRatio: "1 / 1",
              width: "100%",
              minWidth: 0,
              borderRadius: 2,
              border: isTarget ? `1px solid ${accent}` : "1px solid #1A1A3A",
              boxShadow: isTarget ? `0 0 8px ${accent}66` : "none",
              cursor: split > 1 ? "pointer" : "default",
            }}
          >
            <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
              {cell}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const BEZEL: Record<
  DualMonitorBezelVariant,
  { outer: CSSProperties; label: CSSProperties }
> = {
  gold: {
    outer: {
      background: "#B8860B",
      padding: 3,
      borderRadius: 6,
      borderTop: "1px solid #FFD700",
      borderLeft: "1px solid #DAA520",
      borderRight: "1px solid #8B6914",
      borderBottom: "1px solid #6B5000",
    },
    label: {
      fontSize: 9,
      fontWeight: 800,
      letterSpacing: "2px",
      color: "#FFD700",
      textAlign: "center",
      padding: "0 0 6px",
      textTransform: "uppercase",
    },
  },
  chrome: {
    outer: {
      background: "#7A7A7A",
      padding: 3,
      borderRadius: 6,
      borderTop: "1px solid #D0D0D0",
      borderLeft: "1px solid #A0A0A0",
      borderRight: "1px solid #505050",
      borderBottom: "1px solid #3A3A3A",
    },
    label: {
      fontSize: 9,
      fontWeight: 800,
      letterSpacing: "2px",
      color: "#C0C0C0",
      textAlign: "center",
      padding: "0 0 6px",
      textTransform: "uppercase",
    },
  },
};

/** One square glass. Width follows the parent. Height follows the square. */
export function CanonicalMonitorFrame({
  label,
  children,
  style,
}: {
  label?: string;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div data-canonical-monitor style={{ width: "100%", ...style }}>
      {label ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 6,
          }}
        >
          <span
            style={{
              fontSize: 10,
              color: "#7878AA",
              fontWeight: 700,
              letterSpacing: "0.5px",
            }}
          >
            {label}
          </span>
        </div>
      ) : null}
      <div
        data-monitor-frame="1/1"
        data-square-monitor="1"
        style={{
          background: "#020210",
          border: "1px solid #1A1A3A",
          borderRadius: 2,
          overflow: "hidden",
          position: "relative",
          aspectRatio: "1 / 1",
          width: "100%",
          flex: "0 0 auto",
          minHeight: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function VoltronSingleMonitorOverlay({
  primaryContent,
  secondaryContent,
  friends,
  composition,
  focusedParticipantId,
  onFocusParticipant,
  onReturnFromFocus,
  accent,
}: {
  primaryContent: ReactNode;
  secondaryContent?: ReactNode;
  friends: any[];
  composition: string;
  focusedParticipantId: string | null;
  onFocusParticipant: (id: string) => void;
  onReturnFromFocus: () => void;
  accent: string;
}) {
  if (friends.length === 0 && !secondaryContent) {
    return <>{primaryContent}</>;
  }

  // If a friend is focused: show focused friend as primary, and original show + other friends in secondary strip
  if (focusedParticipantId) {
    const focusedFriend = friends.find((f: any) => f.id === focusedParticipantId);
    const otherFriends = friends.filter((f: any) => f.id !== focusedParticipantId);

    return (
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", width: "100%", height: "100%", background: "#050512" }}>
        <div style={{ flex: "1 1 70%", position: "relative", overflow: "hidden", minHeight: 0 }}>
          <div style={{ position: "absolute", top: 8, left: 8, zIndex: 10, display: "flex", gap: 6, alignItems: "center" }}>
            <button
              type="button"
              onClick={onReturnFromFocus}
              style={{
                padding: "4px 8px",
                borderRadius: 4,
                background: "rgba(0,0,0,0.75)",
                border: `1px solid ${accent}`,
                color: "#fff",
                fontSize: 10,
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              ← RETURN
            </button>
            <span style={{ fontSize: 10, fontWeight: 800, color: accent, background: "rgba(0,0,0,0.6)", padding: "2px 6px", borderRadius: 4 }}>
              FOCUS: {focusedFriend?.displayName ?? "Friend"}
            </span>
          </div>
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a20" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 36 }}>👤</div>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#00FFFF", marginTop: 4 }}>{focusedFriend?.displayName ?? "Friend"}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>ACTIVE WEBRTC CALL</div>
            </div>
          </div>
        </div>

        {/* Secondary strip: original primary show + remaining friends */}
        <div style={{ flex: "0 0 30%", borderTop: "2px solid #1E1E45", display: "flex", background: "#08081a", minHeight: 0 }}>
          <div style={{ flex: "1 1 50%", position: "relative", overflow: "hidden", borderRight: "1px solid #1E1E45" }}>
            {primaryContent}
          </div>
          {otherFriends.map((friend: any) => (
            <div
              key={friend.id}
              onClick={() => onFocusParticipant(friend.id)}
              style={{
                flex: "0 0 80px",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "#0d0d26",
                borderRight: "1px solid #1E1E45",
                cursor: "pointer",
                padding: 4,
              }}
            >
              <div style={{ fontSize: 16 }}>👤</div>
              <div style={{ fontSize: 8, fontWeight: 700, color: "#fff", marginTop: 2, textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%" }}>
                {friend.displayName}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // If friends are in the call (not focused):
  if (friends.length > 0) {
    return (
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
        {/* Primary experience panel */}
        <div style={{ flex: friends.length === 1 ? "1 1 50%" : "1 1 70%", position: "relative", overflow: "hidden", minHeight: 0 }}>
          {primaryContent}
        </div>

        {/* Nested friend call panels / strip */}
        <div
          data-voltron-friends-strip
          style={{
            flex: friends.length === 1 ? "1 1 50%" : "0 0 30%",
            display: "flex",
            borderTop: "2px solid #1E1E45",
            background: "#070718",
            overflowX: "auto",
            minHeight: 0,
          }}
        >
          {friends.map((friend: any) => (
            <div
              key={friend.id}
              data-voltron-panel={friend.id}
              onClick={() => onFocusParticipant(friend.id)}
              style={{
                flex: friends.length === 1 ? "1 1 100%" : "1 1 33%",
                minWidth: 100,
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "#0c0c24",
                borderRight: "1px solid #1E1E45",
                cursor: "pointer",
                padding: 4,
              }}
            >
              <div style={{ position: "absolute", top: 4, right: 4, fontSize: 7, fontWeight: 900, color: accent, background: "rgba(0,0,0,0.6)", padding: "1px 4px", borderRadius: 2 }}>
                EXPAND ⛶
              </div>
              <div style={{ fontSize: 20 }}>👤</div>
              <div style={{ fontSize: 9, fontWeight: 800, color: "#00FFFF", marginTop: 4 }}>
                {friend.displayName}
              </div>
              <div style={{ fontSize: 7, color: "rgba(255,255,255,0.4)" }}>IN CALL</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // If no friends, but secondary content exists (e.g. 2 panes merged into 1 monitor):
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
      <div style={{ flex: "1 1 50%", position: "relative", overflow: "hidden", minHeight: 0, borderBottom: "1px solid #1E1E45" }}>
        {primaryContent}
      </div>
      <div style={{ flex: "1 1 50%", position: "relative", overflow: "hidden", minHeight: 0 }}>
        {secondaryContent}
      </div>
    </div>
  );
}

export default function CanonicalDualMonitorStack({
  monitors,
  variant = "gold",
  seriesLabel,
  style,
  toolbar,
  showSplitControls = true,
  controlledSplits,
  onSplitsChange,
  availableModes,
  minMonitorCount = 2,
  enableMediaRuntime = false,
  showFeedPicker,
  livingOsRole = "FAN",
  onOpenLivingOs,
  underMonitorIndex = null,
  underMonitorSlot = null,
  yieldSecondaryMonitor = false,
  onRestoreMonitor2,
}: CanonicalDualMonitorStackProps) {
  const drawerFrameHeight = useMobileGpsMonitorLayoutStore((s) => s.drawerFrameHeight);
  const drawerFullscreen = useMobileGpsMonitorLayoutStore((s) => s.drawerFullscreen);
  const livingCaps = resolveLivingPlayerCapabilities(livingOsRole);
  const [stationIndex, setStationIndex] = useState(0);
  const [activeStation, setActiveStation] = useState<LivingPlayerStationFamily | undefined>(
    livingCaps.stations[0],
  );
  const [roomIndex, setRoomIndex] = useState(0);
  const [targetPanels, setTargetPanels] = useState<[number, number]>([0, 0]);

  const handleSelectPanel = (monIdx: 0 | 1, pIdx: number) => {
    setTargetPanels((prev) => (monIdx === 0 ? [pIdx, prev[1]] : [prev[0], pIdx]));
  };
  const [livingStatus, setLivingStatus] = useState<string>("");

  const handleLivingCommand = (command: LivingPlayerCommand, destinationId: string, targetIndex?: number) => {
    const monIndex = destinationId.includes("b") || destinationId.endsWith("-1") ? 1 : 0;
    const targetP = typeof targetIndex === "number" ? targetIndex : targetPanels[monIndex];
    const targetDesc = `Panel ${targetP + 1}`;

    if (command === "STATION") {
      const result = resolveStationCommand(livingCaps.stations, stationIndex);
      setStationIndex(result.nextIndex);
      if (result.station) setActiveStation(result.station);
      setRoomIndex(0);
      setLivingStatus(result.detail);
      return;
    }
    if (command === "ROOM" || command === "NEXT" || command === "PREV") {
      const result = resolveRoomCommand(activeStation, roomIndex);
      setRoomIndex(result.nextRoomIndex);
      if (result.roomId && enableMediaRuntime) {
        const rt = useCanonicalMediaPlayerRuntime.getState();
        if (rt.roomId === null) {
          rt.setRoomId(result.roomId);
        }
      }
      setLivingStatus(result.detail);
      return;
    }
    if (command === "SOURCE") {
      const frameId = monIndex === 1 ? "b" : "a";
      const current = frames[frameId as "a" | "b"]?.source ?? "SELF_CAMERA";
      const result = resolveSourceCommand(current, frameId as "a" | "b");
      if (enableMediaRuntime) assignSource(frameId as "a" | "b", result.nextSource);
      setLivingStatus(`${result.detail} (P${targetP + 1})`);
      return;
    }
    if (command === "MIX") {
      const view = (typeof splits[monIndex] === "number" ? splits[monIndex] : 1) as import("@/lib/monitors/livingPlayerControlContract").LivingViewCount;
      const result = resolveMixCommand(view);
      if (enableMediaRuntime && result.layout) setLayout(result.layout);
      setLivingStatus(`${result.detail} (P${targetP + 1})`);
      return;
    }
    if (command === "FULL") {
      if (typeof document !== "undefined") {
        const targetEl = document.querySelector(`[data-monitor-cell-wrapper="${monIndex}-${targetP}"]`) as HTMLElement;
        if (targetEl) {
          if (document.fullscreenElement === targetEl) {
            void document.exitFullscreen().catch(() => undefined);
          } else {
            void targetEl.requestFullscreen().catch(() => undefined);
          }
          setLivingStatus(`FULL → Panel ${targetP + 1}`);
          return;
        }
      }
      if (enableMediaRuntime) setFullscreen(monIndex === 0 ? "a" : "b");
      setLivingStatus(`FULL → Monitor ${monIndex === 0 ? "A" : "B"} Panel ${targetP + 1}`);
      return;
    }
    if (command === "PIN") {
      setLivingStatus(`PIN → Panel ${targetP + 1} locked`);
      return;
    }
    if (command === "INFO") {
      setLivingStatus(`INFO → Panel ${targetP + 1} metrics active`);
      return;
    }
    if (command === "SWITCH" || (command as string) === "SWAP") {
      swapFrames("a", "b");
      setLivingStatus("SWAP → Monitors A ⇄ B swapped");
      return;
    }
    if (command === "INSPECT") {
      setLivingStatus(`INSPECT → ${targetDesc} telemetry active`);
      return;
    }
    if (command === "DETACH") {
      setLivingStatus(`DETACH → ${targetDesc} detached`);
      return;
    }
    if (command === "RESET") {
      const frameId = monIndex === 1 ? "b" : "a";
      const current = frames[frameId as "a" | "b"]?.source ?? null;
      const occupancy = describeMonitor2Occupancy({
        sourceB: useWorkspacePresentationStore.getState().sourceB,
        frameBSource: monIndex === 1 ? current : null,
        panels: useAdaptiveVoltronStore.getState().panels,
      });
      if (monIndex === 1 && (occupancy.protectedSession || current === "VENUE_VIEW" || current === "VIDEO_PLAYBACK" || current === "MONITOR_FEED")) {
        if (occupancy.protectedSession) {
          setLivingStatus("CLEAR blocked — Monitor 2 session stays mounted");
          return;
        }
        if (enableMediaRuntime) assignSource("b", "AUDIENCE_VIEW");
        setLivingStatus("CLEAR → Monitor 2 media released");
        return;
      }
      setLivingStatus(`CLEAR → ${targetDesc} cleared`);
      return;
    }
  };

  const bezel = BEZEL[variant];
  const accent = variant === "gold" ? "#FF6B1A" : "#00D4FF";
  const feedPickerEnabled = showFeedPicker ?? enableMediaRuntime;

  const {
    monitorMode,
    setMonitorMode,
    toggleMonitorMode,
    composition,
    friends,
    focusedParticipantId,
    focusParticipant,
    returnFromFocus,
  } = useAdaptiveVoltronStore();

  const m2ExplicitlyActivated = useMobileGpsMonitorLayoutStore((s) => s.m2ExplicitlyActivated);
  const setM2ExplicitlyActivated = useMobileGpsMonitorLayoutStore((s) => s.setM2ExplicitlyActivated);

  const requestMonitor2 = (activated: boolean) => {
    if (activated) {
      setM2ExplicitlyActivated(true);
      setMonitorMode("DUAL");
      if (yieldSecondaryMonitor && underMonitorSlot) onRestoreMonitor2?.();
      return;
    }
    const occupancy = describeMonitor2Occupancy({
      sourceB: useWorkspacePresentationStore.getState().sourceB,
      frameBSource: useCanonicalMediaPlayerRuntime.getState().frames.b.source,
      panels: useAdaptiveVoltronStore.getState().panels,
    });
    const store = useWorkspacePresentationStore.getState();
    const hasDrawer = Boolean(store.drawerWorkspace) || store.drawerWorkspaceStack.length > 0;
    const dismissDrawer = () => {
      if (!hasDrawer) return;
      onRestoreMonitor2?.();
      useWorkspacePresentationStore.setState({
        drawerWorkspace: null,
        drawerWorkspaceStack: [],
        isDrawerExpanded: false,
        activeWorkspace: null,
      });
    };
    if (occupancy.protectedSession) {
      dismissDrawer();
      return;
    }
    if (occupancy.active && !hasDrawer) return;
    setM2ExplicitlyActivated(false);
    setMonitorMode("SINGLE");
    dismissDrawer();
  };

  // ── Canonical media player runtime (opt-in) ──────────────────────────────
  const { assignSource, swapFrames, setLayout, setFullscreen, reset, frames, layout, fullscreenFrame } =
    useCanonicalMediaPlayerRuntime();

  useEffect(() => {
    if (!enableMediaRuntime) return;
    const media = useCanonicalMediaPlayerRuntime.getState();
    const publishedId = useLivePrivacyState.getState().publishedRoomId;
    const venueAlreadyBound =
      Boolean(publishedId) &&
      media.roomId === publishedId &&
      media.frames.a?.source === "VENUE_VIEW";
    if (!venueAlreadyBound) {
      assignSource("a", "SELF_CAMERA");
      assignSource("b", "AUDIENCE_VIEW");
    }
    return () => {
      // Published live must survive HUD chrome remount. Ending live is explicit.
      if (useLivePrivacyState.getState().isLivePublished) return;
      reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enableMediaRuntime]);

  // Derive per-monitor park state from the runtime frames
  const frameAPark = enableMediaRuntime ? frames["a"].parked : false;
  const frameBPark = enableMediaRuntime ? frames["b"].parked : false;

  // Derive overall layout from runtime or Voltron presentation director
  const runtimeLayoutSingle = (enableMediaRuntime && layout === "SINGLE") || monitorMode === "SINGLE";
  // chrome caps at 8; gold can go to 16 unless caller restricts further
  const effectiveModes: MonitorSplitMode[] =
    availableModes ?? [1, 2, 3, 4, 5, 6, 7, 8];

  const [splits, setSplits] = useState<[MonitorSplitMode, MonitorSplitMode]>([
    controlledSplits?.[0] ?? monitors[0]?.defaultSplit ?? 1,
    controlledSplits?.[1] ?? monitors[1]?.defaultSplit ?? 1,
  ]);
  const [animKeys, setAnimKeys] = useState<[number, number]>([0, 0]);
  const viewport = useViewportMode();
  const isPhone = viewport.isPhone;

  // sync external controlledSplits into local state
  useEffect(() => {
    if (!controlledSplits) return;
    setSplits(controlledSplits);
    setAnimKeys((k) => [k[0] + 1, k[1] + 1]);
  }, [controlledSplits?.[0], controlledSplits?.[1]]);

  const setSplit = (index: 0 | 1, mode: MonitorSplitMode) => {
    setSplits((prev) => {
      const next: [MonitorSplitMode, MonitorSplitMode] = [...prev] as [MonitorSplitMode, MonitorSplitMode];
      next[index] = mode;
      onSplitsChange?.(next);
      return next;
    });
    setAnimKeys((k) => {
      const next: [number, number] = [...k] as [number, number];
      next[index] = next[index] + 1;
      return next;
    });
    setTargetPanels((prev) => [
      index === 0 && prev[0] >= mode ? mode - 1 : prev[0],
      index === 1 && prev[1] >= mode ? mode - 1 : prev[1],
    ]);

  };

  const panes = monitors.slice(0, 2);
  while (panes.length < minMonitorCount) {
    panes.push({
      id: `empty-mon-${panes.length}`,
      label: `MONITOR ${panes.length + 1}`,
      children: <StandbyFill />,
    });
  }

  // ── Viewport-height budget (P0 fix 2026-09-19) ──────────────────────────
  // Two 16:9 monitors stack VERTICALLY (locked geometry, see header comment).
  // Historically this stack sized purely from container WIDTH (width:100% +
  // aspectRatio derives height), with no awareness of how much vertical space
  // was actually left below the fold — so on shorter viewports Monitor B could
  // render past the bottom of the screen while the DOM still looked "correct".
  // This block measures the real available height below the stack's own top
  // (which already accounts for the toggle row / toolbar / living-status line
  // rendered above it in this same component) and, only when the natural
  // width would make both monitors taller than that budget, caps the stack's
  // width so both monitors shrink together and stay fully visible. When there
  // is enough room, this never engages — width stays 100% exactly as before.
  const stackWrapperRef = useRef<HTMLDivElement | null>(null);
  const [heightBudgetMaxWidth, setHeightBudgetMaxWidth] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const el = stackWrapperRef.current;
    if (!el) return;

    const recompute = () => {
      const rect = el.getBoundingClientRect();
      // Measure the parent. This element's own width is what the budget writes,
      // so comparing against rect.width clears the cap on the next observation
      // and applies it again — a width loop while the stack top is on screen.
      const naturalWidth = el.parentElement?.clientWidth ?? rect.width;
      if (naturalWidth <= 0) return;

      // Chrome under the stack this component does not own (bottom drawer
      // affordance, monitor controls / command bed strip). Conservative
      // constant since those live in sibling components (CommandCenterMediaStack)
      // that this fix intentionally does not touch.
      const BOTTOM_CHROME_RESERVE_PX = 96;
      const GAP_PX = variant === "chrome" ? 6 : 8;

      const visibleCount = panes.reduce((n, _pane, i) => {
        const isParked = i === 0 ? frameAPark : frameBPark;
        const activeMon = (typeof document !== "undefined" ? document.documentElement.getAttribute("data-focused-monitor") : null) || "A";
        const yieldIdx = activeMon === "B" ? 0 : 1;
        const isHiddenByRuntime2 = (runtimeLayoutSingle && i === 1) || (yieldSecondaryMonitor && i === yieldIdx);
        return isParked || isHiddenByRuntime2 ? n : n + 1;
      }, 0) || 1;

      const availableHeight = window.innerHeight - rect.top - BOTTOM_CHROME_RESERVE_PX;
      if (availableHeight <= 0) {
        setHeightBudgetMaxWidth((prev) => (prev == null ? prev : null));
        return;
      }

      const totalGap = (visibleCount - 1) * GAP_PX;
      const maxWidthFromHeight = ((availableHeight - totalGap) * 16) / (9 * visibleCount);

      if (maxWidthFromHeight > 0 && maxWidthFromHeight < naturalWidth - 1) {
        const next = Math.floor(maxWidthFromHeight);
        setHeightBudgetMaxWidth((prev) => (prev === next ? prev : next));
      } else {
        setHeightBudgetMaxWidth((prev) => (prev == null ? prev : null));
      }
    };

    recompute();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(recompute) : null;
    ro?.observe(el.parentElement ?? el);
    window.addEventListener("resize", recompute);
    window.addEventListener("orientationchange", recompute);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", recompute);
      window.removeEventListener("orientationchange", recompute);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panes.length, frameAPark, frameBPark, runtimeLayoutSingle, yieldSecondaryMonitor, variant]);

  const heightBudgetStackStyle: CSSProperties = heightBudgetMaxWidth
    ? { width: `${heightBudgetMaxWidth}px`, maxWidth: "100%", margin: "0 auto" }
    : { width: "100%" };

  return (
    <div
      data-canonical-dual-monitor-stack
      data-bezel={variant}
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        ...style,
      }}
    >
      <style>{`
        @keyframes monitor-cell-in {
          from { opacity: 0; transform: scale(0.94); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes monitor-cell-pop {
          from { opacity: 0; transform: scale(0.8) translateY(6px); }
          60%  { transform: scale(1.04) translateY(-2px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        [data-mobile-monitor-stack-status] { display: none; }
        @media (max-width: 640px) {
          [data-mobile-monitor-stack-status] { display: flex; }
        }
      `}</style>

      <div
        data-mobile-monitor-stack-status
        style={{
          alignItems: "center",
          justifyContent: "space-between",
          padding: "4px 0 6px",
          color: accent,
          fontSize: 9,
          fontWeight: 900,
          letterSpacing: "0.1em",
        }}
      >
        <span>STACKED MEDIA PLAYERS</span>
        <span>A + B</span>
      </div>

      {/* Runtime layout controls — only rendered when enableMediaRuntime is true */}
      {enableMediaRuntime && !isPhone && (
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          padding: "4px 0 6px",
        }}>
          {(["SINGLE", "SPLIT_2"] as RuntimeLayoutMode[]).map((mode) => {
            const labels: Record<string, string> = { SINGLE: "⬛ 1", SPLIT_2: "⬜⬜ 2" };
            return (
              <button
                key={mode}
                type="button"
                onClick={() => setLayout(mode)}
                style={{
                  padding: "3px 10px",
                  fontSize: 10,
                  fontWeight: 900,
                  border: `1px solid ${layout === mode ? accent : "#1E1E45"}`,
                  borderRadius: 4,
                  background: layout === mode ? accent + "cc" : "#0D0D24",
                  color: layout === mode ? "#fff" : "#7878AA",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  letterSpacing: "0.05em",
                  transition: "background 0.15s, border-color 0.15s, color 0.15s",
                }}
              >
                {labels[mode]}
              </button>
            );
          })}
          <button
            type="button"
            title="Swap Monitor A ⇄ Monitor B"
            onClick={() => swapFrames("a", "b")}
            style={{
              padding: "3px 10px",
              fontSize: 10,
              fontWeight: 900,
              border: "1px solid #1E1E45",
              borderRadius: 4,
              background: "#0D0D24",
              color: "#7878AA",
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "background 0.15s, border-color 0.15s, color 0.15s",
            }}
          >
            ⇄ SWAP
          </button>
          <button
            type="button"
            title={fullscreenFrame ? "Exit fullscreen" : "Fullscreen Monitor A"}
            onClick={() => setFullscreen(fullscreenFrame ? null : "a")}
            style={{
              padding: "3px 10px",
              fontSize: 10,
              fontWeight: 900,
              border: `1px solid ${fullscreenFrame ? accent : "#1E1E45"}`,
              borderRadius: 4,
              background: fullscreenFrame ? accent + "cc" : "#0D0D24",
              color: fullscreenFrame ? "#fff" : "#7878AA",
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "background 0.15s, border-color 0.15s, color 0.15s",
            }}
          >
            ⛶
          </button>
        </div>
      )}

      {/* Voltron Presentation Mode Bar (1 Monitor vs 2 Monitors) */}
      <div
        data-voltron-presentation-bar
        style={{
          display: isPhone ? "none" : "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "4px 8px",
          background: "rgba(5,5,20,0.85)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 6,
          marginBottom: 6,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 9, fontWeight: 800, color: "#7878AA", letterSpacing: "0.08em" }}>
            VIEWPORT:
          </span>
          <button
            type="button"
            data-monitor-mode-single
            aria-pressed={monitorMode === "SINGLE"}
            onClick={() => requestMonitor2(false)}
            style={{
              padding: "3px 8px",
              fontSize: 9,
              fontWeight: 900,
              borderRadius: 4,
              border: `1px solid ${monitorMode === "SINGLE" ? accent : "#1E1E45"}`,
              background: monitorMode === "SINGLE" ? `${accent}33` : "#0D0D24",
              color: monitorMode === "SINGLE" ? accent : "#7878AA",
              cursor: "pointer",
            }}
          >
            ⬛ 1 MONITOR (VOLTRON)
          </button>
          <button
            type="button"
            data-monitor-mode-dual
            aria-pressed={monitorMode === "DUAL"}
            onClick={() => requestMonitor2(true)}
            style={{
              padding: "3px 8px",
              fontSize: 9,
              fontWeight: 900,
              borderRadius: 4,
              border: `1px solid ${monitorMode === "DUAL" ? accent : "#1E1E45"}`,
              background: monitorMode === "DUAL" ? `${accent}33` : "#0D0D24",
              color: monitorMode === "DUAL" ? accent : "#7878AA",
              cursor: "pointer",
            }}
          >
            ⬜⬜ 2 MONITORS
          </button>
        </div>
        {monitorMode === "SINGLE" && (
          <span style={{ fontSize: 8, fontWeight: 800, color: "#00FFFF", letterSpacing: "0.05em" }}>
            {friends.length > 0 ? `VOLTRON · ${friends.length + 1} PANELS` : "VOLTRON 1-MONITOR COMPOSITION"}
          </span>
        )}
      </div>

      {isPhone ? (
        <div data-testid="hub-m2-activation" data-m2-row="clear-of-rail" style={{ display: "flex", width: "100%", justifyContent: "flex-end", gap: 6, marginBottom: 6 }}>
          <button
            type="button"
            data-testid="hub-monitor-2-activate"
            aria-pressed={m2ExplicitlyActivated}
            onClick={() => requestMonitor2(true)}
            style={{
              minHeight: 36,
              padding: "0 12px",
              borderRadius: 6,
              border: `1px solid ${m2ExplicitlyActivated ? accent : "#1E1E45"}`,
              background: m2ExplicitlyActivated ? `${accent}33` : "#0D0D24",
              color: m2ExplicitlyActivated ? accent : "#7878AA",
              fontSize: 11,
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            M2
          </button>
          <button
            type="button"
            data-testid="hub-monitor-2-deactivate"
            onClick={() => requestMonitor2(false)}
            style={{
              minHeight: 36,
              padding: "0 12px",
              borderRadius: 6,
              border: "1px solid #1E1E45",
              background: "#0D0D24",
              color: "#7878AA",
              fontSize: 11,
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            CLOSE M2
          </button>
        </div>
      ) : null}

      {toolbar}
      {livingStatus ? (
        <div data-living-os-binding-status="1" style={{ marginBottom: 6, fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", color: "rgba(0,255,255,0.75)", fontFamily: "inherit" }}>
          LIVING OS · {livingStatus}
        </div>
      ) : null}
      {variant === "chrome" ? (
        /* Chrome: each monitor lives in its own bezel so the two 8-cell groups look physically separate */
        <div ref={stackWrapperRef} style={{ display: "flex", flexDirection: "column", gap: 6, ...heightBudgetStackStyle }}>
          {seriesLabel ? (
            <div style={{ ...bezel.label, textAlign: "left", padding: "0 2px 4px" }}>{seriesLabel}</div>
          ) : null}
          {panes.map((pane, index) => {
            const split = splits[index as 0 | 1];
            const bezelMonitorId = canonicalMonitorFromBezelIndex(index === 0 ? 0 : 1);
            const monLabel = pane.label ?? `MONITOR ${index + 1}`;
            // Park state from canonical runtime (CSS-only, DOM stays mounted)
            const isParked = (index === 0 ? frameAPark : frameBPark);
            const activeMon = (typeof document !== "undefined" ? document.documentElement.getAttribute("data-focused-monitor") : null) || "A";
            const targetFoldIndex = activeMon === "B" ? 0 : 1;
            const yieldedToDrawer = yieldSecondaryMonitor && index === targetFoldIndex;
            const isHiddenByRuntime = (runtimeLayoutSingle && index === 1) || yieldedToDrawer;
            const preset = resolveMonitorLayoutPreset(split, isPhone, viewport.isTablet);
            return (
              <div key={pane.id} style={{ display: "contents" }}>
              <div
                onClick={() => { if (typeof document !== "undefined") document.documentElement.setAttribute("data-focused-monitor", index === 0 ? "A" : "B"); }}
                data-canonical-monitor={index === 0 ? "a" : "b"}
                data-canonical-monitor-id={bezelMonitorId}
                data-adaptive-bezel={split > 1 ? "split" : "single"}
                style={{
                  ...bezel.outer,
                  transition: "max-height 220ms ease, opacity 220ms ease",
                  maxHeight: isParked || isHiddenByRuntime ? 0 : "none",
                  overflow: isParked || isHiddenByRuntime ? "hidden" : "visible",
                  opacity: isParked || isHiddenByRuntime ? 0 : 1,
                  pointerEvents: isParked || isHiddenByRuntime ? "none" : undefined,
                }}
              >
                {showSplitControls && !isHiddenByRuntime && (
                  <div data-living-os-mounted="1" style={{ marginBottom: 4 }}>
                    <LivingPlayerControlBed
                      destinationId={pane.id}
                      capabilities={livingCaps}
                      viewCount={(typeof splits[index as 0 | 1] === "number" ? splits[index as 0 | 1] : 1) as LivingViewCount}
                      onViewCountChange={(n) => setSplit(index as 0 | 1, n)}
                      onCommand={(cmd, tgt) => handleLivingCommand(cmd, pane.id, tgt)}
                      onOpenDesk={() => onOpenLivingOs?.({ playerId: pane.id, role: livingCaps.role })}
                      accent={accent}
                      monLabel={monLabel}
                      feedPicker={feedPickerEnabled ? (
                        <MonitorBezelFeedPicker
                          frameId={index === 0 ? "a" : "b"}
                          monitorLabel={monLabel}
                          accent={accent}
                        />
                      ) : undefined}
                      targetPanelIndex={targetPanels[index as 0 | 1]}
                      onSelectTargetPanel={(pIdx) => setTargetPanels(prev => index === 0 ? [pIdx, prev[1]] : [prev[0], pIdx])}
                      availableModes={effectiveModes as unknown as LivingViewCount[]}
                    />
                  </div>
                )}
                <div
                  data-monitor-frame="squares"
                  data-monitor-columns={preset.columns}
                  data-monitor-rows={preset.rows}
                  style={{
                    background: "transparent",
                    width: "100%",
                    minWidth: 0,
                  }}
                >
                  <div>
                    {index === 0 && monitorMode === "SINGLE" && split === 1 ? (
                      <VoltronSingleMonitorOverlay
                        primaryContent={pane.children}
                        secondaryContent={panes[1]?.children}
                        friends={friends}
                        composition={composition}
                        focusedParticipantId={focusedParticipantId}
                        onFocusParticipant={focusParticipant}
                        onReturnFromFocus={returnFromFocus}
                        accent={accent}
                      />
                    ) : (
                      <MonitorCellGrid
                        split={split}
                        cells={pane.cells}
                        animKey={animKeys[index as 0 | 1]}
                        monitorIndex={index}
                        targetIndex={targetPanels[index as 0 | 1]}
                        onSelectTarget={(pIdx) => handleSelectPanel(index as 0 | 1, pIdx)}
                        accent={accent}
                      >
                        {pane.children}
                      </MonitorCellGrid>
                    )}
                  </div>
                </div>
              </div>
              {underMonitorSlot && underMonitorIndex === index ? (
                <div
                  data-testid="hub-drawer-slot"
                  data-drawer-frame="shared"
                  data-drawer-placement={yieldSecondaryMonitor ? "monitor-2-slot" : "below-monitor-2"}
                  data-drawer-under={yieldSecondaryMonitor ? "monitor-2-slot" : "below-monitor-2"}
                  data-drawer-fullscreen={drawerFullscreen ? "1" : "0"}
                  style={drawerFullscreen ? {
                    position: "fixed",
                    left: 8,
                    right: 8,
                    top: 64,
                    bottom: 12,
                    zIndex: 60,
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                  } : {
                    width: "100%",
                    height: drawerFrameHeight,
                    minHeight: drawerFrameHeight,
                    maxHeight: drawerFrameHeight,
                    overflow: "hidden",
                    flexShrink: 0,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {underMonitorSlot}
                </div>
              ) : null}
              </div>
            );
          })}
        </div>
      ) : (
        /* Gold: unified single bezel for the whole Overseer unit */
        <div
          data-adaptive-bezel={(splits[0] > 1 || splits[1] > 1) ? "split" : "single"}
          style={{
            ...bezel.outer,
          }}
        >
          {seriesLabel ? <div style={bezel.label}>{seriesLabel}</div> : null}
          <div ref={stackWrapperRef} style={{ display: "flex", flexDirection: "column", gap: 8, ...heightBudgetStackStyle }}>
            {panes.map((pane, index) => {
              const split = splits[index as 0 | 1];
              const bezelMonitorId = canonicalMonitorFromBezelIndex(index === 0 ? 0 : 1);
              const monLabel = pane.label ?? `MONITOR ${index + 1}`;
              const isParked = (index === 0 ? frameAPark : frameBPark);
              const activeMon = (typeof document !== "undefined" ? document.documentElement.getAttribute("data-focused-monitor") : null) || "A";
              const targetFoldIndex = activeMon === "B" ? 0 : 1;
              const yieldedToDrawer = yieldSecondaryMonitor && index === targetFoldIndex;
              const isHiddenByRuntime = (runtimeLayoutSingle && index === 1) || yieldedToDrawer;
              const preset = resolveMonitorLayoutPreset(split, isPhone, viewport.isTablet);
              return (
                <div
                  key={pane.id}
                  data-canonical-monitor
                  data-canonical-monitor-id={bezelMonitorId}
                  style={{
                    width: "100%",
                    transition: "max-height 220ms ease, opacity 220ms ease",
                    maxHeight: isParked || isHiddenByRuntime ? 0 : "none",
                    overflow: isParked || isHiddenByRuntime ? "hidden" : "visible",
                    opacity: isParked || isHiddenByRuntime ? 0 : 1,
                    pointerEvents: isParked || isHiddenByRuntime ? "none" : undefined,
                  }}
                >
                  {showSplitControls && !isHiddenByRuntime && (
                    <div data-living-os-mounted="1" style={{ marginBottom: 4 }}>
                      <LivingPlayerControlBed
                        destinationId={pane.id}
                        capabilities={livingCaps}
                        viewCount={(typeof splits[index as 0 | 1] === "number" ? splits[index as 0 | 1] : 1) as LivingViewCount}
                        onViewCountChange={(n) => setSplit(index as 0 | 1, n)}
                        onCommand={(cmd, tgt) => handleLivingCommand(cmd, pane.id, tgt)}
                        onOpenDesk={() => onOpenLivingOs?.({ playerId: pane.id, role: livingCaps.role })}
                        accent={accent}
                        monLabel={monLabel}
                        feedPicker={feedPickerEnabled ? (
                          <MonitorBezelFeedPicker
                            frameId={index === 0 ? "a" : "b"}
                            monitorLabel={monLabel}
                            accent={accent}
                          />
                        ) : undefined}
                        targetPanelIndex={targetPanels[index as 0 | 1]}
                        onSelectTargetPanel={(pIdx) => setTargetPanels(prev => index === 0 ? [pIdx, prev[1]] : [prev[0], pIdx])}
                        availableModes={effectiveModes as unknown as LivingViewCount[]}
                      />
                    </div>
                  )}
                  <div
                    data-monitor-frame="squares"
                    data-monitor-columns={preset.columns}
                    data-monitor-rows={preset.rows}
                    style={{
                      background: "transparent",
                      width: "100%",
                      minWidth: 0,
                    }}
                  >
                    <div>
                      {index === 0 && monitorMode === "SINGLE" && split === 1 ? (
                        <VoltronSingleMonitorOverlay
                          primaryContent={pane.children}
                          secondaryContent={panes[1]?.children}
                          friends={friends}
                          composition={composition}
                          focusedParticipantId={focusedParticipantId}
                          onFocusParticipant={focusParticipant}
                          onReturnFromFocus={returnFromFocus}
                          accent={accent}
                        />
                      ) : (
                        <MonitorCellGrid
                          split={split}
                          cells={pane.cells}
                          animKey={animKeys[index as 0 | 1]}
                          monitorIndex={index}
                          targetIndex={targetPanels[index as 0 | 1]}
                          onSelectTarget={(pIdx) => setTargetPanels(prev => index === 0 ? [pIdx, prev[1]] : [prev[0], pIdx])}
                          accent={accent}
                        >
                          {pane.children}
                        </MonitorCellGrid>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
