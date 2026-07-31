"use client";

/**
 * Fan Dashboard Avatar Lobby drawer (dde74945).
 * Prefer FanHQShell left-rail → FanHQContentSlot for Command Center UX.
 * This fixed bottom sheet remains for /fan/dashboard RoomContainer path.
 * Uses UniversalDrawerBase + orbit animation (lobby personality).
 * No fake 3D. No seat grid. Rule 26 via RoleGate. Peer Daily WebRTC deferred.
 */

import dynamic from "next/dynamic";
import { useDrawer } from "@/components/room/DrawerContext";
import RoleGate from "@/components/auth/RoleGate";
import UniversalDrawerBase from "@/components/drawers/UniversalDrawerBase";
import { animationForDrawerModule } from "@/lib/drawers/UniversalDrawerRegistry";
import { DEFAULT_FAN_LOBBY_SKIN_ID } from "@/lib/lobby/FanLobbySkinRegistry";

const FanLobbyVenue = dynamic(() => import("@/components/live/FanLobbyVenue"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        minHeight: 320,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "rgba(255,255,255,0.35)",
        fontSize: 11,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
      }}
    >
      Loading Avatar Lobby…
    </div>
  ),
});

interface FanAvatarLobbyDrawerProps {
  userName?: string;
  roomId?: string;
  /** Controlled open — when set, bypasses DrawerContext */
  open?: boolean;
  onClose?: () => void;
}

export default function FanAvatarLobbyDrawer({
  userName = "Fan",
  roomId = "fan-lobby-dash",
  open: openProp,
  onClose,
}: FanAvatarLobbyDrawerProps) {
  const { activeDrawer, setActiveDrawer } = useDrawer();
  const open = openProp ?? activeDrawer === "avatar-lobby";

  const close = () => {
    if (onClose) onClose();
    else setActiveDrawer(null);
  };

  return (
    <UniversalDrawerBase
      open={open}
      animationId={animationForDrawerModule("lobby")}
      title="AVATAR FAN LOBBY · CINEMA SKIN"
      subtitle="Free-roam hangout · tap floor to walk · local cam when enabled"
      onClose={close}
      mode="overlay"
      accentColor="#FFD700"
      ariaLabel="Avatar Fan Lobby"
      contentKey="fan-avatar-lobby"
    >
      <div style={{ height: "100%", minHeight: 320, position: "relative" }}>
        <RoleGate
          allow={["FAN", "ADMIN", "STAFF"]}
          fallback={
            <div
              style={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(255,255,255,0.45)",
                fontSize: 12,
                padding: 24,
                textAlign: "center",
              }}
            >
              Avatar Fan Lobby is Fan-only (Rule 26). Sign in as a Fan to enter.
            </div>
          }
        >
          <FanLobbyVenue
            roomId={roomId}
            userName={userName}
            initialSkinId={DEFAULT_FAN_LOBBY_SKIN_ID}
            roomType="FAN_LOBBY"
            embedded
          />
        </RoleGate>
      </div>
    </UniversalDrawerBase>
  );
}
