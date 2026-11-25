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
        {navigationRail ? (
          <div
            data-hub-navigation-lane
            style={{
              alignSelf: "flex-start",
              position: "sticky",
              top: 96,
              height: "calc(100dvh - 96px)",
              maxHeight: "calc(100dvh - 96px)",
              overflow: "hidden",
              minHeight: 0,
              flexShrink: 0,
            }}
          >
            {navigationRail}
          </div>
        ) : null}
        <div
          data-canonical-media-column
          style={{
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            width: "100%",
            maxWidth: "100%",
            flex: "1 1 0%",
          }}
        >
          {/* MEDIA workspace — primary visual region (§20995) */}
          {mediaStage}
          {sessionStrip}
          {experienceStrip}
          {/* OPERATIONS / WORK — document-flow region BELOW monitors; never overlay */}
          <div
            data-hub-operations-work-region="1"
            data-operations-deck="work"
            style={{
              flex: "0 0 auto",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              minWidth: 0,
              position: "relative",
              zIndex: 2,
            }}
          >
            {mediaDock}
            {quickTools}
            {playlistBand}
            {identityQrStrip}
            {bottomDrawer}
            {/* Panel drawers share the same media-column anchor as the rolodex WORK host */}
            {drawer}
          </div>
        </div>
        {communicationsRail}
      </div>
      {monetization}
    </div>
  );
}
