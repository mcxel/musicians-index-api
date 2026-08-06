"use client";

/**
 * StoreCanister — Phase 5.4 High-Fidelity Cyberpunk Merch & Digital Storefront Deck (Image 4 Match)
 * 3-Column Cyberpunk Store Deck:
 *   Left: Featured Item Spotlight (Spinning Album / Merch Card + Price + Checkout)
 *   Center: Digital Store Grid (VIP Passes, Beat Packs, Subscriptions, Fan-Club Badges)
 *   Right: Artist DSP Links & TMI Points Storefront
 */

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { CREATOR_ITEMS, FAN_ITEMS, type StoreItem } from "@/lib/store/StoreItemEngine";

interface StoreCanisterProps {
  entityId: string;
  entityName?: string;
  storeType?: "performer" | "fan" | "shared";
  accentColor?: string;
  maxItems?: number;
}

export function StoreCanister({
  entityId,
  entityName = "MarcellD",
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
      {/* Header */}
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
              DIGITAL STORE & MERCH VAULT {entityName ? `— ${entityName.toUpperCase()}` : ""}
            </div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
              Official Merch, Beat Licenses, Fan-Club Subscriptions & Digital Collectibles
            </div>
          </div>
        </div>

        <Link
          href="/store"
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
          VIEW FULL STORE ↗
        </Link>
      </div>

      {/* 3-Column Store Deck */}
      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr 240px", gap: 12 }}>
        {/* Left Column: Featured Spotlight */}
        <div style={{ background: "rgba(10,5,25,0.7)", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 10, padding: 12, display: "flex", flexDirection: "column", gap: 8, textAlign: "center" }}>
          <div style={{ fontSize: 8, fontWeight: 900, color: "#FFD700", letterSpacing: "0.12em" }}>FEATURED MERCH</div>
          <div style={{ height: 130, borderRadius: 8, background: "linear-gradient(135deg, #FF5500, #AA2DFF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>
            👕
          </div>
          <div style={{ fontSize: 11, fontWeight: 900, color: "#fff" }}>Official MarcellD Neon Hoodie</div>
          <div style={{ fontSize: 13, fontWeight: 900, color: "#00FF88" }}>$65.00</div>
          <button type="button" style={{ fontSize: 9, fontWeight: 900, padding: "6px 12px", borderRadius: 6, border: "none", background: "linear-gradient(135deg, #FFD700, #FF5500)", color: "#000", cursor: "pointer" }}>
            PURCHASE NOW
          </button>
        </div>

        {/* Center Column: Digital Store Cards Grid */}
        <div style={{ background: "rgba(10,5,25,0.5)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 9, fontWeight: 900, color: accentColor, letterSpacing: "0.12em" }}>DIGITAL PRODUCTS & BEAT PACKS</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, flex: 1, overflowY: "auto" }}>
            {items.map((item) => (
              <div key={item.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,215,0,0.2)", borderRadius: 8, padding: 8, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 16 }}>{item.icon}</span>
                  <span style={{ fontSize: 8, fontWeight: 900, color: "#00FF88", background: "rgba(0,255,136,0.15)", padding: "2px 4px", borderRadius: 4 }}>{item.badge || "DIGITAL"}</span>
                </div>
                <div style={{ fontSize: 10, fontWeight: 900, color: "#fff" }}>{item.name}</div>
                <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)" }}>{item.description}</div>
                <div style={{ fontSize: 11, fontWeight: 900, color: accentColor }}>${(item.price / 100).toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: DSP & TMI Support */}
        <div style={{ background: "rgba(10,5,25,0.7)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 10, fontSize: 9, display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontSize: 9, fontWeight: 900, color: "#00FFFF" }}>DSP & CREATOR LINKS</div>
          <div>🟢 <strong>Spotify Storefront:</strong> Connected</div>
          <div>🍎 <strong>Apple Music:</strong> Verified</div>
          <div>💎 <strong>Creator Split:</strong> 90% Direct to Artist</div>
        </div>
      </div>
    </div>
  );
}

export default StoreCanister;
