"use client";

/**
 * Shop drawer — split UI:
 *   Personal Store = ACTIVE_PERFORMER connected commerce
 *   TMI Store      = platform-global cosmetics / boosters / skins / coins
 *                   (same inventory regardless of active performer)
 *
 * Reuses StoreCanister, FAN_ITEMS / LOBBY_ITEMS, PlaylistArtifactEngine SKIN_REGISTRY.
 * Rule 26: TMI Store cosmetics primarily Fan; no performer ticket invent (Rule 17).
 */

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import RoleGate from "@/components/auth/RoleGate";
import { StoreCanister } from "@/components/canisters/StoreCanister";
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
  SKIN_REGISTRY,
  type ArtifactSkinId,
} from "@/lib/artifacts/PlaylistArtifactEngine";

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

  useEffect(() => {
    if (!performerId) {
      setProducts([]);
      setStoreUrl(null);
      return;
    }
    setProducts(listCreatorProducts(performerId));
    setStoreUrl(resolveArtistBuyUrl(getPerformerStorefrontLink(performerId)));
  }, [performerId]);

  const tmiItems = useMemo(() => {
    // Platform-global: tips/memberships for fans + lobby skins. Exclude tickets (Rule 17 surface).
    const base = [...FAN_ITEMS, ...LOBBY_ITEMS].filter((i) => i.category !== "tickets");
    return base;
  }, []);

  const skins = useMemo(
    () =>
      (Object.keys(SKIN_REGISTRY) as ArtifactSkinId[]).map((id) => ({
        id,
        ...SKIN_REGISTRY[id],
      })),
    [],
  );

  return (
    <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.16em", color: accentColor }}>
          SHOP
        </div>
        <p style={{ margin: "4px 0 0", fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.4 }}>
          Personal Store follows ACTIVE_PERFORMER. TMI Store is platform-global (cosmetics, boosters, skins).
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

              <SectionTitle color="#FF2DAA">PLAYLIST SKINS (REGISTRY)</SectionTitle>
              <ul
                style={{
                  margin: 0,
                  padding: 0,
                  listStyle: "none",
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                  gap: 8,
                }}
              >
                {skins.map((s) => (
                  <li
                    key={s.id}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 8,
                      border: `1px solid ${s.accent}44`,
                      background: `${s.theme}cc`,
                    }}
                  >
                    <div style={{ fontSize: 14 }}>{s.icon}</div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: "#fff", marginTop: 4 }}>
                      {s.label}
                    </div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
                      {s.unlockMethod === "free" && "Free"}
                      {s.unlockMethod === "points" && `${s.pointsCost ?? "—"} pts`}
                      {s.unlockMethod === "premium" &&
                        (s.priceUsd != null ? `$${s.priceUsd.toFixed(2)}` : "Premium")}
                      {s.unlockMethod === "tier" && `Tier · ${s.tierRequired ?? ""}`}
                    </div>
                  </li>
                ))}
              </ul>

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
