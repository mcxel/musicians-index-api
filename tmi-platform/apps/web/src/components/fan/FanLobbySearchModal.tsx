"use client";

import { useState } from "react";
import Link from "next/link";

export interface FanLobbyItem {
  id: string;
  title: string;
  hostName: string;
  genre: string;
  participantCount: number;
  maxCapacity: number;
  theme: string;
}

const MOCK_FAN_LOBBIES: FanLobbyItem[] = [
  { id: "lobby-1", title: "Hip-Hop Cypher Fan Zone", hostName: "DJ Premier Fan Club", genre: "Hip-Hop", participantCount: 14, maxCapacity: 25, theme: "Neon Urban Stadium" },
  { id: "lobby-2", title: "R&B Slow Jams Lounge", hostName: "Velvet Lounge Team", genre: "R&B", participantCount: 8, maxCapacity: 20, theme: "Velvet Penthouse" },
  { id: "lobby-3", title: "Electronic Rave Hub", hostName: "Pulse EDM", genre: "EDM", participantCount: 22, maxCapacity: 30, theme: "Cyberpunk Laser Arena" },
  { id: "lobby-4", title: "Trap Beats Community", hostName: "Metro Fan Room", genre: "Trap", participantCount: 19, maxCapacity: 25, theme: "Sub-Zero Underground" },
  { id: "lobby-5", title: "Global Afrobeats Party", hostName: "Burna Fans Official", genre: "Afrobeats", participantCount: 12, maxCapacity: 25, theme: "Tropical Sunset Amphitheater" },
];

export interface FanLobbySearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
}

export default function FanLobbySearchModal({ isOpen, onClose, userRole = "fan" }: FanLobbySearchModalProps) {
  const [query, setQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("ALL");

  if (!isOpen) return null;

  const genres = ["ALL", "Hip-Hop", "R&B", "EDM", "Trap", "Afrobeats"];

  const filteredLobbies = MOCK_FAN_LOBBIES.filter((l) => {
    const matchesQuery = l.title.toLowerCase().includes(query.toLowerCase()) || l.hostName.toLowerCase().includes(query.toLowerCase());
    const matchesGenre = selectedGenre === "ALL" || l.genre === selectedGenre;
    return matchesQuery && matchesGenre;
  });

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999,
        background: "rgba(4,4,12,0.85)",
        backdropFilter: "blur(14px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        fontFamily: "var(--font-sans, system-ui, sans-serif)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 600,
          background: "rgba(10,10,28,0.95)",
          border: "1px solid rgba(0,255,255,0.3)",
          borderRadius: 20,
          padding: 24,
          boxShadow: "0 0 40px rgba(0,255,255,0.2)",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 900, color: "#00FFFF", letterSpacing: "0.14em" }}>
              FAN LOBBY DISCOVERY ENGINE ({userRole.toUpperCase()} ROLE)
            </div>
            <div style={{ fontSize: 16, fontWeight: 900, color: "#fff", marginTop: 2 }}>
              Find & Join Avatar Fan Lobbies
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "#fff",
              borderRadius: "50%",
              width: 32,
              height: 32,
              cursor: "pointer",
              fontSize: 16,
            }}
          >
            ✕
          </button>
        </div>

        {/* Search input & Genre chips */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input
            type="text"
            placeholder="Search fan lobbies by title or host..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: 10,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(0,255,255,0.25)",
              color: "#fff",
              fontSize: 13,
              outline: "none",
            }}
          />

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {genres.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setSelectedGenre(g)}
                style={{
                  padding: "5px 12px",
                  borderRadius: 14,
                  fontSize: 10,
                  fontWeight: 800,
                  border: `1px solid ${selectedGenre === g ? "#00FFFF" : "rgba(255,255,255,0.15)"}`,
                  background: selectedGenre === g ? "rgba(0,255,255,0.15)" : "rgba(255,255,255,0.04)",
                  color: selectedGenre === g ? "#00FFFF" : "rgba(255,255,255,0.6)",
                  cursor: "pointer",
                }}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Lobby List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 320, overflowY: "auto" }}>
          {filteredLobbies.length === 0 ? (
            <div style={{ padding: 20, textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
              No active fan lobbies match your query.
            </div>
          ) : (
            filteredLobbies.map((lobby) => (
              <div
                key={lobby.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 14,
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{lobby.title}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
                    Host: {lobby.hostName} · Theme: {lobby.theme}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#FFD700" }}>
                    👥 {lobby.participantCount}/{lobby.maxCapacity}
                  </span>
                  <Link
                    href={`/rooms/${lobby.id}`}
                    onClick={onClose}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 8,
                      background: "linear-gradient(135deg, #00FFFF 0%, #0088FF 100%)",
                      color: "#050510",
                      fontSize: 10,
                      fontWeight: 900,
                      textDecoration: "none",
                      letterSpacing: "0.06em",
                    }}
                  >
                    JOIN ROOM →
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
