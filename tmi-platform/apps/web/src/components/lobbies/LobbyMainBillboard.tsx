"use client";

// Lobby Main Billboard — rotates: featured article → live cypher → weekly news → sponsor.
// When a live performer is detected via LobbyFeedBus the cypher slot becomes "LIVE NOW".
// All routes are real. No fake placeholders.

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LOBBY_CONTENT_SLOTS,
  getContentSlotAt,
  type ContentSlot,
} from "@/lib/lobby/LobbyContentRotationEngine";
import {
  subscribeLobbyFeed,
  getLobbyFeedSnapshot,
  type LobbyFeedState,
} from "@/lib/lobby/LobbyFeedBus";

const ROTATION_MS = 9000;

export default function LobbyMainBillboard() {
  const [tick, setTick] = useState(0);
  const [feed, setFeed] = useState<LobbyFeedState>(() => getLobbyFeedSnapshot());

  useEffect(() => subscribeLobbyFeed(setFeed), []);

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), ROTATION_MS);
    return () => window.clearInterval(id);
  }, []);

  const baseSlot = getContentSlotAt(tick);
  const slot: ContentSlot =
    baseSlot.type === "cypher" && feed.status === "LIVE" && feed.performer !== "—"
      ? {
          type: "performer",
          label: "LIVE NOW",
          title: feed.performer,
          subtitle: `Live in ${feed.title} · ${feed.occupancy} seated`,
          route: feed.slug ? `/lobbies/${feed.slug}` : "/lobbies",
          accentColor: "#f87171",
        }
      : baseSlot;

  const slotIndex = (tick % LOBBY_CONTENT_SLOTS.length) + 1;
  const slotTotal = LOBBY_CONTENT_SLOTS.length;

  return (
    <Link href={slot.route} style={{ textDecoration: "none", display: "block" }}>
      <div
        style={{
          padding: "9px 16px",
          borderRadius: 8,
          border: `1px solid ${slot.accentColor}44`,
          background: `linear-gradient(90deg, ${slot.accentColor}0d, rgba(3,2,11,0.97))`,
          display: "flex",
          alignItems: "center",
          gap: 12,
          transition: "border-color 0.4s",
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            flexShrink: 0,
            background: slot.accentColor,
            boxShadow: `0 0 8px ${slot.accentColor}`,
            animation: "lobbyBillboardPulse 2.4s ease-in-out infinite",
          }}
        />
        <span
          style={{
            fontSize: 7,
            fontWeight: 900,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: slot.accentColor,
            flexShrink: 0,
          }}
        >
          {slot.label}
        </span>
        <div
          style={{
            width: 1,
            height: 10,
            background: "rgba(255,255,255,0.12)",
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1, overflow: "hidden" }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: "#e4e4f0",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {slot.title}
          </div>
          <div
            style={{
              fontSize: 9,
              color: "rgba(255,255,255,0.38)",
              letterSpacing: "0.04em",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              marginTop: 1,
            }}
          >
            {slot.subtitle}
          </div>
        </div>
        <span
          style={{
            fontSize: 8,
            color: "rgba(255,255,255,0.22)",
            flexShrink: 0,
            letterSpacing: "0.08em",
          }}
        >
          {slotIndex}/{slotTotal}
        </span>
        <span
          style={{ fontSize: 9, fontWeight: 800, color: slot.accentColor, flexShrink: 0 }}
        >
          →
        </span>
      </div>
    </Link>
  );
}
