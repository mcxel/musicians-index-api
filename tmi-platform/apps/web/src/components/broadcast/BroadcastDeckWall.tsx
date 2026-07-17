"use client";

import Link from "next/link";
import { useBroadcastRotation } from "@/lib/broadcast/BroadcastRotationEngine";
import type { BroadcastFeedKind } from "@/types/broadcast";
import { KIND_TO_SHAPE } from "@/types/broadcast";
import { MaskedVideoTile, type BroadcastTileStatus } from "@/components/live/MaskedVideoTile";
import FanLobbyWall from "@/components/lobby/FanLobbyWall";
import PerformerLobbyWall from "@/components/lobby/PerformerLobbyWall";
import MixedLobbyWall from "@/components/lobby/MixedLobbyWall";
import { PERFORMER_REGISTRY } from "@/lib/performers/PerformerRegistry";

const LOBBY_WALL_KINDS = new Set<BroadcastFeedKind>([
  "fan-lobby-wall",
  "performer-lobby-wall",
  "mixed-lobby-wall",
]);

// Real performer accounts (bot-driven, real photo, real room) used to fill
// placeholder tile slots — never a generic emoji avatar. BroadcastRotationEngine
// never actually populates feed.performerIds, so the split-screen "Fighter 1" /
// "Fighter 2" battle tiles and the no-feed fallback grid were always 100%
// placeholder; these now resolve to a real, distinct, deterministically-picked
// room owner instead, so clicking through lands on a real profile/room.
const BOT_ROOM_OWNERS = PERFORMER_REGISTRY.filter((p) => p.profileImageUrl.startsWith("/bot-images/"));

function hashSeed(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h;
}

/** Deterministic pick so the same tile always shows the same "room owner" across re-renders. */
function pickRoomOwner(seed: string, offset = 0) {
  if (BOT_ROOM_OWNERS.length === 0) return null;
  return BOT_ROOM_OWNERS[(hashSeed(seed) + offset) % BOT_ROOM_OWNERS.length]!;
}

/** Pick `count` distinct room owners for a seed (used by the no-feed fallback grid). */
function pickDistinctRoomOwners(seed: string, count: number) {
  const picks: typeof BOT_ROOM_OWNERS = [];
  let offset = 0;
  while (picks.length < count && offset < BOT_ROOM_OWNERS.length) {
    const candidate = pickRoomOwner(seed, offset);
    if (candidate && !picks.some((p) => p.id === candidate.id)) picks.push(candidate);
    offset++;
  }
  return picks;
}

interface BroadcastDeckWallProps {
  sequence: BroadcastFeedKind[];
  title?: string;
  accentColor?: string;
  maxTiles?: number;
  intervalMs?: number;
}

export default function BroadcastDeckWall({
  sequence,
  title,
  accentColor = "#00FFFF",
  maxTiles = 8,
  intervalMs = 13000,
}: BroadcastDeckWallProps) {
  const { currentKind, currentLabel, currentFeeds, transitioning, toast } =
    useBroadcastRotation(sequence, intervalMs);

  const feeds = currentFeeds.slice(0, maxTiles);

  return (
    <div style={{ width: "100%" }}>
      {/* XP toast notification */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 80,
            right: 20,
            zIndex: 9999,
            background: "linear-gradient(135deg, #FFD700, #FF6B35)",
            color: "#050510",
            borderRadius: 10,
            padding: "12px 18px",
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: "0.08em",
            boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
            animation: "tmiToastSlide 0.35s ease",
            maxWidth: 280,
          }}
        >
          {toast}
          <div style={{ fontSize: 9, marginTop: 4, color: "rgba(5,5,16,0.7)" }}>
            Tap to join →
          </div>
        </div>
      )}

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
          padding: "0 4px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 4,
              height: 18,
              background: `linear-gradient(180deg, ${accentColor}, #FF2DAA)`,
              borderRadius: 2,
              boxShadow: `0 0 8px ${accentColor}`,
            }}
          />
          {title && (
            <span
              style={{
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: "0.22em",
                color: "#fff",
                textTransform: "uppercase",
              }}
            >
              {title}
            </span>
          )}
          <span
            style={{
              fontSize: 8,
              fontWeight: 900,
              color: accentColor,
              background: `${accentColor}14`,
              border: `1px solid ${accentColor}44`,
              borderRadius: 4,
              padding: "2px 8px",
              letterSpacing: "0.14em",
              opacity: transitioning ? 0 : 1,
              transition: "opacity 0.28s ease",
            }}
          >
            {currentLabel}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* 13s progress bar */}
          <div
            style={{
              width: 60,
              height: 3,
              borderRadius: 2,
              background: "rgba(255,255,255,0.08)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                background: accentColor,
                animation: `tmiDeckProgress ${intervalMs}ms linear infinite`,
                borderRadius: 2,
              }}
            />
          </div>
          <Link
            href="/live/rooms"
            style={{
              fontSize: 8,
              fontWeight: 700,
              color: accentColor,
              letterSpacing: "0.1em",
              textDecoration: "none",
            }}
          >
            VIEW ALL →
          </Link>
        </div>
      </div>

      {/* Tiles — or lobby wall when kind matches */}
      {LOBBY_WALL_KINDS.has(currentKind) ? (
        <div style={{ opacity: transitioning ? 0 : 1, transform: transitioning ? "translateY(6px)" : "translateY(0)", transition: "opacity 0.28s ease, transform 0.28s ease" }}>
          {currentKind === "fan-lobby-wall"       && <FanLobbyWall />}
          {currentKind === "performer-lobby-wall" && <PerformerLobbyWall />}
          {currentKind === "mixed-lobby-wall"     && <MixedLobbyWall />}
        </div>
      ) : (
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 14,
          justifyContent: "flex-start",
          opacity: transitioning ? 0 : 1,
          transform: transitioning ? "translateY(6px)" : "translateY(0)",
          transition: "opacity 0.28s ease, transform 0.28s ease",
        }}
      >
        {feeds.length === 0 ? (
          /* No feeds of this kind right now — fill with real room-owner accounts
             (Rule 15 progressive fill) instead of a generic mic emoji. */
          pickDistinctRoomOwners(currentKind, 4).map((owner) => (
            <Link key={owner.id} href={owner.profileRoute} style={{ textDecoration: "none" }}>
              <MaskedVideoTile
                shape="octagon"
                performerName={owner.name}
                avatarUrl={owner.profileImageUrl}
                performerSlug={owner.slug}
                accentColor={accentColor}
                size={160}
                isLive={false}
                genre={owner.category}
              />
            </Link>
          ))
        ) : (
          feeds.map((feed, i) => {
            const shape = feed.shape ?? KIND_TO_SHAPE[feed.kind] ?? "octagon";
            const isLive = feed.status === "live";
            const isSplit = feed.layoutMode === "split";

            if (isSplit && feed.performerIds && feed.performerIds.length >= 2) {
              // Battle split-screen: two tiles side by side
              return (
                <div
                  key={feed.id}
                  style={{
                    display: "flex",
                    gap: 6,
                    alignItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <MaskedVideoTile
                    shape="hexagon"
                    performerName={feed.performerIds[0] ?? "Fighter 1"}
                    avatarEmoji="⚔️"
                    accentColor={feed.accentColor ?? accentColor}
                    size={150}
                    isLive={isLive}
                    viewerCount={Math.floor((feed.viewerCount ?? 0) / 2)}
                    genre={feed.genre}
                    performerSlug={feed.performerIds[0]}
                  />
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 900,
                      color: "#FF2020",
                      textShadow: "0 0 8px #FF2020",
                      flexShrink: 0,
                    }}
                  >
                    VS
                  </div>
                  <MaskedVideoTile
                    shape="hexagon"
                    performerName={feed.performerIds[1] ?? "Fighter 2"}
                    avatarEmoji="🥊"
                    accentColor={feed.accentColor ?? accentColor}
                    size={150}
                    isLive={isLive}
                    viewerCount={Math.floor((feed.viewerCount ?? 0) / 2)}
                    genre={feed.genre}
                    performerSlug={feed.performerIds[1]}
                  />
                </div>
              );
            }

            // Single / spotlight / billboard tiles
            const tileSize = feed.layoutMode === "spotlight" ? 200 : i === 0 ? 190 : 160;
            return (
              <div key={feed.id} style={{ position: "relative" }}>
                {feed.isHighXP && (
                  <div
                    style={{
                      position: "absolute",
                      top: -14,
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "#FFD700",
                      color: "#050510",
                      fontSize: 7,
                      fontWeight: 900,
                      letterSpacing: "0.1em",
                      padding: "2px 8px",
                      borderRadius: 4,
                      whiteSpace: "nowrap",
                      zIndex: 30,
                      boxShadow: "0 0 10px #FFD70088",
                    }}
                  >
                    ⭐ HIGH XP {feed.prizePool ? `· ${feed.prizePool}` : ""}
                  </div>
                )}
                <Link href={feed.href} style={{ textDecoration: "none" }}>
                  <MaskedVideoTile
                    shape={shape}
                    performerName={feed.title}
                    avatarEmoji={feed.avatarEmoji ?? "🎤"}
                    accentColor={feed.accentColor ?? accentColor}
                    size={tileSize}
                    isLive={isLive}
                    viewerCount={feed.viewerCount ?? 0}
                    genre={feed.genre}
                  />
                </Link>
              </div>
            );
          })
        )}
      </div>
      )}

      <style>{`
        @keyframes tmiDeckProgress {
          from { width: 0%; }
          to { width: 100%; }
        }
        @keyframes tmiToastSlide {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
