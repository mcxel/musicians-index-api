"use client";

import { getArtistIdentity } from "@/lib/global/CountryIdentityEngine";
import { getFlagEmoji } from "@/lib/global/FlagDisplayEngine";

interface ArtistCountryTagProps {
  artistId: string;
  fallbackCountry?: string;
  variant?: "pill" | "inline" | "badge";
}

export default function ArtistCountryTag({ artistId, fallbackCountry, variant = "pill" }: ArtistCountryTagProps) {
  const identity = getArtistIdentity(artistId);
  const countryCode = identity?.countryCode ?? fallbackCountry;

  if (!countryCode) return null;

  const emoji = getFlagEmoji(countryCode);
  const genreNote = identity?.badge.genreNote;

  if (variant === "inline") {
    return (
      <span className="text-xs text-white/50 inline-flex items-center gap-1">
        {emoji} {countryCode}
      </span>
    );
  }

  if (variant === "badge") {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono"
        style={{ background: "rgba(0,255,255,0.08)", color: "#00FFFF", border: "1px solid rgba(0,255,255,0.2)" }}
      >
        {emoji} {countryCode}
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
      style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)" }}
    >
      {emoji} {countryCode}
      {genreNote && <span className="ml-1 opacity-60">· {genreNote}</span>}
    </span>
  );
}
