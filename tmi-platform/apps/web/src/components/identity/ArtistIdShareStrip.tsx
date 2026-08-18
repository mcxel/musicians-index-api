"use client";

/**
 * Artist ID / Fan ID — large tap-scan QR for in-person sharing.
 * Same destination family as YoPho card QR: public profile page.
 * Destinations come from ArtistProfile.slug / UserProfile.username, never a guess.
 */

import { useEffect, useMemo, useState } from "react";

interface ArtistIdShareStripProps {
  userId: string;
  displayName: string;
  role: "fan" | "performer";
  artistSlug?: string | null;
  username?: string | null;
}

function slugFromName(name: string, fallback: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || fallback;
}

export default function ArtistIdShareStrip({
  userId,
  displayName,
  role,
  artistSlug,
  username,
}: ArtistIdShareStripProps) {
  const [expanded, setExpanded] = useState(false);
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
            ? data.profile.artistSlug ?? data.profile.id ?? null
            : data.profile.username ?? data.profile.id ?? null;
        if (next) setResolvedSlug(next);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [resolvedSlug, role]);

  const publicSlug = resolvedSlug || userId || slugFromName(displayName, userId);
  const publicPath =
    role === "performer"
      ? `/profile/performer/${encodeURIComponent(publicSlug)}`
      : `/profile/fan/${encodeURIComponent(publicSlug)}`;

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return publicPath;
    return `${window.location.origin}${publicPath}`;
  }, [publicPath]);

  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=${expanded ? 280 : 96}x${expanded ? 280 : 96}&data=${encodeURIComponent(shareUrl)}`;
  const label = role === "performer" ? "ARTIST ID" : "FAN ID";

  return (
    <div
      style={{
        marginTop: 8,
        padding: 10,
        borderRadius: 10,
        border: "1px solid rgba(0,255,255,0.28)",
        background: "rgba(0,255,255,0.06)",
      }}
    >
      <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.16em", color: "#00FFFF", marginBottom: 8 }}>
        {label}
      </div>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        title="Tap to enlarge QR"
        style={{
          width: "100%",
          background: "#fff",
          border: "none",
          borderRadius: 8,
          padding: expanded ? 10 : 6,
          cursor: "pointer",
          display: "flex",
          justifyContent: "center",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrSrc} alt={`${label} QR`} width={expanded ? 280 : 96} height={expanded ? 280 : 96} style={{ display: "block" }} />
      </button>
      <div style={{ fontSize: 8, color: "rgba(255,255,255,0.55)", marginTop: 6, wordBreak: "break-all", lineHeight: 1.35 }}>
        Tap the QR to enlarge. Opens this public page — same family as YoPho cards.
      </div>
      <a
        href={publicPath}
        style={{ display: "inline-block", marginTop: 6, fontSize: 9, fontWeight: 800, color: "#00FFFF", textDecoration: "none" }}
      >
        OPEN PAGE
      </a>
    </div>
  );
}
