"use client";

/**
 * MemoryWallCanister — Rule 15 canonical canister.
 * Wraps the media/MemoryWall component (entityId/entityType API).
 * Embeds on any surface: profiles, articles, live rooms.
 */

import MemoryWall from "@/components/media/MemoryWall";

interface MemoryWallCanisterProps {
  /** Slug / userId for the entity whose wall this is. */
  entityId: string;
  entityType: "performer" | "fan" | "venue" | "sponsor" | "room" | "article";
  title?: string;
  accentColor?: string;
}

export function MemoryWallCanister({
  entityId,
  entityType,
  title,
  accentColor = "#FF2DAA",
}: MemoryWallCanisterProps) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.015)",
      border: `1px solid ${accentColor}22`,
      borderRadius: 14,
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "12px 18px",
        borderBottom: `1px solid ${accentColor}18`,
      }}>
        <div style={{ fontSize: 9, letterSpacing: "0.3em", color: accentColor, fontWeight: 800 }}>
          📸 MEMORY WALL {title ? `— ${title.toUpperCase()}` : ""}
        </div>
      </div>

      {/* MemoryWall handles fetching, upload, and display internally */}
      <div style={{ padding: "12px 18px" }}>
        <MemoryWall
          entityId={entityId}
          entityType={entityType}
          accentColor={accentColor}
          title={title ?? "MEMORY WALL"}
        />
      </div>
    </div>
  );
}

export default MemoryWallCanister;
