"use client";

/**
 * PlaylistLoungeCanister — Rule 15 canonical canister.
 * Surfaces joinable playlist / mixed-genre lounges (LOUNGE_SIDE_ROOM, video panels).
 * Data: AnchorRoomNetwork discovery + GlobalLiveSessionRegistry (category lounge/listening).
 * Rule 20: honest empty state; no fake occupancy.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getAllAnchors } from "@/lib/live/AnchorRoomRegistry";
import { resolvePlaylistLoungeJoinHref } from "@/lib/venue-hud/loungeContainer";
import type { LiveDiscoveryRecord } from "@/lib/discovery/LiveDiscoveryRecord";
import type { LiveSession } from "@/lib/broadcast/globalLiveSessionStore";

interface PlaylistLoungeTile {
  roomId: string;
  title: string;
  subtitle: string;
  href: string;
  viewerCount: number;
  isLive: boolean;
  accentColor: string;
  kind: "mixed" | "genre" | "mood" | "conversation" | "session";
}

interface PlaylistLoungeCanisterProps {
  accentColor?: string;
  maxLounges?: number;
  /** Profile slug for from= query on join links */
  profileSlug?: string;
}

const LOUNGE_KIND_LABEL: Record<PlaylistLoungeTile["kind"], string> = {
  mixed: "Mixed",
  genre: "Genre",
  mood: "Mood",
  conversation: "Hangout",
  session: "Live Session",
};

function anchorToTile(anchor: ReturnType<typeof getAllAnchors>[number], from: string): PlaylistLoungeTile {
  const isConversation = anchor.slug.includes("conversation");
  return {
    roomId: anchor.slug,
    title: anchor.title,
    subtitle: anchor.tagline,
    href: resolvePlaylistLoungeJoinHref(anchor.slug, { from }),
    viewerCount: 0,
    isLive: true,
    accentColor: isConversation ? "#7a5cff" : "#00FF88",
    kind: isConversation ? "conversation" : "mixed",
  };
}

function discoveryToTile(record: LiveDiscoveryRecord, from: string): PlaylistLoungeTile | null {
  const family = (record.anchorFamily ?? "").toLowerCase();
  const cat = record.category;
  const isLounge =
    family === "playlist_lounge" ||
    family === "conversation_lounge" ||
    cat === "listening" ||
    cat === "lounges";
  if (!isLounge) return null;

  let kind: PlaylistLoungeTile["kind"] = "mixed";
  if (family === "conversation_lounge" || cat === "lounges") kind = "conversation";
  else if (record.featuredCategory) kind = "genre";

  return {
    roomId: record.roomId,
    title: record.title,
    subtitle: record.statusLine ?? record.hostName,
    href: resolvePlaylistLoungeJoinHref(record.roomId, { from }),
    viewerCount: Math.max(0, record.humanViewerCount),
    isLive: record.isLive,
    accentColor: record.accentColor ?? "#FF2DAA",
    kind,
  };
}

function sessionToTile(session: LiveSession, from: string): PlaylistLoungeTile | null {
  const cat = (session.category ?? "").toLowerCase();
  if (cat !== "lounge" && cat !== "listening") return null;
  return {
    roomId: session.roomId,
    title: session.title || `${session.displayName} — Lounge`,
    subtitle: session.displayName,
    href: resolvePlaylistLoungeJoinHref(session.roomId, { from }),
    viewerCount: Math.max(0, session.viewerCount),
    isLive: true,
    accentColor: session.accentColor ?? "#FF2DAA",
    kind: "session",
  };
}

export function PlaylistLoungeCanister({
  accentColor = "#00FF88",
  maxLounges = 6,
  profileSlug,
}: PlaylistLoungeCanisterProps) {
  const fromParam = profileSlug ? `profile-${profileSlug}` : "profile";
  const [tiles, setTiles] = useState<PlaylistLoungeTile[]>([]);
  const [loading, setLoading] = useState(true);

  const staticAnchors = useMemo(
    () =>
      getAllAnchors()
        .filter((a) => a.category === "LOUNGE")
        .map((a) => anchorToTile(a, fromParam)),
    [fromParam],
  );

  const load = useCallback(async () => {
    setLoading(true);
    const byRoom = new Map<string, PlaylistLoungeTile>();

    for (const t of staticAnchors) {
      byRoom.set(t.roomId, t);
    }

    try {
      const res = await fetch("/api/live/go", { cache: "no-store", credentials: "include" });
      if (res.ok) {
        const data = await res.json() as {
          anchorDiscovery?: LiveDiscoveryRecord[];
          sessions?: LiveSession[];
        };
        for (const record of data.anchorDiscovery ?? []) {
          const tile = discoveryToTile(record, fromParam);
          if (tile) byRoom.set(tile.roomId, tile);
        }
        for (const session of data.sessions ?? []) {
          const tile = sessionToTile(session, fromParam);
          if (tile) byRoom.set(tile.roomId, tile);
        }
      }
    } catch {
      /* static anchors remain */
    }

    setTiles(Array.from(byRoom.values()).slice(0, maxLounges));
    setLoading(false);
  }, [fromParam, maxLounges, staticAnchors]);

  useEffect(() => {
    void load();
    const interval = setInterval(() => void load(), 30_000);
    return () => clearInterval(interval);
  }, [load]);

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.015)",
        border: `1px solid ${accentColor}22`,
        borderRadius: 14,
        overflow: "hidden",
      }}
      data-testid="playlist-lounge-canister"
      data-lounge-avatars="false"
    >
      <div
        style={{
          padding: "12px 18px",
          borderBottom: `1px solid ${accentColor}18`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.3em", color: accentColor, fontWeight: 800 }}>
            🎧 PLAYLIST LOUNGES
          </div>
          <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>
            Video hangout · earn points listening
          </div>
        </div>
        <Link
          href="/live/rooms/stream-win"
          style={{
            fontSize: 9,
            color: accentColor,
            fontWeight: 700,
            textDecoration: "none",
            letterSpacing: "0.08em",
          }}
        >
          ALL LOUNGES →
        </Link>
      </div>

      <div style={{ padding: "12px 18px" }}>
        {loading ? (
          <div style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 12, padding: "20px 0" }}>
            Loading playlist lounges…
          </div>
        ) : tiles.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🛋️</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 12 }}>
              No playlist lounges active right now. Permanent lounges are always joinable below.
            </div>
            <Link
              href={resolvePlaylistLoungeJoinHref("lounge-playlist", { from: fromParam })}
              style={{
                fontSize: 10,
                color: accentColor,
                fontWeight: 800,
                textDecoration: "none",
                letterSpacing: "0.08em",
                border: `1px solid ${accentColor}44`,
                borderRadius: 8,
                padding: "7px 16px",
              }}
            >
              JOIN PLAYLIST LOUNGE
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
            {tiles.map((tile) => (
              <Link key={tile.roomId} href={tile.href} style={{ textDecoration: "none" }}>
                <div
                  style={{
                    borderRadius: 10,
                    border: `1px solid ${tile.accentColor}33`,
                    background: `linear-gradient(135deg, ${tile.accentColor}08, rgba(5,5,16,0.9))`,
                    overflow: "hidden",
                    position: "relative",
                    minHeight: 120,
                    padding: "12px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 8,
                      left: 8,
                      fontSize: 7,
                      fontWeight: 900,
                      letterSpacing: "0.1em",
                      color: tile.accentColor,
                      background: `${tile.accentColor}18`,
                      borderRadius: 4,
                      padding: "2px 6px",
                    }}
                  >
                    {LOUNGE_KIND_LABEL[tile.kind].toUpperCase()}
                  </div>
                  {tile.isLive ? (
                    <div
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        background: "rgba(220,38,38,0.9)",
                        borderRadius: 4,
                        padding: "2px 7px",
                      }}
                    >
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#fff", display: "inline-block" }} />
                      <span style={{ fontSize: 7, fontWeight: 900, color: "#fff", letterSpacing: "0.1em" }}>OPEN</span>
                    </div>
                  ) : null}
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#fff", marginBottom: 4, lineHeight: 1.3 }}>
                    {tile.title}
                  </div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", lineHeight: 1.35 }}>
                    {tile.subtitle}
                  </div>
                  {tile.viewerCount > 0 ? (
                    <div style={{ fontSize: 8, color: tile.accentColor, fontWeight: 700, marginTop: 6 }}>
                      👤 {tile.viewerCount} listening
                    </div>
                  ) : (
                    <div style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", marginTop: 6 }}>
                      Join &amp; listen · fans earn more points
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

export default PlaylistLoungeCanister;
