"use client";

/**
 * Live room auxiliary monitors — screen share routes to a free cell on the
 * dual stack below the primary UniversalVenueRenderer stage (stage stays above).
 * Fan + performer: getDisplayMedia → pick slot → discuss while viewing.
 */

import { useMemo, type ReactNode } from "react";
import { AnimatePresence } from "framer-motion";
import CanonicalDualMonitorStack from "@/components/monitors/CanonicalDualMonitorStack";
import CanonicalMonitorAssignmentOverlay from "@/components/personal-media/CanonicalMonitorAssignmentOverlay";
import InPlaceGoLiveMonitorLayer from "@/components/live/InPlaceGoLiveMonitorLayer";
import { DEFAULT_MONITOR_A, DEFAULT_MONITOR_B } from "@/lib/personal-media";
import { isLoungeRoomId, resolveLoungeMonitorViewport } from "@/lib/live/canonicalWorldViewport";
import {
  MonitorScreenShareVideo,
  MonitorShareSlotPicker,
  ScreenShareErrorBanner,
} from "@/components/monitors/MonitorScreenSharePrimitives";
import { useMonitorScreenShare } from "@/hooks/useMonitorScreenShare";
import { shareSlotTargetsCell } from "@/lib/monitors/monitorScreenShareTypes";
import { resolveMediaSurfaceLayout } from "@/lib/monitors/MediaSurfaceLayoutDirector";
import useViewportMode from "@/hooks/useViewportMode";

const STANDBY_URL =
  process.env.NEXT_PUBLIC_DEFAULT_MONITOR_VIDEO?.trim() ||
  process.env.NEXT_PUBLIC_OBSERVATORY_ROSE_VIDEO_URL?.trim() ||
  "";

function AuxMonitorStandby({ label, sublabel }: { label: string; sublabel?: string }) {
  return (
    <div style={{ position: "absolute", inset: 0, background: "#030318" }}>
      {STANDBY_URL ? (
        <video
          src={STANDBY_URL}
          autoPlay
          loop
          muted
          playsInline
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.45 }}
        />
      ) : null}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          background: "linear-gradient(180deg, rgba(0,0,0,0.55), rgba(0,0,0,0.75))",
        }}
      >
        <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.16em", color: "#00FFFF" }}>{label}</span>
        {sublabel ? (
          <span style={{ fontSize: 8, color: "rgba(255,255,255,0.45)", textAlign: "center", maxWidth: "90%", lineHeight: 1.4 }}>
            {sublabel}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function buildCells(prefix: string, sublabel: string): ReactNode[] {
  return Array.from({ length: 8 }, (_, ci) => (
    <AuxMonitorStandby key={`${prefix}-${ci}`} label={`${prefix} · CELL ${ci + 1}`} sublabel={sublabel} />
  ));
}

export interface LiveRoomMonitorShareStackProps {
  roomId: string;
  roleLabel?: "FAN" | "PERFORMER" | "VIEWER";
}

export default function LiveRoomMonitorShareStack({ roomId, roleLabel = "VIEWER" }: LiveRoomMonitorShareStackProps) {
  const {
    screenStream,
    shareActive,
    shareButtonLabel,
    shareSlot,
    slotPickerOpen,
    setSlotPickerOpen,
    cycleSharePress,
    addShareSource,
    stopScreenShare,
    pickShareSlot,
    error: shareError,
    clearError: clearShareError,
    availableShareSources,
    shareSourceIndex,
  } = useMonitorScreenShare({
    defaultSlot: { monitor: 0, cellIndex: -1 },
    openPickerOnStart: false,
  });

  const { isPhone, isTablet } = useViewportMode();
  const deviceTier = isPhone ? "phone" : isTablet ? "tablet" : "desktop";
  const surfaceLayout = resolveMediaSurfaceLayout({
    screenShareActive: shareActive,
    shareSourceIndex,
    availableShareSources: availableShareSources.map((s) => ({
      id: s.id,
      label: s.label,
      alive: s.alive,
    })),
    participantCount: shareActive ? 2 : 0,
    activeSpeakerId: null,
    audiencePanelEnabled: true,
    fullscreenState: "none",
    deviceTier,
    roleContext: roleLabel === "PERFORMER" ? "performer" : roleLabel === "FAN" ? "fan" : "viewer",
  });

  const lounge = isLoungeRoomId(roomId);
  const loungeA = resolveLoungeMonitorViewport("A");
  const loungeB = resolveLoungeMonitorViewport("B");

  const stageHint = lounge
    ? "Fullscreen expands this same viewport — no second lounge renderer. CAM/MIC are explicit."
    : "Main stage stays in the venue view above — route screen share to any open cell here.";

  const renderShareOrStandby = (
    monitor: 0 | 1,
    cellIndex: number,
    label: string,
    standby: ReactNode,
  ): ReactNode => {
    // Director law: when sharing, top full frame is the active display stream
    if (
      surfaceLayout.topSurface === "screen_share" &&
      screenStream &&
      monitor === 0 &&
      cellIndex === -1
    ) {
      return (
        <MonitorScreenShareVideo
          stream={screenStream}
          onStop={stopScreenShare}
          label={shareButtonLabel}
          transitionKey={surfaceLayout.activeShareSourceId ?? "share"}
        />
      );
    }
    if (screenStream && shareSlotTargetsCell(shareSlot, monitor, cellIndex)) {
      return (
        <MonitorScreenShareVideo stream={screenStream} onStop={stopScreenShare} label={label} />
      );
    }
    return standby;
  };

  const topStandbyFull = (
    <AuxMonitorStandby
      label={lounge ? loungeA.label : "MONITOR A · AUX"}
      sublabel={
        lounge
          ? "Conversation / selected participant / self cam after CAM ON — never auto camera."
          : "Lobby wall, playlist, or co-view — main stage is above."
      }
    />
  );
  const bottomStandbyFull = (
    <AuxMonitorStandby
      label={lounge ? loungeB.label : "MONITOR B · AUX"}
      sublabel={
        lounge
          ? "Lounge group / room view — video hangout, no avatar seating."
          : "Default target for shared screen + side chat."
      }
    />
  );

  const topCells = useMemo(
    () => buildCells("AUX A", "Free cell — split this monitor to co-view while chatting."),
    [],
  );
  const bottomCells = useMemo(
    () => buildCells("AUX B", "Free cell — pick any slot for your screen share."),
    [],
  );

  const toolbar = (
    <div
      style={{
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 10px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(0,0,0,0.35)",
        marginBottom: 8,
        borderRadius: 8,
        flexWrap: "wrap",
      }}
    >
      <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.12em", color: "rgba(255,255,255,0.45)" }}>
        ROOM {roomId.toUpperCase()} · {roleLabel} · AUX MONITORS
      </span>
      <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.12)" }} />
      <div style={{ position: "relative" }}>
        <button
          type="button"
          data-testid="tmi-live-share-screen-cycle"
          onClick={() => void cycleSharePress()}
          onContextMenu={(e) => {
            e.preventDefault();
            void addShareSource();
          }}
          title={
            shareActive
              ? "Cycle share sources — press after last source to stop"
              : "Share screen / window / tab via getDisplayMedia"
          }
          style={{
            fontSize: 8,
            fontWeight: 900,
            letterSpacing: "0.08em",
            padding: "4px 10px",
            borderRadius: 6,
            cursor: "pointer",
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            gap: 4,
            border: shareActive ? "1px solid #00FF88" : "1px solid rgba(0,255,136,0.45)",
            background: shareActive ? "rgba(0,255,136,0.15)" : "transparent",
            color: "#00FF88",
          }}
        >
          <span>⬡</span>
          <span>{shareButtonLabel}</span>
        </button>
        {shareActive ? (
          <button
            type="button"
            onClick={stopScreenShare}
            title="Stop screen share"
            style={{
              marginLeft: 6,
              fontSize: 8,
              fontWeight: 900,
              padding: "4px 8px",
              borderRadius: 6,
              cursor: "pointer",
              border: "1px solid rgba(255,68,68,0.5)",
              background: "rgba(255,68,68,0.12)",
              color: "#FF6B6B",
              fontFamily: "inherit",
            }}
          >
            OFF
          </button>
        ) : null}
        {shareError ? (
          <div style={{ marginTop: 6 }}>
            <ScreenShareErrorBanner
              code={shareError}
              onDismiss={clearShareError}
              onRetry={() => void cycleSharePress()}
            />
          </div>
        ) : null}
        <AnimatePresence>
          {slotPickerOpen && screenStream ? (
            <MonitorShareSlotPicker
              activeSlot={shareSlot}
              onPick={pickShareSlot}
              onClose={() => setSlotPickerOpen(false)}
              hint={stageHint}
            />
          ) : null}
        </AnimatePresence>
      </div>
      <span style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", fontWeight: 600, flex: 1, minWidth: 120 }}>
        {stageHint}
      </span>
    </div>
  );

  return (
    <div
      style={{
        marginTop: 16,
        borderRadius: 12,
        border: "1px solid rgba(0,255,255,0.15)",
        background: "rgba(0,0,0,0.25)",
        padding: 8,
      }}
    >
      <CanonicalDualMonitorStack
        variant="chrome"
        seriesLabel={
          lounge
            ? `LOUNGE · ${roleLabel} · A CONVERSATION · B GROUP VIEW · NO AVATARS`
            : `LIVE ROOM · ${roleLabel} · DUAL AUX MONITORS · SCREEN SHARE`
        }
        toolbar={toolbar}
        monitors={[
          {
            id: "live-mon-a",
            label: lounge ? loungeA.shortLabel : "MONITOR A",
            children: (
              <InPlaceGoLiveMonitorLayer target={DEFAULT_MONITOR_A} showTransition={false}>
                <CanonicalMonitorAssignmentOverlay target={DEFAULT_MONITOR_A}>
                  {renderShareOrStandby(0, -1, "MON A", topStandbyFull)}
                </CanonicalMonitorAssignmentOverlay>
              </InPlaceGoLiveMonitorLayer>
            ),
            cells: topCells.map((standby, ci) =>
              renderShareOrStandby(0, ci, `A${ci + 1}`, standby),
            ),
          },
          {
            id: "live-mon-b",
            label: lounge ? loungeB.shortLabel : "MONITOR B",
            children: (
              <InPlaceGoLiveMonitorLayer target={DEFAULT_MONITOR_B}>
                <CanonicalMonitorAssignmentOverlay target={DEFAULT_MONITOR_B}>
                  {renderShareOrStandby(1, -1, "MON B", bottomStandbyFull)}
                </CanonicalMonitorAssignmentOverlay>
              </InPlaceGoLiveMonitorLayer>
            ),
            cells: bottomCells.map((standby, ci) =>
              renderShareOrStandby(1, ci, `B${ci + 1}`, standby),
            ),
          },
        ]}
      />
    </div>
  );
}
