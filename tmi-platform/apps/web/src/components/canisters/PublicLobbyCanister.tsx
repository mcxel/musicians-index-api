"use client";

/**
 * PublicLobbyCanister — Rule 15 canonical canister.
 * Fan-facing ENTRY LAYER into the one canonical venue (same roomId as performer
 * STAGE / GO LIVE when a live session exists). Honest empty when none live.
 * Routes through Fan Avatar Lobby — not a second fake room (Rule 14/20).
 */

import Link from "next/link";
import {
  resolveFanWorldEntry,
  roomIdFromJoinRoute,
} from "@/lib/live/canonicalWorldViewport";

interface PublicLobbyCanisterProps {
  /** Performer or venue slug that owns this lobby. */
  entityId: string;
  entityName?: string;
  accentColor?: string;
  /** Route of the main live room to join. */
  liveRoomRoute?: string;
}

export function PublicLobbyCanister({
  entityId,
  entityName,
  accentColor = "#00FF88",
  liveRoomRoute,
}: PublicLobbyCanisterProps) {
  const entry = resolveFanWorldEntry({
    joinRoomId: roomIdFromJoinRoute(liveRoomRoute),
    from: "public-lobby",
  });
  const lobbyRoute = `${entry.href}&entity=${encodeURIComponent(entityId)}`;

  return (
    <div style={{
      background: "rgba(255,255,255,0.015)",
      border: `1px solid ${accentColor}22`,
      borderRadius: 14,
      overflow: "hidden",
    }}>
      <div style={{
        padding: "12px 18px",
        borderBottom: `1px solid ${accentColor}18`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.3em", color: accentColor, fontWeight: 800 }}>
            🌐 PUBLIC LOBBY {entityName ? `— ${entityName.toUpperCase()}` : ""}
          </div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
            {entry.liveSessionPresent
              ? "Live session — enter the same venue world"
              : "No live session — 24/7 system lobby"}
          </div>
        </div>
        <Link
          href={lobbyRoute}
          style={{
            padding: "7px 16px", borderRadius: 8,
            background: accentColor, color: "#050310",
            fontSize: 9, fontWeight: 900, letterSpacing: "0.1em",
            textDecoration: "none",
          }}
        >
          JOIN LOBBY
        </Link>
      </div>

      <div style={{ padding: "12px 18px" }}>
        <div style={{ textAlign: "center", color: "rgba(255,255,255,0.35)", fontSize: 12, padding: "16px 0", lineHeight: 1.5 }}>
          {entry.liveSessionPresent
            ? "Enter via Fan Avatar Lobby — same room, curtain, stage, and seats as the performer."
            : "No one in the lobby yet. Be the first to join."}
        </div>

        <Link
          href={lobbyRoute}
          style={{
            display: "block", textAlign: "center", marginTop: 8,
            fontSize: 9, color: accentColor, fontWeight: 800,
            textDecoration: "none", letterSpacing: "0.1em",
            border: `1px solid ${accentColor}44`,
            borderRadius: 8, padding: "8px 16px",
          }}
        >
          ENTER LOBBY →
        </Link>
      </div>
    </div>
  );
}

export default PublicLobbyCanister;
