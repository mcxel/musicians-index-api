"use client";

/**
 * PublicLobbyCanister — Rule 15 canonical canister.
 * Shows the public pre-show lobby for an entity (performer/venue).
 * Fans can see who's in the lobby, chat, and wait for the show.
 * Routes through LobbyEntryFlow → AudienceScene per Rule 15.
 */

import { useState } from "react";
import Link from "next/link";

interface LobbyFan {
  id: string;
  name: string;
  emoji: string;
  status: "idle" | "chatting" | "looking-for-group";
  location: string;
}

const STATUS_COLOR: Record<LobbyFan["status"], string> = {
  idle:              "rgba(255,255,255,0.35)",
  chatting:          "#FFD700",
  "looking-for-group": "#00FF88",
};

const STATUS_LABEL: Record<LobbyFan["status"], string> = {
  idle:              "Idle",
  chatting:          "Chatting",
  "looking-for-group": "Looking to Group",
};

const SEED_FANS: LobbyFan[] = [
  { id: "f1", name: "Nova_Fan",    emoji: "🎧", status: "looking-for-group", location: "ATL" },
  { id: "f2", name: "BeatChaser", emoji: "🔥", status: "chatting",          location: "NYC" },
  { id: "f3", name: "WaveRider",  emoji: "🌊", status: "idle",              location: "LA"  },
  { id: "f4", name: "CrownFam",   emoji: "👑", status: "looking-for-group", location: "CHI" },
  { id: "f5", name: "SoulTribe",  emoji: "✨", status: "chatting",          location: "MIA" },
];

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
  const [fans] = useState<LobbyFan[]>(SEED_FANS);
  const lobbyRoute = liveRoomRoute
    ? `${liveRoomRoute}?from=public-lobby`
    : `/live/lobby?entity=${entityId}&from=public-lobby`;

  return (
    <div style={{
      background: "rgba(255,255,255,0.015)",
      border: `1px solid ${accentColor}22`,
      borderRadius: 14,
      overflow: "hidden",
    }}>
      {/* Header */}
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
            {fans.length} fans in the lobby
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
        {fans.length === 0 ? (
          <div style={{ textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: 12, padding: "16px 0" }}>
            No one in the lobby yet. Be the first to join.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {fans.map((fan) => (
              <div
                key={fan.id}
                style={{
                  padding: "9px 12px", borderRadius: 8,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  display: "flex", alignItems: "center", gap: 10,
                }}
              >
                <div style={{ fontSize: 20 }}>{fan.emoji}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{fan.name}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>📍 {fan.location}</div>
                </div>
                <span style={{
                  fontSize: 8, fontWeight: 700, color: STATUS_COLOR[fan.status],
                  letterSpacing: "0.08em",
                }}>
                  {STATUS_LABEL[fan.status]}
                </span>
              </div>
            ))}
          </div>
        )}

        <Link
          href={lobbyRoute}
          style={{
            display: "block", textAlign: "center", marginTop: 14,
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
