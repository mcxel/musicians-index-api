"use client";

/**
 * Per-monitor FEED picker — lives ON the bezel (allowed bezel control).
 * Path A: MONITOR → FEED → source → assignSource(frameId).
 * Shares canonicalMediaPlayerRuntime with Power Mix SEND TO (Path B).
 */

import { useEffect, useRef, useState } from "react";
import {
  useCanonicalMediaPlayerRuntime,
  type FrameId,
  type MediaSource,
} from "@/lib/media/canonicalMediaPlayerRuntime";

const ELIGIBLE_SOURCES: { id: Exclude<MediaSource, null>; label: string }[] = [
  { id: "SELF_CAMERA", label: "CAMERA" },
  { id: "PERFORMER_FEED", label: "PERFORMER FEED" },
  { id: "AUDIENCE_VIEW", label: "LIVE ROOM / AUDIENCE" },
  { id: "VENUE_VIEW", label: "VENUE" },
  { id: "SCREEN_SHARE", label: "SCREEN SHARE" },
  { id: "VIDEO_PLAYBACK", label: "MEDIA / PLAYLIST" },
];

export function sourceLabel(source: MediaSource): string {
  if (!source) return "NONE";
  return ELIGIBLE_SOURCES.find((s) => s.id === source)?.label ?? source;
}

export type MonitorBezelFeedPickerProps = {
  frameId: FrameId;
  monitorLabel: string;
  accent: string;
};

export default function MonitorBezelFeedPicker({
  frameId,
  monitorLabel,
  accent,
}: MonitorBezelFeedPickerProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const assignSource = useCanonicalMediaPlayerRuntime((s) => s.assignSource);
  const current = useCanonicalMediaPlayerRuntime((s) => s.frames[frameId]?.source ?? null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointer = (e: MouseEvent | TouchEvent) => {
      const el = rootRef.current;
      if (!el) return;
      const target = e.target as Node | null;
      if (target && !el.contains(target)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onPointer);
    window.addEventListener("touchstart", onPointer, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onPointer);
      window.removeEventListener("touchstart", onPointer);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      data-monitor-bezel-feed-picker={frameId}
      data-testid={`tmi-monitor-feed-${frameId}`}
      style={{ position: "relative", flexShrink: 0 }}
    >
      <button
        type="button"
        data-testid={`tmi-bezel-feed-btn-${frameId}`}
        aria-expanded={open}
        title={`${monitorLabel}: pick feed for this monitor`}
        onClick={() => setOpen((v) => !v)}
        style={{
          padding: "4px 10px",
          fontSize: 9,
          fontWeight: 900,
          letterSpacing: "0.1em",
          borderRadius: 5,
          border: open ? `1px solid ${accent}` : `1px solid ${accent}88`,
          background: open
            ? `linear-gradient(180deg, ${accent}55 0%, ${accent}22 100%)`
            : "linear-gradient(180deg, #3a4254 0%, #1a1f2c 55%, #12161f 100%)",
          color: open ? "#fff" : accent,
          cursor: "pointer",
          fontFamily: "inherit",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.28), inset 0 -1px 0 rgba(0,0,0,0.45), 0 2px 6px rgba(0,0,0,0.45)",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}
      >
        FEED{current ? ` · ${sourceLabel(current).split(" ")[0]}` : ""}
      </button>

      {open ? (
        <div
          role="listbox"
          aria-label={`${monitorLabel} feed sources`}
          data-monitor-feed-selector={frameId}
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            zIndex: 90,
            minWidth: 200,
            maxWidth: "min(280px, calc(100vw - 24px))",
            display: "flex",
            flexDirection: "column",
            gap: 4,
            padding: 8,
            borderRadius: 8,
            background: "linear-gradient(180deg, #2a3140 0%, #0e121a 100%)",
            border: `1px solid ${accent}66`,
            boxShadow: "0 12px 36px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.12)",
          }}
        >
          <div
            style={{
              fontSize: 8,
              fontWeight: 900,
              letterSpacing: "0.12em",
              color: accent,
              marginBottom: 4,
            }}
          >
            {monitorLabel} · SELECT FEED
          </div>
          {ELIGIBLE_SOURCES.map((src) => {
            const active = current === src.id;
            return (
              <button
                key={src.id}
                type="button"
                role="option"
                aria-selected={active}
                data-testid={`tmi-feed-option-${frameId}-${src.id}`}
                onClick={() => {
                  assignSource(frameId, src.id);
                  setOpen(false);
                }}
                style={{
                  textAlign: "left",
                  padding: "7px 10px",
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: "0.06em",
                  borderRadius: 5,
                  border: active ? `1px solid ${accent}` : "1px solid rgba(255,255,255,0.1)",
                  background: active ? `${accent}28` : "rgba(0,0,0,0.35)",
                  color: active ? "#fff" : "rgba(255,255,255,0.82)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  boxShadow: active ? `0 0 10px ${accent}44` : undefined,
                }}
              >
                {active ? "● " : "○ "}
                {src.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export { ELIGIBLE_SOURCES };
