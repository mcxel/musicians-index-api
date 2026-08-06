"use client";

/**
 * TMIStorePanel — platform-owned asset store.
 *
 * Mounts inside the `tmi_store` drawer module.
 * Available to all roles (fan + performer). Fan cosmetics gated by Rule 26
 * (avatar items shown to fans only via RoleGate at the call site).
 *
 * Items sourced from StoreItemEngine — no fake data (Rule 20).
 * Lifecycle badges (LIMITED, HOT, LAUNCH, NEW) drive shelf ordering.
 * Bot-automated lifecycle per TMICommerceConstitution Rule 6.
 */

import React, { useMemo, useState } from "react";
import {
  FAN_ITEMS,
  LOBBY_ITEMS,
  VENUE_ITEMS,
  formatPrice,
  getCheckoutUrl,
  type StoreItem,
  type StoreCategory,
} from "@/lib/store/StoreItemEngine";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TMIStorePanelProps {
  /** Rule 26: "fan" sees avatar/emote/cosmetic shelf; "performer" sees venue/stage shelf. */
  role?: "fan" | "performer";
  accentColor?: string;
}

type StoreShelf = "featured" | "fan" | "venue" | "lobby";

const SHELVES: { id: StoreShelf; label: string; icon: string; roles: string[] }[] = [
  { id: "featured", label: "FEATURED", icon: "⭐", roles: ["fan", "performer"] },
  { id: "fan", label: "AVATAR & COINS", icon: "🧑‍🎤", roles: ["fan"] },
  { id: "venue", label: "VENUE SKINS", icon: "🏟️", roles: ["performer"] },
  { id: "lobby", label: "LOBBY THEMES", icon: "🌆", roles: ["fan", "performer"] },
];

const BADGE_STYLES: Record<string, { bg: string; color: string }> = {
  LIMITED: { bg: "rgba(255,215,0,0.18)", color: "#FFD700" },
  HOT: { bg: "rgba(255,45,170,0.18)", color: "#FF2DAA" },
  LAUNCH: { bg: "rgba(0,255,255,0.14)", color: "#00FFFF" },
  NEW: { bg: "rgba(170,45,255,0.18)", color: "#AA2DFF" },
};

// ─── Item Card ────────────────────────────────────────────────────────────────

function ItemCard({
  item,
  accent,
}: {
  item: StoreItem;
  accent: string;
}) {
  const checkoutUrl = getCheckoutUrl(item);

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: `1px solid ${accent}22`,
        borderRadius: 10,
        padding: "14px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        position: "relative",
      }}
    >
      {item.badge && BADGE_STYLES[item.badge] && (
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            ...BADGE_STYLES[item.badge],
            borderRadius: 4,
            padding: "2px 7px",
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: "0.08em",
          }}
        >
          {item.badge}
        </div>
      )}

      <div style={{ fontSize: 28 }}>{item.icon}</div>

      <div>
        <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, lineHeight: 1.3 }}>
          {item.name}
        </div>
        <div style={{ color: "#888", fontSize: 11, marginTop: 3, lineHeight: 1.4 }}>
          {item.description}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "auto",
        }}
      >
        <div style={{ color: accent, fontWeight: 800, fontSize: 15 }}>
          {item.mode === "subscription"
            ? `${formatPrice(item.price)}/mo`
            : formatPrice(item.price)}
        </div>
        <a
          href={checkoutUrl}
          style={{
            background: `${accent}22`,
            color: accent,
            border: `1px solid ${accent}44`,
            borderRadius: 6,
            padding: "5px 12px",
            fontSize: 11,
            fontWeight: 700,
            cursor: "pointer",
            letterSpacing: "0.05em",
            textDecoration: "none",
            display: "inline-block",
          }}
        >
          GET
        </a>
      </div>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

export default function TMIStorePanel({
  role = "fan",
  accentColor = "#AA2DFF",
}: TMIStorePanelProps) {
  const [activeShelf, setActiveShelf] = useState<StoreShelf>("featured");

  const availableShelves = SHELVES.filter((s) => s.roles.includes(role));

  const items = useMemo<StoreItem[]>(() => {
    // Filter out tickets — Rule 17: ticket inventory is Venue/Promoter-only.
    const noTickets = (items: StoreItem[]) =>
      items.filter((i) => i.category !== "tickets");

    switch (activeShelf) {
      case "featured":
        return noTickets([...FAN_ITEMS, ...LOBBY_ITEMS]).filter((i) => !!i.badge);
      case "fan":
        return noTickets(FAN_ITEMS).filter((i) =>
          ["fan", "avatar", "emote", "subscription"].includes(i.category),
        );
      case "venue":
        return noTickets(VENUE_ITEMS);
      case "lobby":
        return noTickets(LOBBY_ITEMS);
      default:
        return [];
    }
  }, [activeShelf]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#06070d",
        color: "#fff",
        fontFamily: "inherit",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 16px 0",
          borderBottom: `1px solid ${accentColor}22`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: 20 }}>🏪</span>
          <div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: accentColor,
                letterSpacing: "0.08em",
              }}
            >
              TMI STORE
            </div>
            <div style={{ fontSize: 11, color: "#888" }}>
              Avatar · Coins · Venue Skins · Seasonal Drops
            </div>
          </div>
        </div>

        {/* Shelf tabs */}
        <div style={{ display: "flex", gap: 0, overflowX: "auto" }}>
          {availableShelves.map((shelf) => (
            <button
              key={shelf.id}
              onClick={() => setActiveShelf(shelf.id)}
              style={{
                background: "none",
                border: "none",
                borderBottom: `2px solid ${activeShelf === shelf.id ? accentColor : "transparent"}`,
                color: activeShelf === shelf.id ? accentColor : "#666",
                padding: "8px 12px",
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
                letterSpacing: "0.06em",
                whiteSpace: "nowrap",
                transition: "color 0.15s, border-color 0.15s",
              }}
            >
              {shelf.icon} {shelf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "14px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          alignContent: "start",
        }}
      >
        {items.length === 0 ? (
          <div
            style={{
              gridColumn: "1 / -1",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              minHeight: 160,
              color: "#888",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 32 }}>🏪</div>
            <div style={{ fontSize: 13, color: "#aaa" }}>No items in this shelf.</div>
            <div style={{ fontSize: 11 }}>New drops coming soon.</div>
          </div>
        ) : (
          items.map((item) => (
            <ItemCard key={item.id} item={item} accent={accentColor} />
          ))
        )}
      </div>

      {/* Footer — bot lifecycle note */}
      <div
        style={{
          padding: "10px 14px",
          borderTop: `1px solid ${accentColor}18`,
          fontSize: 10,
          color: "#555",
          textAlign: "center",
        }}
      >
        Store inventory is bot-automated · Items rotate through LAUNCH → TRENDING → LIMITED EDITION · No manual scheduling
      </div>
    </div>
  );
}
