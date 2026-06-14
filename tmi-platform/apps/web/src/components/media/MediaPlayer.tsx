"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

export interface MediaTrack {
  id: string;
  title: string;
  artist: string;
  src?: string;
  cover?: string;
  duration?: number;
  price?: string;
  type?: "SINGLE" | "EP" | "ALBUM" | "MIXTAPE" | "BEAT" | "INSTRUMENTAL";
}

interface MediaPlayerProps {
  tracks: MediaTrack[];
  accentColor?: string;
  showPurchase?: boolean;
  onTrackChange?: (track: MediaTrack) => void;
  onPurchase?: (track: MediaTrack) => void;
  autoPlay?: boolean;
  compact?: boolean;
  startIndex?: number;
}

function fmt(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function MediaPlayer({
  tracks,
  accentColor = "#00FFFF",
  showPurchase = false,
  onTrackChange,
  onPurchase,
  autoPlay = false,
  compact = false,
  startIndex = 0,
}: MediaPlayerProps) {
  const [currentIdx, setCurrentIdx] = useState(startIndex);
  const [playing, setPlaying]       = useState(false);
  const [progress, setProgress]     = useState(0);
  const [elapsed, setElapsed]       = useState(0);
  const [volume, setVolume]         = useState(0.8);
  const [muted, setMuted]           = useState(false);
  const [shuffle, setShuffle]       = useState(false);
  const [repeat, setRepeat]         = useState(false);
  const [scrubbing, setScrubbing]   = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const barRef   = useRef<HTMLDivElement | null>(null);
  const tickRef  = useRef<number | null>(null);

  const track = tracks[currentIdx];

  // Simulated tick — only for tracks without a real src
  const startTick = useCallback(() => {
    if (track?.src) return;
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = window.setInterval(() => {
      setElapsed(e => {
        const dur = track?.duration ?? 180;
        if (e >= dur) { goNext(); return 0; }
        const next = e + 1;
        if (!scrubbing) setProgress(next / dur);
        return next;
      });
    }, 1000);
  }, [track, repeat, scrubbing]); // eslint-disable-line react-hooks/exhaustive-deps

  const stopTick = useCallback(() => {
    if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
  }, []);

  useEffect(() => {
    if (playing) startTick();
    else stopTick();
    return stopTick;
  }, [playing, startTick, stopTick]);

  // Reset on track change
  useEffect(() => {
    setElapsed(0);
    setProgress(0);
    if (track) onTrackChange?.(track);
  }, [currentIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (autoPlay) setPlaying(true); }, [autoPlay]);

  // Real audio: load src when track changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!track?.src) { audio.pause(); audio.src = ""; return; }
    audio.src = track.src;
    audio.volume = muted ? 0 : volume;
    if (playing) audio.play().catch(() => {});
  }, [currentIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  // Real audio: sync play/pause state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track?.src) return;
    if (playing) audio.play().catch(() => {});
    else audio.pause();
  }, [playing]); // eslint-disable-line react-hooks/exhaustive-deps

  // Real audio: sync volume/mute
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = muted ? 0 : volume;
  }, [volume, muted]);

  function goNext() {
    setCurrentIdx(i => shuffle
      ? Math.floor(Math.random() * tracks.length)
      : (i + 1) % tracks.length
    );
  }
  function goPrev() {
    if (elapsed > 3) { setElapsed(0); setProgress(0); if (audioRef.current) audioRef.current.currentTime = 0; return; }
    setCurrentIdx(i => (i - 1 + tracks.length) % tracks.length);
  }
  function playTrack(idx: number) { setCurrentIdx(idx); setPlaying(true); }

  function handleBarClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!barRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const dur = (track?.src && audioRef.current && !isNaN(audioRef.current.duration))
      ? audioRef.current.duration : (track?.duration ?? 180);
    setProgress(ratio);
    setElapsed(Math.floor(ratio * dur));
    if (audioRef.current && track?.src) audioRef.current.currentTime = ratio * dur;
  }

  function handleAudioTimeUpdate() {
    const audio = audioRef.current;
    if (!audio || scrubbing || !track?.src) return;
    const dur = isNaN(audio.duration) ? (track.duration ?? 180) : audio.duration;
    if (dur > 0) { setElapsed(Math.floor(audio.currentTime)); setProgress(audio.currentTime / dur); }
  }

  function handleAudioEnded() {
    if (repeat && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    } else {
      goNext();
    }
  }

  if (!track) return null;

  const dur = track.duration ?? 180;
  const accent = accentColor;

  return (
    <>
      <audio
        ref={audioRef}
        onTimeUpdate={handleAudioTimeUpdate}
        onEnded={handleAudioEnded}
        style={{ display: "none" }}
      />

      {compact ? (
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "8px 14px",
          background: "rgba(0,0,0,0.6)",
          border: `1px solid ${accent}22`,
          borderRadius: 8,
          backdropFilter: "blur(8px)",
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 6,
            background: `${accent}18`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, flexShrink: 0,
            border: `1px solid ${accent}33`,
          }}>
            {track.cover ?? "🎵"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {track.title}
            </div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {track.artist}
            </div>
          </div>
          <button onClick={goPrev} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 14, padding: "2px 4px" }}>⏮</button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setPlaying(p => !p)}
            style={{
              width: 28, height: 28, borderRadius: "50%",
              background: accent, border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, color: "#050510", fontWeight: 900,
            }}
          >
            {playing ? "⏸" : "▶"}
          </motion.button>
          <button onClick={goNext} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 14, padding: "2px 4px" }}>⏭</button>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", minWidth: 28, textAlign: "right" }}>
            {fmt(elapsed)}
          </div>
        </div>
      ) : (
        <div style={{
          background: "rgba(5,5,16,0.95)",
          border: `1px solid ${accent}22`,
          borderRadius: 16,
          overflow: "hidden",
          backdropFilter: "blur(12px)",
        }}>
          <div style={{
            padding: "20px 20px 16px",
            background: `linear-gradient(180deg, ${accent}10 0%, transparent 100%)`,
            borderBottom: `1px solid ${accent}11`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <motion.div
                animate={{ rotate: playing ? 360 : 0 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                style={{
                  width: 56, height: 56, borderRadius: "50%",
                  background: `${accent}22`,
                  border: `2px solid ${accent}44`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 26, flexShrink: 0,
                }}
              >
                {track.cover ?? "🎵"}
              </motion.div>

              <div style={{ flex: 1, minWidth: 0 }}>
                {track.type && (
                  <div style={{ fontSize: 8, letterSpacing: 2, color: accent, fontWeight: 800, marginBottom: 2 }}>
                    {track.type}
                  </div>
                )}
                <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {track.title}
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {track.artist}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button
                  onClick={() => setMuted(m => !m)}
                  style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 14 }}
                >
                  {muted ? "🔇" : "🔊"}
                </button>
                <input
                  type="range" min={0} max={1} step={0.05}
                  value={muted ? 0 : volume}
                  onChange={e => { setVolume(Number(e.target.value)); setMuted(false); }}
                  style={{ width: 60, accentColor: accent, cursor: "pointer" }}
                />
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <div
                ref={barRef}
                onClick={handleBarClick}
                style={{
                  height: 4, borderRadius: 2,
                  background: "rgba(255,255,255,0.1)",
                  cursor: "pointer", position: "relative", marginBottom: 6,
                }}
              >
                <div style={{
                  position: "absolute", left: 0, top: 0, bottom: 0,
                  width: `${progress * 100}%`,
                  background: `linear-gradient(90deg, ${accent}, ${accent}aa)`,
                  borderRadius: 2,
                  transition: scrubbing ? "none" : "width 0.5s linear",
                }} />
                <div style={{
                  position: "absolute", top: "50%", transform: "translateY(-50%)",
                  left: `${progress * 100}%`, marginLeft: -5,
                  width: 10, height: 10, borderRadius: "50%",
                  background: accent, border: "2px solid #fff",
                  boxShadow: `0 0 6px ${accent}`,
                }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "rgba(255,255,255,0.35)" }}>
                <span>{fmt(elapsed)}</span>
                <span>{fmt(dur)}</span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginTop: 14 }}>
              <button onClick={() => setShuffle(s => !s)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: shuffle ? accent : "rgba(255,255,255,0.3)" }}>🔀</button>
              <button onClick={goPrev} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "rgba(255,255,255,0.7)" }}>⏮</button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setPlaying(p => !p)}
                style={{
                  width: 48, height: 48, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${accent}, ${accent}bb)`,
                  border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, color: "#050510", fontWeight: 900,
                  boxShadow: `0 0 16px ${accent}55`,
                }}
              >
                {playing ? "⏸" : "▶"}
              </motion.button>
              <button onClick={goNext} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "rgba(255,255,255,0.7)" }}>⏭</button>
              <button onClick={() => setRepeat(r => !r)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: repeat ? accent : "rgba(255,255,255,0.3)" }}>🔁</button>
            </div>
          </div>

          {tracks.length > 1 && (
            <div style={{ maxHeight: 220, overflowY: "auto" }}>
              {tracks.map((t, i) => (
                <motion.div
                  key={t.id}
                  whileHover={{ background: `${accent}0a` }}
                  onClick={() => playTrack(i)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 16px", cursor: "pointer",
                    background: i === currentIdx ? `${accent}0f` : "transparent",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                    background: i === currentIdx ? `${accent}22` : "rgba(255,255,255,0.04)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14,
                    border: i === currentIdx ? `1px solid ${accent}44` : "1px solid transparent",
                  }}>
                    {i === currentIdx && playing ? (
                      <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>▶</motion.span>
                    ) : (t.cover ?? "🎵")}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: i === currentIdx ? 700 : 500, color: i === currentIdx ? "#fff" : "rgba(255,255,255,0.6)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {t.title}
                    </div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {t.artist}
                    </div>
                  </div>
                  {showPurchase && t.price && (
                    <button
                      onClick={e => { e.stopPropagation(); onPurchase?.(t); }}
                      style={{ padding: "3px 10px", borderRadius: 12, flexShrink: 0, background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.3)", color: "#FFD700", fontSize: 9, fontWeight: 700, cursor: "pointer" }}
                    >
                      {t.price}
                    </button>
                  )}
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", flexShrink: 0 }}>
                    {t.duration ? fmt(t.duration) : "--:--"}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
