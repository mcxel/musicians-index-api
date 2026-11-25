"use client";

import React, { useState } from "react";
import Link from "next/link";
import ProfileShareModal from "@/components/profile/ProfileShareModal";
import type { ProfileHeroConfig } from "@/lib/profile/PublicProfileStyleEngine";

interface ProfileHeroBannerProps {
  hero?: ProfileHeroConfig;
  profileName: string;
  username: string;
  roleType: "FAN" | "PERFORMER" | "GROUP";
  tier?: string;
  accentColor?: string;
  isLive?: boolean;
  liveRoomRoute?: string | null;
  rank?: number;
  location?: string;
  isOwner?: boolean;
  onEditHero?: () => void;
  onShare?: () => void;
  nowPlayingTrack?: string;
  thoughtOfTheDay?: string;
}

export default function ProfileHeroBanner({
  hero,
  profileName,
  username,
  roleType,
  tier = "FREE",
  accentColor = "#00FFFF",
  isLive = false,
  liveRoomRoute,
  rank,
  location,
  isOwner = false,
  onEditHero,
  onShare,
  nowPlayingTrack,
  thoughtOfTheDay,
}: ProfileHeroBannerProps) {
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // If hero is explicitly disabled, return null (Movable / Optional Hero Law)
  if (hero && !hero.enabled) {
    return null;
  }

  const height = hero?.heightPx ?? 340;
  const heroImage = hero?.imageUrl;
  const headline = hero?.headline || profileName.toUpperCase();
  const subheadline = hero?.subheadline;

  return (
    <>
      <div
        data-testid="profile-hero-banner"
        style={{
          position: "relative",
          width: "100%",
          minHeight: height,
          background: `linear-gradient(135deg, ${accentColor}22, rgba(5,3,16,0.95) 70%)`,
          borderBottom: `2px solid ${accentColor}33`,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
        }}
      >
        {/* Background Image / Motion Art */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          {heroImage ? <img
            src={heroImage}
            alt={profileName}
            style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.75)" }}
          /> : null}
          {/* Cinematic Vignette Overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(to top, rgba(6, 4, 14, 0.98) 0%, rgba(6, 4, 14, 0.6) 40%, rgba(6, 4, 14, 0.3) 100%)`,
            }}
          />
          {/* Atmospheric Color Glow */}
          <div
            style={{
              position: "absolute",
              top: 20,
              left: 30,
              width: 280,
              height: 280,
              borderRadius: "50%",
              background: `${accentColor}18`,
              filter: "blur(70px)",
              pointerEvents: "none",
            }}
          />
        </div>

        {/* Top Badges & Actions */}
        <div
          style={{
            position: "absolute",
            top: 16,
            left: 20,
            right: 20,
            zIndex: 10,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontSize: 8,
                fontWeight: 900,
                letterSpacing: "0.18em",
                color: accentColor,
                background: "rgba(5, 5, 16, 0.8)",
                padding: "4px 10px",
                borderRadius: 4,
                border: `1px solid ${accentColor}44`,
              }}
            >
              {roleType === "GROUP" ? "OFFICIAL BAND / GROUP" : `TMI ${roleType}`} · {tier.toUpperCase()}
            </span>

            {isLive && (
              <span
                style={{
                  fontSize: 8,
                  fontWeight: 900,
                  letterSpacing: "0.12em",
                  color: "#fff",
                  background: "#E63000",
                  padding: "4px 8px",
                  borderRadius: 4,
                  boxShadow: "0 0 12px #E63000",
                }}
              >
                🔴 LIVE NOW
              </span>
            )}

            {rank != null && (
              <span style={{ fontSize: 9, fontWeight: 900, color: "#FFD700", background: "rgba(5,5,16,0.8)", padding: "4px 8px", borderRadius: 4, border: "1px solid rgba(255,215,0,0.3)" }}>
                #{rank} CROWN CONTENDER
              </span>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              type="button"
              data-testid="hero-share-page-btn"
              onClick={() => setShareModalOpen(true)}
              style={{
                padding: "6px 14px",
                borderRadius: 20,
                background: "rgba(5, 5, 16, 0.85)",
                border: `1px solid ${accentColor}66`,
                color: accentColor,
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: "0.1em",
                cursor: "pointer",
                boxShadow: `0 0 12px ${accentColor}22`,
              }}
            >
              🚀 SHARE PAGE
            </button>

            {isOwner && onEditHero && (
              <button
                type="button"
                onClick={onEditHero}
                style={{
                  padding: "6px 12px",
                  borderRadius: 20,
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "#fff",
                  fontSize: 9,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                ✏ EDIT HERO
              </button>
            )}
          </div>
        </div>

        {/* Hero Content Overlay (Bottom of Banner) */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            maxWidth: 1040,
            margin: "0 auto",
            width: "100%",
            padding: "24px 24px 20px",
            boxSizing: "border-box",
          }}
        >
          {thoughtOfTheDay && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "4px 12px",
                borderRadius: 20,
                background: "rgba(10, 5, 25, 0.85)",
                border: "1px solid rgba(255, 215, 0, 0.4)",
                marginBottom: 10,
              }}
            >
              <span style={{ fontSize: 10 }}>✨</span>
              <span
                style={{
                  fontSize: 10,
                  fontStyle: "italic",
                  color: "#FFF8E7",
                  fontFamily: "'Playfair Display', Georgia, serif",
                }}
              >
                &ldquo;{thoughtOfTheDay}&rdquo;
              </span>
            </div>
          )}

          <h1
            style={{
              margin: "0 0 6px",
              fontSize: "clamp(26px, 5vw, 52px)",
              fontWeight: 900,
              color: "#fff",
              lineHeight: 1.05,
              letterSpacing: "-0.01em",
              textShadow: "0 4px 20px rgba(0,0,0,0.8)",
            }}
          >
            {headline}
          </h1>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap",
              fontSize: 12,
              color: "rgba(255, 255, 255, 0.7)",
            }}
          >
            <span>@{username}</span>
            {location && <span>· {location}</span>}
            {subheadline && <span>· {subheadline}</span>}

            {nowPlayingTrack && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  color: accentColor,
                  fontWeight: 800,
                  fontSize: 10,
                }}
              >
                <span>🎵 NOW PLAYING:</span>
                <span style={{ color: "#fff" }}>{nowPlayingTrack}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Share Modal Dialog */}
      <ProfileShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        profileName={profileName}
        username={username}
        role={roleType}
        accentColor={accentColor}
        heroImageUrl={heroImage ?? ""}
        personalQuote={thoughtOfTheDay}
        nowPlayingTrack={nowPlayingTrack}
      />
    </>
  );
}
