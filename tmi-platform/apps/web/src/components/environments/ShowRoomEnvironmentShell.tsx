"use client";

import { useMemo } from "react";
import { runInteriorDesignerBotTeam } from "@/lib/bots/InteriorDesignerBotTeam";
import type { RoomId } from "@/lib/environments/RoomDesignEngine";
import type { LightingMode } from "@/lib/environments/LightingSceneEngine";
import { RoomLightingRig } from "./RoomLightingRig";
import { SponsorSlotWall } from "./SponsorSlotWall";
import { SeatingMapPreview } from "./SeatingMapPreview";
import { HostWalkPathOverlay } from "./HostWalkPathOverlay";

type ShowRoomEnvironmentShellProps = {
  roomId: RoomId;
  lightingMode?: LightingMode;
  occupancyPct?: number;
  showSeating?: boolean;
  showHosts?: boolean;
  showSponsors?: boolean;
  children?: React.ReactNode;
};

export function ShowRoomEnvironmentShell({
  roomId,
  lightingMode = "idle",
  occupancyPct = 0.5,
  showSeating = true,
  showHosts = true,
  showSponsors = true,
  children,
}: ShowRoomEnvironmentShellProps) {
  const pkg = useMemo(
    () => runInteriorDesignerBotTeam(roomId, lightingMode, occupancyPct),
    [roomId, lightingMode, occupancyPct],
  );

  const { theme, sponsorSlots, seating, hosts, clutterResult } = pkg;

  return (
    <div
      data-room-id={roomId}
      data-clutter-approved={clutterResult.approved}
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        background: theme.backgroundCss,
        overflow: "hidden",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Ambient neon glow layer */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 50% 0%, ${theme.palette.glow}18 0%, transparent 60%)`,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Lighting rig */}
      <RoomLightingRig scene={pkg.lighting} />

      {/* Sponsor slots */}
      {showSponsors && <SponsorSlotWall slots={sponsorSlots} />}

      {/* Seating map */}
      {showSeating && (
        <SeatingMapPreview
          layout={seating}
          accentColor={theme.palette.primary}
        />
      )}

      {/* Host walk paths */}
      {showHosts && (
        <HostWalkPathOverlay
          hosts={hosts}
          accentColor={theme.palette.secondary}
        />
      )}

      {/* Room content */}
      <div style={{ position: "relative", zIndex: 10 }}>
        {children}
      </div>

      {/* Debug: clutter violations in dev */}
      {process.env.NODE_ENV === "development" && !clutterResult.approved && (
        <div
          style={{
            position: "fixed",
            bottom: 8,
            right: 8,
            background: "rgba(255,40,40,0.9)",
            color: "#fff",
            fontSize: 11,
            padding: "6px 10px",
            borderRadius: 6,
            zIndex: 9999,
            maxWidth: 260,
          }}
        >
          ⚠ ClutterGuard: {clutterResult.violations.filter((v) => v.severity === "error").length} error(s)
        </div>
      )}
    </div>
  );
}
