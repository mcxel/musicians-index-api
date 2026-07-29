"use client";

/**
 * Memory Wall drawer — Phase 7.4
 * Binds to MemoryWallMotionGrid / collectibles API (real media or honest empty).
 * Removes fake gradient placeholder cards (Rule 20).
 */

import MemoryWallMotionGrid from "@/components/memory/MemoryWallMotionGrid";

export interface MemoryWallPanelOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  ownerId?: string;
}

export default function MemoryWallPanelOverlay({
  isOpen,
  onClose,
  ownerId,
}: MemoryWallPanelOverlayProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        right: 360,
        bottom: 110,
        zIndex: 9500,
        width: 340,
        maxHeight: "70vh",
        overflow: "auto",
        background: "rgba(10, 10, 26, 0.95)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(0, 229, 255, 0.35)",
        borderRadius: 16,
        padding: 18,
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 229, 255, 0.2)",
        color: "#fff",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <h3
          style={{
            fontSize: 13,
            fontWeight: 900,
            letterSpacing: "0.12em",
            color: "#fff",
            margin: 0,
          }}
        >
          MEMORY WALL
        </h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Memory Wall"
          style={{
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.5)",
            fontSize: 16,
            cursor: "pointer",
            padding: "2px 6px",
          }}
        >
          ✕
        </button>
      </div>

      <MemoryWallMotionGrid
        ownerId={ownerId}
        accentColor="#00E5FF"
        title="YOUR MEMORIES"
        compact
        take={40}
      />

      <button
        type="button"
        onClick={onClose}
        style={{
          width: "100%",
          marginTop: 14,
          padding: "12px 0",
          borderRadius: 10,
          background: "linear-gradient(135deg,#00E5FF,#AA2DFF)",
          border: "none",
          color: "#000",
          fontSize: 11,
          fontWeight: 900,
          letterSpacing: "0.1em",
          cursor: "pointer",
          boxShadow: "0 0 20px rgba(0,229,255,0.4)",
        }}
      >
        CLOSE
      </button>
    </div>
  );
}
