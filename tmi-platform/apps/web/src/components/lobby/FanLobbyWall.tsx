"use client";

import { useState } from "react";
import Link from "next/link";

type FanStatus = "idle" | "chatting" | "looking-for-group";

interface FanTile {
  id: string;
  name: string;
  emoji: string;
  status: FanStatus;
  location: string;
  genreInterest: string;
}

const STATUS_LABEL: Record<FanStatus, string> = {
  "idle":              "Idle",
  "chatting":          "Chatting",
  "looking-for-group": "Looking for Group",
};

const STATUS_COLOR: Record<FanStatus, string> = {
  "idle":              "rgba(255,255,255,0.35)",
  "chatting":          "#FFD700",
  "looking-for-group": "#00FF88",
};

const SEED_FANS: FanTile[] = [
  { id: "f1",  name: "Nova_Fan",    emoji: "🎧", status: "looking-for-group", location: "ATL",     genreInterest: "Hip-Hop" },
  { id: "f2",  name: "BeatChaser", emoji: "🔥", status: "chatting",          location: "NYC",     genreInterest: "R&B" },
  { id: "f3",  name: "WaveRider",  emoji: "🌊", status: "idle",              location: "LA",      genreInterest: "EDM" },
  { id: "f4",  name: "CrownFam",   emoji: "👑", status: "looking-for-group", location: "CHI",     genreInterest: "Trap" },
  { id: "f5",  name: "SoulTribe",  emoji: "✨", status: "chatting",          location: "MIA",     genreInterest: "Gospel" },
  { id: "f6",  name: "FlowSeeker", emoji: "🎵", status: "looking-for-group", location: "DC",      genreInterest: "Spoken Word" },
  { id: "f7",  name: "Vibes247",   emoji: "🎶", status: "idle",              location: "Global",  genreInterest: "Afrobeat" },
  { id: "f8",  name: "GridLyric",  emoji: "🎤", status: "looking-for-group", location: "London",  genreInterest: "Grime" },
];

interface Props {
  compact?: boolean;
}

export default function FanLobbyWall({ compact = false }: Props) {
  const [invited, setInvited] = useState<Set<string>>(new Set());

  function invite(id: string) {
    setInvited((prev) => new Set(prev).add(id));
  }

  const cols = compact ? 4 : 4;
  const tiles = compact ? SEED_FANS.slice(0, 4) : SEED_FANS;

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.2em", color: "#00FFFF" }}>
          FAN DISCOVERY LOBBY · {tiles.length} ONLINE
        </div>
        <Link href="/live/lobby/fans" style={{ fontSize: 8, color: "#00FFFF", textDecoration: "none", letterSpacing: "0.1em" }}>
          VIEW ALL →
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 10 }}>
        {tiles.map((fan) => {
          const sent = invited.has(fan.id);
          const color = STATUS_COLOR[fan.status] ?? "rgba(255,255,255,0.35)";

          return (
            <div
              key={fan.id}
              style={{
                borderRadius: 12,
                border: `1.5px solid ${color}44`,
                background: "linear-gradient(145deg, rgba(0,255,255,0.06), rgba(5,5,16,0.82))",
                padding: "12px 10px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                transition: "border-color 0.2s",
              }}
            >
              {/* Avatar */}
              <div style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: `${color}22`,
                border: `2px solid ${color}66`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                position: "relative",
              }}>
                {fan.emoji}
                {/* Status dot */}
                <div style={{
                  position: "absolute",
                  bottom: 1,
                  right: 1,
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: color,
                  border: "1.5px solid #050510",
                }} />
              </div>

              {/* Name */}
              <div style={{ fontSize: 10, fontWeight: 800, color: "#fff", letterSpacing: "0.06em" }}>
                {fan.name}
              </div>

              {/* Location + genre */}
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.5)", textAlign: "center" }}>
                {fan.location} · {fan.genreInterest}
              </div>

              {/* Status chip */}
              <div style={{
                fontSize: 7,
                fontWeight: 900,
                color: color,
                background: `${color}14`,
                border: `1px solid ${color}44`,
                borderRadius: 4,
                padding: "2px 6px",
                letterSpacing: "0.1em",
              }}>
                {STATUS_LABEL[fan.status]}
              </div>

              {/* Invite button */}
              {!compact && (
                <button
                  onClick={() => invite(fan.id)}
                  disabled={sent}
                  style={{
                    marginTop: 2,
                    padding: "5px 10px",
                    borderRadius: 6,
                    border: sent ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(0,255,255,0.5)",
                    background: sent ? "rgba(255,255,255,0.06)" : "rgba(0,255,255,0.12)",
                    color: sent ? "rgba(255,255,255,0.4)" : "#00FFFF",
                    fontSize: 8,
                    fontWeight: 900,
                    letterSpacing: "0.1em",
                    cursor: sent ? "default" : "pointer",
                    width: "100%",
                  }}
                >
                  {sent ? "INVITED ✓" : "INVITE"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
