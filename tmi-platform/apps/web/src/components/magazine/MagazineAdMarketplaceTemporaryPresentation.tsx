"use client";

/**
 * TEMPORARY Magazine ad marketplace presentation.
 * Classification: FUNCTIONALLY_READY_TEMPORARY_PRESENTATION
 * DO NOT treat card layout / spacing / columns as canonical TMI Magazine styling.
 * Data + checkout authorities: MagazineAdMarketplaceDataModel (permanent).
 */

import type { CSSProperties } from "react";
import Link from "next/link";
import {
  listMagazineAdMarketplaceListings,
  MAGAZINE_AD_MARKETPLACE_CLASSIFICATION,
  type MagazineAdMarketplaceListing,
} from "@/lib/magazine/MagazineAdMarketplaceDataModel";

function sizeStyle(listing: MagazineAdMarketplaceListing): CSSProperties {
  const aspect = Math.min(2.4, Math.max(0.55, listing.width / Math.max(listing.height, 1)));
  const minH = listing.height >= 250 ? 160 : listing.height >= 140 ? 120 : 88;
  return {
    aspectRatio: String(aspect),
    minHeight: minH,
  };
}

export default function MagazineAdMarketplaceTemporaryPresentation() {
  const listings = listMagazineAdMarketplaceListings();

  return (
    <div data-mag-ad-presentation={MAGAZINE_AD_MARKETPLACE_CLASSIFICATION}>
      <div
        style={{
          marginBottom: 18,
          padding: "12px 14px",
          borderRadius: 10,
          border: "1px solid rgba(255,215,0,0.28)",
          background: "rgba(255,215,0,0.06)",
        }}
      >
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.18em", color: "#FFD700" }}>
          TEMPORARY PRESENTATION · {MAGAZINE_AD_MARKETPLACE_CLASSIFICATION}
        </div>
        <p style={{ margin: "8px 0 0", fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.45 }}>
          Dense browsing, mixed sizes, image/video creative, placement selection, and purchase path are live.
          Gallery styling is replaceable — advertiser, media, pricing, approval, and analytics authorities stay permanent.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 12,
          alignItems: "stretch",
        }}
      >
        {listings.map((listing) => (
          <article
            key={listing.listingId}
            data-placement-id={listing.placementId}
            data-slot-id={listing.slotId}
            style={{
              borderRadius: 12,
              border: listing.priceCents <= 99 ? "1px solid rgba(0,255,255,0.45)" : "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.03)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                ...sizeStyle(listing),
                background:
                  listing.creativeKind === "video"
                    ? "linear-gradient(145deg, rgba(170,45,255,0.25), rgba(5,5,16,0.9))"
                    : "linear-gradient(145deg, rgba(0,255,255,0.12), rgba(5,5,16,0.95))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 6,
                padding: 12,
              }}
            >
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", color: "rgba(255,255,255,0.55)" }}>
                {listing.creativeKind === "either" ? "IMAGE / VIDEO" : listing.creativeKind.toUpperCase()}
              </span>
              <span style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>{listing.sizeLabel}</span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>PREVIEW</span>
            </div>
            <div style={{ padding: "12px 12px 14px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#fff", lineHeight: 1.35 }}>{listing.title}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", lineHeight: 1.4 }}>{listing.description}</div>
              <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: listing.priceCents <= 99 ? "#00FFFF" : "#FFD700" }}>
                    {listing.displayPrice}
                    <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.45)" }}>/{listing.duration}</span>
                  </div>
                </div>
                <Link
                  href={listing.checkoutHref}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 8,
                    background: listing.priceCents <= 99 ? "#00FFFF" : "rgba(255,215,0,0.15)",
                    color: listing.priceCents <= 99 ? "#050510" : "#FFD700",
                    border: listing.priceCents <= 99 ? "none" : "1px solid rgba(255,215,0,0.35)",
                    fontSize: 9,
                    fontWeight: 900,
                    letterSpacing: "0.08em",
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  {listing.advertiserFacingLabel}
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
