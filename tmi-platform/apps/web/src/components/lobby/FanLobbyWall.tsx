"use client";

/**
 * FanLobbyWall — discovery entry for Fan Avatar lobbies.
 * Rule 20: no seeded fake fans / fake online counts.
 * Real presence lives in FanLobbyVenue + LivePresence / audience APIs.
 */

import Link from "next/link";

interface Props {
  compact?: boolean;
}

export default function FanLobbyWall({ compact = false }: Props) {
  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.2em", color: "#00FFFF" }}>
          FAN AVATAR LOBBY WALL
        </div>
        <Link href="/rooms/fan-lobby" style={{ fontSize: 8, color: "#00FFFF", textDecoration: "none", letterSpacing: "0.1em" }}>
          ENTER LOBBY →
        </Link>
      </div>

      <div
        style={{
          borderRadius: 12,
          border: "1.5px solid rgba(0,255,255,0.25)",
          background: "linear-gradient(145deg, rgba(0,255,255,0.06), rgba(5,5,16,0.82))",
          padding: compact ? "16px 12px" : "28px 16px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.55 }}>👥</div>
        <div style={{ fontSize: 12, fontWeight: 800, color: "#fff", letterSpacing: "0.06em" }}>
          No fake fan tiles
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 6, lineHeight: 1.45 }}>
          Join the Avatar Fan Lobby for real peer presence, seats, and camera when Daily is configured.
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 14, flexWrap: "wrap" }}>
          <Link
            href="/rooms/fan-lobby"
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              background: "#00FFFF",
              color: "#050510",
              fontWeight: 900,
              fontSize: 11,
              textDecoration: "none",
            }}
          >
            OPEN FAN LOBBY
          </Link>
          <Link
            href="/live/lobby-wall"
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: "1px solid rgba(0,255,255,0.35)",
              color: "#00FFFF",
              fontWeight: 800,
              fontSize: 11,
              textDecoration: "none",
            }}
          >
            ALL LIVE WALLS
          </Link>
        </div>
      </div>
    </div>
  );
}
