"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useWorkspacePresentationStore } from "@/lib/workspace/universal/WorkspacePresentationRuntime";
import PlaylistStudioContent from "./PlaylistStudioContent";
import SettingsWorkspaceContent from "./SettingsWorkspaceContent";
import UniversalWorkspaceStubContent from "./UniversalWorkspaceStubContent";

const FanAvatarCanister = dynamic(() => import("@/components/avatar/FanAvatarCanister"), { ssr: false });

export default function CanonicalBottomDrawerHost({
  userId,
  displayName,
  role,
}: {
  userId?: string;
  displayName?: string;
  role: "fan" | "performer";
}) {
  const { drawerWorkspace, isDrawerExpanded, closeSurface, toggleDrawerExpand } =
    useWorkspacePresentationStore();

  if (!drawerWorkspace || !isDrawerExpanded) return null;

  const uid = userId ?? "session";
  const name = displayName ?? "Member";

  return (
    <div
      data-canonical-bottom-drawer
      style={{
        width: "100%",
        marginTop: 8,
        background: "rgba(6, 9, 24, 0.98)",
        border: "1px solid rgba(0, 229, 255, 0.3)",
        borderRadius: "16px 16px 0 0",
        boxShadow: "0 -10px 40px rgba(0,0,0,0.85), inset 0 1px 0 rgba(0,229,255,0.2)",
        overflow: "hidden",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
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
          <span
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 11,
              fontWeight: 900,
              color: "#FFD700",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            WORK · {drawerWorkspace.replace(/-/g, " ")}
          </span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={toggleDrawerExpand}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 4,
              color: "#fff",
              fontSize: 9,
              padding: "2px 8px",
              cursor: "pointer",
            }}
          >
            {isDrawerExpanded ? "COLLAPSE" : "EXPAND"}
          </button>
          <button
            type="button"
            onClick={() => closeSurface("DRAWER")}
            style={{
              background: "transparent",
              border: "none",
              color: "rgba(255,255,255,0.5)",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>
      </div>

      <div style={{ padding: 16, minHeight: 280, maxHeight: "45vh", overflowY: "auto" }}>
        {drawerWorkspace === "playlist-studio" ? (
          <PlaylistStudioContent userId={uid} context={{}} />
        ) : drawerWorkspace === "settings" ? (
          <SettingsWorkspaceContent userId={uid} displayName={name} />
        ) : drawerWorkspace === "inventory" && role === "fan" ? (
          <FanAvatarCanister userId={uid} displayName={name} role="FAN" />
        ) : (
          <UniversalWorkspaceStubContent
            workspaceId={drawerWorkspace}
            role={role}
            userId={uid}
            displayName={name}
          />
        )}
      </div>
    </div>
  );
}
