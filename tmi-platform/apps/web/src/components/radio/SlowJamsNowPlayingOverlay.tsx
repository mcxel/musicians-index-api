"use client";

/**
 * Polls Slow Jams rotation — overlay artist + title only (Rule 20).
 * Chill lounge copy — not WDP hype.
 */

import { useEffect, useState } from "react";
import { SLOW_JAM_MOTION } from "@/lib/live/ExperiencePersonality";

type NowPlayingPayload = {
  overlayArtist: string;
  overlayTitle: string;
  creditLine: string | null;
  djLine: string | null;
  phase: string;
  entryId: string | null;
  active: boolean;
  fadeActive?: boolean;
};

export default function SlowJamsNowPlayingOverlay() {
  const [np, setNp] = useState<NowPlayingPayload | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/slow-jams/now-playing", { cache: "no-store" });
        const data = (await res.json()) as { nowPlaying?: NowPlayingPayload };
        if (!cancelled && data.nowPlaying) setNp(data.nowPlaying);
      } catch {
        if (!cancelled) setNp(null);
      }
    };
    void load();
    const t = setInterval(load, 8000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  if (!np) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 72,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 90,
        pointerEvents: "auto",
        minWidth: 280,
        maxWidth: "92vw",
        padding: "12px 18px",
        borderRadius: 14,
        border: `1px solid ${SLOW_JAM_MOTION.accentPurple}`,
        background: "rgba(5,5,16,0.88)",
        backdropFilter: "blur(10px)",
        boxShadow: `0 0 28px ${SLOW_JAM_MOTION.accentPurple}`,
        textAlign: "center",
        transition: `opacity ${SLOW_JAM_MOTION.transitionMs}ms ease`,
        opacity: np.fadeActive ? 0.75 : 1,
      }}
    >
      <div
        style={{
          fontSize: 9,
          fontWeight: 800,
          letterSpacing: "0.22em",
          color: SLOW_JAM_MOTION.accentGold,
          marginBottom: 4,
        }}
      >
        {np.phase === "LIVE" ? SLOW_JAM_MOTION.copyLive : `🌙 ${np.phase}`}
      </div>
      {np.active && np.overlayTitle ? (
        <>
          <div style={{ fontSize: 14, fontWeight: 900, color: "#fff" }}>{np.overlayTitle}</div>
          <div style={{ fontSize: 11, color: "#AA2DFF", fontWeight: 700 }}>{np.overlayArtist}</div>
          {np.creditLine && (
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>{np.creditLine}</div>
          )}
        </>
      ) : (
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>
          {np.overlayTitle || "No slow tracks in Sunday pool yet — submit Sat–Sun"}
        </div>
      )}
      {np.djLine && (
        <div style={{ fontSize: 9, color: "rgba(0,255,255,0.55)", marginTop: 6, lineHeight: 1.4 }}>{np.djLine}</div>
      )}
    </div>
  );
}
