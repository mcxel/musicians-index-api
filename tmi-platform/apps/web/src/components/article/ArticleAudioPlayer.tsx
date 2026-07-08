"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface Props {
  text: string;          // full article text to narrate
  title?: string;        // article title (spoken as intro)
  accentColor?: string;  // tint color for the player
  onComplete?: () => void; // called at completion threshold
  completionThreshold?: number; // 0–1, default 0.95
}

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];

export default function ArticleAudioPlayer({
  text,
  title,
  accentColor = "#00C8FF",
  onComplete,
  completionThreshold = 0.95,
}: Props) {
  const [supported, setSupported] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(1);   // default 1×
  const [progress, setProgress] = useState(0);   // 0–1
  const [charIndex, setCharIndex] = useState(0);
  const [rewardFired, setRewardFired] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const uttRef = useRef<SpeechSynthesisUtterance | null>(null);
  const totalChars = text.length;

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => {
      if (typeof window !== "undefined") window.speechSynthesis.cancel();
    };
  }, []);

  const buildUtterance = useCallback((startChar = 0): SpeechSynthesisUtterance => {
    const partial = startChar > 0 ? text.slice(startChar) : (title ? `${title}. ${text}` : text);
    const utt = new SpeechSynthesisUtterance(partial);
    utt.rate = SPEEDS[speedIdx];
    utt.lang = "en-US";

    utt.onboundary = (ev: SpeechSynthesisEvent) => {
      if (ev.name === "word") {
        const absoluteChar = startChar + ev.charIndex;
        setCharIndex(absoluteChar);
        const pct = totalChars > 0 ? absoluteChar / totalChars : 0;
        setProgress(pct);
        if (!rewardFired && pct >= completionThreshold) {
          setRewardFired(true);
          onComplete?.();
        }
      }
    };

    utt.onend = () => {
      setPlaying(false);
      setProgress(1);
      if (!rewardFired) {
        setRewardFired(true);
        onComplete?.();
      }
    };

    utt.onerror = () => setPlaying(false);
    return utt;
  }, [text, title, speedIdx, totalChars, rewardFired, completionThreshold, onComplete]);

  function play() {
    if (!supported) return;
    window.speechSynthesis.cancel();
    const utt = buildUtterance(charIndex);
    uttRef.current = utt;
    window.speechSynthesis.speak(utt);
    setPlaying(true);
  }

  function pause() {
    window.speechSynthesis.pause();
    setPlaying(false);
  }

  function resume() {
    window.speechSynthesis.resume();
    setPlaying(true);
  }

  function stop() {
    window.speechSynthesis.cancel();
    setPlaying(false);
    setProgress(0);
    setCharIndex(0);
    setRewardFired(false);
  }

  function skipSpeed() {
    const next = (speedIdx + 1) % SPEEDS.length;
    setSpeedIdx(next);
    if (playing) {
      window.speechSynthesis.cancel();
      const utt = buildUtterance(charIndex);
      utt.rate = SPEEDS[next];
      uttRef.current = utt;
      window.speechSynthesis.speak(utt);
    }
  }

  const pct = Math.round(progress * 100);
  const accent = accentColor;
  const dim = "rgba(255,255,255,0.35)";

  if (!supported) return null;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: expanded ? 0 : 8,
        background: expanded ? "rgba(5,5,20,0.95)" : "transparent",
        border: expanded ? `1px solid ${accent}33` : "none",
        borderRadius: 8,
        overflow: "hidden",
        transition: "all 0.2s ease",
        verticalAlign: "middle",
      }}
    >
      {/* ── Collapsed: just the Listen button ── */}
      {!expanded && (
        <button
          type="button"
          onClick={() => { setExpanded(true); play(); }}
          aria-label="Listen to this article"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: `${accent}18`,
            border: `1px solid ${accent}44`,
            borderRadius: 6,
            color: accent,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            padding: "5px 10px",
            cursor: "pointer",
            textTransform: "uppercase",
          }}
        >
          <svg width="10" height="12" viewBox="0 0 10 12" fill="none" aria-hidden>
            <path d="M1 1l8 5-8 5V1z" fill="currentColor"/>
          </svg>
          Listen
        </button>
      )}

      {/* ── Expanded: full player bar ── */}
      {expanded && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", width: "100%" }}>

          {/* Play / Pause */}
          <button
            type="button"
            onClick={playing ? pause : (progress > 0 ? resume : play)}
            aria-label={playing ? "Pause" : "Play"}
            style={{ background: "none", border: "none", color: accent, cursor: "pointer", fontSize: 16, lineHeight: 1, padding: 0, flexShrink: 0 }}
          >
            {playing
              ? <svg width="14" height="16" viewBox="0 0 14 16" fill="none" aria-hidden>
                  <rect x="1" y="1" width="4" height="14" rx="1" fill="currentColor"/>
                  <rect x="9" y="1" width="4" height="14" rx="1" fill="currentColor"/>
                </svg>
              : <svg width="12" height="14" viewBox="0 0 12 14" fill="none" aria-hidden>
                  <path d="M1 1l10 6-10 6V1z" fill="currentColor"/>
                </svg>
            }
          </button>

          {/* Progress bar */}
          <div
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            style={{ flex: 1, minWidth: 80, height: 4, background: "rgba(255,255,255,0.12)", borderRadius: 2, overflow: "hidden", cursor: "pointer" }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const ratio = (e.clientX - rect.left) / rect.width;
              const newChar = Math.floor(ratio * totalChars);
              setCharIndex(newChar);
              setProgress(ratio);
              if (playing) {
                window.speechSynthesis.cancel();
                const utt = buildUtterance(newChar);
                uttRef.current = utt;
                window.speechSynthesis.speak(utt);
              }
            }}
          >
            <div style={{ height: "100%", width: `${pct}%`, background: accent, transition: "width 0.3s linear" }} />
          </div>

          {/* Percentage */}
          <span style={{ fontSize: 9, color: dim, fontVariantNumeric: "tabular-nums", flexShrink: 0, minWidth: 28, textAlign: "right" }}>
            {pct}%
          </span>

          {/* Speed */}
          <button
            type="button"
            onClick={skipSpeed}
            aria-label="Change playback speed"
            style={{ background: "none", border: `1px solid ${accent}33`, borderRadius: 4, color: accent, cursor: "pointer", fontSize: 9, fontWeight: 700, padding: "2px 6px", flexShrink: 0 }}
          >
            {SPEEDS[speedIdx]}×
          </button>

          {/* Stop / collapse */}
          <button
            type="button"
            onClick={() => { stop(); setExpanded(false); }}
            aria-label="Stop and close player"
            style={{ background: "none", border: "none", color: dim, cursor: "pointer", fontSize: 14, lineHeight: 1, padding: 0, flexShrink: 0 }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
