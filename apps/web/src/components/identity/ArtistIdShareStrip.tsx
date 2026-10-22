"use client";

/**
 * Artist ID / Fan ID — Canonical Public Identity Card & QR Share Strip.
 *
 * Requirements (Locked Slice 4):
 * - PERFORMER: Artist ID · QR code · View Profile · Copy ID · Share
 * - FAN: TMI User ID · QR code · View Profile · Copy ID · Share
 * - PRIVACY INVARIANT: Never expose internal auth / database UUID.
 * - QR SOURCE: Canonical identity / share runtime (/p/[slug]).
 */

import { useEffect, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { canonicalIdentityCardPath, canonicalPublicPath, formatPublicMemberId } from "@/lib/identity/PublicProfileRuntime";

export interface ArtistIdShareStripProps {
  userId: string;
  displayName?: string;
  role: "fan" | "performer";
  artistSlug?: string | null;
  username?: string | null;
  compact?: boolean;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const USR_PREFIX_REGEX = /^usr_[a-zA-Z0-9_-]+/i;

function isRawInternalId(id: string): boolean {
  if (!id) return false;
  return UUID_REGEX.test(id) || USR_PREFIX_REGEX.test(id);
}

export default function ArtistIdShareStrip({
  userId,
  displayName = "",
  role,
  artistSlug,
  username,
  compact = false,
}: ArtistIdShareStripProps) {
  const [expanded, setExpanded] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [resolvedSlug, setResolvedSlug] = useState<string | null>(
    (role === "performer" ? artistSlug : username) ?? null,
  );

  useEffect(() => {
    if (resolvedSlug) return;
    let cancelled = false;
    fetch("/api/profile/self", { credentials: "include", cache: "no-store" })
      .then((r) => r.json())
      .then((data: { ok?: boolean; profile?: { artistSlug?: string | null; username?: string | null; id?: string } }) => {
        if (cancelled || !data?.ok || !data.profile) return;
        const next =
          role === "performer"
            ? data.profile.artistSlug ?? null
            : data.profile.username ?? null;
        if (next) setResolvedSlug(next);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [resolvedSlug, role]);

  // Compute public canonical slug (STRICT: never leak internal UUID)
  const publicSlug = useMemo(() => {
    if (resolvedSlug && !isRawInternalId(resolvedSlug)) return resolvedSlug;
    return null;
  }, [resolvedSlug]);

  // Public display identifier
  const publicDisplayId = useMemo(() => {
    if (resolvedSlug && !isRawInternalId(resolvedSlug)) {
      return resolvedSlug;
    }
    return formatPublicMemberId(role, userId);
  }, [resolvedSlug, role, userId]);

  const publicPath = publicSlug ? canonicalPublicPath(publicSlug) : null;
  const cardPath = publicSlug ? canonicalIdentityCardPath(publicSlug) : null;

  const shareUrl = useMemo(() => {
    if (!cardPath) return "";
    if (typeof window === "undefined") return cardPath;
    return `${window.location.origin}${cardPath}`;
  }, [cardPath]);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      }
      setCopiedField(label);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      /* fallback */
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `TMI ${role === "performer" ? "Artist" : "Member"} · ${displayName || publicDisplayId}`,
          url: shareUrl,
        });
        return;
      } catch {
        /* user cancelled */
      }
    }
    void copyToClipboard(shareUrl, "link");
  };

  const isPerformer = role === "performer";
  const roleColor = isPerformer ? "#FFD700" : "#00FFFF";
  const roleBadgeBg = isPerformer ? "rgba(255,215,0,0.18)" : "rgba(0,255,255,0.18)";
  const roleBorder = isPerformer ? "rgba(255,215,0,0.35)" : "rgba(0,255,255,0.35)";

  return (
    <div
      data-testid="tmi-public-identity-card"
      data-role={role}
      data-public-id={publicDisplayId}
      style={{
        padding: compact ? 8 : 12,
        borderRadius: 12,
        border: `1px solid ${roleBorder}`,
        background: "linear-gradient(180deg, rgba(8,10,24,0.96), rgba(2,4,12,0.94))",
        boxShadow: "0 12px 36px rgba(0,0,0,0.65)",
        fontFamily: "inherit",
      }}
    >
      {/* 1. ROLE HEADER BADGE */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span
          data-testid="tmi-identity-role-badge"
          style={{
            fontSize: 9,
            fontWeight: 900,
            letterSpacing: "0.14em",
            color: roleColor,
            background: roleBadgeBg,
            padding: "3px 8px",
            borderRadius: 6,
            border: `1px solid ${roleBorder}`,
          }}
        >
          {isPerformer ? "PERFORMER" : "FAN"}
        </span>

        {/* Copy confirmation toast */}
        {copiedField ? (
          <span style={{ fontSize: 9, fontWeight: 900, color: "#00FF88", letterSpacing: "0.1em" }}>
            ✓ {copiedField.toUpperCase()} COPIED!
          </span>
        ) : null}
      </div>

      {/* 2. PUBLIC ID ROW */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 8, fontWeight: 800, color: "rgba(255,255,255,0.45)", letterSpacing: "0.1em", marginBottom: 2 }}>
          {isPerformer ? "Artist ID" : "TMI User ID"}
        </div>
        <div
          data-testid="tmi-identity-public-id"
          style={{
            fontSize: 13,
            fontWeight: 900,
            color: "#fff",
            fontFamily: "monospace",
            letterSpacing: "0.05em",
            wordBreak: "break-all",
          }}
        >
          {publicDisplayId}
        </div>
      </div>

      {/* 3. CANONICAL QR CODE */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 10 }}>
        <button
          type="button"
          data-testid="tmi-identity-qr-toggle"
          onClick={() => setExpanded((v) => !v)}
          title="Tap to enlarge QR code"
          style={{
            background: "#fff",
            border: "none",
            borderRadius: 10,
            padding: expanded ? 10 : 8,
            cursor: "pointer",
            display: "flex",
            justifyContent: "center",
            boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
          }}
        >
        {shareUrl ? (
          <QRCodeSVG
            data-testid="tmi-identity-qr-img"
            value={shareUrl}
            size={expanded ? 240 : 110}
            bgColor="#ffffff"
            fgColor="#050510"
            level="M"
          />
        ) : (
          <span style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.7)", padding: 12 }}>Public address is not ready</span>
        )}
        </button>
        <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
          Tap QR to {expanded ? "shrink" : "enlarge"}
        </div>
      </div>

      {/* 4. ACTIONS: View Profile · Copy ID · Share */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
        {publicPath ? (
          <a
            data-testid="tmi-identity-view-profile"
            href={publicPath}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "6px 8px",
              borderRadius: 6,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "#00FFFF",
              fontSize: 9,
              fontWeight: 900,
              textDecoration: "none",
              letterSpacing: "0.06em",
              textAlign: "center",
            }}
          >
            View Profile
          </a>
        ) : (
          <span data-testid="tmi-identity-view-profile" style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", textAlign: "center" }}>View Profile</span>
        )}

        <button
          type="button"
          data-testid="tmi-identity-copy-id"
          onClick={() => void copyToClipboard(publicDisplayId, "id")}
          style={{
            padding: "6px 8px",
            borderRadius: 6,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "#fff",
            fontSize: 9,
            fontWeight: 900,
            letterSpacing: "0.06em",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Copy ID
        </button>

        <button
          type="button"
          data-testid="tmi-identity-share"
          onClick={() => void handleNativeShare()}
          style={{
            padding: "6px 8px",
            borderRadius: 6,
            background: isPerformer ? "rgba(255,215,0,0.15)" : "rgba(0,255,255,0.15)",
            border: `1px solid ${roleBorder}`,
            color: roleColor,
            fontSize: 9,
            fontWeight: 900,
            letterSpacing: "0.06em",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Share
        </button>
      </div>
    </div>
  );
}
