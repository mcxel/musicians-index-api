"use client";

/**
 * PerformerQrQuickStrip — Persistent Fan / Performer ID / QR Quick Access Strip.
 *
 * Placed immediately underneath Monitor 1 / media dock region and above
 * the reserved bottom drawer.
 *
 * Instant stage mode (owner P0, 2026-11-21):
 *   Press EXPAND / QR thumbnail → notify shell to hide attached monitors
 *   locally (media/WebRTC stay mounted) → large scannable QR fills the stage
 *   presentation → CLOSE / Escape restores prior monitor layout.
 *
 * Rules:
 *   - Real QR only (QRCodeCanvas via buildUserShareIdentity).
 *   - Canonical performer/profile URL (no mock links).
 *   - Persistent under media player — opening a drawer never destroys it.
 *   - Desktop and mobile responsive.
 */

import { useEffect, useMemo, useState } from "react";
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
  /**
   * Fired when instant QR stage display opens/closes so the shell can
   * hide/restore attached monitors without remounting media.
   */
  onInstantDisplayChange?: (active: boolean) => void;
  /** WORK utility column beside Monitor 1 — same QR authority, compact column. */
  layout?: "strip" | "work-side";
}

export default function PerformerQrQuickStrip({
  userId,
  displayName,
  role,
  accentColor = "#00FFFF",
  avatarUrl = null,
  onInstantDisplayChange,
  layout = "strip",
}: PerformerQrQuickStripProps) {
  const workSide = layout === "work-side";
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

  const scanUrl = `${getShareBaseUrl()}${currentIdentity.cardUrl}`;
  const codeLabel = useOwnIdentity
    ? role === "performer"
      ? "TMI ARTIST ID"
      : "TMI FAN ID"
    : `PERFORMER #${selectedIndex + 1}`;
  const displayedName = currentIdentity.displayName;

  const openInstantQr = () => {
    setFullscreen(true);
  };

  const closeInstantQr = () => {
    setFullscreen(false);
  };

  useEffect(() => {
    onInstantDisplayChange?.(fullscreen);
  }, [fullscreen, onInstantDisplayChange]);

  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setFullscreen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen]);

  useEffect(() => {
    return () => {
      onInstantDisplayChange?.(false);
    };
  }, [onInstantDisplayChange]);

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
        data-qr-layout={layout}
        data-instant-qr-active={fullscreen ? "true" : "false"}
        style={{
          margin: workSide ? 0 : "8px 12px",
          padding: workSide ? "12px 10px" : "10px 14px",
          borderRadius: 12,
          border: `1.5px solid ${accentColor}44`,
          background: "linear-gradient(135deg, rgba(10,5,20,0.95), rgba(5,5,16,0.98))",
          boxShadow: `0 4px 20px rgba(0,0,0,0.6), inset 0 0 16px ${accentColor}0a`,
          display: "flex",
          flexDirection: workSide ? "column" : "row",
          alignItems: workSide ? "stretch" : "center",
          justifyContent: workSide ? "flex-start" : "space-between",
          gap: workSide ? 10 : 12,
          flexWrap: workSide ? "nowrap" : "wrap",
          position: "relative",
          zIndex: 5,
          flexShrink: 0,
        }}
      >
        {/* Left: Performer Identity & QR Preview */}
        <div
          style={{
            display: "flex",
            flexDirection: workSide ? "column" : "row",
            alignItems: workSide ? "center" : "center",
            gap: 10,
            minWidth: 0,
            textAlign: workSide ? "center" : undefined,
          }}
        >
          {/* QR thumbnail — one-press instant stage display */}
          <button
            type="button"
            onClick={openInstantQr}
            title="Show my QR code — hides monitors locally"
            data-instant-qr-trigger="thumbnail"
            style={{
              background: "#fff",
              padding: workSide ? 8 : 4,
              borderRadius: 8,
              boxShadow: `0 0 12px ${accentColor}44`,
              cursor: "pointer",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
            }}
          >
            <QRCodeCanvas
              value={scanUrl}
              size={workSide ? 96 : 52}
              bgColor="#ffffff"
              fgColor="#0a0a0a"
              level="M"
            />
          </button>
          {workSide ? (
            <button
              type="button"
              onClick={openInstantQr}
              data-instant-qr-trigger="work-side-show"
              title="Instant QR — monitors hide locally, livestream continues"
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: 8,
                border: "1px solid rgba(255,45,170,0.55)",
                background: "rgba(255,45,170,0.14)",
                color: "#FF2DAA",
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: "0.1em",
                cursor: "pointer",
                textTransform: "uppercase",
              }}
            >
              SHOW QR
            </button>
          ) : null}

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
            onClick={openInstantQr}
            data-instant-qr-trigger="expand"
            title="Instant QR — monitors hide locally, livestream continues"
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

      {/* Instant stage QR — monitors yield via shell; media session stays mounted */}
      {fullscreen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${codeLabel} QR Code`}
          data-instant-qr-stage="1"
          onClick={closeInstantQr}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            background: "rgba(2, 2, 10, 0.94)",
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
              maxWidth: 440,
              width: "100%",
              borderRadius: 20,
              border: `2px solid ${accentColor}`,
              background: "linear-gradient(180deg, #12081a 0%, #06030c 100%)",
              boxShadow: `0 0 60px ${accentColor}33, 0 20px 60px rgba(0,0,0,0.9)`,
              padding: "28px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
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

            <div style={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>
              {displayedName}
            </div>

            <div
              style={{
                background: "#fff",
                padding: 20,
                borderRadius: 16,
                boxShadow: `0 0 40px ${accentColor}55`,
              }}
            >
              <QRCodeCanvas
                value={scanUrl}
                size={280}
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
                  padding: "12px",
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
                onClick={() => void handleShare()}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,215,0,0.5)",
                  background: "rgba(255,215,0,0.12)",
                  color: "#FFD700",
                  fontWeight: 900,
                  fontSize: 11,
                  cursor: "pointer",
                }}
              >
                SHARE
              </button>
              <button
                type="button"
                onClick={closeInstantQr}
                data-instant-qr-restore="1"
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "rgba(255,255,255,0.08)",
                  color: "#fff",
                  fontWeight: 900,
                  fontSize: 11,
                  cursor: "pointer",
                }}
              >
                RESTORE
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
