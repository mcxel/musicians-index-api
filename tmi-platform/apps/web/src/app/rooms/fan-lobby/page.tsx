"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import StageLoader from "@/components/eos/StageLoader";
import {
  CANONICAL_WORLD_ZONE,
  resolveFanWorldEntry,
} from "@/lib/live/canonicalWorldViewport";

export default function FanLobbyRoomPage() {
  const params = useSearchParams();
  const entry = resolveFanWorldEntry({
    joinRoomId: params?.get("roomId") ?? null,
    from: params?.get("from") ?? "fan-lobby-route",
  });

  return (
    <main
      data-testid="room-fan-lobby"
      data-canonical-zone={CANONICAL_WORLD_ZONE.FAN_AVATAR_LOBBY}
      data-canonical-room-id={entry.roomId}
      data-live-session={entry.liveSessionPresent ? "true" : "false"}
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at 50% 0%, rgba(0,255,255,0.10), transparent 55%), #050510",
        color: "#fff",
        paddingBottom: 24,
      }}
    >
      <div style={{
        background: "rgba(0,0,0,0.9)",
        borderBottom: "1px solid rgba(0,255,255,0.2)",
        padding: "10px 24px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
      }}>
        <Link href="/explore" style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textDecoration: "none", letterSpacing: "0.1em" }}>
          ← EXPLORE
        </Link>
        <div style={{ fontSize: 9, letterSpacing: "0.3em", fontWeight: 800, color: "#00FFFF" }}>
          FAN AVATAR LOBBY · ENTRY LAYER
        </div>
        <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em" }}>
          {entry.liveSessionPresent
            ? `SAME WORLD · ${entry.roomId}`
            : "24/7 SYSTEM LOBBY · no live session"}
        </div>
      </div>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "16px 16px 0" }}>
        <StageLoader
          experienceId="fan-lobby"
          roomId={entry.roomId}
          venueId="fan-lobby"
          role="fan"
        />
      </div>
    </main>
  );
}
