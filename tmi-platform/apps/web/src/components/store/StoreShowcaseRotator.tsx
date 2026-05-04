"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  getActiveWindow,
  getNextWindowMs,
  getItemsForCategory,
  formatTimeLeft,
  formatPrice,
  isItemExpired,
  type RotationWindow,
  type StoreItem,
} from "@/lib/store/StoreRotationEngine";

function ItemTile({ item, accent, now }: { item: StoreItem; accent: string; now: number }) {
  const expired = isItemExpired(item, now);

  return (
    <Link href={item.route} style={{ textDecoration: "none" }}>
      <div
        style={{
          borderRadius: 10,
          border: `1px solid ${expired ? "#1e293b" : accent}33`,
          background: expired ? "rgba(10,10,20,0.35)" : `${accent}09`,
          padding: "10px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
          opacity: expired ? 0.45 : 1,
          cursor: expired ? "default" : "pointer",
          transition: "border-color 200ms",
        }}
      >
        <span style={{ fontSize: 20, lineHeight: 1 }}>{item.emoji}</span>

        <span
          style={{
            fontSize: 10,
            fontWeight: 800,
            color: "#e2e8f0",
            lineHeight: 1.25,
          }}
        >
          {item.name}
        </span>

        <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
          {item.status === "sale" && (
            <span
              style={{
                fontSize: 7, fontWeight: 900, letterSpacing: "0.12em",
                color: "#FF4444", background: "rgba(255,68,68,0.12)",
                border: "1px solid rgba(255,68,68,0.3)", borderRadius: 4, padding: "1px 5px",
              }}
            >
              SALE
            </span>
          )}
          {item.status === "limited" && (
            <span
              style={{
                fontSize: 7, fontWeight: 900, letterSpacing: "0.12em",
                color: "#FFD700", background: "rgba(255,215,0,0.1)",
                border: "1px solid rgba(255,215,0,0.3)", borderRadius: 4, padding: "1px 5px",
              }}
            >
              LIMITED
            </span>
          )}
          {item.status === "expiring" && (
            <span
              style={{
                fontSize: 7, fontWeight: 900, letterSpacing: "0.12em",
                color: "#fb923c", background: "rgba(251,146,60,0.1)",
                border: "1px solid rgba(251,146,60,0.3)", borderRadius: 4, padding: "1px 5px",
              }}
            >
              EXPIRING
            </span>
          )}
          {item.expiresAt && !expired && (
            <span style={{ fontSize: 7, color: "#64748b" }}>
              {formatTimeLeft(item.expiresAt, now)}
            </span>
          )}
        </div>

        <span style={{ fontSize: 9, fontWeight: 700, color: accent, marginTop: 2 }}>
          {formatPrice(item)}
        </span>
      </div>
    </Link>
  );
}

type StoreShowcaseRotatorProps = {
  maxItems?: number;
  compact?: boolean;
};

export default function StoreShowcaseRotator({
  maxItems = 4,
  compact = false,
}: StoreShowcaseRotatorProps) {
  const [now, setNow] = useState(0);
  const [win, setWin] = useState<RotationWindow | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const t = Date.now();
    setNow(t);
    setWin(getActiveWindow(t));

    function schedule() {
      const nextMs = getNextWindowMs(Date.now());
      timeoutRef.current = setTimeout(() => {
        const ts = Date.now();
        setNow(ts);
        setWin(getActiveWindow(ts));
        schedule();
      }, Math.max(300, nextMs));
    }
    schedule();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!win) return null;

  const items = getItemsForCategory(win.category, now).slice(0, maxItems);
  // Never blank
  const displayItems: StoreItem[] =
    items.length > 0 ? items : getItemsForCategory("fan_items", now).slice(0, maxItems);

  const cols = Math.min(maxItems, 2);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: compact ? 8 : 12 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: compact ? 14 : 16 }}>{win.emoji}</span>
          <span
            style={{
              fontSize: compact ? 8 : 9,
              fontWeight: 900,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: win.accent,
            }}
          >
            {win.label}
          </span>
        </div>
        <Link
          href="/store"
          style={{
            fontSize: 7,
            fontWeight: 800,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: win.accent,
            textDecoration: "none",
            opacity: 0.7,
          }}
        >
          VIEW ALL →
        </Link>
      </div>

      {/* Item grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: compact ? 6 : 8,
        }}
      >
        {displayItems.map((item) => (
          <ItemTile key={item.id} item={item} accent={win.accent} now={now} />
        ))}
      </div>
    </div>
  );
}
