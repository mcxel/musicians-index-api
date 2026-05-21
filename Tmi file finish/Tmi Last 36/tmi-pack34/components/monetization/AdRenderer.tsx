// apps/web/src/components/monetization/AdRenderer.tsx
// Universal ad slot renderer — ALWAYS returns 200, NEVER shows blank.
// Platform Law #7: GET /api/ads/slot/:id ALWAYS returns 200.
"use client";
import { useEffect, useState } from "react";

export type AdCreativeType = "image" | "video" | "sponsored_card" | "house";

interface AdCreative {
  type: AdCreativeType;
  imageUrl?: string;
  videoUrl?: string;
  headline?: string;
  subHeadline?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  advertiserName?: string;
  disclosure?: string | null;  // null = house ad (no disclosure needed)
}

interface Props {
  slotId: string;
  maxWidthPx?: number;
  aspectRatio?: string;
  className?: string;
}

// House ad fallback chain — shown when no paid ad is booked
const HOUSE_AD_FALLBACKS: AdCreative[] = [
  { type: "house", headline: "Upgrade to Pro", subHeadline: "Remove ads + unlock advanced analytics", ctaLabel: "See Plans", ctaUrl: "/settings/billing", disclosure: null },
  { type: "house", headline: "Book a Venue", subHeadline: "Venues are looking for talent this weekend", ctaLabel: "View Booking Portal", ctaUrl: "/booking", disclosure: null },
  { type: "house", headline: "🎵 Beat Drop Friday", subHeadline: "New producer packs available in the marketplace", ctaLabel: "Browse Beats", ctaUrl: "/beats", disclosure: null },
  { type: "house", headline: "Advertise on TMI", subHeadline: "Reach thousands of music fans from $9.99/week", ctaLabel: "See Packages", ctaUrl: "/advertise/packages", disclosure: null },
  { type: "house", headline: "Fan Credits", subHeadline: "Send tips to your favorite artists directly", ctaLabel: "Get Credits", ctaUrl: "/credits", disclosure: null },
];

export function AdRenderer({ slotId, maxWidthPx = 320, aspectRatio }: Props) {
  const [ad, setAd] = useState<AdCreative | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/ads/slot/${slotId}`)
      .then(r => r.json())
      .then(data => {
        setAd(data.creative ?? HOUSE_AD_FALLBACKS[Math.floor(Math.random() * HOUSE_AD_FALLBACKS.length)]);
      })
      .catch(() => {
        // NEVER blank — always fall back to house ad
        setAd(HOUSE_AD_FALLBACKS[0]);
      })
      .finally(() => setLoading(false));
  }, [slotId]);

  if (loading) return (
    <div style={{ width: "100%", maxWidth: maxWidthPx, aspectRatio, background: "#150830", borderRadius: 8, opacity: 0.3 }} />
  );

  if (!ad) return null;  // Should never happen due to house ad fallback

  return (
    <div style={{ width: "100%", maxWidth: maxWidthPx, background: "#1E0D3E", border: "1px solid rgba(255,184,0,0.25)", borderRadius: 8, overflow: "hidden", position: "relative" }}>
      {ad.disclosure !== null && (
        <div style={{ position: "absolute", top: 6, right: 8, fontSize: 9, color: "#7A5F9A", fontFamily: "'Oswald', sans-serif", letterSpacing: 0.5 }}>Ad</div>
      )}
      {ad.imageUrl && <img src={ad.imageUrl} alt={ad.headline} style={{ width: "100%", display: "block", aspectRatio }} />}
      {(ad.headline || ad.subHeadline) && (
        <div style={{ padding: "10px 12px" }}>
          {ad.headline && <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 13, fontWeight: 700, color: "#FFB800", marginBottom: 2 }}>{ad.headline}</div>}
          {ad.subHeadline && <div style={{ fontSize: 11, color: "#C8A8E8", marginBottom: 8 }}>{ad.subHeadline}</div>}
          {ad.ctaLabel && ad.ctaUrl && (
            <a href={ad.ctaUrl} style={{ display: "inline-block", padding: "4px 12px", background: "#00E5FF", color: "#0D0520", borderRadius: 4, fontSize: 10, fontFamily: "'Oswald', sans-serif", fontWeight: 700, letterSpacing: 1, textDecoration: "none" }}>
              {ad.ctaLabel}
            </a>
          )}
        </div>
      )}
    </div>
  );
}
