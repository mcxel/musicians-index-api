"use client";

/**
 * MemoryWallCanister — Phase 5.4 High-Fidelity Cyberpunk Memory Vault (Image 2 & 4 Style)
 * Glassmorphic Motion Gallery Deck:
 *   - Cyberpunk Vault Header with Memory Badges & Filter Pills
 *   - Motion Gallery Grid fed by MemoryWallMotionGrid (SoT)
 *   - Highlight Vault metrics (Saved Clips, Concert Photos, Battle Victories)
 */

import { useState, type CSSProperties } from "react";
import MemoryWallMotionGrid from "@/components/memory/MemoryWallMotionGrid";

interface MemoryWallCanisterProps {
  entityId: string;
  entityType: "performer" | "fan" | "venue" | "sponsor" | "room" | "article";
  title?: string;
  accentColor?: string;
  useSessionOwner?: boolean;
}

const MEMORY_CATEGORIES = ["ALL MEMORIES", "CONCERT CLIPS", "BATTLE VICTORIES", "FAN MOMENTS", "BEHIND THE SCENES"];

export function MemoryWallCanister({
  entityId,
  entityType,
  title,
  accentColor = "#FF2DAA",
  useSessionOwner = false,
}: MemoryWallCanisterProps) {
  const [activeTab, setActiveTab] = useState("ALL MEMORIES");

  const ownerId =
    useSessionOwner || entityType === "room" || entityType === "article"
      ? undefined
      : entityId;

  return (
    <div
      style={{
        background: "rgba(5,3,16,0.92)",
        border: `1.5px solid ${accentColor}`,
        borderRadius: 14,
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        color: "#fff",
        fontFamily: "'Inter', sans-serif",
        boxShadow: `0 0 25px ${accentColor}33`,
      }}
    >
      {/* Cyberpunk Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: 10,
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: `linear-gradient(135deg, ${accentColor}, #00FFFF)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
            }}
          >
            📸
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.14em", color: accentColor }}>
              MEMORY VAULT & MOTION GALLERY {title ? `— ${title.toUpperCase()}` : ""}
            </div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
              High-resolution concert recordings, live screenshots, and victory moments
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div style={{ display: "flex", gap: 6, overflowX: "auto" }}>
          {MEMORY_CATEGORIES.map((cat) => {
            const isActive = activeTab === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveTab(cat)}
                style={{
                  fontSize: 8,
                  fontWeight: 900,
                  letterSpacing: "0.08em",
                  padding: "4px 8px",
                  borderRadius: 6,
                  border: isActive ? `1px solid ${accentColor}` : "1px solid rgba(255,255,255,0.12)",
                  background: isActive ? `${accentColor}20` : "transparent",
                  color: isActive ? accentColor : "rgba(255,255,255,0.5)",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Gallery Area */}
      <div
        style={{
          background: "rgba(10,5,25,0.6)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 12,
          padding: 14,
        }}
      >
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
