"use client";

import { useState } from "react";

type EventMode =
  | "LIVE_GENERAL"
  | "LIVE_BATTLE"
  | "LIVE_CHALLENGE"
  | "LIVE_CONCERT"
  | "LIVE_CYPHER";

interface DestinationCard {
  idx: number;
  mode: EventMode;
  label: string;
  desc: string;
  emoji: string;
  color: string;
  wall: string;
}

const DESTINATIONS: DestinationCard[] = [
  { idx: 0, mode: "LIVE_GENERAL",   label: "Regular Live",    desc: "Broadcast live to all fans",      emoji: "🔴", color: "#FF2DAA", wall: "Live Lobby Wall" },
  { idx: 1, mode: "LIVE_BATTLE",    label: "Battle",          desc: "Head-to-head on the Battle Wall",  emoji: "⚔️",  color: "#FF4444", wall: "Battle Wall" },
  { idx: 2, mode: "LIVE_CYPHER",    label: "Cypher",          desc: "Open cipher on the Cypher Wall",  emoji: "🎤", color: "#AA2DFF", wall: "Cypher Wall" },
  { idx: 3, mode: "LIVE_CHALLENGE", label: "Challenge",       desc: "Post a challenge to the world",   emoji: "🎯", color: "#FF8800", wall: "Challenge Wall" },
  { idx: 4, mode: "LIVE_GENERAL",   label: "Game Show",       desc: "Host a live game show",           emoji: "🎮", color: "#00FFFF", wall: "Live Lobby Wall" },
  { idx: 5, mode: "LIVE_CONCERT",   label: "World Concert",   desc: "Full concert experience",         emoji: "🎵", color: "#FFD700", wall: "Concert Wall" },
  { idx: 6, mode: "LIVE_GENERAL",   label: "Listening Party", desc: "Play your music live with fans",  emoji: "🎧", color: "#00FF88", wall: "Live Lobby Wall" },
  { idx: 7, mode: "LIVE_GENERAL",   label: "Rehearsal Room",  desc: "Private practice session",        emoji: "🎸", color: "#8899BB", wall: "Private" },
];

const GENRES = [
  "Hip-Hop", "R&B", "Trap", "EDM", "Pop",
  "Gospel", "Afrobeats", "Jazz", "Dance", "Comedy", "Podcast", "Other",
];

interface StartLiveSessionModalProps {
  onConfirm: (mode: EventMode, genre: string) => void;
  onCancel: () => void;
}

export default function StartLiveSessionModal({ onConfirm, onCancel }: StartLiveSessionModalProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [genre, setGenre] = useState("Hip-Hop");
  const dest = DESTINATIONS[selectedIdx];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Choose live session destination"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(3,2,14,0.97)",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "32px 20px 60px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 680 }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{
            fontSize: 9, letterSpacing: "0.35em", color: "#FF2DAA",
            fontWeight: 900, marginBottom: 8, fontFamily: "'Inter', sans-serif",
          }}>
            GO LIVE
          </div>
          <h1 style={{
            fontSize: "clamp(22px,5vw,34px)", fontWeight: 900, color: "#fff",
            margin: "0 0 6px", fontFamily: "'Inter', sans-serif",
          }}>
            Where are you going live?
          </h1>
          <p style={{
            fontSize: 13, color: "rgba(255,255,255,0.45)", margin: 0,
            fontFamily: "'Inter', sans-serif",
          }}>
            Choose your stage type. TMI routes you to the right wall automatically.
          </p>
        </div>

        {/* Destination cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(148px, 1fr))",
          gap: 10,
          marginBottom: 28,
        }}>
          {DESTINATIONS.map((d) => {
            const active = selectedIdx === d.idx;
            return (
              <button
                key={d.idx}
                onClick={() => setSelectedIdx(d.idx)}
                style={{
                  background: active
                    ? `linear-gradient(135deg, ${d.color}22, ${d.color}08)`
                    : "rgba(255,255,255,0.03)",
                  border: `1.5px solid ${active ? d.color : d.color + "28"}`,
                  borderRadius: 12,
                  padding: "14px 13px",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "border-color 0.15s, background 0.15s",
                  boxShadow: active ? `0 0 18px ${d.color}28` : "none",
                  outline: "none",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 7, lineHeight: 1 }}>{d.emoji}</div>
                <div style={{
                  fontSize: 12, fontWeight: 800,
                  color: active ? d.color : "#fff",
                  marginBottom: 4,
                }}>
                  {d.label}
                </div>
                <div style={{
                  fontSize: 9, color: "rgba(255,255,255,0.38)",
                  lineHeight: 1.5,
                }}>
                  {d.desc}
                </div>
                {active && (
                  <div style={{
                    marginTop: 8, fontSize: 8, fontWeight: 900,
                    color: d.color, letterSpacing: "0.1em",
                  }}>
                    → {d.wall}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Genre selector */}
        <div style={{
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 12,
          padding: "16px 18px",
          marginBottom: 24,
        }}>
          <div style={{
            fontSize: 9, fontWeight: 900, letterSpacing: "0.28em",
            color: "rgba(255,255,255,0.35)", marginBottom: 12,
            fontFamily: "'Inter', sans-serif",
          }}>
            GENRE
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {GENRES.map((g) => {
              const active = genre === g;
              return (
                <button
                  key={g}
                  onClick={() => setGenre(g)}
                  style={{
                    padding: "5px 13px",
                    borderRadius: 20,
                    border: `1px solid ${active ? "#00FFFF" : "rgba(255,255,255,0.1)"}`,
                    background: active ? "rgba(0,255,255,0.1)" : "transparent",
                    color: active ? "#00FFFF" : "rgba(255,255,255,0.45)",
                    fontSize: 11,
                    fontWeight: active ? 800 : 500,
                    cursor: "pointer",
                    transition: "all 0.1s",
                    outline: "none",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {g}
                </button>
              );
            })}
          </div>
        </div>

        {/* Summary + CTA */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
          paddingTop: 4,
        }}>
          <div style={{ fontFamily: "'Inter', sans-serif" }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginBottom: 3 }}>
              Routing to
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: dest.color }}>
              {dest.emoji} {dest.label} · {dest.wall}
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", marginTop: 2 }}>
              Genre: {genre}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={onCancel}
              style={{
                padding: "12px 22px",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "transparent",
                color: "rgba(255,255,255,0.38)",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'Inter', sans-serif",
                outline: "none",
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(dest.mode, genre)}
              style={{
                padding: "12px 32px",
                borderRadius: 8,
                border: "none",
                background: `linear-gradient(135deg, ${dest.color}, ${dest.color}cc)`,
                color: dest.color === "#FFD700" || dest.color === "#00FF88" || dest.color === "#00FFFF"
                  ? "#000"
                  : "#fff",
                fontSize: 13,
                fontWeight: 900,
                cursor: "pointer",
                letterSpacing: "0.06em",
                fontFamily: "'Inter', sans-serif",
                boxShadow: `0 4px 24px ${dest.color}44`,
                outline: "none",
              }}
            >
              🔴 GO LIVE
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
