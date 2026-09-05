"use client";

/**
 * RoomEnvironmentLayer
 *
 * Renders the layered visual environment for any TMI room using VenueAsset
 * data from VenueAssetRegistry as the canonical art-direction source.
 *
 * Layers (bottom to top, z-index order):
 *   1. Ambient video loop          — reference environment video (muted, loop)
 *   2. Floor reflection            — gradient shimmer
 *   3. LED wall panels             — neon glow strips at stage positions
 *   4. Ceiling lighting rig        — overhead light beams
 *   5. Sponsor panel zones         — positioned ad/sponsor areas
 *   6. Stage apron                 — front-of-stage elevated lip
 *   7. Children (performers, HUD)  — live content sits on top of environment
 *
 * This is NOT a full 3D renderer. It is the highest-fidelity CSS/Framer
 * Motion implementation possible without a Three.js/R3F build pipeline.
 * The geometry config from VenueAssetRegistry drives all positioning.
 *
 * When a real 3D renderer is added (Phase N), it slots in as a replacement
 * for layers 1–6 here — the API contract (venueType prop) stays the same.
 */

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getVenueAsset, type VenueType, type VenueAsset } from "@/lib/venues/VenueAssetRegistry";

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

// Map of lighting rig styles to CSS configurations
const RIG_CONFIG: Record<string, { beamColor: string; beamCount: number; beamSpread: string }> = {
  "arena-truss":   { beamColor: "#ffffff", beamCount: 8,  beamSpread: "20deg" },
  "theater-grid":  { beamColor: "#fff8e0", beamCount: 6,  beamSpread: "15deg" },
  "club-ceiling":  { beamColor: "#AA2DFF", beamCount: 12, beamSpread: "30deg" },
  "outdoor-rig":   { beamColor: "#ffffff", beamCount: 4,  beamSpread: "40deg" },
  "studio-grid":   { beamColor: "#fff0cc", beamCount: 10, beamSpread: "10deg" },
};

const LED_POSITIONS: Record<string, React.CSSProperties> = {
  "stage-back":  { bottom: "28%", left: "5%", right: "5%", height: "8%", borderRadius: "4px 4px 0 0" },
  "stage-left":  { bottom: "10%", left: "3%", width: "3%", top: "20%", borderRadius: "0 4px 4px 0" },
  "stage-right": { bottom: "10%", right: "3%", width: "3%", top: "20%", borderRadius: "4px 0 0 4px" },
  "ceiling":     { top: "0", left: "10%", right: "10%", height: "6%", borderRadius: "0 0 8px 8px" },
  "floor":       { bottom: "2%", left: "5%", right: "5%", height: "2%", borderRadius: "2px" },
};

const SPONSOR_ZONE_STYLES: Record<string, React.CSSProperties> = {
  "stage-apron":  { bottom: "26%", left: "10%", right: "10%", height: "3%", borderRadius: 4 },
  "side-rail":    { top: "30%", left: "1%", width: "4%", height: "40%", borderRadius: 4 },
  "entry-arch":   { top: "5%", left: "25%", right: "25%", height: "8%", borderRadius: "0 0 40% 40%" },
  "seat-back":    { bottom: "5%", left: "8%", right: "8%", height: "2.5%", borderRadius: 2 },
};

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
  const asset = getVenueAsset(venueType) ?? getVenueAsset("concert");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);

  // Select correct video based on mode (optional fields — never crash on missing views)
  const videoUrl =
    mode === "audience" && asset?.audienceViewVideoUrl
      ? asset.audienceViewVideoUrl
      : mode === "performer" && asset?.performerViewVideoUrl
      ? asset.performerViewVideoUrl
      : asset?.ambientVideoUrl;

  // THE VIDEO DESCRIBES THE WORLD. THE VIDEO DOES NOT BECOME THE WORLD.
  // Suppress background video rendering when: (a) role is REFERENCE_ONLY — blueprint
  // reference that must never be rendered; or (b) a canonical 3D world exists and
  // owns the visual — the real geometry takes precedence over a 2D video layer.
  const videoRole = asset?.ambientVideoRole ?? "FALLBACK_PREVIEW";
  // Only FALLBACK_PREVIEW may render as the room background layer.
  // AMBIENT_SURFACE and IN_WORLD_SCREEN belong on in-world surfaces, not here.
  const renderVideoLayer =
    videoRole === "FALLBACK_PREVIEW" &&
    !asset?.hasCanonical3DWorld;
  const rig = RIG_CONFIG[asset?.geometry?.lightingRig ?? ""] ?? RIG_CONFIG["studio-grid"];
  const bannerUrl = bannerOverrideUrl ?? asset?.bannerUrl;

  // Ensure video loops and plays muted
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !videoUrl) return;
    v.muted = true;
    v.loop = true;
    v.playsInline = true;
    v.play().catch(() => {/* autoplay blocked — video will be visible but paused */});
  }, [videoUrl]);

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
      {renderVideoLayer && (
      <video
        ref={videoRef}
        src={videoUrl}
        muted
        loop
        playsInline
        onCanPlay={() => setVideoReady(true)}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: videoReady ? 0.55 : 0,
          transition: "opacity 1.2s ease",
          zIndex: 1,
        }}
      />
      )}

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

      {/* ── Layer 3: LED wall panels ───────────────────────────────────── */}
      {asset.geometry.ledWalls.map((wall) => (
        <motion.div
          key={wall}
          style={{
            position: "absolute",
            zIndex: 3,
            background: `linear-gradient(90deg, ${asset.accentColor}00, ${asset.accentColor}66, ${asset.secondaryColor}44, ${asset.accentColor}00)`,
            boxShadow: `0 0 ${12 + energyLevel * 20}px ${energyLevel * 8}px ${asset.accentColor}55`,
            pointerEvents: "none",
            ...LED_POSITIONS[wall],
          }}
          animate={{
            opacity: [0.6, 0.85 + energyLevel * 0.15, 0.6],
            boxShadow: [
              `0 0 12px 4px ${asset.accentColor}44`,
              `0 0 ${20 + energyLevel * 30}px ${8 + energyLevel * 12}px ${asset.accentColor}77`,
              `0 0 12px 4px ${asset.accentColor}44`,
            ],
          }}
          transition={{ duration: 2.8 + Math.random(), repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* ── Layer 4: Ceiling lighting rig — light beams ───────────────── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "60%",
          zIndex: 4,
          pointerEvents: "none",
          display: "flex",
          justifyContent: "space-evenly",
          alignItems: "flex-start",
        }}
      >
        {Array.from({ length: rig.beamCount }).map((_, i) => (
          <motion.div
            key={i}
            style={{
              width: `calc(100% / ${rig.beamCount})`,
              height: "100%",
              background: `linear-gradient(to bottom, ${rig.beamColor}${Math.floor(energyLevel * 18 + 8).toString(16).padStart(2, "0")} 0%, transparent 100%)`,
              transformOrigin: "top center",
              transform: `skewX(${(i - rig.beamCount / 2) * 2}deg)`,
            }}
            animate={{ opacity: [0.15, 0.3 * energyLevel + 0.1, 0.15] }}
            transition={{ duration: 1.5 + i * 0.2, repeat: Infinity, ease: "easeInOut", delay: i * 0.12 }}
          />
        ))}
      </div>

      {/* ── Layer 5: Stage apron / elevated front lip ─────────────────── */}
      {asset.geometry.hasElevatedStage && (
        <div
          style={{
            position: "absolute",
            bottom: "24%",
            left: "5%",
            right: "5%",
            height: "2px",
            zIndex: 5,
            background: `linear-gradient(90deg, transparent, ${asset.accentColor}cc, ${asset.secondaryColor}88, ${asset.accentColor}cc, transparent)`,
            boxShadow: `0 0 8px 2px ${asset.accentColor}66`,
            pointerEvents: "none",
          }}
        />
      )}

      {/* ── Layer 6: Sponsor panel zones (optional) ───────────────────── */}
      {showSponsorZones &&
        asset.geometry.sponsorZones.map((zone) => (
          <div
            key={zone}
            style={{
              position: "absolute",
              zIndex: 6,
              border: `1px dashed ${asset.accentColor}44`,
              background: `${asset.accentColor}08`,
              pointerEvents: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 9,
              color: `${asset.accentColor}88`,
              fontFamily: "monospace",
              textTransform: "uppercase",
              letterSpacing: 1,
              ...SPONSOR_ZONE_STYLES[zone],
            }}
          >
            {zone}
          </div>
        ))}

      {/* ── Layer 7: Room banner (top marquee strip) ──────────────────── */}
      {bannerUrl && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 56,
            zIndex: 7,
            overflow: "hidden",
            borderBottom: `1px solid ${asset.accentColor}33`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bannerUrl}
            alt={asset.label}
            style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.4 }}
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

      {/* ── Layer 8: Children (live content) ─────────────────────────── */}
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
