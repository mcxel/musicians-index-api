"use client";

/**
 * Venue Hub workspace — chrome via hub/venue/layout.tsx (covers analytics/network subroutes).
 */

import Link from "next/link";
import VenueHubShell from "@/components/venue/VenueHubShell";
import LiveMediaWall from "@/components/media/LiveMediaWall";
import NeonWaveUnderlay from "@/components/atmosphere/NeonWaveUnderlay";
import MediaMonitor from "@/components/video/MediaMonitor";

export default function VenueHubPage() {
  return (
      <div style={{ position: "relative", minHeight: "100%" }}>
        <NeonWaveUnderlay colorA="#22c55e" colorB="#00FFFF" colorC="#FFD700" opacity={0.07} zIndex={0} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <VenueHubShell />

          <div style={{ maxWidth: 1300, margin: "0 auto", padding: "16px 16px 0" }}>
            <div
              style={{
                background: "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(0,255,255,0.05))",
                border: "1.5px solid rgba(34,197,94,0.25)",
                borderRadius: 14,
                padding: "16px 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div>
                <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#22c55e", fontWeight: 800, marginBottom: 4 }}>
                  📣 PROMOTE YOUR EVENTS
                </div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>Drive ticket sales with targeted event campaigns</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>
                  Select an event from your dashboard to launch a promotion campaign.
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0, flexWrap: "wrap" }}>
                <Link
                  href="/promoter/events"
                  style={{
                    padding: "10px 18px",
                    background: "linear-gradient(90deg,#22c55e,#00FFFF)",
                    borderRadius: 8,
                    color: "#050510",
                    fontWeight: 900,
                    fontSize: 12,
                    textDecoration: "none",
                    letterSpacing: "0.08em",
                  }}
                >
                  PROMOTE EVENT
                </Link>
                <Link
                  href="/venue/events"
                  style={{
                    padding: "10px 16px",
                    background: "rgba(34,197,94,0.1)",
                    border: "1px solid rgba(34,197,94,0.3)",
                    borderRadius: 8,
                    color: "#22c55e",
                    fontWeight: 800,
                    fontSize: 12,
                    textDecoration: "none",
                  }}
                >
                  MY EVENTS
                </Link>
              </div>
            </div>
          </div>

          <div style={{ maxWidth: 1300, margin: "0 auto", padding: "16px 16px 40px", display: "flex", flexDirection: "column", gap: 20 }}>
            <div
              style={{
                borderRadius: 16,
                overflow: "hidden",
                border: "1px solid rgba(34,197,94,0.28)",
                background: "#000",
                minHeight: 200,
                position: "relative",
              }}
            >
              <div
                style={{
                  padding: "8px 14px",
                  borderBottom: "1px solid rgba(34,197,94,0.2)",
                  fontSize: 9,
                  fontWeight: 900,
                  letterSpacing: "0.16em",
                  color: "#22c55e",
                }}
              >
                MEDIA · VENUE PREVIEW
              </div>
              <div style={{ height: 180, position: "relative" }}>
                <MediaMonitor mode="standby" isActive={false} />
              </div>
            </div>
            <LiveMediaWall
              roomId="venue-hub"
              title="YOUR VENUE ROOMS — LIVE"
              mode="wall"
              nodeCount={6}
              accentColor="#22c55e"
              enterHref="/venue/rooms"
              compact={false}
            />
          </div>
        </div>
      </div>
  );
}
