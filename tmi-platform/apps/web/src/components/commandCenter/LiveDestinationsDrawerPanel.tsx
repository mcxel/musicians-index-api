"use client";

/**
 * LIVE_DESTINATIONS drawer module — DiscoveryBus real rooms or honest empty (Rule 20).
 * Does NOT use LiveDestinationDrawer.tsx (that file has fake viewer counts).
 */

import Link from "next/link";
import type { CSSProperties } from "react";
import { useDiscoveryBus } from "@/lib/discovery/useDiscoveryBus";
import { LIVE_DISCOVERY_CATEGORY_LABELS } from "@/lib/discovery/LiveDiscoveryRecord";
import { useActivePerformer } from "@/lib/context/ActivePerformerContext";
import { getPerformerById } from "@/lib/performers/PerformerRegistry";

interface LiveDestinationsDrawerPanelProps {
  viewerUserId?: string;
  accentColor?: string;
}

export default function LiveDestinationsDrawerPanel({
  viewerUserId,
  accentColor = "#00FFFF",
}: LiveDestinationsDrawerPanelProps) {
  const records = useDiscoveryBus(viewerUserId);
  const live = records.filter((r) => r.isLive).slice(0, 12);
  const { setActivePerformer } = useActivePerformer();

  const bindHost = (hostUserId: string, hostName: string) => {
    const profile = getPerformerById(hostUserId);
    setActivePerformer({
      id: profile?.id ?? hostUserId,
      slug: profile?.slug ?? hostUserId,
      name: profile?.name ?? hostName,
    });
  };

  return (
    <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.16em", color: accentColor }}>
          LIVE DESTINATIONS
        </div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
          From DiscoveryBus · human viewers only · no fabricated rooms
        </div>
      </div>

      {live.length === 0 ? (
        <div
          style={{
            padding: 28,
            textAlign: "center",
            borderRadius: 12,
            border: "1px dashed rgba(255,255,255,0.12)",
            background: "rgba(0,0,0,0.25)",
            color: "rgba(255,255,255,0.4)",
            fontSize: 12,
          }}
        >
          No one live right now.
          <div style={{ marginTop: 12 }}>
            <Link
              href="/live/lobby"
              style={{
                color: accentColor,
                fontWeight: 800,
                fontSize: 11,
                textDecoration: "none",
                border: `1px solid ${accentColor}55`,
                borderRadius: 8,
                padding: "8px 14px",
                display: "inline-block",
              }}
            >
              Open Live Lobby Wall →
            </Link>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {live.map((r) => (
            <div
              key={r.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 10,
                border: `1px solid ${r.accentColor || accentColor}33`,
                background: "rgba(255,255,255,0.03)",
                color: "#fff",
              }}
            >
              <button
                type="button"
                onClick={() => bindHost(r.hostUserId, r.hostName)}
                title="Set ACTIVE_PERFORMER (drawers stay open)"
                style={{
                  flex: 1,
                  minWidth: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: "transparent",
                  border: "none",
                  color: "inherit",
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "inherit",
                  padding: 0,
                }}
              >
                <span
                  style={{
                    fontSize: 8,
                    fontWeight: 900,
                    letterSpacing: "0.08em",
                    color: "#FF2DAA",
                    border: "1px solid rgba(255,45,170,0.45)",
                    borderRadius: 4,
                    padding: "2px 6px",
                  }}
                >
                  LIVE
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {r.title}
                  </div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                    {r.hostName}
                    {r.categories[0]
                      ? ` · ${LIVE_DISCOVERY_CATEGORY_LABELS[r.categories[0]] ?? r.categories[0]}`
                      : ""}
                    {` · ${r.humanViewerCount.toLocaleString()} watching`}
                  </div>
                </div>
              </button>
              <Link
                href={r.joinRoute || `/live/lobby?room=${encodeURIComponent(r.roomId)}`}
                onClick={() => bindHost(r.hostUserId, r.hostName)}
                style={{ fontSize: 11, color: accentColor, fontWeight: 800, textDecoration: "none", flexShrink: 0 }}
              >
                JOIN →
              </Link>
            </div>
          ))}
          <Link
            href="/live/lobby"
            style={{ fontSize: 11, color: accentColor, fontWeight: 800, textDecoration: "none", padding: "4px 2px" }}
          >
            See all on Live Lobby Wall →
          </Link>
        </div>
      )}

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 12 }}>
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)", marginBottom: 8 }}>
          SOCIAL ROOMS
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <Link href="/rooms/fan-lobby" style={chip(accentColor)}>
            Fan Lobby
          </Link>
          <Link href="/rooms/playlist-lounge" style={chip("#AA2DFF")}>
            Playlist Lounge
          </Link>
        </div>
      </div>
    </div>
  );
}

function chip(color: string): CSSProperties {
  return {
    fontSize: 10,
    fontWeight: 800,
    color,
    textDecoration: "none",
    border: `1px solid ${color}55`,
    borderRadius: 8,
    padding: "8px 12px",
    background: `${color}14`,
  };
}
