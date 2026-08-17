"use client";

import { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { getArtistShareIdentity } from "@/lib/identity/ArtistShareIdentity";

interface TmiIdentitySurfaceProps {
  userId: string;
  displayName: string;
  avatarUrl?: string | null;
  role: "performer" | "fan";
  accentColor?: string;
}

/**
 * Reclaimed-stage Identity Surface — shown in place of the monitor stack
 * when WATCH mode has 0 monitors. Same ArtistShareIdentity + QR payload
 * used everywhere else (YoPho cards, future posters) — never a second,
 * per-surface QR identity.
 */
export default function TmiIdentitySurface({
  userId,
  displayName,
  avatarUrl,
  role,
  accentColor = "#FF2DAA",
}: TmiIdentitySurfaceProps) {
  const [fullscreen, setFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLCanvasElement>(null);

  const identity = getArtistShareIdentity(userId, role);
  const label = role === "performer" ? "TMI ARTIST ID" : "TMI FAN ID";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(identity.canonicalUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API unavailable — nothing to fall back to silently; the
      // link is already visible in the fullscreen view for manual copy.
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${displayName} on TMI`,
          text: `Scan to connect with ${displayName} on The Musician's Index`,
          url: identity.canonicalUrl,
        });
      } catch {
        // User cancelled the native share sheet — no error state needed.
      }
    } else {
      void handleCopy();
    }
  };

  const handleDownload = () => {
    const canvas = qrRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${identity.publicCode}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const qrSize = fullscreen ? Math.min(340, typeof window !== "undefined" ? window.innerWidth - 80 : 280) : 148;

  const card = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        padding: fullscreen ? "24px 20px" : "18px 16px",
        width: "100%",
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 900,
          letterSpacing: "0.18em",
          color: accentColor,
        }}
      >
        {label}
      </div>

      {!fullscreen && (
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            overflow: "hidden",
            border: `2px solid ${accentColor}88`,
            background: "rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            fontWeight: 900,
            color: accentColor,
          }}
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            displayName.charAt(0).toUpperCase()
          )}
        </div>
      )}

      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 14, fontWeight: 900, color: "#fff" }}>{displayName}</div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 700, marginTop: 2 }}>
          ID: {identity.publicCode}
        </div>
      </div>

      <div
        style={{
          background: "#fff",
          padding: fullscreen ? 16 : 10,
          borderRadius: 12,
          boxShadow: `0 0 24px ${accentColor}33`,
        }}
      >
        <QRCodeCanvas
          ref={qrRef}
          value={identity.canonicalUrl}
          size={qrSize}
          bgColor="#ffffff"
          fgColor="#0a0a0a"
          level="M"
        />
      </div>

      <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "rgba(255,255,255,0.45)" }}>
        SCAN TO CONNECT
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap", justifyContent: "center" }}>
        <button
          type="button"
          onClick={handleShare}
          style={pillButtonStyle(accentColor)}
        >
          SHARE
        </button>
        <button type="button" onClick={handleCopy} style={pillButtonStyle(accentColor)}>
          {copied ? "COPIED" : "COPY LINK"}
        </button>
        {fullscreen && (
          <button type="button" onClick={handleDownload} style={pillButtonStyle(accentColor)}>
            DOWNLOAD
          </button>
        )}
        <button
          type="button"
          onClick={() => setFullscreen((v) => !v)}
          style={pillButtonStyle(accentColor)}
        >
          {fullscreen ? "CLOSE" : "FULLSCREEN"}
        </button>
      </div>
    </div>
  );

  if (fullscreen) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 20000,
          background: "#050510",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {card}
      </div>
    );
  }

  return (
    <div
      data-tmi-identity-surface
      style={{
        aspectRatio: "1 / 1",
        maxHeight: "min(88vw, 420px)",
        margin: "0 auto",
        border: `1px solid ${accentColor}33`,
        borderRadius: 12,
        background: "rgba(255,255,255,0.02)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "auto",
      }}
    >
      {card}
    </div>
  );
}

function pillButtonStyle(accentColor: string): React.CSSProperties {
  return {
    fontSize: 8,
    fontWeight: 900,
    letterSpacing: "0.08em",
    padding: "6px 10px",
    borderRadius: 999,
    border: `1px solid ${accentColor}66`,
    background: `${accentColor}14`,
    color: accentColor,
    cursor: "pointer",
    fontFamily: "inherit",
  };
}
