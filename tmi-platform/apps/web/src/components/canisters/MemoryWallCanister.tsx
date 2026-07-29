"use client";

/**
 * MemoryWallCanister — Rule 15 canonical canister.
 * Phase 7.4: primary surface is MemoryWallMotionGrid fed by
 * GET /api/memory/collectibles (MemoryCollectible SoT).
 * Never uses MemoryLedger competition events as the gallery feed.
 */

import MemoryWallMotionGrid from "@/components/memory/MemoryWallMotionGrid";

interface MemoryWallCanisterProps {
  /** UserId for collectibles owner. Falls back to session when omitted. */
  entityId: string;
  entityType: "performer" | "fan" | "venue" | "sponsor" | "room" | "article";
  title?: string;
  accentColor?: string;
  /** When true, omit ownerId query and use session cookie only. */
  useSessionOwner?: boolean;
}

export function MemoryWallCanister({
  entityId,
  entityType,
  title,
  accentColor = "#FF2DAA",
  useSessionOwner = false,
}: MemoryWallCanisterProps) {
  // Fan/performer entityId is typically the userId; rooms/articles use session owner.
  const ownerId =
    useSessionOwner || entityType === "room" || entityType === "article"
      ? undefined
      : entityId;

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.015)",
        border: `1px solid ${accentColor}22`,
        borderRadius: 14,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "12px 18px",
          borderBottom: `1px solid ${accentColor}18`,
        }}
      >
        <div
          style={{
            fontSize: 9,
            letterSpacing: "0.3em",
            color: accentColor,
            fontWeight: 800,
          }}
        >
          📸 MEMORY WALL {title ? `— ${title.toUpperCase()}` : ""}
        </div>
      </div>

      <div style={{ padding: "12px 18px" }}>
        <MemoryWallMotionGrid
          ownerId={ownerId}
          accentColor={accentColor}
          title={title ?? "MEMORY WALL"}
        />
      </div>
    </div>
  );
}

export default MemoryWallCanister;
