"use client";

/**
 * LiveLobbyWallCanister — Rule 15 canonical canister.
 * Fetches active live sessions from /api/homepage/live (GlobalLiveSessionRegistry).
 * Shows grid of live rooms as tiles; each routes through LobbyEntryFlow.
 * Empty state: "No live rooms right now. Check back soon."
 * Rule 20: No LIVE badge unless backed by GlobalLiveSessionRegistry.
 */

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface LiveRoomTile {
  userId: string;
  displayName: string;
  title: string;
  category: string;
  roomId: string;
  accentColor: string;
  viewerCount: number;
  thumbnailUrl: string | null;
}

interface LiveLobbyWallCanisterProps {
  accentColor?: string;
  /** Maximum rooms to display. Defaults to 6. */
  maxRooms?: number;
  /** Optional genre filter. */
  genre?: string;
}

const CATEGORY_EMOJI: Record<string, string> = {
  battle: "⚔️",
  cypher: "🎤",
  concert: "🎵",
  challenge: "🎯",
  live: "🔴",
  game: "🎮",
  session: "🎸",
};

export function LiveLobbyWallCanister({
  accentColor = "#FF2DAA",
  maxRooms = 6,
  genre,
}: LiveLobbyWallCanisterProps) {
  const [rooms, setRooms] = useState<LiveRoomTile[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastFetched, setLastFetched] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/homepage/live", {
        cache: "no-store",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json() as {
          sessions?: LiveRoomTile[];
          rooms?: LiveRoomTile[];
        };
        const raw = data.sessions ?? data.rooms ?? [];
        const filtered = genre
          ? raw.filter((r) => r.category === genre)
          : raw;
        setRooms(filtered.slice(0, maxRooms));
        setLastFetched(Date.now());
      }
    } catch {
      // Network error — show empty state
    } finally {
      setLoading(false);
    }
  }, [maxRooms, genre]);

  useEffect(() => {
    void load();
    // Refresh every 30 seconds so the wall stays current
    const interval = setInterval(() => void load(), 30_000);
    return () => clearInterval(interval);
  }, [load]);

  function fmtViewers(n: number): string {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return n.toString();
  }

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
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.3em", color: accentColor, fontWeight: 800 }}>
            🔴 LIVE ROOMS
          </div>
          {rooms.length > 0 && (
            <div style={{
              fontSize: 8, color: "#fff", background: accentColor,
              borderRadius: 10, padding: "1px 7px", fontWeight: 900,
            }}>
              {rooms.length} LIVE
            </div>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {lastFetched && (
            <span style={{ fontSize: 8, color: "rgba(255,255,255,0.2)" }}>
              Updated {Math.round((Date.now() - lastFetched) / 1000)}s ago
            </span>
          )}
          <Link
            href="/home/3"
            style={{
              fontSize: 9, color: accentColor, fontWeight: 700,
              textDecoration: "none", letterSpacing: "0.08em",
            }}
          >
            ALL ROOMS →
          </Link>
        </div>
      </div>

      <div style={{ padding: "12px 18px" }}>
        {loading ? (
          <div style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 12, padding: "20px 0" }}>
            Loading live rooms…
          </div>
        ) : rooms.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📺</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 12 }}>
              No live rooms right now. Check back soon.
            </div>
            <Link
              href="/home/3"
              style={{
                fontSize: 10, color: accentColor, fontWeight: 800,
                textDecoration: "none", letterSpacing: "0.08em",
                border: `1px solid ${accentColor}44`,
                borderRadius: 8, padding: "7px 16px",
              }}
            >
              BROWSE ALL ROOMS
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
            {rooms.map((room) => {
              const roomAccent = room.accentColor ?? accentColor;
              const emoji = CATEGORY_EMOJI[room.category] ?? "🎵";
              const entryRoute = `/live/rooms/${room.roomId}?from=live-lobby-wall`;
              return (
                <Link key={room.roomId} href={entryRoute} style={{ textDecoration: "none" }}>
                  <div style={{
                    borderRadius: 10,
                    border: `1px solid ${roomAccent}33`,
                    background: `linear-gradient(135deg, ${roomAccent}08, rgba(5,5,16,0.9))`,
                    overflow: "hidden",
                    position: "relative",
                  }}>
                    {/* Thumbnail / placeholder */}
                    <div style={{
                      height: 90,
                      background: room.thumbnailUrl
                        ? `url(${room.thumbnailUrl}) center/cover no-repeat`
                        : `linear-gradient(135deg, ${roomAccent}14, rgba(0,0,0,0.6))`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      {!room.thumbnailUrl && (
                        <span style={{ fontSize: 32, opacity: 0.5 }}>{emoji}</span>
                      )}
                      {/* LIVE badge */}
                      <div style={{
                        position: "absolute", top: 8, left: 8,
                        display: "flex", alignItems: "center", gap: 4,
                        background: "rgba(220,38,38,0.9)", borderRadius: 4,
                        padding: "2px 7px",
                      }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#fff", display: "inline-block" }} />
                        <span style={{ fontSize: 7, fontWeight: 900, color: "#fff", letterSpacing: "0.1em" }}>LIVE</span>
                      </div>
                      {/* Viewer count */}
                      <div style={{
                        position: "absolute", bottom: 8, right: 8,
                        fontSize: 8, color: "#fff", background: "rgba(0,0,0,0.65)",
                        borderRadius: 4, padding: "2px 6px", fontWeight: 700,
                      }}>
                        👁 {fmtViewers(room.viewerCount)}
                      </div>
                    </div>

                    {/* Info */}
                    <div style={{ padding: "10px 12px" }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: "#fff", marginBottom: 3, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {room.title}
                      </div>
                      <div style={{ fontSize: 9, color: roomAccent, fontWeight: 700, letterSpacing: "0.06em" }}>
                        {emoji} {room.category.toUpperCase()} · {room.displayName}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default LiveLobbyWallCanister;
