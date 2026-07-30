"use client";

/**
 * Phase 1 — Fan Dashboard Avatar Lobby drawer.
 * Mounts the real free-roam FanLobbyVenue under the hub UI (bottom sheet).
 * No fake 3D bobblehead engine. No fan-facing seat grid.
 * Rule 26: Fan-only surface (caller should gate; RoleGate wraps content).
 */

import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useDrawer } from "@/components/room/DrawerContext";
import RoleGate from "@/components/auth/RoleGate";
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
}

export default function FanAvatarLobbyDrawer({
  userName = "Fan",
  roomId = "fan-lobby-dash",
}: FanAvatarLobbyDrawerProps) {
  const { activeDrawer, setActiveDrawer } = useDrawer();
  const open = activeDrawer === "avatar-lobby";

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="fan-avatar-lobby-drawer"
          initial={{ y: "100%", opacity: 0.6 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 32 }}
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 120,
            height: "min(78vh, 720px)",
            background: "#050510",
            borderTop: "1px solid rgba(255,215,0,0.35)",
            boxShadow: "0 -24px 60px rgba(0,0,0,0.75)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
          role="dialog"
          aria-label="Avatar Lobby"
        >
          <div
            style={{
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 16px",
              background: "rgba(0,0,0,0.72)",
              borderBottom: "1px solid rgba(255,215,0,0.2)",
            }}
          >
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.18em", color: "#FFD700" }}>
              AVATAR LOBBY · CINEMA SKIN
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", flex: 1 }}>
              Free-roam hangout · tap floor to walk · local cam when enabled
            </div>
            <button
              type="button"
              onClick={() => setActiveDrawer(null)}
              style={{
                background: "transparent",
                border: "1px solid rgba(255,68,68,0.45)",
                color: "#FF6666",
                borderRadius: 8,
                padding: "6px 12px",
                fontSize: 11,
                fontWeight: 800,
                cursor: "pointer",
                letterSpacing: "0.08em",
              }}
            >
              CLOSE
            </button>
          </div>

          <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
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
                  Avatar Lobby is Fan-only (Rule 26). Sign in as a Fan to enter.
                </div>
              }
            >
              <FanLobbyVenue
                roomId={roomId}
                userName={userName}
                initialSkinId={DEFAULT_FAN_LOBBY_SKIN_ID}
                embedded
              />
            </RoleGate>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
