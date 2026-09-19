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
 * Canonical dual-monitor geometry from Profiles/tmi_platform_prototype_complete.html
 *
 * Locked: TWO identical 16:9 monitors stacked VERTICALLY inside one bezel.
 * Same width, same height, true aspect-ratio — never side-by-side, never flex 50/50 of parent height.
 *
 * Per-monitor split controls (prototype splitCtrl): □=1  ⬓=2  ⊞=4  ⊟⊟=8
 * Each physical monitor independently switches between 1/2/4/8 sub-panes.
 * 2 monitors × 8 panes max = 16 total mini-monitors.
 *
 * Shared by Observatory (gold) + Fan/Performer Command Center (chrome).
 */

import { useEffect, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import {
  useCanonicalMediaPlayerRuntime,
  type FrameId,
  type LayoutMode as RuntimeLayoutMode,
} from "@/lib/media/canonicalMediaPlayerRuntime";
import { useAdaptiveVoltronStore } from "@/lib/monitors/AdaptiveVoltronPresentationDirector";
import MonitorBezelFeedPicker from "@/components/monitors/MonitorBezelFeedPicker";

// Ambient standby loop for panes/cells with no assigned source — same
// convention as MediaMatrixEngine/LiveFeedRouter/CommandCenterMediaStack,
// so an empty monitor reads as "on-air standby," not a dead panel.
const ROSE_FALLBACK_URL =
  process.env.NEXT_PUBLIC_DEFAULT_MONITOR_VIDEO?.trim() ||
  process.env.NEXT_PUBLIC_OBSERVATORY_ROSE_VIDEO_URL?.trim() ||
  "";

function StandbyFill() {
  if (!ROSE_FALLBACK_URL) {
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 5,
          background: "#030318",
        }}
      >
        <span style={{ fontSize: 16, opacity: 0.2 }}>📡</span>
        <span style={{ fontSize: 7, fontWeight: 800, letterSpacing: "0.14em", color: "rgba(255,255,255,0.2)" }}>
          NO MEDIA
        </span>
      </div>
    );
  }
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <video
        src={ROSE_FALLBACK_URL}
        autoPlay
        loop
        muted
        playsInline
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.15), transparent 35%, rgba(0,0,0,0.5) 100%)" }} />
      <div
        style={{
          position: "absolute",
          top: 6,
          left: 6,
          display: "flex",
          alignItems: "center",
          gap: 5,
          padding: "2px 6px",
          borderRadius: 999,
          background: "rgba(0,0,0,0.62)",
          border: "1px solid rgba(255,215,0,0.35)",
        }}
      >
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#FFD700", boxShadow: "0 0 6px #FFD700" }} />
        <span style={{ color: "#fff", fontSize: 7, fontWeight: 900, letterSpacing: "0.1em" }}>STANDBY</span>
      </div>
    </div>
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
}

// ─── Split control bar ────────────────────────────────────────────────────────

function MonitorSplitBar({
  label,
  split,
  onSplitChange,
  accent,
  availableModes,
  feedFrameId,
  showFeedPicker,
}: {
  label: string;
  split: MonitorSplitMode;
  onSplitChange: (s: MonitorSplitMode) => void;
  accent: string;
  availableModes?: MonitorSplitMode[];
  feedFrameId?: FrameId;
  showFeedPicker?: boolean;
}) {
  const MODES: MonitorSplitMode[] = availableModes ?? [1, 2, 3, 4, 5, 6, 7, 8];
  return (
    <div
      data-monitor-bezel-controls="1"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        marginBottom: 6,
        padding: "4px 2px",
        flexWrap: "wrap",
      }}
    >
      <span
        style={{
          fontSize: 9,
          color: "#C8C8E0",
          fontWeight: 800,
          letterSpacing: "0.5px",
          flex: 1,
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
      {showFeedPicker && feedFrameId ? (
        <MonitorBezelFeedPicker frameId={feedFrameId} monitorLabel={label} accent={accent} />
      ) : null}
      <div
        data-monitor-channel-selector="1"
        style={{ display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap" }}
        title="Monitor channel / split — 1–8"
      >
        {MODES.map((n) => (
          <button
            key={n}
            type="button"
            data-channel={n}
            aria-pressed={split === n}
            onClick={() => onSplitChange(n)}
            title={`${n === 1 ? "Single" : n === 2 ? "2-pane" : n === 3 ? "3-pane" : n === 4 ? "Quad 2×2" : n === 8 ? "Octo 4×2" : "Grid 4×4"}`}
            style={{
              padding: "5px 9px",
              fontSize: 11,
              fontWeight: 900,
              border: `1px solid ${split === n ? accent : "rgba(255,255,255,0.22)"}`,
              borderRadius: 5,
              background:
                split === n
                  ? `linear-gradient(180deg, ${accent}ee 0%, ${accent}88 100%)`
                  : "linear-gradient(180deg, #4a5568 0%, #1a1f2c 55%, #0e1218 100%)",
              color: split === n ? "#fff" : "#A8B0C8",
              cursor: "pointer",
              fontFamily: "inherit",
              lineHeight: 1,
              transition: "background 0.15s, border-color 0.15s, color 0.15s",
              minWidth: 28,
              boxShadow:
                split === n
                  ? `0 0 12px ${accent}66, inset 0 1px 0 rgba(255,255,255,0.35)`
                  : "inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -1px 0 rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.4)",
            }}
          >
            {SPLIT_LABELS[n]}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Monitor cell grid ────────────────────────────────────────────────────────

import useViewportMode from "@/hooks/useViewportMode";
import { resolveMonitorLayoutPreset } from "@/lib/monitors/MonitorLayoutDirector";

function MonitorCellGrid({
  split,
  children,
  cells,
  animKey,
}: {
  split: MonitorSplitMode;
  children: ReactNode;
  cells?: ReactNode[];
  animKey?: number;
}) {
  const { isPhone, isTablet } = useViewportMode();
  if (split === 1) return <>{children}</>;

  const preset = resolveMonitorLayoutPreset(split, isPhone, isTablet);
  const filled: ReactNode[] = [];
  for (let i = 0; i < split; i++) {
    filled.push(cells?.[i] ?? <StandbyFill key={`empty-${i}`} />);
  }

  return (
    <div
      key={animKey}
      style={{
        position: "absolute",
        inset: 0,
        display: "grid",
        gridTemplateColumns: preset.gridTemplateColumns,
        gridTemplateRows: preset.gridTemplateRows,
        gap: preset.gap,
        background: "#0a0a1a",
        animation: "monitor-cell-in 0.38s cubic-bezier(0.22,1,0.36,1)",
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {filled.map((cell, i) => (
        <div
          key={i}
          style={{
            position: "relative",
            overflow: "hidden",
            background: "#030318",
            border: "1px solid #1A1A3A",
            animation: `monitor-cell-pop 0.32s cubic-bezier(0.22,1,0.36,1) ${i * 28}ms both`,
          }}
        >
          {cell}
        </div>
      ))}
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
      padding: 10,
      borderRadius: 10,
      borderTop: "3px solid #FFD700",
      borderLeft: "2px solid #DAA520",
      borderRight: "2px solid #8B6914",
      borderBottom: "3px solid #6B5000",
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
      padding: 10,
      borderRadius: 10,
      borderTop: "3px solid #D0D0D0",
      borderLeft: "2px solid #A0A0A0",
      borderRight: "2px solid #505050",
      borderBottom: "3px solid #3A3A3A",
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

/** Single 16:9 glass — width 100%, aspect-ratio locks height. */
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
        data-monitor-frame="16x9"
        style={{
          background: "#020210",
          border: "1px solid #1A1A3A",
          borderRadius: 4,
          overflow: "hidden",
          position: "relative",
          aspectRatio: "16 / 9",
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
}: CanonicalDualMonitorStackProps) {
  const livingCaps = resolveLivingPlayerCapabilities(livingOsRole);
  const [stationIndex, setStationIndex] = useState(0);
  const [activeStation, setActiveStation] = useState<LivingPlayerStationFamily | undefined>(
    livingCaps.stations[0],
  );
  const [roomIndex, setRoomIndex] = useState(0);
  const [livingStatus, setLivingStatus] = useState<string>("");

  const handleLivingCommand = (command: LivingPlayerCommand, destinationId: string) => {
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
      const frameId = destinationId.includes("b") || destinationId.endsWith("-1") ? "b" : "a";
      const current = frames[frameId as "a" | "b"]?.source ?? "SELF_CAMERA";
      const result = resolveSourceCommand(current, frameId as "a" | "b");
      if (enableMediaRuntime) assignSource(frameId as "a" | "b", result.nextSource);
      setLivingStatus(result.detail);
      return;
    }
    if (command === "MIX") {
      const view = (typeof splits[0] === "number" ? splits[0] : 1) as import("@/lib/monitors/livingPlayerControlContract").LivingViewCount;
      const result = resolveMixCommand(view);
      if (enableMediaRuntime && result.layout) setLayout(result.layout);
      setLivingStatus(result.detail);
      return;
    }
    if (command === "FULL") {
      if (enableMediaRuntime) setFullscreen("a");
      setLivingStatus("FULL → frame a");
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

  // ── Canonical media player runtime (opt-in) ──────────────────────────────
  const { assignSource, swapFrames, setLayout, setFullscreen, reset, frames, layout, fullscreenFrame } =
    useCanonicalMediaPlayerRuntime();

  useEffect(() => {
    if (!enableMediaRuntime) return;
    assignSource("a", "SELF_CAMERA");
    assignSource("b", "AUDIENCE_VIEW");
    return () => {
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
  };

  const panes = monitors.slice(0, 2);
  while (panes.length < minMonitorCount) {
    panes.push({
      id: `empty-mon-${panes.length}`,
      label: `MONITOR ${panes.length + 1}`,
      children: <StandbyFill />,
    });
  }

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
            onClick={() => setMonitorMode("SINGLE")}
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
            onClick={() => setMonitorMode("DUAL")}
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

      {toolbar}
      {livingStatus ? (
        <div data-living-os-binding-status="1" style={{ marginBottom: 6, fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", color: "rgba(0,255,255,0.75)", fontFamily: "inherit" }}>
          LIVING OS · {livingStatus}
        </div>
      ) : null}
      {variant === "chrome" ? (
        /* Chrome: each monitor lives in its own bezel so the two 8-cell groups look physically separate */
        <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
          {seriesLabel ? (
            <div style={{ ...bezel.label, textAlign: "left", padding: "0 2px 4px" }}>{seriesLabel}</div>
          ) : null}
          {panes.map((pane, index) => {
            const split = splits[index as 0 | 1];
            const monLabel = pane.label ?? `MONITOR ${index + 1}`;
            // Park state from canonical runtime (CSS-only, DOM stays mounted)
            const isParked = (index === 0 ? frameAPark : frameBPark);
            const isHiddenByRuntime = runtimeLayoutSingle && index === 1;
            return (
              <div
                key={pane.id}
                onClick={() => { if (typeof document !== "undefined") document.documentElement.setAttribute("data-focused-monitor", index === 0 ? "A" : "B"); }}
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
                <>
                <div data-living-os-mounted="1" style={{ marginBottom: 4 }}>
                  <LivingPlayerControlBed
                    destinationId={pane.id}
                    capabilities={livingCaps}
                    viewCount={(typeof splits[index as 0 | 1] === "number" ? splits[index as 0 | 1] : 1) as LivingViewCount}
                    onViewCountChange={(n) => setSplit(index as 0 | 1, n)}
                    onCommand={(cmd) => handleLivingCommand(cmd, pane.id)}
                    onOpenDesk={() => onOpenLivingOs?.({ playerId: pane.id, role: livingCaps.role })}
                    accent={accent}
                  />
                </div>
                <MonitorSplitBar
                    label={monLabel}
                    split={split}
                    onSplitChange={(s) => setSplit(index as 0 | 1, s)}
                    accent={accent}
                    availableModes={effectiveModes}
                    feedFrameId={index === 0 ? "a" : "b"}
                    showFeedPicker={feedPickerEnabled}
                  />
                </>
                )}
                <div
                  data-monitor-frame="16x9"
                  style={{
                    background: "#020210",
                    border: "1px solid #1A1A3A",
                    borderRadius: 4,
                    overflow: "hidden",
                    position: "relative",
                    aspectRatio: "16 / 9",
                    width: "100%",
                    flex: "0 0 auto",
                    minHeight: 0,
                  }}
                >
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}>
                    {index === 0 && monitorMode === "SINGLE" ? (
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
                      <MonitorCellGrid split={split} cells={pane.cells} animKey={animKeys[index as 0 | 1]}>
                        {pane.children}
                      </MonitorCellGrid>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Gold: unified single bezel for the whole Overseer unit */
        <div style={bezel.outer}>
          {seriesLabel ? <div style={bezel.label}>{seriesLabel}</div> : null}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
            {panes.map((pane, index) => {
              const split = splits[index as 0 | 1];
              const monLabel = pane.label ?? `MONITOR ${index + 1}`;
              const isParked = (index === 0 ? frameAPark : frameBPark);
              const isHiddenByRuntime = runtimeLayoutSingle && index === 1;
              return (
                <div
                  key={pane.id}
                  data-canonical-monitor
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
                <>
                <div data-living-os-mounted="1" style={{ marginBottom: 4 }}>
                  <LivingPlayerControlBed
                    destinationId={pane.id}
                    capabilities={livingCaps}
                    viewCount={(typeof splits[index as 0 | 1] === "number" ? splits[index as 0 | 1] : 1) as LivingViewCount}
                    onViewCountChange={(n) => setSplit(index as 0 | 1, n)}
                    onCommand={(cmd) => handleLivingCommand(cmd, pane.id)}
                    onOpenDesk={() => onOpenLivingOs?.({ playerId: pane.id, role: livingCaps.role })}
                    accent={accent}
                  />
                </div>
                <MonitorSplitBar
                      label={monLabel}
                      split={split}
                      onSplitChange={(s) => setSplit(index as 0 | 1, s)}
                      accent={accent}
                      availableModes={effectiveModes}
                      feedFrameId={index === 0 ? "a" : "b"}
                      showFeedPicker={feedPickerEnabled}
                    />
                </>
                  )}
                  <div
                    data-monitor-frame="16x9"
                    style={{
                      background: "#020210",
                      border: "1px solid #1A1A3A",
                      borderRadius: 4,
                      overflow: "hidden",
                      position: "relative",
                      aspectRatio: "16 / 9",
                      width: "100%",
                      flex: "0 0 auto",
                      minHeight: 0,
                    }}
                  >
                    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}>
                      {index === 0 && monitorMode === "SINGLE" ? (
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
                        <MonitorCellGrid split={split} cells={pane.cells} animKey={animKeys[index as 0 | 1]}>
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
