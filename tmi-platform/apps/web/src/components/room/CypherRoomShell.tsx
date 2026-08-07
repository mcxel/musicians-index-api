"use client";

/**
 * CypherRoomShell — routes through ArenaEventShell (Rule 21).
 * CompetitionBeatDock mounts inside ArenaEventShell for eventType=cypher.
 */

import dynamic from "next/dynamic";

const ArenaEventShell = dynamic(() => import("@/components/live/ArenaEventShell"), { ssr: false });

export function CypherRoomShell({ roomId }: { roomId: string }) {
  return (
    <div className="tmi-cypher-room" data-room-id={roomId} style={{ position: "relative", minHeight: "100vh" }}>
      <ArenaEventShell roomId={roomId} eventType="cypher" mode="performer" liveState="live" />
    </div>
  );
}

export default CypherRoomShell;
