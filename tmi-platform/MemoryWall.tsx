"use client";

import { useState, useEffect, useCallback } from "react";
import { MemoryWallEngine } from "@/lib/media/MemoryWallEngine";
import { useModalStore } from "@/stores/modalStore";
import type { MediaItem, MemoryWallItem } from "@/lib/media/media";

interface MemoryWallProps {
  userId: string;
}

type PopulatedMemory = MemoryWallItem & { media: MediaItem };

/**
 * Renders a user's Memory Wall, including the UniversalUpload component
 * to add new memories. **Correction**: Upload is now decoupled. This component
 * will only display memories and provide a trigger to open the global upload UI.
 */
export function MemoryWall({ userId }: MemoryWallProps) {
  const [memories, setMemories] = useState<PopulatedMemory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const openModal = useModalStore((state) => state.openModal);

  const fetchMemories = useCallback(async () => {
    const userMemories = await MemoryWallEngine.getMemoryWallForUser(userId);
    setMemories(userMemories);
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchMemories();
  }, [fetchMemories]);

  const handleOpenUploadModal = () => {
    // This will be replaced by the global UniversalUpload modal flow.
    // For now, let's demonstrate opening the action menu on an existing memory.
    if (memories.length > 0) {
      openModal("universal-action-menu", { mediaItem: memories[0].media });
    } else {
      console.log("[MemoryWall] No memories to act on. Upload flow would be triggered here.");
    }
  };

  return (
    <div style={{ padding: "24px", background: "#0A0A0F", color: "white" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #333", paddingBottom: "16px", marginBottom: "24px" }}>
        <h2>Memory Wall</h2>
        <button onClick={handleOpenUploadModal} style={{ background: "#00C8FF", color: "#050510", border: "none", padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
          + Add Memory
        </button>
      </div>

      {/* The UniversalUpload component is no longer rendered here. */}

      {/* Display Memories */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "16px",
        }}
      >
        {isLoading && <p>Loading memories...</p>}
        {memories.map((memory) => (
          <div key={memory.id} style={{ border: "1px solid #333", borderRadius: "8px", overflow: "hidden" }}>
            <img
              src={memory.media.sourceUrl}
              alt={memory.caption || memory.media.title}
              style={{ width: "100%", height: "150px", objectFit: "cover" }}
            />
            <p style={{ padding: "8px", margin: 0, fontSize: "14px" }}>{memory.caption || memory.media.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}