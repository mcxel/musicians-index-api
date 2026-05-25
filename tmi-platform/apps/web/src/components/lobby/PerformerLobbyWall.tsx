"use client";

import { useState } from "react";
import Link from "next/link";

interface PerformerTile {
  id: string;
  name: string;
  emoji: string;
  genre: string;
  category: string;
  lookingToCollab: boolean;
  viewers: number;
  accentColor: string;
}

const SEED_PERFORMERS: PerformerTile[] = [
  { id: "p1", name: "Astra Nova",   emoji: "🎤", genre: "R&B",       category: "Singer",       lookingToCollab: true,  viewers: 847,  accentColor: "#FF2DAA" },
  { id: "p2", name: "Lagos Burst",  emoji: "🔥", genre: "Afrobeat",  category: "Performer",    lookingToCollab: false, viewers: 563,  accentColor: "#FF6B35" },
  { id: "p3", name: "Prism Vex",    emoji: "🎛️", genre: "EDM",       category: "DJ/Producer",  lookingToCollab: true,  viewers: 701,  accentColor: "#00FFFF" },
  { id: "p4", name: "Zion Freq",    emoji: "👑", genre: "Gospel",    category: "Singer",       lookingToCollab: true,  viewers: 1204, accentColor: "#FFD700" },
  { id: "p5", name: "Flex King",    emoji: "💃", genre: "Dance",     category: "Dancer",       lookingToCollab: false, viewers: 389,  accentColor: "#AA2DFF" },
  { id: "p6", name: "Nova Laugh",   emoji: "😂", genre: "Comedy",    category: "Comedian",     lookingToCollab: true,  viewers: 512,  accentColor: "#39FF14" },
];

interface Props {
  compact?: boolean;
}

export default function PerformerLobbyWall({ compact = false }: Props) {
  const [connecting, setConnecting] = useState<Set<string>>(new Set());

  function connect(id: string) {
    setConnecting((prev) => new Set(prev).add(id));
  }

  const tiles = compact ? SEED_PERFORMERS.slice(0, 3) : SEED_PERFORMERS;
  const cols = compact ? 3 : 3;

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.2em", color: "#FF2DAA" }}>
          PERFORMER CONNECT · {tiles.length} ONLINE
        </div>
        <Link href="/live/lobby/performers" style={{ fontSize: 8, color: "#FF2DAA", textDecoration: "none", letterSpacing: "0.1em" }}>
          VIEW ALL →
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12 }}>
        {tiles.map((p) => {
          const sent = connecting.has(p.id);
          return (
            <div
              key={p.id}
              style={{
                borderRadius: 14,
                border: `1.5px solid ${p.accentColor}44`,
                background: `linear-gradient(145deg, ${p.accentColor}09, rgba(5,5,16,0.9))`,
                padding: "14px 12px",
                display: "flex",
                flexDirection: "column",
                gap: 6,
                position: "relative",
              }}
            >
              {/* Live badge */}
              <div style={{ position: "absolute", top: 8, right: 8, background: "#FF2DAA", borderRadius: 4, padding: "2px 5px", fontSize: 7, fontWeight: 900, color: "#fff", letterSpacing: "0.1em" }}>
                ● LIVE
              </div>

              {/* Camera frame */}
              <div style={{
                width: "100%",
                paddingBottom: "56.25%",
                position: "relative",
                borderRadius: 10,
                overflow: "hidden",
                background: `linear-gradient(135deg, ${p.accentColor}18, rgba(5,5,16,0.9))`,
                marginBottom: 4,
              }}>
                <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.12) 3px,rgba(0,0,0,0.12) 4px)" }} />
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 4 }}>
                  <div style={{ fontSize: 30 }}>{p.emoji}</div>
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,0.5)" }}>{p.name}</div>
                </div>
                <div style={{ position: "absolute", bottom: 5, right: 5, background: "rgba(0,0,0,0.6)", borderRadius: 4, padding: "2px 6px", fontSize: 8, color: "rgba(255,255,255,0.7)", fontWeight: 700 }}>
                  👁 {p.viewers.toLocaleString()}
                </div>
              </div>

              {/* Name */}
              <div style={{ fontSize: 11, fontWeight: 800, color: "#fff" }}>{p.name}</div>

              {/* Genre + category */}
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                <span style={{ fontSize: 7, background: `${p.accentColor}22`, border: `1px solid ${p.accentColor}44`, color: p.accentColor, borderRadius: 4, padding: "2px 6px", fontWeight: 900, letterSpacing: "0.1em" }}>
                  {p.genre}
                </span>
                <span style={{ fontSize: 7, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)", borderRadius: 4, padding: "2px 6px" }}>
                  {p.category}
                </span>
              </div>

              {/* Collab indicator */}
              {p.lookingToCollab && (
                <div style={{ fontSize: 7, color: "#00FF88", fontWeight: 900, letterSpacing: "0.1em" }}>
                  ✦ LOOKING TO COLLAB
                </div>
              )}

              {/* Connect button */}
              {!compact && (
                <button
                  onClick={() => connect(p.id)}
                  disabled={sent}
                  style={{
                    marginTop: 2,
                    padding: "6px 10px",
                    borderRadius: 6,
                    border: sent ? "1px solid rgba(255,255,255,0.2)" : `1px solid ${p.accentColor}66`,
                    background: sent ? "rgba(255,255,255,0.06)" : `${p.accentColor}18`,
                    color: sent ? "rgba(255,255,255,0.4)" : p.accentColor,
                    fontSize: 8,
                    fontWeight: 900,
                    letterSpacing: "0.1em",
                    cursor: sent ? "default" : "pointer",
                    width: "100%",
                  }}
                >
                  {sent ? "REQUEST SENT ✓" : "CONNECT"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
