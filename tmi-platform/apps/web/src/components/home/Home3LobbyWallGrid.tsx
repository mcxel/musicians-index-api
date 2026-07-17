"use client";

import { useState, useEffect } from "react";
import TmiBadgeLabel from "@/components/typography/TmiBadgeLabel";
import TmiCardTitle from "@/components/typography/TmiCardTitle";
import TMILiveMediaWidget from "@/components/media/TMILiveMediaWidget";
import { useLiveSync } from "@/lib/media/useLiveSync";
import type { LiveFeedItem, LobbyGenre } from "@/components/billboard/TMIBillboardLiveWall";
import { LobbyEntryFlow, type UniversalRoom } from "@/components/room/UniversalLobbyEntry";
import { PERFORMER_REGISTRY } from "@/lib/performers/PerformerRegistry";

// Real bot performer accounts — fill the gap when no live room matches this
// lobby's genres, instead of showing "CONNECTING..." forever. Never labeled
// LIVE (Rule 20) — just a real account's photo standing in for an open room.
const LOBBY_FILLERS = PERFORMER_REGISTRY.filter((p) => p.profileImageUrl.startsWith("/bot-images/"));
const FILLER_ROTATE_MS = 13000;

function hashSeed(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h;
}

const LOBBY_CONFIG = [
  {
    id:      "lobby-a",
    label:   "Lobby A",
    genres:  ["live", "concert"] as LobbyGenre[],
    accent:  "#FF2DAA",
    fallbackRoomId: "north-atrium",
    fallbackName:   "R&B Stage",
  },
  {
    id:      "lobby-b",
    label:   "Lobby B",
    genres:  ["battle", "cypher"] as LobbyGenre[],
    accent:  "#00FFFF",
    fallbackRoomId: "midnight-pit",
    fallbackName:   "Battle Arena",
  },
  {
    id:      "lobby-c",
    label:   "Lobby C",
    genres:  ["challenge", "game"] as LobbyGenre[],
    accent:  "#FFD700",
    fallbackRoomId: "golden-hall",
    fallbackName:   "Open Cypher",
  },
] as const;

const ROTATE_INTERVAL_MS = 4500;

/** Pick the highest-scored live room matching given genres from the feed */
function pickRoom(feed: LiveFeedItem[], genres: LobbyGenre[], skip: string[]): LiveFeedItem | null {
  const candidates = feed
    .filter((f) => f.isLive && genres.includes(f.genre) && !skip.includes(f.performerId))
    .sort((a, b) => (b.viewers * 2 + b.tips * 3 + b.activityLevel) - (a.viewers * 2 + a.tips * 3 + a.activityLevel));
  return candidates[0] ?? null;
}

function LiveLobbyTile({
  config,
  feed,
}: {
  config: typeof LOBBY_CONFIG[number];
  feed: LiveFeedItem[];
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [pendingRoom, setPendingRoom] = useState<UniversalRoom | null>(null);
  const [fillerTick, setFillerTick] = useState(0);

  // Rotate through matching rooms every ROTATE_INTERVAL_MS
  const matches = feed
    .filter((f) => f.isLive && config.genres.includes(f.genre))
    .sort((a, b) => (b.viewers * 2 + b.tips * 3) - (a.viewers * 2 + a.tips * 3))
    .slice(0, 6);

  // Independent 13s filler rotation, staggered per-tile so lobbies don't all
  // change in lockstep. Only runs while no real live room fills this slot.
  useEffect(() => {
    if (matches.length > 0) return;
    let intervalId: number | undefined;
    const startDelay = hashSeed(config.id) % 4000;
    const startTimeout = window.setTimeout(() => {
      setFillerTick((t) => t + 1);
      intervalId = window.setInterval(() => setFillerTick((t) => t + 1), FILLER_ROTATE_MS);
    }, startDelay);
    return () => {
      window.clearTimeout(startTimeout);
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [matches.length, config.id]);

  const filler = LOBBY_FILLERS.length > 0
    ? LOBBY_FILLERS[(hashSeed(config.id) + fillerTick) % LOBBY_FILLERS.length]!
    : null;

  useEffect(() => {
    if (matches.length <= 1) return;
    const t = setInterval(() => {
      setActiveIdx((i) => (i + 1) % matches.length);
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(t);
  }, [matches.length]);

  const active = matches[activeIdx] ?? null;

  const handleJoin = () => {
    const roomId = active ? active.roomId : config.fallbackRoomId;
    const room: UniversalRoom = {
      id:           roomId,
      title:        active ? active.performerName : config.fallbackName,
      genre:        active ? active.genre.toUpperCase() : config.genres.join(" / ").toUpperCase(),
      viewers:      active?.viewers ?? 0,
      status:       "live",
      access:       "free",
      accentColor:  config.accent,
      roomRoute:    `/live/rooms/${roomId}?from=lobby-wall`,
      venueIndex:   0,
      shape:        "oct",
    };
    setPendingRoom(room);
  };

  return (
    <>
      {pendingRoom && <LobbyEntryFlow room={pendingRoom} onClose={() => setPendingRoom(null)} />}
    <article
      style={{
        borderRadius: 10,
        border: `1px solid ${config.accent}66`,
        background: "rgba(8,8,20,0.82)",
        padding: 8,
        display: "grid",
        gap: 8,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }}>
        <TmiBadgeLabel color={config.accent}>{active ? "Live" : "Open"}</TmiBadgeLabel>
        {active && (
          <span style={{ fontFamily: "var(--font-tmi-orbitron), 'Orbitron', sans-serif", fontSize: 10, color: config.accent }}>
            {active.viewers.toLocaleString()} watching
          </span>
        )}
      </div>

      {/* Live media widget — auto-switches, hover audio preview */}
      <div style={{ height: 92, borderRadius: 6, overflow: "hidden" }}>
        {active ? (
          <TMILiveMediaWidget
            performerId={active.performerId}
            performerName={active.performerName}
            performerTier={active.performerTier}
            genre={active.genre}
            isLive={active.isLive}
            roomId={active.roomId}
            liveViewerCount={active.viewers}
            accentColor={config.accent}
            variant="homepage"
            size="full"
            showOverlay={false}
            onEnterLobby={handleJoin}
          />
        ) : filler ? (
          // No live room here right now — show a real account's photo (never
          // labeled LIVE) instead of a dead "CONNECTING..." spinner.
          <div
            onClick={handleJoin}
            style={{
              width: "100%", height: "100%", position: "relative", cursor: "pointer", overflow: "hidden",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={filler.profileImageUrl}
              alt={filler.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.82), transparent 55%)" }} />
            <div style={{ position: "absolute", bottom: 6, left: 8, right: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 900, color: "#fff" }}>{filler.name}</div>
              <div style={{ fontSize: 8, color: config.accent, fontWeight: 800, letterSpacing: "0.08em" }}>
                OPEN LOBBY · {filler.category.toUpperCase()}
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              width: "100%", height: "100%",
              background: `radial-gradient(circle at 50% 50%, ${config.accent}18 0%, #050510 70%)`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <span style={{ fontSize: 9, color: config.accent, letterSpacing: "0.14em", fontWeight: 800 }}>
              CONNECTING...
            </span>
          </div>
        )}
      </div>

      <div style={{ display: "grid", gap: 3 }}>
        <TmiCardTitle style={{ fontSize: 18 }}>
          {active ? active.performerName : config.label}
        </TmiCardTitle>
        <span style={{ fontFamily: "var(--font-tmi-rajdhani), 'Rajdhani', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.55)" }}>
          {active ? active.genre.toUpperCase() : config.genres.join(" / ").toUpperCase()}
        </span>
      </div>

      <button
        onClick={handleJoin}
        style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          textDecoration: "none", borderRadius: 8, border: `1px solid ${config.accent}77`,
          background: `${config.accent}22`, color: config.accent, minHeight: 30,
          fontFamily: "var(--font-tmi-anton), 'Anton', sans-serif",
          letterSpacing: "0.1em", textTransform: "uppercase", fontSize: 11,
          cursor: "pointer",
        }}
      >
        Join Room
      </button>

      {/* Room rotation dots */}
      {matches.length > 1 && (
        <div style={{ display: "flex", gap: 4, justifyContent: "center", paddingTop: 2 }}>
          {matches.map((_, i) => (
            <span
              key={i}
              onClick={() => setActiveIdx(i)}
              style={{
                width: i === activeIdx ? 16 : 6,
                height: 6, borderRadius: 999,
                background: i === activeIdx ? config.accent : `${config.accent}40`,
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </div>
      )}
    </article>
    </>
  );
}

export default function Home3LobbyWallGrid() {
  const { feed } = useLiveSync();

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{
          fontFamily: "var(--font-tmi-anton), 'Anton', sans-serif",
          fontSize: 10, letterSpacing: "0.16em",
          textTransform: "uppercase", color: "rgba(255,255,255,0.72)",
        }}>
          Lobby Wall Grid
        </span>
        <TmiBadgeLabel color="#00ff88">
          {feed.filter(f => f.isLive).length} Live
        </TmiBadgeLabel>
      </div>
      <div data-home3-lobby-wall style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }}>
        <style>{`
          @media (max-width: 767px) {
            [data-home3-lobby-wall] {
              grid-template-columns: 1fr !important;
            }
          }
          @media (min-width: 768px) and (max-width: 1023px) {
            [data-home3-lobby-wall] {
              grid-template-columns: 1fr 1fr !important;
            }
          }
        `}</style>
        {LOBBY_CONFIG.map((config) => (
          <LiveLobbyTile key={config.id} config={config} feed={feed} />
        ))}
      </div>
    </div>
  );
}
