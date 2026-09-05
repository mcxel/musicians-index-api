"use client";

/**
 * CanonicalCommandCenterFrame — shared Fan + Performer hub layout (Slice 1).
 * TOP: account header (parent) · CENTER: media · PRIMARY STRIP · QUICK TOOLS · drawers
 * No legacy side rails — capabilities live in quick tools + canonical workspace hosts.
 */

import React from "react";

export interface CanonicalCommandCenterFrameProps {
  role: "fan" | "performer";
  mediaStage: React.ReactNode;
  sessionStrip: React.ReactNode;
  experienceStrip?: React.ReactNode;
  mediaDock: React.ReactNode;
  quickTools?: React.ReactNode;
  playlistBand?: React.ReactNode;
  bottomDrawer?: React.ReactNode;
  monetization?: React.ReactNode;
  drawer?: React.ReactNode;
}

export default function CanonicalCommandCenterFrame({
  role,
  mediaStage,
  sessionStrip,
  experienceStrip,
  mediaDock,
  quickTools,
  playlistBand,
  bottomDrawer,
  monetization,
  drawer,
}: CanonicalCommandCenterFrameProps) {
  return (
    <div
      data-canonical-command-center-frame
      data-shell-role={role}
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        width: "100%",
      }}
    >
      <div
        data-canonical-media-column
        style={{
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          flex: 1,
        }}
      >
        {mediaStage}
        {sessionStrip}
        {experienceStrip}
        {mediaDock}
        {quickTools}
        {playlistBand}
        {bottomDrawer}
      </div>
      {drawer}
      {monetization}
    </div>
  );
}
