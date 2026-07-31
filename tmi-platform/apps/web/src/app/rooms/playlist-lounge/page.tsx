"use client";

/**
 * Playlist Lounge — same FanLobbyVenue / SocialRoomPresence seating runtime
 * with roomType PLAYLIST_LOUNGE. No second seating engine.
 * Skin switcher host-gated via RoomAuthority (HUMAN_HOSTED provisional host stub).
 */

import Link from "next/link";
import dynamic from "next/dynamic";
import RoleGate from "@/components/auth/RoleGate";
import type { RoomAuthority } from "@/lib/lobby/FanLobbyPresence";

const FanLobbyVenue = dynamic(() => import("@/components/live/FanLobbyVenue"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "rgba(255,255,255,0.35)",
        fontSize: 11,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
      }}
    >
      Loading Playlist Lounge…
    </div>
  ),
});

/** Provisional HUMAN_HOSTED — hostUserId null until authority sync; local actor may control skin. */
const PLAYLIST_LOUNGE_AUTHORITY: RoomAuthority = {
  mode: "HUMAN_HOSTED",
  hostUserId: null,
  hostMinTier: "GOLD",
  lockedSkinId: null,
  lockedPlaylistId: null,
};

export default function PlaylistLoungePage() {
  return (
    <main
      data-testid="room-playlist-lounge"
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at 50% 0%, rgba(170,45,255,0.12), transparent 55%), #050510",
        color: "#fff",
      }}
    >
      <div
        style={{
          background: "rgba(0,0,0,0.9)",
          borderBottom: "1px solid rgba(170,45,255,0.35)",
          padding: "10px 24px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <Link
          href="/live/lobby"
          style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textDecoration: "none", letterSpacing: "0.1em" }}
        >
          ← LIVE LOBBY
        </Link>
        <div style={{ fontSize: 9, letterSpacing: "0.3em", fontWeight: 800, color: "#AA2DFF" }}>
          PLAYLIST LOUNGE
        </div>
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>
          SocialRoomPresence · same seats as Fan Lobby · AvatarHeadMediaSurface
        </span>
      </div>

      <RoleGate
        allow={["FAN", "ADMIN", "STAFF"]}
        fallback={
          <div style={{ padding: 48, textAlign: "center", color: "rgba(255,255,255,0.45)", fontSize: 13 }}>
            Playlist Lounge avatar hangout is Fan-only (Rule 26). Sign in as a Fan to enter.
            <div style={{ marginTop: 16 }}>
              <Link href="/rooms/fan-lobby" style={{ color: "#00FFFF", fontWeight: 800 }}>
                Fan Lobby →
              </Link>
            </div>
          </div>
        }
      >
        <div style={{ height: "calc(100vh - 44px)" }}>
          <FanLobbyVenue
            roomId="playlist-lounge"
            userName="Fan"
            roomType="PLAYLIST_LOUNGE"
            authority={PLAYLIST_LOUNGE_AUTHORITY}
            initialSkinId="lobby-chill"
          />
        </div>
      </RoleGate>
    </main>
  );
}
