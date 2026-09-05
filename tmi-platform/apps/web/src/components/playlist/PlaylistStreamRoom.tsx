"use client";

import { useState } from "react";
import Link from "next/link";

export interface PlaylistTrack {
  id: string;
  title: string;
  artist: string;
  durationSec: number;
}

const MOCK_PLAYLIST: PlaylistTrack[] = [
  { id: "tr-1", title: "Summer Heat Wave", artist: "DJ Apex", durationSec: 215 },
  { id: "tr-2", title: "Midnight Cypher Beat", artist: "Metro Sound", durationSec: 184 },
  { id: "tr-3", title: "Golden State Anthem", artist: "Bay Area All-Stars", durationSec: 240 },
];

export interface PlaylistStreamRoomProps {
  playlistId: string;
  playlistTitle?: string;
}

export default function PlaylistStreamRoom({
  playlistId,
  playlistTitle = "Global Top 100 Hip-Hop & R&B Playlist",
}: PlaylistStreamRoomProps) {
  const [isOnline, setIsOnline] = useState(false);
  const [activeTrackIndex, setActiveTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentTrack = MOCK_PLAYLIST[activeTrackIndex] ?? MOCK_PLAYLIST[0];

  return (
    <div
      style={{
        width: "100%",
        borderRadius: 20,
        border: `1.5px solid ${isOnline ? "#00FF88" : "rgba(255,255,255,0.2)"}`,
        background: "rgba(8,8,24,0.92)",
        backdropFilter: "blur(16px)",
        padding: 24,
        boxShadow: `0 0 32px ${isOnline ? "rgba(0,255,136,0.2)" : "rgba(0,0,0,0.4)"}`,
        fontFamily: "var(--font-sans, system-ui, sans-serif)",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      {/* HEADER & ONLINE/OFFLINE TOGGLE */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 900, color: isOnline ? "#00FF88" : "#00FFFF", letterSpacing: "0.14em" }}>
            PLAYLIST STREAM ROOM FLOW ({isOnline ? "LIVE ONLINE ROOM" : "LOCAL OFFLINE PLAYER"})
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", marginTop: 2 }}>{playlistTitle}</div>
        </div>

        <button
          type="button"
          onClick={() => setIsOnline((v) => !v)}
          style={{
            padding: "8px 16px",
            borderRadius: 20,
            fontSize: 10,
            fontWeight: 900,
            border: `1.5px solid ${isOnline ? "#00FF88" : "#00FFFF"}`,
            background: isOnline ? "rgba(0,255,136,0.15)" : "rgba(0,255,255,0.15)",
            color: isOnline ? "#00FF88" : "#00FFFF",
            cursor: "pointer",
            letterSpacing: "0.08em",
          }}
        >
          {isOnline ? "🌐 ONLINE PLAYLIST ROOM ACTIVE" : "🎧 SWITCH TO ONLINE ROOM"}
        </button>
      </div>

      {/* ACTIVE STREAM PLAYER */}
      <div
        style={{
          padding: 20,
          borderRadius: 16,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              border: "2px solid #00FFFF",
              background: "linear-gradient(135deg, #00FFFF 0%, #0088FF 100%)",
              color: "#050510",
              fontSize: 20,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
            }}
          >
            {isPlaying ? "⏸" : "▶"}
          </button>
          <div>
            <div style={{ fontSize: 15, fontWeight: 900, color: "#fff" }}>{currentTrack.title}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
              {currentTrack.artist} · Track {activeTrackIndex + 1} of {MOCK_PLAYLIST.length}
            </div>
          </div>
        </div>

        {isOnline && (
          <Link
            href={`/live/rooms/playlist-${playlistId}`}
            style={{
              padding: "10px 18px",
              borderRadius: 10,
              background: "linear-gradient(135deg, #FF2DAA 0%, #AA2DFF 100%)",
              color: "#fff",
              fontSize: 10,
              fontWeight: 900,
              textDecoration: "none",
              letterSpacing: "0.08em",
            }}
          >
            JOIN LIVE AUDIENCE ROOM →
          </Link>
        )}
      </div>

      {/* TRACK LIST */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 900, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>
          Playlist Queue ({MOCK_PLAYLIST.length} tracks)
        </div>
        {MOCK_PLAYLIST.map((track, i) => (
          <button
            key={track.id}
            type="button"
            onClick={() => {
              setActiveTrackIndex(i);
              setIsPlaying(true);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 12,
              borderRadius: 10,
              background: i === activeTrackIndex ? "rgba(0,255,255,0.12)" : "rgba(255,255,255,0.02)",
              border: `1px solid ${i === activeTrackIndex ? "#00FFFF" : "rgba(255,255,255,0.06)"}`,
              color: i === activeTrackIndex ? "#00FFFF" : "#fff",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <div>
              <div style={{ fontSize: 12, fontWeight: 800 }}>
                {i + 1}. {track.title}
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{track.artist}</div>
            </div>
            <span style={{ fontSize: 10, fontFamily: "monospace", opacity: 0.6 }}>
              {Math.floor(track.durationSec / 60)}:{String(track.durationSec % 60).padStart(2, "0")}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
