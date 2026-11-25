"use client";

import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

interface ProfileShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileName: string;
  username: string;
  role: string;
  accentColor?: string;
  heroImageUrl?: string;
  personalQuote?: string;
  nowPlayingTrack?: string;
}

export default function ProfileShareModal({
  isOpen,
  onClose,
  profileName,
  username,
  role,
  accentColor = "#00FFFF",
  heroImageUrl = "/tmi-curated/mag-20.jpg",
  personalQuote,
  nowPlayingTrack,
}: ProfileShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  if (!isOpen) return null;

  const profileUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/p/${encodeURIComponent(username)}`
      : `https://themusiciansindex.com/p/${username}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  }

  async function handleNativeShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${profileName} on TMI`,
          text: personalQuote || `Check out ${profileName}'s public page on The Musician's Index!`,
          url: profileUrl,
        });
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 3000);
      } catch {
        // Cancelled or unsupported
      }
    } else {
      void handleCopy();
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-testid="profile-share-modal"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2500,
        background: "rgba(5, 3, 16, 0.88)",
        backdropFilter: "blur(14px)",
        display: "grid",
        placeItems: "center",
        padding: 20,
        animation: "fadeIn 0.2s ease-out",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          background: "linear-gradient(135deg, rgba(20, 10, 35, 0.98), rgba(8, 4, 18, 0.99))",
          border: `1.5px solid ${accentColor}55`,
          borderRadius: 18,
          boxShadow: `0 20px 60px rgba(0,0,0,0.8), 0 0 30px ${accentColor}22`,
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16 }}>🚀</span>
            <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.15em", color: "#fff" }}>
              SHARE PUBLIC PAGE
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.6)",
              fontSize: 18,
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: "20px" }}>
          {/* Social Preview Card (Share Card / Social Preview Law) */}
          <div
            style={{
              borderRadius: 14,
              overflow: "hidden",
              border: `1px solid ${accentColor}44`,
              background: "#080512",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
              marginBottom: 20,
            }}
          >
            <div style={{ position: "relative", height: 140, overflow: "hidden" }}>
              <img
                src={heroImageUrl}
                alt={profileName}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(8,5,18,0.95), transparent 60%)",
                }}
              />
              <div style={{ position: "absolute", bottom: 12, left: 16, right: 16 }}>
                <span
                  style={{
                    fontSize: 8,
                    fontWeight: 900,
                    letterSpacing: "0.14em",
                    color: accentColor,
                    textTransform: "uppercase",
                  }}
                >
                  TMI {role.toUpperCase()}
                </span>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>
                  {profileName}
                </div>
              </div>
            </div>

            <div style={{ padding: "12px 16px" }}>
              {personalQuote ? (
                <div
                  style={{
                    fontSize: 11,
                    fontStyle: "italic",
                    color: "rgba(255,248,231,0.85)",
                    marginBottom: 8,
                    fontFamily: "'Playfair Display', Georgia, serif",
                  }}
                >
                  &ldquo;{personalQuote}&rdquo;
                </div>
              ) : null}

              {nowPlayingTrack ? (
                <div style={{ fontSize: 9, color: accentColor, fontWeight: 800, letterSpacing: "0.06em" }}>
                  🎵 Profile Soundtrack: {nowPlayingTrack}
                </div>
              ) : null}

              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", marginTop: 6 }}>
                themusiciansindex.com/p/{username}
              </div>
            </div>
          </div>

          {/* Direct Link Copy Row */}
          <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            <input
              type="text"
              readOnly
              value={profileUrl}
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: 8,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#fff",
                fontSize: 11,
                outline: "none",
              }}
            />
            <button
              type="button"
              data-testid="copy-profile-link-btn"
              onClick={handleCopy}
              style={{
                padding: "10px 18px",
                borderRadius: 8,
                background: copied ? "#00FF88" : accentColor,
                color: "#050510",
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: "0.08em",
                border: "none",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "background 0.2s",
              }}
            >
              {copied ? "✓ COPIED" : "COPY LINK"}
            </button>
          </div>

          {/* Social Platform Destinations */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.16em", color: "rgba(255,255,255,0.45)", marginBottom: 10 }}>
              SHARE TO SOCIAL
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
              {[
                { name: "Device Share", icon: "📱", action: handleNativeShare },
                {
                  name: "Facebook",
                  icon: "📘",
                  action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`, "_blank"),
                },
                {
                  name: "Instagram",
                  icon: "📸",
                  action: () => {
                    void handleCopy();
                    window.open("https://instagram.com", "_blank");
                  },
                },
                {
                  name: "TikTok",
                  icon: "🎵",
                  action: () => {
                    void handleCopy();
                    window.open("https://tiktok.com", "_blank");
                  },
                },
              ].map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={item.action}
                  style={{
                    padding: "12px 8px",
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                    cursor: "pointer",
                  }}
                >
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                  <span style={{ fontSize: 9, fontWeight: 800 }}>{item.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Profile QR Code Info */}
          <div
            data-testid="profile-qr-container"
            style={{
              padding: "16px",
              borderRadius: 12,
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${accentColor}33`,
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                background: "#fff",
                padding: 6,
                borderRadius: 8,
                display: "inline-block",
                lineHeight: 0,
              }}
            >
              <QRCodeSVG
                value={profileUrl}
                size={72}
                bgColor="#ffffff"
                fgColor="#050510"
                level="M"
              />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 900, color: "#fff", marginBottom: 2 }}>
                PROFILE QR IDENTITY
              </div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", lineHeight: 1.4, marginBottom: 4 }}>
                SCAN TO VISIT EXACT PUBLIC PAGE
              </div>
              <div style={{ fontSize: 8, color: accentColor, fontWeight: 800 }}>
                CERTIFIED LIVE DEEP-LINK
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
