"use client";

/**
 * StoreCanister — Rule 15 canonical canister.
 * Shows performer or platform store items with Stripe checkout links.
 * Category can be "creator", "fan", or "shared".
 * Empty state: "No items in store yet."
 */

import Link from "next/link";
import {
  CREATOR_ITEMS,
  FAN_ITEMS,
  type StoreItem,
} from "@/lib/store/StoreItemEngine";

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
          href={`/store/${entityId}`}
          style={{
            fontSize: 9, color: accentColor, fontWeight: 700,
            textDecoration: "none", letterSpacing: "0.08em",
          }}
        >
          VIEW ALL →
        </Link>
      </div>

      <div style={{ padding: "14px 18px" }}>
        {items.length === 0 ? (
          <div style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 12, padding: "16px 0" }}>
            No items in store yet.
          </div>
        ) : (
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
