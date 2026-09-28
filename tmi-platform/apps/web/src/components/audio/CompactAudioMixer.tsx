"use client";

/**
 * CompactAudioMixer / POWER MIX — listener buses + feed→monitor SEND TO.
 * MIX expands Power Mix without remounting WebRTC / live / cast / tag lights.
 * SEND TO MONITOR ≠ CAST (external destinations).
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  useCanonicalMediaPlayerRuntime,
  type FrameId,
  type MediaSource,
} from "@/lib/media/canonicalMediaPlayerRuntime";
import {
  ELIGIBLE_SOURCES,
  sourceLabel,
} from "@/components/monitors/MonitorBezelFeedPicker";
import { useViewportMode } from "@/hooks/useViewportMode";
import { useAdaptiveVoltronStore } from "@/lib/monitors/AdaptiveVoltronPresentationDirector";
import { ChannelMixerDirector } from "@/lib/audio/mixer/ChannelMixerDirector";
import {
  monitorMixController,
  programMixAllowed,
  type MixScope,
  type MixStrip,
} from "@/lib/audio/mixer/MonitorMixGraph";

const SCOPES: { id: MixScope; label: string }[] = [
  { id: "MY_MIX", label: "MY MIX" },
  { id: "MONITORS", label: "MONITORS" },
  { id: "ROOM", label: "ROOM" },
  { id: "PARTY", label: "PARTY" },
  { id: "SCREEN_SHARE", label: "SHARE" },
  { id: "VOICES", label: "VOICES" },
  { id: "PROGRAM", label: "PROGRAM" },
];

const MONITOR_TARGETS: { frameId: FrameId; label: string }[] = [
  { frameId: "a", label: "MONITOR 1" },
  { frameId: "b", label: "MONITOR 2" },
];

function FeedSendRow({
  sourceId,
  label,
}: {
  sourceId: Exclude<MediaSource, null>;
  label: string;
}) {
  const [sendOpen, setSendOpen] = useState(false);
  const assignSource = useCanonicalMediaPlayerRuntime((s) => s.assignSource);
  const frames = useCanonicalMediaPlayerRuntime((s) => s.frames);
  const targets = MONITOR_TARGETS.filter((t) => Boolean(frames[t.frameId]));
  const currentTargets = targets.filter((t) => frames[t.frameId]?.source === sourceId);

  return (
    <div
      data-power-mix-feed-row={sourceId}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        padding: "8px 8px",
        borderRadius: 6,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, flexWrap: "wrap", minWidth: 0 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.08em", color: "#fff" }}>
            {label}
          </div>
          <div style={{ fontSize: 8, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
            {currentTargets.length
              ? `Currently → ${currentTargets.map((t) => t.label).join(", ")}`
              : "Not assigned"}
          </div>
        </div>
        <button
          type="button"
          data-testid={`tmi-power-mix-send-to-${sourceId}`}
          aria-expanded={sendOpen}
          onClick={() => setSendOpen((v) => !v)}
          style={{
            fontSize: 8,
            fontWeight: 900,
            letterSpacing: "0.08em",
            padding: "5px 9px",
            borderRadius: 5,
            border: sendOpen ? "1px solid #FFD700" : "1px solid rgba(255,215,0,0.45)",
            background: sendOpen
              ? "linear-gradient(180deg, #FFD70055, #FFD70022)"
              : "linear-gradient(180deg, #3a4254, #1a1f2c)",
            color: "#FFD700",
            cursor: "pointer",
            fontFamily: "inherit",
            whiteSpace: "nowrap",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2)",
          }}
        >
          SEND TO ▾
        </button>
      </div>
      {sendOpen ? (
        <div
          data-send-to-monitor-panel={sourceId}
          style={{ display: "flex", flexWrap: "wrap", gap: 4 }}
        >
          {targets.map((t) => {
            const active = frames[t.frameId]?.source === sourceId;
            return (
              <button
                key={t.frameId}
                type="button"
                data-testid={`tmi-send-to-${sourceId}-${t.frameId}`}
                onClick={() => {
                  assignSource(t.frameId, sourceId);
                  setSendOpen(false);
                }}
                style={{
                  fontSize: 8,
                  fontWeight: 900,
                  letterSpacing: "0.06em",
                  padding: "5px 8px",
                  borderRadius: 4,
                  border: active ? "1px solid #00FFFF" : "1px solid rgba(255,255,255,0.15)",
                  background: active ? "rgba(0,255,255,0.2)" : "rgba(0,0,0,0.4)",
                  color: active ? "#00FFFF" : "rgba(255,255,255,0.8)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {active ? "● " : "○ "}
                {t.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function stripsForScope(strips: MixStrip[], scope: MixScope): MixStrip[] {
  if (scope === "MY_MIX" || scope === "PROGRAM") return strips;
  if (scope === "MONITORS") return strips.filter((s) => s.group === "MONITOR");
  if (scope === "ROOM") return strips.filter((s) => s.group === "ROOM");
  if (scope === "PARTY") return strips.filter((s) => s.group === "PARTY");
  if (scope === "SCREEN_SHARE") return strips.filter((s) => s.group === "SCREEN_SHARE");
  return strips.filter((s) => s.group === "VOICES" || s.group === "PARTY");
}

export default function CompactAudioMixer({
  showMonitorMasters = true,
}: {
  showMonitorMasters?: boolean;
} = {}) {
  const [open, setOpen] = useState(false);
  const [scope, setScope] = useState<MixScope>("MY_MIX");
  const [tick, setTick] = useState(0);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const { isPhone } = useViewportMode();
  const frames = useCanonicalMediaPlayerRuntime((s) => s.frames);
  const roomId = useCanonicalMediaPlayerRuntime((s) => s.roomId);
  const screenShareAudioSourceId = useCanonicalMediaPlayerRuntime((s) => s.screenShareAudioSourceId);
  const panels = useAdaptiveVoltronStore((s) => s.panels);
  const friends = useAdaptiveVoltronStore((s) => s.friends);
  const programAllowed = programMixAllowed(null);

  useEffect(() => {
    const bump = () => setTick((n) => n + 1);
    const unsubMix = monitorMixController.subscribe(bump);
    const unsubDirector = ChannelMixerDirector.subscribe(bump);
    return () => {
      unsubMix();
      unsubDirector();
    };
  }, []);

  const strips = useMemo(() => {
    return monitorMixController.discover({
      roomId,
      screenShareAudioSourceId,
      frames: (Object.values(frames) as Array<{ id: string; source: MediaSource; parked: boolean; label: string }>).map(
        (frame) => ({
          id: frame.id,
          source: frame.source,
          parked: frame.parked,
          label: frame.label,
        }),
      ),
      panels: panels.map((panel) => ({
        id: panel.id,
        monitorId: panel.monitorId,
        sourceType: panel.sourceType,
        sourceId: panel.sourceId,
        label: panel.label,
      })),
      friends: friends.map((friend) => ({ id: friend.id, displayName: friend.displayName })),
      directorChannels: ChannelMixerDirector.getChannels().map((ch) => ({
        channelId: ch.channelId,
        kind: ch.kind,
        displayName: ch.displayName,
        hasRealSource: ch.hasRealSource,
        sourceAvailable: ch.sourceAvailable,
        participantId: ch.participantId,
      })),
    });
  }, [roomId, screenShareAudioSourceId, frames, panels, friends, tick]);

  const visible = stripsForScope(strips, scope);
  const showMasters = showMonitorMasters && (scope === "MY_MIX" || scope === "MONITORS");
  const bus = scope === "PROGRAM" ? "PROGRAM" : "PERSONAL";

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
      data-power-mix="1"
      data-mixer-open={open ? "1" : "0"}
      style={{ position: "relative", display: "inline-flex", flexShrink: 0, maxWidth: "100%", minWidth: 0 }}
    >
      <button
        type="button"
        data-testid="tmi-mix-launcher"
        aria-expanded={open}
        aria-controls="tmi-power-mix-panel"
        title="Open Power Mix — audio buses + feed SEND TO monitors"
        onClick={() => setOpen((v) => !v)}
        style={{
          fontSize: 9,
          fontWeight: 900,
          letterSpacing: "0.1em",
          minHeight: 44,
          padding: "7px 12px",
          borderRadius: 6,
          border: open ? "1px solid #FFD700" : "1px solid rgba(255,215,0,0.45)",
          background: open
            ? "linear-gradient(180deg, #FFD70055 0%, #AA880022 100%)"
            : "linear-gradient(180deg, #4a5568 0%, #1c2230 55%, #12161f 100%)",
          color: "#FFD700",
          cursor: "pointer",
          fontFamily: "inherit",
          whiteSpace: "nowrap",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.5)",
          textTransform: "uppercase",
        }}
      >
        🎚️ {open ? "POWER MIX ▲" : "MIX"}
      </button>

      {open ? (
        <div
          id="tmi-power-mix-panel"
          role="dialog"
          aria-label="Power Mix"
          data-listener-bus-panel="1"
          data-power-mix-panel="1"
          data-mix-viewport={isPhone ? "phone" : "desktop"}
          data-mix-scope={scope}
          data-audible-count={strips.length}
          data-mix-owner={ChannelMixerDirector.getAudioOwnerBound() ? "bound" : "unbound"}
          style={{
            position: isPhone ? "fixed" : "absolute",
            top: isPhone ? "auto" : "calc(100% + 6px)",
            right: isPhone ? 8 : 0,
            left: isPhone ? 8 : "auto",
            bottom: isPhone ? 8 : "auto",
            zIndex: 80,
            width: isPhone ? "auto" : "min(360px, calc(100vw - 24px))",
            maxWidth: isPhone ? "calc(100vw - 16px)" : "min(360px, calc(100vw - 24px))",
            maxHeight: isPhone ? "calc(100dvh - 16px)" : "min(70vh, 520px)",
            boxSizing: "border-box",
            overflowX: "hidden",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            padding: "10px 12px",
            borderRadius: 10,
            background: "linear-gradient(180deg, #2a3140 0%, #0a0e16 100%)",
            border: "1px solid rgba(255,215,0,0.4)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.12)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.14em", color: "#FFD700" }}>
                🎚️ POWER MIX
              </div>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                {scope === "PROGRAM" ? "PROGRAM OUTPUT · AUTHORIZED ONLY" : "MY MIX · WHAT YOU HEAR"}
              </div>
            </div>
            <button
              type="button"
              data-testid="tmi-mix-close"
              onClick={() => setOpen(false)}
              aria-label="Close Power Mix"
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

          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }} data-testid="tmi-mix-scopes">
            {SCOPES.map((item) => (
              <button
                key={item.id}
                type="button"
                data-testid={`tmi-mix-scope-${item.id}`}
                onClick={() => setScope(item.id)}
                style={{
                  fontSize: 8,
                  fontWeight: 900,
                  letterSpacing: "0.06em",
                  padding: "4px 6px",
                  borderRadius: 4,
                  border: scope === item.id ? "1px solid #FFD700" : "1px solid rgba(255,255,255,0.15)",
                  background: scope === item.id ? "rgba(255,215,0,0.18)" : "transparent",
                  color: item.id === "PROGRAM" ? "#FF2DAA" : scope === item.id ? "#FFD700" : "rgba(255,255,255,0.7)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          {scope === "PROGRAM" && !programAllowed ? (
            <div data-testid="tmi-mix-program-locked" style={{ fontSize: 8, color: "#FF2DAA", letterSpacing: "0.04em" }}>
              PROGRAM MIX IS LOCKED. THESE FADERS STAY ON MY MIX UNTIL A HOST OR PRODUCER AUTHORITY IS PRESENT.
            </div>
          ) : null}

          {showMasters ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {(["MONITOR_1", "MONITOR_2"] as const).map((monitorId) => {
                const master = monitorMixController.monitorState(monitorId);
                const label = monitorId === "MONITOR_1" ? "M1 MASTER" : "M2 MASTER";
                return (
                  <div key={monitorId} data-testid={`tmi-mix-master-${monitorId}`} style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                    <button
                      type="button"
                      data-testid={`tmi-mix-master-mute-${monitorId}`}
                      onClick={() => monitorMixController.setMonitorMute(monitorId, !master.muted)}
                      style={{
                        fontSize: 8,
                        fontWeight: 900,
                        padding: "2px 6px",
                        borderRadius: 4,
                        border: master.muted ? "1px solid #FF4444" : "1px solid rgba(255,215,0,0.45)",
                        background: "transparent",
                        color: master.muted ? "#FF6B6B" : "#FFD700",
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      {master.muted ? "🔇" : "🔊"} {label}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={master.gain}
                      aria-label={`${label} volume`}
                      data-testid={`tmi-mix-master-gain-${monitorId}`}
                      onChange={(e) => monitorMixController.setMonitorGain(monitorId, Number(e.target.value))}
                      style={{ flex: 1, minWidth: 48, accentColor: "#FFD700" }}
                    />
                    <span style={{ fontSize: 8, color: "rgba(255,255,255,0.6)", minWidth: 28 }}>
                      {Math.round(master.gain * 100)}%
                    </span>
                  </div>
                );
              })}
            </div>
          ) : null}

          <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.12em", color: "rgba(255,255,255,0.45)" }}>
            {scope === "PROGRAM" ? "PROGRAM SOURCES" : "AUDIBLE SOURCES"}
          </div>
          {visible.length === 0 ? (
            <div data-testid="tmi-mix-empty" style={{ fontSize: 8, color: "rgba(255,255,255,0.55)" }}>
              NO ACTIVE AUDIO SOURCES
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {visible.map((strip) => {
                const gain = monitorMixController.sourceGain(strip);
                const muted = monitorMixController.sourceMuted(strip, bus === "PROGRAM" && programAllowed ? "PROGRAM" : "PERSONAL");
                const solo = monitorMixController.sourceSolo(strip);
                const locked = scope === "PROGRAM" && !programAllowed;
                return (
                  <div
                    key={strip.sourceId}
                    data-testid={`tmi-mix-source-${strip.sourceId}`}
                    data-mix-group={strip.group}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      flexWrap: "wrap",
                      minWidth: 0,
                      gap: 6,
                      padding: "6px 8px",
                      borderRadius: 6,
                      background: "rgba(255,255,255,0.03)",
                      border: `1px solid ${muted ? "rgba(255,68,68,0.4)" : "rgba(255,255,255,0.08)"}`,
                    }}
                  >
                    <button
                      type="button"
                      disabled={locked}
                      data-testid={`tmi-mix-mute-${strip.sourceId}`}
                      onClick={() =>
                        monitorMixController.setSourceMute(
                          strip,
                          !muted,
                          locked ? "PERSONAL" : bus,
                        )
                      }
                      style={{
                        background: muted ? "rgba(255,68,68,0.2)" : "transparent",
                        border: muted ? "1px solid #FF4444" : "1px solid rgba(255,255,255,0.2)",
                        color: muted ? "#FF6B6B" : "#00FFFF",
                        fontSize: 8,
                        fontWeight: 900,
                        padding: "2px 6px",
                        borderRadius: 4,
                        cursor: locked ? "not-allowed" : "pointer",
                        fontFamily: "inherit",
                        maxWidth: "100%",
                      }}
                    >
                      {muted ? "🔇 MUTE" : "🔊"} {strip.label}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      disabled={locked}
                      value={gain}
                      data-testid={`tmi-mix-gain-${strip.sourceId}`}
                      aria-label={`${strip.label} volume`}
                      onChange={(e) =>
                        monitorMixController.setSourceGain(
                          strip,
                          Number(e.target.value),
                          locked ? "PERSONAL" : bus,
                        )
                      }
                      style={{ flex: 1, minWidth: 48, height: 4, accentColor: "#00FFFF", cursor: "pointer" }}
                    />
                    <button
                      type="button"
                      data-testid={`tmi-mix-solo-${strip.sourceId}`}
                      disabled={locked}
                      onClick={() => monitorMixController.setSolo(strip, !solo)}
                      style={{
                        fontSize: 8,
                        fontWeight: 900,
                        padding: "2px 6px",
                        borderRadius: 4,
                        border: solo ? "1px solid #FFD700" : "1px solid rgba(255,255,255,0.2)",
                        background: "transparent",
                        color: solo ? "#FFD700" : "rgba(255,255,255,0.7)",
                        cursor: locked ? "not-allowed" : "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      SOLO
                    </button>
                    <span style={{ fontSize: 8, color: "rgba(255,255,255,0.6)", minWidth: 28, textAlign: "right" }}>
                      {muted ? "MUTED" : `${Math.round(gain * 100)}%`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <div
            style={{
              height: 1,
              background: "linear-gradient(90deg, transparent, rgba(255,215,0,0.35), transparent)",
            }}
          />

          <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.12em", color: "rgba(255,255,255,0.45)" }}>
            FEED SWITCHER · SEND TO MONITOR
          </div>
          <div
            data-power-mix-routing-map="1"
            style={{
              fontSize: 8,
              color: "rgba(0,255,255,0.7)",
              letterSpacing: "0.04em",
              marginBottom: 2,
            }}
          >
            M1={sourceLabel(frames.a?.source ?? null)} · M2={sourceLabel(frames.b?.source ?? null)}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {ELIGIBLE_SOURCES.map((src) => (
              <FeedSendRow key={src.id} sourceId={src.id} label={src.label} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
