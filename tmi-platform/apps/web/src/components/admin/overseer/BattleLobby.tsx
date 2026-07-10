"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { BezelFrame } from "@/components/admin/overseer/AdminDesignSystem";

type BattleFormat = "1-on-1" | "Duo" | "Band" | "Choir" | "Group";

type BattleRoom = {
  id: string;
  format: BattleFormat;
  status: "Awaiting Players" | "Starting Soon" | "Live";
  players: number;
  maxPlayers: number;
  route: string;
};

const formats: BattleFormat[] = ["1-on-1", "Duo", "Band", "Choir", "Group"];

const rooms: BattleRoom[] = [
  { id: "ARENA_01", format: "1-on-1", status: "Awaiting Players", players: 1, maxPlayers: 2, route: "/battles/live" },
  { id: "ARENA_02", format: "Duo", status: "Starting Soon", players: 3, maxPlayers: 4, route: "/battles/lobby-wall" },
  { id: "ARENA_03", format: "Band", status: "Live", players: 6, maxPlayers: 8, route: "/battles/live" },
  { id: "ARENA_04", format: "Choir", status: "Awaiting Players", players: 5, maxPlayers: 12, route: "/battles/new" },
  { id: "ARENA_05", format: "Group", status: "Starting Soon", players: 7, maxPlayers: 10, route: "/battles/live" },
  { id: "ARENA_06", format: "1-on-1", status: "Live", players: 2, maxPlayers: 2, route: "/battles/today" },
];

function statusTone(status: BattleRoom["status"]): { text: string; glow: string; bg: string } {
  if (status === "Live") {
    return { text: "#00ff88", glow: "rgba(0,255,136,0.5)", bg: "rgba(0,255,136,0.14)" };
  }
  if (status === "Starting Soon") {
    return { text: "#facc15", glow: "rgba(250,204,21,0.5)", bg: "rgba(250,204,21,0.14)" };
  }
  return { text: "#f4d07f", glow: "rgba(244,208,127,0.45)", bg: "rgba(244,208,127,0.12)" };
}

export default function BattleLobby() {
  const [selectedFormat, setSelectedFormat] = useState<BattleFormat>("1-on-1");

  const visibleRooms = useMemo(
    () => rooms.filter((room) => room.format === selectedFormat),
    [selectedFormat],
  );

  return (
    <section style={{ height: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
      <BezelFrame>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 8,
            alignItems: "center",
            padding: "8px 10px",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#ffd700",
            }}
          >
            Battle Format Registry
          </h2>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
            {formats.map((format) => {
              const active = selectedFormat === format;
              return (
                <button
                  key={format}
                  type="button"
                  onClick={() => setSelectedFormat(format)}
                  style={{
                    borderRadius: 7,
                    border: active ? "1px solid rgba(0,255,255,0.75)" : "1px solid rgba(255,215,0,0.3)",
                    background: active
                      ? "linear-gradient(180deg, rgba(0,255,255,0.3), rgba(19,41,58,0.86))"
                      : "linear-gradient(180deg, rgba(13,10,10,0.8), rgba(20,11,14,0.92))",
                    color: active ? "#d9fbff" : "#ffd700",
                    boxShadow: active ? "0 0 14px rgba(0,255,255,0.35)" : "none",
                    padding: "5px 9px",
                    fontSize: 9,
                    fontWeight: 900,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                  }}
                >
                  {format}
                </button>
              );
            })}
          </div>
        </div>
      </BezelFrame>

      <div style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
        {visibleRooms.map((room) => {
          const tone = statusTone(room.status);
          return (
            <BezelFrame key={room.id}>
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 8,
                  padding: 10,
                }}
              >
                <div style={{ display: "grid", gap: 5 }}>
                  <div style={{ color: "#fff1c3", fontSize: 12, fontWeight: 900, letterSpacing: "0.05em" }}>
                    ACTIVE ROOM: {room.id}
                  </div>
                  <div style={{ color: "rgba(255,216,143,0.8)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Format: {room.format}
                  </div>
                  <div style={{ color: "rgba(255,216,143,0.72)", fontSize: 9 }}>
                    Players: {room.players}/{room.maxPlayers}
                  </div>
                  <span
                    style={{
                      width: "fit-content",
                      borderRadius: 999,
                      border: `1px solid ${tone.glow}`,
                      background: tone.bg,
                      color: tone.text,
                      boxShadow: `0 0 12px ${tone.glow}`,
                      fontSize: 8,
                      fontWeight: 900,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      padding: "3px 8px",
                    }}
                  >
                    {room.status}
                  </span>
                </div>

                <Link
                  href={room.route}
                  style={{
                    width: "100%",
                    textAlign: "center",
                    borderRadius: 8,
                    border: "1px solid rgba(255,215,0,0.65)",
                    background: "linear-gradient(180deg, rgba(42,36,26,0.95), rgba(24,17,13,0.98))",
                    color: "#ffd700",
                    fontSize: 10,
                    fontWeight: 900,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    padding: "8px 10px",
                    textDecoration: "none",
                  }}
                >
                  Join Match
                </Link>
              </div>
            </BezelFrame>
          );
        })}
      </div>
    </section>
  );
}
