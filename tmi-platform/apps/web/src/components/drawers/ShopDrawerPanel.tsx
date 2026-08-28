"use client";

/**
 * Shop drawer — split UI:
 *   Personal Store = ACTIVE_PERFORMER connected commerce
 *   TMI Store      = platform-global cosmetics / boosters / Media Players / coins
 *                   (same inventory regardless of active performer)
 *
 * Reuses StoreCanister, FAN_ITEMS / LOBBY_ITEMS, MEDIA_PLAYER_CHASSIS_REGISTRY
 * (SKIN_REGISTRY alias — Rule 19, no second store).
 * Rule 26: TMI Store cosmetics primarily Fan; no performer ticket invent (Rule 17).
 * Stage 2: durable ownership + Stripe OR points + equip.
 */

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import RoleGate from "@/components/auth/RoleGate";
import { StoreCanister } from "@/components/canisters/StoreCanister";
import MediaPlayerChassisPreview from "@/components/media/MediaPlayerChassisPreview";
import { useActivePerformer } from "@/lib/context/ActivePerformerContext";
import {
  listCreatorProducts,
  type CreatorProduct,
} from "@/lib/commerce/CreatorProductRegistry";
import {
  getPerformerStorefrontLink,
  resolveArtistBuyUrl,
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

export interface ShopDrawerPanelProps {
  /** Session role — gates TMI cosmetic emphasis (Rule 26). */
  role: "fan" | "performer";
  /** Fallback when no ACTIVE_PERFORMER (performer hub → self). */
  fallbackPerformerId?: string;
  accentColor?: string;
}

export default function ShopDrawerPanel({
  role,
  fallbackPerformerId,
  accentColor = "#FF6B35",
}: ShopDrawerPanelProps) {
  const { activePerformer, resolvePerformerId } = useActivePerformer();
  const performerId = resolvePerformerId(fallbackPerformerId);
  const name =
    activePerformer?.name ??
    (performerId ? getPerformerById(performerId)?.name : undefined) ??
    performerId ??
    "Artist";

  const [section, setSection] = useState<ShopSection>("personal");
  const [products, setProducts] = useState<CreatorProduct[]>([]);
  const [storeUrl, setStoreUrl] = useState<string | null>(null);
  const [shopUserId, setShopUserId] = useState("local-user");
  const [pointsBalance, setPointsBalance] = useState(0);
  const [buyMsg, setBuyMsg] = useState<string | null>(null);
  const [ownedTick, setOwnedTick] = useState(0);
  const [equippedId, setEquippedId] = useState(FREE_DEFAULT_CHASSIS_ID);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!performerId) {
      setProducts([]);
      setStoreUrl(null);
      return;
    }
    setProducts(listCreatorProducts(performerId));
    setStoreUrl(resolveArtistBuyUrl(getPerformerStorefrontLink(performerId)));
  }, [performerId]);

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

  return (
    <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 12 }}>
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
          [
            { id: "personal" as const, label: "PERSONAL STORE" },
            { id: "tmi" as const, label: "TMI STORE" },
          ] as const
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
            <>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>
                Connected commerce · <strong style={{ color: "#fff" }}>{name}</strong>
                {products.length > 0 ? ` · ${products.length} product${products.length === 1 ? "" : "s"}` : ""}
              </div>
              {products.length === 0 && !storeUrl ? (
                <Empty
                  accent={accentColor}
                  title="NO PERSONAL STORE ITEMS"
                  body={`${name} has no linked products or storefront yet.`}
                />
              ) : null}
              {storeUrl ? (
                <a href={storeUrl} target="_blank" rel="noreferrer" style={linkStyle(accentColor)}>
                  Open artist storefront →
                </a>
              ) : null}
              <StoreCanister
                entityId={performerId}
                artistSlug={activePerformer?.slug ?? performerId}
                entityName={name}
                storeType="performer"
                accentColor={accentColor}
                maxItems={8}
              />
            </>
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
