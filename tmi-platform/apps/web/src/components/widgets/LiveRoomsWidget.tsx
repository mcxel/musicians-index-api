"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getMondayNightStageSchedule } from "@/lib/events/ScheduledEventRegistry";
import { getActiveSessions, onSessionsChanged } from "@/lib/broadcast/GlobalLiveSessionRegistry";

const LIVE_ROOMS = [
  { id: "monthly-idol",    title: "Monthly Idol",      genre: "All Genres", accent: "#FFD700", glyph: "🏟️",  href: "/live/rooms/monthly-idol",    roomKeys: ["monthly-idol"] },
  { id: "cypher-arena",    title: "Cypher East",       genre: "Hip-Hop",    accent: "#00FFFF", glyph: "🎤",  href: "/live/rooms/cypher-arena",    roomKeys: ["cypher-arena", "cypher"] },
  { id: "deal-or-feud",    title: "Deal or Feud",      genre: "Game Show",  accent: "#FF2DAA", glyph: "🎰",  href: "/live/rooms/deal-or-feud",    roomKeys: ["deal-or-feud"] },
  { id: "venue-room",      title: "Producer Lab",      genre: "Beats",      accent: "#AA2DFF", glyph: "🎛️",  href: "/live/rooms/venue-room",      roomKeys: ["venue-room", "producer"] },
  { id: "world-concert",   title: "World Concert",     genre: "Live Music", accent: "#00FF88", glyph: "🎸",  href: "/rooms/world-concert",        roomKeys: ["world-concert"] },
  { id: "monday-night",    title: "Monday Night Stage",genre: "Hip-Hop",    accent: "#FF6B35", glyph: "🎙️",  href: "/shows/monday-night-stage", scheduled: true as const, roomKeys: ["monday-night-stage", "monday-stage"] },
];

function sessionMatchesRoom(roomKeys: string[], roomId: string): boolean {
  const normalized = roomId.toLowerCase();
  return roomKeys.some((key) => normalized.includes(key));
}

export default function LiveRoomsWidget() {
  const mns = useMemo(() => getMondayNightStageSchedule(), []);
  const [liveRoomIds, setLiveRoomIds] = useState<Set<string>>(() =>
    new Set(getActiveSessions().map((s) => s.roomId)),
  );

  useEffect(() => {
    const sync = () => setLiveRoomIds(new Set(getActiveSessions().map((s) => s.roomId)));
    sync();
    return onSessionsChanged(sync);
  }, []);

  const visibleRooms = useMemo(() => {
    return LIVE_ROOMS.filter((room) => {
      if (room.scheduled) return true;
      return [...liveRoomIds].some((id) => sessionMatchesRoom(room.roomKeys, id));
    });
  }, [liveRoomIds]);

  return (
    <div style={{ color: "#fff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#FF2020", display: "inline-block", animation: "tmiBlink 1.1s step-end infinite" }} />
          <span style={{ fontSize: 9, letterSpacing: "0.22em", color: "#00FF88", fontWeight: 800 }}>LIVE ROOMS NOW</span>
        </div>
        <Link href="/live/rooms" style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textDecoration: "none", fontWeight: 700 }}>
          ALL ROOMS →
        </Link>
      </div>

      <style>{`@keyframes tmiBlink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>

      {visibleRooms.length === 0 ? (
        <div style={{ padding: "14px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.03)", fontSize: 11, color: "rgba(255,255,255,0.5)", textAlign: "center" }}>
          No live rooms right now — browse scheduled shows below.
        </div>
      ) : null}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {visibleRooms.map((room) => {
          const isMonday = room.scheduled;
          const registryLive = [...liveRoomIds].some((id) => sessionMatchesRoom(room.roomKeys, id));
          const joinable = isMonday ? mns.joinable : registryLive;
          const statusLabel = isMonday
            ? mns.joinable
              ? "Live now"
              : mns.phase === "PRESHOW"
                ? "Preshow"
                : mns.phase === "CLOSED"
                  ? `Next show · ${Math.ceil(mns.countdownMs / 3600000)}h`
                  : mns.label
            : registryLive
              ? "Live now"
              : "Closed";

          const inner = (
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "11px 14px", borderRadius: 12,
              background: `${room.accent}0A`,
              border: `1px solid ${room.accent}30`,
              opacity: joinable ? 1 : 0.72,
            }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{room.glyph}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{room.title}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{room.genre} · {statusLabel}</div>
              </div>
              <div style={{ flexShrink: 0, textAlign: "right" }}>
                <div style={{ fontSize: 9, fontWeight: 800, color: joinable ? room.accent : "rgba(255,255,255,0.35)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  {joinable ? "Join" : isMonday && mns.phase === "PRESHOW" ? "Preshow" : "Closed"}
                </div>
              </div>
            </div>
          );

          if (!joinable) {
            return <div key={room.id}>{inner}</div>;
          }

          return (
            <Link key={room.id} href={room.href} style={{ textDecoration: "none", color: "#fff" }}>
              {inner}
            </Link>
          );
        })}
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
        <Link href="/live/lobby-wall" style={{ flex: 1, padding: "10px 0", textAlign: "center", background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.3)", borderRadius: 8, color: "#00FF88", fontSize: 10, fontWeight: 800, textDecoration: "none", letterSpacing: "0.08em" }}>
          LIVE LOBBY WALL
        </Link>
        <Link href="/rooms/world-concert" style={{ flex: 1, padding: "10px 0", textAlign: "center", background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 8, color: "#FFD700", fontSize: 10, fontWeight: 800, textDecoration: "none", letterSpacing: "0.08em" }}>
          WORLD CONCERT →
        </Link>
      </div>
    </div>
  );
}
