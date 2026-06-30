"use client";

import React from "react";
import type { MediaItem } from "@/lib/media/media";
import { useGlobalMediaStore } from "@/stores/globalMediaStore";
import { MemoryWallEngine } from "@/lib/media/MemoryWallEngine";
import { CollectionsEngine } from "@/lib/media/CollectionsEngine";
// The WindowManager hook would be the canonical way to open new "windows" or "canisters".
// import { useWindowManager } from "@/lib/runtime/window/useWindowManager";

interface UniversalActionMenuProps {
  mediaItem: MediaItem;
  onClose: () => void;
  // These would be hooks to the actual engines
  // Example: onAddToPlaylist: (playlistId: string, mediaId: string) => void;
}

interface Action {
  label: string;
  icon: string;
  action: () => void;
  section: "playback" | "organize" | "broadcast" | "share" | "manage";
}

/**
 * This menu appears after creating or selecting any piece of media.
 * It provides a consistent set of actions available for that media item.
 *
 * Renamed from UniversalSaveModal to reflect its broader purpose.
 * @see User request on 2026-06-26
 */
export function UniversalActionMenu({
  mediaItem,
  onClose,
}: UniversalActionMenuProps) {
  // const { openWindow } = useWindowManager(); // Canonical approach
  const { play, loadQueue } = useGlobalMediaStore();

  const isPlayable =
    mediaItem.type === "video" || mediaItem.type === "audio" || mediaItem.type === "song";

  // --- Action Handlers ---
  const handlePlay = () => {
    play(mediaItem);
    onClose();
  };

  const handleOpenPlaylistSelector = () => {
    setIsPlaylistSelectorOpen(true);
  };

  const handleSaveToMemoryWall = async () => {
    const placeholderUserId = "user_123";
    await MemoryWallEngine.addMediaToMemoryWall(placeholderUserId, mediaItem.id);
    onClose();
  };

  const handleAddToCollection = async () => {
    const placeholderCollectionId = "col_default";
    await CollectionsEngine.addMediaToCollection(placeholderCollectionId, mediaItem.id);
    onClose();
  };

  const handleFeatureOnProfile = () => {
    console.log(`Featuring ${mediaItem.id} on profile...`);
    onClose();
  };

  const handleSubmitToRadio = () => {
    console.log(`Submitting ${mediaItem.id} to Stream & Win Radio...`);
    onClose();
  };

  const handleBroadcastLive = () => {
    console.log(`Queueing ${mediaItem.id} for live broadcast...`);
    onClose();
  };

  // ... other handlers for Share, Download, Edit, Delete

  // This would be dynamically generated based on media type and user role/permissions
  const actions: Action[] = [
    // Playback
    ...(isPlayable ? [{ label: "Play", icon: "▶️", action: handlePlay, section: "playback" as const }] : []),
    // Organize
    { label: "Add to Playlist...", icon: "🎵", action: handleOpenPlaylistSelector, section: "organize" as const },
    { label: "Save to Memory Wall", icon: "🧠", action: handleSaveToMemoryWall, section: "organize" as const },
    { label: "Add to Collection", icon: "📚", action: handleAddToCollection, section: "organize" as const },
    { label: "Feature on Profile", icon: "⭐", action: handleFeatureOnProfile, section: "organize" as const },
    // Broadcast
    { label: "Submit to Stream & Win", icon: "📻", action: handleSubmitToRadio, section: "broadcast" as const },
    { label: "Broadcast in Live Room", icon: "📡", action: handleBroadcastLive, section: "broadcast" as const },
    // Share
    { label: "Share", icon: "🔗", action: () => console.log("Share"), section: "share" as const },
    { label: "Copy Link", icon: "📋", action: () => console.log("Copy Link"), section: "share" as const },
    { label: "Download", icon: "💾", action: () => console.log("Download"), section: "share" as const },
    // Manage
    { label: "Edit", icon: "✏️", action: () => console.log("Edit"), section: "manage" as const },
    { label: "Delete", icon: "🗑️", action: () => console.log("Delete"), section: "manage" as const },
  ];

  const renderSection = (section: Action["section"]) => (
    <div style={{ marginBottom: "8px" }}>
      {actions
        .filter((a) => a.section === section)
        .map((action) => (
          <button key={action.label} onClick={action.action} style={buttonStyle}>
            <span style={{ marginRight: "12px", fontSize: "16px" }}>{action.icon}</span>
            {action.label}
          </button>
        ))}
    </div>
  );

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: "16px", borderBottom: "1px solid #333", display: 'flex', alignItems: 'center' }}>
            {mediaItem.thumbnailUrl && <img src={mediaItem.thumbnailUrl} alt={mediaItem.title} width={40} height={40} style={{borderRadius: 4}}/>}
            <div style={{marginLeft: 12}}>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>{mediaItem.title}</h3>
                <p style={{ margin: 0, fontSize: "12px", color: '#888' }}>{mediaItem.artist || 'Unknown Artist'}</p>
            </div>
        </div>
        <div style={{ padding: "16px" }}>
          {renderSection("playback")}
          {renderSection("broadcast")}
          {renderSection("organize")}
          {renderSection("share")}
          {renderSection("manage")}
        </div>
      </div>
    </div>
  );
}

const modalOverlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0, 0, 0, 0.7)",
  backdropFilter: "blur(5px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 2000,
};

const modalContentStyle: React.CSSProperties = {
  background: "#111118",
  border: "1px solid #333",
  borderRadius: "12px",
  width: "100%",
  maxWidth: "380px",
  color: "white",
  fontFamily: "sans-serif",
  boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
};

const buttonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  width: "100%",
  background: "none",
  border: "none",
  color: "#E0E0E0",
  padding: "12px",
  textAlign: "left",
  fontSize: "14px",
  cursor: "pointer",
  borderRadius: "6px",
  transition: "background-color 0.2s",
};

// Add a hover effect using a style element for simplicity in this context
const hoverStyle = `
  button:hover {
    background-color: #222228 !important;
  }
`;

// A simple component to inject the hover style
function StyleInjector() {
    return <style>{hoverStyle}</style>
}

// We need to wrap the export to include the style injector
export const UniversalActionMenuWithStyles: React.FC<UniversalActionMenuProps> = (props) => (
    <>
        <StyleInjector />
        <UniversalActionMenu {...props} />
    </>
);