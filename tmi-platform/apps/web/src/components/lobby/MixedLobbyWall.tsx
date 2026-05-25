"use client";

import { useState } from "react";
import Link from "next/link";

type TileRole = "fan" | "performer";

interface MixedTile {
  id: string;
  name: string;
  emoji: string;
  role: TileRole;
  genre: string;
  online: boolean;
  engagement?: number;
  accentColor: string;
}

const SEED_MIXED: MixedTile[] = [
  { id: "mx1", name: "Astra Nova",   emoji: "🎤", role: "performer", genre: "R&B",      online: true,  engagement: 94,  accentColor: "#FF2DAA" },
  { id: "mx2", name: "Nova_Fan",     emoji: "🎧", role: "fan",       genre: "Hip-Hop",  online: true,  accentColor: "#00FFFF" },
  { id: "mx3", name: "Zion Freq",    emoji: "👑", role: "performer", genre: "Gospel",   online: true,  engagement: 88,  accentColor: "#FFD700" },
  { id: "mx4", name: "CrownFam",     emoji: "👥", role: "fan",       genre: "Trap",     online: true,  accentColor: "#00FFFF" },
  { id: "mx5", name: "Prism Vex",    emoji: "🎛️", role: "performer", genre: "EDM",      online: true,  engagement: 76,  accentColor: "#AA2DFF" },
  { id: "mx6", name: "WaveRider",    emoji: "🌊", role: "fan",       genre: "EDM",      online: true,  accentColor: "#00FFFF" },
  { id: "mx7", name: "Lagos Burst",  emoji: "🔥", role: "performer", genre: "Afrobeat", online: false, engagement: 61,  accentColor: "#FF6B35" },
  { id: "mx8", name: "SoulTribe",    emoji: "✨", role: "fan",       genre: "Gospel",   online: true,  accentColor: "#00FFFF" },
];

const ROLE_COLOR: Record<TileRole, string> = {
  fan:      "#00FFFF",
  performer:"#FF2DAA",
};

const ROLE_LABEL: Record<TileRole, string> = {
  fan:      "FAN",
  performer:"PERFORMER",
};

interface Props {
  compact?: boolean;
}

export default function MixedLobbyWall({ compact = false }: Props) {
  const [connecting, setConnecting] = useState<Set<string>>(new Set());

  function connect(id: string) {
    setConnecting((prev) => new Set(prev).add(id));
  }

  const tiles = compact ? SEED_MIXED.slice(0, 4) : SEED_MIXED;

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.2em", color: "#AA2DFF" }}>
          DISCOVERY BRIDGE · {SEED_MIXED.length} ONLINE
        </div>
        <Link href="/live/lobby" style={{ fontSize: 8, color: "#AA2DFF", textDecoration: "none", letterSpacing: "0.1em" }}>
          VIEW ALL →
        </Link>
      </div>

      {/* Role filter hint */}
      {!compact && (
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <div style={{ fontSize: 7, color: "#00FFFF", background: "rgba(0,255,255,0.08)", border: "1px solid rgba(0,255,255,0.25)", borderRadius: 4, padding: "3px 8px", fontWeight: 900 }}>
            ● FANS
          </div>
          <div style={{ fontSize: 7, color: "#FF2DAA", background: "rgba(255,45,170,0.08)", border: "1px solid rgba(255,45,170,0.25)", borderRadius: 4, padding: "3px 8px", fontWeight: 900 }}>
            ● PERFORMERS
          </div>
          <div style={{ fontSize: 7, color: "rgba(255,255,255,0.4)", marginLeft: "auto", alignSelf: "center" }}>
            Fans see performers first · Performers see top fans
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {tiles.map((tile) => {
          const sent = connecting.has(tile.id);
          const roleColor = ROLE_COLOR[tile.role];
          const tileAccent = tile.role === "performer" ? tile.accentColor : roleColor;

          return (
            <div
              key={tile.id}
              style={{
                borderRadius: 12,
                border: `1.5px solid ${tileAccent}33`,
                background: `linear-gradient(145deg, ${tileAccent}07, rgba(5,5,16,0.88))`,
                padding: "12px 10px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 5,
                opacity: tile.online ? 1 : 0.5,
              }}
            >
              {/* Avatar */}
              <div style={{
                width: 48,
                height: 48,
                borderRadius: tile.role === "performer" ? "30%" : "50%",
                background: `${tileAccent}18`,
                border: `2px solid ${tileAccent}55`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
              }}>
                {tile.emoji}
              </div>

              {/* Role badge */}
              <div style={{
                fontSize: 6,
                fontWeight: 900,
                color: roleColor,
                background: `${roleColor}14`,
                border: `1px solid ${roleColor}33`,
                borderRadius: 4,
                padding: "1px 5px",
                letterSpacing: "0.12em",
              }}>
                {ROLE_LABEL[tile.role]}
              </div>

              {/* Name */}
              <div style={{ fontSize: 9, fontWeight: 800, color: "#fff", textAlign: "center" }}>
                {tile.name}
              </div>

              {/* Genre */}
              <div style={{ fontSize: 7, color: "rgba(255,255,255,0.45)" }}>
                {tile.genre}
              </div>

              {/* Engagement for performers */}
              {tile.role === "performer" && tile.engagement != null && (
                <div style={{ fontSize: 7, color: tileAccent, fontWeight: 900 }}>
                  {tile.engagement}% engagement
                </div>
              )}

              {/* Connect button */}
              {!compact && (
                <button
                  onClick={() => connect(tile.id)}
                  disabled={sent || !tile.online}
                  style={{
                    marginTop: 3,
                    padding: "4px 8px",
                    borderRadius: 5,
                    border: sent ? "1px solid rgba(255,255,255,0.15)" : `1px solid ${tileAccent}55`,
                    background: sent ? "rgba(255,255,255,0.05)" : `${tileAccent}14`,
                    color: sent ? "rgba(255,255,255,0.35)" : tileAccent,
                    fontSize: 7,
                    fontWeight: 900,
                    letterSpacing: "0.1em",
                    cursor: sent || !tile.online ? "default" : "pointer",
                    width: "100%",
                  }}
                >
                  {sent ? "SENT ✓" : tile.role === "performer" ? "FOLLOW" : "INVITE"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
