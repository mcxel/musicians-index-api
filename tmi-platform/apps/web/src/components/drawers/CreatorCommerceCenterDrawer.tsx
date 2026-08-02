"use client";

/**
 * CreatorCommerceCenterDrawer — first-class Living OS Commerce Center.
 *
 * Sections: Overview · Products · Music · Beats · Merch · YoPho Collectibles ·
 * Experiences · Memberships · Licenses · Orders · Analytics · Payouts · Settings.
 *
 * Wires real panels where they exist. Honest empty for Orders / Customers / Commerce AI.
 * No ticket inventory creation (Rule 17). Measured asset counts only (Rule 20).
 */

import { useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import CommerceConnectorPanel from "@/components/commerce/CommerceConnectorPanel";
import DistributorConnectorPanel from "@/components/commerce/DistributorConnectorPanel";
import CreatorOwnershipPortfolio from "@/components/commerce/CreatorOwnershipPortfolio";
import ListenOwnTrackCard from "@/components/commerce/ListenOwnTrackCard";
import { StoreCanister } from "@/components/canisters/StoreCanister";
import {
  CREATOR_PRODUCT_TYPE_LABELS,
  formatCreatorProductPrice,
  listAllCreatorProductsForOwner,
  type CreatorProductType,
} from "@/lib/commerce/CreatorProductRegistry";
import { getLivingCatalogForPerformer } from "@/lib/commerce/LivingCatalog";
import { listBeatCatalog } from "@/lib/beats/BeatStoreEngine";
import {
  getCurrentEdition,
  listArchivedEditions,
  listEditionsForCreator,
} from "@/lib/yopho/YoPhoEditionEngine";
import { interactiveCardPath } from "@/lib/yopho/YoPhoCardRegistry";

type CommerceSectionId =
  | "overview"
  | "products"
  | "music"
  | "beats"
  | "merch"
  | "yopho"
  | "experiences"
  | "memberships"
  | "licenses"
  | "orders"
  | "analytics"
  | "payouts"
  | "settings";

const SECTIONS: { id: CommerceSectionId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "products", label: "Products" },
  { id: "music", label: "Music" },
  { id: "beats", label: "Beats" },
  { id: "merch", label: "Merch" },
  { id: "yopho", label: "YoPho Collectibles" },
  { id: "experiences", label: "Experiences" },
  { id: "memberships", label: "Memberships" },
  { id: "licenses", label: "Licenses" },
  { id: "orders", label: "Orders" },
  { id: "analytics", label: "Analytics" },
  { id: "payouts", label: "Payouts" },
  { id: "settings", label: "Settings" },
];

export interface CreatorCommerceCenterDrawerProps {
  performerId: string;
  displayName: string;
  accentColor?: string;
  /** Swap to YoPho studio drawer when available. */
  onOpenYoPho?: () => void;
  /** Swap to Beat Marketplace drawer when available. */
  onOpenBeatMarketplace?: () => void;
}

function emptyBlock(title: string, body: string, accent: string) {
  return (
    <div
      style={{
        padding: 14,
        borderRadius: 10,
        border: `1px solid ${accent}33`,
        background: "rgba(0,0,0,0.28)",
      }}
    >
      <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.12em", color: accent, marginBottom: 6 }}>
        {title}
      </div>
      <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.45 }}>{body}</p>
    </div>
  );
}

export default function CreatorCommerceCenterDrawer({
  performerId,
  displayName,
  accentColor = "#FFD700",
  onOpenYoPho,
  onOpenBeatMarketplace,
}: CreatorCommerceCenterDrawerProps) {
  const ac = accentColor;
  const [section, setSection] = useState<CommerceSectionId>("overview");

  const products = useMemo(
    () => listAllCreatorProductsForOwner(performerId),
    [performerId, section],
  );
  const catalog = useMemo(() => getLivingCatalogForPerformer(performerId), [performerId, section]);
  const beats = useMemo(
    () => listBeatCatalog({ producerSlug: performerId }),
    [performerId, section],
  );
  const yophoCurrent = useMemo(() => getCurrentEdition(performerId), [performerId, section]);
  const yophoArchived = useMemo(() => listArchivedEditions(performerId), [performerId, section]);
  const yophoAll = useMemo(() => listEditionsForCreator(performerId), [performerId, section]);

  const byType = (type: CreatorProductType) => products.filter((p) => p.type === type);

  return (
    <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.16em", color: ac }}>
          CREATOR COMMERCE CENTER
        </div>
        <p style={{ margin: "6px 0 0", fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.45 }}>
          Sell Own/Support on TMI. Keep your distributor for global DSPs. No ticket inventory here (Rule 17).
          Counts only — no estimated portfolio dollars (Rule 20).
        </p>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {SECTIONS.map((s) => {
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
                border: active ? `1px solid ${ac}` : "1px solid rgba(255,255,255,0.12)",
                background: active ? `${ac}22` : "transparent",
                color: active ? ac : "rgba(255,255,255,0.45)",
              }}
            >
              {s.label.toUpperCase()}
            </button>
          );
        })}
      </div>

      {section === "overview" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <CreatorOwnershipPortfolio performerSlug={performerId} accentColor={ac} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <StatChip label="Products" value={products.length} accent={ac} />
            <StatChip label="Catalog tracks" value={catalog.length} accent={ac} />
            <StatChip label="Beats listed" value={beats.length} accent={ac} />
            <StatChip label="YoPho editions" value={yophoAll.length} accent={ac} />
          </div>
          {emptyBlock(
            "COMMERCE AI",
            "No Commerce AI recommendations yet. This surface stays empty until a real engine is wired.",
            ac,
          )}
          {emptyBlock(
            "CUSTOMERS",
            "No customer list yet. Buyers will appear here once order history is connected.",
            ac,
          )}
        </div>
      ) : null}

      {section === "products" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <CommerceConnectorPanel performerId={performerId} accentColor={ac} />
          {products.length === 0 ? (
            emptyBlock(
              "PRODUCTS",
              "No linked products yet. Add products via the Shopify / storefront connector above.",
              ac,
            )
          ) : (
            <ProductList products={products} accent={ac} />
          )}
        </div>
      ) : null}

      {section === "music" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <DistributorConnectorPanel performerId={performerId} accentColor="#00FFFF" />
          {catalog.length === 0 ? (
            emptyBlock(
              "MUSIC",
              "No catalog tracks yet. Link a distributor profile or add songs in your Media Locker.",
              "#00FFFF",
            )
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {catalog.slice(0, 8).map((t) => (
                <ListenOwnTrackCard key={t.id} track={t} accentColor={ac} compact />
              ))}
            </div>
          )}
        </div>
      ) : null}

      {section === "beats" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {onOpenBeatMarketplace ? (
              <button type="button" onClick={onOpenBeatMarketplace} style={ctaBtn("#FFD700")}>
                Open Beat Marketplace drawer →
              </button>
            ) : null}
            <Link href="/beat-vault" style={ctaBtn("#FFD700")}>
              Open Beat Vault →
            </Link>
            <Link href="/beat-marketplace" style={ctaBtn("rgba(255,215,0,0.7)")}>
              Browse Beat Marketplace →
            </Link>
          </div>
          {beats.length === 0
            ? emptyBlock(
                "BEATS",
                "No beats listed for this performer yet. Submit or list beats in Beat Vault / Marketplace.",
                "#FFD700",
              )
            : (
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
                {beats.length} beat{beats.length === 1 ? "" : "s"} in marketplace catalog (measured count).
              </div>
            )}
        </div>
      ) : null}

      {section === "merch" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <StoreCanister
            entityId={performerId}
            entityName={displayName}
            storeType="performer"
            accentColor={ac}
          />
          {byType("MERCH").length === 0
            ? emptyBlock("MERCH LINKS", "No merch product links yet. Add MERCH products in Products.", ac)
            : <ProductList products={byType("MERCH")} accent={ac} />}
        </div>
      ) : null}

      {section === "yopho" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {onOpenYoPho ? (
            <button type="button" onClick={onOpenYoPho} style={ctaBtn("#FF2DAA")}>
              Open YoPho Studio →
            </button>
          ) : (
            <Link href="/hub/performer?drawer=yopho" style={ctaBtn("#FF2DAA")}>
              Open YoPho Studio →
            </Link>
          )}
          {yophoCurrent ? (
            <div
              style={{
                padding: 12,
                borderRadius: 10,
                border: "1px solid rgba(255,45,170,0.4)",
                background: "rgba(255,45,170,0.08)",
              }}
            >
              <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.12em", color: "#FF2DAA" }}>
                CURRENT EDITION · #{yophoCurrent.editionNumber}
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginTop: 4 }}>
                {yophoCurrent.title}
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>
                {yophoCurrent.availability}
                {yophoCurrent.publishedAt
                  ? ` · published ${new Date(yophoCurrent.publishedAt).toLocaleDateString()}`
                  : ""}
              </div>
              <Link
                href={interactiveCardPath(yophoCurrent.id)}
                style={{ display: "inline-block", marginTop: 8, fontSize: 11, color: "#00E5FF", fontWeight: 700 }}
              >
                Open card →
              </Link>
            </div>
          ) : (
            emptyBlock(
              "YOPHO COLLECTIBLES",
              "No published Current edition yet. Publish from YoPho Studio — prior Current editions archive automatically.",
              "#FF2DAA",
            )
          )}
          {yophoArchived.length > 0 ? (
            <div>
              <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.12em", color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>
                ARCHIVED EDITIONS · {yophoArchived.length}
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                {yophoArchived.map((ed) => (
                  <li
                    key={ed.id}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 8,
                      border: "1px solid rgba(255,255,255,0.1)",
                      background: "rgba(0,0,0,0.25)",
                      fontSize: 11,
                      color: "rgba(255,255,255,0.65)",
                    }}
                  >
                    #{ed.editionNumber} · {ed.title}
                    <span style={{ color: "rgba(255,255,255,0.35)", marginLeft: 8 }}>
                      fans keep collected copies
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      {section === "experiences" ? (
        byType("EXPERIENCE").length === 0
          ? emptyBlock(
              "EXPERIENCES",
              "No experience products linked yet. Add EXPERIENCE type products in Products (no ticket inventory — Rule 17).",
              ac,
            )
          : <ProductList products={byType("EXPERIENCE")} accent={ac} />
      ) : null}

      {section === "memberships" ? (
        emptyBlock(
          "MEMBERSHIPS",
          "No fan-club / membership SKUs yet. Wire real membership products here when Stripe memberships are connected.",
          ac,
        )
      ) : null}

      {section === "licenses" ? (
        byType("BEAT_LICENSE").length === 0
          ? emptyBlock(
              "LICENSES",
              "No beat license products linked yet. List licenses via Beat Marketplace or Products (BEAT_LICENSE).",
              ac,
            )
          : <ProductList products={byType("BEAT_LICENSE")} accent={ac} />
      ) : null}

      {section === "orders" ? (
        emptyBlock(
          "ORDERS",
          "No orders yet. Order history stays empty until real checkout events are connected — never fabricated.",
          ac,
        )
      ) : null}

      {section === "analytics" ? (
        emptyBlock(
          "COMMERCE ANALYTICS",
          "No commerce analytics yet. When wired, this shows measured sales counts from real checkout — never estimated revenue.",
          ac,
        )
      ) : null}

      {section === "payouts" ? (
        emptyBlock(
          "PAYOUTS",
          "No payout ledger yet. Stripe Connect / artist payouts will surface here when connected.",
          ac,
        )
      ) : null}

      {section === "settings" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <CommerceConnectorPanel performerId={performerId} accentColor={ac} />
          <DistributorConnectorPanel performerId={performerId} accentColor="#00FFFF" />
          <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.32)", lineHeight: 1.4 }}>
            Ticket inventory creation is never available in this center (Rule 17 — Venue/Promoter only).
          </p>
        </div>
      ) : null}
    </div>
  );
}

function StatChip({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div
      style={{
        padding: "8px 10px",
        borderRadius: 8,
        background: "rgba(0,0,0,0.25)",
        border: `1px solid ${accent}33`,
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 900, color: "#fff" }}>{value}</div>
      <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", letterSpacing: "0.06em", marginTop: 2 }}>
        {label.toUpperCase()}
      </div>
    </div>
  );
}

function ProductList({
  products,
  accent,
}: {
  products: ReturnType<typeof listAllCreatorProductsForOwner>;
  accent: string;
}) {
  return (
    <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
      {products.map((p) => {
        const price = formatCreatorProductPrice(p);
        return (
          <li
            key={p.id}
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border: `1px solid ${accent}28`,
              background: "rgba(0,0,0,0.22)",
              display: "flex",
              justifyContent: "space-between",
              gap: 8,
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>{p.title}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                {CREATOR_PRODUCT_TYPE_LABELS[p.type]} · {p.visibility}
              </div>
            </div>
            <div style={{ fontSize: 11, color: accent, fontWeight: 800 }}>
              {price ?? "Price on store"}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function ctaBtn(color: string): CSSProperties {
  return {
    display: "inline-block",
    padding: "10px 14px",
    borderRadius: 10,
    border: `1px solid ${color}66`,
    background: `${color}18`,
    color,
    fontWeight: 800,
    fontSize: 12,
    textDecoration: "none",
    cursor: "pointer",
    fontFamily: "inherit",
    width: "fit-content",
  };
}
