"use client";

/**
 * InRoomMixerPanel — Venue HUD AUDIO panel.
 * Controls ChannelMixerDirector only. No second AudioContext / HTMLAudio.
 * Mobile: compact bottom sheet. Desktop: floating panel (non-covering stage).
 * Meters omitted unless real signal measurement exists (honest unavailable).
 * EQ/DSP knobs NOT shown (MIX-010).
 */

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  ChannelMixerDirector,
  MIXER_VIRTUAL_CHANNEL_IDS,
  type MixBus,
  type MixerChannelState,
  type MixerOperatorAuth,
  type MixerPresetId,
} from "@/lib/audio/mixer";
import { CanonicalPerformanceGlueDirector, type PerformanceGlueMode } from "@/lib/audio/mixer";
import type { ExperienceType } from "@/lib/venue-hud/TMIExperienceHudRuntime";

const CYAN = "#00FFFF";
const FUCHSIA = "#FF2DAA";
const GOLD = "#FFD700";
const GREEN = "#00FF88";
const RED = "#FF4466";

const PRESETS: Array<{ id: MixerPresetId; label: string }> = [
  { id: "BALANCED", label: "BALANCED" },
  { id: "VOCALS_FORWARD", label: "VOCALS" },
  { id: "MUSIC_FORWARD", label: "MUSIC" },
  { id: "CROWD_UP", label: "CROWD↑" },
  { id: "CROWD_LOW", label: "CROWD↓" },
  { id: "FOCUS", label: "FOCUS" },
  { id: "REHEARSAL", label: "REHEARSAL" },
  { id: "RESET", label: "RESET" },
];

export interface InRoomMixerPanelProps {
  roomId: string;
  liveSessionId?: string | null;
  experienceType?: ExperienceType;
  auth: MixerOperatorAuth;
  open: boolean;
  onClose: () => void;
  /** Focus a participant channel after rail shortcut */
  focusParticipantId?: string | null;
  compact?: boolean;
}

export default function InRoomMixerPanel({
  roomId,
  liveSessionId,
  experienceType = "LIVE",
  auth,
  open,
  onClose,
  focusParticipantId = null,
  compact = false,
}: InRoomMixerPanelProps) {
  const [tick, setTick] = useState(0);
  const [bus, setBus] = useState<MixBus>("PERSONAL");
  const [status, setStatus] = useState<string | null>(null);
  const [glueMode, setGlueMode] = useState<PerformanceGlueMode>("OFF");
  const [focusId, setFocusId] = useState<string | null>(focusParticipantId);

  const canProgram = auth.isRoomOwner || auth.role === "host" || auth.role === "admin" || auth.role === "operator";

  useEffect(() => {
    ChannelMixerDirector.bindSession({
      roomId,
      liveSessionId,
      experienceType,
    });
    return ChannelMixerDirector.subscribe(() => setTick((t) => t + 1));
  }, [roomId, liveSessionId, experienceType]);

  useEffect(() => {
    setFocusId(focusParticipantId);
  }, [focusParticipantId]);

  const channels = useMemo(() => {
    void tick;
    return ChannelMixerDirector.getChannels();
  }, [tick]);

  const autoBalance = ChannelMixerDirector.getAutoBalanceStatus();
  const health = ChannelMixerDirector.getSystemHealth();
  const fidelity = ChannelMixerDirector.getFidelityHealth();
  const policy = ChannelMixerDirector.getPolicy();

  const visibleChannels = useMemo(() => {
    return channels.filter((ch) => {
      if (ch.kind === "music" || ch.kind === "ambience" || ch.kind === "crowd" || ch.kind === "my_mic") {
        // Show always with honest unavailable when no source — Rule 20 four-states
        return true;
      }
      return true;
    });
  }, [channels]);

  const onGain = useCallback(
    (channelId: string, gain: number) => {
      const res = ChannelMixerDirector.setGain({ channelId, bus, gain, auth });
      setStatus(res.message);
    },
    [bus, auth],
  );

  const onMute = useCallback(
    (channelId: string, muted: boolean) => {
      const res = ChannelMixerDirector.setMute({ channelId, bus, muted, auth });
      setStatus(res.message);
    },
    [bus, auth],
  );

  const onSolo = useCallback((channelId: string, solo: boolean) => {
    const res = ChannelMixerDirector.setSolo({ channelId, solo });
    setStatus(res.message);
  }, []);

  const onPreset = useCallback(
    (preset: MixerPresetId) => {
      const res = ChannelMixerDirector.applyPreset(preset, bus, auth);
      setStatus(res.message);
    },
    [bus, auth],
  );

  const onAutoBalance = useCallback(() => {
    const res = ChannelMixerDirector.runAutoBalance(auth);
    setStatus(res.message);
  }, [auth]);

  const onGlueMode = useCallback((mode: PerformanceGlueMode) => {
    CanonicalPerformanceGlueDirector.setMode(mode);
    setGlueMode(mode);
    setStatus(
      mode === "OFF"
        ? "Performance Glue OFF"
        : `Glue ${mode} — scaffold (IMPLEMENTED_NOT_INTEGRATED)`,
    );
  }, []);

  if (!open) return null;

  const panelStyle: CSSProperties = compact
    ? {
        position: "absolute",
        left: "2%",
        right: "2%",
        bottom: "12%",
        maxHeight: "48%",
        zIndex: 140,
        pointerEvents: "auto",
      }
    : {
        position: "absolute",
        right: "5%",
        bottom: "14%",
        width: 340,
        maxWidth: "92%",
        maxHeight: "58%",
        zIndex: 140,
        pointerEvents: "auto",
      };

  return (
    <div
      style={{
        ...panelStyle,
        display: "flex",
        flexDirection: "column",
        borderRadius: 16,
        border: `1px solid ${CYAN}44`,
        background: "rgba(8,10,20,0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.55)",
        overflow: "hidden",
        fontFamily: "var(--font-sans, system-ui, sans-serif)",
      }}
      data-testid="in-room-mixer-panel"
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 12px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div>
          <div style={{ fontSize: 10, fontWeight: 900, color: CYAN, letterSpacing: "0.14em" }}>
            IN-ROOM MIXER
          </div>
          <div style={{ fontSize: 8, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
            {policy.profileId} · {ChannelMixerDirector.getAudioOwnerBound() ? "AudioOwner bound" : "DEFAULT_ONLY graph"}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button
            type="button"
            onClick={() => setBus("PERSONAL")}
            style={busChip(bus === "PERSONAL", CYAN)}
            title="Listener-only mix"
          >
            PERSONAL
          </button>
          <button
            type="button"
            onClick={() => {
              if (!canProgram) {
                setStatus("PROGRAM auth denied — host/operator only");
                return;
              }
              setBus("PROGRAM");
            }}
            style={busChip(bus === "PROGRAM", canProgram ? GOLD : "rgba(255,255,255,0.25)")}
            title={canProgram ? "Host/operator program mix" : "Host/operator only"}
          >
            PROGRAM
          </button>
          <button type="button" onClick={onClose} style={iconBtn(RED)} title="Close mixer">
            ✕
          </button>
        </div>
      </div>

      {/* Presets */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 4,
          padding: "8px 10px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {PRESETS.map((p) => (
          <button key={p.id} type="button" onClick={() => onPreset(p.id)} style={presetChip()}>
            {p.label}
          </button>
        ))}
        <button
          type="button"
          onClick={onAutoBalance}
          style={{
            ...presetChip(),
            borderColor: autoBalance.measurementAvailable ? `${GREEN}66` : "rgba(255,255,255,0.15)",
            color: autoBalance.measurementAvailable ? GREEN : "rgba(255,255,255,0.4)",
          }}
          title={autoBalance.detail}
        >
          AUTO BALANCE · {autoBalance.mode}
        </button>
      </div>

      {/* Channels */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 10px", display: "flex", flexDirection: "column", gap: 8 }}>
        {visibleChannels.map((ch) => (
          <ChannelRow
            key={ch.channelId}
            channel={ch}
            bus={bus}
            highlighted={
              Boolean(focusId) &&
              (ch.participantId === focusId || ch.channelId === `participant:${focusId}`)
            }
            onGain={(g) => onGain(ch.channelId, g)}
            onMute={(m) => onMute(ch.channelId, m)}
            onSolo={(s) => onSolo(ch.channelId, s)}
          />
        ))}
      </div>

      {/* Performance Glue scaffold */}
      <div
        style={{
          padding: "8px 10px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <div style={{ fontSize: 8, fontWeight: 900, color: FUCHSIA, letterSpacing: "0.1em" }}>
          PERFORMANCE GLUE · SCAFFOLD
        </div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {(["OFF", "LIGHT", "BALANCED", "TIGHT"] as PerformanceGlueMode[]).map((m) => (
            <button key={m} type="button" onClick={() => onGlueMode(m)} style={busChip(glueMode === m, FUCHSIA)}>
              {m}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)" }}>
          DSP (spectral / song scenes): IMPLEMENTED_NOT_INTEGRATED · Fidelity: {fidelity.powerState} · no fake Hi-Fi
        </div>
        <div style={{ fontSize: 7, color: "rgba(255,255,255,0.3)", display: "flex", flexWrap: "wrap", gap: 6 }}>
          {health.map((h) => (
            <span key={h.systemId}>
              {h.systemId}:{h.powerState}
            </span>
          ))}
        </div>
      </div>

      {status ? (
        <div
          style={{
            padding: "6px 10px",
            fontSize: 9,
            fontWeight: 700,
            color: CYAN,
            borderTop: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(0,0,0,0.35)",
          }}
        >
          {status}
        </div>
      ) : null}
    </div>
  );
}

function ChannelRow({
  channel,
  bus,
  highlighted,
  onGain,
  onMute,
  onSolo,
}: {
  channel: MixerChannelState;
  bus: MixBus;
  highlighted: boolean;
  onGain: (g: number) => void;
  onMute: (m: boolean) => void;
  onSolo: (s: boolean) => void;
}) {
  const gain = bus === "PERSONAL" ? channel.personalGain : channel.programGain;
  const muted = bus === "PERSONAL" ? channel.personalMuted : channel.programMuted;
  const unavailable = !channel.sourceAvailable && channel.kind !== "master" && channel.kind !== "participant";

  return (
    <div
      style={{
        padding: 8,
        borderRadius: 10,
        border: `1px solid ${highlighted ? GOLD : "rgba(255,255,255,0.1)"}`,
        background: highlighted ? `${GOLD}12` : "rgba(255,255,255,0.03)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, color: "#fff" }}>
            {channel.displayName}
            {channel.role ? (
              <span style={{ marginLeft: 6, fontSize: 8, color: CYAN, fontWeight: 700 }}>{channel.role}</span>
            ) : null}
          </div>
          {unavailable ? (
            <div style={{ fontSize: 7, color: "rgba(255,255,255,0.35)" }}>source unavailable</div>
          ) : null}
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <button type="button" onClick={() => onMute(!muted)} style={miniBtn(muted ? RED : CYAN)}>
            {muted ? "UNMUTE" : "MUTE"}
          </button>
          {bus === "PERSONAL" && channel.kind !== "master" ? (
            <button
              type="button"
              onClick={() => onSolo(!channel.personalSolo)}
              style={miniBtn(channel.personalSolo ? GOLD : "rgba(255,255,255,0.5)")}
            >
              SOLO
            </button>
          ) : null}
        </div>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={Math.round(gain * 100)}
        disabled={unavailable && channel.kind !== "crowd"}
        onChange={(e) => onGain(Number(e.target.value) / 100)}
        style={{ width: "100%", accentColor: CYAN }}
        aria-label={`${channel.displayName} gain`}
      />
      {/* No decorative meters — measurement only when AudioOwner provides RMS elsewhere */}
    </div>
  );
}

function busChip(active: boolean, color: string): CSSProperties {
  return {
    padding: "3px 8px",
    borderRadius: 8,
    border: `1px solid ${active ? color : `${color}44`}`,
    background: active ? `${color}22` : "transparent",
    color: active ? color : "rgba(255,255,255,0.55)",
    fontSize: 8,
    fontWeight: 900,
    letterSpacing: "0.06em",
    cursor: "pointer",
  };
}

function presetChip(): CSSProperties {
  return {
    padding: "3px 7px",
    borderRadius: 6,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.04)",
    color: "rgba(255,255,255,0.75)",
    fontSize: 8,
    fontWeight: 800,
    cursor: "pointer",
  };
}

function iconBtn(color: string): CSSProperties {
  return {
    width: 26,
    height: 26,
    borderRadius: 8,
    border: `1px solid ${color}66`,
    background: `${color}18`,
    color,
    fontSize: 12,
    cursor: "pointer",
  };
}

function miniBtn(color: string): CSSProperties {
  return {
    padding: "2px 6px",
    borderRadius: 6,
    border: `1px solid ${color}55`,
    background: `${color}15`,
    color,
    fontSize: 7,
    fontWeight: 800,
    cursor: "pointer",
  };
}

export { MIXER_VIRTUAL_CHANNEL_IDS };
