"use client";

/**
 * Polls canonical WDP rotation — overlay shows real artist + title only (Rule 20).
 */

import { useEffect, useState } from "react";

type NowPlayingPayload = {
  overlayArtist: string;
  overlayTitle: string;
  creditLine: string | null;
  djLine: string | null;
  phase: string;
  entryId: string | null;
  active: boolean;
};

export default function WorldDancePartyNowPlayingOverlay() {
  const [np, setNp] = useState<NowPlayingPayload | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/world-dance-party/now-playing", { cache: "no-store" });
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
        padding: "10px 16px",
        borderRadius: 12,
        border: "1px solid rgba(255,45,170,0.45)",
        background: "rgba(5,5,16,0.92)",
        backdropFilter: "blur(8px)",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: "#00FF88", marginBottom: 4 }}>
        {np.phase === "LIVE" ? "🌍 NOW PLAYING · DJ RECORD RALPH" : `🌍 ${np.phase}`}
      </div>
      {np.active && np.overlayTitle ? (
        <>
          <div style={{ fontSize: 14, fontWeight: 900, color: "#fff" }}>{np.overlayTitle}</div>
          <div style={{ fontSize: 11, color: "#FF2DAA", fontWeight: 700 }}>{np.overlayArtist}</div>
          {np.creditLine && (
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>{np.creditLine}</div>
          )}
        </>
      ) : (
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>
          {np.overlayTitle || "No tracks in Friday pool yet — submit Mon–Fri"}
        </div>
      )}
      {np.djLine && (
        <div style={{ fontSize: 9, color: "rgba(0,255,255,0.7)", marginTop: 6, lineHeight: 1.4 }}>{np.djLine}</div>
      )}
    </div>
  );
}
