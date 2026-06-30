"use client";

import React, { useState, useEffect } from "react";
import { PlaylistEngine, Playlist } from "@/lib/media/PlaylistEngine";
import { MediaItem } from "@/lib/media/media";

interface PlaylistSelectorModalProps {
  mediaItem: MediaItem;
  onClose: () => void;
}

export function PlaylistSelectorModal({
  mediaItem,
  onClose,
}: PlaylistSelectorModalProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  useEffect(() => {
    const fetchPlaylists = async () => {
      // This assumes a logged-in user context is available to get the ownerId
      const placeholderUserId = "user_123";
      const userPlaylists = await PlaylistEngine.getPlaylistsForUser(
        placeholderUserId
      );
      setPlaylists(userPlaylists);
      setIsLoading(false);
    };
    fetchPlaylists();
  }, []);

  const handleSelectPlaylist = async (playlistId: string) => {
    const placeholderUserId = "user_123";
    await PlaylistEngine.addMediaToPlaylist(
      playlistId,
      mediaItem.id,
      placeholderUserId
    );
    onClose(); // Close this modal after adding
  };

  const handleCreatePlaylist = async () => {
    if (newPlaylistName.trim() === "") return;

    // This assumes a logged-in user context is available to get the ownerId
    const placeholderUserId = "user_123";
    const newPlaylist = await PlaylistEngine.createPlaylist(
      placeholderUserId,
      newPlaylistName
    );
    await handleSelectPlaylist(newPlaylist.id);
    setNewPlaylistName(""); // Clear input
  };

  // Styles are simplified for brevity, but would match UniversalActionMenu
  const modalOverlayStyle: React.CSSProperties = {
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(0, 0, 0, 0.8)", zIndex: 2001,
    display: "flex", alignItems: "center", justifyContent: "center",
  };

  const modalContentStyle: React.CSSProperties = {
    background: "#111118", border: "1px solid #333", borderRadius: "12px",
    width: "100%", maxWidth: "380px", color: "white",
  };

  const buttonStyle: React.CSSProperties = {
    display: "block", width: "100%", background: "none", border: "none",
    color: "#E0E0E0", padding: "16px", textAlign: "left", cursor: "pointer",
  };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: "16px", borderBottom: "1px solid #333" }}>
          <h3 style={{ margin: 0 }}>Add to Playlist</h3>
        </div>
        <div style={{ padding: "16px", borderBottom: "1px solid #333", display: "flex", gap: "8px" }}>
          <input
            type="text"
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            placeholder="Create new playlist..."
            style={{ flexGrow: 1, background: '#222', border: '1px solid #444', color: 'white', padding: '8px', borderRadius: '4px' }}
          />
          <button
            onClick={handleCreatePlaylist}
            disabled={newPlaylistName.trim() === ""}
            style={{ background: '#00C8FF', color: '#050510', border: 'none', padding: '8px 12px', cursor: 'pointer', borderRadius: '4px', opacity: newPlaylistName.trim() === "" ? 0.5 : 1 }}
          >
            Create
          </button>
        </div>
        <div style={{ maxHeight: "300px", overflowY: "auto" }}>
          {isLoading && <p style={{ padding: "16px" }}>Loading playlists...</p>}
          {!isLoading && playlists.length === 0 && (
            <p style={{ padding: "16px", color: "#888" }}>No playlists found.</p>
          )}
          {playlists.map((playlist) => (
            <button
              key={playlist.id}
              onClick={() => handleSelectPlaylist(playlist.id)}
              style={buttonStyle}
            >
              {playlist.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}