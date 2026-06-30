"use client";

import { useState } from "react";
import { MediaItem, MediaType } from "@/lib/media/media";

interface UniversalSaveModalProps {
  mediaItem: MediaItem;
  onClose: () => void;
  // These would be hooks to the actual engines
  // onSaveToMemoryWall: (mediaId: string) => Promise<void>;
  // onAddToPlaylist: (mediaItem: MediaItem) => Promise<void>;
  // onPublish: (mediaId: string) => Promise<void>;
}

/**
 * This modal appears after a recording or when a user wants to save any media.
 * It provides consistent options based on the media type.
 */
export function UniversalSaveModal({
  mediaItem,
  onClose,
}: UniversalSaveModalProps) {
  const [isSaving, setIsSaving] = useState(false);

  const canBeInPlaylist =
    mediaItem.type === "video" || mediaItem.type === "audio";

  const handleSaveToMemoryWall = async () => {
    setIsSaving(true);
    // await onSaveToMemoryWall(mediaItem.id);
    console.log(`[SaveModal] Saved ${mediaItem.id} to Memory Wall.`);
    setIsSaving(false);
    onClose();
  };

  const handleAddToPlaylist = async () => {
    setIsSaving(true);
    // await onAddToPlaylist(mediaItem);
    console.log(`[SaveModal] Added ${mediaItem.id} to Playlist.`);
    setIsSaving(false);
    onClose();
  };

  // In a real implementation, this would render buttons for each action.
  // This is a conceptual placeholder.
  return <div></div>;
}