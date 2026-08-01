"use client";

/**
 * CommerceConnectorPanel — Shopify-primary connect UI for Performer Bio drawer.
 * Stores shop domain + storefront URL + optional affiliate/checkout URL.
 * Honest: no Admin API sync without credentials. No ticket inventory (Rule 17).
 */

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import {
  clearPerformerStorefrontLink,
  getCommerceConnector,
  getPerformerStorefrontLink,
  listCommerceConnectors,
  normalizeShopDomain,
  resolveArtistBuyUrl,
  savePerformerStorefrontLink,
  type CommerceConnectorId,
  type PerformerStorefrontLink,
} from "@/lib/commerce/CommerceConnectorRegistry";
import {
  CREATOR_PRODUCT_TYPE_LABELS,
  formatCreatorProductPrice,
  getCreatorProductSyncStatus,
  listAllCreatorProductsForOwner,
  removeCreatorProduct,
  upsertCreatorProduct,
  type CreatorProduct,
  type CreatorProductType,
} from "@/lib/commerce/CreatorProductRegistry";
import {
  formatCommerceServiceFeeLabel,
  TMI_COMMERCE_SERVICE_FEE_BPS,
} from "@/lib/commerce/commerceFees";
import CreatorOwnershipPortfolio from "@/components/commerce/CreatorOwnershipPortfolio";

const fieldStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.15)",
  background: "rgba(0,0,0,0.35)",
  color: "#fff",
  fontSize: 12,
  fontFamily: "inherit",
};

const labelStyle: CSSProperties = {
  fontSize: 9,
  fontWeight: 800,
  letterSpacing: "0.12em",
  color: "rgba(255,255,255,0.45)",
  marginBottom: 4,
  display: "block",
};

export interface CommerceConnectorPanelProps {
  performerId: string;
  accentColor?: string;
  articleHref?: string;
}

const PRODUCT_TYPES = Object.keys(CREATOR_PRODUCT_TYPE_LABELS) as CreatorProductType[];

export default function CommerceConnectorPanel({
  performerId,
  accentColor = "#FFD700",
  articleHref,
}: CommerceConnectorPanelProps) {
  const ac = accentColor;
  const providers = listCommerceConnectors();
  const shopify = getCommerceConnector("shopify");

  const [link, setLink] = useState<PerformerStorefrontLink | null>(null);
  const [products, setProducts] = useState<CreatorProduct[]>([]);
  const [connectorId, setConnectorId] = useState<CommerceConnectorId>("shopify");
  const [shopDomain, setShopDomain] = useState("");
  const [storefrontUrl, setStorefrontUrl] = useState("");
  const [checkoutUrl, setCheckoutUrl] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [prodTitle, setProdTitle] = useState("");
  const [prodType, setProdType] = useState<CreatorProductType>("MERCH");
  const [prodBuyUrl, setProdBuyUrl] = useState("");
  const [prodPrice, setProdPrice] = useState("");

  const refresh = useCallback(() => {
    const current = getPerformerStorefrontLink(performerId);
    setLink(current);
    if (current) {
      setConnectorId(current.connectorId);
      setShopDomain(current.shopDomain ?? "");
      setStorefrontUrl(current.storefrontUrl);
      setCheckoutUrl(current.checkoutOrAffiliateUrl ?? "");
    }
    setProducts(listAllCreatorProductsForOwner(performerId));
  }, [performerId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const syncStatus = getCreatorProductSyncStatus(performerId, Boolean(link));
  const buyUrl = resolveArtistBuyUrl(link);

  function handleSaveLink() {
    const url = storefrontUrl.trim();
    if (!url) {
      setStatusMsg("Storefront URL is required to link your store.");
      return;
    }
    if (!/^https?:\/\//i.test(url)) {
      setStatusMsg("Storefront URL must start with https://");
      return;
    }
    const saved = savePerformerStorefrontLink({
      performerId,
      connectorId,
      shopDomain: shopDomain ? normalizeShopDomain(shopDomain) : undefined,
      storefrontUrl: url,
      checkoutOrAffiliateUrl: checkoutUrl.trim() || undefined,
    });
    setLink(saved);
    setStatusMsg(
      connectorId === "shopify"
        ? "Linked storefront — full product sync requires Shopify app credentials."
        : "Storefront linked. Products stay manual until this connector is live.",
    );
    refresh();
  }

  function handleClearLink() {
    clearPerformerStorefrontLink(performerId);
    setLink(null);
    setShopDomain("");
    setStorefrontUrl("");
    setCheckoutUrl("");
    setStatusMsg("Storefront unlinked.");
    refresh();
  }

  function handleAddProduct() {
    const title = prodTitle.trim();
    const url = (prodBuyUrl.trim() || buyUrl || "").trim();
    if (!title) {
      setStatusMsg("Product title required.");
      return;
    }
    if (!url || !/^https?:\/\//i.test(url)) {
      setStatusMsg("Product needs a real buy URL (https://…).");
      return;
    }
    const dollars = parseFloat(prodPrice);
    const priceCents =
      prodPrice.trim() === "" || Number.isNaN(dollars) ? undefined : Math.round(dollars * 100);
    upsertCreatorProduct({
      ownerPerformerId: performerId,
      title,
      type: prodType,
      priceCents,
      currency: "USD",
      connectorId: link?.connectorId ?? connectorId,
      visibility: "PUBLIC",
      buyUrl: url,
    });
    setProdTitle("");
    setProdBuyUrl("");
    setProdPrice("");
    setStatusMsg("Product saved locally for this device (manual entry).");
    refresh();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div
        style={{
          padding: 12,
          borderRadius: 10,
          border: `1px solid ${ac}33`,
          background: `${ac}0c`,
        }}
      >
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.14em", color: ac, marginBottom: 6 }}>
          CREATOR ECONOMY · DIRECT COMMERCE
        </div>
        <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.55)", lineHeight: 1.45 }}>
          TMI does not replace streaming. You stay merchant of record, set your own price on your
          store, and fans move Discovery → Engagement → Commerce (TMI) → Fulfillment (your store).
          Tickets are not created here (Venue/Promoter only).
        </p>
        <div style={{ marginTop: 8, fontSize: 10, color: "#00FF88", fontWeight: 700 }}>
          Fee transparency: {formatCommerceServiceFeeLabel()} ({TMI_COMMERCE_SERVICE_FEE_BPS} bps) on
          the commerce connector path — separate from tip/booking/beat Stripe splits.
        </div>
      </div>

      <div>
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.12em", color: ac, marginBottom: 8 }}>
          COMMERCE CONNECTORS
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {providers.map((p) => (
            <div
              key={p.id}
              style={{
                padding: "8px 10px",
                borderRadius: 8,
                border: p.primary ? `1px solid ${ac}55` : "1px solid rgba(255,255,255,0.1)",
                background: p.primary ? `${ac}12` : "rgba(0,0,0,0.2)",
                display: "flex",
                justifyContent: "space-between",
                gap: 8,
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>
                  {p.label}
                  {p.primary ? " · PRIMARY" : ""}
                </div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                  {p.capabilityNote}
                </div>
              </div>
              <span
                style={{
                  fontSize: 8,
                  fontWeight: 900,
                  letterSpacing: "0.08em",
                  color:
                    p.status === "AVAILABLE"
                      ? "#00FF88"
                      : p.status === "CONNECTED"
                        ? ac
                        : "rgba(255,255,255,0.35)",
                  flexShrink: 0,
                }}
              >
                {p.status.replace("_", " ")}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.12em", color: ac }}>
          LINK STOREFRONT ({shopify?.label ?? "Shopify"} primary)
        </div>
        <div>
          <label style={labelStyle}>CONNECTOR</label>
          <select
            style={fieldStyle}
            value={connectorId}
            onChange={(e) => setConnectorId(e.target.value as CommerceConnectorId)}
          >
            {providers
              .filter((p) => p.status !== "COMING_SOON")
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
          </select>
        </div>
        {connectorId === "shopify" && (
          <div>
            <label style={labelStyle}>SHOP DOMAIN</label>
            <input
              style={fieldStyle}
              value={shopDomain}
              onChange={(e) => setShopDomain(e.target.value)}
              placeholder="your-band.myshopify.com"
            />
          </div>
        )}
        <div>
          <label style={labelStyle}>STOREFRONT URL *</label>
          <input
            style={fieldStyle}
            value={storefrontUrl}
            onChange={(e) => setStorefrontUrl(e.target.value)}
            placeholder="https://yourstore.com"
          />
        </div>
        <div>
          <label style={labelStyle}>AFFILIATE / CHECKOUT URL (optional)</label>
          <input
            style={fieldStyle}
            value={checkoutUrl}
            onChange={(e) => setCheckoutUrl(e.target.value)}
            placeholder="https://… deep-link Buy"
          />
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <button
            type="button"
            onClick={handleSaveLink}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: `1px solid ${ac}`,
              background: `${ac}22`,
              color: ac,
              fontWeight: 900,
              fontSize: 10,
              letterSpacing: "0.08em",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {link ? "UPDATE LINK" : "CONNECT STOREFRONT"}
          </button>
          {link ? (
            <button
              type="button"
              onClick={handleClearLink}
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.2)",
                background: "transparent",
                color: "rgba(255,255,255,0.5)",
                fontWeight: 800,
                fontSize: 10,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              UNLINK
            </button>
          ) : null}
          {buyUrl ? (
            <a
              href={buyUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                border: "1px solid #00FF88",
                color: "#00FF88",
                fontWeight: 900,
                fontSize: 10,
                letterSpacing: "0.08em",
                textDecoration: "none",
              }}
            >
              OPEN STOREFRONT →
            </a>
          ) : null}
        </div>
        <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.35)", lineHeight: 1.4 }}>
          Pricing note: you set price on your store. TMI deep-links fans there — no fake inventory
          sync until Shopify app credentials are configured.
        </p>
      </div>

      <div>
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.12em", color: ac, marginBottom: 6 }}>
          PRODUCTS · SYNC STATUS:{" "}
          {syncStatus === "empty"
            ? "EMPTY"
            : syncStatus === "manual"
              ? "MANUAL ENTRIES"
              : "LINKED — SYNC PENDING"}
        </div>
        {products.length === 0 ? (
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", padding: "8px 0", lineHeight: 1.45 }}>
            No products yet. Add a manual listing with a real buy URL, or wait for Shopify product
            sync when app credentials are installed.
          </div>
        ) : (
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
            {products.map((p) => (
              <li
                key={p.id}
                style={{
                  padding: 10,
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(0,0,0,0.25)",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 8,
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{p.title}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                    {CREATOR_PRODUCT_TYPE_LABELS[p.type]}
                    {formatCreatorProductPrice(p) ? ` · ${formatCreatorProductPrice(p)}` : " · price on artist store"}
                    {" · "}
                    {p.visibility}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  {p.buyUrl ? (
                    <a
                      href={p.buyUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: 9, color: ac, fontWeight: 800, textDecoration: "none" }}
                    >
                      BUY →
                    </a>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => {
                      removeCreatorProduct(performerId, p.id);
                      refresh();
                    }}
                    style={{
                      fontSize: 9,
                      color: "rgba(255,100,100,0.8)",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          <label style={labelStyle}>ADD PRODUCT (MANUAL)</label>
          <input
            style={fieldStyle}
            value={prodTitle}
            onChange={(e) => setProdTitle(e.target.value)}
            placeholder="Product title"
          />
          <select
            style={fieldStyle}
            value={prodType}
            onChange={(e) => setProdType(e.target.value as CreatorProductType)}
          >
            {PRODUCT_TYPES.map((t) => (
              <option key={t} value={t}>
                {CREATOR_PRODUCT_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
          <input
            style={fieldStyle}
            value={prodBuyUrl}
            onChange={(e) => setProdBuyUrl(e.target.value)}
            placeholder="Buy URL (https://…)"
          />
          <input
            style={fieldStyle}
            value={prodPrice}
            onChange={(e) => setProdPrice(e.target.value)}
            placeholder="Display price USD (optional — artist sets real price on store)"
          />
          <button
            type="button"
            onClick={handleAddProduct}
            style={{
              alignSelf: "flex-start",
              padding: "8px 14px",
              borderRadius: 8,
              border: `1px solid ${ac}`,
              background: `${ac}22`,
              color: ac,
              fontWeight: 900,
              fontSize: 10,
              letterSpacing: "0.08em",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            ADD PRODUCT
          </button>
        </div>
      </div>

      {articleHref ? (
        <Link
          href={articleHref}
          style={{ fontSize: 10, fontWeight: 800, color: "#FFD700", textDecoration: "none" }}
        >
          PUBLIC STOREFRONT ON ARTICLE →
        </Link>
      ) : null}

      <CreatorOwnershipPortfolio performerSlug={performerId} accentColor={ac} />

      {statusMsg ? (
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>{statusMsg}</div>
      ) : null}
    </div>
  );
}
