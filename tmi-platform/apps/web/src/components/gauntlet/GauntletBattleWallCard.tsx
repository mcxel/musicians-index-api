"use client";

/**
 * GauntletBattleWallCard — battle subtype tile on the existing Battles Lobby Wall.
 * Feature-gated: GAUNTLET_DISCOVERY_ENABLED. Never shows fake LIVE audience.
 * Honest style + Needs X competitors copy (multi-genre, not hip-hop-only).
 */

import Link from "next/link";
import {
  ensureCanonicalGauntletRoom,
  getGauntletStatusLine,
  isGauntletDiscoveryEnabled,
  type GauntletRoomState,
} from "@/lib/gauntlet/GauntletRoomRuntime";
import { getGauntletDefinitionByStyle } from "@/lib/gauntlet/GauntletDefinition";
import { styleLabel } from "@/lib/competition/PerformerStyleSlots";
import { resolveLobbyDestination } from "@/lib/lobby/DestinationResolver";

type Props = {
  room?: GauntletRoomState | null;
};

export default function GauntletBattleWallCard({ room: roomProp }: Props) {
  if (!isGauntletDiscoveryEnabled()) return null;

  const room = roomProp ?? ensureCanonicalGauntletRoom();
  if (!room) return null;

  const dest = resolveLobbyDestination({
    roomId: room.roomId,
    kind: "gauntlet",
    roomClass: "PERSISTENT_GAUNTLET",
  });

  const hasLiveRun = Boolean(room.currentRunId);
  const format = getGauntletDefinitionByStyle(room.featuredStyle);
  const statusLine = getGauntletStatusLine(room.roomId);
  const style = styleLabel(room.featuredStyle);

  return (
    <Link
      href={dest.href}
      style={{
        display: "block",
        textDecoration: "none",
        borderRadius: 12,
        aspectRatio: "4/3",
        position: "relative",
        overflow: "hidden",
        border: "1px solid rgba(255,215,0,0.45)",
        background:
          "radial-gradient(circle at 30% 30%, rgba(255,215,0,0.35), rgba(255,45,170,0.2) 45%, #050510)",
        boxShadow: "0 4px 28px rgba(0,0,0,0.55)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 8,
          left: 8,
          fontSize: 8,
          fontWeight: 900,
          letterSpacing: "0.14em",
          color: "#050510",
          background: "#FFD700",
          padding: "2px 7px",
          borderRadius: 3,
        }}
      >
        GAUNTLET
      </div>
      <div
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          fontSize: 8,
          fontWeight: 800,
          letterSpacing: "0.08em",
          color: room.categoryLocked ? "#FFAB00" : "#00FFFF",
          background: "rgba(5,5,16,0.65)",
          padding: "2px 6px",
          borderRadius: 3,
          border: "1px solid rgba(255,255,255,0.15)",
        }}
      >
        {style.toUpperCase()}
        {room.categoryLocked ? " · LOCKED" : ""}
      </div>
      {hasLiveRun ? (
        <div
          style={{
            position: "absolute",
            top: 28,
            right: 8,
            fontSize: 9,
            fontWeight: 900,
            color: "#00FF88",
            letterSpacing: "0.08em",
          }}
        >
          ● RUN LIVE
        </div>
      ) : (
        <div
          style={{
            position: "absolute",
            top: 28,
            right: 8,
            fontSize: 9,
            fontWeight: 800,
            color: "rgba(255,255,255,0.55)",
            letterSpacing: "0.06em",
          }}
        >
          OPEN · WAITING
        </div>
      )}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 4px)",
          animation: hasLiveRun ? "gauntletPulse 1.6s ease-in-out infinite" : "gauntletReady 2.4s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />
      <style>{`
        @keyframes gauntletPulse { 0%,100%{opacity:0.55} 50%{opacity:1} }
        @keyframes gauntletReady { 0%,100%{opacity:0.25} 50%{opacity:0.55} }
      `}</style>
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "14px 10px 10px",
          background: "linear-gradient(transparent, rgba(0,0,0,0.9))",
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 900, color: "#fff" }}>
          {format?.emoji ?? "⚔️"} TMI Musical Gauntlet
        </div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>
          {statusLine}
        </div>
        <div style={{ fontSize: 10, color: "#FFD700", marginTop: 4, fontWeight: 700 }}>
          Spec {room.spectatorCount} · Wait {room.waitingCount}
          {room.paused ? " · PAUSED" : ""}
        </div>
      </div>
    </Link>
  );
}
