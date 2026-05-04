"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getLobbyFeedSnapshot,
  subscribeLobbyFeed,
  deriveVenueAdSlots,
  type VenueAdSlot,
} from "@/lib/lobby/LobbyFeedBus";

const TYPE_LABEL: Record<VenueAdSlot["type"], string> = {
  sponsor: "Sponsor",
  promo: "Venue Promo",
  event: "Event",
  contest: "Battle",
};

export default function VenuePreviewBillboard() {
  const [feed, setFeed] = useState(() => getLobbyFeedSnapshot());
  const [adIdx, setAdIdx] = useState(0);

  useEffect(() => subscribeLobbyFeed(setFeed), []);

  useEffect(() => {
    const slots = deriveVenueAdSlots(feed);
    if (slots.length < 2) return;
    const id = window.setInterval(() => {
      setAdIdx((i) => (i + 1) % slots.length);
    }, 7000);
    return () => window.clearInterval(id);
  }, [feed]);

  const slots = deriveVenueAdSlots(feed);
  const slot = slots[adIdx] ?? slots[0];

  if (!slot) return null;

  return (
    <div
      style={{
        borderRadius: 12,
        border: `1px solid ${slot.accent}33`,
        background: "rgba(3,2,11,0.96)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "6px 10px",
          borderBottom: `1px solid ${slot.accent}22`,
          background: `${slot.accent}0a`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: slot.accent,
              boxShadow: `0 0 5px ${slot.accent}`,
            }}
          />
          <span
            style={{
              fontSize: 7,
              fontWeight: 900,
              letterSpacing: "0.18em",
              color: slot.accent,
              textTransform: "uppercase",
            }}
          >
            {TYPE_LABEL[slot.type]}
          </span>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {slots.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === adIdx ? 10 : 4,
                height: 3,
                borderRadius: 2,
                background: i === adIdx ? slot.accent : "rgba(255,255,255,0.12)",
                transition: "width 0.3s ease",
              }}
            />
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "10px 12px" }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 900,
            color: "#f3e9ff",
            marginBottom: 3,
            lineHeight: 1.2,
          }}
        >
          {slot.title}
        </div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.38)", marginBottom: 10 }}>
          {slot.subtitle}
        </div>
        <Link href={slot.ctaRoute} style={{ textDecoration: "none" }}>
          <div
            style={{
              display: "inline-block",
              padding: "4px 10px",
              borderRadius: 6,
              border: `1px solid ${slot.accent}55`,
              background: `${slot.accent}14`,
              color: slot.accent,
              fontSize: 8,
              fontWeight: 900,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            {slot.ctaLabel} →
          </div>
        </Link>
      </div>
    </div>
  );
}
