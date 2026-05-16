"use client";
import { motion } from "framer-motion";
import { useState } from "react";

const SETLIST: Array<{ order: number; title: string; duration: string; bpm: number; key: string; status: "PLAYED" | "NEXT" | "QUEUED" }> = [
  { order: 1, title: "Crown Entrance",       duration: "3:42", bpm: 142, key: "Am",  status: "PLAYED" },
  { order: 2, title: "Neon Frequencies",     duration: "4:10", bpm: 128, key: "Dm",  status: "PLAYED" },
  { order: 3, title: "Underground Signal",   duration: "3:55", bpm: 135, key: "Gm",  status: "NEXT"   },
  { order: 4, title: "Pulse Check",          duration: "4:22", bpm: 140, key: "Em",  status: "QUEUED" },
  { order: 5, title: "Crowd Theory",         duration: "3:38", bpm: 130, key: "Bm",  status: "QUEUED" },
  { order: 6, title: "TMI Anthem (Finale)",  duration: "5:01", bpm: 120, key: "Cm",  status: "QUEUED" },
];

const STATUS_COLOR: Record<string, string> = {
  PLAYED: "#444",
  NEXT:   "#00FFFF",
  QUEUED: "#FF2DAA",
};

export default function ArtistSetlistRail() {
  const [expanded, setExpanded] = useState(false);

  const visible = expanded ? SETLIST : SETLIST.slice(0, 4);
  const nextIdx = SETLIST.findIndex(s => s.status === "NEXT");

  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(255,45,170,0.04) 0%, rgba(0,0,0,0) 100%)",
        border: "1px solid rgba(255,45,170,0.12)",
        borderLeft: "3px solid #FF2DAA",
        borderRadius: 10,
        padding: "20px 24px",
        marginBottom: 20,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase", color: "#FF2DAA" }}>
          ♫ SETLIST
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em" }}>
            {SETLIST.filter(s => s.status === "PLAYED").length}/{SETLIST.length} PLAYED
          </div>
          {/* Progress bar */}
          <div style={{ width: 60, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${(SETLIST.filter(s => s.status === "PLAYED").length / SETLIST.length) * 100}%`,
              background: "#FF2DAA",
              borderRadius: 2,
            }} />
          </div>
        </div>
      </div>

      {/* Track list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {visible.map((track, i) => {
          const isNext = track.status === "NEXT";
          const isPlayed = track.status === "PLAYED";
          return (
            <motion.div
              key={track.title}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: isNext ? "12px 14px" : "8px 14px",
                borderRadius: 8,
                background: isNext
                  ? "rgba(0,255,255,0.06)"
                  : isPlayed
                  ? "rgba(255,255,255,0.015)"
                  : "rgba(255,255,255,0.025)",
                border: isNext ? "1px solid rgba(0,255,255,0.25)" : "1px solid transparent",
                transition: "all 0.2s",
              }}
            >
              {/* Order */}
              <div style={{
                width: 20, textAlign: "center", flexShrink: 0,
                fontSize: 9, fontWeight: 800,
                color: isNext ? "#00FFFF" : isPlayed ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.4)",
              }}>
                {isNext ? "▶" : track.order}
              </div>

              {/* Title */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 12, fontWeight: isNext ? 700 : 600,
                  color: isPlayed ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.85)",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>
                  {track.title}
                </div>
                {isNext && (
                  <div style={{ fontSize: 9, color: "rgba(0,255,255,0.6)", marginTop: 2 }}>
                    {track.bpm} BPM · Key of {track.key}
                  </div>
                )}
              </div>

              {/* Duration */}
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", flexShrink: 0 }}>{track.duration}</div>

              {/* Status badge */}
              <div style={{
                fontSize: 7, fontWeight: 900, letterSpacing: "0.15em",
                color: STATUS_COLOR[track.status],
                border: `1px solid ${STATUS_COLOR[track.status]}40`,
                borderRadius: 3, padding: "1px 6px", flexShrink: 0,
                opacity: isPlayed ? 0.5 : 1,
              }}>
                {track.status}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Expand toggle */}
      {SETLIST.length > 4 && (
        <button
          onClick={() => setExpanded(e => !e)}
          style={{
            marginTop: 12, width: "100%", background: "none",
            border: "1px solid rgba(255,45,170,0.2)", borderRadius: 6,
            color: "rgba(255,45,170,0.6)", fontSize: 9, fontWeight: 800,
            letterSpacing: "0.15em", padding: "6px 0", cursor: "pointer",
            textTransform: "uppercase",
          }}
        >
          {expanded ? "COLLAPSE" : `SHOW ALL ${SETLIST.length} TRACKS`}
        </button>
      )}
    </div>
  );
}
