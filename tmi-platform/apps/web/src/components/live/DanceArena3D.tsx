"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { SeatingMeshState, MeshSeat } from "@/lib/seats/SeatingMeshEngine";

interface DanceArena3DProps {
  mesh: SeatingMeshState;
  fanSeat: MeshSeat | null;
  activeColor: string;
  bpm: number;
  ralphAnim: string;
  ralphAnimColor: string;
  ralphAnimLabel: string;
  currentTrackTitle: string;
  currentTrackArtist: string;
}

const FLOOR_COLS = 8;
const FLOOR_ROWS = 6;

const EMOJI_POOL = ["🕺","💃","🔥","🌊","👑","⚡","🎧","✨","🎤","💎","🙌","👏"];

function avatarEmoji(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return EMOJI_POOL[h % EMOJI_POOL.length]!;
}

export default function DanceArena3D({
  mesh,
  fanSeat,
  activeColor,
  bpm,
  ralphAnim,
  ralphAnimColor,
  ralphAnimLabel,
  currentTrackTitle,
  currentTrackArtist,
}: DanceArena3DProps) {
  const beatDuration = (60 / bpm) * 2;

  const occupiedSeats = useMemo(
    () => Object.values(mesh.seats).filter((s) => s.status !== "open"),
    [mesh.seats],
  );

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "16/9",
        overflow: "hidden",
        borderRadius: 16,
        border: `1px solid ${activeColor}33`,
        background: "#050510",
      }}
    >
      {/* Ambient glow behind scene */}
      <motion.div
        animate={{ opacity: [0.25, 0.55, 0.25] }}
        transition={{ repeat: Infinity, duration: beatDuration, ease: "easeInOut" }}
        style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(ellipse at 50% 60%, ${activeColor}22 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* ── 3D perspective scene ──────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute", inset: 0,
          perspective: "600px",
          perspectiveOrigin: "50% 30%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-end",
          paddingBottom: 12,
        }}
      >
        {/* Back wall */}
        <div
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0,
            height: "45%",
            background: "linear-gradient(180deg, #0a0a20 0%, #080818 100%)",
            borderBottom: `1px solid ${activeColor}44`,
          }}
        >
          {/* Stage truss lights */}
          <div style={{ display: "flex", justifyContent: "space-around", paddingTop: 8 }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.4, 1, 0.4], scaleY: [0.8, 1, 0.8] }}
                transition={{ repeat: Infinity, duration: beatDuration, delay: i * 0.12 }}
                style={{
                  width: 4, height: 28, borderRadius: 2,
                  background: `linear-gradient(180deg, ${activeColor}, transparent)`,
                  transformOrigin: "top center",
                }}
              />
            ))}
          </div>
        </div>

        {/* DJ Booth — centred at mid-height */}
        <div
          style={{
            position: "absolute",
            top: "18%",
            left: "50%",
            transform: "translateX(-50%) rotateX(12deg)",
            width: 140,
            zIndex: 10,
            textAlign: "center",
          }}
        >
          {/* Booth surface */}
          <div
            style={{
              background: "linear-gradient(135deg, #1a0a2e, #0d0d22)",
              border: `2px solid ${activeColor}`,
              borderRadius: 10,
              padding: "8px 14px",
              boxShadow: `0 0 24px ${activeColor}66`,
            }}
          >
            {/* Vinyl disc */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: beatDuration, repeat: Infinity, ease: "linear" }}
              style={{
                width: 44, height: 44, borderRadius: "50%", margin: "0 auto 6px",
                background: `conic-gradient(${activeColor}, #0a0a1a, ${activeColor}88, #0a0a1a)`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#050510" }} />
            </motion.div>

            <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.1em", color: ralphAnimColor }}>
              {ralphAnimLabel}
            </div>
            <div style={{ fontSize: 7, color: "rgba(255,255,255,0.4)", marginTop: 2, lineHeight: 1.3 }}>
              {currentTrackTitle}
            </div>
            <div style={{ fontSize: 6, color: "rgba(255,255,255,0.25)", marginTop: 1 }}>
              {currentTrackArtist}
            </div>
          </div>

          {/* Ralph label */}
          <div style={{ fontSize: 7, color: activeColor, fontWeight: 800, letterSpacing: 2, marginTop: 4 }}>
            🎧 RECORD RALPH
          </div>
        </div>

        {/* Dance floor — 3D perspective grid */}
        <div
          style={{
            transform: "rotateX(52deg)",
            transformOrigin: "bottom center",
            width: "92%",
            marginBottom: 0,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${FLOOR_COLS}, 1fr)`,
              gap: 3,
              padding: 3,
            }}
          >
            {Array.from({ length: FLOOR_ROWS * FLOOR_COLS }, (_, i) => {
              const row = Math.floor(i / FLOOR_COLS);
              const col = i % FLOOR_COLS;
              const seatKey = `${mesh.roomId}:seat-${row}-${col}`;
              const seat = mesh.seats[seatKey];
              const occupied = seat && seat.status !== "open";
              const isMe = seat?.seatId === fanSeat?.seatId;

              return (
                <motion.div
                  key={i}
                  animate={
                    occupied
                      ? { opacity: [0.7, 1, 0.7], scale: [0.95, 1.05, 0.95] }
                      : { opacity: [0.15, 0.3, 0.15] }
                  }
                  transition={{
                    repeat: Infinity,
                    duration: beatDuration,
                    delay: ((row + col) * 0.07) % beatDuration,
                  }}
                  style={{
                    aspectRatio: "1",
                    borderRadius: 3,
                    fontSize: occupied ? 10 : 7,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: isMe
                      ? `${activeColor}55`
                      : occupied
                      ? "rgba(255,45,170,0.25)"
                      : "rgba(255,255,255,0.04)",
                    border: isMe
                      ? `1px solid ${activeColor}`
                      : occupied
                      ? "1px solid rgba(255,45,170,0.3)"
                      : "1px solid rgba(255,255,255,0.06)",
                    cursor: "default",
                  }}
                  title={isMe ? "YOU" : undefined}
                >
                  {isMe
                    ? "🫵"
                    : occupied
                    ? avatarEmoji(seat?.occupantFanId ?? String(i))
                    : ""}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Stage rim light */}
        <motion.div
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{ repeat: Infinity, duration: beatDuration }}
          style={{
            position: "absolute",
            bottom: 6,
            left: "4%", right: "4%",
            height: 2,
            borderRadius: 1,
            background: `linear-gradient(90deg, transparent, ${activeColor}, ${activeColor}, transparent)`,
            filter: `blur(2px)`,
          }}
        />
      </div>

      {/* Floating avatar bursts for occupied seats */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        {occupiedSeats.slice(0, 6).map((seat, i) => (
          <motion.div
            key={seat.seatId}
            animate={{ y: [0, -18, 0], opacity: [0.6, 1, 0.6] }}
            transition={{
              repeat: Infinity,
              duration: beatDuration,
              delay: i * (beatDuration / 6),
            }}
            style={{
              position: "absolute",
              left: `${10 + (seat.col / (mesh.cols - 1)) * 80}%`,
              bottom: `${12 + (1 - seat.row / (mesh.rows - 1)) * 28}%`,
              fontSize: 14,
            }}
          >
            {avatarEmoji(seat.occupantFanId ?? seat.seatId)}
          </motion.div>
        ))}
      </div>

      {/* BPM badge */}
      <div
        style={{
          position: "absolute", top: 10, right: 10,
          background: "rgba(5,5,16,0.8)",
          border: `1px solid ${activeColor}55`,
          borderRadius: 20, padding: "3px 10px",
          fontSize: 9, fontWeight: 900, color: activeColor, letterSpacing: "0.1em",
        }}
      >
        {bpm} BPM
      </div>

      {/* Rave mode label */}
      <div
        style={{
          position: "absolute", top: 10, left: 10,
          background: "rgba(5,5,16,0.7)",
          border: "1px solid rgba(255,45,170,0.3)",
          borderRadius: 20, padding: "3px 10px",
          fontSize: 8, fontWeight: 800, color: "#FF2DAA", letterSpacing: "0.12em",
        }}
      >
        🎧 DJ STREAM — 3D
      </div>
    </div>
  );
}
