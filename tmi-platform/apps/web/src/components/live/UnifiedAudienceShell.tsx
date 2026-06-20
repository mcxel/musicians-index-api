"use client";

/**
 * UnifiedAudienceShell — P0 slice of the "Unified Audience Shell" direction
 * (locked 2026-06-19): the live room must stay active at the center while
 * Messages/Playlist/Memory Wall/Avatar/Inventory/Rooms open as docked
 * overlays instead of separate routes. This wraps EXISTING real engines —
 * OmniPresenceEngine (messages), PlaylistArtifact, MemoryWall,
 * AvatarWorkspaceCanister, InventoryPanel, RecentlyVisitedRail — it does not
 * introduce a new messaging/playlist/inventory system.
 *
 * Deliberately NOT attempted here (no backing system exists yet, per Rule 18's
 * documented bobblehead-pipeline gap): avatar idle motion (blink/breathe/sway),
 * adaptive 4K render-quality tiers, 3D venue parallax/bloom. Those require
 * dedicated builds, not assembly of what's already in the repo.
 */

import { useState } from "react";
import OmniPresenceEngine from "@/components/presence/OmniPresenceEngine";
import PlaylistArtifact from "@/components/artifacts/PlaylistArtifact";
import MemoryWall from "@/components/media/MemoryWall";
import { AvatarWorkspaceCanister } from "@/components/canisters/AvatarWorkspaceCanister";
import { InventoryPanel } from "@/components/InventoryPanel";
import RecentlyVisitedRail from "@/components/presence/RecentlyVisitedRail";

type DockId = "messages" | "playlist" | "memory" | "avatar" | "inventory" | "rooms";

interface DockDef {
  id: DockId;
  icon: string;
  label: string;
}

const DOCKS: DockDef[] = [
  { id: "messages",  icon: "💬", label: "Messages" },
  { id: "playlist",  icon: "🎵", label: "Playlist" },
  { id: "memory",    icon: "🧠", label: "Memory Wall" },
  { id: "avatar",    icon: "👤", label: "Avatar" },
  { id: "inventory", icon: "📦", label: "Inventory" },
  { id: "rooms",     icon: "🌐", label: "Rooms" },
];

const CYAN = "#00FFFF";
const FUCHSIA = "#FF2DAA";
const GOLD = "#FFD700";
const PURPLE = "#AA2DFF";

interface UnifiedAudienceShellProps {
  roomId: string;
  userId: string;
  accentColor?: string;
}

export default function UnifiedAudienceShell({ roomId, userId, accentColor = CYAN }: UnifiedAudienceShellProps) {
  const [openDock, setOpenDock] = useState<DockId | null>(null);

  return (
    <>
      {/* Dock bar — fixed, always reachable, never blocks the stage */}
      <div
        style={{
          position: "fixed",
          bottom: 18,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 60,
          display: "flex",
          gap: 8,
          padding: "8px 10px",
          borderRadius: 16,
          background: "rgba(5,5,16,0.85)",
          backdropFilter: "blur(10px)",
          border: `1px solid ${accentColor}33`,
          boxShadow: `0 0 24px rgba(0,0,0,0.5)`,
        }}
      >
        {DOCKS.map((dock) => {
          const active = openDock === dock.id;
          return (
            <button
              key={dock.id}
              onClick={() => setOpenDock(active ? null : dock.id)}
              title={dock.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                padding: "6px 10px",
                borderRadius: 10,
                border: active ? `1px solid ${accentColor}88` : "1px solid rgba(255,255,255,0.08)",
                background: active ? `${accentColor}1a` : "rgba(255,255,255,0.03)",
                cursor: "pointer",
                color: active ? accentColor : "rgba(255,255,255,0.6)",
              }}
            >
              <span style={{ fontSize: 17 }}>{dock.icon}</span>
              <span style={{ fontSize: 7, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>{dock.label}</span>
            </button>
          );
        })}
      </div>

      {/* Overlay panel — slides up, never navigates away from the room */}
      {openDock && (
        <div
          style={{
            position: "fixed",
            bottom: 78,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 59,
            width: "min(420px, calc(100vw - 32px))",
            maxHeight: "min(560px, calc(100vh - 140px))",
            overflowY: "auto",
            borderRadius: 14,
            background: "rgba(8,8,20,0.97)",
            border: `1px solid ${accentColor}44`,
            boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
            padding: 14,
            animation: "audienceShellPop 0.18s ease-out",
          }}
        >
          <style>{`@keyframes audienceShellPop { from { opacity: 0; transform: translate(-50%, 8px); } to { opacity: 1; transform: translate(-50%, 0); } }`}</style>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.16em", color: accentColor, textTransform: "uppercase" }}>
              {DOCKS.find((d) => d.id === openDock)?.label}
            </span>
            <button
              onClick={() => setOpenDock(null)}
              style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 14 }}
            >
              ✕
            </button>
          </div>

          {openDock === "messages" && (
            <OmniPresenceEngine slug={userId} displayName="You" defaultTab="messages" />
          )}
          {openDock === "playlist" && (
            <PlaylistArtifact artifactId={`room-${roomId}-playlist`} title="Room Playlist" />
          )}
          {openDock === "memory" && (
            <MemoryWall entityId={roomId} entityType="liveRoom" accentColor={FUCHSIA} title="Room Memory Wall" />
          )}
          {openDock === "avatar" && (
            <AvatarWorkspaceCanister accentColor={PURPLE} />
          )}
          {openDock === "inventory" && (
            <InventoryPanel />
          )}
          {openDock === "rooms" && (
            <>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>
                One-click return to rooms you've visited:
              </div>
              <RecentlyVisitedRail />
            </>
          )}
        </div>
      )}
    </>
  );
}
