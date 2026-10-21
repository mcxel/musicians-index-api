"use client";

/**
 * Shop drawer — split UI:
 *   Personal Store = ACTIVE_PERFORMER connected commerce
 *   TMI Store      = platform-global cosmetics / boosters / Media Players / coins
 *                   (same inventory regardless of active performer)
 *
 * Personal shelves read CreatorProductRegistry only (real saved rows).
 * TMI Store reuses FAN_ITEMS / LOBBY_ITEMS and MEDIA_PLAYER_CHASSIS_REGISTRY
 * (SKIN_REGISTRY alias — Rule 19, no second store).
 * Rule 26: TMI Store cosmetics primarily Fan; no performer ticket invent (Rule 17).
 * Stage 2: durable ownership + Stripe OR points + equip.
 */

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import RoleGate from "@/components/auth/RoleGate";
import MediaPlayerChassisPreview from "@/components/media/MediaPlayerChassisPreview";
import { useActivePerformer } from "@/lib/context/ActivePerformerContext";
import {
  formatCreatorProductPrice,
  listCreatorProducts,
  sortCreatorProductsNewestFirst,
  upsertCreatorProduct,
  type CreatorProduct,
} from "@/lib/commerce/CreatorProductRegistry";
import {
  clearPerformerStorefrontLink,
  COMMERCE_CONNECTOR_PROVIDERS,
  getCommerceConnector,
  getPerformerStorefrontLink,
  resolveArtistBuyUrl,
  type CommerceConnectorId,
} from "@/lib/commerce/CommerceConnectorRegistry";
import { getPerformerById } from "@/lib/performers/PerformerRegistry";
import {
  FAN_ITEMS,
  LOBBY_ITEMS,
  formatPrice,
  getCheckoutUrl,
  type StoreItem,
} from "@/lib/store/StoreItemEngine";
import {
  BOT_CHASSIS_GENERATION_PIPELINE,
  FREE_DEFAULT_CHASSIS_ID,
  listStoreMediaPlayers,
  type MediaPlayerChassis,
} from "@/lib/artifacts/PlaylistArtifactEngine";
import {
  equipChassisApi,
  hydrateMediaPlayerOwnership,
  ownsChassis,
  purchaseChassisWithPointsApi,
  purchaseChassisWithStripe,
  unequipChassisApi,
  getEquippedChassisId,
} from "@/lib/artifacts/MediaPlayerInventory";
import { getTmiPoints, spendTmiPoints } from "@/lib/progression/ProgressionEngine";

type ShopSection = "personal" | "tmi";

/** Display-only names. A listed provider is not a connection and has no adapter. */
const ADD_STORE_CATALOG = [
  "Shopify",
  "Bandcamp",
  "Gumroad",
  "WooCommerce",
  "BigCommerce",
  "Squarespace",
  "Wix",
  "Printful",
  "Printify",
  "Sellfy",
  "Etsy",
  "Eventbrite",
  "Dice",
  "AXS",
  "Ticketmaster",
  "Patreon",
  "TikTok Shop",
  "Instagram/Facebook Shop",
  "Amazon Seller",
  "eBay Seller",
  "Square",
  "Custom Store",
] as const;

function connectorLabel(id: string): string {
  return getCommerceConnector(id as CommerceConnectorId)?.label ?? id;
}

function shelvesFor(products: readonly CreatorProduct[]): Array<{ id: string; label: string; products: CreatorProduct[] }> {
  const groups = new Map<string, CreatorProduct[]>();
  for (const product of products) {
    const list = groups.get(product.connectorId) ?? [];
    list.push(product);
    groups.set(product.connectorId, list);
  }
  const rank = new Map(COMMERCE_CONNECTOR_PROVIDERS.map((provider, index) => [provider.id, index]));
  return [...groups.keys()]
    .sort((a, b) => {
      const ra = rank.get(a as CommerceConnectorId) ?? 1000;
      const rb = rank.get(b as CommerceConnectorId) ?? 1000;
      if (ra !== rb) return ra - rb;
      return a.localeCompare(b);
    })
    .map((id) => ({
      id,
      label: connectorLabel(id),
      products: sortCreatorProductsNewestFirst(groups.get(id) ?? []),
    }))
    .filter((shelf) => shelf.products.length > 0);
}

export interface ShopDrawerPanelProps {
  /** Session role — gates TMI cosmetic emphasis (Rule 26). */
  role: "fan" | "performer";
  /** Fallback when no ACTIVE_PERFORMER (performer hub → self). Ignored in contextual mode. */
  fallbackPerformerId?: string;
  accentColor?: string;
  /** contextual = the performer currently in view. mixed = legacy personal + TMI store. */
  inventoryMode?: "contextual" | "mixed";
}

export default function ShopDrawerPanel({
  role,
  fallbackPerformerId,
  accentColor = "#FF6B35",
  inventoryMode = "mixed",
}: ShopDrawerPanelProps) {
  const { activePerformer, resolvePerformerId } = useActivePerformer();
  const performerId = inventoryMode === "contextual"
    ? (activePerformer?.id ?? null)
    : resolvePerformerId(fallbackPerformerId);
  const name =
    activePerformer?.name ??
    (performerId ? getPerformerById(performerId)?.name : undefined) ??
    performerId ??
    "Artist";

  const [section, setSection] = useState<ShopSection>("personal");
  const [products, setProducts] = useState<CreatorProduct[]>([]);
  const [storeUrl, setStoreUrl] = useState<string | null>(null);
  const [storeFilter, setStoreFilter] = useState("all");
  const managesStores = role === "performer" && inventoryMode !== "contextual";
  const [shopUserId, setShopUserId] = useState("local-user");
  const [pointsBalance, setPointsBalance] = useState(0);
  const [buyMsg, setBuyMsg] = useState<string | null>(null);
  const [ownedTick, setOwnedTick] = useState(0);
  const [equippedId, setEquippedId] = useState(FREE_DEFAULT_CHASSIS_ID);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    setStoreFilter("all");
    if (!performerId) {
      setProducts([]);
      setStoreUrl(null);
      return;
    }
    const rows = listCreatorProducts(performerId).filter((product) =>
      managesStores ? product.visibility !== "DRAFT" : product.visibility === "PUBLIC",
    );
    setProducts(rows);
    setStoreUrl(resolveArtistBuyUrl(getPerformerStorefrontLink(performerId)));
  }, [performerId, managesStores]);

  const shelves = useMemo(() => shelvesFor(products), [products]);
  const visibleShelves = storeFilter === "all" ? shelves : shelves.filter((shelf) => shelf.id === storeFilter);

  useEffect(() => {
    if (storeFilter !== "all" && !shelves.some((shelf) => shelf.id === storeFilter)) {
      setStoreFilter("all");
    }
  }, [shelves, storeFilter]);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/session", { credentials: "include", cache: "no-store" })
      .then((r) => r.json())
      .then((d: { user?: { id?: string } | null; authenticated?: boolean }) => {
        if (!active) return;
        const id = d.user?.id ?? "local-user";
        setShopUserId(id);
      })
      .catch(() => {
        if (active) setShopUserId("local-user");
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    hydrateMediaPlayerOwnership(shopUserId).then((state) => {
      if (!active) return;
      setPointsBalance(
        state.authenticated ? state.pointsBalance : getTmiPoints(shopUserId),
      );
      setEquippedId(state.equippedChassisId);
    });
    return () => {
      active = false;
    };
  }, [shopUserId, ownedTick]);

  const tmiItems = useMemo(() => {
    const base = [...FAN_ITEMS, ...LOBBY_ITEMS].filter((i) => i.category !== "tickets");
    return base;
  }, []);

  const mediaPlayers = useMemo(() => listStoreMediaPlayers(), []);

  async function buyChassisWithPoints(chassis: MediaPlayerChassis) {
    setBuyMsg(null);
    setBusyId(chassis.id);
    if (ownsChassis(shopUserId, chassis.id)) {
      setBuyMsg(`Already owned: ${chassis.label}`);
      setBusyId(null);
      return;
    }
    const cost = chassis.pricePoints ?? 299;
    const result = await purchaseChassisWithPointsApi(shopUserId, chassis.id, () =>
      spendTmiPoints(shopUserId, cost, `media_player_${chassis.id}`),
    );
    setBuyMsg(
      result.ok
        ? `${result.message} Equip below or in Media Player Studio.`
        : result.message,
    );
    if (result.state) {
      setPointsBalance(
        result.state.authenticated
          ? result.state.pointsBalance
          : getTmiPoints(shopUserId),
      );
      setEquippedId(result.state.equippedChassisId);
    }
    setOwnedTick((n) => n + 1);
    setBusyId(null);
  }

  async function buyChassisWithStripe(chassis: MediaPlayerChassis) {
    setBuyMsg(null);
    setBusyId(chassis.id);
    if (ownsChassis(shopUserId, chassis.id)) {
      setBuyMsg(`Already owned: ${chassis.label}`);
      setBusyId(null);
      return;
    }
    const result = await purchaseChassisWithStripe(chassis.id);
    if (!result.ok || !result.url) {
      setBuyMsg(result.message ?? "Stripe checkout unavailable");
      setBusyId(null);
      return;
    }
    window.location.href = result.url;
  }

  async function toggleEquip(chassis: MediaPlayerChassis) {
    setBuyMsg(null);
    setBusyId(chassis.id);
    const currently = getEquippedChassisId(shopUserId);
    if (currently === chassis.id) {
      await unequipChassisApi(shopUserId);
      setEquippedId(FREE_DEFAULT_CHASSIS_ID);
      setBuyMsg(`Unequipped ${chassis.label} · Standard Player active.`);
    } else {
      const result = await equipChassisApi(shopUserId, chassis.id);
      if (!result.ok) {
        setBuyMsg(result.message ?? "Cannot equip");
      } else {
        setEquippedId(chassis.id);
        setBuyMsg(`Equipped ${chassis.label}.`);
      }
    }
    setOwnedTick((n) => n + 1);
    setBusyId(null);
  }

  function hideProduct(product: CreatorProduct) {
    if (!performerId) return;
    upsertCreatorProduct({ ...product, visibility: "DRAFT" });
    setProducts(listCreatorProducts(performerId).filter((row) => row.visibility !== "DRAFT"));
  }

  function disconnectStorefront() {
    if (!performerId) return;
    clearPerformerStorefrontLink(performerId);
    setStoreUrl(null);
  }

  if (inventoryMode === "contextual" && !performerId) {
    return (
      <div data-shop-mode="contextual" data-shop-owner-id="" data-testid="performer-shop-drawer" style={{ padding: 12 }}>
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.16em", color: accentColor }}>PERFORMER SHOP</div>
        <p style={{ margin: "8px 0 0", fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
          No performer is in view. Open a performer, then open Performer Shop.
        </p>
      </div>
    );
  }

  if (inventoryMode === "contextual" && products.length === 0) {
    return (
      <div data-shop-mode="contextual" data-shop-owner-id={performerId ?? ""} data-testid="performer-shop-drawer" style={{ padding: 12 }}>
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.16em", color: accentColor }}>PERFORMER SHOP</div>
        <p style={{ margin: "8px 0 0", fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
          This performer has no published items.
        </p>
      </div>
    );
  }

  return (
    <div data-shop-mode={inventoryMode} data-shop-owner-id={performerId ?? ""} data-testid="performer-shop-drawer" data-product-order="newest-to-oldest" data-fan-default-all="all" data-store-filter={storeFilter} style={{ padding: 12, display: "flex", flexDirection: "column", gap: 12, overflowX: "hidden", overflowY: "auto", minWidth: 0, maxWidth: "100%" }}>
      <div>
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.16em", color: accentColor }}>
          SHOP
        </div>
        <p style={{ margin: "4px 0 0", fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.4 }}>
          Personal Store follows ACTIVE_PERFORMER. TMI Store is platform-global (cosmetics, boosters, Media Players).
        </p>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {(
          inventoryMode === "contextual"
            ? ([{ id: "personal" as const, label: "PERFORMER SHOP" }] as const)
            : ([
                { id: "personal" as const, label: "PERSONAL STORE" },
                { id: "tmi" as const, label: "TMI STORE" },
              ] as const)
        ).map((s) => {
          const active = section === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setSection(s.id)}
              style={{
                fontSize: 8,
                fontWeight: 900,
                letterSpacing: "0.06em",
                padding: "5px 9px",
                borderRadius: 6,
                cursor: "pointer",
                fontFamily: "inherit",
                border: active ? `1px solid ${accentColor}` : "1px solid rgba(255,255,255,0.12)",
                background: active ? `${accentColor}22` : "transparent",
                color: active ? accentColor : "rgba(255,255,255,0.45)",
              }}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {section === "personal" ? (
        <div
          key={performerId ?? "none"}
          style={{ display: "flex", flexDirection: "column", gap: 10, animation: "tmiShopFade 0.28s ease" }}
        >
          <style>{`@keyframes tmiShopFade{from{opacity:0.35}to{opacity:1}}`}</style>
          {!performerId ? (
            <Empty
              accent={accentColor}
              title="NO ACTIVE PERFORMER"
              body="Select a performer to load their connected commerce. Personal Store is empty until then."
            />
          ) : (
            <div data-shop-inventory-owner-id={performerId} style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 0 }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>
                {name}
                {products.length > 0 ? ` · ${products.length} item${products.length === 1 ? "" : "s"}` : ""}
              </div>
              {shelves.length > 0 ? (
                <div data-testid="shop-store-switcher" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <FilterChip
                    active={storeFilter === "all"}
                    accent={accentColor}
                    label="ALL STORES"
                    onClick={() => setStoreFilter("all")}
                  />
                  {shelves.map((shelf) => (
                    <FilterChip
                      key={shelf.id}
                      active={storeFilter === shelf.id}
                      accent={accentColor}
                      label={shelf.label}
                      onClick={() => setStoreFilter(shelf.id)}
                    />
                  ))}
                </div>
              ) : managesStores ? null : (
                <Empty
                  accent={accentColor}
                  title="NO PERSONAL STORE ITEMS"
                  body={`${name} has no published items from a linked store.`}
                />
              )}
              {visibleShelves.map((shelf) => (
                <section key={shelf.id} data-shop-shelf={shelf.id} data-shelf-count={shelf.products.length} style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.12em", color: accentColor, marginBottom: 6 }}>
                    {shelf.label}
                  </div>
                  <div
                    data-shelf-scroll="horizontal"
                    style={{
                      display: "flex",
                      gap: 8,
                      overflowX: "auto",
                      overflowY: "hidden",
                      maxWidth: "100%",
                      minWidth: 0,
                      paddingBottom: 4,
                    }}
                  >
                    {shelf.products.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        accent={accentColor}
                        canHide={managesStores}
                        onHide={() => hideProduct(product)}
                      />
                    ))}
                  </div>
                </section>
              ))}
              {managesStores && storeUrl ? (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  <a href={storeUrl} target="_blank" rel="noreferrer" data-checkout-owner="EXTERNAL_PROVIDER" style={linkStyle(accentColor)}>
                    Open storefront URL
                  </a>
                  <button type="button" onClick={disconnectStorefront} style={btnStyle("rgba(255,255,255,0.7)")}>
                    DISCONNECT URL
                  </button>
                </div>
              ) : null}
              {managesStores ? (
                <div data-testid="add-store-catalog">
                  <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.12em", color: accentColor }}>+ ADD STORE</div>
                  <ul style={{ listStyle: "none", margin: "8px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                    {ADD_STORE_CATALOG.map((label) => (
                      <li key={label} data-provider-connection="none" style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 11, color: "rgba(255,255,255,0.72)" }}>
                        <span>{label}</span>
                        <span style={{ color: "rgba(255,255,255,0.45)", letterSpacing: "0.06em", fontSize: 9, fontWeight: 800 }}>COMING LATER</span>
                      </li>
                    ))}
                  </ul>
                  <p style={{ margin: "6px 0 0", fontSize: 10, color: "rgba(255,255,255,0.38)", lineHeight: 1.4 }}>
                    These names are not connections. No seller OAuth, catalog read, or order read is available for them.
                  </p>
                </div>
              ) : null}
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>
            Platform catalog — same for every active performer. Avatar/cosmetics primarily Fan (Rule 26).
          </div>

          <RoleGate
            allow={role === "fan" ? ["FAN", "ADMIN", "STAFF"] : ["FAN", "PERFORMER", "ARTIST", "ADMIN", "STAFF"]}
            fallback={
              <Empty
                accent={accentColor}
                title="SIGN IN REQUIRED"
                body="TMI Store requires a signed-in session."
              />
            }
          >
            <>
              <SectionTitle color="#00FFFF">MEMBERSHIPS · TIPS · LOBBY SKINS</SectionTitle>
              <ItemGrid items={tmiItems} />

              <SectionTitle color="#FF2DAA">MEDIA PLAYERS · RARE (~299 PTS / $2.99)</SectionTitle>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
                Balance: {pointsBalance} pts · Free default: Standard TMI Player · Equipped:{" "}
                {equippedId}
              </div>
              {buyMsg ? (
                <div
                  style={{
                    fontSize: 11,
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: buyMsg.startsWith("Not enough") || buyMsg.includes("unavailable") || buyMsg.includes("Cannot")
                      ? "1px solid rgba(255,80,80,0.4)"
                      : "1px solid rgba(0,255,136,0.35)",
                    color:
                      buyMsg.startsWith("Not enough") || buyMsg.includes("unavailable") || buyMsg.includes("Cannot")
                        ? "#ffb0b0"
                        : "#9dffc8",
                    background: "rgba(0,0,0,0.25)",
                  }}
                >
                  {buyMsg}
                </div>
              ) : null}
              <ul
                style={{
                  margin: 0,
                  padding: 0,
                  listStyle: "none",
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                  gap: 8,
                }}
              >
                {mediaPlayers.map((s) => {
                  const owned = ownsChassis(shopUserId, s.id);
                  const equipped = equippedId === s.id;
                  const pts = s.pricePoints ?? 299;
                  const usd =
                    s.priceUsdCents != null
                      ? `$${(s.priceUsdCents / 100).toFixed(2)}`
                      : "$2.99";
                  const busy = busyId === s.id;
                  return (
                    <li key={s.id}>
                      <MediaPlayerChassisPreview
                        chassis={s}
                        owned={owned}
                        equipped={equipped}
                        previewOnly={!owned}
                        footer={
                          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 4 }}>
                            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)" }}>
                              Rare · {pts} pts · {usd}
                            </div>
                            {owned ? (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => toggleEquip(s)}
                                style={btnStyle(s.accent)}
                              >
                                {equipped ? "UNEQUIP" : "EQUIP"}
                              </button>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  disabled={busy}
                                  onClick={() => buyChassisWithPoints(s)}
                                  style={btnStyle(s.accent)}
                                >
                                  BUY {pts} PTS
                                </button>
                                <button
                                  type="button"
                                  disabled={busy}
                                  onClick={() => buyChassisWithStripe(s)}
                                  style={btnStyle("#FFD700")}
                                >
                                  BUY {usd}
                                </button>
                              </>
                            )}
                          </div>
                        }
                      />
                    </li>
                  );
                })}
              </ul>
              <div
                style={{
                  fontSize: 9,
                  color: "rgba(255,255,255,0.35)",
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: "1px dashed rgba(255,255,255,0.12)",
                }}
              >
                {BOT_CHASSIS_GENERATION_PIPELINE.label}: {BOT_CHASSIS_GENERATION_PIPELINE.status} —{" "}
                {BOT_CHASSIS_GENERATION_PIPELINE.note}
              </div>

              {role === "fan" ? (
                <Link href="/store/fan" style={linkStyle("#FF2DAA")}>
                  Full Fan Store →
                </Link>
              ) : (
                <Link href="/store" style={linkStyle(accentColor)}>
                  Full Store →
                </Link>
              )}
            </>
          </RoleGate>
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  accent,
  label,
  onClick,
}: {
  active: boolean;
  accent: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        fontSize: 8,
        fontWeight: 900,
        letterSpacing: "0.06em",
        padding: "5px 9px",
        borderRadius: 6,
        cursor: "pointer",
        fontFamily: "inherit",
        border: active ? `1px solid ${accent}` : "1px solid rgba(255,255,255,0.12)",
        background: active ? `${accent}22` : "transparent",
        color: active ? accent : "rgba(255,255,255,0.45)",
      }}
    >
      {label}
    </button>
  );
}

function ProductCard({
  product,
  accent,
  canHide,
  onHide,
}: {
  product: CreatorProduct;
  accent: string;
  canHide: boolean;
  onHide: () => void;
}) {
  const price = formatCreatorProductPrice(product);
  const image = product.imageUrl && /^https?:\/\//i.test(product.imageUrl) ? product.imageUrl : null;
  const buyUrl = product.buyUrl && /^https?:\/\//i.test(product.buyUrl) ? product.buyUrl : null;
  return (
    <article
      data-product-id={product.id}
      data-checkout-owner={buyUrl ? "EXTERNAL_PROVIDER" : "NONE"}
      data-media={image ? (product.type === "SINGLE" || product.type === "ALBUM" || product.type === "VINYL" ? "artwork" : "2d-photo") : "none"}
      style={{
        flex: "0 0 148px",
        width: 148,
        borderRadius: 8,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(0,0,0,0.28)",
        padding: 8,
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      {image ? (
        <img src={image} alt={product.title} style={{ width: "100%", height: 88, objectFit: "cover", borderRadius: 6 }} />
      ) : null}
      <div style={{ fontSize: 11, fontWeight: 800, color: "#fff", lineHeight: 1.3 }}>{product.title}</div>
      {price ? <div style={{ fontSize: 11, fontWeight: 900, color: accent }}>{price}</div> : null}
      {buyUrl ? (
        <a href={buyUrl} target="_blank" rel="noreferrer" data-checkout-owner="EXTERNAL_PROVIDER" style={linkStyle(accent)}>
          Buy on {connectorLabel(product.connectorId)}
        </a>
      ) : null}
      {canHide ? (
        <button type="button" onClick={onHide} style={btnStyle("rgba(255,255,255,0.55)")}>
          HIDE
        </button>
      ) : null}
    </article>
  );
}

function btnStyle(color: string): CSSProperties {
  return {
    fontSize: 9,
    fontWeight: 900,
    letterSpacing: "0.04em",
    padding: "6px 8px",
    borderRadius: 6,
    border: `1px solid ${color}88`,
    background: `${color}22`,
    color,
    cursor: "pointer",
    fontFamily: "inherit",
    width: "100%",
  };
}

function SectionTitle({ children, color }: { children: ReactNode; color: string }) {
  return (
    <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.12em", color }}>{children}</div>
  );
}

function ItemGrid({ items }: { items: StoreItem[] }) {
  if (items.length === 0) {
    return (
      <Empty
        accent="#00FFFF"
        title="NO TMI STORE ITEMS"
        body="Platform catalog is empty in this build."
      />
    );
  }
  return (
    <ul
      style={{
        margin: 0,
        padding: 0,
        listStyle: "none",
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      {items.map((item) => (
        <li
          key={item.id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 8,
            alignItems: "center",
            padding: "8px 10px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(0,0,0,0.22)",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>
              {item.icon} {item.name}
            </div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
              {item.description}
            </div>
          </div>
          <a href={getCheckoutUrl(item)} style={linkStyle("#00FFFF")}>
            {formatPrice(item.price)}
          </a>
        </li>
      ))}
    </ul>
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
