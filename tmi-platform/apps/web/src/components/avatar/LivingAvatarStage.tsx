"use client";

/**
 * Living Avatar Stage — presentation behind the existing AvatarViewer.
 * Membership accent colors the floor ring and ambient symbols only.
 * It is never applied to skin, hair, eyes, clothing, or GLB materials.
 */

import { useEffect, useId, useState, type CSSProperties, type ReactNode } from "react";

export type AvatarStageMood = "MUSIC" | "THEATER" | "CONCERT" | "STUDIO" | "MINIMAL";
export type AvatarStageIntensity = "LOW" | "MED" | "HIGH";

type StagePref = {
  mood: AvatarStageMood;
  motion: boolean;
  intensity: AvatarStageIntensity;
};

const STORAGE_KEY = "tmi_avatar_stage_pref";
const MOODS: AvatarStageMood[] = ["MUSIC", "THEATER", "CONCERT", "STUDIO", "MINIMAL"];

const SYMBOLS: Record<AvatarStageMood, string[]> = {
  MUSIC: ["♪", "♫", "♩", "♬"],
  THEATER: ["🎭", "☺", "☹", "✶"],
  CONCERT: ["🎤", "✦", "♫", "▲"],
  STUDIO: ["▮", "▯", "▮", "∿"],
  MINIMAL: [],
};

function readPref(): StagePref {
  const fallback: StagePref = { mood: "CONCERT", motion: true, intensity: "LOW" };
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<StagePref>;
    return {
      mood: MOODS.includes(parsed.mood as AvatarStageMood) ? (parsed.mood as AvatarStageMood) : fallback.mood,
      motion: parsed.motion !== false,
      intensity: parsed.intensity === "MED" || parsed.intensity === "HIGH" ? parsed.intensity : "LOW",
    };
  } catch {
    return fallback;
  }
}

function writePref(pref: StagePref) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(pref));
  } catch {
    /* device storage can be unavailable; the stage still renders */
  }
}

export default function LivingAvatarStage({
  accent = "#00E5FF",
  children,
  compact = false,
}: {
  accent?: string;
  children: ReactNode;
  compact?: boolean;
}) {
  const reactId = useId();
  const [pref, setPref] = useState<StagePref>({ mood: "CONCERT", motion: true, intensity: "LOW" });
  const [reduced, setReduced] = useState(false);
  const [paused, setPaused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [offscreen, setOffscreen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setPref(readPref());
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncReduced = () => setReduced(media.matches);
    syncReduced();
    media.addEventListener("change", syncReduced);
    const onVis = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      media.removeEventListener("change", syncReduced);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  useEffect(() => {
    const node = document.getElementById(`tmi-living-stage-${reactId}`);
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setOffscreen(!entry?.isIntersecting),
      { threshold: 0.05 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [reactId]);

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 400);
    return () => window.clearTimeout(timer);
  }, []);

  function update(next: Partial<StagePref>) {
    setPref((current) => {
      const merged = { ...current, ...next };
      writePref(merged);
      return merged;
    });
  }

  const motionOn = pref.motion && !reduced && !paused && !hidden && !offscreen && ready;
  const symbols = compact ? SYMBOLS[pref.mood].slice(0, 2) : SYMBOLS[pref.mood];
  const opacity = pref.intensity === "HIGH" ? 0.72 : pref.intensity === "MED" ? 0.48 : 0.28;

  return (
    <div
      id={`tmi-living-stage-${reactId}`}
      data-testid="living-avatar-stage"
      data-stage-mood={pref.mood}
      data-stage-motion={motionOn ? "1" : "0"}
      data-stage-paused={paused ? "1" : "0"}
      data-stage-reduced={reduced ? "1" : "0"}
      data-stage-offscreen={offscreen ? "1" : "0"}
      data-stage-accent={accent}
      data-stage-material-isolation="environment-only"
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: 180,
        overflow: "hidden",
        borderRadius: 12,
        background:
          pref.mood === "MINIMAL"
            ? "radial-gradient(ellipse at 50% 78%, rgba(20,16,32,0.95) 0%, #050510 72%)"
            : "radial-gradient(ellipse at 50% 82%, rgba(18,12,28,0.98) 0%, #050510 70%)",
      }}
    >
      <style>{`
        @keyframes tmiStageFloat {
          0% { transform: translateY(8px); }
          50% { transform: translateY(-14px); }
          100% { transform: translateY(8px); }
        }
        @media (max-width: 700px) {
          .tmi-stage-symbol:nth-child(n+3) { display: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .tmi-stage-symbol { animation: none !important; }
        }
      `}</style>
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: "18%",
          right: "18%",
          bottom: compact ? 36 : 46,
          height: 18,
          borderRadius: "50%",
          border: `2px solid ${accent}`,
          boxShadow: `0 0 18px ${accent}88, inset 0 0 12px ${accent}55`,
          opacity: 0.85,
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: "30%",
          right: "30%",
          top: 0,
          height: "70%",
          background: `linear-gradient(to bottom, ${accent}22, transparent)`,
          pointerEvents: "none",
        }}
      />
      {symbols.map((glyph, index) => (
        <span
          key={`${pref.mood}-${glyph}-${index}`}
          className="tmi-stage-symbol"
          aria-hidden
          style={{
            position: "absolute",
            left: `${12 + index * 18}%`,
            bottom: 52 + (index % 2) * 28,
            color: accent,
            opacity,
            fontSize: compact ? 14 : 18,
            pointerEvents: "none",
            animation: motionOn ? `tmiStageFloat ${5.5 + index}s ease-in-out ${index * 0.4}s infinite` : "none",
            zIndex: 0,
          }}
        >
          {glyph}
        </span>
      ))}
      <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>{children}</div>
      <div
        style={{
          position: "absolute",
          left: 6,
          right: 6,
          bottom: 6,
          zIndex: 4,
          display: "flex",
          gap: 4,
          flexWrap: "nowrap",
          overflowX: "auto",
          alignItems: "center",
        }}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        {MOODS.map((mood) => (
          <StageChip
            key={mood}
            active={pref.mood === mood}
            accent={accent}
            testId={`stage-mood-${mood.toLowerCase()}`}
            onClick={() => update({ mood })}
          >
            {mood}
          </StageChip>
        ))}
        <StageChip
          active={pref.motion}
          accent={accent}
          testId="stage-ambient-motion"
          onClick={() => update({ motion: !pref.motion })}
        >
          {pref.motion ? "MOTION ON" : "MOTION OFF"}
        </StageChip>
        {!compact ? (
          <StageChip
            active={false}
            accent={accent}
            testId="stage-intensity"
            onClick={() =>
              update({
                intensity: pref.intensity === "LOW" ? "MED" : pref.intensity === "MED" ? "HIGH" : "LOW",
              })
            }
          >
            {pref.intensity}
          </StageChip>
        ) : null}
        <StageChip
          active={paused}
          accent={accent}
          testId="stage-pause"
          onClick={() => setPaused((on) => !on)}
        >
          {paused ? "RESUME" : "PAUSE"}
        </StageChip>
      </div>
    </div>
  );
}

function StageChip({
  children,
  active,
  accent,
  onClick,
  testId,
}: {
  children: ReactNode;
  active: boolean;
  accent: string;
  onClick: () => void;
  testId: string;
}) {
  const style: CSSProperties = {
    minHeight: 28,
    padding: "4px 7px",
    borderRadius: 7,
    border: `1px solid ${active ? accent : "rgba(255,255,255,0.2)"}`,
    background: "rgba(5,5,16,0.78)",
    color: active ? accent : "#d7d7e8",
    fontSize: 8,
    fontWeight: 800,
    letterSpacing: "0.06em",
  };
  return (
    <button type="button" data-testid={testId} onClick={onClick} style={style}>
      {children}
    </button>
  );
}
