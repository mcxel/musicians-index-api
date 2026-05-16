"use client";

/**
 * Home5OpenRoomsGrid.tsx
 * Section C — OPEN LIVE ROOMS
 * Visual room cards: thumbnail, host, occupancy, live badge, join CTA.
 * The biggest "make people stay" section.
 */

import Link from "next/link";
import { battleBillboardLobbyWallEngine } from "@/lib/competition/BattleBillboardLobbyWallEngine";
import { battlePredictionEngine } from "@/lib/competition/BattlePredictionEngine";
import { battleQueueEngine } from "@/lib/competition/BattleQueueEngine";
import { battleFallbackRotationEngine } from "@/lib/competition/BattleFallbackRotationEngine";

interface RoomCard {
  id: string;
  name: string;
  type: "battle" | "cypher" | "contest";
  genre: string;
  genreColor: string;
  thumbnail: string;
  hostName: string;
  hostAvatar?: string;
  occupancy: number;
  maxOccupancy: number;
  route: string;
  reward: number;
  isLive: boolean;
  slotsLeft: number;
  badge?: string; // e.g. "HOT", "SOLD OUT", "NEW"
  battleId?: string;
  queueDepth?: number;
  predictionPool?: number;
  fallbackGenre?: string;
}

const ROOMS: RoomCard[] = [
  {
    id: "r1",
    name: "Battle Arena Alpha",
    type: "battle",
    genre: "Hip Hop",
    genreColor: "#FF2DAA",
    thumbnail: "/tmi-curated/gameshow-31.jpg",
    hostName: "DJ Crown",
    hostAvatar: "/artists/artist-01.png",
    occupancy: 2,
    maxOccupancy: 2,
    route: "/battles/live",
    reward: 5000,
    isLive: true,
    slotsLeft: 0,
    badge: "LIVE",
  },
  {
    id: "r2",
    name: "R&B Cypher Room",
    type: "cypher",
    genre: "R&B",
    genreColor: "#AA2DFF",
    thumbnail: "/tmi-curated/venue-10.jpg",
    hostName: "Cipher Queen",
    hostAvatar: "/artists/artist-02.png",
    occupancy: 7,
    maxOccupancy: 20,
    route: "/cypher/live",
    reward: 3000,
    isLive: true,
    slotsLeft: 13,
    badge: "HOT",
  },
  {
    id: "r3",
    name: "Jazz Producer Room",
    type: "cypher",
    genre: "Jazz",
    genreColor: "#00FFFF",
    thumbnail: "/tmi-curated/venue-14.jpg",
    hostName: "Keys Master",
    hostAvatar: "/artists/artist-03.png",
    occupancy: 4,
    maxOccupancy: 12,
    route: "/cypher/live",
    reward: 3000,
    isLive: true,
    slotsLeft: 8,
  },
  {
    id: "r4",
    name: "Country Battle Room",
    type: "battle",
    genre: "Country",
    genreColor: "#FF6B35",
    thumbnail: "/tmi-curated/gameshow-35.jpg",
    hostName: "Road Host",
    hostAvatar: "/artists/artist-04.png",
    occupancy: 1,
    maxOccupancy: 2,
    route: "/battles/live",
    reward: 5000,
    isLive: false,
    slotsLeft: 1,
    badge: "1 SLOT",
  },
  {
    id: "r5",
    name: "Beatmaker Circle",
    type: "cypher",
    genre: "EDM",
    genreColor: "#00FFFF",
    thumbnail: "/tmi-curated/venue-18.jpg",
    hostName: "Pulse Host",
    hostAvatar: "/artists/artist-05.png",
    occupancy: 3,
    maxOccupancy: 16,
    route: "/cypher/live",
    reward: 3000,
    isLive: true,
    slotsLeft: 13,
  },
  {
    id: "r6",
    name: "Open Mic Arena",
    type: "contest",
    genre: "Pop",
    genreColor: "#FF2DAA",
    thumbnail: "/tmi-curated/venue-22.jpg",
    hostName: "Stage King",
    hostAvatar: "/artists/artist-06.png",
    occupancy: 11,
    maxOccupancy: 30,
    route: "/contests/live",
    reward: 4000,
    isLive: true,
    slotsLeft: 19,
    badge: "OPEN",
  },
];

const BADGE_STYLE: Record<string, { bg: string; color: string }> = {
  LIVE: { bg: "rgba(255,0,64,0.9)", color: "#fff" },
  HOT: { bg: "rgba(255,107,53,0.9)", color: "#fff" },
  "1 SLOT": { bg: "rgba(255,215,0,0.9)", color: "#000" },
  OPEN: { bg: "rgba(0,255,136,0.9)", color: "#000" },
  NEW: { bg: "rgba(170,45,255,0.9)", color: "#fff" },
};

export default function Home5OpenRoomsGrid() {
  const publishedBattleRooms: RoomCard[] = battleBillboardLobbyWallEngine.getLiveRoomCards().map((room, index) => {
    const battleId = room.roomId.startsWith("battle-") ? room.roomId.slice("battle-".length) : room.roomId;
    const queueDepth = battleQueueEngine.getQueue(battleId).length;
    const predictionPool = battlePredictionEngine.getPredictionsForBattle(battleId).length;

    if (!battleFallbackRotationEngine.getState(room.roomId)) {
      battleFallbackRotationEngine.seedRoom(room.roomId, "hip-hop");
    }
    const fallbackState = battleFallbackRotationEngine.tick(room.roomId, room.isLive ? 2 : 0);

    return {
      id: `pub-${room.roomId}`,
      name: room.headline,
      type: "battle",
      genre: "Live Challenge",
      genreColor: "#FF2DAA",
      thumbnail: "/tmi-curated/gameshow-31.jpg",
      hostName: "Battle Director",
      occupancy: room.isLive ? 2 : 1,
      maxOccupancy: 2,
      route: room.roomRoute,
      reward: 5000 - index * 500,
      isLive: room.isLive,
      slotsLeft: room.isLive ? 0 : 1,
      badge: room.isLive ? "LIVE" : "NEW",
      battleId,
      queueDepth,
      predictionPool,
      fallbackGenre: fallbackState?.currentGenre,
    };
  });

  const mergedRooms = [...publishedBattleRooms, ...ROOMS];

  return (
    <section style={{ display: "grid", gap: 12 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            fontSize: 13,
            fontWeight: 900,
            letterSpacing: "0.14em",
            color: "#00FF88",
            fontFamily: "var(--font-tmi-orbitron, 'Orbitron', monospace)",
          }}
        >
          OPEN LIVE ROOMS + CHALLENGE LOBBY
        </span>
        <span style={{ fontSize: 11, opacity: 0.6 }}>{mergedRooms.filter((r) => r.isLive).length} active</span>
        <Link
          href="/games"
          style={{
            marginLeft: "auto",
            fontSize: 11,
            color: "#00FF88",
            textDecoration: "none",
            opacity: 0.8,
          }}
        >
          See All Rooms →
        </Link>
      </div>

      {/* Room grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: 10,
        }}
      >
        {mergedRooms.map((room) => {
          const occupancyPct = room.occupancy / room.maxOccupancy;
          const typeColor = room.genreColor;
          const pulseShadow = room.isLive ? `0 0 18px ${typeColor}55` : "none";

          const meterSeed = room.id.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
          const meterBars = [0, 1, 2, 3, 4, 5].map((i) => ((meterSeed + i * 17) % 65) + 20);

          return (
            <div
              key={room.id}
              style={{
                border: `1px solid ${typeColor}44`,
                borderRadius: 10,
                overflow: "hidden",
                background: "#060810",
                display: "grid",
                gridTemplateRows: "auto 1fr",
                boxShadow: pulseShadow,
              }}
            >
              {/* Thumbnail */}
              <div
                style={{
                  height: 120,
                  background: `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(6,8,16,0.8)), url(${room.thumbnail}) center/cover`,
                  position: "relative",
                }}
              >
                {/* Badge */}
                {room.badge && BADGE_STYLE[room.badge] && (
                  <div
                    style={{
                      position: "absolute",
                      top: 8,
                      left: 8,
                      background: BADGE_STYLE[room.badge]!.bg,
                      color: BADGE_STYLE[room.badge]!.color,
                      borderRadius: 999,
                      padding: "2px 8px",
                      fontSize: 9,
                      fontWeight: 800,
                      letterSpacing: "0.1em",
                    }}
                  >
                    {room.badge}
                  </div>
                )}

                {/* Host avatar + name */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 8,
                    left: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: room.hostAvatar
                        ? `url(${room.hostAvatar}) center/cover`
                        : typeColor,
                      border: `1px solid ${typeColor}88`,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      textShadow: "0 1px 4px rgba(0,0,0,0.8)",
                    }}
                  >
                    {room.hostName}
                  </span>
                </div>

                {/* Viewer/occupancy */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 8,
                    right: 8,
                    background: "rgba(0,0,0,0.7)",
                    borderRadius: 6,
                    padding: "2px 6px",
                    fontSize: 9,
                    fontWeight: 600,
                  }}
                >
                  {room.occupancy}/{room.maxOccupancy}
                </div>

                <div
                  style={{
                    position: "absolute",
                    right: 8,
                    top: 8,
                    display: "grid",
                    gap: 4,
                    width: 82,
                  }}
                >
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 3 }}>
                    {[0, 1, 2].map((cell) => (
                      <div
                        key={`${room.id}-preview-${cell}`}
                        style={{
                          height: 16,
                          borderRadius: 4,
                          background: `linear-gradient(120deg, ${typeColor}66, rgba(0,0,0,0.35))`,
                          border: `1px solid ${typeColor}55`,
                        }}
                      />
                    ))}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 2, alignItems: "end", height: 18, background: "rgba(0,0,0,0.45)", borderRadius: 4, padding: "2px 3px" }}>
                    {meterBars.map((h, idx) => (
                      <div
                        key={`${room.id}-meter-${idx}`}
                        style={{
                          height: `${h}%`,
                          borderRadius: 3,
                          background: idx % 2 === 0 ? "#00ffff" : "#ff2daa",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Info section */}
              <div style={{ padding: 12, display: "grid", gap: 8 }}>
                {/* Genre + type */}
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: typeColor,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    {room.genre}
                  </span>
                  <span style={{ fontSize: 9, opacity: 0.5 }}>·</span>
                  <span style={{ fontSize: 9, opacity: 0.6, textTransform: "uppercase" }}>
                    {room.type}
                  </span>
                  {room.fallbackGenre && (
                    <span style={{ fontSize: 9, opacity: 0.75, color: "#00ffff", textTransform: "uppercase" }}>
                      fallback: {room.fallbackGenre}
                    </span>
                  )}
                </div>

                {/* Room name */}
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 800,
                    fontFamily: "var(--font-tmi-bebas, 'Bebas Neue', Impact, sans-serif)",
                    letterSpacing: "0.04em",
                    lineHeight: 1.2,
                  }}
                >
                  {room.name}
                </div>

                {/* Occupancy bar */}
                <div style={{ display: "grid", gap: 3 }}>
                  <div style={{ fontSize: 9, opacity: 0.6 }}>
                    {room.slotsLeft > 0 ? `${room.slotsLeft} slots left` : "Full"}
                  </div>
                  <div
                    style={{
                      height: 3,
                      background: "rgba(255,255,255,0.1)",
                      borderRadius: 999,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${occupancyPct * 100}%`,
                        background: occupancyPct >= 0.9 ? "#FF0040" : occupancyPct >= 0.6 ? "#FF6B35" : "#00FF88",
                        borderRadius: 999,
                        transition: "width 0.5s ease",
                      }}
                    />
                  </div>
                </div>

                {/* Reward + join */}
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#FFD700",
                    }}
                  >
                    {room.reward.toLocaleString()} pts
                  </span>
                  <Link
                    href={room.route}
                    style={{
                      marginLeft: "auto",
                      background: room.slotsLeft === 0
                        ? "rgba(255,255,255,0.08)"
                        : `linear-gradient(135deg, ${typeColor}, ${typeColor}99)`,
                      color: room.slotsLeft === 0 ? "rgba(255,255,255,0.4)" : "#000",
                      borderRadius: 6,
                      padding: "6px 12px",
                      fontSize: 11,
                      fontWeight: 800,
                      textDecoration: "none",
                      letterSpacing: "0.06em",
                      pointerEvents: room.slotsLeft === 0 ? "none" : "auto",
                    }}
                  >
                    {room.slotsLeft === 0 ? "WATCH" : "JOIN"}
                  </Link>
                </div>

                {(room.queueDepth !== undefined || room.predictionPool !== undefined) && (
                  <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 9, color: "rgba(255,255,255,0.72)" }}>
                    <span>Queue: {room.queueDepth ?? 0}</span>
                    <span>Predictions: {room.predictionPool ?? 0}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
