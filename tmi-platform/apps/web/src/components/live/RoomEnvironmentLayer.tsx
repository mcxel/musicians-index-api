"use client";

/**
 * RoomEnvironmentLayer
 *
 * Renders the layered visual environment for any TMI room using VenueAsset
 * data from VenueAssetRegistry as the canonical art-direction source.
 *
 * This is the single automated venue builder. Every room page wraps itself in
 * this pipeline layer which automatically resolves the background video loop,
 * lighting profile, audience layout, sponsor rail, and hosts.
 */

import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getVenueAsset, type VenueType } from "@/lib/venues/VenueAssetRegistry";
import RoomBackground from "@/components/environment/RoomBackground";
import VenueLighting from "@/components/environment/VenueLighting";
import AudienceSeating from "@/components/environment/AudienceSeating";
import SponsorBannerRail from "@/components/environment/SponsorBannerRail";
import HostPresenter from "@/components/environment/HostPresenter";

interface RoomEnvironmentLayerProps {
  venueType: VenueType;
  /** mode controls which perspective video plays */
  mode?: "ambient" | "audience" | "performer";
  /** Overlaid content (performers, HUD, chat rail, etc.) */
  children?: React.ReactNode;
  /** 0–1 energy level — drives light pulse intensity */
  energyLevel?: number;
  /** Show sponsor panel overlays */
  showSponsorZones?: boolean;
  /** Banner override — defaults to venue's bannerUrl */
  bannerOverrideUrl?: string;
  className?: string;
  style?: React.CSSProperties;
}

function mapAudienceLayout(layout: string) {
  switch (layout) {
    case "stadium-bowl":
      return "circle";
    case "theater-rows":
      return "rows";
    case "circle-pit":
      return "surrounding";
    case "floor-standing":
    case "lounge-tables":
      return "pods";
    default:
      return "rows";
  }
}

export default function RoomEnvironmentLayer({
  venueType,
  mode = "ambient",
  children,
  energyLevel = 0.5,
  showSponsorZones = false,
  bannerOverrideUrl,
  className = "",
  style,
}: RoomEnvironmentLayerProps) {
  const asset = getVenueAsset(venueType);
  
  if (!asset) {
    return (
      <div style={{ color: "#ff4444", padding: 20, background: "#000" }}>
        [Error: Venue type '{venueType}' not found in registry]
      </div>
    );
  }

  // Select correct video based on mode
  const videoUrl =
    mode === "audience" && asset.audienceViewVideoUrl
      ? asset.audienceViewVideoUrl
      : mode === "performer" && asset.performerViewVideoUrl
      ? asset.performerViewVideoUrl
      : asset.ambientVideoUrl;

  const bannerUrl = bannerOverrideUrl ?? asset.bannerUrl;
  const audienceLayout = mapAudienceLayout(asset.geometry.audienceLayout);

  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: 480,
        overflow: "hidden",
        background: "#050510",
        ...style,
      }}
    >
      {/* ── Layer 1: Ambient video loop ────────────────────────────────── */}
      <RoomBackground videoUrl={videoUrl} opacity={0.45} />

      {/* ── Layer 2: Floor reflection / gradient atmosphere ────────────── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          background: `
            radial-gradient(ellipse 80% 40% at 50% 100%, ${asset.accentColor}18 0%, transparent 70%),
            linear-gradient(to top, ${asset.accentColor}0a 0%, transparent 60%),
            linear-gradient(to bottom, #050510cc 0%, transparent 40%)
          `,
          pointerEvents: "none",
        }}
      />

      {/* ── Layer 3: Overhead lighting rig ────────────────────────────── */}
      <VenueLighting
        primaryColor={asset.accentColor}
        secondaryColor={asset.secondaryColor}
        intensity={energyLevel}
        strobe={energyLevel > 0.85}
      />

      {/* ── Layer 4: Audience Seating Layout ───────────────────────────── */}
      <AudienceSeating
        layout={audienceLayout}
        color={asset.accentColor}
        reaction={energyLevel > 0.75 ? "DANCING" : energyLevel > 0.4 ? "CHEERING" : "CLAPPING"}
      />

      {/* ── Layer 5: Sponsor banner rail (optional) ───────────────────── */}
      {showSponsorZones && (
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 6 }}>
          <SponsorBannerRail color={asset.secondaryColor} speed={25 - energyLevel * 10} />
        </div>
      )}

      {/* ── Layer 6: Floating Host Announcer Bubble ───────────────────── */}
      {asset.hosts.primaryHostId && (
        <div style={{ position: "absolute", top: 72, right: 16, zIndex: 7, pointerEvents: "auto" }}>
          <HostPresenter
            hostSlug={asset.hosts.primaryHostId}
            accentColor={asset.accentColor}
            mode="bubble-only"
          />
        </div>
      )}

      {/* ── Layer 7: Room Banner header ───────────────────────────────── */}
      {bannerUrl && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 56,
            zIndex: 8,
            overflow: "hidden",
            borderBottom: `1px solid ${asset.accentColor}33`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bannerUrl}
            alt={asset.label}
            style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.3 }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(to right, #050510ee, ${asset.accentColor}22, #050510ee)`,
              display: "flex",
              alignItems: "center",
              paddingLeft: 16,
              gap: 12,
            }}
          >
            <span
              style={{
                color: asset.accentColor,
                fontWeight: 900,
                fontSize: 13,
                letterSpacing: 2,
                textTransform: "uppercase",
                fontFamily: "monospace",
                textShadow: `0 0 10px ${asset.accentColor}`,
              }}
            >
              {asset.label}
            </span>
            <span style={{ color: "#64748b", fontSize: 11, fontFamily: "monospace" }}>
              {asset.tagline}
            </span>
          </div>
        </div>
      )}

      {/* ── Layer 8: Children (live content overlays) ────────────────── */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          height: "100%",
        }}
      >
        {children}
      </div>
    </div>
  );
}
