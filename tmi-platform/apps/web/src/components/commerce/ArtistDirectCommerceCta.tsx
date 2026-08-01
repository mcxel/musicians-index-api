"use client";

/**
 * Public CTA: Buy on artist store when storefront is linked,
 * else fall back to real TMI store routes (no dead #).
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getPerformerStorefrontLink,
  resolveArtistBuyUrl,
} from "@/lib/commerce/CommerceConnectorRegistry";
import {
  CREATOR_PRODUCT_TYPE_LABELS,
  formatCreatorProductPrice,
  listCreatorProducts,
  type CreatorProduct,
} from "@/lib/commerce/CreatorProductRegistry";
import { formatCommerceServiceFeeLabel } from "@/lib/commerce/commerceFees";

export interface ArtistDirectCommerceCtaProps {
  performerSlug: string;
  performerName?: string;
  accentColor?: string;
  /** Compact rail (article) vs fuller list */
  variant?: "rail" | "panel";
}

export default function ArtistDirectCommerceCta({
  performerSlug,
  performerName,
  accentColor = "#FFD700",
  variant = "rail",
}: ArtistDirectCommerceCtaProps) {
  const ac = accentColor;
  const [buyUrl, setBuyUrl] = useState<string | null>(null);
  const [products, setProducts] = useState<CreatorProduct[]>([]);

  useEffect(() => {
    const link = getPerformerStorefrontLink(performerSlug);
    setBuyUrl(resolveArtistBuyUrl(link));
    setProducts(listCreatorProducts(performerSlug));
  }, [performerSlug]);

  const label = performerName ? `Buy on ${performerName}'s store` : "Buy on artist store";

  if (variant === "rail") {
    return (
      <>
        {buyUrl ? (
          <a
            href={buyUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              padding: "9px 18px",
              background: "rgba(255,215,0,0.12)",
              border: "1.5px solid rgba(255,215,0,0.45)",
              borderRadius: 8,
              fontSize: 10,
              fontWeight: 900,
              color: "#FFD700",
              textDecoration: "none",
              letterSpacing: "0.06em",
            }}
          >
            🛍️ {label.toUpperCase()}
          </a>
        ) : (
          <Link
            href="/store/merch"
            style={{
              padding: "9px 18px",
              background: "rgba(255,215,0,0.08)",
              border: "1.5px solid rgba(255,215,0,0.3)",
              borderRadius: 8,
              fontSize: 10,
              fontWeight: 900,
              color: "#FFD700",
              textDecoration: "none",
              letterSpacing: "0.06em",
            }}
          >
            🛍️ BROWSE MERCH
          </Link>
        )}
      </>
    );
  }

  return (
    <div
      style={{
        marginTop: 12,
        padding: 14,
        borderRadius: 10,
        border: `1px solid ${ac}28`,
        background: `${ac}08`,
      }}
    >
      <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.14em", color: ac, marginBottom: 8 }}>
        ARTIST DIRECT COMMERCE
      </div>
      {products.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
          {products.slice(0, 4).map((p) => (
            <div
              key={p.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 8,
                alignItems: "center",
                padding: "8px 10px",
                borderRadius: 8,
                background: "rgba(0,0,0,0.25)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#fff" }}>{p.title}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>
                  {CREATOR_PRODUCT_TYPE_LABELS[p.type]}
                  {formatCreatorProductPrice(p) ? ` · ${formatCreatorProductPrice(p)}` : ""}
                </div>
              </div>
              {p.buyUrl ? (
                <a
                  href={p.buyUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    fontSize: 9,
                    fontWeight: 900,
                    color: ac,
                    textDecoration: "none",
                    letterSpacing: "0.06em",
                  }}
                >
                  BUY →
                </a>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <p style={{ margin: "0 0 10px", fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.4 }}>
          {buyUrl
            ? "No synced products yet — shop the artist storefront directly."
            : "Artist has not linked a storefront yet."}
        </p>
      )}
      {buyUrl ? (
        <a
          href={buyUrl}
          target="_blank"
          rel="noreferrer"
          style={{
            display: "inline-block",
            padding: "8px 14px",
            borderRadius: 8,
            border: `1px solid ${ac}`,
            color: ac,
            fontSize: 10,
            fontWeight: 900,
            textDecoration: "none",
            letterSpacing: "0.08em",
          }}
        >
          {label.toUpperCase()} →
        </a>
      ) : (
        <Link
          href="/store/creator"
          style={{
            display: "inline-block",
            padding: "8px 14px",
            borderRadius: 8,
            border: `1px solid ${ac}66`,
            color: ac,
            fontSize: 10,
            fontWeight: 900,
            textDecoration: "none",
            letterSpacing: "0.08em",
          }}
        >
          OPEN CREATOR STORE →
        </Link>
      )}
      <div style={{ marginTop: 8, fontSize: 9, color: "rgba(255,255,255,0.32)" }}>
        Artist sets price · {formatCommerceServiceFeeLabel()}
      </div>
    </div>
  );
}
