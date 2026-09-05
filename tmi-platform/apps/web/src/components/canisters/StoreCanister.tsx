"use client";

/**
 * StoreCanister — artist catalog from /api/commerce/products (per-artist prices).
 * Checkout: /api/commerce/checkout with productId (never client price / STRIPE_PRICE_*).
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCheckoutClickLock } from "@/hooks/useCheckoutClickLock";
import {
  ARTIST_COMMERCE_TYPE_ICONS,
  formatArtistCommercePrice,
  type ArtistCommerceProduct,
} from "@/lib/commerce/ArtistCommerceTypes";

interface StoreCanisterProps {
  entityId: string;
  entityName?: string;
  /** When set, loads that artist's catalog (slug or user id). */
  artistSlug?: string;
  storeType?: "performer" | "fan" | "shared";
  accentColor?: string;
  maxItems?: number;
  /** Artist management mode — link to create products */
  manageHref?: string;
}

export function StoreCanister({
  entityId,
  entityName = "Artist",
  artistSlug,
  storeType = "performer",
  accentColor = "#FFD700",
  maxItems = 8,
  manageHref,
}: StoreCanisterProps) {
  const [products, setProducts] = useState<ArtistCommerceProduct[]>([]);
  const [empty, setEmpty] = useState(false);
  const [error, setError] = useState("");
  const { busy, label, runCheckout, reset } = useCheckoutClickLock();
  const [buyingId, setBuyingId] = useState<string | null>(null);

  const catalogKey = artistSlug || (storeType === "performer" ? entityId : "");

  useEffect(() => {
    if (!catalogKey || storeType === "fan") {
      setProducts([]);
      setEmpty(true);
      return;
    }
    let cancelled = false;
    const qs = artistSlug
      ? `artistSlug=${encodeURIComponent(artistSlug)}&seed=1`
      : entityId === "me"
        ? `mine=1&seed=1`
        : `artistId=${encodeURIComponent(entityId)}&seed=1`;
    fetch(`/api/commerce/products?${qs}`, { cache: "no-store", credentials: "include" })
      .then((r) => r.json())
      .then((d: { products?: ArtistCommerceProduct[]; error?: string }) => {
        if (cancelled) return;
        if (d.error) {
          setError(d.error);
          setEmpty(true);
          return;
        }
        const list = (d.products ?? []).filter((p) => p.active).slice(0, maxItems);
        setProducts(list);
        setEmpty(list.length === 0);
      })
      .catch(() => {
        if (!cancelled) {
          setError("Store unavailable");
          setEmpty(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [artistSlug, entityId, maxItems, storeType, catalogKey]);

  function buy(product: ArtistCommerceProduct) {
    if (busy) return;
    setBuyingId(product.id);
    setError("");
    void runCheckout(async () => {
      const res = await fetch("/api/commerce/checkout", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });
      const data = (await res.json()) as { url?: string; error?: string; code?: string };
      if (!res.ok || !data.url) {
        setError(
          data.code === "AUTH_REQUIRED" ? "Sign in to purchase" : data.error ?? "Checkout failed",
        );
        setBuyingId(null);
        reset();
        return null;
      }
      return data.url;
    });
  }

  return (
    <div
      style={{
        background: "rgba(5,3,16,0.92)",
        border: `1.5px solid ${accentColor}`,
        borderRadius: 14,
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        color: "#fff",
        fontFamily: "'Inter', sans-serif",
        boxShadow: `0 0 25px ${accentColor}33`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: 8,
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: `linear-gradient(135deg, ${accentColor}, #FF5500)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
            }}
          >
            🛒
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.14em", color: accentColor }}>
              ARTIST STORE {entityName ? `— ${entityName.toUpperCase()}` : ""}
            </div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
              Prices set by this artist · Stripe checkout
            </div>
          </div>
        </div>

        <Link
          href={manageHref || (artistSlug ? `/shoutout/${artistSlug}` : "/store/creator")}
          style={{
            fontSize: 9,
            fontWeight: 900,
            color: accentColor,
            textDecoration: "none",
            letterSpacing: "0.08em",
            border: `1px solid ${accentColor}66`,
            borderRadius: 6,
            padding: "4px 10px",
            background: `${accentColor}18`,
          }}
        >
          {manageHref ? "MANAGE →" : "VIEW STORE ↗"}
        </Link>
      </div>

      {error && (
        <div style={{ fontSize: 11, color: "#FF2DAA", fontWeight: 700 }}>{error}</div>
      )}

      {empty ? (
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", padding: "20px 8px", textAlign: "center" }}>
          No products listed yet.
          {manageHref && (
            <>
              {" "}
              <Link href={manageHref} style={{ color: accentColor }}>
                Add products
              </Link>
            </>
          )}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 }}>
          {products.map((item) => (
            <div
              key={item.id}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,215,0,0.2)",
                borderRadius: 8,
                padding: 10,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 16 }}>{ARTIST_COMMERCE_TYPE_ICONS[item.type] ?? "🛍️"}</span>
                <span
                  style={{
                    fontSize: 8,
                    fontWeight: 900,
                    color: "#00FF88",
                    background: "rgba(0,255,136,0.15)",
                    padding: "2px 4px",
                    borderRadius: 4,
                  }}
                >
                  {item.type.replace(/_/g, " ")}
                </span>
              </div>
              <div style={{ fontSize: 10, fontWeight: 900, color: "#fff" }}>{item.title}</div>
              {item.description && (
                <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)" }}>{item.description}</div>
              )}
              <div style={{ fontSize: 11, fontWeight: 900, color: accentColor }}>
                {formatArtistCommercePrice(item)}
              </div>
              <button
                type="button"
                disabled={busy || (item.inventory != null && item.inventory <= 0)}
                onClick={() => buy(item)}
                style={{
                  fontSize: 9,
                  fontWeight: 900,
                  padding: "6px 10px",
                  borderRadius: 6,
                  border: "none",
                  background:
                    busy && buyingId === item.id
                      ? "rgba(255,255,255,0.15)"
                      : `linear-gradient(135deg, ${accentColor}, #FF5500)`,
                  color: "#000",
                  cursor: busy ? "wait" : "pointer",
                }}
              >
                {busy && buyingId === item.id
                  ? label ?? "…"
                  : item.inventory != null && item.inventory <= 0
                    ? "SOLD OUT"
                    : "BUY"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default StoreCanister;
