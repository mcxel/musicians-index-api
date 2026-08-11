"use client";

import React from "react";
import { useWorkspacePresentationStore } from "@/lib/workspace/universal/WorkspacePresentationRuntime";
import PlaylistStudioContent from "./PlaylistStudioContent";
import UniversalWorkspaceStubContent from "./UniversalWorkspaceStubContent";

export default function CanonicalBottomDrawerHost({
  userId,
  displayName,
}: {
  userId?: string;
  displayName?: string;
}) {
  const { drawerWorkspace, isDrawerExpanded, closeSurface, toggleDrawerExpand } =
    useWorkspacePresentationStore();

  if (!drawerWorkspace || !isDrawerExpanded) return null;

  return (
    <div
      style={{
        width: "100%",
        marginTop: 16,
        background: "rgba(6, 9, 24, 0.98)",
        border: "1px solid rgba(0, 229, 255, 0.3)",
        borderRadius: "16px 16px 0 0",
        boxShadow: "0 -10px 40px rgba(0,0,0,0.85), inset 0 1px 0 rgba(0,229,255,0.2)",
        overflow: "hidden",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {/* Drawer Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 16px",
          background: "rgba(10, 16, 38, 0.9)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "#00FFFF", fontSize: 12 }}>▾</span>
          <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 11, fontWeight: 900, color: "#FFD700", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            RESERVED BOTTOM DRAWER WORKSPACE · {drawerWorkspace.toUpperCase()}
          </span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={toggleDrawerExpand}
            style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 4, color: "#fff", fontSize: 9, padding: "2px 8px", cursor: "pointer" }}
          >
            {isDrawerExpanded ? "COLLAPSE" : "EXPAND"}
          </button>
          <button
            type="button"
            onClick={() => closeSurface("DRAWER")}
            style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 14, cursor: "pointer" }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Drawer Content */}
      <div style={{ padding: 16, minHeight: 320 }}>
        {drawerWorkspace === "playlist-studio" ? (
          <PlaylistStudioContent userId={userId} context={{}} />
        ) : (
          <UniversalWorkspaceStubContent
            workspaceId={drawerWorkspace}
            role="fan"
            userId={userId ?? "session"}
            displayName={displayName ?? "Member"}
          />
        )}
      </div>
    </div>
  );
}
