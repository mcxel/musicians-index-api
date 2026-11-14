"use client";

/**
 * PerformerQrQuickStrip — Persistent Performer ID / QR Quick Access Strip.
 *
 * Placed immediately underneath the Media Player (Playlist Band) and above
 * the reserved bottom drawer.
 *
 * Purpose:
 *   Fast real-world show use — when Marcel or an artist is at a live show,
 *   they can immediately present their Performer ID / QR, or swipe/cycle
 *   through performers, for fans to scan and land on the canonical Performer
 *   Station / profile.
 *
 * Rules:
 *   - Real QR only (QRCodeCanvas via buildUserShareIdentity).
 *   - Canonical performer/profile URL (no mock links).
 *   - Persistent under media player — opening a drawer never destroys it.
 *   - Desktop and mobile responsive.
 */

import { useMemo, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import {
  buildUserShareIdentity,
  getShareBaseUrl,
} from "@/lib/identity/ArtistShareIdentity";
import {
  PERFORMER_REGISTRY,
  type PerformerIdentity,
} from "@/lib/performers/PerformerRegistry";

export interface PerformerQrQuickStripProps {
  userId: string;
  displayName: string;
  role: "performer" | "fan";
  accentColor?: string;
  avatarUrl?: string | null;
}

export default function PerformerQrQuickStrip({
  userId,
  displayName,
  role,
  accentColor = "#00FFFF",
  avatarUrl = null,
}: PerformerQrQuickStripProps) {
  const [selectedIndex, setSelectedIndex] = useState<number>(() => {
    if (role === "performer") {
      const idx = PERFORMER_REGISTRY.findIndex(
        (p) => p.id === userId || p.slug === userId,
      );
      return idx >= 0 ? idx : 0;
    }
    return 0;
  });

  const [copied, setCopied] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [useOwnIdentity, setUseOwnIdentity] = useState(true);

  const activePerformer: PerformerIdentity | undefined =
    PERFORMER_REGISTRY[selectedIndex];

  const currentIdentity = useMemo(() => {
    if (useOwnIdentity || !activePerformer) {
      return buildUserShareIdentity({
        userId,
        role,
        username: userId,
        displayName,
        avatarUrl,
      });
    }

    return buildUserShareIdentity({
      userId: activePerformer.id,
      role: "performer",
      username: activePerformer.slug,
      displayName: activePerformer.name,
      avatarUrl: activePerformer.profileImageUrl,
      slug: activePerformer.slug,
    });
  }, [useOwnIdentity, activePerformer, userId, role, displayName, avatarUrl]);

  const scanUrl = `${getShareBaseUrl()}${currentIdentity.profileUrl}`;
  const codeLabel = useOwnIdentity
    ? role === "performer"
      ? "TMI ARTIST ID"
      : "TMI FAN ID"
    : `PERFORMER #${selectedIndex + 1}`;
  const displayedName = currentIdentity.displayName;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(scanUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback: clipboard blocked
    }
  };

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${displayedName} on TMI`,
          text: `Scan to connect with ${displayedName} on The Musician's Index`,
          url: scanUrl,
        });
      } catch {
        // User dismissed native share sheet
      }
    } else {
      void handleCopy();
    }
  };

  const handlePrev = () => {
    setUseOwnIdentity(false);
    setSelectedIndex((prev) =>
      prev <= 0 ? PERFORMER_REGISTRY.length - 1 : prev - 1,
    );
  };

  const handleNext = () => {
    setUseOwnIdentity(false);
    setSelectedIndex((prev) =>
      prev >= PERFORMER_REGISTRY.length - 1 ? 0 : prev + 1,
    );
  };

  return (
    <>
      <div
        data-performer-qr-quick-strip
        style={{
          margin: "8px 12px",
          padding: "10px 14px",
          borderRadius: 12,
          border: `1.5px solid ${accentColor}44`,
          background: "linear-gradient(135deg, rgba(10,5,20,0.95), rgba(5,5,16,0.98))",
          boxShadow: `0 4px 20px rgba(0,0,0,0.6), inset 0 0 16px ${accentColor}0a`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          position: "relative",
          zIndex: 5,
        }}
      >
        {/* Left: Performer Identity & QR Preview */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          {/* QR thumbnail */}
          <div
            onClick={() => setFullscreen(true)}
            title="Click to expand QR Code"
            style={{
              background: "#fff",
              padding: 4,
              borderRadius: 8,
              boxShadow: `0 0 12px ${accentColor}44`,
              cursor: "pointer",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <QRCodeCanvas
              value={scanUrl}
              size={52}
              bgColor="#ffffff"
              fgColor="#0a0a0a"
              level="M"
            />
          </div>

          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 8,
                fontWeight: 900,
                letterSpacing: "0.18em",
                color: accentColor,
                textTransform: "uppercase",
              }}
            >
              {codeLabel} · SCAN TO CONNECT
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 900,
                color: "#fff",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                marginTop: 2,
              }}
            >
              {displayedName}
            </div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", marginTop: 1 }}>
              {scanUrl.replace(/^https?:\/\//, "")}
            </div>
          </div>
        </div>

        {/* Right: Actions & Swipe / Carousel Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          {/* Carousel controls for live shows */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              background: "rgba(255,255,255,0.06)",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.12)",
              padding: 2,
            }}
          >
            <button
              type="button"
              onClick={handlePrev}
              title="Previous performer card"
              style={{
                background: "transparent",
                border: "none",
                color: "#FFD700",
                fontSize: 11,
                fontWeight: 900,
                padding: "4px 8px",
                cursor: "pointer",
              }}
            >
              ◀
            </button>
            <button
              type="button"
              onClick={() => setUseOwnIdentity(true)}
              title="Reset to my identity"
              style={{
                background: useOwnIdentity ? `${accentColor}22` : "transparent",
                border: useOwnIdentity ? `1px solid ${accentColor}66` : "none",
                color: useOwnIdentity ? accentColor : "rgba(255,255,255,0.5)",
                fontSize: 8,
                fontWeight: 900,
                letterSpacing: "0.08em",
                borderRadius: 4,
                padding: "3px 6px",
                cursor: "pointer",
                textTransform: "uppercase",
              }}
            >
              Mine
            </button>
            <button
              type="button"
              onClick={handleNext}
              title="Next performer card"
              style={{
                background: "transparent",
                border: "none",
                color: "#FFD700",
                fontSize: 11,
                fontWeight: 900,
                padding: "4px 8px",
                cursor: "pointer",
              }}
            >
              ▶
            </button>
          </div>

          <button
            type="button"
            onClick={() => void handleCopy()}
            style={{
              padding: "5px 10px",
              borderRadius: 8,
              border: `1px solid ${accentColor}66`,
              background: copied ? `${accentColor}33` : "rgba(0,0,0,0.4)",
              color: accentColor,
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: "0.08em",
              cursor: "pointer",
              textTransform: "uppercase",
            }}
          >
            {copied ? "COPIED" : "COPY LINK"}
          </button>

          <button
            type="button"
            onClick={() => void handleShare()}
            style={{
              padding: "5px 10px",
              borderRadius: 8,
              border: "1px solid rgba(255,215,0,0.5)",
              background: "rgba(255,215,0,0.12)",
              color: "#FFD700",
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: "0.08em",
              cursor: "pointer",
              textTransform: "uppercase",
            }}
          >
            SHARE
          </button>

          <button
            type="button"
            onClick={() => setFullscreen(true)}
            style={{
              padding: "5px 10px",
              borderRadius: 8,
              border: "1px solid rgba(255,45,170,0.5)",
              background: "rgba(255,45,170,0.12)",
              color: "#FF2DAA",
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: "0.08em",
              cursor: "pointer",
              textTransform: "uppercase",
            }}
          >
            EXPAND
          </button>
        </div>
      </div>

      {/* Fullscreen Modal for live show stage presentation */}
      {fullscreen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Performer ID QR Code"
          onClick={() => setFullscreen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            background: "rgba(2, 2, 10, 0.88)",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 380,
              width: "100%",
              borderRadius: 20,
              border: `2px solid ${accentColor}`,
              background: "linear-gradient(180deg, #12081a 0%, #06030c 100%)",
              boxShadow: `0 0 60px ${accentColor}33, 0 20px 60px rgba(0,0,0,0.9)`,
              padding: "24px 20px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 14,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: "0.2em",
                color: accentColor,
                textTransform: "uppercase",
              }}
            >
              {codeLabel}
            </div>

            <div style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>
              {displayedName}
            </div>

            <div
              style={{
                background: "#fff",
                padding: 16,
                borderRadius: 16,
                boxShadow: `0 0 32px ${accentColor}44`,
              }}
            >
              <QRCodeCanvas
                value={scanUrl}
                size={220}
                bgColor="#ffffff"
                fgColor="#0a0a0a"
                level="Q"
              />
            </div>

            <div
              style={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: "0.14em",
                color: "rgba(255,255,255,0.6)",
              }}
            >
              SCAN TO CONNECT INSTANTLY
            </div>

            <div style={{ fontSize: 11, color: "#00FFFF", wordBreak: "break-all" }}>
              {scanUrl}
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 4, width: "100%" }}>
              <button
                type="button"
                onClick={() => void handleCopy()}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: 10,
                  border: `1px solid ${accentColor}`,
                  background: copied ? `${accentColor}33` : "transparent",
                  color: accentColor,
                  fontWeight: 900,
                  fontSize: 11,
                  cursor: "pointer",
                }}
              >
                {copied ? "COPIED" : "COPY LINK"}
              </button>
              <button
                type="button"
                onClick={() => setFullscreen(false)}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "rgba(255,255,255,0.08)",
                  color: "#fff",
                  fontWeight: 900,
                  fontSize: 11,
                  cursor: "pointer",
                }}
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
