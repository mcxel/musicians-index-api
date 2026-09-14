"use client";

/**
 * CompactAudioMixer — canonical VOICE/SHARE/PROGRAM listener buses.
 * Presentation: on-demand MIX launcher → floating panel (not permanent primary chrome).
 * Audio state lives in CanonicalAudioMixerStore — open/close must not reset buses.
 */

import React, { useEffect, useRef, useState } from "react";
import { useCanonicalAudioMixerStore, type AudioBusId } from "@/lib/audio/CanonicalAudioBusDirector";

const BUS_LIST: { id: AudioBusId; label: string; accent: string }[] = [
  { id: "VOICE", label: "VOICE", accent: "#00FF88" },
  { id: "SHARE", label: "SHARE", accent: "#AA2DFF" },
  { id: "PROGRAM", label: "PROGRAM", accent: "#00FFFF" },
];

export default function CompactAudioMixer() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const buses = useCanonicalAudioMixerStore((s) => s.buses);
  const setBusVolume = useCanonicalAudioMixerStore((s) => s.setBusVolume);
  const toggleBusMute = useCanonicalAudioMixerStore((s) => s.toggleBusMute);

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
      data-testid="tmi-compact-audio-mixer"
      data-mixer-open={open ? "1" : "0"}
      style={{ position: "relative", display: "inline-flex", flexShrink: 0 }}
    >
      <button
        type="button"
        data-testid="tmi-mix-launcher"
        aria-expanded={open}
        aria-controls="tmi-listener-bus-panel"
        title="Open independent listener bus mixer"
        onClick={() => setOpen((v) => !v)}
        style={{
          fontSize: 9,
          fontWeight: 900,
          letterSpacing: "0.08em",
          padding: "6px 10px",
          borderRadius: 6,
          border: open ? "1px solid #00FFFF" : "1px solid rgba(0,255,255,0.35)",
          background: open ? "rgba(0,255,255,0.18)" : "rgba(5,5,16,0.92)",
          color: "#00FFFF",
          cursor: "pointer",
          fontFamily: "inherit",
          whiteSpace: "nowrap",
        }}
      >
        🎚️ MIX
      </button>

      {open ? (
        <div
          id="tmi-listener-bus-panel"
          role="dialog"
          aria-label="Independent listener buses"
          data-listener-bus-panel="1"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            zIndex: 80,
            width: "min(320px, calc(100vw - 24px))",
            display: "flex",
            flexDirection: "column",
            gap: 8,
            padding: "10px 12px",
            borderRadius: 10,
            background: "rgba(4,6,14,0.98)",
            border: "1px solid rgba(0,255,255,0.35)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.55)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.14em", color: "#00FFFF" }}>
                🎚️ MIX · LISTENER BUSES
              </div>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                VOICE · SHARE · PROGRAM — same session audio path
              </div>
            </div>
            <button
              type="button"
              data-testid="tmi-mix-close"
              onClick={() => setOpen(false)}
              aria-label="Close mixer"
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: "rgba(255,255,255,0.65)",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 6,
                cursor: "pointer",
                padding: "4px 8px",
                fontFamily: "inherit",
              }}
            >
              ✕
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {BUS_LIST.map((bus) => {
              const state = buses[bus.id];
              return (
                <div
                  key={bus.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 8px",
                    borderRadius: 6,
                    background: "rgba(255,255,255,0.03)",
                    border: `1px solid ${state.muted ? "rgba(255,68,68,0.4)" : "rgba(255,255,255,0.08)"}`,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => toggleBusMute(bus.id)}
                    title={`Mute/Unmute ${bus.label}`}
                    style={{
                      background: state.muted ? "rgba(255,68,68,0.2)" : "transparent",
                      border: state.muted ? "1px solid #FF4444" : "1px solid rgba(255,255,255,0.2)",
                      color: state.muted ? "#FF6B6B" : bus.accent,
                      fontSize: 8,
                      fontWeight: 900,
                      padding: "2px 6px",
                      borderRadius: 4,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      fontFamily: "inherit",
                    }}
                  >
                    {state.muted ? "🔇 MUTE" : `🔊 ${bus.label}`}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={state.muted ? 0 : state.volume}
                    onChange={(e) => setBusVolume(bus.id, Number(e.target.value))}
                    aria-label={`${bus.label} volume`}
                    style={{
                      flex: 1,
                      minWidth: 50,
                      height: 4,
                      accentColor: bus.accent,
                      cursor: "pointer",
                    }}
                  />
                  <span style={{ fontSize: 8, color: "rgba(255,255,255,0.6)", minWidth: 28, textAlign: "right" }}>
                    {state.muted ? "0%" : `${Math.round(state.volume * 100)}%`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
