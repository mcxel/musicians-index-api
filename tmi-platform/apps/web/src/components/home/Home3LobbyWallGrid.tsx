"use client";

import Link from "next/link";
import TmiBadgeLabel from "@/components/typography/TmiBadgeLabel";
import TmiCardTitle from "@/components/typography/TmiCardTitle";
import TripleImageCarousel from "@/lib/media/TripleImageCarousel";

type LobbyTile = {
  roomId: string;
  roomName: string;
  genre: string;
  host: string;
  occupancy: string;
  accent: string;
  previewLabels: [string, string, string];
};

const LOBBY_TILES: LobbyTile[] = [
  {
    roomId: "north-atrium",
    roomName: "Lobby A",
    genre: "R&B Stage",
    host: "Host Kova",
    occupancy: "54 / 80",
    accent: "#ff2daa",
    previewLabels: ["/tmi-curated/mag-58.jpg", "/tmi-curated/mag-66.jpg", "/tmi-curated/mag-74.jpg"],
  },
  {
    roomId: "midnight-pit",
    roomName: "Lobby B",
    genre: "Trap Arena",
    host: "Host Nero",
    occupancy: "68 / 80",
    accent: "#00ffff",
    previewLabels: ["/tmi-curated/gameshow-35.jpg", "/tmi-curated/mag-58.jpg", "/tmi-curated/venue-22.jpg"],
  },
  {
    roomId: "golden-hall",
    roomName: "Lobby C",
    genre: "Open Cypher",
    host: "Host Sol",
    occupancy: "39 / 80",
    accent: "#ffd700",
    previewLabels: ["/tmi-curated/venue-10.jpg", "/tmi-curated/venue-14.jpg", "/tmi-curated/venue-18.jpg"],
  },
];

function LiveTile({ tile }: { tile: LobbyTile }) {
  return (
    <article
      style={{
        borderRadius: 10,
        border: `1px solid ${tile.accent}66`,
        background: "rgba(8,8,20,0.82)",
        padding: 8,
        display: "grid",
        gap: 8,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }}>
        <TmiBadgeLabel color={tile.accent}>Live</TmiBadgeLabel>
        <span
          style={{
            fontFamily: "var(--font-tmi-orbitron), 'Orbitron', sans-serif",
            fontSize: 10,
            color: tile.accent,
          }}
        >
          {tile.occupancy}
        </span>
      </div>

      <TripleImageCarousel images={tile.previewLabels} borderColor={tile.accent} height={92} intervalMs={8200} />

      <div style={{ display: "grid", gap: 3 }}>
        <TmiCardTitle style={{ fontSize: 20 }}>{tile.roomName}</TmiCardTitle>
        <span
          style={{
            fontFamily: "var(--font-tmi-rajdhani), 'Rajdhani', sans-serif",
            fontSize: 12,
            color: "rgba(255,255,255,0.82)",
          }}
        >
          {tile.genre}
        </span>
        <span
          style={{
            fontFamily: "var(--font-tmi-rajdhani), 'Rajdhani', sans-serif",
            fontSize: 11,
            color: "rgba(255,255,255,0.72)",
          }}
        >
          {tile.host}
        </span>
      </div>

      <Link
        href={`/rooms/${tile.roomId}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          textDecoration: "none",
          borderRadius: 8,
          border: `1px solid ${tile.accent}77`,
          background: `${tile.accent}22`,
          color: tile.accent,
          minHeight: 30,
          fontFamily: "var(--font-tmi-anton), 'Anton', sans-serif",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          fontSize: 11,
        }}
      >
        Join Room
      </Link>
    </article>
  );
}

export default function Home3LobbyWallGrid() {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span
          style={{
            fontFamily: "var(--font-tmi-anton), 'Anton', sans-serif",
            fontSize: 10,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.72)",
          }}
        >
          Lobby Wall Grid
        </span>
        <TmiBadgeLabel color="#00ff88">3 Live Tiles</TmiBadgeLabel>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }}>
        {LOBBY_TILES.map((tile) => (
          <LiveTile key={tile.roomId} tile={tile} />
        ))}
      </div>
    </div>
  );
}
