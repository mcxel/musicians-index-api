"use client";

/**
 * Marketplace drawer — fan-facing, ACTIVE_PERFORMER context-aware.
 * Products for the active performer only (CreatorProductRegistry / storefront /
 * ListenVsOwn). Honest empty. No ticket invent (Rule 17).
 */

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { StoreCanister } from "@/components/canisters/StoreCanister";
import ListenVsOwnActions from "@/components/commerce/ListenVsOwnActions";
import {
  CREATOR_PRODUCT_TYPE_LABELS,
  formatCreatorProductPrice,
  listCreatorProducts,
  listPublishedMarketplaceProducts,
  type CreatorProduct,
} from "@/lib/commerce/CreatorProductRegistry";
import {
  getPerformerStorefrontLink,
  resolveArtistBuyUrl,
} from "@/lib/commerce/CommerceConnectorRegistry";
import { resolvePrimaryListenProfileUrl } from "@/lib/commerce/DistributorConnectorRegistry";
import { useActivePerformer } from "@/lib/context/ActivePerformerContext";
import { getPerformerById } from "@/lib/performers/PerformerRegistry";
import {
  championCardStyle,
  getChampionVisualIdentity,
} from "@/lib/championship/championVisualIdentity";

export interface MarketplaceDrawerPanelProps {
  accentColor?: string;
  /** global = TMI market across shops. performer = the active performer's products. */
  scope?: "global" | "performer";
}

export default function MarketplaceDrawerPanel({
  accentColor = "#FF6B35",
  scope = "performer",
}: MarketplaceDrawerPanelProps) {
  const { activePerformer, activePerformerId } = useActivePerformer();
  const performerId = activePerformerId;
  const name =
    activePerformer?.name ??
    (performerId ? getPerformerById(performerId)?.name : undefined) ??
    performerId ??
    "";

  const [products, setProducts] = useState<CreatorProduct[]>([]);
  const [buyUrl, setBuyUrl] = useState<string | null>(null);
  const [listenUrl, setListenUrl] = useState<string | null>(null);

  useEffect(() => {
    if (scope === "global") {
      setProducts(listPublishedMarketplaceProducts());
      setBuyUrl(null);
      setListenUrl(null);
      return;
    }
    if (!performerId) {
      setProducts([]);
      setBuyUrl(null);
      setListenUrl(null);
      return;
    }
    setProducts(listCreatorProducts(performerId));
    setBuyUrl(resolveArtistBuyUrl(getPerformerStorefrontLink(performerId)));
    setListenUrl(resolvePrimaryListenProfileUrl(performerId));
  }, [performerId, scope]);

  if (scope === "global") {
    return (
      <div data-testid="marketplace-drawer" data-marketplace-scope="global" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        <Header accent={accentColor} />
        {products.length === 0 ? (
          <Empty
            accent={accentColor}
            title="MARKETPLACE IS EMPTY"
            body="No published products are in the TMI market yet."
          />
        ) : (
          products.map((p) => (
            <div key={p.id} data-product-id={p.id} data-product-owner-id={p.ownerPerformerId} style={{ fontSize: 12, color: "#fff" }}>
              {p.title}
              {formatCreatorProductPrice(p) ? ` · ${formatCreatorProductPrice(p)}` : ""}
            </div>
          ))
        )}
      </div>
    );
  }

  if (!performerId) {
    return (
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        <Header accent={accentColor} />
        <Empty
          accent={accentColor}
          title="NO ACTIVE PERFORMER"
          body="Select a performer from discovery, a profile card, or Live Destinations. Marketplace shows that artist’s products only."
        />
        <Link href="/performers" style={linkStyle(accentColor)}>
          Discover Artists →
        </Link>
      </div>
    );
  }

  const champ = getChampionVisualIdentity(performerId);
  const bannerAccent = champ.bannerAccent ?? accentColor;

  return (
    <div
      key={performerId}
      className={champ.className || undefined}
      style={{
        padding: 12,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        animation: "tmiMarketplaceFade 0.28s ease",
        ...championCardStyle(performerId),
      }}
    >
      <style>{`@keyframes tmiMarketplaceFade{from{opacity:0.35}to{opacity:1}}`}</style>
      <Header accent={bannerAccent} subtitle={name} />

      {(listenUrl || buyUrl) && (
        <div
          style={{
            padding: 10,
            borderRadius: 10,
            border: `1px solid ${accentColor}33`,
            background: "rgba(0,0,0,0.22)",
          }}
        >
          <ListenVsOwnActions
            listenUrl={listenUrl}
            ownUrl={buyUrl}
            accentColor={accentColor}
          />
        </div>
      )}

      {products.length === 0 ? (
        <Empty
          accent={accentColor}
          title="NO PRODUCTS YET"
          body={`${name} has no public marketplace products linked yet. Check back after they connect a storefront or publish a release.`}
        />
      ) : (
        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
          {products.map((p) => (
            <li
              key={p.id}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(0,0,0,0.22)",
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
                alignItems: "center",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>{p.title}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                  {CREATOR_PRODUCT_TYPE_LABELS[p.type] ?? p.type}
                  {formatCreatorProductPrice(p) ? ` · ${formatCreatorProductPrice(p)}` : ""}
                </div>
              </div>
              {p.buyUrl ? (
                <a href={p.buyUrl} target="_blank" rel="noreferrer" style={linkStyle(accentColor)}>
                  Own →
                </a>
              ) : (
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>No buy link</span>
              )}
            </li>
          ))}
        </ul>
      )}

      <StoreCanister
        entityId={performerId}
        artistSlug={activePerformer?.slug}
        entityName={name}
        storeType="performer"
        accentColor={accentColor}
        maxItems={8}
      />

      <Link
        href={`/performers/${encodeURIComponent(activePerformer?.slug ?? performerId)}`}
        style={linkStyle("#00FFFF")}
      >
        Open performer profile →
      </Link>
    </div>
  );
}

function Header({ accent, subtitle }: { accent: string; subtitle?: string }) {
  return (
    <div>
      <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.16em", color: accent }}>
        MARKETPLACE · ACTIVE PERFORMER
      </div>
      {subtitle ? (
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
          {subtitle}
        </p>
      ) : null}
      <p style={{ margin: "4px 0 0", fontSize: 11, color: "rgba(255,255,255,0.35)", lineHeight: 1.4 }}>
        Albums, merch, beats, YoPho, VIP & memberships for this artist only. No ticket inventory (Rule 17).
      </p>
    </div>
  );
}

function Empty({
  accent,
  title,
  body,
}: {
  accent: string;
  title: string;
  body: string;
}) {
  return (
    <div
      style={{
        padding: 14,
        borderRadius: 10,
        border: `1px solid ${accent}33`,
        background: "rgba(0,0,0,0.28)",
      }}
    >
      <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.1em", color: accent }}>
        {title}
      </div>
      <p style={{ margin: "6px 0 0", fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.45 }}>
        {body}
      </p>
    </div>
  );
}

function linkStyle(color: string): CSSProperties {
  return {
    display: "inline-block",
    padding: "8px 12px",
    borderRadius: 8,
    border: `1px solid ${color}66`,
    background: `${color}18`,
    color,
    fontWeight: 800,
    fontSize: 11,
    textDecoration: "none",
    width: "fit-content",
    flexShrink: 0,
  };
}
