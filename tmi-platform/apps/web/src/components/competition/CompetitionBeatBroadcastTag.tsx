"use client";

/**
 * CompetitionBeatBroadcastTag — short music-video lower-third.
 * Shows beat name + producer/broadcast tag. Never shows price.
 * Battle / gauntlet / cypher only (not song-challenge work-vs-work).
 */

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { AttachedBeatRef } from "@/lib/competition/CompetitionBeatRoomEngine";

type Props = {
  attached: AttachedBeatRef | null;
  style: string;
  /** Fire when performers announced / beat about to drop */
  show?: boolean;
  durationMs?: number;
  roomId?: string;
  lane?: string;
  listPriceCents?: number;
};

export default function CompetitionBeatBroadcastTag({
  attached,
  style,
  show = true,
  durationMs = 4500,
  roomId,
  lane,
  listPriceCents,
}: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!show || style !== "attached" || !attached) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const t = window.setTimeout(() => setVisible(false), durationMs);
    return () => window.clearTimeout(t);
  }, [show, style, attached?.beatId, attached?.title, durationMs]);

  // Mark featured for post-play purchase interest (marketplace path — no price on overlay)
  useEffect(() => {
    if (!attached || style !== "attached") return;
    void fetch("/api/beats/interest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        action: "feature",
        beatId: attached.beatId,
        beatTitle: attached.title,
        broadcastTag: attached.producerName ?? "Producer",
        listPriceCents: listPriceCents ?? 0,
        roomId,
        lane,
      }),
    }).catch(() => {});
  }, [attached?.beatId, style, roomId, lane, listPriceCents]);

  const tag = attached?.producerName?.trim() || "Producer";
  const title = attached?.title?.trim() || "Untitled Beat";

  return (
    <AnimatePresence>
      {visible && attached ? (
        <motion.div
          key={attached.beatId}
          initial={{ opacity: 0, y: 28, x: -12 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          data-beat-broadcast-tag
          aria-live="polite"
          style={{
            position: "fixed",
            left: 28,
            bottom: "18%",
            zIndex: 55,
            pointerEvents: "none",
            maxWidth: 360,
          }}
        >
          <div
            style={{
              padding: "12px 18px 12px 14px",
              borderRadius: 4,
              background:
                "linear-gradient(105deg, rgba(5,5,16,0.92) 0%, rgba(10,6,28,0.78) 70%, transparent 100%)",
              borderLeft: "3px solid #FFD700",
              boxShadow: "0 0 24px rgba(255,45,170,0.18)",
              backdropFilter: "blur(10px)",
            }}
          >
            <div
              style={{
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: "0.22em",
                color: "#00FFFF",
                marginBottom: 4,
              }}
            >
              BEAT
            </div>
            <div
              style={{
                fontFamily: '"Bebas Neue","Impact",sans-serif',
                fontSize: 22,
                letterSpacing: "0.04em",
                color: "#fff",
                lineHeight: 1.05,
                textShadow: "0 0 12px rgba(255,45,170,0.35)",
              }}
            >
              {title}
            </div>
            <div
              style={{
                marginTop: 4,
                fontSize: 12,
                fontWeight: 700,
                color: "rgba(255,215,0,0.9)",
                letterSpacing: "0.06em",
              }}
            >
              {tag}
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
