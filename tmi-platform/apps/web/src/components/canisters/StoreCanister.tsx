"use client";

/**
 * StoreCanister — Rule 15 canonical canister.
 * Shows performer or platform store items with Stripe checkout links,
 * plus Creator Economy linked products / artist storefront CTA when present.
 * Empty state: "No items in store yet."
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CREATOR_ITEMS,
  FAN_ITEMS,
  type StoreItem,
} from "@/lib/store/StoreItemEngine";
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
import ListenVsOwnActions from "@/components/commerce/ListenVsOwnActions";
import { resolvePrimaryListenProfileUrl } from "@/lib/commerce/DistributorConnectorRegistry";
import { resolveListenUrl, resolveOwnUrl } from "@/lib/commerce/LivingCatalog";
interface StoreCanisterProps {
  entityId: string;
  entityName?: string;
  /**
   * "performer" shows creator items (beats, shoutouts, subscriptions).
   * "fan" shows fan items (tips, fan-club, cosmetics).
   * "shared" shows both.
   */
  storeType?: "performer" | "fan" | "shared";
  accentColor?: string;
  /** Maximum items to display. Defaults to 6. */
  maxItems?: number;
}

function fmt(cents: number, mode: StoreItem["mode"]): string {
  const dollars = (cents / 100).toFixed(2);
  return mode === "subscription" ? `$${dollars}/mo` : `$${dollars}`;
}

export function StoreCanister({
  entityId,
  entityName,
  storeType = "performer",
  accentColor = "#FFD700",
  maxItems = 6,
}: StoreCanisterProps) {
  const items: StoreItem[] =
    storeType === "performer"
      ? CREATOR_ITEMS.slice(0, maxItems)
      : storeType === "fan"
      ? FAN_ITEMS.slice(0, maxItems)
      : [...CREATOR_ITEMS, ...FAN_ITEMS].slice(0, maxItems);

  const [linkedProducts, setLinkedProducts] = useState<CreatorProduct[]>([]);
  const [artistBuyUrl, setArtistBuyUrl] = useState<string | null>(null);
  const [listenUrl, setListenUrl] = useState<string | null>(null);

  useEffect(() => {
    if (storeType !== "performer" && storeType !== "shared") return;
    setLinkedProducts(listCreatorProducts(entityId).slice(0, maxItems));
    setArtistBuyUrl(resolveArtistBuyUrl(getPerformerStorefrontLink(entityId)));
    setListenUrl(resolvePrimaryListenProfileUrl(entityId));
  }, [entityId, storeType, maxItems]);

  const viewAllHref =
    storeType === "fan" ? "/store/fan" : storeType === "shared" ? "/store" : "/store/creator";

  return (
    <div style={{
      background: "rgba(255,255,255,0.015)",
      border: `1px solid ${accentColor}22`,
      borderRadius: 14,
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "12px 18px",
        borderBottom: `1px solid ${accentColor}18`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ fontSize: 9, letterSpacing: "0.3em", color: accentColor, fontWeight: 800 }}>
          🛒 STORE {entityName ? `— ${entityName.toUpperCase()}` : ""}
        </div>
        <Link
          href={viewAllHref}
          style={{
            fontSize: 9, color: accentColor, fontWeight: 700,
            textDecoration: "none", letterSpacing: "0.08em",
          }}
        >
          VIEW ALL →
        </Link>
      </div>

      <div style={{ padding: "14px 18px" }}>
        {(storeType === "performer" || storeType === "shared") && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 8, fontWeight: 900, color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em", marginBottom: 8 }}>
              LISTEN (DSP) · OWN / SUPPORT (TMI)
            </div>
            <div style={{ marginBottom: linkedProducts.length > 0 || artistBuyUrl ? 10 : 0 }}>
              <ListenVsOwnActions
                compact
                listenUrl={listenUrl}
                ownUrl={artistBuyUrl}
                accentColor={accentColor}
              />
            </div>
            {linkedProducts.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10, marginBottom: 10 }}>
                {linkedProducts.map((p) => {
                  const isMusic =
                    p.type === "SINGLE" || p.type === "ALBUM" || p.type === "VINYL" || p.type === "BUNDLE";
                  const songLike = {
                    title: p.title,
                    durationSec: 0,
                    ownBuyUrl: p.buyUrl,
                    commerceEnabled: true,
                  };
                  return (
                    <div
                      key={p.id}
                      style={{
                        padding: "12px 14px",
                        borderRadius: 10,
                        background: "rgba(255,215,0,0.06)",
                        border: "1px solid rgba(255,215,0,0.22)",
                      }}
                    >
                      <div style={{ fontSize: 8, fontWeight: 900, color: "#FFD700", letterSpacing: "0.1em", marginBottom: 4 }}>
                        ARTIST STORE
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 800, color: "#fff", marginBottom: 3 }}>
                        {p.title}
                      </div>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>
                        {CREATOR_PRODUCT_TYPE_LABELS[p.type]}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 900, color: accentColor, marginBottom: isMusic ? 8 : 0 }}>
                        {formatCreatorProductPrice(p) ?? "Price on artist store"}
                      </div>
                      {isMusic ? (
                        <ListenVsOwnActions
                          compact
                          listenUrl={resolveListenUrl(songLike, entityId) || listenUrl}
                          ownUrl={resolveOwnUrl(songLike, entityId) || p.buyUrl || artistBuyUrl}
                          accentColor={accentColor}
                        />
                      ) : p.buyUrl || artistBuyUrl ? (
                        <a
                          href={p.buyUrl || artistBuyUrl || "/store/creator"}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            fontSize: 9,
                            fontWeight: 900,
                            color: accentColor,
                            textDecoration: "none",
                            letterSpacing: "0.06em",
                          }}
                        >
                          BUY →
                        </a>
                      ) : (
                        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>No buy link yet</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : null}
            {artistBuyUrl ? (
              <a
                href={artistBuyUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-block",
                  fontSize: 10,
                  fontWeight: 900,
                  color: accentColor,
                  textDecoration: "none",
                  letterSpacing: "0.08em",
                }}
              >
                {entityName ? `BUY ON ${entityName.toUpperCase()} STORE →` : "BUY ON ARTIST STORE →"}
              </a>
            ) : null}
          </div>
        )}

        {items.length === 0 && linkedProducts.length === 0 && !artistBuyUrl ? (
          <div style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 12, padding: "16px 0" }}>
            No items in store yet.
          </div>
        ) : items.length === 0 ? null : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/checkout/item/${item.id}?entity=${entityId}`}
                style={{ textDecoration: "none" }}
              >
                <div style={{
                  padding: "12px 14px",
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid rgba(255,255,255,0.07)`,
                  transition: "border-color 0.15s",
                  position: "relative",
                  overflow: "hidden",
                }}>
                  {item.badge && (
                    <div style={{
                      position: "absolute", top: 8, right: 8,
                      fontSize: 7, fontWeight: 900, letterSpacing: "0.1em",
                      color: "#050310",
                      background: item.badge === "HOT" ? "#FF2DAA"
                        : item.badge === "NEW" ? "#00FF88"
                        : item.badge === "LIMITED" ? "#FFD700"
                        : accentColor,
                      borderRadius: 4, padding: "2px 6px",
                    }}>
                      {item.badge}
                    </div>
                  )}
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{item.icon}</div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#fff", marginBottom: 3, lineHeight: 1.3 }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginBottom: 10, lineHeight: 1.4 }}>
                    {item.description}
                  </div>
                  <div style={{
                    fontSize: 13, fontWeight: 900, color: accentColor,
                  }}>
                    {fmt(item.price, item.mode)}
                  </div>
                  {item.creatorSplit && item.creatorSplit > 0 && (
                    <div style={{ fontSize: 8, color: "#00FF88", marginTop: 2 }}>
                      {Math.round(item.creatorSplit * 100)}% to creator
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default StoreCanister;
