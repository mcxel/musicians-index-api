"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { StreamWinSong } from "@/lib/economy/StreamAndWinEngine";

interface LiveRankingMomentProps {
  songs: StreamWinSong[];
  visible: boolean;
  onDone: () => void;
}

const RANK_COLORS = ["#FFD700", "#00C8FF", "#FF2DAA"];
const RANK_MEDALS = ["🥇", "🥈", "🥉"];

export default function LiveRankingMoment({ songs, visible, onDone }: LiveRankingMomentProps) {
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(onDone, 5000);
    return () => clearTimeout(t);
  }, [visible, onDone]);

  const top3 = songs.slice(0, 3);

  return (
    <AnimatePresence>
      {visible && top3.length > 0 && (
        <motion.div
          key="ranking-moment"
          initial={{ opacity: 0, x: "100%" }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: "100%" }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          style={{
            position: "fixed",
            top: "50%",
            right: 0,
            transform: "translateY(-50%)",
            zIndex: 8500,
            background: "rgba(5,5,16,0.97)",
            borderLeft: "1px solid rgba(255,215,0,0.3)",
            borderTop: "1px solid rgba(255,215,0,0.15)",
            borderBottom: "1px solid rgba(255,215,0,0.15)",
            backdropFilter: "blur(14px)",
            padding: "20px 24px",
            minWidth: 240,
            boxShadow: "-8px 0 40px rgba(255,215,0,0.1), -2px 0 60px rgba(0,0,0,0.6)",
            fontFamily: "'Inter',sans-serif",
          }}
        >
          {/* Header */}
          <div style={{
            fontSize: 8, fontWeight: 900, letterSpacing: "0.35em",
            color: "#FFD700", marginBottom: 14, display: "flex", alignItems: "center", gap: 6,
          }}>
            🏆 TOP SONGS RIGHT NOW
          </div>

          {/* Rankings */}
          {top3.map((song, i) => (
            <div key={song.id} style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: i < top3.length - 1 ? 10 : 0,
              padding: "8px 10px",
              background: i === 0 ? "rgba(255,215,0,0.06)" : "rgba(255,255,255,0.02)",
              border: `1px solid ${i === 0 ? "rgba(255,215,0,0.2)" : "rgba(255,255,255,0.05)"}`,
            }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{RANK_MEDALS[i]}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 12, fontWeight: 800,
                  color: RANK_COLORS[i],
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {song.title}
                </div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>
                  {song.genre}
                </div>
              </div>
              <div style={{
                fontFamily: "'Bebas Neue','Impact',sans-serif",
                fontSize: 16,
                color: RANK_COLORS[i],
                flexShrink: 0,
              }}>
                +{Math.round(song.visibilityScore)}
              </div>
            </div>
          ))}

          <div style={{
            fontSize: 8, color: "rgba(255,255,255,0.2)",
            letterSpacing: "0.12em", marginTop: 10, textAlign: "center",
          }}>
            UPDATES EVERY 5 SONGS
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
