"use client";

/**
 * AvatarCreationCenter — Rule 15 canonical canister.
 * Wraps the existing AvatarCreator component.
 * Entry point for face-scan / builder workflow.
 * Accessible from any profile or lobby.
 */

import { AvatarCreator } from "@/components/AvatarCreator";

interface AvatarCreationCenterProps {
  accentColor?: string;
}

export function AvatarCreationCenter({ accentColor = "#AA2DFF" }: AvatarCreationCenterProps) {
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
          👤 AVATAR CREATION CENTER
        </div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 3 }}>
          Create or update your bobblehead avatar — it follows you everywhere.
        </div>
      </div>

      {/* AvatarCreator is the existing source implementation */}
      <div style={{ padding: "14px 18px" }}>
        <AvatarCreator />
      </div>
    </div>
  );
}

export default AvatarCreationCenter;
