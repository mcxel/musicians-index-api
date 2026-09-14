"use client";

/**
 * Sponsor Hub workspace — chrome via hub/sponsor/layout.tsx.
 */

import SponsorHubShell from "@/components/sponsor/SponsorHubShell";
import LiveMediaWall from "@/components/media/LiveMediaWall";
import NeonWaveUnderlay from "@/components/atmosphere/NeonWaveUnderlay";
import DiscoveryRail from "@/components/discovery/DiscoveryRail";
import MediaMonitor from "@/components/video/MediaMonitor";

export default function SponsorHubPage() {
  return (
    <div style={{ position: "relative", minHeight: "100%" }}>
      <NeonWaveUnderlay colorA="#FFD700" colorB="#AA2DFF" colorC="#FF2DAA" opacity={0.07} zIndex={0} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <SponsorHubShell />
        <div style={{ maxWidth: 1300, margin: "0 auto", padding: "0 16px 40px", display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              borderRadius: 16,
              overflow: "hidden",
              border: "1px solid rgba(255,215,0,0.28)",
              background: "#000",
              minHeight: 200,
              position: "relative",
            }}
          >
            <div
              style={{
                padding: "8px 14px",
                borderBottom: "1px solid rgba(255,215,0,0.2)",
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: "0.16em",
                color: "#FFD700",
              }}
            >
              MEDIA · SPONSORSHIP PREVIEW
            </div>
            <div style={{ height: 180, position: "relative" }}>
              <MediaMonitor mode="standby" isActive={false} />
            </div>
          </div>
          <DiscoveryRail type="performers" limit={6} accentColor="#FFD700" label="DISCOVER ARTISTS TO SPONSOR" />
          <DiscoveryRail type="venues" limit={4} accentColor="#00FFFF" label="EVENT & VENUE OPPORTUNITIES" />
          <LiveMediaWall
            roomId="sponsor-battles"
            title="SPONSORED LIVE BATTLES"
            mode="billboard"
            nodeCount={6}
            accentColor="#FFD700"
            enterHref="/battles/live"
            compact={false}
          />
        </div>
      </div>
    </div>
  );
}
