"use client";

/**
 * TieredAdSlot — Tier-aware wrapper around the platform ad system.
 *
 * Tier ad load rules:
 *   free          → Full ad load (AdSense + house promos + sponsor)
 *   pro-bronze    → Reduced ads (sponsor + AdSense; no house promos)
 *   gold-platinum → Sponsor content only; no AdSense
 *   diamond       → No ads — premium, ad-free experience
 *
 * Sponsor slots always take priority over AdSense.
 * If no sponsor and no AdSense key → show house promo (free tier only).
 */

import Link from "next/link";
import AdSlot from "./AdSlot";

export type SubTier = "free" | "pro-bronze" | "gold-platinum" | "diamond";

export interface TieredAdSlotProps {
  /** User's subscription tier */
  tier: SubTier;
  /** Named placement from the ad-serve API */
  placement: string;
  /** Width hint for the slot container */
  width?: string | number;
  /** Height hint for the slot container */
  height?: string | number;
  /** If this slot has a paid sponsor, pass sponsor data and it overrides AdSense */
  sponsorBrand?: string;
  sponsorTagline?: string;
  sponsorCta?: string;
  sponsorUrl?: string;
  /** Extra styles */
  style?: React.CSSProperties;
}

const HOUSE_PROMOS = [
  { headline: "Upgrade to Diamond",   body: "Zero ads. Max perks.", cta: "View Plans →", href: "/pricing",    color: "#FFD700" },
  { headline: "Beat Marketplace",     body: "Buy exclusive beats.",  cta: "Browse →",     href: "/beats",      color: "#AA2DFF" },
  { headline: "Go Live Now",          body: "Earn tips from fans.",  cta: "Stream →",     href: "/go-live",    color: "#FF2DAA" },
  { headline: "TMI Season Pass",      body: "Unlock VIP rooms.",     cta: "Get Pass →",   href: "/season-pass",color: "#00FFFF" },
];

function SponsorBanner({
  brand, tagline, cta, url, width, height,
}: { brand: string; tagline?: string; cta?: string; url: string; width: string | number; height: string | number }) {
  return (
    <Link href={url} target="_blank" rel="noopener noreferrer sponsored"
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        width, height: typeof height === "number" ? `${height}px` : height,
        padding: "0 16px", boxSizing: "border-box",
        background: "rgba(255,215,0,0.05)", border: "1px solid rgba(255,215,0,0.12)",
        borderRadius: 8, textDecoration: "none", gap: 12,
        position: "relative",
      }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 900, color: "#FFD700" }}>{brand}</div>
        {tagline && <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{tagline}</div>}
      </div>
      {cta && (
        <div style={{ padding: "5px 13px", background: "rgba(255,215,0,0.18)", border: "1px solid rgba(255,215,0,0.25)", borderRadius: 5, fontSize: 9, fontWeight: 800, color: "#FFD700", whiteSpace: "nowrap" }}>{cta}</div>
      )}
      <div style={{ position: "absolute", top: 4, right: 8, fontSize: 7, color: "rgba(255,255,255,0.2)" }}>Sponsored</div>
    </Link>
  );
}

function HousePromo({ width, height }: { width: string | number; height: string | number }) {
  const p = HOUSE_PROMOS[Math.floor(Math.random() * HOUSE_PROMOS.length)];
  return (
    <Link href={p.href}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        width, height: typeof height === "number" ? `${height}px` : height,
        padding: "0 16px", boxSizing: "border-box",
        background: `${p.color}08`, border: `1px solid ${p.color}18`,
        borderRadius: 8, textDecoration: "none", gap: 12,
      }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 900, color: p.color }}>{p.headline}</div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{p.body}</div>
      </div>
      <div style={{ padding: "5px 13px", background: p.color, borderRadius: 5, fontSize: 9, fontWeight: 900, color: "#fff", whiteSpace: "nowrap", flexShrink: 0 }}>{p.cta}</div>
    </Link>
  );
}

export default function TieredAdSlot({
  tier,
  placement,
  width  = "100%",
  height = 90,
  sponsorBrand,
  sponsorTagline,
  sponsorCta,
  sponsorUrl,
  style,
}: TieredAdSlotProps) {
  // Diamond = ad-free
  if (tier === "diamond") return null;

  const containerStyle: React.CSSProperties = {
    width: typeof width === "number" ? `${width}px` : width,
    minHeight: typeof height === "number" ? `${height}px` : height,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    ...style,
  };

  // Paid sponsor takes priority over everything
  if (sponsorBrand && sponsorUrl) {
    return (
      <div style={containerStyle}>
        <SponsorBanner
          brand={sponsorBrand} tagline={sponsorTagline} cta={sponsorCta}
          url={sponsorUrl} width={width} height={height}
        />
      </div>
    );
  }

  // Gold-platinum: no AdSense, no house promos — only show if sponsor was there
  if (tier === "gold-platinum") return null;

  // Free / pro-bronze: show AdSense (or house promo fallback)
  return (
    <div style={containerStyle} data-ad-tier={tier} data-placement={placement}>
      {/* Try real AdSense first */}
      {process.env.NEXT_PUBLIC_ADSENSE_CLIENT ? (
        <AdSlot placement={placement} />
      ) : (
        // Fallback to house promos for free tier (not pro-bronze in every slot)
        tier === "free" || Math.random() > 0.5 ? (
          <HousePromo width={width} height={height} />
        ) : null
      )}
    </div>
  );
}
