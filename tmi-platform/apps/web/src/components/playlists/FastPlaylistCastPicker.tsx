"use client";

import React, { useState } from "react";
import { castPlaylistToMonitor } from "@/lib/playlists/PlaylistMonitorCast";
import { sendPlaybackCommand } from "@/lib/playlists/commandCenterPlaybackBus";

export interface FastPlaylistCastPickerProps {
  onClose: () => void;
  targetSlotId?: string;
  onCastSuccess?: (title: string, artist?: string) => void;
}

interface QuickTrack {
  id: string;
  title: string;
  artist: string;
  duration: number;
  audioUrl: string;
  coverUrl: string;
  playlistName: string;
}

const CANONICAL_QUICK_TRACKS: QuickTrack[] = [
  {
    id: "track-stream-win-01",
    title: "Neon Pulse (Cypher Round)",
    artist: "Nova Cipher",
    duration: 184,
    audioUrl: "/assets/audio/neon-pulse.mp3",
    coverUrl: "/tmi-curated/track-1.jpg",
    playlistName: "Championship Battles",
  },
  {
    id: "track-stream-win-02",
    title: "Frequency Highs (Live Stage)",
    artist: "Zion Freq",
    duration: 210,
    audioUrl: "/assets/audio/frequency-highs.mp3",
    coverUrl: "/tmi-curated/track-2.jpg",
    playlistName: "Championship Battles",
  },
  {
    id: "track-stream-win-03",
    title: "Cosmic Flow",
    artist: "Astra Nova",
    duration: 195,
    audioUrl: "/assets/audio/cosmic-flow.mp3",
    coverUrl: "/tmi-curated/track-3.jpg",
    playlistName: "Lounge Chill & Beats",
  },
  {
    id: "track-stream-win-04",
    title: "Street Royalty",
    artist: "Big Ace",
    duration: 220,
    audioUrl: "/assets/audio/street-royalty.mp3",
    coverUrl: "/tmi-curated/track-4.jpg",
    playlistName: "Headliners Showcase",
  },
];

export default function FastPlaylistCastPicker({
  onClose,
  targetSlotId = "mon-a",
  onCastSuccess,
}: FastPlaylistCastPickerProps) {
  const [selectedPlaylist, setSelectedPlaylist] = useState<string>("ALL");
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);

  const playlists = ["ALL", "Championship Battles", "Lounge Chill & Beats", "Headliners Showcase"];

  const filteredTracks =
    selectedPlaylist === "ALL"
      ? CANONICAL_QUICK_TRACKS
      : CANONICAL_QUICK_TRACKS.filter((t) => t.playlistName === selectedPlaylist);

  const handleCast = (track: QuickTrack) => {
    setActiveTrackId(track.id);

    // Cast onto monitor cell
    castPlaylistToMonitor({
      playlistId: track.playlistName,
      trackId: track.id,
      title: track.title,
      artist: track.artist,
      coverUrl: track.coverUrl,
      audioUrl: track.audioUrl,
      targetMonitorId: targetSlotId,
    });

    // Command central playback bus
    sendPlaybackCommand("select-track", {
      playlistId: track.playlistName,
      trackId: track.id,
    });

    onCastSuccess?.(track.title, track.artist);
    onClose();
  };

  return (
    <div
      data-testid="tmi-fast-playlist-cast-picker"
      style={{
        position: "absolute",
        top: "calc(100% + 8px)",
        left: 0,
        zIndex: 40,
        width: 320,
        background: "rgba(5,5,16,0.98)",
        border: "1px solid rgba(0,255,255,0.45)",
        borderRadius: 12,
        padding: 12,
        boxShadow: "0 18px 48px rgba(0,0,0,0.8)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 6 }}>
        <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", color: "#00FFFF" }}>
          🎵 CAST PLAYLIST / TRACK
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{
            fontSize: 9,
            fontWeight: 800,
            background: "rgba(255,255,255,0.1)",
            border: "none",
            color: "#fff",
            borderRadius: 4,
            padding: "2px 6px",
            cursor: "pointer",
          }}
        >
          ✕
        </button>
      </div>

      {/* Playlist category filter tabs */}
      <div style={{ display: "flex", gap: 4, overflowX: "auto", paddingBottom: 4 }}>
        {playlists.map((pl) => (
          <button
            key={pl}
            type="button"
            onClick={() => setSelectedPlaylist(pl)}
            style={{
              fontSize: 8,
              fontWeight: 800,
              padding: "4px 8px",
              borderRadius: 6,
              border: `1px solid ${selectedPlaylist === pl ? "#00FFFF" : "rgba(255,255,255,0.12)"}`,
              background: selectedPlaylist === pl ? "rgba(0,255,255,0.2)" : "rgba(255,255,255,0.03)",
              color: selectedPlaylist === pl ? "#00FFFF" : "rgba(255,255,255,0.6)",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {pl}
          </button>
        ))}
      </div>

      {/* Track list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 200, overflowY: "auto" }}>
        {filteredTracks.map((track) => (
          <div
            key={track.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "6px 8px",
              borderRadius: 8,
              background: activeTrackId === track.id ? "rgba(0,255,255,0.15)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${activeTrackId === track.id ? "#00FFFF" : "rgba(255,255,255,0.08)"}`,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1, paddingRight: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {track.title}
              </span>
              <span style={{ fontSize: 8, color: "#00FFFF", fontWeight: 700 }}>
                {track.artist} · <span style={{ color: "rgba(255,255,255,0.4)" }}>{Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, "0")}</span>
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleCast(track)}
              style={{
                fontSize: 8,
                fontWeight: 900,
                padding: "4px 10px",
                borderRadius: 6,
                background: "linear-gradient(135deg, #00FFFF, #AA2DFF)",
                color: "#050510",
                border: "none",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              ▶ CAST
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
