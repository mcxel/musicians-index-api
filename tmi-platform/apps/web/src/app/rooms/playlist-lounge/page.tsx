"use client";

/**
 * Playlist Lounge alias — joins the canonical live-room mill as a connected
 * LOUNGE_SIDE_ROOM. Does not mount FanLobbyVenue avatars (no second world mill).
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CANONICAL_WORLD_ZONE,
  loungeSideRoomEntryHref,
  SYSTEM_OPERATED_PLAYLIST_LOUNGE_ROOM_ID,
} from "@/lib/live/canonicalWorldViewport";

const PLAYLIST_LOUNGE_HREF = loungeSideRoomEntryHref(
  SYSTEM_OPERATED_PLAYLIST_LOUNGE_ROOM_ID,
  { from: "fan-avatar-lobby" },
);

export default function PlaylistLoungePage() {
  const router = useRouter();
  useEffect(() => {
    router.replace(PLAYLIST_LOUNGE_HREF);
  }, [router]);

  return (
    <main
      data-testid="room-playlist-lounge"
      data-canonical-zone={CANONICAL_WORLD_ZONE.LOUNGE_SIDE_ROOM}
      data-lounge-avatars="false"
      style={{
        minHeight: "100vh",
        background: "#050510",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        letterSpacing: "0.12em",
      }}
    >
      Joining playlist lounge side room…
    </main>
  );
}
