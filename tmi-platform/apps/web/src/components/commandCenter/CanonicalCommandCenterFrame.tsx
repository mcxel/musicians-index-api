"use client";

/**
 * CanonicalCommandCenterFrame — shared Fan + Performer hub layout (Slice 1).
 * TOP: account header (parent) · LEFT: HubNavigationRail · CENTER: media column · RIGHT: HubCommunicationsRail
 * Desktop: monitors primary + left nav + messaging rail. Mobile keeps TopNav → messaging drawer.
 */

import React from "react";

export interface CanonicalCommandCenterFrameProps {
  role: "fan" | "performer";
  /** Desktop left operating-center navigation (omit on mobile). */
  navigationRail?: React.ReactNode;
  mediaStage: React.ReactNode;
  sessionStrip: React.ReactNode;
  experienceStrip?: React.ReactNode;
  mediaDock: React.ReactNode;
  quickTools?: React.ReactNode;
  playlistBand?: React.ReactNode;
  identityQrStrip?: React.ReactNode;
  bottomDrawer?: React.ReactNode;
  monetization?: React.ReactNode;
  drawer?: React.ReactNode;
  /** Desktop-only messaging/community rail (Fan + Performer). Omit on mobile. */
  communicationsRail?: React.ReactNode;
}

export default function CanonicalCommandCenterFrame({
  role,
  navigationRail,
  mediaStage,
  sessionStrip,
  experienceStrip,
  mediaDock,
  quickTools,
  playlistBand,
  identityQrStrip,
  bottomDrawer,
  monetization,
  drawer,
  communicationsRail,
}: CanonicalCommandCenterFrameProps) {
  return (
    <div
      data-canonical-command-center-frame
      data-shell-role={role}
      data-hub-comms-layout={communicationsRail ? "rail" : "none"}
      data-hub-nav-layout={navigationRail ? "left-rail" : "none"}
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        width: "100%",
      }}
    >
      <div
        data-hub-primary-workspace-row
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "row",
          alignItems: "stretch",
          minWidth: 0,
          minHeight: 0,
        }}
      >
        {navigationRail}
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
          {identityQrStrip}
          {bottomDrawer}
        </div>
        {communicationsRail}
      </div>
      {drawer}
      {monetization}
    </div>
  );
}
