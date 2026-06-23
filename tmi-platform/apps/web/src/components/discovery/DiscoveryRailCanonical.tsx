"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  getActiveBattles,
  getActiveCyphers,
  getActiveChallenges,
  getActiveGameShows,
  getActiveAudienceRooms,
  getTrending,
  type DiscoveryEmptyState,
} from "@/lib/discovery/UnifiedDiscoveryEngine";
import { type LiveSession } from "@/lib/broadcast/GlobalLiveSessionRegistry";

interface DiscoveryTileProps {
  session: LiveSession;
  accent: string;
  theme?: "compact" | "expanded";
}

function DiscoveryTile({ session, accent, theme = "expanded" }: DiscoveryTileProps) {
  return (
    <Link href={`/live/rooms/${session.roomId}`} style={{ textDecoration: "none" }}>
      <div
        style={{
          borderRadius: 12,
          overflow: "hidden",
          border: `1px solid ${accent}33`,
          background: "rgba(5,5,16,0.85)",
          boxShadow: `0 0 16px ${accent}22`,
          cursor: "pointer",
          transition: "all 0.2s",
          display: "flex",
          flexDirection: "column",
          minHeight: theme === "compact" ? 200 : 280,
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.transform = "translateY(-2px)";
          el.style.boxShadow = `0 8px 24px ${accent}44`;
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.transform = "translateY(0)";
          el.style.boxShadow = `0 0 16px ${accent}22`;
        }}
      >
        {/* Image */}
        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "16/10",
            background: "rgba(5,5,16,0.98)",
            overflow: "hidden",
          }}
        >
          <Image
            src={session.previewUrl || session.thumbnailUrl || "/images/tmi-placeholder.jpg"}
            alt={session.title}
            fill
            unoptimized
            style={{ objectFit: "cover" }}
          />

          {/* Live badge */}
          <div
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              background: "rgba(0,0,0,0.8)",
              color: "#00FF88",
              fontWeight: 800,
              fontSize: 9,
              padding: "4px 8px",
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              gap: 4,
              letterSpacing: "0.05em",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#00FF88",
                display: "inline-block",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
            LIVE
          </div>

          {/* Category badge */}
          <div
            style={{
              position: "absolute",
              top: 8,
              left: 8,
              background: `${accent}DD`,
              color: "#050510",
              fontWeight: 900,
              fontSize: 9,
              padding: "3px 8px",
              borderRadius: 4,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {session.category}
          </div>

          {/* Viewers count */}
          <div
            style={{
              position: "absolute",
              bottom: 8,
              left: 8,
              background: "rgba(0,0,0,0.75)",
              color: "rgba(255,255,255,0.9)",
              fontWeight: 800,
              fontSize: 8,
              padding: "3px 6px",
              borderRadius: 3,
              letterSpacing: "0.05em",
            }}
          >
            {session.viewerCount.toLocaleString()} viewing
          </div>

          {/* Gradient fade */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "40%",
              background: "linear-gradient(transparent, rgba(0,0,0,0.88))",
              pointerEvents: "none",
            }}
          />
        </div>

        {/* Info */}
        <div style={{ padding: "12px 10px", flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
          <div>
            <div
              style={{
                fontFamily: "var(--font-orbitron, monospace)",
                fontSize: 11,
                fontWeight: 900,
                color: accent,
                letterSpacing: "0.04em",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {session.displayName}
            </div>
            <div
              style={{
                fontSize: 9,
                color: "rgba(255,255,255,0.6)",
                marginTop: 2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {session.title}
            </div>
          </div>

          {/* Stats */}
          {theme === "expanded" && (
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.5)", borderTop: `1px solid ${accent}22`, paddingTop: 6, display: "flex", justifyContent: "space-between" }}>
              <span>Uptime: {Math.round((Date.now() - session.startedAt) / 60000)}m</span>
              <span>Tips: ${session.tipTotal}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

interface DiscoveryRailProps {
  type: "battles" | "cyphers" | "challenges" | "gameShows" | "audienceRooms" | "trending";
  title: string;
  limit?: number;
  accent?: string;
  theme?: "compact" | "expanded";
}

export function DiscoveryRail({ type, title, limit = 6, accent = "#00FFFF", theme = "expanded" }: DiscoveryRailProps) {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const query = () => {
      switch (type) {
        case "battles":
          return getActiveBattles(limit);
        case "cyphers":
          return getActiveCyphers(limit);
        case "challenges":
          return getActiveChallenges(limit);
        case "gameShows":
          return getActiveGameShows(limit);
        case "audienceRooms":
          return getActiveAudienceRooms(limit);
        case "trending":
          return getTrending(limit);
      }
    };
    setSessions(query());
    setLoading(false);
  }, [type, limit]);

  if (loading) {
    return (
      <div
        style={{
          padding: "20px",
          textAlign: "center",
          color: "rgba(255,255,255,0.5)",
          fontSize: 12,
        }}
      >
        Loading {title.toLowerCase()}...
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div
        style={{
          padding: "20px",
          textAlign: "center",
          color: "rgba(255,255,255,0.4)",
          fontSize: 11,
          fontStyle: "italic",
        }}
      >
        No active {title.toLowerCase()}
      </div>
    );
  }

  return (
    <div style={{ width: "100%" }}>
      <h3
        style={{
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: "0.08em",
          color: accent,
          textTransform: "uppercase",
          marginBottom: 12,
        }}
      >
        {title}
      </h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: theme === "compact" ? "repeat(auto-fill, minmax(160px, 1fr))" : "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 12,
        }}
      >
        {sessions.map((session) => (
          <DiscoveryTile key={session.roomId} session={session} accent={accent} theme={theme} />
        ))}
      </div>
    </div>
  );
}

export default DiscoveryRail;
